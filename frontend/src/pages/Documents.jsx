import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid3x3, List, ArrowDownUp, Lock, Tag, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import {
    fetchDocuments, fetchDepartments, fetchTags, fetchSummaries,
    getTagColor, sortTagsByPriority, formatDate, formatFileSize,
    filterDocumentsByAccess, ACCESS_LEVEL_INFO
} from '../lib/supabaseData';
import './Documents.css';

export default function Documents() {
    const pageRef = useRef(null);
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    // Tag filter: either a preset tag ID (number) or '' for "all"
    const [filterTagId, setFilterTagId] = useState('all');
    // Custom tag text search (matches tag names)
    const [tagSearch, setTagSearch] = useState('');
    const [sortByDate, setSortByDate] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

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

    // Apply role-based access filter
    const accessibleDocs = filterDocumentsByAccess(documents, profile);

    const getDocTags = (doc) => (doc.tag_ids || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const getDocDepts = (doc) => (doc.dept_ids || []).map(id => departments.find(d => d.id === id)).filter(Boolean);
    const getSummary = (docId) => summaries.find(s => s.doc_id === docId);

    // Split tags into preset (PRIORITY + LABEL) vs custom
    const presetTags = tags.filter(t => t.type === 'PRIORITY' || t.type === 'LABEL');
    const priorityTags = tags.filter(t => t.type === 'PRIORITY');
    const labelTags = tags.filter(t => t.type === 'LABEL');

    // Determine active tag filter label for the dropdown button
    const activeTagLabel = filterTagId === 'all'
        ? 'All Tags'
        : (tags.find(t => t.id === Number(filterTagId))?.name ?? 'All Tags');

    const filteredDocs = accessibleDocs
        .filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
            const matchesDept = filterDept === 'all' || (doc.dept_ids || []).includes(Number(filterDept)) || doc.is_general;

            // Preset tag filter (by ID)
            const matchesTagId = filterTagId === 'all' || (doc.tag_ids || []).includes(Number(filterTagId));

            // Custom tag text search (by name substring across all linked tags)
            const docTagNames = getDocTags(doc).map(t => t.name.toLowerCase());
            const matchesTagSearch = !tagSearch.trim() || docTagNames.some(n => n.includes(tagSearch.trim().toLowerCase()));

            return matchesSearch && matchesDept && matchesTagId && matchesTagSearch;
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
    }, [search, filterDept, filterTagId, tagSearch, sortByDate, viewMode, loading]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('.tag-search-bar')) setTagDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container documents-page">
            <div className="docs-header">
                <h2 className="page-title">Documents</h2>
                <div className="docs-toolbar">
                    {/* Document title search */}
                    <div className="docs-search">
                        <Search size={16} />
                        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select className="docs-filter" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                        <option value="all">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    {/* Combined tag search bar: priority/label dropdown + custom tag text */}
                    <div className={`tag-search-bar${tagDropdownOpen ? ' open' : ''}`}>
                        <Tag size={14} className="tag-search-icon" />
                        <button
                            type="button"
                            className="tag-preset-trigger"
                            onClick={() => setTagDropdownOpen(v => !v)}
                            data-hoverable
                        >
                            <span>{activeTagLabel}</span>
                            <ChevronDown size={12} className={`tag-chevron${tagDropdownOpen ? ' rotated' : ''}`} />
                        </button>
                        <span className="tag-search-divider" />
                        <input
                            type="text"
                            className="tag-search-input"
                            placeholder="Search custom tags..."
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                        />
                        {/* Dropdown panel */}
                        {tagDropdownOpen && (
                            <div className="tag-dropdown">
                                <button
                                    className={`tag-dropdown-item${filterTagId === 'all' ? ' active' : ''}`}
                                    onClick={() => { setFilterTagId('all'); setTagDropdownOpen(false); }}
                                    data-hoverable
                                >All Tags</button>
                                {priorityTags.length > 0 && (
                                    <>
                                        <span className="tag-dropdown-section">Priority</span>
                                        {priorityTags.map(t => (
                                            <button
                                                key={t.id}
                                                className={`tag-dropdown-item${filterTagId === String(t.id) ? ' active' : ''}`}
                                                style={{ '--tag-color': t.color }}
                                                onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }}
                                                data-hoverable
                                            >
                                                <span className="tag-dot" style={{ background: t.color }} />
                                                {t.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                                {labelTags.length > 0 && (
                                    <>
                                        <span className="tag-dropdown-section">Labels</span>
                                        {labelTags.map(t => (
                                            <button
                                                key={t.id}
                                                className={`tag-dropdown-item${filterTagId === String(t.id) ? ' active' : ''}`}
                                                style={{ '--tag-color': t.color }}
                                                onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }}
                                                data-hoverable
                                            >
                                                <span className="tag-dot" style={{ background: t.color }} />
                                                {t.name}
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>

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
                    const docTags = sortTagsByPriority(getDocTags(doc));
                    const docDepts = getDocDepts(doc);
                    const summary = getSummary(doc.id);
                    const levelInfo = ACCESS_LEVEL_INFO[doc.access_level] || ACCESS_LEVEL_INFO.PUBLIC;
                    const isRestricted = doc.access_level === 'PRIVATE' || doc.access_level === 'CONFIDENTIAL';
                    return (
                        <div key={doc.id} className="doc-card card" onClick={() => navigate(`/documents/${doc.id}`)} data-hoverable>
                            <div className="doc-card-header">
                                <FileText size={20} className="doc-card-icon" />
                                <div className="doc-card-header-right">
                                    {isRestricted && <Lock size={14} style={{ color: levelInfo.color }} />}
                                    <span className="doc-access-badge" style={{ color: levelInfo.color, borderColor: levelInfo.color }}>
                                        {levelInfo.label}
                                    </span>
                                    <span className="doc-card-size">{formatFileSize(doc.file_size)}</span>
                                    <span className="doc-card-date">{formatDate(doc.uploaded_at)}</span>
                                </div>
                            </div>
                            <h4 className="doc-card-title">{doc.title}</h4>
                            {summary
                                ? <p className="doc-card-summary">{summary.content.slice(0, 120)}...</p>
                                : <p className="doc-card-summary" style={{ fontStyle: 'italic' }}>No summary available yet.</p>
                            }
                            <div className="doc-card-dept">
                                {docDepts.length > 0 ? docDepts.map(d => d.name).join(', ') : doc.is_general ? 'General' : '—'}
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
                    <p>No documents found matching your filters.</p>
                </div>
            )}
        </div>
    );
}
