# <p align="center">⚡ IRNK CODES — Premium Cyberpunk Digital Ecosystem</p>

<p align="center">
  <img src="public/irnk.png" alt="IRNK CODES Logo" width="160" />
</p>

<p align="center">
  <strong>An immersive, high-performance, and secure-by-default developer portfolio, tech center, and serverless automation engine.</strong>
</p>

<p align="center">
  <a href="https://idugeni.github.io"><img src="https://img.shields.io/badge/Live%20Platform-idugeni.github.io-06b6d4?style=for-the-badge&logo=google-chrome&logoColor=white&labelColor=020406" alt="Live Platform" /></a>
  <a href="https://github.com/idugeni/idugeni.github.io"><img src="https://img.shields.io/badge/Build-Next.js%2016.2.6-10b981?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=020406" alt="Build Status" /></a>
  <a href="https://github.com/idugeni/idugeni.github.io"><img src="https://img.shields.io/badge/React-19.2.6-ec4899?style=for-the-badge&logo=react&logoColor=white&labelColor=020406" alt="React 19" /></a>
  <a href="https://github.com/idugeni/idugeni.github.io"><img src="https://img.shields.io/badge/Database-Supabase%20RLS-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white&labelColor=020406" alt="Database" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-eab308?style=for-the-badge&labelColor=020406" alt="License" /></a>
</p>

<p align="center">
  <img src="public/h269ii0w5js0.png" alt="IRNK CODES OpenGraph Header Banner" style="border-radius: 8px; border: 1px solid rgba(6, 182, 212, 0.25); box-shadow: 0 0 30px rgba(6, 182, 212, 0.15);" />
</p>

---

## 🔮 What is IRNK CODES?

**IRNK CODES** is a premium, cutting-edge digital ecosystem that functions as a highly sophisticated technical portfolio, developer blog, and operations center. Designed with an immersive retro-futuristic **cyberpunk hacker-HUD layout**, the application combines deep HSL variables, fluid glassmorphic container aesthetics, glowing neon borders, and micro-interactive framer-motion transitions.

The engine represents a production-grade showcase of modern web engineering, prioritizing **server-first architectures**, secure whitelisted server actions, and aggressive client bundle optimization.

---

## 🔒 Production DevSecOps Hardening & Architecture

IRNK CODES is engineered with a strict **Security-by-Design** philosophy. The entire codebase and database layers have undergone exhaustive production-grade security hardening:

### 1. Database-Native Private Schema Isolation
All high-privilege operations, transient tables, and backend validators are isolated in a custom **`private` schema** inside the Supabase PostgreSQL database:
* **REST API Isolation**: Because Supabase PostgREST strictly exposes the `public` schema by default, placing sensitive assets inside the `private` schema makes them completely unreachable via external client REST endpoints (`/rest/v1/rpc/*`).
* **Resolved Database Linter Warnings**: This completely neutralizes public anonymous execution exploits (Supabase Lint 0028 & 0029).

### 2. Search Path Hijack Prevention
All `SECURITY DEFINER` functions in the database are hard-configured with a secure, explicit search path to neutralize schema hijack vectors:
```sql
CREATE OR REPLACE FUNCTION private.check_rate_limit(...)
RETURNS BOOLEAN AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
```
This locks down search resolutions to the `public` and temporary schemas, satisfying strict security standards (Supabase Lint 0011).

### 3. Serverless Connection Pool Tuning
To prevent database connection exhaustion during serverless scaling events on Vercel, the direct PostgreSQL client pool has been optimized:
* **Max Pool size**: Limited to `1` connection per stateless instance in `lib/db/pooler.ts`.
* **Fast Release Timings**: Idle connections are released in seconds, allowing thousands of scaling lambdas to execute seamlessly without locking the relational database.

### 4. Sliding-Window Rate Limiting
Transient rate log tables (`private.rate_limits`) and helper evaluators are integrated directly into the database. A sliding window check blocks rapid request amplification at the PostgreSQL layer before executing heavy Node runtimes, featuring inline automated log pruning to keep tables fast and bounded.

### 5. Industry-Standard HTML Sanitization
To protect dynamic user-generated rich text (such as blog comments and admin editor previews) against stored and DOM-based Cross-Site Scripting (XSS), custom regex sanitizers are replaced with a strict **`isomorphic-dompurify`** parser configured with custom element allowlists.

---

## 🎨 Modular Interface Sections

The landing page of **IRNK CODES** is structured into high-performance, responsive sections:

1. **🖥️ Mission Control (Hero & Stats)**: A live cyberpunk dashboard tracking years of experience, projects delivered, happy clients, and mastered technologies.
2. **🗃️ Innovation Vault (Featured Projects)**: A database-driven masonry grid showcase of engineered applications, with detailed technical stack specs and live repo links.
3. **⚙️ Service Spectrum**: A dynamic grid highlighting specialized solutions in Full-Stack Web Development, AI/ML integrations, and DevOps orchestrations.
4. **🛠️ Tech Stack Grid**: A visual database representing framework proficiencies, styled database assets, and cloud systems.
5. **👥 Client Proof Engine (Testimonials)**: A fluid recommendations carousel displaying verified reviews from engineering partners.
6. **🖼️ Visual Archive (Gallery Masonry)**: A visually striking visual preview showcasing developer setups, high-fidelity tech art, and mockups.
7. **📰 Intel Stream (Latest Blog Articles)**: An editorial blog segment bringing the latest guides and tutorials to the developer community.
8. **📨 Comm-Link (Newsletter)**: A secure subscription portal letting visitors join the list for instant system updates.

---

## 🛠️ Premium Technical Stack

### Frontend Architecture
* **Core Framework**: Next.js 16.2.6 (App Router, React Server Components by default, Suspense, and Streaming)
* **Runtime**: React 19.2.6 (Turbopack compiler compatible, optimized rendering granularity)
* **Styling**: Tailwind CSS v4 (Deep HSL variables, fluid glassmorphic styling, and interactive layouts)
* **Animations**: Framer Motion (Smooth cyberpunk HUD indicators, micro-interactions, and neon glow transitions)

### Backend & Cloud Infrastructure
* **Database**: PostgreSQL on Supabase (Secure Row-Level Security policies, optimized indexes)
* **Security & Auth**: Supabase SSR Auth, Secure Cookie Sessions, whitelisted RBAC checks (`requireAdmin()`)
* **Email Orchestration**: Resend API Integration with transaction logs
* **Hosting Platform**: Vercel (Edge network, global CDN, Partial Prerendering enabled)

---

## 💻 Local Development & Deployment

### 1. Setup Environment
Clone the repository and create your local configuration:
```bash
cp .env.example .env
```
Populate `.env` with your Supabase credentials, Resend API keys, and whitelisted admin emails.

### 2. Install Dependencies
Install packages cleanly using the suppressed peer-dependency flag:
```bash
npm install
```

### 3. Database Synchronization
Synchronize your local schema and production hardening migrations directly with Supabase:
```bash
node scratch/apply-production-hardening.cjs
```

### 4. Build & Verify
Validate compilation, TypeScript typecheck, and linter standards cleanly:
```bash
npm run verify
```

---

## 👨‍💻 Meet the Founder

<table align="center">
  <tr>
    <td align="center" width="220" style="border: 1px solid rgba(6, 182, 212, 0.25); background: rgba(2, 4, 6, 0.6);">
      <img src="https://github.com/idugeni.png" width="180" style="border-radius: 50%; margin: 15px; border: 3px solid #06b6d4; box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);" alt="Eliyanto Sarage" />
      <br />
      <strong>Eliyanto Sarage</strong>
      <br />
      <sub>Founder & Lead Engineer</sub>
    </td>
    <td valign="top" style="padding-left: 20px; border: 1px solid rgba(6, 182, 212, 0.25); background: rgba(2, 4, 6, 0.3);">
      <h3>🚀 Senior Full-Stack Developer, UI/UX Designer & AI Engineer</h3>
      <p>
        I do not just build software; I engineer the future. I combine strict cryptographic security, robust cloud scalability, and modern AI orchestration with premium, visually breathtaking frontends to create memorable digital experiences.
      </p>
      <h4>Core Expertises:</h4>
      <ul>
        <li><strong>Frontend</strong>: Next.js (App Router, RSC), React 19, TypeScript, Tailwind CSS v4, Framer Motion.</li>
        <li><strong>Backend & Security</strong>: Supabase, PostgreSQL (RLS), Node.js, RESTful & RPC APIs, Secure RBAC.</li>
      </ul>
      <h4>Get in Touch:</h4>
      <p>
        <a href="mailto:irnk.codes@proton.me"><img src="https://img.shields.io/badge/Email-irnk.codes%40proton.me-blue?style=flat-square&logo=protonmail&logoColor=white&color=6d4aff" alt="Email" /></a>
        <a href="https://wa.me/6285800644055"><img src="https://img.shields.io/badge/WhatsApp-%2B62%20858--0064--4055-green?style=flat-square&logo=whatsapp&logoColor=white&color=25d366" alt="WhatsApp" /></a>
        <a href="https://github.com/idugeni"><img src="https://img.shields.io/badge/GitHub-idugeni-black?style=flat-square&logo=github&logoColor=white&color=181717" alt="GitHub" /></a>
        <a href="https://www.instagram.com/eliyantosarage_/"><img src="https://img.shields.io/badge/Instagram-eliyantosarage__-pink?style=flat-square&logo=instagram&logoColor=white&color=e4405f" alt="Instagram" /></a>
      </p>
    </td>
  </tr>
</table>

---

<p align="center">
  Developed with ⚡ by <strong><a href="https://idugeni.github.io">Eliyanto Sarage</a></strong> · Wonosobo, Central Java, Indonesia.
</p>
