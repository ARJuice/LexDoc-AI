<p align="center">
  <img src="docs/logo.png" alt="LexDoc AI Logo" width="120" />
</p>

<h1 align="center">LexDoc AI</h1>

<p align="center">
  <strong>Intelligent Multi-Modal Document Management System</strong><br/>
  <sub>Built for Sahrdaya College of Engineering and Technology</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=0d1117" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=646CFF&labelColor=0d1117" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=3ECF8E&labelColor=0d1117" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenRouter-AI%20Powered-FF6B35?style=for-the-badge&labelColor=0d1117" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock&logoColor=88CE02&labelColor=0d1117" alt="GSAP" />
</p>

---

## 🧠 What is LexDoc AI?

**LexDoc AI** is a production-grade, AI-powered document management platform built for Sahrdaya College of Engineering and Technology. It's not just a file storage tool — it's an **organizational knowledge platform** that transforms raw institutional documents into structured, searchable, AI-summarized intelligence.

> Built as a college PBL (Project-Based Learning) project, but engineered to production standards.

Students, teachers, HODs, and admins can **upload, access, and understand** documents through AI-generated summaries, smart tagging, and a premium glassmorphism UI — all enforced by database-level access control. Authentication is restricted to `@sahrdaya.ac.in` institutional emails.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 Hybrid Authentication
- Google OAuth restricted to `@sahrdaya.ac.in` domain
- Supabase JWT session management
- Role-based access: Admin → HOD → Teacher → Student
- Account setup flow for new institutional users

</td>
<td width="50%">

### 🤖 AI Document Intelligence
- LlamaParse + OCR.space for multi-modal text extraction
- OpenRouter-powered summarization with 4-model fallback chain
- Auto event/deadline parsing via Gemini 2.0 Flash
- AI summaries cached server-side via `ai_cache` table

</td>
</tr>
<tr>
<td width="50%">

### 🏛️ Database-Layer Security
- PostgreSQL Row Level Security (RLS) on every table
- 3NF-normalized schema with junction tables
- DB-level audit triggers — bypass-proof audit trail
- Automated document expiry via `pg_cron`

</td>
<td width="50%">

### 🎨 Premium Liquid Glass UI
- WebGL animated beams (OGL) + particle systems on login
- GSAP-powered staggered page animations and transitions
- Custom PNG cursor with magnetic hover via GSAP `quickTo`
- Lenis smooth scroll with full dark/light theme support

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React 19 + Vite)              │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────┐ │
│  │Dashboard│  │Documents │  │  Upload  │  │  AI Calendar     │ │
│  └─────────┘  └──────────┘  └─────────┘  └──────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Redux Toolkit  │  React Router v7  │  Supabase JS SDK  │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Supabase Client SDK
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE BACKEND                        │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────────┐   │
│  │  PostgreSQL  │  │  Supabase Auth │  │  Supabase Storage │   │
│  │  (RLS + 3NF) │  │  (OAuth + JWT) │  │  (File Buckets)   │   │
│  └──────────────┘  └────────────────┘  └───────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Edge Functions (Deno Runtime)               │    │
│  │  ┌─────────────────────┐  ┌────────────────────────┐   │    │
│  │  │  generate-summary   │  │     parse-docx         │   │    │
│  │  │  (OpenRouter API)   │  │  (mammoth + cheerio)   │   │    │
│  │  └─────────────────────┘  └────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              │        External AI APIs         │
              │  LlamaParse │ OpenRouter        │
              │  OCR.space  │ Gemini 2.0 Flash  │
              └─────────────────────────────────┘
```

---

## 🤖 AI Pipeline — How Summarization Works

When a user uploads a document, this happens automatically:

```
Upload Document
    │
    ▼
Store in Supabase Storage
    │
    ▼
Invoke Edge Function: generate-summary
    │
    ├── Check ai_cache → Return instantly if cached
    │
    ▼
Extract Text
    ├── .docx → parse-docx Edge Fn (mammoth + cheerio)
    ├── .pdf  → LlamaParse API
    └── Fallback → OCR.space API (for scanned/image PDFs)
    │
    ▼
AI Summarization (Sequential Fallback Chain, 45s timeout each)
    ├── 1. arcee-ai/trinity-large-preview:free  (Primary)
    ├── 2. google/gemini-2.0-flash:free          (Fallback 1)
    ├── 3. meta-llama/llama-3.3-70b:free        (Fallback 2)
    └── 4. deepseek/deepseek-chat:free           (Fallback 3)
    │
    ▼
UPSERT into ai_cache + summaries table
UPDATE documents.processing_status = 'summarized'
    │
    ▼
Display to User — Live processing states in Upload UI
```

Each model call is wrapped with an `AbortController` at 45 seconds to prevent runaway edge function billing.

---

## 🗄️ Database Architecture

The PostgreSQL schema is fully normalized to **Third Normal Form (3NF)** with Supabase Row Level Security enforced at every table.

```sql
-- Core Tables
departments    → id, name, code
roles          → id, name, access_level
users          → id, google_id, dept_id(FK), role_id(FK), sr_no, class, semester
documents      → id, title, uploader_id(FK), access_level, processing_status, expiry_date

-- Junction Tables (2NF compliance — no partial dependencies)
document_tags        → doc_id(FK), tag_id(FK)
document_departments → doc_id(FK), dept_id(FK)

-- AI & Audit
summaries      → id, doc_id(FK), content, model_used
ai_cache       → id, doc_id(UNIQUE FK), summary_text, model_used
audit_logs     → id, user_id(FK), doc_id, action, details, timestamp
notifications  → id, user_id(FK), doc_id(FK), message, is_read
```

### 🔒 Security Highlights

- **RLS on every table** — queries scoped to `auth.uid()` JWT context
- **`AFTER INSERT/DELETE` trigger** on `documents` → auto-writes immutable `audit_logs` rows (cannot be bypassed from the frontend)
- **`notify_on_urgent_document` trigger** on `document_tags` → pushes notifications only to users within the correct RBAC scope
- **`pg_cron`** sweeps expired documents hourly; old notifications purged after 7 days

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + Vite 7 |
| **Routing** | React Router v7 |
| **State Management** | Redux Toolkit |
| **Styling** | Vanilla CSS (Liquid Glassmorphism design system) |
| **Animations** | GSAP 3 (`gsap.quickTo`, staggered reveals, page transitions) |
| **Smooth Scroll** | Lenis (`@studio-freight/lenis`) |
| **3D / WebGL** | Three.js + React Three Fiber + OGL (login background) |
| **Database** | Supabase PostgreSQL (3NF + RLS) |
| **Authentication** | Supabase Auth (Google OAuth + JWT) |
| **File Storage** | Supabase Storage Buckets |
| **Edge Functions** | Deno runtime on Supabase |
| **AI Orchestration** | OpenRouter API (4-model fallback chain) |
| **Document Parsing** | LlamaParse API + OCR.space |
| **Word Docs** | mammoth.js + cheerio (via Edge Function) |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
LexDoc-AI/
├── 📂 frontend/                # React + Vite Application
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 auth/        # ProtectedRoute
│   │   │   ├── 📂 layout/      # AppLayout, Sidebar (GSAP collapse), TopBar
│   │   │   └── 📂 ui/          # CustomCursor, SmoothScroll, Beams (WebGL),
│   │   │                       # Particles, NotificationPanel, ThemeToggle
│   │   ├── 📂 context/         # AuthProvider (AuthContext + Supabase session)
│   │   ├── 📂 lib/             # Supabase client + supabaseData.js (all queries)
│   │   ├── 📂 pages/
│   │   │   ├── Login           # Google OAuth + WebGL Beams/Particles background
│   │   │   ├── Dashboard       # Live stats, recent docs, upcoming events
│   │   │   ├── Documents       # Browse, filter, search all accessible docs
│   │   │   ├── DocumentDetail  # Split: PDF/DOCX viewer + AI summary panel
│   │   │   ├── Upload          # Drag-and-drop + live AI processing states
│   │   │   ├── AIInsights      # Calendar view with event/deadline overlays
│   │   │   ├── Profile         # Editable user profile
│   │   │   ├── MyUploads       # Personal document management
│   │   │   └── Admin/          # Users, Departments, Audit Logs (admin only)
│   │   ├── 📂 store/           # Redux store (theme + sidebar + notifications)
│   │   └── 📂 assets/          # Logo, cursor PNGs
│   └── 📄 .env.example
├── 📂 RELEVANT DOCS/           # Architecture, DB schema, project diary
├── 📂 .agents/skills/          # Antigravity AI skill system
│   ├── intelligent-routing/    # Routes tasks to correct skill
│   ├── skill_db/               # DB design & RLS patterns
│   └── frontend-design/        # Glassmorphism UI guidelines
└── 📄 README.md
```

---

## ⚡ Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with:
  - Google OAuth provider configured
  - Storage buckets created
  - Database schema applied (see [`RELEVANT DOCS/Supabase_Database_Schema.md`](RELEVANT%20DOCS/Supabase_Database_Schema.md))
  - Edge Functions deployed (source in `frontend/temp_edge_fn.ts`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ARJuice/LexDoc-AI.git
cd LexDoc-AI/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Start development server
npm run dev
```

### Database Setup

1. Open **Supabase Dashboard → SQL Editor**
2. Run the schema from [`RELEVANT DOCS/Supabase_Database_Schema.md`](RELEVANT%20DOCS/Supabase_Database_Schema.md)
3. Run triggers and `pg_cron` jobs from [`RELEVANT DOCS/Database_Architecture.md`](RELEVANT%20DOCS/Database_Architecture.md)
4. Promote your admin user:
   ```sql
   UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE google_id = 'your-google-uid';
   ```

### Edge Function Secrets

Set these in the Supabase Dashboard under **Edge Functions → Secrets**:
```
OPENROUTER_API_KEY=
LLAMAPARSE_API_KEY=
OCR_SPACE_API_KEY=
```

---

## 🎭 Application Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Google OAuth with WebGL background | Public |
| `/dashboard` | Stats, recent docs, upcoming events | All users |
| `/documents` | Browse, filter, and search accessible docs | All users |
| `/documents/:id` | Document viewer + AI summary panel | All users |
| `/upload` | Drag-and-drop upload + live AI processing | Authenticated |
| `/my-uploads` | Personal document management | Authenticated |
| `/insights` | AI calendar with event/deadline overlays | Authenticated |
| `/profile` | Editable user profile | Authenticated |
| `/admin/users` | User management & role assignment | Admin only |
| `/admin/departments` | Department CRUD | Admin only |
| `/admin/audit` | Immutable audit log viewer | Admin only |

---

## 🏛️ Role-Based Access Control

```
Admin (access_level ≥ 10)
  └── Full access: all docs, all departments, admin panel, audit logs

HOD / Teacher (access_level ≥ 5)
  └── Department documents + ability to tag uploads as PRIORITY
      Upload course material visible department-wide

Student (access_level < 5)
  └── Department documents scoped to their class/semester
      Read-only PRIORITY tag visibility (cannot assign)
```

All access is enforced at the **PostgreSQL RLS layer** — the frontend UI reflects what the database already restricts.

---

## 🎓 Academic Context

Built for **Sahrdaya College of Engineering and Technology** as a PBL project, aligned with:

| SDG | Alignment |
|-----|-----------|
| **SDG 4 — Quality Education** | Democratizes access to educational and departmental resources within the institution |
| **SDG 9 — Industry, Innovation & Infrastructure** | Builds AI-integrated digital infrastructure for secure institutional document management |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/ARJuice">Arjun</a></strong><br/>
  <sub>React 19 · Supabase · OpenRouter · GSAP · LlamaParse · Sahrdaya CET</sub>
</p>
