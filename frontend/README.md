# LexDoc AI — Frontend

React 19 + Vite 7 application. All server-side logic runs as Deno Edge Functions on Supabase; there is no separate backend server.

## Stack

- **React 19** + **Vite 7** — component framework and build tooling
- **React Router v7** — client-side routing with layout nesting
- **Redux Toolkit** — global state (theme, sidebar, notifications)
- **Vanilla CSS** — custom liquid glassmorphism design system; no utility frameworks
- **GSAP 3** — staggered animations, magnetic cursor tracking, page transitions
- **Lenis** — smooth scroll
- **Three.js / React Three Fiber / OGL** — WebGL backgrounds and 3D effects
- **Supabase JS SDK** — database, auth, storage, and edge function client
- **Lucide React** — icons

## Setup

```bash
npm install
cp .env.example .env
# Edit .env — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run lint` | ESLint |

## Environment Variables

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Source Layout

```
src/
├── components/
│   ├── auth/        # ProtectedRoute
│   ├── layout/      # AppLayout, Sidebar, TopBar, NotificationPanel
│   └── ui/          # CustomCursor, SmoothScroll, ThemeToggle
├── pages/           # Route-level components
├── store/           # Redux slices — theme, sidebar, notifications
├── lib/             # Supabase client instance
├── utils/           # Shared utilities
└── index.css        # Design system — CSS custom properties, glassmorphism tokens
```

## Notes

- Authentication is restricted to `@sahrdaya.ac.in` email addresses (enforced server-side via Supabase Auth settings and an email domain check in the OAuth callback).
- Edge Function source is in `temp_edge_fn.ts` — deploy with the Supabase CLI.
