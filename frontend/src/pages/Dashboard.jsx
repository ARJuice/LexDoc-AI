import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Sparkles, Clock, Calendar, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import {
    fetchDocuments, fetchSummaries, fetchEvents,
    formatDate, getDaysUntil, getTagColor, sortTagsByPriority
} from '../lib/supabaseData';
import './Dashboard.css';

export default function Dashboard() {
    const pageRef = useRef(null);
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [documents, setDocuments] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [events, setEvents] = useState([]);
    const [tags, setTags] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [docs, sums, evts] = await Promise.all([
                fetchDocuments(),
                fetchSummaries(),
                fetchEvents(),
            ]);
            // Also fetch tags and departments for display
            const { fetchTags, fetchDepartments } = await import('../lib/supabaseData');
            const [t, d] = await Promise.all([fetchTags(), fetchDepartments()]);
            setDocuments(docs);
            setSummaries(sums);
            setEvents(evts);
            setTags(t);
            setDepartments(d);
            setLoading(false);
        }
        load();
    }, []);

    const totalDocs = documents.length;
    const myUploads = profile ? documents.filter(d => d.uploader_id === profile.id).length : 0;
    const totalSummaries = summaries.length;
    const recentDocs = [...documents].sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)).slice(0, 5);
    const upcomingEvents = [...events].sort(
        (a, b) => new Date(`${a.event_date}T${a.event_time || '00:00'}`) - new Date(`${b.event_date}T${b.event_time || '00:00'}`)
    );

    // Helper to resolve tags/depts from IDs
    const getDocTags = (doc) => (doc.tag_ids || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const getDocDepts = (doc) => (doc.dept_ids || []).map(id => departments.find(d => d.id === id)).filter(Boolean);
    const getUploader = (doc) => doc.uploader_id === profile?.id ? profile : null;

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('.stat-card'),
            { opacity: 0, y: 24, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.15 }
        );
        gsap.fromTo(el.querySelectorAll('.doc-row'),
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.4 }
        );
        gsap.fromTo(el.querySelectorAll('.event-item'),
            { opacity: 0, x: 16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.5 }
        );
    }, [loading]);

    const firstName = profile?.username
        ? profile.username.split('.')[0].charAt(0).toUpperCase() + profile.username.split('.')[0].slice(1)
        : 'there';

    if (loading) {
        return (
            <div className="page-container dashboard">
                <p style={{ color: 'var(--color-text-muted)' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div ref={pageRef} className="page-container dashboard">
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Welcome back, {firstName}</p>

            {/* Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                        <FileText size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{totalDocs}</div>
                        <div className="stat-label">Total Documents</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
                        <Upload size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{myUploads}</div>
                        <div className="stat-label">My Uploads</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366F1' }}>
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <div className="stat-value">{totalSummaries}</div>
                        <div className="stat-label">Summaries Generated</div>
                    </div>
                </div>
            </div>

            {/* Main content: recent docs + events */}
            <div className="dashboard-grid">
                {/* Recent Documents */}
                <div className="dashboard-section">
                    <h3 className="section-title">Recent Documents</h3>
                    <div className="doc-list">
                        {recentDocs.length === 0 && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', padding: 'var(--space-4)' }}>
                                No documents yet. Upload one to get started!
                            </p>
                        )}
                        {recentDocs.map(doc => {
                            const docTags = sortTagsByPriority(getDocTags(doc));
                            const docDepts = getDocDepts(doc);
                            return (
                                <div key={doc.id} className="doc-row card" onClick={() => navigate(`/documents/${doc.id}`)} data-hoverable>
                                    <div className="doc-row-main">
                                        <FileText size={18} className="doc-row-icon" />
                                        <div>
                                            <div className="doc-row-title">{doc.title}</div>
                                            <div className="doc-row-meta">
                                                <span>{formatDate(doc.uploaded_at)}</span>
                                                {docDepts.length > 0 && (
                                                    <><span>·</span><span className="doc-row-dept">{docDepts.map(d => d.name).join(', ')}</span></>
                                                )}
                                                {doc.is_general && !docDepts.length && (
                                                    <><span>·</span><span className="doc-row-dept">General</span></>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="doc-row-tags">
                                        {docTags.map(tag => {
                                            const color = getTagColor(tag);
                                            return (
                                                <span key={tag.id} className={`tag-chip ${tag.type === 'PRIORITY' ? 'tag-priority' : ''}`} style={{ borderColor: color, color }}>
                                                    {tag.name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events & Notifications */}
                <div className="dashboard-section notifications-panel">
                    <h3 className="section-title">
                        <Calendar size={18} /> Upcoming Events & Deadlines
                    </h3>
                    <div className="events-list" data-lenis-prevent>
                        {upcomingEvents.length === 0 && (
                            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-sm)', padding: 'var(--space-4)' }}>
                                No upcoming events.
                            </p>
                        )}
                        {upcomingEvents.map((event, index) => {
                            const daysUntil = getDaysUntil(event.event_date);
                            const isUrgent = daysUntil <= 7;
                            const isPast = daysUntil < 0;
                            return (
                                <div key={event.id} className={`event-row ${isPast ? 'past' : ''}`}>
                                    <div className="event-rail" aria-hidden="true">
                                        <span className="event-timeline-dot"></span>
                                        {index < upcomingEvents.length - 1 && <span className="event-timeline-line"></span>}
                                    </div>
                                    <div className={`event-item ${isUrgent ? 'urgent' : ''} ${isPast ? 'past' : ''}`}>
                                        <div className="event-type-badge">
                                            {event.event_type === 'DEADLINE' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                            <span>{event.event_type}</span>
                                        </div>
                                        <div className="event-title">{event.title}</div>
                                        <div className="event-description">{event.description}</div>
                                        <div className="event-footer">
                                            <span className="event-date">{formatDate(event.event_date)}</span>
                                            <span className={`event-countdown ${isUrgent ? 'badge-danger' : 'badge-accent'}`}>
                                                {isPast ? 'Overdue' : `${daysUntil}d left`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
