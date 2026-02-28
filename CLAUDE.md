# Linker

Smart browser custom search engine SPA. Evaluates regex-based conditions (Go) and tag-based tables (Find) to redirect users based on input.

## Stack

- React 18 + TypeScript (strict) + Vite 6
- react-router-dom v6 (BrowserRouter)
- @dnd-kit (drag & drop for cards and rules)
- localStorage persistence (no backend)
- Single global CSS file with custom properties (no CSS modules, no Tailwind)

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc + vite build
npm run lint      # ESLint
```

## Architecture

Unified entry at `/?q=KEY+VALUE`. Two admin sub-apps:

- `/` → `CommandRouter` — resolves query: go conditions → find tables → admin fallback
- `/go/` → `GoPage` — admin for regex-based redirect conditions
- `/find/` → `FindPage` — admin for tag-based find tables

State lives in `useLocalStorage` hook → localStorage keys: `linker_shortcuts`, `linker_lookup`, `linker_theme`.

## Code Rules

These are enforced by ESLint (`eslint.config.js`) and must be followed in all new code:

### TypeScript

- **Use `type`, never `interface`** — enforced by `@typescript-eslint/consistent-type-definitions`
- **Use `type Props`** — always name it `Props`, never `ComponentProps`, `MyComponentProps`, etc. Since there's one component per file, there's no ambiguity
- **Use `export type` for type-only imports** — enforced by `@typescript-eslint/consistent-type-imports`

### Components

- **One component per file** — enforced by `react/no-multi-comp` (exception: `icons.tsx`)
- **Named exports only** — no default exports (`export const MyComponent = ...`)
- **Arrow function components** — `export const Component = ({ ... }: Props) => { ... }`
- Small local helpers (non-component functions, render helpers that don't take props) are fine in the same file

### File Organization

```
src/
  components/
    shared/         # Reusable UI (Layout, icons, AddCardForm, etc.)
    go/             # Go module (conditions)
    find/           # Find module (tables)
    CommandRouter.tsx
    HomePage.tsx
  hooks/            # Custom hooks (useLocalStorage, useInlineEdit)
  utils/            # Pure logic (evaluate, go.utils, find.utils, url.utils)
```

### Naming

- Files: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils (with `.utils.ts` suffix for utility modules)
- Components: PascalCase
- Functions/variables: camelCase
- CSS classes: kebab-case

### Patterns

- State updates are immutable (map/filter/spread, no mutations)
- CRUD logic lives in `utils/*.utils.ts`, not in components
- Inline editing via `useInlineEdit` hook
- Props are destructured in function signature
- IDs generated with `uuid`

### CSS

- All styles in `src/index.css` — no CSS modules
- Use existing CSS custom properties (`--bg`, `--surface`, `--border`, `--text`, `--accent-1`, etc.)
- Dark mode is default, light mode via `[data-theme="light"]`
- Module accent: `.module-go` → blue, `.module-find` → purple
