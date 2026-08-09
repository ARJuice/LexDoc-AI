---
name: intelligent-routing
description: Core routing skill for LexDoc AI development. Activates automatically to route any development task to the correct skill or execution path. Use when starting any new development task to determine whether it's a database task (→ skill_db), frontend task (→ frontend-design), AI pipeline task, or architectural decision. Prevents compounding errors by pushing work to the right layer.
---

# LexDoc AI — Intelligent Routing Skill

This is the **primary routing brain** for LexDoc AI development. Every task passes through this first.

## The Decision Tree

```
New task arrives
    │
    ├── Database / Supabase / Schema / RLS / Trigger / Migration?
    │       └── Load skill: .agents/skills/skill_db/SKILL.md
    │
    ├── UI / Component / Page / Styling / Animation / GSAP / CSS?
    │       └── Load skill: .agents/skills/frontend-design/SKILL.md
    │
    ├── AI Pipeline / Summarization / Edge Function / OpenRouter?
    │       └── Read: RELEVANT DOCS/Database_Architecture.md (sections 8.1–8.3)
    │           Then: Apply changes to frontend/temp_edge_fn.ts
    │
    ├── Authentication / Permissions / RBAC / RLS Policy?
    │       └── Read: RELEVANT DOCS/Database_Architecture.md (section 5)
    │           Then: Load skill_db for DB changes, frontend-design for UI changes
    │
    ├── Architecture / System Design decision?
    │       └── Read: RELEVANT DOCS/Rough Concept.txt + RELEVANT DOCS/UI-UX.txt
    │           Then: Propose and confirm before implementing
    │
    └── Unknown / Unclear?
            └── Ask for clarification before touching any code
```

## Routing Rules

| Task Keywords | Route To | Why |
|--------------|----------|-----|
| `database`, `schema`, `table`, `RLS`, `trigger`, `pg_cron`, `migration`, `query`, `supabase` | `skill_db` | DB-layer concerns |
| `component`, `page`, `UI`, `CSS`, `style`, `animation`, `GSAP`, `design`, `layout` | `frontend-design` | Frontend layer |
| `edge function`, `openrouter`, `summarize`, `parse`, `llamaparse`, `AI`, `summary` | AI Pipeline docs | Server-side AI |
| `auth`, `OAuth`, `login`, `role`, `permission`, `JWT`, `session` | Both skills | Spans both layers |
| `README`, `documentation`, `docs` | Direct output | No skill needed |

## Layer Separation Principle

> **90% accuracy per step = 59% success over 5 steps.**
> Push complexity into the right layer. Don't do database work in React. Don't do frontend logic in SQL.

- **DB Layer**: Schema, RLS, triggers, `pg_cron`, Edge Functions — always deterministic
- **Frontend Layer**: React components, routing, state, UI — always reactive to DB state
- **Never**: Enforce access control only in the frontend. Always back it with RLS.

## Before Any Code Change

1. **Identify the layer** using the decision tree above
2. **Load the relevant skill** and follow its output format
3. **Check for existing patterns** in `frontend/src/` before creating new ones
4. **Preserve the aesthetic** — every UI change must match the glassmorphism design system
5. **Commit after each meaningful change** with a descriptive conventional commit message

## Self-Annealing Protocol

When something breaks:
1. Read the error message and stack trace fully
2. Fix the code at the correct layer (don't patch DB errors in React)
3. Test the fix
4. Update this file or the relevant skill with what was learned
5. System is now stronger

## Project Health Checklist

Before calling a task done:
- [ ] No N+1 database queries (use relational selects, not sequential fetches)
- [ ] All new tables have RLS enabled
- [ ] UI works in both dark and light themes
- [ ] GSAP animations use only `transform` and `opacity` (GPU-accelerated)
- [ ] No secrets or API keys in frontend code — use Edge Function secrets
- [ ] Conventional commit message used
