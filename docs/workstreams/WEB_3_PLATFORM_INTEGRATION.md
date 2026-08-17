# Web-3 - Platform Integration

Own `services/ingestion/`, `services/notification-routing/`, and `infra/` contracts for authentication, authorization, observability, deployment, connector health, and audit events. The current runnable MVP is implemented in these folders using Node's built-in HTTP runtime and native test runner.

Deliver controlled ingestion interfaces/adapters, malware/idempotency/error handling, event publication, workflow/routing rules execution, review-task notifications, RBAC enforcement integration, and operational telemetry.

Do not implement OCR/AI task internals, search ranking, or UI. Acceptance: a source document travels through an auditable, retry-safe path to the processing pipeline and an approved role receives a reviewable routed task.

## Run locally

Run `node services/ingestion/src/server.mjs` from the repository root, then use the development headers `X-User-Id` and `X-User-Roles`. The header scheme is intentionally development-only; replace it with KMRL's approved identity provider before deployment. Run `node --test services/ingestion/test/*.test.mjs services/notification-routing/test/*.test.mjs` to validate the platform slice.
