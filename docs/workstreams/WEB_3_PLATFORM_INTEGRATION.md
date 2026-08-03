# Web-3 - Platform Integration

Own `services/ingestion/`, `services/notification-routing/`, and `infra/` contracts for authentication, authorization, observability, deployment, connector health, and audit events.

Deliver controlled ingestion interfaces/adapters, malware/idempotency/error handling, event publication, workflow/routing rules execution, review-task notifications, RBAC enforcement integration, and operational telemetry.

Do not implement OCR/AI task internals, search ranking, or UI. Acceptance: a source document travels through an auditable, retry-safe path to the processing pipeline and an approved role receives a reviewable routed task.
