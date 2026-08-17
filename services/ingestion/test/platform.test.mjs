import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { createPlatformApp } from '../src/app.mjs';

async function platform() {
  const server = createServer(createPlatformApp({ now: () => '2026-08-17T09:00:00.000Z' }));
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, close: () => new Promise((resolve) => server.close(resolve)) };
}
const headers = (roles, extra = {}) => ({ 'content-type': 'application/json', 'x-user-id': 'user-1', 'x-user-roles': roles, ...extra });

test('registers a document, routes a safety result, and records a review decision', async () => {
  const app = await platform();
  try {
    const registration = await fetch(`${app.base}/v1/documents`, { method: 'POST', headers: headers('ingest:write,documents:read,department:safety', { 'idempotency-key': 'upload-1' }), body: JSON.stringify({ title: 'Track safety circular', documentType: 'safety_circular', department: 'safety', source: { type: 'sharepoint', reference: 'sharepoint://safety/42.pdf' }, languages: ['en', 'ml'] }) });
    assert.equal(registration.status, 201); const document = (await registration.json()).document;
    const processed = await fetch(`${app.base}/v1/documents/${document.id}/processing-results`, { method: 'POST', headers: headers('ai:write'), body: JSON.stringify({ riskLevel: 'high', reviewRequired: true, citations: [{ page: 1, text: 'Action before shift starts.' }] }) });
    assert.equal(processed.status, 201); const task = (await processed.json()).task; assert.equal(task.assignedRole, 'safety_reviewer');
    const decision = await fetch(`${app.base}/v1/review-tasks/${task.id}/decision`, { method: 'POST', headers: headers('review:write,safety_reviewer'), body: JSON.stringify({ decision: 'approved', rationale: 'Verified against page one.' }) });
    assert.equal(decision.status, 200); assert.equal((await decision.json()).task.status, 'approved');
    const audit = await fetch(`${app.base}/v1/audit-events`, { headers: headers('audit:read') }); assert.equal((await audit.json()).events.length, 5);
  } finally { await app.close(); }
});

test('requires a stable idempotency key and restricts cross-department reads', async () => {
  const app = await platform();
  try {
    const rejected = await fetch(`${app.base}/v1/documents`, { method: 'POST', headers: headers('ingest:write'), body: JSON.stringify({ title: 'Invoice', documentType: 'vendor_invoice', source: { type: 'email', reference: 'mail://1' } }) }); assert.equal(rejected.status, 400);
    const registered = await fetch(`${app.base}/v1/documents`, { method: 'POST', headers: headers('ingest:write', { 'idempotency-key': 'invoice-1' }), body: JSON.stringify({ title: 'Invoice', documentType: 'vendor_invoice', department: 'finance', source: { type: 'email', reference: 'mail://1' } }) }); const document = (await registered.json()).document;
    const response = await fetch(`${app.base}/v1/documents/${document.id}`, { headers: headers('documents:read,department:engineering') }); assert.equal(response.status, 403);
  } finally { await app.close(); }
});
