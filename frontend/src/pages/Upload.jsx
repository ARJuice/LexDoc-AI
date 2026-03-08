import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, X, Plus } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import { fetchDepartments, fetchTags, uploadDocument } from '../lib/supabaseData';
import './Upload.css';

const extractTitleFromFilename = (filename) => {
    return filename
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

export default function Upload() {
    const pageRef = useRef(null);
    const progressRef = useRef(null);
    const { profile } = useAuth();

    const [departments, setDepartments] = useState([]);
    const [tags, setTags] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({ title: '', dept: '', tags: [], customTags: [], visibility: 'department' });
    const [customTagInput, setCustomTagInput] = useState('');
    const [processing, setProcessing] = useState(null); // null | 'uploading' | 'complete' | 'error'
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetchDepartments().then(setDepartments);
        fetchTags().then(setTags);
    }, []);

    const PRIORITY_TAGS = tags.filter(t => t.type === 'PRIORITY');
    const RECENT_TAGS = tags.filter(t => t.type === 'LABEL').slice(0, 5);
    const PRIORITY_TAG_IDS = PRIORITY_TAGS.map(tag => tag.id);
    const selectedPriorityId = formData.tags.find(tagId => PRIORITY_TAG_IDS.includes(tagId));

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }, []);

    const handleUpload = async () => {
        if (!selectedFile || !formData.title.trim()) return;
        setProcessing('uploading');
        setUploadError('');

        // Animate progress bar
        if (progressRef.current) {
            gsap.to(progressRef.current, { width: '60%', duration: 1.5, ease: 'power2.out' });
        }

        try {
            await uploadDocument(selectedFile, {
                title: formData.title.trim(),
                deptId: formData.dept || (profile?.dept_id),
                tagIds: formData.tags,
                isGeneral: formData.visibility === 'general',
                uploaderId: profile?.id,
            });

            if (progressRef.current) {
                gsap.to(progressRef.current, { width: '100%', duration: 0.5, ease: 'power2.out' });
            }
            setProcessing('complete');
        } catch (err) {
            setProcessing('error');
            setUploadError(err.message || 'Upload failed. Please try again.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, title: extractTitleFromFilename(file.name) }));
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, title: extractTitleFromFilename(file.name) }));
        }
    };

    const toggleTag = (tagId) => {
        if (PRIORITY_TAG_IDS.includes(tagId)) {
            setFormData(prev => {
                const withoutPriority = prev.tags.filter(tag => !PRIORITY_TAG_IDS.includes(tag));
                return { ...prev, tags: prev.tags.includes(tagId) ? withoutPriority : [...withoutPriority, tagId] };
            });
            return;
        }
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId]
        }));
    };

    const addCustomTag = () => {
        const trimmed = customTagInput.trim();
        if (!trimmed || formData.customTags.includes(trimmed)) return;
        setFormData(prev => ({ ...prev, customTags: [...prev.customTags, trimmed] }));
        setCustomTagInput('');
    };

    const removeCustomTag = (tagName) => {
        setFormData(prev => ({ ...prev, customTags: prev.customTags.filter(t => t !== tagName) }));
    };

    const handleCustomTagKey = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); }
    };

    return (
        <div ref={pageRef} className="page-container upload-page">
            <h2 className="page-title">Upload Document</h2>
            <p className="page-subtitle">Upload a document and LexDoc AI will generate a summary automatically.</p>

            <div className="upload-grid">
                {/* Drag & Drop Zone */}
                <div
                    className={`upload-zone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                    data-hoverable
                >
                    <input id="file-input" type="file" accept=".pdf,.docx,.doc,.txt" hidden onChange={handleFileInput} />
                    {selectedFile ? (
                        <div className="upload-zone-selected">
                            <FileText size={36} />
                            <p className="upload-zone-filename">{selectedFile.name}</p>
                            <span className="upload-zone-size">{(selectedFile.size / 1000000).toFixed(1)} MB</span>
                        </div>
                    ) : (
                        <>
                            <UploadCloud size={48} />
                            <p>Drag & drop your file here</p>
                            <span>or click to browse · PDF, DOCX, TXT</span>
                        </>
                    )}
                </div>

                {/* Metadata Form */}
                <div className="upload-form">
                    <div className="form-group">
                        <label>Document Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter document title..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <select value={formData.dept} onChange={(e) => setFormData({ ...formData, dept: e.target.value })}>
                            <option value="">Select department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Tags</label>
                        <div className="tags-selection">
                            <div className="tags-columns">
                                <div className="tags-column">
                                    <span className="tags-column-label">Priority</span>
                                    <div className="tags-column-list">
                                        {PRIORITY_TAGS.map(t => (
                                            <button
                                                key={t.id}
                                                className={`form-tag ${selectedPriorityId === t.id ? 'selected' : ''}`}
                                                style={selectedPriorityId === t.id ? { borderColor: t.color, color: t.color, background: t.color + '15' } : {}}
                                                onClick={() => toggleTag(t.id)}
                                                data-hoverable
                                                type="button"
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="tags-column">
                                    <span className="tags-column-label">Custom Tags</span>
                                    <div className="custom-tag-input-row">
                                        <input type="text" placeholder="Type a tag..." value={customTagInput} onChange={(e) => setCustomTagInput(e.target.value)} onKeyDown={handleCustomTagKey} />
                                        <button type="button" className="custom-tag-add-btn" onClick={addCustomTag} data-hoverable>
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <div className="custom-tags-list">
                                        {formData.customTags.map(ct => (
                                            <span key={ct} className="custom-tag-chip">
                                                {ct}
                                                <button type="button" onClick={() => removeCustomTag(ct)} data-hoverable><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="tags-recent">
                                <span className="tags-column-label">Recently Used</span>
                                <div className="tags-recent-list">
                                    {RECENT_TAGS.map(t => (
                                        <button
                                            key={t.id}
                                            className={`form-tag ${formData.tags.includes(t.id) ? 'selected' : ''}`}
                                            style={formData.tags.includes(t.id) ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : {}}
                                            onClick={() => toggleTag(t.id)}
                                            data-hoverable
                                            type="button"
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Visibility</label>
                        <div className="form-radio-group">
                            <label className="form-radio" data-hoverable>
                                <input type="radio" name="visibility" value="department" checked={formData.visibility === 'department'} onChange={() => setFormData({ ...formData, visibility: 'department' })} />
                                <span className="radio-custom"></span>
                                <span>Department Only</span>
                            </label>
                            <label className="form-radio" data-hoverable>
                                <input type="radio" name="visibility" value="general" checked={formData.visibility === 'general'} onChange={() => setFormData({ ...formData, visibility: 'general' })} />
                                <span className="radio-custom"></span>
                                <span>General (All Departments)</span>
                            </label>
                        </div>
                    </div>

                    <button className="btn btn-primary upload-submit" onClick={handleUpload} disabled={!selectedFile || !formData.title.trim() || processing === 'uploading'} data-hoverable>
                        <UploadCloud size={18} /> {processing === 'uploading' ? 'Uploading...' : 'Upload & Process'}
                    </button>
                </div>
            </div>

            {/* Processing States */}
            {processing && (
                <div className="processing-panel">
                    <h3>{processing === 'complete' ? 'Upload Complete' : processing === 'error' ? 'Upload Failed' : 'Uploading Document'}</h3>
                    <div className="progress-bar-track">
                        <div ref={progressRef} className="progress-bar-fill" style={{ width: processing === 'complete' ? '100%' : '0%' }} />
                    </div>
                    {processing === 'complete' && (
                        <div className="process-complete">
                            <CheckCircle2 size={20} />
                            <span>Document uploaded successfully! AI summary will be generated when the model is connected.</span>
                        </div>
                    )}
                    {processing === 'error' && (
                        <div className="process-complete" style={{ color: 'var(--color-danger)' }}>
                            <X size={20} />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
