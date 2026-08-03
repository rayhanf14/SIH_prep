# AI Agent and Provider Interchange Contract

## Purpose

AI components may be swapped without changing the product plan, user experience, or downstream services. “Agent” here means any model/provider/workflow that performs extraction, classification, summarization, translation, retrieval assistance, or routing recommendation.

## Non-negotiable boundary

Agents receive a versioned `ProcessingRequest` and return a versioned `ProcessingResult`; they do not write directly to the product database, send notifications, alter source systems, or decide access permissions. A deterministic orchestration layer validates results and handles persistence/routing.

## Required request context

- document and version IDs; content blocks with page/cell anchors; source language segments
- task name and schema version; user role and authorized scope; department taxonomy version
- source-preservation rule; citation requirement; safety/regulatory/financial sensitivity flags
- allowed tools/retrieval collection IDs; time and token budget; idempotency key

## Required result contract

- structured output matching the task schema; no untyped prose-only result
- source anchors for every material claim, action, deadline, and amount
- confidence per field plus overall confidence and reason codes
- model/provider, prompt/workflow, retrieval index, and processing version metadata
- abstention/review-required flag when evidence is weak, conflicting, unavailable, or sensitive

## Swapping procedure

1. Implement the adapter behind the unchanged contract.
2. Run the fixed evaluation set in `data/evaluation/` for English, Malayalam, bilingual, scan, table, and safety/regulatory cases.
3. Compare citation coverage, factuality, extraction accuracy, latency, cost, abstention behavior, and policy violations to the baseline.
4. Release behind a feature flag with full request/result telemetry and rollback to the previous adapter.

## Prohibited behavior

- Inventing citations or treating retrieved snippets as authoritative without source anchors.
- Sending sensitive content to an unapproved provider.
- Translating away ambiguity in legal, safety, or regulatory text.
- Auto-closing routing/review tasks or performing external actions.
