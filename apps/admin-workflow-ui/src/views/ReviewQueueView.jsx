import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function ReviewQueueView() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [corrections, setCorrections] = useState({});
  const [notes, setNotes] = useState('');
  const [rerouteRole, setRerouteRole] = useState('Safety Director');

  const loadDocuments = () => {
    const docs = MockDB.getDocuments().filter(d => d.status === 'needs_review');
    setDocuments(docs);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const startReview = (doc) => {
    setSelectedDoc(doc);
    // Initialize corrections with original metadata values
    const initialCorrections = {};
    Object.keys(doc.metadata).forEach(key => {
      initialCorrections[key] = doc.metadata[key].value || '';
    });
    setCorrections(initialCorrections);
    setNotes('');
  };

  const handleCorrectionChange = (key, value) => {
    setCorrections(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const submitReview = (disposition) => {
    if (!selectedDoc) return;
    
    // Save to stateful MockDB
    MockDB.submitDocumentReview(selectedDoc.document_id, {
      corrections: corrections,
      reviewer_disposition: disposition,
      reviewer_notes: notes,
      routed_to_role: disposition === 'RE-ROUTED' ? rerouteRole : null
    });

    // Close view & refresh list
    setSelectedDoc(null);
    loadDocuments();
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'var(--accent-green)';
    if (score >= 80) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  if (selectedDoc) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Detail Top Header Bar */}
        <div className="flex-between mb-2" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <div>
            <button className="btn btn-secondary" onClick={() => setSelectedDoc(null)} style={{ marginRight: '1rem', padding: '0.4rem 0.8rem' }}>
              ← Back to Queue
            </button>
            <strong style={{ fontSize: '1.25rem' }}>Reviewing: {selectedDoc.filename}</strong>
            <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>ID: {selectedDoc.document_id} ({selectedDoc.document_version_id})</span>
          </div>
          <div>
            <span className="badge badge-medium" style={{ marginRight: '0.5rem' }}>{selectedDoc.source}</span>
            <span className={`badge badge-${selectedDoc.priority.toLowerCase()}`}>{selectedDoc.priority}</span>
          </div>
        </div>

        {/* Reason for Review warning alert */}
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <strong>Attention required:</strong> {selectedDoc.review_reason}
        </div>

        {/* Split Screen Layout */}
        <div className="split-viewer">
          {/* Left Side: Document Preview Pane */}
          <div className="doc-preview-pane">
            <div className="doc-preview-header">
              <span>Original Document & Extractions Source</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {selectedDoc.languages.map(lang => (
                  <span key={lang} className="badge badge-low" style={{ fontSize: '0.65rem' }}>{lang}</span>
                ))}
              </div>
            </div>
            <div className="doc-preview-body">
              {/* Malayalam flag warning */}
              {selectedDoc.languages.includes('Malayalam') && (
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  ℹ️ Mixed-language document. Native Malayalam text elements retained in OCR transcript.
                </div>
              )}
              {selectedDoc.extracted_text}
            </div>
          </div>

          {/* Right Side: Metadata fields & Actions Panel */}
          <div className="doc-details-pane">
            <div className="glass-card">
              <h3 className="mb-2" style={{ fontSize: '1.1rem', fontWeight: 600 }}>Extracted Metadata & Confidences</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                Verify and correct fields. Fields edited by human will update to 100% confidence.
              </p>
              
              {/* Editable Fields list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                {/* Department Field */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="flex-between">
                    <label style={{ margin: 0 }}>Department</label>
                    <span style={{ fontSize: '0.75rem', color: getConfidenceColor(selectedDoc.metadata.department.confidence) }}>
                      {selectedDoc.metadata.department.confidence}% confidence
                    </span>
                  </div>
                  <select 
                    className="form-control" 
                    value={corrections.department} 
                    onChange={(e) => handleCorrectionChange('department', e.target.value)}
                    style={{ marginTop: '0.25rem' }}
                  >
                    {MockDB.getTaxonomies().departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Document Type Field */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="flex-between">
                    <label style={{ margin: 0 }}>Document Type</label>
                    <span style={{ fontSize: '0.75rem', color: getConfidenceColor(selectedDoc.metadata.document_type.confidence) }}>
                      {selectedDoc.metadata.document_type.confidence}% confidence
                    </span>
                  </div>
                  <select 
                    className="form-control" 
                    value={corrections.document_type} 
                    onChange={(e) => handleCorrectionChange('document_type', e.target.value)}
                    style={{ marginTop: '0.25rem' }}
                  >
                    {MockDB.getTaxonomies().documentTypes.map(dt => (
                      <option key={dt.type} value={dt.type}>{dt.type}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="flex-between">
                    <label style={{ margin: 0 }}>Priority Level</label>
                    <span style={{ fontSize: '0.75rem', color: getConfidenceColor(selectedDoc.metadata.priority.confidence) }}>
                      {selectedDoc.metadata.priority.confidence}% confidence
                    </span>
                  </div>
                  <select 
                    className="form-control" 
                    value={corrections.priority} 
                    onChange={(e) => handleCorrectionChange('priority', e.target.value)}
                    style={{ marginTop: '0.25rem' }}
                  >
                    {MockDB.getTaxonomies().priorities.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="flex-between">
                    <label style={{ margin: 0 }}>Regulatory Deadline</label>
                    <span style={{ fontSize: '0.75rem', color: getConfidenceColor(selectedDoc.metadata.deadline.confidence) }}>
                      {selectedDoc.metadata.deadline.confidence}% confidence
                    </span>
                  </div>
                  <input 
                    type="date"
                    className="form-control" 
                    value={corrections.deadline || ''} 
                    onChange={(e) => handleCorrectionChange('deadline', e.target.value)}
                    style={{ marginTop: '0.25rem' }}
                  />
                </div>

                {/* Monetary Value */}
                <div className="form-group" style={{ margin: 0 }}>
                  <div className="flex-between">
                    <label style={{ margin: 0 }}>Monetary Value (INR)</label>
                    <span style={{ fontSize: '0.75rem', color: getConfidenceColor(selectedDoc.metadata.monetary_value.confidence) }}>
                      {selectedDoc.metadata.monetary_value.confidence}% confidence
                    </span>
                  </div>
                  <input 
                    type="number"
                    className="form-control" 
                    placeholder="None"
                    value={corrections.monetary_value || ''} 
                    onChange={(e) => handleCorrectionChange('monetary_value', e.target.value ? parseFloat(e.target.value) : null)}
                    style={{ marginTop: '0.25rem' }}
                  />
                </div>
              </div>
            </div>

            {/* AI Summaries */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>AI Role-Aware Summary</h3>
              {Object.keys(selectedDoc.role_summaries).map(role => (
                <div key={role}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>Role: {role}</strong>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem', lineHeight: '1.5' }}>
                    {selectedDoc.role_summaries[role]}
                  </p>
                </div>
              ))}
            </div>

            {/* Decision Controls */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Review Action</h3>
              
              <div className="form-group">
                <label>Reviewer Notes / Justification</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Record justification for alterations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, backgroundColor: 'var(--accent-green)' }}
                  onClick={() => submitReview('APPROVED')}
                >
                  Approve Extractions
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    // Show a quick custom routing select or toggle
                    document.getElementById('reroute-section').style.display = 'block';
                  }}
                >
                  Escalate / Re-Route
                </button>
              </div>

              {/* Collapsible Re-route options */}
              <div id="reroute-section" style={{ display: 'none', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group">
                  <label>Assign to Accountable Role</label>
                  <select 
                    className="form-control"
                    value={rerouteRole}
                    onChange={(e) => setRerouteRole(e.target.value)}
                  >
                    <option value="Safety Director">Safety Director</option>
                    <option value="Finance Director">Finance Director</option>
                    <option value="Operations Controller">Operations Controller</option>
                    <option value="Chief legal Compliance Officer">Chief Legal & Compliance Officer</option>
                  </select>
                </div>
                <button 
                  className="btn btn-danger" 
                  style={{ width: '100%', padding: '0.6rem' }}
                  onClick={() => submitReview('RE-ROUTED')}
                >
                  Confirm Re-Route Escalation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Human-in-the-Loop Review Queue</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Low-confidence extractions, high-priority safety mandates, and regulatory actions requiring human verification.</p>
        </div>
        <div className="badge badge-high" style={{ padding: '0.5rem 1rem' }}>
          {documents.length} Actions Pending
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          {documents.length > 0 ? (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Document ID</th>
                  <th>Filename</th>
                  <th>Source</th>
                  <th>Department</th>
                  <th>Document Type</th>
                  <th>Priority</th>
                  <th>Confidence</th>
                  <th>Time Ingested</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.document_id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{doc.document_id}</td>
                    <td><strong style={{ cursor: 'pointer', color: 'var(--accent-cyan)' }} onClick={() => startReview(doc)}>{doc.filename}</strong></td>
                    <td><span className="badge badge-low" style={{ fontSize: '0.7rem' }}>{doc.source}</span></td>
                    <td>{doc.department}</td>
                    <td>{doc.document_type}</td>
                    <td>
                      <span className={`badge badge-${doc.priority.toLowerCase()}`}>
                        {doc.priority}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: getConfidenceColor(doc.confidence) }}>{doc.confidence}%</strong>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{new Date(doc.timestamp).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => startReview(doc)}>
                        Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '4rem', textAlignment: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
              <strong style={{ fontSize: '1.1rem' }}>Review Queue Cleared</strong>
              <p style={{ marginTop: '0.25rem' }}>All ingested documents have cleared confidence thresholds or been reviewed by administrators.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
