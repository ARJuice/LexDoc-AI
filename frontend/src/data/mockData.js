// =============================================
// LexDoc AI — Finance Company Mock Data
// =============================================

export const departments = [
    { id: 1, name: 'Treasury', code: 'TRSY' },
    { id: 2, name: 'Risk Management', code: 'RISK' },
    { id: 3, name: 'Compliance', code: 'COMP' },
    { id: 4, name: 'Investment Banking', code: 'INVB' },
    { id: 5, name: 'Wealth Management', code: 'WLTH' },
    { id: 6, name: 'Corporate Finance', code: 'CORP' },
    { id: 7, name: 'Audit & Internal Controls', code: 'AUDT' },
];

export const roles = [
    { id: 1, name: 'Admin', access_level: 10 },
    { id: 2, name: 'Department Head', access_level: 5 },
    { id: 3, name: 'Analyst', access_level: 3 },
    { id: 4, name: 'Staff', access_level: 1 },
];

export const users = [
    { id: 1, username: 'rachel.kumar', email: 'rachel.kumar@lexfin.com', is_verified: true, role_id: 1, dept_id: 1, avatar: null },
    { id: 2, username: 'vikram.singh', email: 'vikram.singh@lexfin.com', is_verified: true, role_id: 2, dept_id: 2, avatar: null },
    { id: 3, username: 'priya.menon', email: 'priya.menon@lexfin.com', is_verified: true, role_id: 2, dept_id: 3, avatar: null },
    { id: 4, username: 'arjun.nair', email: 'arjun.nair@lexfin.com', is_verified: true, role_id: 3, dept_id: 4, avatar: null },
    { id: 5, username: 'sneha.das', email: 'sneha.das@lexfin.com', is_verified: true, role_id: 3, dept_id: 5, avatar: null },
    { id: 6, username: 'rohan.patel', email: 'rohan.patel@lexfin.com', is_verified: true, role_id: 4, dept_id: 6, avatar: null },
    { id: 7, username: 'ananya.iyer', email: 'ananya.iyer@lexfin.com', is_verified: true, role_id: 3, dept_id: 7, avatar: null },
    { id: 8, username: 'deepak.sharma', email: 'deepak.sharma@lexfin.com', is_verified: true, role_id: 4, dept_id: 1, avatar: null },
];

// Current logged-in user (for demo)
export const currentUser = users[0]; // Rachel Kumar - Admin

export const tags = [
    { id: 1, name: 'High Priority', type: 'PRIORITY', weight: 100, color: '#EF4444' },
    { id: 2, name: 'Medium Priority', type: 'PRIORITY', weight: 50, color: '#F59E0B' },
    { id: 3, name: 'Low Priority', type: 'PRIORITY', weight: 10, color: '#10B981' },
    { id: 4, name: 'Quarterly Report', type: 'LABEL', weight: 80, color: '#6366F1' },
    { id: 5, name: 'Confidential', type: 'LABEL', weight: 90, color: '#DC2626' },
    { id: 6, name: 'Regulatory', type: 'LABEL', weight: 85, color: '#8B5CF6' },
    { id: 7, name: 'Audit Finding', type: 'LABEL', weight: 70, color: '#EC4899' },
    { id: 8, name: 'Market Analysis', type: 'LABEL', weight: 60, color: '#0EA5E9' },
    { id: 9, name: 'Internal Memo', type: 'LABEL', weight: 40, color: '#64748B' },
    { id: 10, name: 'Board Review', type: 'LABEL', weight: 95, color: '#F97316' },
];

export const documents = [
    {
        id: 1, title: 'Q4 2025 Treasury Performance Report',
        file_size: 2450000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 1, uploaded_at: '2026-01-15T10:30:00', tag_ids: [4, 1], dept_ids: [1],
    },
    {
        id: 2, title: 'Market Risk Assessment — March 2026',
        file_size: 1870000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 2, uploaded_at: '2026-03-02T14:00:00', tag_ids: [1, 8], dept_ids: [2],
    },
    {
        id: 3, title: 'AML Compliance Circular #47',
        file_size: 980000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: true,
        uploader_id: 3, uploaded_at: '2026-02-20T09:15:00', tag_ids: [6, 5], dept_ids: [],
    },
    {
        id: 4, title: 'IPO Readiness Checklist — Nexon Pharma',
        file_size: 3200000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 4, uploaded_at: '2026-02-28T16:45:00', tag_ids: [1, 10], dept_ids: [4],
    },
    {
        id: 5, title: 'HNI Client Portfolio Review Q1 2026',
        file_size: 1540000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 5, uploaded_at: '2026-03-05T11:00:00', tag_ids: [5, 2], dept_ids: [5],
    },
    {
        id: 6, title: 'Annual Budget Forecast FY2026–27',
        file_size: 4100000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: true,
        uploader_id: 6, uploaded_at: '2026-02-10T08:30:00', tag_ids: [4, 10], dept_ids: [],
    },
    {
        id: 7, title: 'Internal Audit Report — IT Controls',
        file_size: 2890000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 7, uploaded_at: '2026-03-01T13:20:00', tag_ids: [7, 1], dept_ids: [7],
    },
    {
        id: 8, title: 'Board Meeting Minutes — February 2026',
        file_size: 1120000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: true,
        uploader_id: 1, uploaded_at: '2026-02-25T17:00:00', tag_ids: [10, 9], dept_ids: [],
    },
    {
        id: 9, title: 'Forex Hedging Strategy Memo',
        file_size: 760000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: false,
        uploader_id: 8, uploaded_at: '2026-03-06T10:00:00', tag_ids: [9, 3], dept_ids: [1],
    },
    {
        id: 10, title: 'KYC Process Update Notice',
        file_size: 540000, mime_type: 'application/pdf', processing_status: 'summarized', is_general: true,
        uploader_id: 3, uploaded_at: '2026-03-07T15:30:00', tag_ids: [6, 2], dept_ids: [],
    },
];

export const summaries = [
    { id: 1, doc_id: 1, model_used: 'ollama/llama3', created_at: '2026-01-15T10:45:00', content: 'The Q4 2025 Treasury report highlights a 12% increase in short-term liquidity reserves, driven by improved cash-flow management across regional branches. Key risk: rising overnight lending rates may compress margins in Q1 2026. Recommendation: rebalance the overnight portfolio toward longer-maturity instruments.' },
    { id: 2, doc_id: 2, model_used: 'ollama/llama3', created_at: '2026-03-02T14:20:00', content: 'March 2026 market risk assessment identifies elevated volatility in emerging-market forex pairs (INR/USD, BRL/USD). Value-at-Risk for the trading book has increased by 8% month-over-month. Stress tests indicate potential losses of $4.2M under a severe downturn scenario. Immediate action: review stop-loss limits on EM currency positions.' },
    { id: 3, doc_id: 3, model_used: 'ollama/llama3', created_at: '2026-02-20T09:30:00', content: 'Anti-Money Laundering Circular #47 introduces enhanced due diligence requirements for correspondent banking relationships effective April 15, 2026. All existing correspondent accounts must be re-assessed within 90 days. New transaction monitoring thresholds lowered from $10,000 to $5,000 for high-risk jurisdictions.' },
    { id: 4, doc_id: 4, model_used: 'ollama/llama3', created_at: '2026-02-28T17:00:00', content: 'IPO readiness checklist for Nexon Pharma covers 47 action items across legal, financial, and regulatory workstreams. Current completion: 72%. Critical blockers: pending SEBI clarification on promoter lock-in period and outstanding tax litigation from FY2023. Target listing date: July 2026.' },
    { id: 5, doc_id: 5, model_used: 'ollama/llama3', created_at: '2026-03-05T11:20:00', content: 'Q1 2026 HNI portfolio review shows AUM growth of 6.3% to $142M across 38 active clients. Top performers: tech-heavy portfolios (+14%). Underperformers: real-estate-linked funds (−3.2%). Client churn risk flagged for 3 accounts under $2M AUM. Recommendation: schedule personal review calls with at-risk clients.' },
    { id: 6, doc_id: 6, model_used: 'ollama/llama3', created_at: '2026-02-10T09:00:00', content: 'FY2026–27 annual budget projects total revenue of $284M (+9% YoY). Major CAPEX allocation: digital transformation ($18M), branch expansion ($12M), and compliance infrastructure ($7M). Operating margin target: 22%. Key assumption: no more than 2 rate hikes by RBI in the fiscal year.' },
    { id: 7, doc_id: 7, model_used: 'ollama/llama3', created_at: '2026-03-01T13:45:00', content: 'Internal audit of IT controls found 3 critical findings: (1) privileged access reviews overdue by 6 months, (2) disaster recovery tests not conducted in Q3–Q4 2025, (3) 14 endpoints running unsupported OS versions. Management has committed to remediation by April 30, 2026.' },
    { id: 8, doc_id: 8, model_used: 'ollama/llama3', created_at: '2026-02-25T17:30:00', content: 'Board meeting minutes from February 2026 cover approval of the FY2027 budget, review of the Nexon Pharma IPO mandate, and discussion of the new AML circular impact. The board directed management to present an updated digital strategy by the April meeting.' },
    { id: 9, doc_id: 9, model_used: 'ollama/llama3', created_at: '2026-03-06T10:30:00', content: 'Forex hedging strategy memo proposes shifting from simple forward contracts to a collar strategy (buying puts + selling calls) on INR/USD exposure. Expected cost reduction: 35% on hedging premiums. Risk: limited upside capture if INR appreciates beyond the call strike.' },
    { id: 10, doc_id: 10, model_used: 'ollama/llama3', created_at: '2026-03-07T16:00:00', content: 'KYC process update notice revises the customer onboarding workflow to include Aadhaar-based video KYC for retail accounts. Expected processing time reduction: 48 hours to 4 hours. All relationship managers must complete updated training by March 31, 2026.' },
];

export const events = [
    { id: 1, doc_id: 3, title: 'AML Enhanced Due Diligence Effective', event_type: 'DEADLINE', event_date: '2026-04-15', event_time: '00:00', description: 'New correspondent banking EDD requirements take effect', created_by_ai: true },
    { id: 2, doc_id: 4, title: 'Nexon Pharma Target Listing Date', event_type: 'DEADLINE', event_date: '2026-07-01', event_time: '10:00', description: 'Planned IPO listing on BSE/NSE', created_by_ai: true },
    { id: 3, doc_id: 7, title: 'IT Audit Remediation Deadline', event_type: 'DEADLINE', event_date: '2026-04-30', event_time: '17:00', description: 'Critical IT control findings must be resolved', created_by_ai: true },
    { id: 4, doc_id: 8, title: 'Board Meeting — Digital Strategy Review', event_type: 'MEETING', event_date: '2026-04-18', event_time: '14:00', description: 'Presentation of updated digital transformation strategy to the board', created_by_ai: true },
    { id: 5, doc_id: 10, title: 'KYC Training Completion Deadline', event_type: 'DEADLINE', event_date: '2026-03-31', event_time: '23:59', description: 'All RMs must complete updated video KYC training', created_by_ai: true },
    { id: 6, doc_id: 6, title: 'Q1 Budget Review', event_type: 'MEETING', event_date: '2026-04-10', event_time: '11:00', description: 'First quarterly review of FY2027 budget actuals vs forecast', created_by_ai: true },
    { id: 7, doc_id: 2, title: 'Risk Committee — EM Exposure Review', event_type: 'MEETING', event_date: '2026-03-20', event_time: '15:30', description: 'Review of emerging-market currency position limits', created_by_ai: true },
    { id: 8, doc_id: 5, title: 'HNI At-Risk Client Calls', event_type: 'DEADLINE', event_date: '2026-03-25', event_time: '18:00', description: 'Complete personal review calls with 3 flagged at-risk HNI clients', created_by_ai: true },
];

export const notifications = [
    { id: 1, user_id: 3, event_id: 1, notify_at: '2026-04-14T09:00:00', is_sent: false },
    { id: 2, user_id: 4, event_id: 2, notify_at: '2026-06-30T09:00:00', is_sent: false },
    { id: 3, user_id: 7, event_id: 3, notify_at: '2026-04-29T09:00:00', is_sent: false },
    { id: 4, user_id: 1, event_id: 4, notify_at: '2026-04-17T09:00:00', is_sent: false },
    { id: 5, user_id: 3, event_id: 5, notify_at: '2026-03-30T09:00:00', is_sent: false },
    { id: 6, user_id: 6, event_id: 6, notify_at: '2026-04-09T09:00:00', is_sent: false },
    { id: 7, user_id: 2, event_id: 7, notify_at: '2026-03-19T09:00:00', is_sent: false },
    { id: 8, user_id: 5, event_id: 8, notify_at: '2026-03-24T09:00:00', is_sent: false },
];

export const auditLogs = [
    { id: 1, user_id: 1, doc_id: 1, action: 'UPLOAD', details: 'Uploaded Q4 2025 Treasury Performance Report', timestamp: '2026-01-15T10:30:00' },
    { id: 2, user_id: 2, doc_id: 2, action: 'UPLOAD', details: 'Uploaded Market Risk Assessment — March 2026', timestamp: '2026-03-02T14:00:00' },
    { id: 3, user_id: 3, doc_id: 3, action: 'UPLOAD', details: 'Uploaded AML Compliance Circular #47', timestamp: '2026-02-20T09:15:00' },
    { id: 4, user_id: 4, doc_id: 4, action: 'UPLOAD', details: 'Uploaded IPO Readiness Checklist — Nexon Pharma', timestamp: '2026-02-28T16:45:00' },
    { id: 5, user_id: 1, doc_id: 8, action: 'UPLOAD', details: 'Uploaded Board Meeting Minutes — February 2026', timestamp: '2026-02-25T17:00:00' },
    { id: 6, user_id: 2, doc_id: 2, action: 'VIEW', details: 'Viewed Market Risk Assessment', timestamp: '2026-03-03T09:00:00' },
    { id: 7, user_id: 5, doc_id: 6, action: 'VIEW', details: 'Viewed Annual Budget Forecast FY2026–27', timestamp: '2026-03-04T10:15:00' },
    { id: 8, user_id: 7, doc_id: 7, action: 'VIEW', details: 'Viewed Internal Audit Report — IT Controls', timestamp: '2026-03-02T15:30:00' },
    { id: 9, user_id: 1, doc_id: 3, action: 'VIEW', details: 'Viewed AML Compliance Circular #47', timestamp: '2026-03-05T08:20:00' },
    { id: 10, user_id: 3, doc_id: 10, action: 'UPLOAD', details: 'Uploaded KYC Process Update Notice', timestamp: '2026-03-07T15:30:00' },
];

// ---- Helper functions ----
export const getUserById = (id) => users.find(u => u.id === id);
export const getDeptById = (id) => departments.find(d => d.id === id);
export const getRoleById = (id) => roles.find(r => r.id === id);
export const getTagById = (id) => tags.find(t => t.id === id);
export const getSummaryByDocId = (docId) => summaries.find(s => s.doc_id === docId);
export const getEventsByDocId = (docId) => events.filter(e => e.doc_id === docId);

export const getDocumentTags = (doc) => (doc.tag_ids || []).map(getTagById).filter(Boolean);
export const getDocumentUploader = (doc) => getUserById(doc.uploader_id);
export const getDocumentDepartments = (doc) => (doc.dept_ids || []).map(getDeptById).filter(Boolean);

export const formatFileSize = (bytes) => {
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
    if (bytes >= 1000) return (bytes / 1000).toFixed(0) + ' KB';
    return bytes + ' B';
};

export const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
};

export const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export const getDaysUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
