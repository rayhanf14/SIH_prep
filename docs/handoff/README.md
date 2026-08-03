# Developer Handoff

## Start here

1. Read `../IMPLEMENTATION_PLAN.md` and `../architecture/AI_AGENT_INTERCHANGE.md`.
2. Read your workstream file under `../workstreams/`.
3. Propose only contract changes through `packages/api-contracts/`, `packages/types/`, or `packages/prompt-contracts/`; record the version and migration note.
4. Use redacted fixtures and manifests only. Never commit operational KMRL documents or credentials.

## How the six streams stay independent

- Each owner works inside the folders named in their workstream brief.
- Consume agreed API examples/mocks, never another developer's private database or implementation internals.
- Add contract tests to `tests/contracts/` for every cross-team interface.
- Publish a short changelog entry for any contract change: owner, version, compatibility, and mock update.

## Required cross-team checkpoints

| Checkpoint | Deliverable | Participants |
| --- | --- | --- |
| Contract freeze | document, extraction, insight, search, routing schemas | all six |
| Vertical slice | upload to cited summary, search, review queue | AI-1, AI-2, AI-3, Web-1, Web-2, Web-3 |
| Safety review | risk taxonomy, thresholds, human-review paths | AI-2, AI-3, Web-2, Web-3 |
| Pilot readiness | security, monitoring, evaluation, rollback runbook | all six |

## Definition of done for every workstream

- Contract validated and backward-compatibility noted.
- Happy path, failure path, and permission-denied path demonstrated with redacted fixtures.
- Telemetry/audit fields defined.
- User-facing text distinguishes source facts from generated interpretation.
- Ownership and support notes updated in the workstream brief.
