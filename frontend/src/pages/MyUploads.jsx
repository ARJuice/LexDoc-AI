import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid3x3, List, ArrowDownUp, Lock } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import {
    fetchDocuments, fetchDepartments, fetchTags, fetchSummaries,
    getTagColor, sortTagsByPriority, formatDate, formatFileSize,
    ACCESS_LEVEL_INFO
} from '../lib/supabaseData';
import './Documents.css';

export default function MyUploads() {
    const pageRef = useRef(null);
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [filterTag, setFilterTag] = useState('all');
    const [sortByDate, setSortByDate] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    
    const [documents, setDocuments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tags, setTags] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [docs, depts, t, sums] = await Promise.all([
                fetchDocuments(), fetchDepartments(), fetchTags(), fetchSummaries()
            ]);
            setDocuments(docs); setDepartments(depts); setTags(t); setSummaries(sums);
            setLoading(false);
        }
        load();
    }, []);

    const myDocs = profile ? documents.filter(doc => doc.uploader_id === profile.id) : [];

    const getDocTags = (doc) => (doc.tag_ids || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const getDocDepts = (doc) => (doc.dept_ids || []).map(id => departments.find(d => d.id === id)).filter(Boolean);
    const getSummary = (docId) => summaries.find(s => s.doc_id === docId);

    const filteredDocs = myDocs
        .filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
            const matchesDept = filterDept === 'all' || (doc.dept_ids || []).includes(Number(filterDept)) || doc.is_general;
            const matchesTag = filterTag === 'all' || (doc.tag_ids || []).includes(Number(filterTag));
            return matchesSearch && matchesDept && matchesTag;
        })
        .sort((left, right) => {
            const leftDate = new Date(left.uploaded_at);
            const rightDate = new Date(right.uploaded_at);
            return sortByDate === 'oldest' ? leftDate - rightDate : rightDate - leftDate;
        });

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }, [loading]);

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el.querySelectorAll('.doc-card'),
            { opacity: 0, y: 20, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
    }, [search, filterDept, filterTag, sortByDate, viewMode, loading]);

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading your uploads...</p></div>;
    }


    return (
        <div ref={pageRef} className="page-container documents-page">
            <div className="docs-header">
                <h2 className="page-title">My Uploads</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
                    {myDocs.length} document{myDocs.length !== 1 ? 's' : ''} uploaded by you
                </p>
                <div className="docs-toolbar">
                    <div className="docs-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search your uploads..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="docs-filter" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                        <option value="all">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select className="docs-filter" value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
                        <option value="all">All Tags</option>
                        {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <div className="docs-sort-wrap">
                        <ArrowDownUp size={16} />
                        <select className="docs-filter" value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
                            <option value="newest">Newest Uploads</option>
                            <option value="oldest">Oldest Uploads</option>
                        </select>
                    </div>
                    <div className="view-toggle">
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} data-hoverable><Grid3x3 size={16} /></button>
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} data-hoverable><List size={16} /></button>
                    </div>
                </div>
            </div>

            <div className={`docs-grid ${viewMode}`}>
                {filteredDocs.map(doc => {
                    const docTags = sortTagsByPriority(getDocumentTags(doc));
                    const docDepts = getDocumentDepartments(doc);
                    const summary = getSummaryByDocId(doc.id);
                    return (
                        <div key={doc.id} className="doc-card card" onClick={() => navigate(`/documents/${doc.id}`)} data-hoverable>
                            <div className="doc-card-header">
                                <FileText size={20} className="doc-card-icon" />
                                <span className="doc-card-size">{formatFileSize(doc.file_size)}</span>
                            </div>
                            <h4 className="doc-card-title">{doc.title}</h4>
                            {summary && <p className="doc-card-summary">{summary.content.slice(0, 120)}...</p>}
                            <div className="doc-card-dept">
                                {docDepts.length > 0
                                    ? docDepts.map(d => d.name).join(', ')
                                    : doc.is_general ? 'General' : '—'}
                            </div>
                            <div className="doc-card-tags">
                                {docTags.map(tag => {
                                    const color = getTagColor(tag);
                                    return (
                                        <span key={tag.id} className={`tag-chip ${tag.type === 'PRIORITY' ? 'tag-priority' : ''}`} style={{ borderColor: color, color }}>
                                            {tag.name}
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="doc-card-footer">
                                <span>{formatDate(doc.uploaded_at)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredDocs.length === 0 && (
                <div className="docs-empty">
                    <FileText size={48} />
                    <p>No uploads found matching your filters.</p>
                </div>
            )}
        </div>
    );
}
