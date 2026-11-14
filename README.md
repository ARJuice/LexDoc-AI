<p align="center">
  <img src="docs/logo.png" alt="LexDoc AI" width="90" />
  <br /><br />
  <strong>LexDoc AI</strong>
  <br />
  <sub>Document management platform for Sahrdaya College of Engineering and Technology</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react&logoColor=61DAFB&labelColor=0d1117" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=646CFF&labelColor=0d1117" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=3ECF8E&labelColor=0d1117" alt="Supabase" />
  <img src="https://img.shields.io/badge/Deno-Edge_Functions-70FFAF?style=flat-square&logo=deno&logoColor=70FFAF&labelColor=0d1117" alt="Deno" />
  <img src="https://img.shields.io/badge/GSAP-3.14-88CE02?style=flat-square&logo=greensock&logoColor=88CE02&labelColor=0d1117" alt="GSAP" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=0d1117" alt="MIT License" />
</p>

---

LexDoc AI is a full-stack document management platform built for institutional use. It handles secure document storage, role-based access across departments, and document processing — all without a traditional backend. Server-side logic runs entirely as [Deno Edge Functions on Supabase](https://supabase.com/docs/guides/functions), with PostgreSQL Row-Level Security enforcing access control at the database layer.

Authentication is scoped to `@sahrdaya.ac.in` institutional email addresses via Google OAuth.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| Routing | React Router v7 |
| State | Redux Toolkit |
| Styling | Vanilla CSS — custom liquid glassmorphism design system |
| Animation | GSAP 3 (staggered reveals, magnetic cursor, page transitions) |
| Scroll | Lenis smooth scroll |
| 3D / WebGL | Three.js + React Three Fiber + OGL |
| Database | Supabase — PostgreSQL 3NF + RLS + Storage |
| Auth | Supabase Auth — Google OAuth, JWT sessions |
| Server-side | Deno Edge Functions on Supabase |
| Document parsing | LlamaParse API (primary) + OCR.space (fallback) |
| AI summarization | OpenRouter API — 4-model sequential fallback chain |
| Icons | Lucide React |

## Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                        BROWSER  —  React 19 + Vite                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   PAGES                          COMPONENTS                          ║
║   ├── /login          ◄──────►   ├── Beams / Particles  (WebGL/OGL) ║
║   ├── /dashboard                 ├── Sidebar            (GSAP)      ║
║   ├── /documents[/:id]           ├── TopBar + Search                ║
║   ├── /upload                    ├── NotificationPanel              ║
║   ├── /insights   (Calendar)     ├── CustomCursor       (GSAP)      ║
║   ├── /profile                   └── ThemeToggle                    ║
║   └── /admin/*                                                       ║
║                                                                      ║
║   STATE                          ROUTING                             ║
║   Redux Toolkit                  React Router v7                     ║
║   ├── theme slice                ├── ProtectedRoute                  ║
║   ├── sidebar slice              └── AppLayout (outlet)             ║
║   └── notifications slice                                            ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                   Supabase JS SDK  (client layer)                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐  ║
║  │   PostgreSQL     │  │  Supabase Auth   │  │ Supabase Storage   │  ║
║  │                  │  │                  │  │                    │  ║
║  │  3NF schema      │  │  Google OAuth    │  │  Document buckets  │  ║
║  │  RLS all tables  │  │  @sahrdaya.ac.in │  │  PDF / DOCX files  │  ║
║  │  Triggers        │  │  JWT sessions    │  │                    │  ║
║  │  pg_cron jobs    │  │                  │  │                    │  ║
║  └─────────────────┘  └──────────────────┘  └────────────────────┘  ║
║                                                                      ║
║  ┌───────────────────────────────────────────────────────────────┐   ║
║  │                  Edge Functions  (Deno runtime)               │   ║
║  │                                                               │   ║
║  │  generate-summary                   parse-docx               │   ║
║  │  ├── check ai_cache                 ├── mammoth  (DOCX→HTML) │   ║
║  │  ├── download from Storage          └── cheerio (structure)  │   ║
║  │  ├── extract text (LlamaParse/OCR)                            │   ║
║  │  ├── run model chain (45s timeout)                            │   ║
║  │  └── upsert ai_cache + summaries                             │   ║
║  └───────────────────────────────────────────────────────────────┘   ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                      EXTERNAL SERVICES                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  OpenRouter  (AI model chain)        Document Parsing                ║
║  ├── arcee-ai/trinity-large  [1]     ├── LlamaParse API  (primary)   ║
║  ├── gemini-2.0-flash        [2]     └── OCR.space API   (fallback)  ║
║  ├── llama-3.3-70b           [3]                                     ║
║  └── deepseek-chat           [4]     Google OAuth                    ║
║                                      └── identity + email domain     ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Document processing flow:** Upload → Supabase Storage → `generate-summary` Edge Function → check `ai_cache` (return if hit) → extract text via LlamaParse or OCR.space → sequential model chain with per-model 45s `AbortController` timeout → `UPSERT ai_cache` + `summaries` → `processing_status = 'summarized'`.

**Security model:** Every table has RLS enabled. Policies evaluate `auth.uid()` from the JWT at query time — the frontend never makes an access decision; the database does. An `AFTER INSERT OR DELETE` trigger on `documents` writes audit log entries with `SECURITY DEFINER`, making them un-bypassable from the client.

## Database Schema (3NF)

```
departments          → id, name, code
roles                → id, name, access_level
users                → id, email, google_id, dept_id(FK), role_id(FK), sr_no, class, semester
documents            → id, title, uploader_id(FK), access_level, processing_status, expiry_date
document_tags        → doc_id(FK), tag_id(FK)          -- junction
document_departments → doc_id(FK), dept_id(FK)          -- junction
tags                 → id, name, type(PRIORITY|LABEL|CUSTOM), weight, color
summaries            → id, doc_id(FK), content, model_used
ai_cache             → id, doc_id(UNIQUE FK), summary_text, model_used
events               → id, doc_id(FK), title, event_type, event_date
notifications        → id, user_id(FK), event_id(FK), notify_at, is_sent
audit_logs           → id, user_id(FK), doc_id, action, details, timestamp
```

Automated maintenance via `pg_cron`: expired documents swept hourly, stale notifications purged after 7 days. See [`RELEVANT DOCS/Database_Architecture.md`](RELEVANT%20DOCS/Database_Architecture.md) for the full trigger and RLS SQL.

## Pages

| Route | Description | Access |
|---|---|---|
| `/login` | Google OAuth with WebGL animated background (OGL) | Public |
| `/dashboard` | Live stats, recent documents, upcoming events | Authenticated |
| `/documents` | Browse, filter, full-text search across accessible docs | Authenticated |
| `/documents/:id` | Inline PDF/DOCX viewer + AI-generated summary panel | Authenticated |
| `/upload` | Drag-and-drop uploader with live processing status | Authenticated |
| `/my-uploads` | Personal document management and re-summarization | Authenticated |
| `/insights` | Calendar view with AI-extracted deadlines and events | Authenticated |
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

Apply the schema from [`RELEVANT DOCS/Supabase_Database_Schema.md`](RELEVANT%20DOCS/Supabase_Database_Schema.md) in the Supabase SQL editor, then run the triggers and `pg_cron` jobs from [`RELEVANT DOCS/Database_Architecture.md`](RELEVANT%20DOCS/Database_Architecture.md).

Set Edge Function secrets in the Supabase Dashboard: `OPENROUTER_API_KEY`, `LLAMAPARSE_API_KEY`, `OCR_SPACE_API_KEY`.

## License

MIT — see [LICENSE](LICENSE).
