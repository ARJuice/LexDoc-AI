---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces for LexDoc AI. Use this skill when asked to build UI components, pages, fix styling, or improve the glassmorphism design system. Generates premium React + Vanilla CSS code with GSAP animations, avoiding generic AI aesthetics. Context-aware of the existing liquid glass aesthetic.
---

# LexDoc AI — Frontend Design Skill

This skill guides creation of distinctive, premium frontend interfaces for **LexDoc AI** — a glassmorphism-first college document management system.

## Existing Design System Context

LexDoc AI uses these CSS variables (defined in `frontend/src/index.css`):
- Dark/Light theme toggle stored in `localStorage` under `lexdoc-theme`
- Redux `theme.isDark` state controls `document.documentElement.classList.toggle('dark', isDark)`
- **Custom cursor**: `components/ui/CustomCursor` — GSAP-powered dot-ring cursor
- **Smooth scroll**: `components/ui/SmoothScroll` — Lenis integration

### Aesthetic Direction: Liquid Glassmorphism
- Frosted glass cards with `backdrop-filter: blur()`
- Subtle gradients and layered transparencies
- Dynamic hover states with shadow elevation
- Electric blue/cyan accents on dark backgrounds
- Magnetic hover effects on interactive elements

## Design Thinking

Before writing code, commit to the context:
- **Consistency**: Match existing glassmorphism aesthetic — don't introduce flat or material styles
- **Motion**: GSAP for complex animations; CSS transitions for simple hover states
- **Performance**: `transform` and `opacity` only — no layout-triggering properties in animations
- **Theming**: Always support both dark and light modes via CSS variables

## Component Rules

```jsx
// Always use existing CSS custom properties
// e.g.: var(--glass-bg), var(--accent-color), var(--text-primary)

// GSAP pattern for page animations
useEffect(() => {
  gsap.from('.element', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' });
}, []);
```

## Output Format

1. **Aesthetic rationale** — what direction, why it fits
2. **JSX component** — complete, production-ready React code
3. **CSS** — Vanilla CSS only (no Tailwind), using existing variable names
4. **GSAP hooks** — if animation is needed

## Never Do

- Import Tailwind or any CSS framework
- Use `Arial`, `Inter`, `Roboto` — the project has its own font stack
- Introduce purple-gradient-on-white aesthetics (the project uses dark glassmorphism)
- Break the `components/` vs `pages/` separation
- Use inline styles for anything more than one-off overrides
