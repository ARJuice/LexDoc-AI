import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Download, ZoomIn, ZoomOut, FileText, Tag, Calendar, User } from 'lucide-react';
import gsap from 'gsap';
import {
    documents, getSummaryByDocId, getDocumentTags, getDocumentUploader,
    getDocumentDepartments, getTagColor, sortTagsByPriority, getEventsByDocId, formatDate, formatFileSize
} from '../data/mockData';
import './DocumentDetail.css';

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const doc = documents.find(d => d.id === Number(id));
    const summary = doc ? getSummaryByDocId(doc.id) : null;
    const docTags = doc ? sortTagsByPriority(getDocumentTags(doc)) : [];
    const docDepts = doc ? getDocumentDepartments(doc) : [];
    const uploader = doc ? getDocumentUploader(doc) : null;
    const docEvents = doc ? getEventsByDocId(doc.id) : [];

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelector('.detail-pdf'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
        gsap.fromTo(el.querySelector('.detail-ai'), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' });
    }, [id]);

    if (!doc) {
        return (
            <div className="page-container">
                <p>Document not found.</p>
                <button className="btn btn-ghost" onClick={() => navigate('/documents')}>← Back to Documents</button>
            </div>
        );
    }

    const copyToClipboard = () => {
        if (summary) navigator.clipboard.writeText(summary.content);
    };

    return (
        <div ref={pageRef} className="page-container detail-page">
            <button className="btn btn-ghost detail-back" onClick={() => navigate('/documents')} data-hoverable>
                <ArrowLeft size={16} /> Back to Documents
            </button>

            <div className="detail-split">
                {/* Left: PDF Viewer Placeholder */}
                <div className="detail-pdf">
                    <div className="pdf-toolbar">
                        <span className="pdf-title">{doc.title}</span>
                        <div className="pdf-actions">
                            <button className="btn btn-ghost" data-hoverable><ZoomOut size={16} /></button>
                            <button className="btn btn-ghost" data-hoverable><ZoomIn size={16} /></button>
                            <button className="btn btn-ghost" data-hoverable><Download size={16} /></button>
                        </div>
                    </div>
                    <div className="pdf-placeholder">
                        <FileText size={64} />
                        <p>PDF Viewer</p>
                        <span>Document preview will render here once Supabase storage is connected</span>
                    </div>
                </div>

                {/* Right: AI Panel */}
                <div className="detail-ai">
                    {/* Summary */}
                    <div className="ai-section">
                        <div className="ai-section-header">
                            <h3>AI Summary</h3>
                            <div className="ai-section-actions">
                                <button className="btn btn-ghost" onClick={copyToClipboard} data-hoverable><Copy size={14} /> Copy</button>
                                <button className="btn btn-ghost" data-hoverable><RefreshCw size={14} /> Regenerate</button>
                            </div>
                        </div>
                        {summary ? (
                            <p className="ai-summary-content">{summary.content}</p>
                        ) : (
                            <p className="ai-no-data">No summary available yet.</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="ai-section">
                        <h4><Tag size={16} /> Tags</h4>
                        <div className="ai-tags">
                            {docTags.map(tag => {
                                const color = getTagColor(tag);
                                return (
                                    <span key={tag.id} className={`tag-chip ${tag.type === 'PRIORITY' ? 'tag-priority' : ''}`} style={{ borderColor: color, color }}>
                                        {tag.name}
                                    </span>
                                );
                            })}
                            {docTags.length === 0 && <span className="ai-no-data">No tags</span>}
                        </div>
                    </div>

                    {/* Extracted Events */}
                    {docEvents.length > 0 && (
                        <div className="ai-section">
                            <h4><Calendar size={16} /> Extracted Events</h4>
                            {docEvents.map(ev => (
                                <div key={ev.id} className="ai-event-item">
                                    <span className="ai-event-type">{ev.event_type}</span>
                                    <span className="ai-event-title">{ev.title}</span>
                                    <span className="ai-event-date">{formatDate(ev.event_date)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="ai-section">
                        <h4>Metadata</h4>
                        <div className="ai-meta-grid">
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">Uploaded by</span>
                                <span className="ai-meta-value"><User size={14} /> {uploader?.username}</span>
                            </div>
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">Upload date</span>
                                <span className="ai-meta-value">{formatDate(doc.uploaded_at)}</span>
                            </div>
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">File size</span>
                                <span className="ai-meta-value">{formatFileSize(doc.file_size)}</span>
                            </div>
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">Department</span>
                                <span className="ai-meta-value">
                                    {docDepts.length > 0 ? docDepts.map(d => d.name).join(', ') : doc.is_general ? 'General' : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
