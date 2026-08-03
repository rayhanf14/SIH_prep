# AI-1 - Document Intelligence

Own `services/document-processing/`, extraction schemas in `packages/types/`, extraction task contracts in `packages/prompt-contracts/`, and extraction evaluation fixtures.

Deliver normalized content blocks for PDFs, scans, Office files, spreadsheets, images, and Maximo exports; page/cell anchors; OCR/layout/table outputs; English/Malayalam/mixed-language identification; source and extraction confidence; idempotent reprocessing.

Do not own summarization, embeddings/search, user access, connectors, or UI. Publish `DocumentExtracted` contract and error/retry states. Acceptance: a consumer can reproduce every content block from the immutable original and anchor it to a page/cell.
