import { useEffect, useRef } from 'react';
import { ClipboardList, Search, FileText, User, Eye, UploadCloud } from 'lucide-react';
import gsap from 'gsap';
import { auditLogs, users, documents, formatDateTime } from '../data/mockData';
import './Admin.css';

export default function AdminAuditLogs() {
    const pageRef = useRef(null);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('.log-row'),
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', delay: 0.1 }
        );
    }, []);

    const logs = [...auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div ref={pageRef} className="page-container admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="page-title"><ClipboardList size={28} className="title-icon" /> Audit Logs</h2>
                    <p className="page-subtitle">System-wide activity and access tracking.</p>
                </div>
                <div className="docs-search" style={{ minWidth: 300 }}>
                    <Search size={16} />
                    <input type="text" placeholder="Search logs..." />
                </div>
            </div>

            <div className="card logs-container">
                {logs.map(log => {
                    const user = users.find(u => u.id === log.user_id);
                    const doc = documents.find(d => d.id === log.doc_id);
                    const isUpload = log.action === 'UPLOAD';

                    return (
                        <div key={log.id} className="log-row">
                            <div className="log-icon" style={{ color: isUpload ? 'var(--color-primary)' : 'var(--color-accent)' }}>
                                {isUpload ? <UploadCloud size={18} /> : <Eye size={18} />}
                            </div>
                            <div className="log-content">
                                <div className="log-desc">
                                    <span className="log-user"><User size={12} /> {user?.username}</span>
                                    {' '}{isUpload ? 'uploaded' : 'viewed'}{' '}
                                    <span className="log-doc"><FileText size={12} /> {doc?.title || log.details}</span>
                                </div>
                                <div className="log-details">{log.details}</div>
                            </div>
                            <div className="log-time">{formatDateTime(log.timestamp)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
