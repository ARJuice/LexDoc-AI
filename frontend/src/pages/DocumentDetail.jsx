import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Download, ZoomIn, ZoomOut, FileText, Tag, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { supabase } from '../lib/supabase';
import {
    fetchDocumentById, fetchSummaryByDocId, fetchTags, fetchDepartments, fetchEventsByDocId,
    getTagColor, sortTagsByPriority, formatDate, formatFileSize,
    generateSummary
} from '../lib/supabaseData';
import './DocumentDetail.css';

// Lazy-load docx-preview only when needed
let renderDocxAsync = null;

async function loadDocxPreview() {
    if (!renderDocxAsync) {
        const mod = await import('docx-preview');
        renderDocxAsync = mod.renderAsync;
    }
    return renderDocxAsync;
}

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const pageRef = useRef(null);
    const docxContainerRef = useRef(null);

    const [doc, setDoc] = useState(null);
    const [summary, setSummary] = useState(null);
    const [tags, setTags] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [docEvents, setDocEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // AI Summary generation state
    const [generating, setGenerating] = useState(false);
    const [genError, setGenError] = useState(null);
    const [genStep, setGenStep] = useState(0);
    const summaryRef = useRef(null);
    const genStepRef = useRef(null);

    const GEN_STEPS = [
        { text: 'Downloading document...', delay: 0 },
        { text: 'Parsing document via LlamaParse...', delay: 2000 },
        { text: 'Connecting to Arcee AI Trinity...', delay: 12000 },
        { text: 'Generating summary...', delay: 18000 },
        { text: 'Extracting events & deadlines...', delay: 25000 },
        { text: 'Almost done, finalizing...', delay: 35000 },
    ];

    // Cycle through generation steps
    useEffect(() => {
        if (!generating) { setGenStep(0); return; }
        const timers = GEN_STEPS.slice(1).map((step, i) =>
            setTimeout(() => {
                setGenStep(i + 1);
                if (genStepRef.current) {
                    gsap.fromTo(genStepRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
                }
            }, step.delay)
        );
        return () => timers.forEach(clearTimeout);
    }, [generating]);

    // Viewer state
    const [fileUrl, setFileUrl] = useState(null);
    const [fileBlob, setFileBlob] = useState(null);
    const [viewerLoading, setViewerLoading] = useState(true);
    const [viewerError, setViewerError] = useState(null);
    const [zoom, setZoom] = useState(100);

    // Determine file type from mime or extension
    const getFileType = useCallback(() => {
        if (!doc) return 'unknown';
        const mime = doc.mime_type || '';
        const path = doc.storage_path || '';

        if (mime === 'application/pdf' || path.endsWith('.pdf')) return 'pdf';
        if (mime.includes('wordprocessingml') || mime.includes('msword') || path.endsWith('.docx') || path.endsWith('.doc')) return 'docx';
        if (mime.startsWith('text/') || path.endsWith('.txt')) return 'text';
        if (mime.startsWith('image/')) return 'image';
        return 'unknown';
    }, [doc]);

    useEffect(() => {
        async function load() {
            const [d, s, t, depts, evts] = await Promise.all([
                fetchDocumentById(Number(id)),
                fetchSummaryByDocId(Number(id)),
                fetchTags(),
                fetchDepartments(),
                fetchEventsByDocId(Number(id)),
            ]);
            setDoc(d); setSummary(s); setTags(t); setDepartments(depts); setDocEvents(evts);
            setLoading(false);
        }
        load();
    }, [id]);

    // Fetch signed URL + blob when doc is loaded
    useEffect(() => {
        if (!doc || !doc.storage_path) return;

        async function fetchFile() {
            setViewerLoading(true);
            setViewerError(null);

            try {
                // Get a signed URL (valid 1 hour)
                const { data: signedData, error: signedError } = await supabase.storage
                    .from(doc.storage_bucket || 'docs')
                    .createSignedUrl(doc.storage_path, 3600);

                if (signedError) throw signedError;

                setFileUrl(signedData.signedUrl);

                // For DOCX and text, also fetch the blob
                const fileType = (() => {
                    const mime = doc.mime_type || '';
                    const path = doc.storage_path || '';
                    if (mime === 'application/pdf' || path.endsWith('.pdf')) return 'pdf';
                    if (mime.includes('wordprocessingml') || mime.includes('msword') || path.endsWith('.docx') || path.endsWith('.doc')) return 'docx';
                    if (mime.startsWith('text/') || path.endsWith('.txt')) return 'text';
                    if (mime.startsWith('image/')) return 'image';
                    return 'unknown';
                })();

                if (fileType === 'docx' || fileType === 'text') {
                    const { data: downloadData, error: downloadError } = await supabase.storage
                        .from(doc.storage_bucket || 'docs')
                        .download(doc.storage_path);

                    if (downloadError) throw downloadError;
                    setFileBlob(downloadData);
                }

                setViewerLoading(false);
            } catch (err) {
                console.error('File fetch error:', err);
                setViewerError(err.message || 'Failed to load document file.');
                setViewerLoading(false);
            }
        }

        fetchFile();
    }, [doc]);

    // Render DOCX when blob is ready
    useEffect(() => {
        if (!fileBlob || !docxContainerRef.current || getFileType() !== 'docx') return;

        const container = docxContainerRef.current;
        container.innerHTML = '';

        loadDocxPreview().then(renderAsync => {
            renderAsync(fileBlob, container, undefined, {
                className: 'docx-viewer-content',
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                renderHeaders: true,
                renderFooters: true,
                renderFootnotes: true,
            }).catch(err => {
                console.error('DOCX render error:', err);
                setViewerError('Failed to render DOCX file.');
            });
        });
    }, [fileBlob, getFileType]);

    const docTags = doc ? sortTagsByPriority((doc.tag_ids || []).map(tid => tags.find(t => t.id === tid)).filter(Boolean)) : [];
    const docDepts = doc ? (doc.dept_ids || []).map(did => departments.find(d => d.id === did)).filter(Boolean) : [];

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        const pdf = el.querySelector('.detail-pdf');
        const ai = el.querySelector('.detail-ai');
        if (pdf) gsap.fromTo(pdf, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: 'power2.out' });
        if (ai) gsap.fromTo(ai, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: 'power2.out' });
    }, [loading, id]);

    if (loading) {
        return <div className="page-container"><p style={{ color: 'var(--color-text-muted)' }}>Loading document...</p></div>;
    }

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

    const handleGenerateSummary = async (forceRegenerate = false) => {
        setGenerating(true);
        setGenError(null);
        try {
            const result = await generateSummary(doc.id, forceRegenerate);
            if (result && result.summary) {
                setSummary({
                    content: String(result.summary),
                    model_used: result.model || '',
                    created_at: result.created_at || new Date().toISOString()
                });
                // GSAP success animation
                requestAnimationFrame(() => {
                    if (summaryRef.current) {
                        gsap.fromTo(summaryRef.current,
                            { opacity: 0, y: 12, scale: 0.98 },
                            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
                        );
                    }
                });
            } else {
                setGenError('No summary returned. The AI models may be temporarily unavailable.');
            }
        } catch (err) {
            console.error('Summary generation failed:', err);
            const msg = (err instanceof Error ? err.message : String(err)) || 'Failed to generate summary';
            setGenError(msg);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownload = async () => {
        if (!doc?.storage_path) return;
        try {
            const { data, error } = await supabase.storage
                .from(doc.storage_bucket || 'docs')
                .download(doc.storage_path);
            if (error) throw error;

            // Create a blob URL and trigger download
            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            // Extract original filename from storage_path (strip the timestamp prefix)
            const originalName = doc.storage_path.replace(/^\d+_/, '') || doc.title || 'document';
            a.download = originalName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Download failed: ' + (err.message || 'Unknown error'));
        }
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 250));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

    const fileType = getFileType();

    // Render the document viewer based on file type
    const renderViewer = () => {
        if (viewerLoading) {
            return (
                <div className="pdf-placeholder">
                    <Loader2 size={48} className="viewer-spinner" />
                    <p>Loading document...</p>
                </div>
            );
        }

        if (viewerError) {
            return (
                <div className="pdf-placeholder">
                    <AlertCircle size={48} style={{ color: 'var(--color-danger)' }} />
                    <p>Error Loading Document</p>
                    <span>{viewerError}</span>
                </div>
            );
        }

        if (fileType === 'pdf' && fileUrl) {
            return (
                <div className="viewer-frame-wrapper" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                    <iframe
                        src={fileUrl + '#toolbar=0&navpanes=0'}
                        className="viewer-iframe"
                        title={doc.title}
                    />
                </div>
            );
        }

        if (fileType === 'docx' && fileBlob) {
            return (
                <div
                    ref={docxContainerRef}
                    className="docx-viewer-wrapper"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                />
            );
        }

        if (fileType === 'text' && fileBlob) {
            return (
                <TextViewer blob={fileBlob} zoom={zoom} />
            );
        }

        if (fileType === 'image' && fileUrl) {
            return (
                <div className="image-viewer-wrapper" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                    <img src={fileUrl} alt={doc.title} className="viewer-image" />
                </div>
            );
        }

        return (
            <div className="pdf-placeholder">
                <FileText size={64} />
                <p>Preview Unavailable</p>
                <span>This file type ({doc.mime_type || 'unknown'}) cannot be previewed. Use the download button above.</span>
            </div>
        );
    };

    return (
        <div ref={pageRef} className="page-container detail-page">
            <button className="btn btn-ghost detail-back" onClick={() => navigate('/documents')} data-hoverable>
                <ArrowLeft size={16} /> Back to Documents
            </button>

            <div className="detail-split">
                {/* Left: Document Viewer */}
                <div className="detail-pdf">
                    <div className="pdf-toolbar">
                        <span className="pdf-title">{doc.title}</span>
                        <div className="pdf-actions">
                            <button className="btn btn-ghost" onClick={handleZoomOut} title="Zoom out" data-hoverable><ZoomOut size={16} /></button>
                            <span className="zoom-label">{zoom}%</span>
                            <button className="btn btn-ghost" onClick={handleZoomIn} title="Zoom in" data-hoverable><ZoomIn size={16} /></button>
                            <button className="btn btn-ghost" onClick={handleDownload} title="Download" data-hoverable><Download size={16} /></button>
                        </div>
                    </div>
                    <div className="viewer-container">
                        {renderViewer()}
                    </div>
                </div>

                {/* Right: AI Panel */}
                <div className="detail-ai">
                    {/* Summary */}
                    <div className="ai-section">
                        <div className="ai-section-header">
                            <h3>AI Summary</h3>
                            <div className="ai-section-actions">
                                {summary && (
                                    <button className="btn btn-ghost" onClick={copyToClipboard} data-hoverable><Copy size={14} /> Copy</button>
                                )}
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => handleGenerateSummary(!!summary)}
                                    disabled={generating}
                                    data-hoverable
                                >
                                    {generating
                                        ? <><Loader2 size={14} className="viewer-spinner" /> Generating...</>
                                        : summary
                                            ? <><RefreshCw size={14} /> Regenerate</>
                                            : <><RefreshCw size={14} /> Generate Summary</>
                                    }
                                </button>
                            </div>
                        </div>
                        <div ref={summaryRef}>
                            {generating ? (
                                <div className="ai-generating">
                                    <Loader2 size={24} className="viewer-spinner" />
                                    <p ref={genStepRef} className="ai-gen-step-text">{GEN_STEPS[genStep]?.text}</p>
                                    <div className="ai-gen-progress-track">
                                        <div className="ai-gen-progress-bar" style={{ width: `${Math.min(((genStep + 1) / GEN_STEPS.length) * 100, 100)}%` }} />
                                    </div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>Step {genStep + 1} of {GEN_STEPS.length}</span>
                                </div>
                            ) : genError ? (
                                <div className="ai-gen-error">
                                    <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />
                                    <p>{genError}</p>
                                    <button className="btn btn-ghost" onClick={() => handleGenerateSummary(true)} data-hoverable>
                                        <RefreshCw size={14} /> Retry
                                    </button>
                                </div>
                            ) : summary ? (
                                <>
                                    <p className="ai-summary-content">{summary.content}</p>
                                    {summary.model_used && (
                                        <span className="ai-model-tag">Generated by {summary.model_used}</span>
                                    )}
                                </>
                            ) : (
                                <div className="ai-no-summary">
                                    <p className="ai-no-data">No summary generated.</p>
                                    <button
                                        className="btn btn-primary ai-generate-btn"
                                        onClick={() => handleGenerateSummary(false)}
                                        data-hoverable
                                    >
                                        <RefreshCw size={14} /> Generate AI Summary
                                    </button>
                                </div>
                            )}
                        </div>
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
                                <span className="ai-meta-label">Upload date</span>
                                <span className="ai-meta-value">{formatDate(doc.uploaded_at)}</span>
                            </div>
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">File size</span>
                                <span className="ai-meta-value">{formatFileSize(doc.file_size)}</span>
                            </div>
                            <div className="ai-meta-item">
                                <span className="ai-meta-label">Status</span>
                                <span className="ai-meta-value">{doc.processing_status}</span>
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

// Simple text file viewer sub-component
function TextViewer({ blob, zoom }) {
    const [text, setText] = useState('Loading...');

    useEffect(() => {
        blob.text().then(t => setText(t)).catch(() => setText('Failed to read text file.'));
    }, [blob]);

    return (
        <pre
            className="text-viewer"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
        >
            {text}
        </pre>
    );
}
