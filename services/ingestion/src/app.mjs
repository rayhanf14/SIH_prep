import { createHash, randomUUID } from 'node:crypto';
import { routeInsight } from '../../notification-routing/src/routingRules.mjs';
import { InMemoryRepository } from './repository.mjs';

const DOCUMENT_TYPES = new Set(['engineering_drawing', 'maintenance_job_card', 'incident_report', 'vendor_invoice', 'purchase_order', 'regulatory_directive', 'environmental_study', 'safety_circular', 'hr_policy', 'legal_opinion', 'board_minutes', 'other']);
const RISK_LEVELS = new Set(['low', 'medium', 'high', 'critical']);

function json(res, status, body) { res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); }
function error(res, status, code, message) { json(res, status, { error: { code, message } }); }
function actor(req) {
  const id = req.headers['x-user-id'];
  const roles = String(req.headers['x-user-roles'] ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  return id ? { id, roles } : null;
}
function authorize(res, currentActor, role) {
  if (!currentActor) { error(res, 401, 'unauthenticated', 'Send X-User-Id and X-User-Roles headers.'); return false; }
  if (!currentActor.roles.includes(role) && !currentActor.roles.includes('platform_admin')) { error(res, 403, 'forbidden', `Role ${role} is required.`); return false; }
  return true;
}
async function readBody(req) {
  let data = ''; for await (const chunk of req) { data += chunk; if (data.length > 1_000_000) throw new Error('Request body is too large.'); }
  return data ? JSON.parse(data) : {};
}
function pathMatch(pathname, pattern) { const match = pathname.match(pattern); return match ? decodeURIComponent(match[1]) : null; }

export function createPlatformApp({ repository = new InMemoryRepository(), now = () => new Date().toISOString() } = {}) {
  const stats = { requests: 0, errors: 0, registered: 0, routed: 0 };
  return async function app(req, res) {
    stats.requests += 1;
    const url = new URL(req.url, 'http://localhost');
    const currentActor = actor(req);
    try {
      if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { status: 'ok', service: 'platform-integration', time: now() });
      if (req.method === 'GET' && url.pathname === '/metrics') return json(res, 200, { ...stats, auditEvents: repository.listEvents().length });

      if (req.method === 'POST' && url.pathname === '/v1/documents') {
        if (!authorize(res, currentActor, 'ingest:write')) return;
        const body = await readBody(req);
        if (!body.title || !body.source?.type || !body.source?.reference || !DOCUMENT_TYPES.has(body.documentType)) return error(res, 400, 'invalid_document', 'title, supported documentType, source.type, and source.reference are required.');
        const idempotencyKey = req.headers['idempotency-key'];
        if (!idempotencyKey) return error(res, 400, 'idempotency_key_required', 'Idempotency-Key header is required.');
        const versionId = randomUUID();
        const document = {
          id: randomUUID(), versionId, title: body.title, documentType: body.documentType, department: body.department ?? 'unassigned', classification: body.classification ?? 'internal', languages: body.languages ?? ['en'], source: body.source,
          checksum: body.checksum ?? createHash('sha256').update(body.source.reference).digest('hex'), status: 'queued', receivedAt: now(), createdBy: currentActor.id, immutableSource: true
        };
        const { record, replayed } = repository.addDocument(document, idempotencyKey);
        if (!replayed) { repository.addEvent({ type: 'DocumentRegistered', actor: currentActor.id, documentId: record.id, data: { versionId: record.versionId, sourceType: record.source.type } }); repository.addEvent({ type: 'DocumentQueued', actor: 'platform', documentId: record.id, data: { versionId: record.versionId } }); stats.registered += 1; }
        return json(res, replayed ? 200 : 201, { document: record, replayed });
      }

      if (req.method === 'GET' && url.pathname === '/v1/documents') {
        if (!authorize(res, currentActor, 'documents:read')) return;
        return json(res, 200, { documents: repository.listDocuments().filter((d) => currentActor.roles.includes('platform_admin') || currentActor.roles.includes(`department:${d.department}`)) });
      }
      const documentId = pathMatch(url.pathname, /^\/v1\/documents\/([^/]+)$/);
      if (req.method === 'GET' && documentId) {
        if (!authorize(res, currentActor, 'documents:read')) return;
        const document = repository.getDocument(documentId); if (!document) return error(res, 404, 'not_found', 'Document not found.');
        if (!currentActor.roles.includes('platform_admin') && !currentActor.roles.includes(`department:${document.department}`)) return error(res, 403, 'forbidden', 'You are not allowed to access this document.');
        return json(res, 200, { document });
      }
      const insightDocumentId = pathMatch(url.pathname, /^\/v1\/documents\/([^/]+)\/processing-results$/);
      if (req.method === 'POST' && insightDocumentId) {
        if (!authorize(res, currentActor, 'ai:write')) return;
        const document = repository.getDocument(insightDocumentId); if (!document) return error(res, 404, 'not_found', 'Document not found.');
        const body = await readBody(req);
        if (!RISK_LEVELS.has(body.riskLevel ?? 'low') || !Array.isArray(body.citations) || body.citations.length === 0) return error(res, 400, 'invalid_processing_result', 'riskLevel and at least one source citation are required.');
        const routing = routeInsight({ documentType: document.documentType, riskLevel: body.riskLevel, deadline: body.deadline, reviewRequired: body.reviewRequired });
        document.status = routing.requiresHumanReview ? 'review_required' : 'processed'; document.processingResult = { ...body, processedAt: now(), processor: currentActor.id };
        repository.addEvent({ type: 'ProcessingResultReceived', actor: currentActor.id, documentId: document.id, data: { riskLevel: body.riskLevel, citationCount: body.citations.length } });
        let task = null;
        if (routing.requiresHumanReview) { task = repository.addTask({ id: randomUUID(), documentId: document.id, documentVersionId: document.versionId, status: 'open', assignedRole: routing.assignedRole, priority: routing.priority, dueAt: routing.dueAt, createdAt: now(), reason: body.reviewReason ?? `${body.riskLevel} risk processing output`, sourceAnchors: body.citations }); repository.addEvent({ type: 'ReviewTaskCreated', actor: 'platform', documentId: document.id, taskId: task.id, data: routing }); stats.routed += 1; }
        return json(res, 201, { documentId: document.id, status: document.status, task, routing });
      }

      if (req.method === 'GET' && url.pathname === '/v1/review-tasks') {
        if (!authorize(res, currentActor, 'review:read')) return;
        const tasks = repository.listTasks().filter((task) => currentActor.roles.includes('platform_admin') || currentActor.roles.includes(task.assignedRole));
        return json(res, 200, { tasks });
      }
      const taskId = pathMatch(url.pathname, /^\/v1\/review-tasks\/([^/]+)\/decision$/);
      if (req.method === 'POST' && taskId) {
        if (!authorize(res, currentActor, 'review:write')) return;
        const task = repository.getTask(taskId); if (!task) return error(res, 404, 'not_found', 'Review task not found.');
        if (!currentActor.roles.includes('platform_admin') && !currentActor.roles.includes(task.assignedRole)) return error(res, 403, 'forbidden', 'You are not assigned to this review task.');
        const body = await readBody(req); if (!['approved', 'rejected', 'escalated'].includes(body.decision) || !body.rationale) return error(res, 400, 'invalid_decision', 'decision (approved, rejected, escalated) and rationale are required.');
        task.status = body.decision; task.decision = { rationale: body.rationale, decidedBy: currentActor.id, decidedAt: now() };
        repository.addEvent({ type: 'ReviewTaskDecided', actor: currentActor.id, documentId: task.documentId, taskId: task.id, data: { decision: body.decision, rationale: body.rationale } });
        return json(res, 200, { task });
      }
      if (req.method === 'GET' && url.pathname === '/v1/audit-events') {
        if (!authorize(res, currentActor, 'audit:read')) return;
        return json(res, 200, { events: repository.listEvents() });
      }
      return error(res, 404, 'not_found', 'Route not found.');
    } catch (exception) { stats.errors += 1; return error(res, exception instanceof SyntaxError ? 400 : 500, 'request_failed', exception.message); }
  };
}
