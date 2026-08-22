// Initial seed data for the KMRL Admin Console
const INITIAL_TAXONOMIES = {
  departments: ["Operations", "Rolling Stock", "Civil Engineering", "Procurement", "Finance", "Safety", "HR", "Legal/Compliance"],
  documentTypes: [
    { type: "Regulatory Directive", allowedDepartments: ["Safety", "Operations", "Legal/Compliance"] },
    { type: "Maintenance Report", allowedDepartments: ["Rolling Stock", "Civil Engineering"] },
    { type: "Procurement Contract", allowedDepartments: ["Procurement", "Finance"] },
    { type: "Safety Inspection Log", allowedDepartments: ["Safety", "Operations"] },
    { type: "Staff Roster / HR Record", allowedDepartments: ["HR"] },
    { type: "Board Resolution", allowedDepartments: ["Legal/Compliance"] }
  ],
  priorities: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
};

const INITIAL_SOURCES = [
  {
    source_id: "sharepoint-ops",
    name: "Operations SharePoint",
    connector_type: "SharePoint",
    config: { site_url: "https://kmrl.sharepoint.com/ops", folder_path: "/Shared Documents/Directives", polling_interval_minutes: 15 },
    status: "CONNECTED",
    last_polled: "2026-08-06T15:10:00Z",
    latency_ms: 320
  },
  {
    source_id: "maximo-rolling-stock",
    name: "Maximo Assets Export",
    connector_type: "Maximo",
    config: { export_endpoint: "https://maximo.kmrl.co.in/api/v1/assets", frequency_hours: 6 },
    status: "CONNECTED",
    last_polled: "2026-08-06T12:00:00Z",
    latency_ms: 450
  },
  {
    source_id: "whatsapp-scans",
    name: "WhatsApp Scan Recipient",
    connector_type: "WhatsApp",
    config: { phone_number: "+914840001122", auto_download: true },
    status: "WARNING",
    last_polled: "2026-08-06T15:40:00Z",
    latency_ms: 1280
  },
  {
    source_id: "finance-email-attachments",
    name: "Finance Invoices Mailbox",
    connector_type: "Email",
    config: { email_address: "invoices@kmrl.co.in", folder: "Inbox" },
    status: "DISCONNECTED",
    last_polled: "2026-08-06T08:00:00Z",
    latency_ms: 0
  }
];

const INITIAL_ROUTING_RULES = [
  {
    rule_id: "rule-01",
    name: "High Value Procurement Routing",
    conditions: { department: "Procurement", monetary_value_greater_than: 1000000 },
    action: { route_to_role: "Finance Director", priority_escalation: "CRITICAL" },
    is_active: true
  },
  {
    rule_id: "rule-02",
    name: "Safety Escalation Policy",
    conditions: { department: "Safety", priority: "HIGH" },
    action: { route_to_role: "Safety Director", priority_escalation: "CRITICAL" },
    is_active: true
  },
  {
    rule_id: "rule-03",
    name: "Operations Audit Route",
    conditions: { document_type: "Regulatory Directive", department: "Operations" },
    action: { route_to_role: "Operations Controller", priority_escalation: "HIGH" },
    is_active: false
  }
];

const INITIAL_DOCUMENTS = [
  {
    document_id: "doc-9821",
    document_version_id: "v1.0",
    filename: "KMRL_Safety_Audit_Aluva_2026.pdf",
    source: "SharePoint",
    department: "Safety",
    document_type: "Regulatory Directive",
    priority: "HIGH",
    confidence: 78.4,
    timestamp: "2026-08-06T14:32:00Z",
    languages: ["English", "Malayalam"],
    status: "needs_review",
    review_reason: "Low OCR confidence (72.1%) in Malayalam text segment on page 3",
    file_url: "#",
    metadata: {
      department: { value: "Safety", confidence: 95.0 },
      document_type: { value: "Regulatory Directive", confidence: 88.0 },
      priority: { value: "HIGH", confidence: 91.0 },
      regulatory_relevance: { value: true, confidence: 94.0 },
      monetary_value: { value: null, confidence: 100.0 },
      deadline: { value: "2026-09-01", confidence: 76.0 },
      assets: { value: ["Metro Line-1", "Aluva Station"], confidence: 84.0 }
    },
    role_summaries: {
      "Safety Officer": "Mandatory structural inspection of overhead cables at Aluva Station by 2026-09-01. Priority action required for safety compliance. (Malayalam: അലുവ സ്റ്റേഷനിലെ ഓവർഹെഡ് കേബിളുകളുടെ ഘടനാപരമായ പരിശോധന 2026-09-01-നകം പൂർത്തിയാക്കണം)."
    },
    extracted_text: "Kochi Metro Rail Limited (KMRL) Safety Audit.\nPage 1: Scope of audit includes Metro Line-1 infrastructure.\nPage 2: High priority inspect Aluva Station overhead cables. Target date: 01 September 2026.\nPage 3 (Malayalam segment): അലുവ സ്റ്റേഷൻ പരിശോധന അടിയന്തിരമായി പൂർത്തിയാക്കുക. (Aluva station inspection to be completed urgently.)",
    corrections: {}
  },
  {
    document_id: "doc-7762",
    document_version_id: "v1.0",
    filename: "CONTRACT_KMRL_RS_302.pdf",
    source: "Email",
    department: "Procurement",
    document_type: "Procurement Contract",
    priority: "CRITICAL",
    confidence: 84.1,
    timestamp: "2026-08-06T12:15:00Z",
    languages: ["English"],
    status: "needs_review",
    review_reason: "Monetary value detection warning: potential mismatch between text figures",
    file_url: "#",
    metadata: {
      department: { value: "Procurement", confidence: 98.0 },
      document_type: { value: "Procurement Contract", confidence: 99.0 },
      priority: { value: "CRITICAL", confidence: 95.0 },
      regulatory_relevance: { value: false, confidence: 98.0 },
      monetary_value: { value: 12500000, confidence: 64.0 },
      deadline: { value: "2026-12-31", confidence: 88.0 },
      assets: { value: ["Rolling Stock - Coach Trainset"], confidence: 90.0 }
    },
    role_summaries: {
      "Finance Officer": "Procurement contract for Rolling Stock Coach Trainsets totaling ₹1,25,00,000 (INR 12.5 Million). Final delivery scheduled on or before 2026-12-31."
    },
    extracted_text: "CONTRACT AGREEMENT KMRL RS-302.\nThis agreement is made for procurement of 3 additional Rolling Stock coach sets.\nTotal contract value: Rs. 1,25,00,000/- (Rupees One Crore Twenty Five Lakhs Only).\nDeadline for delivery: December 31, 2026.",
    corrections: {}
  },
  {
    document_id: "doc-1109",
    document_version_id: "v1.1",
    filename: "Civil_Maintenance_Aluva_009.docx",
    source: "SharePoint",
    department: "Civil Engineering",
    document_type: "Maintenance Report",
    priority: "MEDIUM",
    confidence: 96.5,
    timestamp: "2026-08-05T09:45:00Z",
    languages: ["English"],
    status: "approved",
    review_reason: "",
    file_url: "#",
    metadata: {
      department: { value: "Civil Engineering", confidence: 99.0 },
      document_type: { value: "Maintenance Report", confidence: 99.0 },
      priority: { value: "MEDIUM", confidence: 98.0 },
      regulatory_relevance: { value: false, confidence: 99.0 },
      monetary_value: { value: 45000, confidence: 99.0 },
      deadline: { value: "2026-08-15", confidence: 99.0 },
      assets: { value: ["Aluva Station platform cracks"], confidence: 95.0 }
    },
    role_summaries: {
      "Civil Engineer": "Minor repair of hairline cracks on Aluva Station Platform 1. Estimated cost: ₹45,000. Timeline: 2026-08-15."
    },
    extracted_text: "Platform crack inspection report at Aluva Station. Hairline cracks observed near pillars 12-14. Repair budget allocated: 45000 INR. Target completion date: 15 August 2026.",
    corrections: {}
  }
];

const INITIAL_AUDIT_LOGS = [
  { log_id: "log-1", timestamp: "2026-08-06T15:40:00Z", username: "system", action: "Connector Poll Warning", details: "WhatsApp Connector polled with high latency (1280ms)" },
  { log_id: "log-2", timestamp: "2026-08-06T14:32:05Z", username: "system-router", action: "Routing Triggered", details: "Document doc-9821 auto-routed to Review Queue (Safety Department, low confidence)" },
  { log_id: "log-3", timestamp: "2026-08-06T14:32:00Z", username: "system-ingest", action: "Document Ingestion", details: "Ingested 'KMRL_Safety_Audit_Aluva_2026.pdf' via SharePoint (v1.0)" },
  { log_id: "log-4", timestamp: "2026-08-06T12:15:08Z", username: "system-router", action: "Routing Triggered", details: "Document doc-7762 auto-routed to Review Queue (Procurement Department, value trigger)" },
  { log_id: "log-5", timestamp: "2026-08-06T10:30:00Z", username: "admin", action: "Taxonomy Update", details: "Added 'Civil Engineering' to departments list" }
];

// Helper to access LocalStorage statefully
const getStorageItem = (key, initialValue) => {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(initialValue));
  return initialValue;
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const MockDB = {
  getTaxonomies: () => getStorageItem("kmrl_taxonomies", INITIAL_TAXONOMIES),
  saveTaxonomies: (taxonomies) => {
    setStorageItem("kmrl_taxonomies", taxonomies);
    MockDB.addAuditLog("admin", "Taxonomy Update", "Taxonomy & schemas modified by administrator.");
  },

  getSources: () => getStorageItem("kmrl_sources", INITIAL_SOURCES),
  saveSources: (sources) => setStorageItem("kmrl_sources", sources),
  updateSourceStatus: (source_id, status) => {
    const sources = MockDB.getSources();
    const source = sources.find(s => s.source_id === source_id);
    if (source) {
      source.status = status;
      source.last_polled = new Date().toISOString();
      MockDB.saveSources(sources);
      MockDB.addAuditLog("admin", "Connector Edit", `Updated connector '${source.name}' status to ${status}`);
    }
  },

  getRoutingRules: () => getStorageItem("kmrl_routing_rules", INITIAL_ROUTING_RULES),
  saveRoutingRules: (rules) => setStorageItem("kmrl_routing_rules", rules),
  addRoutingRule: (rule) => {
    const rules = MockDB.getRoutingRules();
    rule.rule_id = "rule-" + (rules.length + 1).toString().padStart(2, "0");
    rules.push(rule);
    MockDB.saveRoutingRules(rules);
    MockDB.addAuditLog("admin", "Rule Created", `Created routing rule: ${rule.name}`);
    return rule;
  },
  deleteRoutingRule: (rule_id) => {
    let rules = MockDB.getRoutingRules();
    const rule = rules.find(r => r.rule_id === rule_id);
    rules = rules.filter(r => r.rule_id !== rule_id);
    MockDB.saveRoutingRules(rules);
    if (rule) {
      MockDB.addAuditLog("admin", "Rule Deleted", `Deleted routing rule: ${rule.name}`);
    }
  },

  getDocuments: () => getStorageItem("kmrl_documents", INITIAL_DOCUMENTS),
  saveDocuments: (docs) => setStorageItem("kmrl_documents", docs),
  getDocumentById: (id) => MockDB.getDocuments().find(d => d.document_id === id),
  submitDocumentReview: (id, reviewData) => {
    const docs = MockDB.getDocuments();
    const docIndex = docs.findIndex(d => d.document_id === id);
    if (docIndex !== -1) {
      const doc = docs[docIndex];
      doc.corrections = reviewData.corrections;
      doc.status = reviewData.reviewer_disposition === "APPROVED" ? "approved" : "re_routed";
      
      // Update fields based on corrections
      Object.keys(reviewData.corrections).forEach(key => {
        if (doc.metadata[key]) {
          doc.metadata[key].value = reviewData.corrections[key];
          doc.metadata[key].confidence = 100.0; // Confirmed by human
        }
      });
      
      docs[docIndex] = doc;
      MockDB.saveDocuments(docs);
      
      MockDB.addAuditLog(
        "admin", 
        "Document Reviewed", 
        `Completed review of '${doc.filename}' with status: ${reviewData.reviewer_disposition} (${reviewData.reviewer_notes || "no notes"})`
      );
    }
  },

  getAuditLogs: () => getStorageItem("kmrl_audit_logs", INITIAL_AUDIT_LOGS),
  addAuditLog: (username, action, details) => {
    const logs = MockDB.getAuditLogs();
    const newLog = {
      log_id: "log-" + (logs.length + 1),
      timestamp: new Date().toISOString(),
      username,
      action,
      details
    };
    logs.unshift(newLog);
    setStorageItem("kmrl_audit_logs", logs);
  },

  getQualityMetrics: () => {
    const docs = MockDB.getDocuments();
    const approved = docs.filter(d => d.status === "approved" || d.status === "re_routed");
    
    // Count corrections
    let totalFieldsCompared = 0;
    let fieldDiscrepancies = 0;

    approved.forEach(doc => {
      if (doc.corrections && Object.keys(doc.corrections).length > 0) {
        Object.keys(doc.corrections).forEach(key => {
          totalFieldsCompared++;
          // Compare correction value with original mock confidence/value metadata (not overridden yet)
          // To keep it simple, we just assume if there's a correction, it was modified.
          fieldDiscrepancies++;
        });
      }
    });

    const errorRate = totalFieldsCompared > 0 ? ((fieldDiscrepancies / totalFieldsCompared) * 100).toFixed(1) : "0.0";
    
    return {
      accuracyRate: (100 - parseFloat(errorRate)).toFixed(1) + "%",
      totalFieldsReviewed: totalFieldsCompared,
      correctionsMade: fieldDiscrepancies,
      originalAvgConfidence: "86.3%",
      postReviewConfidence: "100.0%"
    };
  }
};
