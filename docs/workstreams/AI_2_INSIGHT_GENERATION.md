# AI-2 - Insight Generation

Own `services/ai-orchestration/` task definitions for classification, entity/deadline/action extraction, role-aware cited summaries, and evaluation reports.

Consume AI-1 normalized content only. Output validated structured insights with citations, confidence, abstention, task/model/prompt version, and review reasons. Use the interchange contract so providers/agents are replaceable.

Do not own OCR, retrieval/indexing, notifications, permissions, or UI. Acceptance: each summary claim and action item is anchored, uncertain/sensitive results request review, and the English/Malayalam/bilingual evaluation set is reported.
