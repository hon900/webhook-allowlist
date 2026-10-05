# Changelog

## 2.1.0 — 2026-10-05

- Adopt hostfence 1.3.0 destination-policy hardening and standalone CI.
- Forward the complete hostfence policy while keeping webhook URL credentials
  forbidden.
- Add `guard.check` for structured decisions alongside the existing `validate` API.
- Add TypeScript declarations and offline tests for policy forwarding, mixed trust
  boundaries, credentials, and malformed input.
- Document validation on every delivery attempt and the DNS preflight boundary.
