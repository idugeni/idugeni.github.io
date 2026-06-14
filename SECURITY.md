# Security Policy

## Supported Versions

We actively monitor and provide security updates for the following versions of **IRNK Codes**:

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

---

## Our Security Commitment

**IRNK Codes** is engineered with a strict security-by-default posture:
- **Role-Based Access Control (RBAC)**: All administrative Server Actions and endpoints are wrapped in whitelist email verifications (`ADMIN_EMAILS`) via centralized middlewares (`requireAdmin()`).
- **Database Row-Level Security (RLS)**: Fine-grained RLS policies are applied to all PostgreSQL tables, ensuring public users have read-only access where appropriate, and authentication/write policies are strictly enforced for database integrity.
- **XSS Mitigation**: Strict sanitization of dynamic HTML blog articles and inputs is executed server-side via custom HTML parsers with restricted tags (`lib/security/sanitize-html.ts`).
- **SSRF & Threat Mitigation**: Rate-limiting constraints and scraping telemetry algorithms are deployed at proxy levels (`proxy.ts` / Next.js Edge Middlewares) to mitigate denial-of-service (DoS) attempts and scraping bots.

---

## Reporting a Vulnerability

If you discover a security vulnerability within this repository or the live application, **please do not open a public GitHub issue**. Instead, report it privately to ensure we can resolve the concern before public exposure.

1. **Email Your Findings**: Send a detailed security report to [irnk.codes@proton.me](mailto:irnk.codes@proton.me).
2. **Include Details**:
   - Description of the vulnerability and potential impact.
   - Step-by-step instructions or a proof-of-concept (PoC) script to reproduce the vulnerability.
   - Any suggested mitigations or patches.

### Vulnerability Response Process

We take all security concerns seriously. Once a report is submitted, we will follow this process:

- **Acknowledgement**: You will receive an email confirmation of your report within 24 to 48 hours.
- **Evaluation**: Our team will investigate the report and determine the impact and severity.
- **Fix & Deployment**: If validated, we will develop a patch, test it against our test matrices, and deploy the fix directly to production.
- **Disclosure**: We will coordinate with you regarding the public disclosure of the vulnerability, if appropriate.

Thank you for helping keep **IRNK Codes** secure!
