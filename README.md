<p align="center">
  <img src="docs/logo.png" alt="LexDoc AI" width="100" />
  <br /><br />
  <strong>LexDoc AI</strong><br />
  <sub>Intelligent Multi-Modal Document Management System · Sahrdaya College of Engineering and Technology</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=61DAFB&labelColor=0d1117" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=646CFF&labelColor=0d1117" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=3ECF8E&labelColor=0d1117" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenRouter-AI-FF6B35?style=flat-square&labelColor=0d1117" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/GSAP-Animations-88CE02?style=flat-square&logo=greensock&logoColor=88CE02&labelColor=0d1117" alt="GSAP" />
</p>

## Overview

LexDoc AI is an AI-powered document management platform built for Sahrdaya CET. It transforms raw institutional documents into searchable, AI-summarized intelligence — secured entirely at the database layer. Authentication is restricted to `@sahrdaya.ac.in` institutional emails.

## Features

**AI Document Intelligence** — Documents are parsed (LlamaParse / OCR.space), summarized through a 4-model OpenRouter fallback chain, and cached server-side. Deadlines and events are auto-extracted and surfaced in a calendar view.

**Database-Layer Security** — PostgreSQL RLS policies on every table, scoped to the authenticated user's JWT. An `AFTER INSERT/DELETE` trigger writes immutable audit log entries directly from the DB, bypassing any frontend manipulation.

**Premium UI** — Liquid glassmorphism design system with GSAP staggered animations, a custom PNG cursor with `quickTo` magnetic tracking, Lenis smooth scroll, WebGL animated beams on the login page (OGL), and full dark/light theming.

**Role-Based Access** — Admin → HOD/Teacher → Student hierarchy. Role and department membership are stored as foreign keys; the DB enforces visibility through RLS — the frontend only reflects what the DB already restricts.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing / State | React Router v7 + Redux Toolkit |
| Styling / Animation | Vanilla CSS · GSAP 3 · Lenis smooth scroll |
| 3D / WebGL | Three.js + React Three Fiber + OGL |
| Backend | Supabase (PostgreSQL 3NF + RLS + Storage) |
| Auth | Supabase Auth — Google OAuth + JWT |
| Edge Functions | Deno runtime on Supabase |
| AI | OpenRouter API (4-model chain) · LlamaParse · OCR.space |
| Icons | Lucide React |

## Architecture

```
React 19 + Vite
  └── Redux (theme, sidebar, notifications)
  └── React Router v7 (protected routes)
  └── Supabase JS SDK
        ├── PostgreSQL (3NF schema, RLS on all tables)
        ├── Supabase Auth (Google OAuth / JWT)
        ├── Supabase Storage (document buckets)
        └── Edge Functions (Deno)
              ├── generate-summary  →  OpenRouter API
              └── parse-docx        →  mammoth + cheerio
```

**AI Summarization flow:** Upload → Storage → Edge Function checks `ai_cache` → LlamaParse/OCR extract text → sequential model chain (Arcee → Gemini 2.0 Flash → LLaMA 3.3 → DeepSeek) with 45s `AbortController` timeout → UPSERT `ai_cache` + `summaries` → update `processing_status`.

## Database Schema (3NF)

```sql
departments          → id, name, code
roles                → id, name, access_level
users                → id, google_id, dept_id(FK), role_id(FK), sr_no, class, semester
documents            → id, title, uploader_id(FK), access_level, processing_status, expiry_date
document_tags        → doc_id(FK), tag_id(FK)          -- junction
document_departments → doc_id(FK), dept_id(FK)          -- junction
summaries            → id, doc_id(FK), content, model_used
ai_cache             → id, doc_id(UNIQUE FK), summary_text, model_used
audit_logs           → id, user_id(FK), doc_id, action, details, timestamp
notifications        → id, user_id(FK), doc_id(FK), message, is_read
```

Automated jobs via `pg_cron`: expired documents swept hourly, notifications purged after 7 days.

## Pages

| Route | Description | Access |
|---|---|---|
| `/login` | Google OAuth with WebGL background | Public |
| `/dashboard` | Live stats, recent docs, upcoming events | All |
| `/documents` | Browse, filter, search accessible docs | All |
| `/documents/:id` | PDF/DOCX viewer + AI summary panel | All |
| `/upload` | Drag-and-drop + live AI processing states | Authenticated |
| `/my-uploads` | Personal document management | Authenticated |
| `/insights` | Calendar with AI-extracted event overlays | Authenticated |
| `/profile` | Editable user profile | Authenticated |
| `/admin/users` | User management and role assignment | Admin |
| `/admin/departments` | Department CRUD | Admin |
| `/admin/audit` | Immutable audit log viewer | Admin |

## Getting Started

```bash
git clone https://github.com/ARJuice/LexDoc-AI.git
cd LexDoc-AI/frontend
npm install
cp .env.example .env   # add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Apply the database schema from [`RELEVANT DOCS/Supabase_Database_Schema.md`](RELEVANT%20DOCS/Supabase_Database_Schema.md), then run the trigger and `pg_cron` SQL from [`RELEVANT DOCS/Database_Architecture.md`](RELEVANT%20DOCS/Database_Architecture.md).

Set Edge Function secrets in the Supabase Dashboard: `OPENROUTER_API_KEY`, `LLAMAPARSE_API_KEY`, `OCR_SPACE_API_KEY`.

## Academic Context

Built for the PBL course at Sahrdaya CET, aligned with **SDG 4 (Quality Education)** and **SDG 9 (Industry, Innovation & Infrastructure)**.

## License

MIT — see [LICENSE](LICENSE).
