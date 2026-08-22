import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function FeedbackView() {
  const [metrics, setMetrics] = useState({});
  const [correctedDocs, setCorrectedDocs] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setMetrics(MockDB.getQualityMetrics());
    
    // Fetch docs that have corrections saved
    const docs = MockDB.getDocuments().filter(d => d.corrections && Object.keys(d.corrections).length > 0);
    setCorrectedDocs(docs);
  }, []);

  const triggerExport = () => {
    setExporting(true);
    
    // Simulate generation of training file JSON
    setTimeout(() => {
      const exportData = correctedDocs.map(doc => ({
        document_id: doc.document_id,
        filename: doc.filename,
        original_metadata: Object.keys(doc.metadata).reduce((acc, key) => {
          acc[key] = doc.metadata[key].value;
          return acc;
        }, {}),
        corrected_metadata: doc.corrections,
        feedback_timestamp: new Date().toISOString()
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kmrl_ai_feedback_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      MockDB.addAuditLog('admin', 'Dataset Export', `Exported AI feedback dataset containing ${correctedDocs.length} correction entries.`);
      setExporting(false);
    }, 1500);
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Feedback & AI Quality Loop</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track discrepancies between AI extractions and human review decisions. Export correction sets to retrain classifiers.</p>
        </div>
        <button 
          className="btn btn-primary" 
          disabled={correctedDocs.length === 0 || exporting}
          onClick={triggerExport}
        >
          {exporting ? 'Generating JSON Package...' : 'Export AI Feedback Dataset'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <div className="metric-header">System Extraction Accuracy</div>
          <div className="metric-value text-green">{metrics.accuracyRate}</div>
          <div className="metric-sub">
            <span>Based on human corrections</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">Total Fields Audited</div>
          <div className="metric-value">{metrics.totalFieldsReviewed}</div>
          <div className="metric-sub">
            <span>Field verifications checked</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">Corrections Logged</div>
          <div className="metric-value text-amber">{metrics.correctionsMade}</div>
          <div className="metric-sub">
            <span>Discrepancies fixed by human</span>
          </div>
        </div>

        <div className="glass-card">
          <div className="metric-header">Post-Review Factuality</div>
          <div className="metric-value text-cyan">{metrics.postReviewConfidence}</div>
          <div className="metric-sub">
            <span>Guaranteed human-checked</span>
          </div>
        </div>
      </div>

      {/* Discrepancies Table */}
      <div className="glass-card">
        <h3 className="mb-2" style={{ fontSize: '1.2rem', fontWeight: 600 }}>Human-in-the-Loop Discrepancy Log</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
          This ledger tracks exactly where human validation modified low-confidence classifications, dates, or values.
        </p>

        <div className="table-container">
          {correctedDocs.length > 0 ? (
            <table className="custom-table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Filename</th>
                  <th>Corrected Field</th>
                  <th>Model Extracted Output</th>
                  <th>Human Corrected Output</th>
                </tr>
              </thead>
              <tbody>
                {correctedDocs.map(doc => (
                  Object.keys(doc.corrections).map(fieldKey => (
                    <tr key={`${doc.document_id}-${fieldKey}`}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{doc.document_id}</td>
                      <td>{doc.filename}</td>
                      <td><code style={{ background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px', color: 'var(--accent-cyan)' }}>{fieldKey}</code></td>
                      <td style={{ color: 'var(--accent-rose)', textDecoration: 'line-through' }}>
                        {doc.metadata[fieldKey] && doc.metadata[fieldKey].value !== null ? doc.metadata[fieldKey].value.toString() : 'null'}
                      </td>
                      <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                        {doc.corrections[fieldKey] !== null ? doc.corrections[fieldKey].toString() : 'null'}
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '3rem', textAlignment: 'center', color: 'var(--text-muted)' }}>
              No corrections have been logged yet. Go to the <strong>Review Queue</strong>, modify metadata on a document, and approve it to see discrepancy metrics record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
