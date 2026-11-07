# Security Policy

## Supported Versions

Security updates and patches are actively applied to the following versions of FinAI:

| Version | Supported          |
| :------ | :----------------- |
| `1.x`   | :white_check_mark: |
| `< 1.0` | :x:                |

## Reporting a Vulnerability

The Yuva DevLab engineering team takes the security of our platforms and user data seriously. If you believe you have discovered a security vulnerability in FinAI, please report it responsibly following the guidelines below:

1. **Do not create a public GitHub Issue.** Public disclosure puts users and systems at risk.
2. Email your vulnerability report to **`yuva.devlab@gmail.com`** (or report privately via [GitHub Private Vulnerability Reporting](https://github.com/yuvadevlab/fin-ai/security/advisories/new)).
3. Please include the following details in your report:
   - Type of vulnerability (e.g., SSRF, SQL Injection, Privilege Escalation, SSO Token Bypass).
   - Step-by-step instructions or Proof of Concept (PoC) scripts to reproduce the issue.
   - Affected packages or endpoints (`apps/api`, `apps/web`, or `packages/*`).
   - Potential impact on users or tenant data.

## Response SLA

- **Acknowledgment:** Within 48 hours of receipt.
- **Initial Assessment & Severity Triage:** Within 5 business days.
- **Remediation & Patch Release:** Critical vulnerabilities are prioritized with hotfixes deployed within 7 business days.
- **Public Disclosure:** Coordinated disclosure after patches have been verified and applied to production.

## Security Controls & Invariants

FinAI enforces multiple defense-in-depth architectural security boundaries:

- **Asymmetric Cryptography:** Cross-application Single Sign-On (SSO) tokens are cryptographically signed using RS256 private/public key pairs.
- **Loop & Rate-Limit Guards:** Client and middleware safeguards prevent automated redirection loops and session bounce exhaustion.
- **Privacy Mode Masking:** PII and monetary figures are masked in memory and on UI views when privacy mode is enabled.
- **Input Sanitization:** All API endpoints and client inputs are strictly validated at the boundary using Zod and class-validator DTOs.
