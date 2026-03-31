# LexDoc AI - Project Viva & Presentation Q&A

This document contains a curated list of potential questions that judges may ask regarding the backend, database architecture, and advanced SQL methodologies used in **LexDoc AI**, along with detailed, technical answers to demonstrate deep understanding.

---

## 1. Normalization & Database Design

**Q: Explain the normalization level of your database. Are you complying with 3NF?**  
**A:** Yes, the entire relational schema is strictly normalized to the Third Normal Form (3NF).
- **1NF (Atomic Values):** We ensure no column contains arrays or comma-separated lists. For example, a document can have multiple tags and be assigned to multiple departments, but we do not store this as a list in the `documents` table.
- **2NF (No Partial Dependencies):** We utilize Junction Tables (e.g., `document_tags`, `document_departments`) with composite primary keys (`doc_id`, `tag_id`). Every attribute perfectly depends on the full primary key.
- **3NF (No Transitive Dependencies):** Our `users` table only stores `role_id` and `dept_id` as foreign keys. We never store `role_name` or `dept_name` inside the user record. If a department changes its name, we update exactly one row in the `departments` table, entirely eliminating update anomalies.

**Q: Why use Junction Tables instead of simply storing an array of IDs?**  
**A:** Storing arrays violates 1NF and makes querying inefficient. Using junction tables like `document_tags` enables PostgreSQL to utilize Foreign Key constraints, guaranteeing referential integrity (e.g., you can't assign a `tag_id` that doesn't exist). It also drastically improves indexing and `JOIN` performance when filtering documents by specific tags or departments.

---

## 2. Advanced SQL: Triggers & Stored Procedures

**Q: Did you implement any database Triggers? What is their purpose in LexDoc AI?**  
**A:** Yes, we rely heavily on PostgreSQL Triggers and PL/pgSQL Stored Procedures to shift business logic directly to the database layer, ensuring integrity regardless of how the API is called.
1. **Automated Timestamps:** We have an `update_modified_column()` function bound to `BEFORE UPDATE` triggers on our `users` and `documents` tables. It natively calls `now()` to keep `updated_at` completely accurate without relying on the React frontend.
2. **Immutable Audit Logging:** We built an `audit_document_changes()` function triggered `AFTER INSERT OR DELETE ON documents`. It reads the secure Supabase JWT token context (`auth.uid()`) to identify exactly who initiated the action, and natively inserts a tracking record into the `audit_logs` table.
3. **Automated Notifications:** We have a trigger (`notify_on_urgent_document`) that listens on the `document_tags` table. If it detects a document being tagged as 'Urgent' or 'High', it procedurally generates targeted alerts in the `notifications` table based on department accessibility rules.

**Q: Why put the Audit Logging in a trigger instead of just calling an `insert()` from your frontend code?**  
**A:** Security and reliability. If the frontend crashes, or if a malicious user bypasses the UI and interacts with the Supabase API directly, a frontend-based log would be completely bypassed. By placing the logic inside a PostgreSQL Trigger, the database structurally guarantees that *no document can ever be created or deleted without leaving an audit trail*. 

---

## 3. Security & Row-Level Security (RLS)

**Q: How do you prevent a student from seeing confidential administrative documents?**  
**A:** We utilize PostgreSQL Row-Level Security (RLS). Our database policies actively dynamically intercept every `SELECT`, `INSERT`, `UPDATE`, and `DELETE` query. 
- When the frontend asks for documents, it doesn't just receive everything. The database intercepts the query, parses the requesting user's JWT token, cross-references their `role_id` and `dept_id`, and mathematically filters the rows at the database engine layer.
- For example, if a document’s `access_level` is `PRIVATE` or `CONFIDENTIAL`, the RLS policy simply drops the row from the result set if the querying user's access level is below the required threshold (e.g., < 10 for Admins, < 7 for HODs).

---

## 4. Automation & Scheduled Jobs

**Q: How is the automatic document expiration feature implemented? Does a server have to be running constantly?**  
**A:** Document expiration operates completely serverlessly. We implemented this using the PostgreSQL `pg_cron` extension directly inside the database.
- We created a cron scheduler job `cron.schedule('delete-expired-documents', '0 * * * *', $$ DELETE FROM documents WHERE expiry_date < NOW(); $$)`.
- Every hour, the database sweeps itself and deletes rows where the current timestamp has surpassed the `expiry_date`. 
- Because we have an `AFTER DELETE` trigger (mentioned earlier), this automated deletion is successfully tracked in the `audit_logs` automatically.

---

## 5. AI Integrations & Document Processing

**Q: Explain how the AI summarization pipeline handles files and limits latency.**  
**A:** We utilize a dual serverless architecture operating via Supabase TypeScript Edge Functions (`generate-summary` and `parse-docx`) running on the Deno runtime.
1. **Extraction Capabilities:** `generate-summary` uses LlamaParse for high-fidelity markdown extraction (with OCR.space fallback for scanned PDFs). Complementing this, `parse-docx` serves as a dedicated native buffer parser utilizing `mammoth` and `cheerio` to seamlessly structure Microsoft Word files without cloud API latency.
2. **Resilient AI Pipeline:** We employ a robust sequential fallback array. By default, it targets the high-fidelity `arcee-ai/trinity-large-preview` LLM model. If rate limitations or timeouts occur (managed strictly at 45 seconds via `AbortController`), the programmatic loop instantaneously falls back to `gemini-2.0-flash`.
3. **Data Structuring (Events):** We built a 5-step deterministic TypeScript pipeline inside the Edge Function to natively parse dates, timezone-filter past events (using `Asia/Kolkata`), explicitly categorize event keywords natively (e.g., DEADLINE, EXAM), and logically compress sequential dates into "Ranges". We explicitly shifted this heavy logic *out* of hallucination-prone LLM prompting and directly into the type-safe Deno runtime to guarantee flawless JSON formatting.
4. **Intelligent Caching:** To severely limit compute expenditures, the Edge function writes successful generations directly to an `ai_cache` table. Any subsequent summary requests bypass the AI entirely.

---

## 6. Real-World Date Handling & Timezones

**Q: Did you face any issues storing timestamps, and how did you resolve them?**  
**A:** Yes, PostgreSQL normally records natively in UTC. Initially, dates parsed by JavaScript (`new Date()`) directly from the database were incorrectly appearing 5.5 hours behind our actual local Indian Standard Time (IST) in the Audit Logs. 
We structurally solved this by utilizing `TIMESTAMP WITH TIME ZONE` native data types, and implementing frontend formatters that normalize ambiguous strings by appending the `Z` suffix identifier. This forces the browser to beautifully map the database's absolute UTC moment perfectly into the user's localized `Asia/Kolkata` time zone.
