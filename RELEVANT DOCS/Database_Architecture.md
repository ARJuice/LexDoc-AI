# Database Architecture

LexDoc AI uses a PostgreSQL database managed by Supabase. This document covers the schema design rationale, the security model (Row-Level Security), and the server-side automation built with PostgreSQL triggers and `pg_cron`.

---

## Normalization

The schema follows **Third Normal Form (3NF)** throughout.

**1NF** — Every table has a primary key; no multi-valued columns. Tags and department associations are stored in dedicated junction tables (`document_tags`, `document_departments`), not as comma-separated strings.

**2NF** — Many-to-many relationships use composite-primary-key junction tables. Document metadata belongs exclusively to `documents.id` with no partial dependencies.

**3NF** — The `users` table stores `dept_id` and `role_id` as foreign keys, never denormalized department or role names. Renaming a department requires a single row update in `departments` with no cascading edits elsewhere.

---

## Triggers

### Automatic `updated_at` timestamps

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_users_modtime ON users;
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_documents_modtime ON documents;
CREATE TRIGGER update_documents_modtime
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
```

### Audit logging

An `AFTER INSERT OR DELETE` trigger on `documents` writes to `audit_logs` using `SECURITY DEFINER`. It reads the authenticated user's UUID from Supabase's `auth.uid()` context — this fires inside PostgreSQL, so it cannot be bypassed by the client.

```sql
CREATE OR REPLACE FUNCTION audit_document_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_uid uuid;
    internal_user_id INTEGER;
    action_type TEXT;
    doc_title TEXT;
BEGIN
    current_uid := auth.uid();

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
FOR EACH ROW EXECUTE FUNCTION audit_document_changes();
```

### Notification fan-out

A trigger on `document_tags` fires `AFTER INSERT` and pushes notification rows to `notifications` only for users who have access to the document, based on `access_level` and `document_departments`.

---

## Row-Level Security

RLS is enabled on every table. Policies evaluate at query time using the JWT claims from the authenticated session — `auth.uid()` and the user's decoded role/department.

**Key patterns:**

- **Data isolation** — `SELECT` on `documents` is filtered by the user's department membership in `document_departments`, or by `is_general = TRUE`, or by `uploader_id = auth.uid()`. No cross-department leakage.
- **RBAC** — Admin-only operations check that the executing user's `role_id` maps to `access_level >= 10`.
- **Audit immutability** — `audit_logs` has no `UPDATE` or `DELETE` policy. Rows are write-once via the trigger's `SECURITY DEFINER` function.

---

## Automated Jobs (`pg_cron`)

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Sweep expired documents every hour
SELECT cron.unschedule('delete-expired-documents');
SELECT cron.schedule(
  'delete-expired-documents',
  '0 * * * *',
  $$ DELETE FROM documents WHERE expiry_date < NOW(); $$
);

-- Purge old notifications after 7 days
SELECT cron.unschedule('delete-old-notifications');
SELECT cron.schedule(
  'delete-old-notifications',
  '0 0 * * *',
  $$ DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '7 days'; $$
);
```

> **Note:** `pg_cron` deletes the `documents` row but does not remove the file from Supabase Storage. Configure a Storage webhook or a separate Edge Function if physical file deletion is required.

Default document expiry if not specified by the uploader: **150 days** (set in the upload Edge Function).

---

## Edge Function: `generate-summary`

Deployed to Supabase as a Deno runtime function. Invoked explicitly by the frontend via `supabase.functions.invoke()`.

**Model fallback chain:**

1. `arcee-ai/trinity-large-preview:free`
2. `google/gemini-2.0-flash:free`
3. `meta-llama/llama-3.3-70b:free`
4. `deepseek/deepseek-chat:free`

Models are tried sequentially. Each call has a 45-second `AbortController` timeout. The chain stops at the first valid response (non-empty, >20 chars).

**Extraction strategy:**

- Standard PDFs → LlamaParse API (cloud OCR + markdown extraction)
- PDFs that return <50 chars from LlamaParse → OCR.space API
- DOCX files → `parse-docx` Edge Function (`mammoth` DOCX→HTML, `cheerio` for structure)

**Data flow:**

1. Frontend calls `generate-summary` with `{ doc_id, force_regenerate? }`
2. Check `ai_cache` — return immediately on cache hit (unless `force_regenerate`)
3. Download file from Supabase Storage
4. Extract text via LlamaParse → OCR.space → `parse-docx` as appropriate
5. Run model chain until a valid summary is produced
6. `UPSERT` into `ai_cache`, `INSERT` into `summaries`, `UPDATE documents.processing_status = 'summarized'`
7. On total failure: `UPDATE documents.processing_status = 'failed'`

---

## `ai_cache` Table

Prevents redundant API calls for the same document:

```
ai_cache → id, doc_id (UNIQUE FK), summary_text, model_used, created_at, updated_at
```

RLS: authenticated users can `SELECT`; `service_role` has full access (used by the Edge Function).
