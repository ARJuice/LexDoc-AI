import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid3x3, List, ArrowDownUp, Lock, Tag, ChevronDown, Trash2, CheckSquare, Square } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import CustomSelect from '../components/ui/CustomSelect';
import ReAuthModal from '../components/auth/ReAuthModal';
import {
    fetchDocuments, fetchDepartments, fetchTags, fetchSummaries,
    getTagColor, sortTagsByPriority, formatDate, formatFileSize,
    filterDocumentsByAccess, ACCESS_LEVEL_INFO,
    deleteDocument, bulkDeleteDocuments,
    canUserDeleteDocument, canUserBulkDelete
} from '../lib/supabaseData';
import './Documents.css';

export default function Documents() {
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
    const [bulkMode, setBulkMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [deleting, setDeleting] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'single', id } or { type: 'bulk' }

    const roleLevel = profile?.roles?.access_level || 0;
    const isBulkAllowed = canUserBulkDelete(profile);

    const load = useCallback(async () => {
        const [docs, depts, t, sums] = await Promise.all([
            fetchDocuments(), fetchDepartments(), fetchTags(), fetchSummaries()
        ]);
        setDocuments(docs); setDepartments(depts); setTags(t); setSummaries(sums);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Apply role-based access filter for all documents
    const accessibleDocs = filterDocumentsByAccess(documents, profile);

    const getDocTags = (doc) => (doc.tag_ids || []).map(id => tags.find(t => t.id === id)).filter(Boolean);
    const getDocDepts = (doc) => (doc.dept_ids || []).map(id => departments.find(d => d.id === id)).filter(Boolean);
    const getSummary = (docId) => summaries.find(s => s.doc_id === docId);

    const presetTags = tags.filter(t => t.type === 'PRIORITY' || t.type === 'LABEL');
    const priorityTags = tags.filter(t => t.type === 'PRIORITY');
    const labelTags = tags.filter(t => t.type === 'LABEL');

    const activeTagLabel = filterTagId === 'all'
        ? 'All Tags'
        : (tags.find(t => t.id === Number(filterTagId))?.name ?? 'All Tags');

    const filteredDocs = accessibleDocs
        .filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
            const matchesDept = filterDept === 'all' || (doc.dept_ids || []).includes(Number(filterDept)) || doc.is_general;
            const matchesTagId = filterTagId === 'all' || (doc.tag_ids || []).includes(Number(filterTagId));
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

    useEffect(() => {
        const handler = (e) => { if (!e.target.closest('.tag-search-bar')) setTagDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ---- Delete handlers ----
    const executeDelete = async () => {
        if (!confirmAction) return;
        setDeleting(true);

        try {
            if (confirmAction.type === 'single') {
                await deleteDocument(confirmAction.id);
                setDocuments(prev => prev.filter(d => d.id !== confirmAction.id));
            } else if (confirmAction.type === 'bulk') {
                await bulkDeleteDocuments([...selectedIds]);
                setDocuments(prev => prev.filter(d => !selectedIds.has(d.id)));
                setSelectedIds(new Set());
                setBulkMode(false);
            }
        } catch (e) {
            alert('Delete failed: ' + (e.message || 'Unknown error'));
        }

        setConfirmAction(null);
        setDeleting(false);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredDocs.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDocs.map(d => d.id)));
        }
    };

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container documents-page">
            <div className="docs-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div>
                        <h2 className="page-title">{roleLevel >= 7 ? 'Document Management' : 'All Documents'}</h2>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--fs-sm)', marginTop: 'var(--space-1)' }}>
                            {accessibleDocs.length} accessible document{accessibleDocs.length !== 1 ? 's' : ''} in the system
                        </p>
                    </div>

                    {/* Bulk mode toggle */}
                    {isBulkAllowed && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                            {bulkMode && selectedIds.size > 0 && (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setConfirmAction({ type: 'bulk' })}
                                    disabled={deleting}
                                    data-hoverable
                                    style={{ fontSize: 'var(--fs-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                >
                                    <Trash2 size={14} />
                                    Delete {selectedIds.size} selected
                                </button>
                            )}
                            <button
                                className={`btn ${bulkMode ? 'btn-secondary' : 'btn-ghost'}`}
                                onClick={() => { setBulkMode(v => !v); setSelectedIds(new Set()); }}
                                data-hoverable
                                style={{ fontSize: 'var(--fs-sm)', padding: 'var(--space-2) var(--space-4)' }}
                            >
                                <CheckSquare size={14} />
                                {bulkMode ? 'Cancel' : 'Select'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Bulk mode: select all bar */}
                {bulkMode && (
                    <div className="bulk-select-bar">
                        <button className="bulk-select-all" onClick={toggleSelectAll} data-hoverable>
                            {selectedIds.size === filteredDocs.length
                                ? <CheckSquare size={14} style={{ color: 'var(--color-primary)' }} />
                                : <Square size={14} />
                            }
                            {selectedIds.size === filteredDocs.length ? 'Deselect all' : 'Select all'}
                        </button>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                            {selectedIds.size} of {filteredDocs.length} selected
                        </span>
                    </div>
                )}

                <div className="docs-toolbar">
                    <div className="docs-search">
                        <Search size={16} />
                        <input type="text" placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <CustomSelect
                        className="docs-filter-select"
                        value={filterDept}
                        onChange={setFilterDept}
                        options={[
                            { value: 'all', label: 'All Departments' },
                            ...departments.map(d => ({ value: d.id, label: d.name }))
                        ]}
                    />

                    <div className={`tag-search-bar${tagDropdownOpen ? ' open' : ''}`}>
                        <Tag size={14} className="tag-search-icon" />
                        <button type="button" className="tag-preset-trigger" onClick={() => setTagDropdownOpen(v => !v)} data-hoverable>
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

                        <div className={`tag-dropdown${tagDropdownOpen ? ' visible' : ''}`}>
                            <button
                                className={`tag-dropdown-item${filterTagId === 'all' ? ' active' : ''}`}
                                onClick={() => { setFilterTagId('all'); setTagDropdownOpen(false); }}
                                data-hoverable
                            >
                                All Tags
                            </button>

                            {priorityTags.length > 0 && (
                                <>
                                    <span className="tag-dropdown-section">Priority</span>
                                    {priorityTags.map(t => (
                                        <button
                                            key={t.id}
                                            className={`tag-dropdown-item${filterTagId === String(t.id) ? ' active' : ''}`}
                                            onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }}
                                            data-hoverable
                                        >
                                            <span className="tag-dot" style={{ background: t.color }}></span>
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
                                            onClick={() => { setFilterTagId(String(t.id)); setTagDropdownOpen(false); }}
                                            data-hoverable
                                        >
                                            <span className="tag-dot" style={{ background: t.color }}></span>
                                            {t.name}
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div style={{ zIndex: 40 }}>
                        <CustomSelect
                            className="docs-filter-select"
                            value={sortByDate}
                            onChange={setSortByDate}
                            icon={ArrowDownUp}
                            options={[
                                { value: 'newest', label: 'Newest Uploads' },
                                { value: 'oldest', label: 'Oldest Uploads' }
                            ]}
                        />
                    </div>

                    <div className={`view-toggle mode-${viewMode}`}>
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')} data-hoverable>
                            <Grid3x3 size={16} />
                        </button>
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} data-hoverable>
                            <List size={16} />
                        </button>
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
                    const canDelete = canUserDeleteDocument(doc, profile);
                    const isSelected = selectedIds.has(doc.id);

                    return (
                        <div 
                            key={doc.id} 
                            className={`doc-card card ${bulkMode && isSelected ? 'selected' : ''}`}
                            onClick={() => bulkMode ? toggleSelect(doc.id) : navigate(`/documents/${doc.id}`)}
                            data-hoverable
                            style={bulkMode ? { cursor: 'pointer', outline: isSelected ? '2px solid var(--color-primary)' : 'none' } : {}}
                        >
                            <div className="doc-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    {bulkMode && (
                                        <span style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                                            {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                        </span>
                                    )}
                                    <FileText size={20} className="doc-card-icon" />
                                </div>
                                <div className="doc-card-header-right">
                                    {isRestricted && <Lock size={14} style={{ color: levelInfo.color }} />}
                                    <span className="doc-access-badge" style={{ color: levelInfo.color, borderColor: levelInfo.color }}>
                                        {levelInfo.label}
                                    </span>
                                    <span className="doc-card-size">{formatFileSize(doc.file_size)}</span>
                                    
                                    {/* Per-doc delete button */}
                                    {!bulkMode && canDelete && (
                                        <button
                                            className="doc-delete-btn"
                                            title="Delete document"
                                            onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'single', id: doc.id }); }}
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
                                : <p className="doc-card-summary" style={{ fontStyle: 'italic' }}>No summary generated</p>
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
                isOpen={!!confirmAction} 
                onClose={() => setConfirmAction(null)} 
                onConfirm={executeDelete} 
                actionName={confirmAction?.type === 'bulk' ? `Permanently Delete ${selectedIds.size} Documents` : 'Permanently Delete Document'} 
            />
        </div>
    );
}
