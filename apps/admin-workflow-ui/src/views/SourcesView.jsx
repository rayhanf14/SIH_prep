import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function SourcesView() {
  const [sources, setSources] = useState([]);
  const [loadingSource, setLoadingSource] = useState(null);

  const loadSources = () => {
    setSources(MockDB.getSources());
  };

  useEffect(() => {
    loadSources();
  }, []);

  const simulateTest = (source_id) => {
    setLoadingSource(source_id);
    
    // Simulate connection ping latency
    setTimeout(() => {
      // Toggle statuses for demo interactivity
      const current = MockDB.getSources().find(s => s.source_id === source_id);
      let nextStatus = 'CONNECTED';
      if (current.status === 'CONNECTED') {
        nextStatus = 'WARNING';
      } else if (current.status === 'WARNING') {
        nextStatus = 'DISCONNECTED';
      } else {
        nextStatus = 'CONNECTED';
      }
      
      MockDB.updateSourceStatus(source_id, nextStatus);
      setLoadingSource(null);
      loadSources();
    }, 1200);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONNECTED':
        return <span className="badge badge-status-approved">Online</span>;
      case 'WARNING':
        return <span className="badge badge-status-needs_review">Warning</span>;
      case 'DISCONNECTED':
      default:
        return <span className="badge badge-critical">Offline</span>;
    }
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Source Connectors Configuration</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage documents ingestion feeds. Monitor polling status, credentials, and API connection latency.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {sources.map(source => (
          <div className="glass-card" key={source.source_id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}>
            <div>
              {/* Header */}
              <div className="flex-between mb-1">
                <span className="badge badge-low" style={{ letterSpacing: '0.5px' }}>{source.connector_type} Feed</span>
                {getStatusBadge(source.status)}
              </div>
              
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0.5rem 0' }}>{source.name}</h3>
              
              {/* Configuration parameters */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)', margin: '0.75rem 0' }}>
                {Object.keys(source.config).map(key => (
                  <div key={key} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: 'var(--accent-cyan)' }}>{key}:</span> {source.config[key].toString()}
                  </div>
                ))}
              </div>
            </div>

            {/* Performance telemetry */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginBottom: '1rem' }}>
                <span>Last Polled: {source.last_polled !== 'Never' ? new Date(source.last_polled).toLocaleTimeString() : 'Never'}</span>
                <span>Latency: <strong className={source.latency_ms > 1000 ? 'text-amber' : 'text-green'}>{source.latency_ms}ms</strong></span>
              </div>

              {/* Action trigger */}
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={loadingSource === source.source_id}
                onClick={() => simulateTest(source.source_id)}
              >
                {loadingSource === source.source_id ? (
                  <span>Testing credentials...</span>
                ) : (
                  <span>Test Connection Status</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
