# LexDoc AI – Database Architecture & DBMS Properties

## 1. Overview
LexDoc AI relies on a **PostgreSQL** database managed by Supabase. This document details the database's strict compliance with relational database normalization principles, its security model (Row-Level Security), and the advanced DBMS features utilized (Triggers, Stored Procedures, and Automated Jobs) to guarantee data integrity seamlessly at the database layer.

## 2. Normalization & Relational Schema
The database has been designed and strictly adhered to **Third Normal Form (3NF)** to eliminate redundancy and prevent update anomalies.

### First Normal Form (1NF)
**Rule:** All attributes must hold atomic values, and each row must be unique.
- **Application:** Every table holds a primary key (`id`). Fields like `tags` or `departments` are not stored as comma-separated lists inside a single column. Instead, they are broken down into their individual components and structured relationally.

### Second Normal Form (2NF)
**Rule:** Must be in 1NF, and all non-key attributes must be fully functionally dependent on the primary key (no partial dependencies).
- **Application:** The many-to-many relationships (e.g., Documents filtering by Departments, Documents having multiple Tags) use Junction Tables (`document_tags`, `document_departments`) with composite primary keys (`doc_id`, `tag_id`). Any attribute related to a document belongs *only* to the `documents` table, and perfectly depends on `documents.id`.

### Third Normal Form (3NF)
**Rule:** Must be in 2NF, and there should be no transitive dependencies (non-key attributes cannot depend on other non-key attributes).
- **Application:** In the `users` table, we store the `dept_id` and `role_id` as foreign keys. We *do not* store `dept_name` or `role_name` directly in the `users` table. If a department's name changes, we only update the `departments` table without needing to touch a single row in the `users` table. The `users` table also distinctly captures conditionally required fields (`sr_no`, `class`, `semester`) natively without messy JSON blobs.

## 3. Database Triggers & Automated Auditing
To ensure that critical security metadata is captured reliably—regardless of whether the frontend API is bypassed—we employ **PostgreSQL Triggers** and **Stored Procedures**. 

### 3.1. Automatic Timestamps (`updated_at`)
Two triggers ensure that any `UPDATE` operation to users or documents automatically adjusts the timestamp.
- **Trigger**: `update_users_modtime` and `update_documents_modtime`
- **Function**: Automatically invokes `now()` on modification.

### 3.2. Database-Level Audit Logging (`audit_document_changes`)
Instead of relying on the client/frontend to manually log when a document is uploaded or deleted, an `AFTER INSERT OR DELETE` trigger executes directly on the `documents` table. 
- It securely inspects the Supabase JWT `auth.uid()` connection context to trace exactly which Auth user initiated the action.
- It automatically maps the Auth UUID to the internal `users.id` and executes an `INSERT INTO audit_logs`, creating an immutable, un-bypassable audit trail.

## 4. Automated Document Expiry
Documents can optionally expire. If left unspecified by the user, the application explicitly assigns a **5-month (150 days) expiration date**. 
- To prevent database bloat, a PostgreSQL automated job (via the `pg_cron` extension) sweeps the `documents` table every hour to clean up entries where `expiry_date < NOW()`.

## 5. Security Context (Row-Level Security)
Supabase provides PostgreSQL Row-Level Security (RLS). Every query made by the frontend operates strictly within the context of the logged-in user.
- **Data Isolation**: Students cannot query other departments' documents. The database forcibly filters `SELECT` responses based on the executing user's `current_setting('request.jwt.claims')`.
- **RBAC Enforcement**: The database policies independently inspect the user's role hierarchy (checking if the user's `role_id` maps to an `access_level >= 10` for admin operations).

## 6. Access-Aware Notification System
Combining Triggers and RLS, the database handles broadcasting events contextually.
- **Trigger**: `notify_on_urgent_document` executes immediately `AFTER INSERT ON document_tags`.
- **Logic**: It inspects the `documents` accessibility (`access_level`, `dept_ids`) and pushes isolated rows to the `notifications` table *only* for the `users` mapped properly within the RBAC context. 
- **Auto-Cleanup**: A `pg_cron` routine schedules `delete-old-notifications` periodically to expire old rows past `7 days`.

---

## 7. Required SQL Setup (Execute in Supabase SQL Editor)

To implement the sophisticated triggers and automated jobs described in this architecture, execute the following SQL in your Supabase Dashboard's SQL Editor:

```sql
-- ==========================================
-- 1. Automating Timestamps
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_documents_modtime ON documents;
CREATE TRIGGER update_documents_modtime
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 2. Database-Level Audit Logging
-- ==========================================
CREATE OR REPLACE FUNCTION audit_document_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_uid uuid;
    internal_user_id INTEGER;
    action_type TEXT;
    doc_title TEXT;
BEGIN
    -- Read the UUID from Supabase's context securely
    current_uid := auth.uid();

    -- Find our internal integer ID matching the google_id
    IF current_uid IS NOT NULL THEN
        SELECT id INTO internal_user_id FROM users WHERE google_id = current_uid::text;
    END IF;

    IF TG_OP = 'INSERT' THEN
        action_type := 'UPLOAD';
        doc_title := NEW.title;
        INSERT INTO audit_logs (user_id, doc_id, action, details)
        VALUES (internal_user_id, NEW.id, action_type, 'Uploaded ' || doc_title || ' [' || NEW.access_level || ']');
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        doc_title := OLD.title;
        INSERT INTO audit_logs (user_id, doc_id, action, details)
        VALUES (internal_user_id, null, action_type, 'Document ' || OLD.id || ' deleted');
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_document_changes ON documents;
CREATE TRIGGER trigger_audit_document_changes
AFTER INSERT OR DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION audit_document_changes();

-- ==========================================
-- 3. Automatic Document Expiry (pg_cron)
-- ==========================================
-- Enable pg_cron if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing schedule if trying to replace it
SELECT cron.unschedule('delete-expired-documents');

-- Schedule a sweep every hour (Minute 0)
SELECT cron.schedule(
  'delete-expired-documents',
  '0 * * * *',
  $$ DELETE FROM documents WHERE expiry_date < NOW(); $$
);

-- Note: Deleting the Postgres row using pg_cron will not automatically 
-- delete the actual file in Supabase Storage. You should configure a 
-- Storage webhook or Edge Function if physical deletion is strictly required.
```

## 8. AI Summarization Pipeline

LexDoc AI generates document summaries using an OpenRouter-powered Edge Function with a prioritized free-model fallback chain.

### 8.1. `ai_cache` Table
A dedicated caching table ensures that repeated summary requests for the same document don't hit external APIs:
- **Schema**: `id` (PK), `doc_id` (UNIQUE FK→documents), `summary_text`, `model_used`, `created_at`, `updated_at`
- **RLS**: Authenticated users can SELECT; service_role has full access.
- Cache is checked before every AI request. If a cached entry exists and `force_regenerate` is not set, the cached summary is returned instantly.

### 8.2. Edge Function: `generate-summary`
Deployed as a Supabase Edge Function (Deno runtime), invoked via `supabase.functions.invoke()`.

**Model Priority Chain:**
1. `arcee-ai/trinity-large-preview:free` (Default primary model for high-quality summarization)
2. `google/gemini-2.0-flash:free` (fast fallback)
3. `meta-llama/llama-3.3-70b:free`
4. `deepseek/deepseek-chat:free`

**Document Extraction Strategy:**
- Text extraction for standard generic documents is directly delegated to the cloud-based **LlamaParse API**.
- If a PDF resists LlamaParse extraction (returns insufficient text < 50 chars), it automatically falls back to **OCR.space API**.
- For deeply structured Word documents, a dedicated `parse-docx` Edge Function utilizing `mammoth` and `cheerio` efficiently converts binary DOCX buffers into highly structured HTML and arrays of sections to maintain heading hierarchies natively without AI prompting overhead.

**Optimization Strategy:**
- **Sequential Fallback Loop**: To ensure maximum reliability and cost-efficiency without rate-limiting, models are queried sequentially. If the default Arcee model fails or times out, the system automatically catches the error and instantaneously queries the next available model in the array (Gemini 2.0).
- **Timeout Control**: Each model request has an enforced `MODEL_TIMEOUT_MS` cutoff (45 seconds) via `AbortController` to prevent hanging edge functions and minimize compute billing.
- **Response Validation**: AI output must be non-empty and >20 characters.

**Data Flow:**
1. Frontend invokes edge function with `{ doc_id, force_regenerate }`
2. Edge function checks `ai_cache` → returns immediately if cached
3. Downloads document from Supabase Storage, extracts text
4. Runs through model chain until a valid response is received
5. On success: `UPSERT` into `ai_cache`, `INSERT` into `summaries`, `UPDATE documents.processing_status = 'summarized'`
6. On failure: `UPDATE documents.processing_status = 'failed'`

### 8.3. `summaries` Table Integration
The existing `summaries` table (`id`, `doc_id`, `content`, `model_used`, `created_at`) stores every generated summary. The `model_used` column tracks which AI model produced the result for audit purposes.
