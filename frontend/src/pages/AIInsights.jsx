import { useEffect, useRef, useState } from 'react';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, Clock, FileText, BarChart3 } from 'lucide-react';
import gsap from 'gsap';
import {
    fetchDocuments, fetchSummaries, fetchEvents, fetchTags,
    formatDate, getDaysUntil
} from '../lib/supabaseData';
import './AIInsights.css';

export default function AIInsights() {
    const pageRef = useRef(null);

    const [documents, setDocuments] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [events, setEvents] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [docs, sums, evts, t] = await Promise.all([
                fetchDocuments(), fetchSummaries(), fetchEvents(), fetchTags()
            ]);
            setDocuments(docs); setSummaries(sums); setEvents(evts); setTags(t);
            setLoading(false);
        }
        load();
    }, []);

    // Most discussed topics = tag frequency
    const tagFreq = {};
    documents.forEach(doc => {
        (doc.tag_ids || []).forEach(tid => {
            tagFreq[tid] = (tagFreq[tid] || 0) + 1;
        });
    });
    const topTags = Object.entries(tagFreq)
        .map(([id, count]) => ({ tag: tags.find(t => t.id === Number(id)), count }))
        .filter(t => t.tag)
        .sort((a, b) => b.count - a.count);

    const maxTagCount = Math.max(...topTags.map(t => t.count), 1);

    // Recent summaries
    const recentSummaries = [...summaries]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

    // High priority docs (tag_id 1 = HIGH typically, but check dynamically)
    const priorityTag = tags.find(t => t.type === 'PRIORITY' && t.name?.toUpperCase() === 'HIGH');
    const highPriorityDocs = priorityTag ? documents.filter(d => (d.tag_ids || []).includes(priorityTag.id)) : [];

    // Upcoming events
    const upcomingEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('.insight-card'),
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
    }, [loading]);

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading insights...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container insights-page">
            <h2 className="page-title"><Sparkles size={28} className="title-icon" /> AI Insights</h2>
            <p className="page-subtitle">AI-powered document intelligence across your organization.</p>

            <div className="insights-grid">
                {/* Most Discussed Topics */}
                <div className="insight-card">
                    <h3><BarChart3 size={18} /> Most Discussed Topics</h3>
                    <div className="tag-bars">
                        {topTags.length === 0 && <p className="ai-no-data">No tag data yet.</p>}
                        {topTags.map(({ tag, count }) => (
                            <div key={tag.id} className="tag-bar-row">
                                <span className="tag-bar-label" style={{ color: tag.color }}>{tag.name}</span>
                                <div className="tag-bar-track">
                                    <div
                                        className="tag-bar-fill"
                                        style={{ width: `${(count / maxTagCount) * 100}%`, background: tag.color }}
                                    />
                                </div>
                                <span className="tag-bar-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Highlights */}
                <div className="insight-card">
                    <h3><TrendingUp size={18} /> AI Highlights</h3>
                    <div className="highlights-list">
                        <div className="highlight-item danger">
                            <AlertTriangle size={16} />
                            <span><strong>{highPriorityDocs.length}</strong> high-priority documents require attention</span>
                        </div>
                        <div className="highlight-item accent">
                            <FileText size={16} />
                            <span><strong>{summaries.length}</strong> summaries generated from {documents.length} documents</span>
                        </div>
                        <div className="highlight-item primary">
                            <Calendar size={16} />
                            <span><strong>{events.filter(e => getDaysUntil(e.event_date) >= 0 && getDaysUntil(e.event_date) <= 30).length}</strong> deadlines in the next 30 days</span>
                        </div>
                    </div>
                </div>

                {/* Recent Summaries */}
                <div className="insight-card full-width">
                    <h3><FileText size={18} /> Recent Summaries</h3>
                    <div className="summaries-list">
                        {recentSummaries.length === 0 && (
                            <p className="ai-no-data">No summaries generated yet. AI summaries will appear here once the model is connected.</p>
                        )}
                        {recentSummaries.map(s => {
                            const doc = documents.find(d => d.id === s.doc_id);
                            return (
                                <div key={s.id} className="summary-item" data-hoverable>
                                    <div className="summary-header">
                                        <span className="summary-doc-title">{doc?.title || 'Unknown'}</span>
                                        <span className="summary-date">{formatDate(s.created_at)}</span>
                                    </div>
                                    <p className="summary-preview">{s.content.slice(0, 180)}...</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Deadlines & Events */}
                <div className="insight-card full-width">
                    <h3><Calendar size={18} /> Upcoming Deadlines & Events</h3>
                    <div className="events-timeline">
                        {upcomingEvents.length === 0 && <p className="ai-no-data">No upcoming events.</p>}
                        {upcomingEvents.map(event => {
                            const daysUntil = getDaysUntil(event.event_date);
                            const isPast = daysUntil < 0;
                            const isUrgent = daysUntil >= 0 && daysUntil <= 7;
                            return (
                                <div key={event.id} className={`timeline-item ${isUrgent ? 'urgent' : ''} ${isPast ? 'past' : ''}`}>
                                    <div className="timeline-dot" />
                                    <div className="timeline-content">
                                        <div className="timeline-type">
                                            {event.event_type === 'DEADLINE' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                                            <span>{event.event_type}</span>
                                        </div>
                                        <div className="timeline-title">{event.title}</div>
                                        <div className="timeline-desc">{event.description}</div>
                                        <div className="timeline-meta">
                                            <span>{formatDate(event.event_date)}</span>
                                            <span className={`countdown-pill ${isUrgent ? 'urgent' : ''} ${isPast ? 'overdue' : ''}`}>
                                                {isPast ? 'Overdue' : `${daysUntil} days left`}
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
