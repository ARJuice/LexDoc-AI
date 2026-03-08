# Supabase Database Schema: LexDoc AI

## 1. Supabase Infrastructure
Supabase provides:
- Managed PostgreSQL database
- Storage buckets for documents
- Security policies
- API access layer

Authentication is hybrid:
- Google verification (first login) → Account creation → Local username/password login

## 2. Relational Database Schema
The database follows a relational model with normalized tables.

### Core Tables

#### 1. departments
Stores organizational departments.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Department ID |
| `name` | TEXT | Department name |
| `code` | TEXT | Department code |

*Example*: HR, FIN, LEGAL

#### 2. roles
Defines system roles.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Role ID |
| `name` | TEXT | Role name |
| `access_level` | INTEGER | Authority level |

*Example hierarchy*: Admin = 10, Head = 5, Staff = 1. This enables quick permission checks.

#### 3. users
Stores user accounts.
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

#### 4. documents
Stores uploaded document metadata.
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
| `uploader_id` | FK | references `users.id` |
| `uploaded_at` | TIMESTAMP | Upload time |

#### 5. document_departments
Controls document access for departments. (Composite PK: `doc_id`, `dept_id`)
| Column | Type |
| --- | --- |
| `doc_id` | FK |
| `dept_id` | FK |

#### 6. tags
Unified tagging system. (Example Priorities: High=100, Medium=50, Low=10)
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Tag ID |
| `name` | TEXT | Tag name |
| `type` | TEXT | `PRIORITY`, `LABEL` |
| `weight` | INTEGER | Tag weight |
| `color` | TEXT | UI Color |

#### 7. document_tags
Many-to-many relation for document tags. (Composite PK: `doc_id`, `tag_id`)
| Column | Type |
| --- | --- |
| `doc_id` | FK |
| `tag_id` | FK |

#### 8. summaries
Stores AI-generated summaries.
| Column | Type | Description |
| --- | --- | --- |
| `id` | PK | Summary ID |
| `doc_id` | FK | references `documents.id` |
| `content` | TEXT | Summary content |
| `model_used` | TEXT | AI Model |
| `created_at` | TIMESTAMP |  |

#### 9. events
AI-extracted meetings and deadlines.
| Column | Type |
| --- | --- |
| `id` | PK |
| `doc_id` | FK |
| `title` | TEXT |
| `event_type` | TEXT |
| `event_date` | DATE |
| `event_time` | TIME |
| `description` | TEXT |
| `created_by_ai` | BOOLEAN |
| `created_at` | TIMESTAMP |

#### 10. notifications
Reminder system.
| Column | Type |
| --- | --- |
| `id` | PK |
| `user_id` | FK |
| `event_id` | FK |
| `notify_at` | TIMESTAMP |
| `is_sent` | BOOLEAN |

#### 11. audit_logs
Security logging.
| Column | Type |
| --- | --- |
| `id` | PK |
| `user_id` | FK |
| `doc_id` | FK |
| `action` | TEXT |
| `details` | TEXT |
| `timestamp` | TIMESTAMP |

---

## 3. Normalization (Up to 3NF)
The schema follows Third Normal Form (3NF).

**First Normal Form (1NF)**
Requirements: Atomic values, no repeating groups, unique rows.
*Example*: `tags` and `document_tags` ensure tags are stored separately, avoiding a comma-separated `tags` column in `documents`.

**Second Normal Form (2NF)**
Requirements: Must be in 1NF, no partial dependency on composite keys.
*Example*: `document_tags` consists of `(doc_id, tag_id)`. No other columns depend on part of the key.

**Third Normal Form (3NF)**
Requirements: No transitive dependencies.
*Example*: Instead of storing `dept_name` in `users`, we store `users.dept_id` which references `departments.name`. This removes transitive dependencies (`users -> dept_id -> department name`).

---

## 4. SQL Table Creation (Sample DDL)

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
 processing_status TEXT,
 is_general BOOLEAN DEFAULT FALSE,
 uploader_id INTEGER REFERENCES users(id),
 uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Data Population (Finance Company Demo)

```sql
-- =============================================
-- DEPARTMENTS (Finance Company)
-- =============================================
INSERT INTO departments(name, code) VALUES
('Treasury','TRSY'),
('Risk Management','RISK'),
('Compliance','COMP'),
('Investment Banking','INVB'),
('Wealth Management','WLTH'),
('Corporate Finance','CORP'),
('Audit & Internal Controls','AUDT');

-- =============================================
-- ROLES
-- =============================================
INSERT INTO roles(name, access_level) VALUES
('Admin', 10),
('Department Head', 5),
('Analyst', 3),
('Staff', 1);

-- =============================================
-- USERS
-- =============================================
INSERT INTO users(username, email, password_hash, google_id, is_verified, role_id, dept_id) VALUES
('rachel.kumar',  'rachel.kumar@lexfin.com',   '$2b$10$xYz...hashed', 'gid_rachel01', TRUE, 1, 1),
('vikram.singh',  'vikram.singh@lexfin.com',   '$2b$10$xYz...hashed', 'gid_vikram02', TRUE, 2, 2),
('priya.menon',   'priya.menon@lexfin.com',    '$2b$10$xYz...hashed', 'gid_priya03',  TRUE, 2, 3),
('arjun.nair',    'arjun.nair@lexfin.com',     '$2b$10$xYz...hashed', 'gid_arjun04',  TRUE, 3, 4),
('sneha.das',     'sneha.das@lexfin.com',      '$2b$10$xYz...hashed', 'gid_sneha05',  TRUE, 3, 5),
('rohan.patel',   'rohan.patel@lexfin.com',    '$2b$10$xYz...hashed', 'gid_rohan06',  TRUE, 4, 6),
('ananya.iyer',   'ananya.iyer@lexfin.com',    '$2b$10$xYz...hashed', 'gid_ananya07', TRUE, 3, 7),
('deepak.sharma', 'deepak.sharma@lexfin.com',  '$2b$10$xYz...hashed', 'gid_deepak08', TRUE, 4, 1);

-- =============================================
-- TAGS
-- =============================================
INSERT INTO tags(name, type, weight, color) VALUES
('High Priority',   'PRIORITY', 100, '#EF4444'),
('Medium Priority',  'PRIORITY', 50,  '#F59E0B'),
('Low Priority',     'PRIORITY', 10,  '#10B981'),
('Quarterly Report', 'LABEL',   80,  '#6366F1'),
('Confidential',     'LABEL',   90,  '#DC2626'),
('Regulatory',       'LABEL',   85,  '#8B5CF6'),
('Audit Finding',    'LABEL',   70,  '#EC4899'),
('Market Analysis',  'LABEL',   60,  '#0EA5E9'),
('Internal Memo',    'LABEL',   40,  '#64748B'),
('Board Review',     'LABEL',   95,  '#F97316');

-- =============================================
-- DOCUMENTS (Finance-themed)
-- =============================================
INSERT INTO documents(title, storage_bucket, storage_path, file_size, mime_type, checksum, processing_status, is_general, uploader_id) VALUES
('Q4 2025 Treasury Performance Report',       'docs', 'treasury/q4_2025_report.pdf',       2450000, 'application/pdf', 'sha256_abc1', 'summarized', FALSE, 1),
('Market Risk Assessment — March 2026',        'docs', 'risk/market_risk_mar2026.pdf',      1870000, 'application/pdf', 'sha256_abc2', 'summarized', FALSE, 2),
('AML Compliance Circular #47',                'docs', 'compliance/aml_circular_47.pdf',    980000,  'application/pdf', 'sha256_abc3', 'summarized', TRUE,  3),
('IPO Readiness Checklist — Nexon Pharma',     'docs', 'invbanking/ipo_nexon.pdf',          3200000, 'application/pdf', 'sha256_abc4', 'summarized', FALSE, 4),
('HNI Client Portfolio Review Q1 2026',        'docs', 'wealth/hni_portfolio_q1.pdf',       1540000, 'application/pdf', 'sha256_abc5', 'summarized', FALSE, 5),
('Annual Budget Forecast FY2026–27',           'docs', 'corpfin/budget_fy2627.pdf',         4100000, 'application/pdf', 'sha256_abc6', 'summarized', TRUE,  6),
('Internal Audit Report — IT Controls',         'docs', 'audit/it_controls_audit.pdf',       2890000, 'application/pdf', 'sha256_abc7', 'summarized', FALSE, 7),
('Board Meeting Minutes — February 2026',      'docs', 'general/board_minutes_feb26.pdf',   1120000, 'application/pdf', 'sha256_abc8', 'summarized', TRUE,  1),
('Forex Hedging Strategy Memo',                'docs', 'treasury/forex_hedging_memo.pdf',   760000,  'application/pdf', 'sha256_abc9', 'summarized', FALSE, 8),
('KYC Process Update Notice',                  'docs', 'compliance/kyc_update.pdf',         540000,  'application/pdf', 'sha256_abcA', 'summarized', TRUE,  3);

-- =============================================
-- DOCUMENT → DEPARTMENT ACCESS
-- =============================================
INSERT INTO document_departments(doc_id, dept_id) VALUES
(1, 1), (2, 2), (4, 4), (5, 5), (7, 7), (9, 1);

-- =============================================
-- DOCUMENT → TAGS
-- =============================================
INSERT INTO document_tags(doc_id, tag_id) VALUES
(1, 4), (1, 1),           -- Q4 Report: Quarterly, High Priority
(2, 1), (2, 8),           -- Risk Assessment: High Priority, Market Analysis
(3, 6), (3, 5),           -- AML Circular: Regulatory, Confidential
(4, 1), (4, 10),          -- IPO Checklist: High Priority, Board Review
(5, 5), (5, 2),           -- HNI Portfolio: Confidential, Medium Priority
(6, 4), (6, 10),          -- Budget: Quarterly, Board Review
(7, 7), (7, 1),           -- IT Audit: Audit Finding, High Priority
(8, 10), (8, 9),          -- Board Minutes: Board Review, Internal Memo
(9, 9), (9, 3),           -- Forex Memo: Internal Memo, Low Priority
(10, 6), (10, 2);         -- KYC Update: Regulatory, Medium Priority

-- =============================================
-- SUMMARIES (AI-generated content)
-- =============================================
INSERT INTO summaries(doc_id, content, model_used) VALUES
(1, 'The Q4 2025 Treasury report highlights a 12% increase in short-term liquidity reserves, driven by improved cash-flow management across regional branches. Key risk: rising overnight lending rates may compress margins in Q1 2026. Recommendation: rebalance the overnight portfolio toward longer-maturity instruments.', 'ollama/llama3'),
(2, 'March 2026 market risk assessment identifies elevated volatility in emerging-market forex pairs (INR/USD, BRL/USD). Value-at-Risk for the trading book has increased by 8% month-over-month. Stress tests indicate potential losses of $4.2M under a severe downturn scenario. Immediate action: review stop-loss limits on EM currency positions.', 'ollama/llama3'),
(3, 'Anti-Money Laundering Circular #47 introduces enhanced due diligence requirements for correspondent banking relationships effective April 15, 2026. All existing correspondent accounts must be re-assessed within 90 days. New transaction monitoring thresholds lowered from $10,000 to $5,000 for high-risk jurisdictions.', 'ollama/llama3'),
(4, 'IPO readiness checklist for Nexon Pharma covers 47 action items across legal, financial, and regulatory workstreams. Current completion: 72%. Critical blockers: pending SEBI clarification on promoter lock-in period and outstanding tax litigation from FY2023. Target listing date: July 2026.', 'ollama/llama3'),
(5, 'Q1 2026 HNI portfolio review shows AUM growth of 6.3% to $142M across 38 active clients. Top performers: tech-heavy portfolios (+14%). Underperformers: real-estate-linked funds (−3.2%). Client churn risk flagged for 3 accounts under $2M AUM. Recommendation: schedule personal review calls with at-risk clients.', 'ollama/llama3'),
(6, 'FY2026–27 annual budget projects total revenue of $284M (+9% YoY). Major CAPEX allocation: digital transformation ($18M), branch expansion ($12M), and compliance infrastructure ($7M). Operating margin target: 22%. Key assumption: no more than 2 rate hikes by RBI in the fiscal year.', 'ollama/llama3'),
(7, 'Internal audit of IT controls found 3 critical findings: (1) privileged access reviews overdue by 6 months, (2) disaster recovery tests not conducted in Q3–Q4 2025, (3) 14 endpoints running unsupported OS versions. Management has committed to remediation by April 30, 2026.', 'ollama/llama3'),
(8, 'Board meeting minutes from February 2026 cover approval of the FY2027 budget, review of the Nexon Pharma IPO mandate, and discussion of the new AML circular impact. The board directed management to present an updated digital strategy by the April meeting.', 'ollama/llama3'),
(9, 'Forex hedging strategy memo proposes shifting from simple forward contracts to a collar strategy (buying puts + selling calls) on INR/USD exposure. Expected cost reduction: 35% on hedging premiums. Risk: limited upside capture if INR appreciates beyond the call strike.', 'ollama/llama3'),
(10, 'KYC process update notice revises the customer onboarding workflow to include Aadhaar-based video KYC for retail accounts. Expected processing time reduction: 48 hours to 4 hours. All relationship managers must complete updated training by March 31, 2026.', 'ollama/llama3');

-- =============================================
-- EVENTS (AI-extracted deadlines & meetings)
-- =============================================
INSERT INTO events(doc_id, title, event_type, event_date, event_time, description, created_by_ai) VALUES
(3,  'AML Enhanced Due Diligence Effective',     'DEADLINE',  '2026-04-15', '00:00', 'New correspondent banking EDD requirements take effect',             TRUE),
(4,  'Nexon Pharma Target Listing Date',         'DEADLINE',  '2026-07-01', '10:00', 'Planned IPO listing on BSE/NSE',                                     TRUE),
(7,  'IT Audit Remediation Deadline',             'DEADLINE',  '2026-04-30', '17:00', 'Critical IT control findings must be resolved',                      TRUE),
(8,  'Board Meeting — Digital Strategy Review',   'MEETING',   '2026-04-18', '14:00', 'Presentation of updated digital transformation strategy to the board', TRUE),
(10, 'KYC Training Completion Deadline',          'DEADLINE',  '2026-03-31', '23:59', 'All RMs must complete updated video KYC training',                   TRUE),
(6,  'Q1 Budget Review',                          'MEETING',   '2026-04-10', '11:00', 'First quarterly review of FY2027 budget actuals vs forecast',        TRUE),
(2,  'Risk Committee — EM Exposure Review',       'MEETING',   '2026-03-20', '15:30', 'Review of emerging-market currency position limits',                 TRUE),
(5,  'HNI At-Risk Client Calls',                  'DEADLINE',  '2026-03-25', '18:00', 'Complete personal review calls with 3 flagged at-risk HNI clients',  TRUE);

-- =============================================
-- NOTIFICATIONS
-- =============================================
INSERT INTO notifications(user_id, event_id, notify_at, is_sent) VALUES
(3, 1, '2026-04-14 09:00', FALSE),   -- Priya: AML deadline reminder
(4, 2, '2026-06-30 09:00', FALSE),   -- Arjun: IPO listing reminder
(7, 3, '2026-04-29 09:00', FALSE),   -- Ananya: IT audit remediation
(1, 4, '2026-04-17 09:00', FALSE),   -- Rachel: Board meeting prep
(3, 5, '2026-03-30 09:00', FALSE),   -- Priya: KYC training deadline
(6, 6, '2026-04-09 09:00', FALSE),   -- Rohan: Budget review meeting
(2, 7, '2026-03-19 09:00', FALSE),   -- Vikram: Risk committee meeting
(5, 8, '2026-03-24 09:00', FALSE);   -- Sneha: HNI client calls

-- =============================================
-- AUDIT LOG ENTRIES (sample)
-- =============================================
INSERT INTO audit_logs(user_id, doc_id, action, details) VALUES
(1, 1, 'UPLOAD',  'Uploaded Q4 2025 Treasury Performance Report'),
(2, 2, 'UPLOAD',  'Uploaded Market Risk Assessment — March 2026'),
(3, 3, 'UPLOAD',  'Uploaded AML Compliance Circular #47'),
(4, 4, 'UPLOAD',  'Uploaded IPO Readiness Checklist — Nexon Pharma'),
(1, 8, 'UPLOAD',  'Uploaded Board Meeting Minutes — February 2026'),
(2, 2, 'VIEW',    'Viewed Market Risk Assessment'),
(5, 6, 'VIEW',    'Viewed Annual Budget Forecast FY2026–27'),
(7, 7, 'VIEW',    'Viewed Internal Audit Report — IT Controls'),
(1, 3, 'VIEW',    'Viewed AML Compliance Circular #47'),
(3, 10,'UPLOAD',  'Uploaded KYC Process Update Notice');
```

---

## 6. Sample SQL Queries

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
WHERE doc_id = 10
ORDER BY created_at DESC LIMIT 1;
```

**Upcoming Events:**
```sql
SELECT * FROM events
WHERE event_date >= CURRENT_DATE
ORDER BY event_date;
```

---

## 7. Triggers
Triggers automate tasks. Example: **Audit Log Trigger** when a document is deleted.

```sql
CREATE OR REPLACE FUNCTION log_document_delete()
RETURNS TRIGGER AS $$
BEGIN
 INSERT INTO audit_logs(user_id,doc_id,action,details,timestamp)
 VALUES(
   OLD.uploader_id,
   OLD.id,
   'DELETE',
   'Document deleted',
   NOW()
 );
 RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER document_delete_trigger
AFTER DELETE ON documents
FOR EACH ROW
EXECUTE FUNCTION log_document_delete();
```

---

## 8. Stored Procedures
Stored procedures encapsulate business logic. Example: **Create Event Notification** schedules reminders.

```sql
CREATE OR REPLACE FUNCTION create_notifications()
RETURNS VOID AS $$
BEGIN

INSERT INTO notifications(user_id,event_id,notify_at,is_sent)
SELECT
u.id,
e.id,
e.event_date - INTERVAL '1 day',
FALSE
FROM users u
JOIN events e ON TRUE;

END;
$$ LANGUAGE plpgsql;
```

---

## 9. Performance Optimization
Indexes improve query speed.

```sql
CREATE INDEX idx_documents_uploader ON documents(uploader_id);
CREATE INDEX idx_summaries_doc ON summaries(doc_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
```

---

## 10. Security Using Supabase
Supabase provides built-in Row Level Security (RLS). Users can only access documents from their department or ones they uploaded.

Example logic for standard policy:
```sql
documents.is_general = TRUE OR
documents.uploader_id = auth.uid() OR
-- department match check logic
```

---

## 11. Document Processing Workflow
1. User uploads document →
2. File stored in Supabase storage →
3. Metadata stored in `documents` table →
4. FastAPI sends text to Ollama →
5. Summary generated →
6. Saved in `summaries` table →
7. AI extracts events →
8. Events stored in `events` table →
9. Notifications scheduled.

---

## 12. Final Database Advantages
The schema provides:
✔ Fully normalized design (3NF)
✔ Efficient document access control
✔ AI summary storage
✔ Event extraction capability
✔ Notification system
✔ Security audit logging
