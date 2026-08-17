import assert from 'node:assert/strict';
import test from 'node:test';
import { routeInsight } from '../src/routingRules.mjs';

test('a regulatory directive is always critically routed', () => {
  const route = routeInsight({ documentType: 'regulatory_directive', riskLevel: 'medium', reviewRequired: false });
  assert.equal(route.assignedRole, 'compliance_reviewer');
  assert.equal(route.priority, 'critical');
  assert.equal(route.requiresHumanReview, true);
});
