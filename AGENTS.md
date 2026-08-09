# Agent Instructions for LexDoc AI

> This file loads agent instructions in any AI environment (Antigravity/Gemini, Claude, GPT).

## Project Overview

**LexDoc AI** is a multi-modal AI-powered college document management system.

- **Frontend**: React 19 + Vite (in `frontend/`)
- **Backend**: Supabase PostgreSQL + Edge Functions (Deno)
- **AI**: OpenRouter (multi-model fallback) + LlamaParse + OCR.space
- **State**: Redux Toolkit + React Router v7
- **Animations**: GSAP + Lenis

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- SOPs and design docs in `RELEVANT DOCS/`
- Define the goals, schema, data flow, and UI/UX rules

**Layer 2: Orchestration (You — Decision making)**
- Read directives, make decisions, handle errors
- Use skills from `SKILLS/` for specialized work
- Intelligent routing: don't do everything yourself — use the right skill

**Layer 3: Execution (Doing the work)**
- React components, Supabase queries, Edge Functions
- Deterministic, testable code
- Scripts and utilities in `frontend/src/utils/`

## Available Skills

Load and use these skills from `SKILLS/`:

| Skill | Location | Purpose |
|-------|----------|---------|
| `skill_db` | `SKILLS/skill_db/skill_db.md` | Supabase/PostgreSQL schema design, RLS, triggers, migrations |
| `frontend-design` | `SKILLS/frontend-design/skill_frontend.md` | React UI/UX, glassmorphism, GSAP animations |
| `skill-creator` | `SKILLS/skill-creator/SKILL_skillcreator.md` | Create new reusable agent skills |

**How to use a skill**: Read the skill's `.md` file before starting work in that domain. Follow its guidelines for output format and design thinking.

## Operating Principles

**1. Intelligent Routing — Use skills first**
Before writing code, check if a skill applies. `skill_db` for database work, `frontend-design` for UI work.

**2. Self-anneal on errors**
- Read error → fix code → test → update this file with findings
- Never ask the user to fix something you can debug yourself

**3. Preserve architecture**
- 3NF database schema — no denormalization without explicit reason
- RLS enforced at DB layer — never rely solely on frontend checks
- Glassmorphism aesthetic — no flat material design regressions
- Component structure: `components/` (reusable) vs `pages/` (route-level)

**4. Commit conventions**
```
feat: add [feature description]
fix: resolve [bug description]
refactor: [what changed and why]
docs: [documentation update]
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `frontend/src/App.jsx` | All routes |
| `frontend/src/index.css` | Global design system & CSS variables |
| `frontend/src/lib/` | Supabase client |
| `frontend/src/store/` | Redux store + theme slice |
| `frontend/temp_edge_fn.ts` | Supabase Edge Functions source |
| `RELEVANT DOCS/Database_Architecture.md` | DB schema, triggers, RLS, AI pipeline |
| `RELEVANT DOCS/Supabase_Database_Schema.md` | Full SQL DDL |

## Environment Variables

Required in `frontend/.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Edge Function secrets (set via Supabase Dashboard):
```
OPENROUTER_API_KEY=
LLAMAPARSE_API_KEY=
OCR_SPACE_API_KEY=
```

## Summary

You sit between human intent (docs in `RELEVANT DOCS/`) and deterministic execution (React code + Supabase). Read skills, make decisions, execute with precision. Self-anneal on failures. Keep the glassmorphism UI premium and the database architecture clean.
