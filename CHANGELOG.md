# Changelog

All notable changes to the **IRNK Codes** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-05-31

Initial production-grade release of the portfolio platform, developer blog, and automation engine. Engineered by **Eliyanto Sarage**.

### Added
- **UI & Core Design**: Modern responsive cyberpunk HUD layout utilizing Tailwind CSS v4, custom HSL design tokens, Framer Motion, and a unified `react-icons` compatible barrel export.
- **AI Web Scraper & Gemini Gateway**:
  - Implemented server-side scraper to parse destination URLs.
  - Integrated Gemini API with Zod JSON schema validation and self-repair prompt loops.
  - Created cyberpunk countdown safelink screen (`/s/[code]`) with SVG circular progression rings, CLI console feeds, domain security safety audits, and dynamic technical reading panes.
- **SecOps & Audit Operations Command**:
  - Configured detailed audit logs with dynamic Recharts area and pie metrics.
  - Implemented click-stream tracking to identify bot scraper activity.
  - Centralized role-based access checks (`requireAdmin()`) across all Server Actions.
- **Dynamic Public Announcements**:
  - Developed Banner, Card, and Spotlight Modal layout displays.
  - Configured path-targeted scheduling (`starts_at` / `ends_at`) and localStorage dismiss limits.
- **Newsletter campaign system**:
  - Built subject composer with live Sandboxed HTML previewers.
  - Set up queue dispatchers and unsubscribe landing pages.
- **Automated Routing & Page titles**: Centralized title system inside `admin-layout.tsx` to reactively map browser document titles based on current routes, eliminating redundant layout files.

---

## [0.9.0] - 2026-05-24

### Added
- Core Supabase PostgreSQL migration steps (`001_initial_schema` to `011_add_gallery_slug`).
- Row-Level Security (RLS) configurations securing all tables.
- Public services catalog, testimonial submission portal, and contact inbox pipelines.
