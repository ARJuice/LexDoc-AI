---
name: skill_db
description: Create, plan, edit, and optimize Supabase PostgreSQL database structures for LexDoc AI. Use this skill when asked to design a database, write migrations, plan data architecture, define relationships, or structure the data layer using Supabase features. Generates robust, normalized (up to 3NF), and scalable PostgreSQL designs with RLS, triggers, and pg_cron jobs.
---

# LexDoc AI — Database Skill

This skill guides the planning, creation, and editing of database structures for **Supabase PostgreSQL** in the LexDoc AI project.

## Existing Schema Context

LexDoc AI uses these core tables (already deployed):
- `departments` — college departments
- `roles` — admin/hod/teacher/student with `access_level`
- `users` — `google_id`, `dept_id(FK)`, `role_id(FK)`, `sr_no`, `class`, `semester`
- `documents` — `title`, `uploader_id(FK)`, `access_level`, `processing_status`, `expiry_date`
- `document_tags` — junction table (doc_id, tag_id)
- `document_departments` — junction table (doc_id, dept_id)
- `summaries` — `doc_id(FK)`, `content`, `model_used`
- `ai_cache` — `doc_id(UNIQUE FK)`, `summary_text`, `model_used` (caching table)
- `audit_logs` — `user_id(FK)`, `doc_id`, `action`, `details`, `timestamp`
- `notifications` — `user_id(FK)`, `doc_id(FK)`, `message`, `is_read`

## Design Thinking

Before proposing schema changes:
- **Stay in 3NF**: No transitive dependencies. Store FKs, not names.
- **RLS first**: Every new table needs RLS policies. Use `auth.uid()` for user-scoped access.
- **Trigger automation**: Prefer triggers over frontend logic for audit trails, timestamps, notifications.
- **pg_cron for maintenance**: Use for scheduled cleanups (expired docs, old notifications).

## Output Format

1. **ER Diagram** (mermaid) — show relationships
2. **DDL** — precise `CREATE TABLE` SQL
3. **RLS Policies** — using Supabase patterns
4. **Triggers & Functions** — plpgsql functions for automation
5. **Seed/Query examples** — for testing

## Edge Function Integration

When writing queries that feed Edge Functions (`generate-summary`, `parse-docx`):
- Edge functions use the Supabase service role (bypasses RLS)
- They write to `ai_cache` and `summaries` after AI processing
- `documents.processing_status` is updated: `'pending'` → `'summarized'` or `'failed'`
