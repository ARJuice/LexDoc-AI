# LexDoc AI – Optimized Database Schema & Architecture (College System)

## 1. Architecture Overview
- **Frontend:** React + GSAP animations
- **Backend:** FastAPI
- **Database:** PostgreSQL (managed by Supabase)
- **AI Service:** Local LLM via Ollama

## 2. Authentication Logic
The system uses a hybrid authentication model:
1. First login requires Google authentication.
2. Email domain must match company domain (example: `@sahrdaya.ac.in`).
3. After verification user sets username + password.
4. Future logins use username/password only. (The `google_id` prevents duplicate accounts during OAuth verification.)

## 3. Relational Database Schema
The database follows a relational model mapping exactly to the requirements.

### Core Tables

#### 1. departments
Defines the organizational structure. Every user belongs to exactly one department.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Department ID |
| `name` | TEXT | Department name |
| `code` | TEXT | Short identifier (CS, EC, BT, EEE, BME, CE) |

#### 2. roles
Defines role hierarchy and permission levels. Enabled for fast permission comparison inside backend logic.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Role ID |
| `name` | TEXT | Admin / HOD / Teacher / Student |
| `access_level` | INTEGER | Numeric hierarchy: Admin=10, HOD=7, Teacher=5, Student=1 |

#### 3. users
Application users.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | User ID |
| `username` | TEXT UNIQUE | Username |
| `email` | TEXT UNIQUE | Email |
| `password_hash` | TEXT | Encrypted Password |
| `google_id` | TEXT | Google OAuth ID |
| `is_verified` | BOOLEAN | Verification status |
| `role_id` | FK | references `roles.id` |
| `dept_id` | FK | references `departments.id` |
| `created_at` | TIMESTAMP | Creation time |

#### 4. tags
Unified tagging system. Priority tags use weight for sorting: High = 100, Medium = 50, Low = 10.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Tag ID |
| `name` | TEXT | Tag name |
| `type` | TEXT | `PRIORITY` or `LABEL` |
| `weight` | INTEGER | Tag weight |
| `color` | TEXT | UI Color |

#### 5. documents
Stores document metadata, sensitivity level, and expiry.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Document ID |
| `title` | TEXT | Document Title |
| `storage_bucket`| TEXT | Bucket |
| `storage_path` | TEXT | Path in bucket |
| `file_size` | INTEGER | Size in bytes |
| `mime_type` | TEXT | File type |
| `checksum` | TEXT | Hash |
| `processing_status`| TEXT | `uploaded`, `processing`, `summarized`, `failed` |
| `is_general` | BOOLEAN | Global visibility |
| `access_level` | TEXT | `PUBLIC`, `STUDENT`, `STAFF`, `CONFIDENTIAL`, `PRIVATE` |
| `expiry_date` | TIMESTAMP | Auto-delete date (NULL = permanent) |
| `uploader_id` | FK | references `users.id` |
| `uploaded_at` | TIMESTAMP | Upload time |

#### 6. document_departments
Controls document visibility between departments. (Composite PK: `doc_id`, `dept_id`)
| Column | Type |
| --- | --- |
| `doc_id` | FK |
| `dept_id` | FK |

#### 7. document_tags
Associates documents with labels and priorities. (Composite PK: `doc_id`, `tag_id`)
| Column | Type |
| --- | --- |
| `doc_id` | FK |
| `tag_id` | FK |

#### 8. summaries
Stores AI generated summaries separately from documents. Allows re-summarization with different models.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Summary ID |
| `doc_id` | FK | references `documents.id` |
| `content` | TEXT | Summary content |
| `model_used` | TEXT | AI Model |
| `created_at` | TIMESTAMP | Creation time |

#### 9. audit_logs
Tracks security and system events. Examples: `VIEW_DOCUMENT`, `DELETE_DOCUMENT`, `GENERATE_SUMMARY`, `LOGIN_SUCCESS`.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Log ID |
| `user_id` | FK | references `users.id` |
| `doc_id` | FK | references `documents.id` |
| `action` | TEXT | Action type |
| `details` | TEXT | Event Details |
| `timestamp` | TIMESTAMP | Event timestamp |

#### 10. events
AI-extracted meetings and deadlines from documents.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Event ID |
| `doc_id` | FK | references `documents.id` |
| `title` | TEXT | Event title |
| `event_type` | TEXT | `DEADLINE` or `MEETING` |
| `event_date` | DATE | Date of event |
| `event_time` | TIME | Time of event |
| `description` | TEXT | Event description |
| `created_by_ai` | BOOLEAN | Whether AI-extracted |
| `created_at` | TIMESTAMP | Creation time |

#### 11. notifications
Reminder system for upcoming events.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Notification ID |
| `user_id` | FK | references `users.id` |
| `event_id` | FK | references `events.id` |
| `notify_at` | TIMESTAMP | When to notify |
| `is_sent` | BOOLEAN | Delivery status |

---

## 4. Access Control Logic

1. **Admin**: Full system access.
2. **Uploader**: Always has access to their documents.
3. **Global**: If `documents.is_general = TRUE` Then Accessible to all users.
4. **Departmental**: Otherwise, access granted only if user's department exists in `document_departments`.

---

## 5. SQL Table Creation (DDL)

```sql
CREATE TABLE departments (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 code TEXT UNIQUE
);

CREATE TABLE roles (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 access_level INTEGER
);

CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 username TEXT UNIQUE,
 email TEXT UNIQUE,
 password_hash TEXT,
 google_id TEXT,
 is_verified BOOLEAN DEFAULT FALSE,
 role_id INTEGER REFERENCES roles(id),
 dept_id INTEGER REFERENCES departments(id),
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
 id SERIAL PRIMARY KEY,
 title TEXT,
 storage_bucket TEXT,
 storage_path TEXT,
 file_size INTEGER,
 mime_type TEXT,
 checksum TEXT,
 processing_status TEXT CHECK (processing_status IN ('uploaded', 'processing', 'summarized', 'failed')),
 is_general BOOLEAN DEFAULT FALSE,
 uploader_id INTEGER REFERENCES users(id),
 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE document_departments (
 doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
 dept_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
 PRIMARY KEY (doc_id, dept_id)
);

CREATE TABLE tags (
 id SERIAL PRIMARY KEY,
 name TEXT NOT NULL,
 type TEXT CHECK (type IN ('PRIORITY', 'LABEL')),
 weight INTEGER,
 color TEXT
);

CREATE TABLE document_tags (
 doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
 tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
 PRIMARY KEY (doc_id, tag_id)
);

CREATE TABLE summaries (
 id SERIAL PRIMARY KEY,
 doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
 content TEXT NOT NULL,
 model_used TEXT,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id),
 doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
 action TEXT NOT NULL,
 details TEXT,
 timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
 id SERIAL PRIMARY KEY,
 doc_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
 title TEXT NOT NULL,
 event_type TEXT CHECK (event_type IN ('DEADLINE', 'MEETING')),
 event_date DATE NOT NULL,
 event_time TIME,
 description TEXT,
 created_by_ai BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
 id SERIAL PRIMARY KEY,
 user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
 event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
 notify_at TIMESTAMP NOT NULL,
 is_sent BOOLEAN DEFAULT FALSE
);
```

---

## 6. Performance Optimizations (Indexes)

```sql
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_uploader_id ON documents(uploader_id);
CREATE INDEX idx_summaries_doc_id ON summaries(doc_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_events_doc_id ON events(doc_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

## 7. AI Processing Architecture Workflow
The AI service runs as a separate FastAPI microservice connected to a local Ollama model.
1. **Document uploaded**
2. **Backend extracts text**
3. **Text split into chunks**
4. **Each chunk summarized**
5. **Final summary generated**
6. **Stored in `summaries` table**

*(Note: For current development phase, the AI service functions as a placeholder backend step to verify document upload workflows to Supabase and PostgreSQL bindings.)*

---

## 8. Sample Queries

**Retrieve Documents Visible to User:**
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

**Get Document Summary:**
```sql
SELECT content FROM summaries
WHERE doc_id = :doc_id
ORDER BY created_at DESC LIMIT 1;
```
