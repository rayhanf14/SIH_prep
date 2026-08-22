import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function DashboardView() {
  const [metrics, setMetrics] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  useEffect(() => {
    // Load fresh statistics from Mock DB
    const docs = MockDB.getDocuments();
    const sources = MockDB.getSources();
    const logs = MockDB.getAuditLogs();
    
    const needsReview = docs.filter(d => d.status === 'needs_review').length;
    const activeSources = sources.filter(s => s.status === 'CONNECTED').length;
    const totalSources = sources.length;
    const health = `${((activeSources / totalSources) * 100).toFixed(0)}%`;
    
    setMetrics({
      total_ingested: docs.length,
      in_review: needsReview,
      system_health: health,
      avg_processing: '4.2s'
    });
    setAuditLogs(logs);
  }, []);

  const handleFilterChange = (e) => {
    setActionFilter(e.target.value);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const getUniqueActions = () => {
    const actions = auditLogs.map(log => {
      // Get base action type (split on space if needed)
      return log.action;
    });
    return ['ALL', ...new Set(actions)];
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>KMRL Document Intelligence Control Panel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Real-time overview of document ingestion, routing, and processing audits.</p>
        </div>
        <div className="badge badge-medium" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', marginRight: '0.5rem', animation: 'fadeIn 1s infinite alternate' }}></span>
          System Live
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="dashboard-grid">
        <div className="glass-card">
          <div className="metric-header">Total Ingested</div>
          <div className="metric-value">{metrics.total_ingested}</div>
          <div className="metric-sub">
            <span className="text-green">↑ Active ingestion pipelines</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">In Review Queue</div>
          <div className="metric-value text-amber">{metrics.in_review}</div>
          <div className="metric-sub">
            <span className="text-amber">● Needs Human-in-the-Loop</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">Connector Health</div>
          <div className="metric-value text-cyan">{metrics.system_health}</div>
          <div className="metric-sub">
            <span>Active vs Total channels</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">Avg OCR Latency</div>
          <div className="metric-value">{metrics.avg_processing}</div>
          <div className="metric-sub">
            <span className="text-green">✔ Under 5.0s target</span>
          </div>
        </div>
      </div>

      {/* Analytics Visuals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <h3 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Volume by Department</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { name: 'Operations', count: 4, pct: 40, color: 'var(--accent-primary)' },
              { name: 'Safety', count: 3, pct: 30, color: 'var(--accent-amber)' },
              { name: 'Procurement', count: 2, pct: 20, color: 'var(--accent-rose)' },
              { name: 'Civil Engineering', count: 1, pct: 10, color: 'var(--accent-cyan)' }
            ].map(dept => (
              <div key={dept.name}>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{dept.name}</span>
                  <span style={{ fontWeight: 600 }}>{dept.count} documents</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${dept.pct}%`, height: '100%', background: dept.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Confidence Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            {[
              { label: 'High Confidence (&gt;90% accuracy)', count: '78%', color: 'var(--accent-green)', val: 78 },
              { label: 'Moderate Confidence (80%-90%)', count: '14%', color: 'var(--accent-amber)', val: 14 },
              { label: 'Action Flag / Low Confidence (&lt;80%)', count: '8%', color: 'var(--accent-rose)', val: 8 }
            ].map(group => (
              <div key={group.label}>
                <div className="flex-between" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{group.label}</span>
                  <span style={{ fontWeight: 600, color: group.color }}>{group.count}</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${group.val}%`, height: '100%', background: group.color, borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log / Event Timeline */}
      <div className="glass-card">
        <div className="flex-between mb-2">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>System Audit Logs</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Traceability and access auditing record for compliance audits.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              className="form-control" 
              style={{ width: '180px', padding: '0.5rem' }} 
              value={actionFilter} 
              onChange={handleFilterChange}
            >
              {getUniqueActions().map(act => (
                <option key={act} value={act}>{act === 'ALL' ? 'All Operations' : act}</option>
              ))}
            </select>

            <input 
              type="text" 
              placeholder="Search audit trail..." 
              className="form-control" 
              style={{ width: '220px', padding: '0.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="timeline" style={{ marginTop: '1.5rem' }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.log_id} className="timeline-item">
                <div className="timeline-time">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }} className="flex-between">
                    <span>{log.action}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>by user: <strong>{log.username}</strong></span>
                  </div>
                  <div className="timeline-desc" style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {log.details}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlignment: 'center', color: 'var(--text-muted)' }}>
              No audit logs matched your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
