const DEFAULT_RULES = [
  { match: { documentType: 'safety_circular' }, assignedRole: 'safety_reviewer', priority: 'critical' },
  { match: { documentType: 'regulatory_directive' }, assignedRole: 'compliance_reviewer', priority: 'critical' },
  { match: { documentType: 'incident_report' }, assignedRole: 'operations_manager', priority: 'high' },
  { match: { documentType: 'vendor_invoice' }, assignedRole: 'finance_reviewer', priority: 'medium' },
  { match: { documentType: 'purchase_order' }, assignedRole: 'procurement_reviewer', priority: 'medium' },
  { match: { documentType: 'maintenance_job_card' }, assignedRole: 'maintenance_manager', priority: 'high' },
  { match: {} , assignedRole: 'document_reviewer', priority: 'medium' }
];

const priorityRank = { low: 1, medium: 2, high: 3, critical: 4 };

export function routeInsight({ documentType, riskLevel = 'low', deadline, reviewRequired = false }, rules = DEFAULT_RULES) {
  const rule = rules.find(({ match }) => Object.entries(match).every(([key, value]) => value === ({ documentType })[key])) ?? rules.at(-1);
  const riskPriority = riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'high' : 'low';
  const priority = priorityRank[riskPriority] > priorityRank[rule.priority] ? riskPriority : rule.priority;
  const dueAt = deadline ?? (priority === 'critical' ? new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() : null);
  return { assignedRole: rule.assignedRole, priority, dueAt, requiresHumanReview: reviewRequired || priority === 'critical' || priority === 'high' };
}

export { DEFAULT_RULES };
