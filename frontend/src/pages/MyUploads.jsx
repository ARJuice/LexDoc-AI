import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid3x3, List, ArrowDownUp, Lock, Tag, ChevronDown, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import CustomSelect from '../components/ui/CustomSelect';
import ReAuthModal from '../components/auth/ReAuthModal';
import {
    fetchDocuments, fetchDepartments, fetchTags, fetchSummaries,
    getTagColor, sortTagsByPriority, formatDate, formatFileSize,
    ACCESS_LEVEL_INFO,
    deleteDocument, canUserDeleteDocument
} from '../lib/supabaseData';
import './Documents.css';

export default function MyUploads() {
    const pageRef = useRef(null);
    const navigate = useNavigate();
    const { profile } = useAuth();

    // Filters / view
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('all');
    const [filterTagId, setFilterTagId] = useState('all');
    const [tagSearch, setTagSearch] = useState('');
    const [sortByDate, setSortByDate] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

    // Data
    const [documents, setDocuments] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [tags, setTags] = useState([]);
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);

    // Delete state
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // doc id for single-delete confirm

    const load = useCallback(async () => {
        const [docs, depts, t, sums] = await Promise.all([
            fetchDocuments(), fetchDepartments(), fetchTags(), fetchSummaries()
        ]);
        setDocuments(docs); setDepartments(depts); setTags(t); setSummaries(sums);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Only strict personal uploads
    const myDocs = profile ? documents.filter(doc => doc.uploader_id === profile.id) : [];

    const getDocTags = (doc) => (doc.tag_ids || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const getDocDepts = (doc) => (doc.dept_ids || []).map(id => departments.find(d => d.id === id)).filter(Boolean);
    const getSummary = (docId) => summaries.find(s => s.doc_id === docId);

    const priorityTags = tags.filter(t => t.type === 'PRIORITY');
    const labelTags = tags.filter(t => t.type === 'LABEL');
    const activeTagLabel = filterTagId === 'all'
        ? 'All Tags'
        : (tags.find(t => t.id === Number(filterTagId))?.name ?? 'All Tags');

    const filteredDocs = myDocs
        .filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
            const matchesDept = filterDept === 'all' || (doc.dept_ids || []).includes(Number(filterDept)) || doc.is_general;
            const matchesTagId = filterTagId === 'all' || (doc.tag_ids || []).includes(Number(filterTagId));
            const docTagNames = getDocTags(doc).map(t => t.name.toLowerCase());
            const matchesTagSearch = !tagSearch.trim() || docTagNames.some(n => n.includes(tagSearch.trim().toLowerCase()));
            return matchesSearch && matchesDept && matchesTagId && matchesTagSearch;
        })
        .sort((l, r) => {
            const ld = new Date(l.uploaded_at), rd = new Date(r.uploaded_at);
            return sortByDate === 'oldest' ? ld - rd : rd - ld;
        });

    useEffect(() => {
        if (loading) return;
        gsap.fromTo(pageRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }, [loading]);

    useEffect(() => {
        if (loading) return;
        gsap.fromTo(pageRef.current?.querySelectorAll('.doc-card'),
            { opacity: 0, y: 20, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
        );
    }, [search, filterDept, filterTagId, tagSearch, sortByDate, viewMode, loading]);

    useEffect(() => {
        const handler = (e) => { if (!e.target.closest('.tag-search-bar')) setTagDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ---- Delete handlers ----
    const handleSingleDelete = async (docId) => {
        setDeleting(true);
        try {
            await deleteDocument(docId);
            setDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (e) {
            alert('Delete failed: ' + (e.message || 'Unknown error'));
        }
        setConfirmDeleteId(null);
        setDeleting(false);
    };

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container documents-page">
            <div className="docs-header">
                <div>
                    <h2 className="page-title">My Uploads</h2>
                    <p className="page-subtitle">Documents uploaded by you</p>
                </div>

                <div className="docs-toolbar" style={{ marginTop: 'var(--space-4)' }}>
                    <div className="docs-search">
                        <Search size={16} />
                        <input type="text" placeholder="Search my uploads..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <CustomSelect
                        className="docs-filter-select"
                        value={filterDept}
                        onChange={setFilterDept}
                        options={[{ value: 'all', label: 'All Departments' }, ...departments.map(d => ({ value: d.id, label: d.name }))]}
                    />
                    <div className={`tag-search-bar${tagDropdownOpen ? ' open' : ''}`}>
                        <Tag size={14} className="tag-search-icon" />
                        <button type="button" className="tag-preset-trigger" onClick={() => setTagDropdownOpen(v => !v)} data-hoverable>
                            <span>{activeTagLabel}</span>
                            <ChevronDown size={12} className={`tag-chevron${tagDropdownOpen ? ' rotated' : ''}`} />
                        </button>
                        <span className="tag-search-divider" />
                        <input type="text" className="tag-search-input" placeholder="Search custom tags..." value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} />
                        <div className={`tag-dropdown${tagDropdownOpen ? ' visible' : ''}`}>
                            <button className={`tag-dropdown-item${filterTagId === 'all' ? ' active' : ''}`} onClick={() => { setFilterTagId('all'); setTagDropdownOpen(false); }} data-hoverable>All Tags</button>
                            {priorityTags.length > 0 && (<>
                                <span className="tag-dropdown-section">Priority</span>
                                {priorityTags.map(t => (
                                    <button key={t.id} className={`tag-dropdown-item${filterTagId === String(t.id) ? ' active' : ''}`} onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }} data-hoverable>
                                        <span className="tag-dot" style={{ background: t.color }} />{t.name}
                                    </button>
                                ))}
                            </>)}
                            {labelTags.length > 0 && (<>
                                <span className="tag-dropdown-section">Labels</span>
                                {labelTags.map(t => (
                                    <button key={t.id} className={`tag-dropdown-item${filterTagId === String(t.id) ? ' active' : ''}`} onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }} data-hoverable>
                                        <span className="tag-dot" style={{ background: t.color }} />{t.name}
                                    </button>
                                ))}
                            </>)}
                        </div>
                    </div>
                    <div style={{ zIndex: 40 }}>
                        <CustomSelect className="docs-filter-select" value={sortByDate} onChange={setSortByDate} icon={ArrowDownUp}
                            options={[{ value: 'newest', label: 'Newest Uploads' }, { value: 'oldest', label: 'Oldest Uploads' }]} />
                    </div>
                    <div className={`view-toggle mode-${viewMode}`}>
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
                    
                    // In MyUploads, any uploader can delete within 1 hour
                    const canDelete = canUserDeleteDocument(doc, profile); 

                    return (
                        <div
                            key={doc.id}
                            className="doc-card card"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            data-hoverable
                        >
                            <div className="doc-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <FileText size={20} className="doc-card-icon" />
                                </div>
                                <div className="doc-card-header-right">
                                    {isRestricted && <Lock size={14} style={{ color: levelInfo.color }} />}
                                    <span className="doc-access-badge" style={{ color: levelInfo.color, borderColor: levelInfo.color }}>{levelInfo.label}</span>
                                    <span className="doc-card-size">{formatFileSize(doc.file_size)}</span>
                                    
                                    {/* Per-doc delete button (within 1 hr window) */}
                                    {canDelete && (
                                        <button
                                            className="doc-delete-btn"
                                            title="Delete document"
                                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id); }}
                                            data-hoverable
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
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

            {/* Secure Re-Auth Modal for Deletion */}
            <ReAuthModal 
                isOpen={!!confirmDeleteId} 
                onClose={() => setConfirmDeleteId(null)} 
                onConfirm={() => handleSingleDelete(confirmDeleteId)} 
                actionName="Delete Document Permanently" 
            />
        </div>
    );
}
