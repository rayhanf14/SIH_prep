import { randomUUID } from 'node:crypto';

export class InMemoryRepository {
  constructor() {
    this.documents = new Map();
    this.tasks = new Map();
    this.events = [];
    this.idempotency = new Map();
  }

  addDocument(document, idempotencyKey) {
    if (idempotencyKey && this.idempotency.has(idempotencyKey)) return { record: this.documents.get(this.idempotency.get(idempotencyKey)), replayed: true };
    this.documents.set(document.id, document);
    if (idempotencyKey) this.idempotency.set(idempotencyKey, document.id);
    return { record: document, replayed: false };
  }

  getDocument(id) { return this.documents.get(id); }
  listDocuments() { return [...this.documents.values()]; }
  addTask(task) { this.tasks.set(task.id, task); return task; }
  getTask(id) { return this.tasks.get(id); }
  listTasks() { return [...this.tasks.values()]; }
  addEvent({ type, actor, documentId = null, taskId = null, data = {} }) {
    const event = { id: randomUUID(), type, actor, documentId, taskId, data, occurredAt: new Date().toISOString() };
    this.events.push(event);
    return event;
  }
  listEvents() { return [...this.events]; }
}
