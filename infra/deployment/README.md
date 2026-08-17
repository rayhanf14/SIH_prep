# Deployment Notes

Deploy `services/ingestion` as the Platform Integration API. Replace the in-memory repository and development header authentication before any persistent or production use. Supply a managed database, object storage, queue/dead-letter queue, malware scanner, secret manager, identity provider, and centralized audit log.

The service is stateless except for its repository dependency and can be scaled horizontally once idempotency keys and event storage are backed by shared infrastructure.
