import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function RoutingRulesView() {
  const [rules, setRules] = useState([]);
  const [taxonomies, setTaxonomies] = useState({ departments: [], documentTypes: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [ruleName, setRuleName] = useState('');
  const [condDept, setCondDept] = useState('Safety');
  const [condDocType, setCondDocType] = useState('Regulatory Directive');
  const [condValue, setCondValue] = useState('');
  const [actionRole, setActionRole] = useState('Safety Director');
  const [actionPriority, setActionPriority] = useState('CRITICAL');

  const loadRules = () => {
    setRules(MockDB.getRoutingRules());
    setTaxonomies(MockDB.getTaxonomies());
  };

  useEffect(() => {
    loadRules();
  }, []);

  const toggleRuleActive = (rule_id) => {
    const currentRules = MockDB.getRoutingRules();
    const updated = currentRules.map(r => {
      if (r.rule_id === rule_id) {
        r.is_active = !r.is_active;
        MockDB.addAuditLog('admin', 'Rule Status Toggle', `Toggled rule '${r.name}' to ${r.is_active ? 'ACTIVE' : 'INACTIVE'}`);
      }
      return r;
    });
    MockDB.saveRoutingRules(updated);
    loadRules();
  };

  const handleDeleteRule = (rule_id) => {
    if (window.confirm("Are you sure you want to delete this routing rule?")) {
      MockDB.deleteRoutingRule(rule_id);
      loadRules();
    }
  };

  const handleCreateRule = (e) => {
    e.preventDefault();
    if (!ruleName.trim()) return;

    const newRule = {
      name: ruleName,
      conditions: {
        department: condDept,
        document_type: condDocType,
        ...(condValue ? { monetary_value_greater_than: parseFloat(condValue) } : {})
      },
      action: {
        route_to_role: actionRole,
        priority_escalation: actionPriority
      },
      is_active: true
    };

    MockDB.addRoutingRule(newRule);
    
    // Reset Form & Close Modal
    setRuleName('');
    setCondValue('');
    setIsModalOpen(false);
    loadRules();
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Routing Rules Engine</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure policies to auto-escalate high-priority directives or route low-confidence classifications to specific stakeholder queues.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Create Routing Rule
        </button>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Trigger Conditions</th>
                <th>Target Escalation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.rule_id}>
                  <td><strong>{rule.name}</strong></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                      {rule.conditions.department && (
                        <span>Department: <strong className="text-cyan">{rule.conditions.department}</strong></span>
                      )}
                      {rule.conditions.document_type && (
                        <span>Doc Type: <strong className="text-indigo">{rule.conditions.document_type}</strong></span>
                      )}
                      {rule.conditions.monetary_value_greater_than && (
                        <span>Value: <strong className="text-rose">&gt; ₹{rule.conditions.monetary_value_greater_than.toLocaleString()}</strong></span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
                      <span>Role: <strong className="text-green">{rule.action.route_to_role}</strong></span>
                      <span>Escalate: <span className={`badge badge-${rule.action.priority_escalation.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{rule.action.priority_escalation}</span></span>
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => toggleRuleActive(rule.rule_id)}
                      className={`btn ${rule.is_active ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', backgroundColor: rule.is_active ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)' }}
                    >
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.25rem 0.5rem', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.2)' }}
                      onClick={() => handleDeleteRule(rule.rule_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Rule Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Routing Rule</h2>
            
            <form onSubmit={handleCreateRule}>
              <div className="form-group">
                <label>Rule Policy Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Finance Audits > ₹10L"
                  required
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Condition: Target Department</label>
                <select 
                  className="form-control"
                  value={condDept}
                  onChange={(e) => setCondDept(e.target.value)}
                >
                  {taxonomies.departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condition: Document Type</label>
                <select 
                  className="form-control"
                  value={condDocType}
                  onChange={(e) => setCondDocType(e.target.value)}
                >
                  {taxonomies.documentTypes.map(dt => (
                    <option key={dt.type} value={dt.type}>{dt.type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condition: Monetary Value Greater Than (INR - Optional)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Leave blank for any value"
                  value={condValue}
                  onChange={(e) => setCondValue(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Action: Target Role</label>
                  <select 
                    className="form-control"
                    value={actionRole}
                    onChange={(e) => setActionRole(e.target.value)}
                  >
                    <option value="Safety Director">Safety Director</option>
                    <option value="Finance Director">Finance Director</option>
                    <option value="Operations Controller">Operations Controller</option>
                    <option value="Chief legal Compliance Officer">Chief Legal & Compliance Officer</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Action: Escalation priority</label>
                  <select 
                    className="form-control"
                    value={actionPriority}
                    onChange={(e) => setActionPriority(e.target.value)}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Activate Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
