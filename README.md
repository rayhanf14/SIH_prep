# KMRL Document Intelligence Platform

Planning scaffold for a platform that ingests KMRL business documents, extracts trustworthy information, creates role-aware summaries, enables traceable search, and routes time-sensitive actions.

This repository deliberately contains no application code. Start with [the implementation plan](docs/IMPLEMENTATION_PLAN.md), then use [the developer handoff](docs/handoff/README.md).

## Repository map

- `apps/` - employee portal and administrative user interfaces.
- `services/` - independently deployable backend capabilities.
- `packages/` - shared UI, types, API, and prompt contracts.
- `data/` - schemas, evaluation sets, and source manifests; never production documents.
- `infra/` - deployment, containers, observability, and access-control definitions.
- `tests/` - contract, evaluation, and redacted fixture material.
- `docs/` - decisions, workstream handoffs, and operating documentation.

## Guardrails

- Preserve the original document and immutable version identifier for every derived result.
- Treat all generated content as assistive; show source citations and confidence to users.
- Do not put production documents, personal data, secrets, or credentials in this repository.
- Use English and Malayalam as first-class supported languages; allow a document to mix both.
