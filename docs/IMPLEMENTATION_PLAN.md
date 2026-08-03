# Implementation Plan - KMRL Document Intelligence Platform

## 1. Outcome

Give each KMRL stakeholder a fast, trustworthy view of the documents relevant to their role while preserving a direct path to the original source. The first release covers controlled ingestion, extraction from native and scanned English/Malayalam/bilingual documents, summaries with citations, search, action routing, and auditability.

## 2. Product scope

### Primary users

Station and operations controllers, rolling-stock and civil engineers, maintenance managers, procurement and finance officers, HR and safety teams, legal/compliance staff, and executive leadership.

### Document inputs

Email attachments, Maximo exports, SharePoint files, WhatsApp PDFs, manually uploaded scans, and approved cloud links. Typical formats are PDF, Office documents, image scans, spreadsheets, and structured exports.

### MVP capabilities

1. Register and ingest a document with source, owner, classification, checksum, timestamps, and immutable original storage reference.
2. Extract text, layout, tables, language segments, and page-level anchors. OCR scans and retain extraction confidence.
3. Classify document type, department, priority, regulatory relevance, entities, dates/deadlines, monetary values, assets, and action items.
4. Produce short role-aware summaries in the document's language where possible, with original-page citations, confidence, and an explicit “needs review” state.
5. Search documents and extracted knowledge with filters for department, date, source, document type, risk, and language.
6. Route high-priority regulatory, safety, operational, procurement, and finance actions to an accountable role; provide a review queue instead of automatic final decisions.
7. Provide an admin console for source configuration, taxonomies, user roles, routing rules, feedback, and audit history.

### Deferred after MVP

Automatic external filing or payment, automatic alteration of Maximo/SharePoint records, autonomous legal/compliance determinations, and training on unapproved sensitive documents.

## 3. Reference architecture

`Source connectors -> Ingestion -> Original document store -> Processing/OCR -> AI orchestration -> Search index + structured metadata -> Portal/Admin UI -> Notification routing`

Every derived object must carry `document_id`, `document_version_id`, source-page or source-cell anchors, processing version, model/provider identifier, timestamp, and confidence. The original file is authoritative.

## 4. Shared delivery rules

- Contract-first: agree JSON schemas and API examples before implementation.
- Event-driven integration: services publish versioned domain events; consumers must tolerate unknown fields.
- Human-in-the-loop: low-confidence, safety, regulatory, financial, and legal outputs go to review.
- Security by design: RBAC, encrypted storage/transit, least privilege, audit logs, retention policy, malware scan, and PII-sensitive access controls.
- Multilingual fidelity: do not silently translate legal/safety language; retain the source span and label translated content.
- Observability: record latency, failure reason, extraction/model version, citations, feedback, and reviewer disposition.

## 5. Independent work allocation (six developers)

| Developer | Track | Owns | Depends on | Provides |
| --- | --- | --- | --- | --- |
| AI-1 | Document intelligence | OCR/layout pipeline, language detection, table/page anchors, extraction confidence | canonical document schema | normalized extraction package |
| AI-2 | Insight generation | classification, entity/deadline/action extraction, cited role-aware summaries, evaluation harness | normalized extraction package | structured insights and summary package |
| AI-3 | Retrieval and safety | embeddings/indexing, hybrid search, permission-aware retrieval, policy/risk guardrails, agent adapter | canonical schemas | retrieval and AI gateway contracts |
| Web-1 | Employee portal | document inbox, role dashboard, reader, summary/citation view, search results | API contracts and design tokens | portal UI |
| Web-2 | Admin and workflow UI | source configuration, taxonomies, routing rules, review queues, feedback, audit viewer | API contracts and roles | admin console UI |
| Web-3 | Platform integration | ingestion APIs/connectors, workflow/routing service, auth/RBAC integration, deployment/observability contracts | canonical schemas | backend integration services |

No developer owns another track's internal implementation. Cross-track collaboration occurs only through the contract package and published mock examples.

## 6. Milestones

### M0 - Foundations (week 1)

- Freeze canonical schemas, taxonomy, roles, acceptance scenarios, and sample manifest.
- Build contract stubs/mocks only; no shared database coupling.

### M1 - Vertical slice (weeks 2-3)

- One controlled upload path, PDF/scan extraction, one cited summary, one search result, one review decision, and audit event.
- Demonstrate English, Malayalam, and mixed-language examples.

### M2 - Operational MVP (weeks 4-6)

- Add approved connectors, routing rules, role dashboards, review queues, search filters, resiliency, monitoring, and evaluation reporting.

### M3 - Pilot hardening (weeks 7-8)

- Security review, retention/access validation, load tests, human accuracy review, user acceptance, runbook, and rollback rehearsal.

## 7. Acceptance criteria

- A user can open any generated summary and navigate to its original document/page evidence.
- Scan/OCR and AI confidence are visible; uncertain outputs are not presented as fact.
- A safety or regulatory directive with a deadline appears in the proper review/routing queue and has an audit trail.
- Search respects the user's department/role permissions and returns the correct document version.
- English, Malayalam, and bilingual test documents complete without dropping source text or citations.
- Reprocessing a document does not overwrite earlier result versions.

## 8. Key risks and controls

| Risk | Control |
| --- | --- |
| Hallucinated or incomplete summary | required citations, factuality evaluation, confidence thresholds, reviewer queue |
| OCR errors in Malayalam/scans | document-quality score, language-specific test set, page-image fallback, manual correction path |
| Sensitive data leakage | RBAC enforced before retrieval, tenant/department filters, audit logs, no public model training by default |
| Connector instability | idempotency keys, retries/dead-letter queue, source health dashboard |
| Unclear accountability | routing rules by document type/risk and named role, escalation SLA |

Read [AI interchange rules](architecture/AI_AGENT_INTERCHANGE.md) before selecting or changing an AI agent/provider.
