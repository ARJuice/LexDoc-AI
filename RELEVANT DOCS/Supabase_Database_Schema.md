# Database Schema Reference

Full DDL for the LexDoc AI PostgreSQL database. Run in the Supabase SQL editor in the order listed below.

---

## Tables

### `departments`

Organizational units. Every user belongs to exactly one department.

```sql
CREATE TABLE departments (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE   -- CS, EC, BT, EEE, BME, CE
);
```

### `roles`

Defines the RBAC hierarchy used in RLS policies.

| `name` | `access_level` |
|---|---|
| Admin | 10 |
| HOD | 7 |
| Teacher | 5 |
| Student | 1 |

```sql
CREATE TABLE roles (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  access_level INTEGER
);
```

### `users`

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE,
  email         TEXT UNIQUE,
  password_hash TEXT,
  google_id     TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  role_id       INTEGER REFERENCES roles(id),
  dept_id       INTEGER REFERENCES departments(id),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Auth flow:** First login goes through Google OAuth; email domain is validated against `@sahrdaya.ac.in`. On first login the user completes account setup (username + password). `google_id` prevents duplicate OAuth accounts on subsequent logins.

### `documents`

```sql
CREATE TABLE documents (
  id                SERIAL PRIMARY KEY,
  title             TEXT,
  storage_bucket    TEXT,
  storage_path      TEXT,
  file_size         INTEGER,
  mime_type         TEXT,
  checksum          TEXT,
  processing_status TEXT CHECK (processing_status IN ('uploaded', 'processing', 'summarized', 'failed')),
  is_general        BOOLEAN DEFAULT FALSE,
  access_level      TEXT CHECK (access_level IN ('PUBLIC', 'STUDENT', 'STAFF', 'CONFIDENTIAL', 'PRIVATE')),
  expiry_date       TIMESTAMP,   -- NULL = permanent; default = 150 days from upload
  uploader_id       INTEGER REFERENCES users(id),
  uploaded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `tags`

Unified tagging system with three tag types:

- `PRIORITY` — High / Medium / Low with numeric weight for sort order
- `LABEL` — Seeded named labels (Urgent, General, …)
- `CUSTOM` — User-created, stored lowercase for deduplication

```sql
CREATE TABLE tags (
  id     SERIAL PRIMARY KEY,
  name   TEXT NOT NULL,
  type   TEXT CHECK (type IN ('PRIORITY', 'LABEL', 'CUSTOM')),
  weight INTEGER,
  color  TEXT
);

-- Prevents duplicate custom tags regardless of case
CREATE UNIQUE INDEX idx_tags_name_lower ON tags (lower(name));
```

### Junction tables

```sql
CREATE TABLE document_departments (
  doc_id  INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  dept_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (doc_id, dept_id)
);

CREATE TABLE document_tags (
  doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (doc_id, tag_id)
);
```

### `summaries`

Stores every generated summary independently from `documents`. Allows re-summarization with a different model.

```sql
CREATE TABLE summaries (
  id         SERIAL PRIMARY KEY,
  doc_id     INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `ai_cache`

Caches the most recent summary per document. Checked before every OpenRouter API call.

```sql
CREATE TABLE ai_cache (
  id           SERIAL PRIMARY KEY,
  doc_id       INTEGER UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  summary_text TEXT,
  model_used   TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `events`

AI-extracted deadlines, meetings, and date ranges from document content.

```sql
CREATE TABLE events (
  id           SERIAL PRIMARY KEY,
  doc_id       INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  event_type   TEXT CHECK (event_type IN ('DEADLINE', 'MEETING', 'EXAM', 'EVENT', 'RANGE')),
  event_date   DATE,
  event_time   TIME,
  description  TEXT,
  created_by_ai BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  start_date   DATE,   -- for RANGE events
  end_date     DATE
);
```

### `notifications`

```sql
CREATE TABLE notifications (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id  INTEGER REFERENCES events(id) ON DELETE CASCADE,
  notify_at TIMESTAMP NOT NULL,
  is_sent   BOOLEAN DEFAULT FALSE
);
```

### `audit_logs`

Write-once. No `UPDATE` or `DELETE` RLS policy. Populated exclusively by the `audit_document_changes` trigger.

```sql
CREATE TABLE audit_logs (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER REFERENCES users(id),
  doc_id    INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  action    TEXT NOT NULL,
  details   TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Indexes

```sql
-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at       ON documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploader_id       ON documents(uploader_id);
CREATE INDEX IF NOT EXISTS idx_documents_access_level      ON documents(access_level);
CREATE INDEX IF NOT EXISTS idx_documents_is_general        ON documents(is_general);

-- Tags & junctions
CREATE INDEX IF NOT EXISTS idx_document_tags_doc_id        ON document_tags(doc_id);
CREATE INDEX IF NOT EXISTS idx_document_tags_tag_id        ON document_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_document_departments_doc_id ON document_departments(doc_id);

-- Supporting tables
CREATE INDEX IF NOT EXISTS idx_summaries_doc_id            ON summaries(doc_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id          ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_doc_id           ON audit_logs(doc_id);
CREATE INDEX IF NOT EXISTS idx_events_doc_id               ON events(doc_id);
CREATE INDEX IF NOT EXISTS idx_events_event_date           ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id               ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_dept_id               ON users(dept_id);
```

---

## Access Control Logic

RLS policies implement the following visibility rules for `documents`:

1. **Admin** (`access_level = 10`) — full access to all documents.
2. **Uploader** — always has access to their own documents (`uploader_id = auth.uid()`).
3. **Global** — if `is_general = TRUE`, visible to all authenticated users.
4. **Departmental** — otherwise, access is granted only if the user's department exists in `document_departments`.

---

## Useful Queries

**Documents visible to a user:**

```sql
SELECT *
FROM documents d
WHERE
  d.is_general = TRUE OR
  d.uploader_id = :user_id OR
  EXISTS (
    SELECT 1 FROM document_departments dd
    WHERE dd.doc_id = d.id AND dd.dept_id = :user_dept
  );
```

**Latest summary for a document:**

```sql
SELECT content, model_used FROM summaries
WHERE doc_id = :doc_id
ORDER BY created_at DESC
LIMIT 1;
```
