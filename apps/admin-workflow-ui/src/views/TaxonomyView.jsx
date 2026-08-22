import React, { useState, useEffect } from 'react';
import { MockDB } from '../data/mockData';

export default function TaxonomyView() {
  const [taxonomies, setTaxonomies] = useState({ departments: [], documentTypes: [] });
  const [newDept, setNewDept] = useState('');
  const [newDocType, setNewDocType] = useState('');
  const [selectedDeptForType, setSelectedDeptForType] = useState('');

  const loadTaxonomies = () => {
    setTaxonomies(MockDB.getTaxonomies());
  };

  useEffect(() => {
    loadTaxonomies();
    const tax = MockDB.getTaxonomies();
    if (tax.departments.length > 0) {
      setSelectedDeptForType(tax.departments[0]);
    }
  }, []);

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;

    const current = MockDB.getTaxonomies();
    if (current.departments.includes(newDept.trim())) {
      alert('Department already exists!');
      return;
    }

    current.departments.push(newDept.trim());
    MockDB.saveTaxonomies(current);
    
    // Log
    MockDB.addAuditLog('admin', 'Taxonomy Update', `Added department '${newDept.trim()}' to systems taxonomy.`);
    
    setNewDept('');
    loadTaxonomies();
  };

  const handleAddDocType = (e) => {
    e.preventDefault();
    if (!newDocType.trim()) return;

    const current = MockDB.getTaxonomies();
    const exists = current.documentTypes.some(d => d.type.toLowerCase() === newDocType.trim().toLowerCase());
    if (exists) {
      alert('Document type already exists!');
      return;
    }

    current.documentTypes.push({
      type: newDocType.trim(),
      allowedDepartments: [selectedDeptForType]
    });
    
    MockDB.saveTaxonomies(current);

    // Log
    MockDB.addAuditLog('admin', 'Taxonomy Update', `Added document type '${newDocType.trim()}' mapped to '${selectedDeptForType}'`);
    
    setNewDocType('');
    loadTaxonomies();
  };

  const removeDocType = (type) => {
    if (window.confirm(`Are you sure you want to remove document type '${type}'?`)) {
      const current = MockDB.getTaxonomies();
      current.documentTypes = current.documentTypes.filter(d => d.type !== type);
      MockDB.saveTaxonomies(current);
      loadTaxonomies();
    }
  };

  return (
    <div>
      <div className="flex-between mb-3">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Taxonomy & Schema Manager</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Define department namespaces, document types, and structural validation schemas for AI-2 classifiers.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2.5rem' }}>
        
        {/* Left Side: Departments configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card">
            <h3 className="mb-2" style={{ fontSize: '1.15rem', fontWeight: 600 }}>KMRL Departments</h3>
            
            <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Rolling Stock" 
                required
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                Add
              </button>
            </form>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {taxonomies.departments.map(dept => (
                <li 
                  key={dept} 
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span>{dept}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Document Types / Classifiers configuration */}
        <div className="glass-card">
          <h3 className="mb-2" style={{ fontSize: '1.15rem', fontWeight: 600 }}>Document Classifiers & Schemas</h3>
          
          <form onSubmit={handleAddDocType} style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid var(--glass-border)' }}>
            <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Add Document Category & Routing</strong>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Invoices / Audits" 
                required
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                style={{ flex: 1.5 }}
              />
              <select 
                className="form-control"
                value={selectedDeptForType}
                onChange={(e) => setSelectedDeptForType(e.target.value)}
                style={{ flex: 1 }}
              >
                {taxonomies.departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">
                Register Category
              </button>
            </div>
          </form>

          <table className="custom-table" style={{ fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th>Classification Name</th>
                <th>Allowed / Target Departments</th>
                <th>Validation Schema Targets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxonomies.documentTypes.map(dt => (
                <tr key={dt.type}>
                  <td><strong>{dt.type}</strong></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {dt.allowedDepartments.map(dept => (
                        <span key={dept} className="badge badge-low" style={{ fontSize: '0.65rem' }}>{dept}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      {dt.type === 'Procurement Contract' && 'vendor, total_amount, target_deadline'}
                      {dt.type === 'Regulatory Directive' && 'regulatory_body, deadline, compliance_clauses'}
                      {dt.type === 'Maintenance Report' && 'asset_id, cost, inspector'}
                      {dt.type !== 'Procurement Contract' && dt.type !== 'Regulatory Directive' && dt.type !== 'Maintenance Report' && 'generic_fields, core_entities'}
                    </div>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: 'var(--accent-rose)', borderColor: 'rgba(244,63,94,0.15)' }}
                      onClick={() => removeDocType(dt.type)}
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
    </div>
  );
}
