# Contributing to IRNK Codes

First off, thank you for considering contributing to **IRNK Codes**! It is people like you who make the developer community such a great place.

Please take a moment to review this document to ensure your contributions align with our engineering standards and codebase architecture.

---

## Codebase Integrity & Tech Stack

This project runs on a modern stack with strict constraints. All contributions must adhere to these specifications:
- **Core Stack**: Next.js 16.2.6, React 19, and Supabase.
- **Rendering Philosophy**: Prioritize Server-First rendering. Aggressively minimize client-side JavaScript. Only use `"use client"` when handling direct browser events or DOM integrations.
- **Icon Assets**: Under NO circumstances should you import `lucide-react` directly. We utilize `react-icons` (from `"react-icons/lu"`, `"react-icons/fi"`, `"react-icons/hi2"`) which are central barrel-exported in `@/lib/icons.ts`. Use these imports instead.
- **Input Validation**: All Server Action payloads must be validated first via **Zod** schema parser models.
- **SecOps Rules**: Enforce role checks using `requireAdmin()` on any mutative administrative endpoint.

---

## Development Workflow

### 1. Set Up Local Environment
Ensure your local branch is up to date:
```bash
git checkout main
git pull origin main
npm install
```

### 2. Create a Feature Branch
We use conventional branch prefix patterns:
- `feat/your-feature-name` (new features)
- `fix/your-fix-name` (bug fixes)
- `chore/your-task-name` (maintenance, documentation)

```bash
git checkout -b feat/add-visualizer-studio
```

### 3. Coding Standards & Lints
Verify code compilation, typecheck integrity, and lint compliance prior to committing:
```bash
npm run verify
```
Your code **must pass verify checks with 0 warnings and 0 errors** to be eligible for merge.

---

## Commit Message Guidelines

We follow the **Conventional Commits** specification:

- **feat**: A new feature (e.g., `feat: integrate AI custom colors to safelink`)
- **fix**: A bug fix (e.g., `fix: resolve hydration delay in countdown timer`)
- **docs**: Documentation updates (e.g., `docs: describe RLS database schema`)
- **style**: Layout alignment, styling updates (no logical changes)
- **refactor**: Code optimization without changing functionality
- **chore**: Build tools, dependency changes, or workspace configs

Example:
```bash
git commit -m "feat: add dynamic layout targeting to announcements"
```

---

## Pull Request Process

1. Fork the repository and create your branch from `main`.
2. Document your changes in your PR description.
3. Ensure your branch builds cleanly without any lint or compilation warnings (`npm run verify` passes).
4. Submit the PR to the `main` branch.
5. Code reviews are processed under Eliyanto Sarage. We will coordinate feedback and approvals directly on the PR dashboard.
