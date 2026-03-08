import { useEffect, useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, Loader2, X, Plus } from 'lucide-react';
import gsap from 'gsap';
import { departments, tags } from '../data/mockData';
import './Upload.css';

const PROCESS_STAGES = ['uploading', 'extracting', 'summarizing', 'complete'];
const PRIORITY_TAGS = tags.filter(t => t.type === 'PRIORITY');
const RECENT_TAGS = tags.filter(t => t.type === 'LABEL').slice(0, 5);
const PRIORITY_TAG_IDS = PRIORITY_TAGS.map(tag => tag.id);

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
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [formData, setFormData] = useState({ title: '', dept: '', tags: [], customTags: [], visibility: 'department' });
    const [customTagInput, setCustomTagInput] = useState('');
    const [processing, setProcessing] = useState(null);

    const selectedPriorityId = formData.tags.find(tagId => PRIORITY_TAG_IDS.includes(tagId));

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
    }, []);

    const simulateUpload = () => {
        if (!selectedFile || !formData.title.trim()) return;
        setProcessing(0);

        PROCESS_STAGES.forEach((_, i) => {
            setTimeout(() => {
                setProcessing(i);
                if (progressRef.current) {
                    gsap.to(progressRef.current, {
                        width: `${((i + 1) / PROCESS_STAGES.length) * 100}%`,
                        duration: 0.8,
                        ease: 'power2.out'
                    });
                }
            }, (i + 1) * 1500);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer?.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({
                ...prev,
                title: extractTitleFromFilename(file.name)
            }));
        }
    };

    const handleFileInput = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({
                ...prev,
                title: extractTitleFromFilename(file.name)
            }));
        }
    };

    const toggleTag = (tagId) => {
        if (PRIORITY_TAG_IDS.includes(tagId)) {
            setFormData(prev => {
                const withoutPriority = prev.tags.filter(tag => !PRIORITY_TAG_IDS.includes(tag));
                return {
                    ...prev,
                    tags: prev.tags.includes(tagId) ? withoutPriority : [...withoutPriority, tagId]
                };
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

    const getStageIcon = (stageIdx) => {
        if (processing === null || processing < stageIdx) return <Loader2 size={16} className="stage-pending" />;
        if (processing === stageIdx) return <Loader2 size={16} className="stage-active" />;
        return <CheckCircle2 size={16} className="stage-done" />;
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
                                {/* Priority Tags */}
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

                                {/* Custom Tags */}
                                <div className="tags-column">
                                    <span className="tags-column-label">Custom Tags</span>
                                    <div className="custom-tag-input-row">
                                        <input
                                            type="text"
                                            placeholder="Type a tag..."
                                            value={customTagInput}
                                            onChange={(e) => setCustomTagInput(e.target.value)}
                                            onKeyDown={handleCustomTagKey}
                                        />
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

                            {/* Recently Used Tags */}
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

                    <button className="btn btn-primary upload-submit" onClick={simulateUpload} disabled={!selectedFile || !formData.title.trim()} data-hoverable>
                        <UploadCloud size={18} /> Upload & Process
                    </button>
                </div>
            </div>

            {/* Processing States */}
            {processing !== null && (
                <div className="processing-panel">
                    <h3>Processing Document</h3>
                    <div className="progress-bar-track">
                        <div ref={progressRef} className="progress-bar-fill" />
                    </div>
                    <div className="process-stages">
                        {PROCESS_STAGES.map((stage, i) => (
                            <div key={stage} className={`process-stage ${processing >= i ? 'active' : ''} ${processing === i ? 'current' : ''}`}>
                                {getStageIcon(i)}
                                <span>{stage.charAt(0).toUpperCase() + stage.slice(1)}</span>
                            </div>
                        ))}
                    </div>
                    {processing === PROCESS_STAGES.length - 1 && (
                        <div className="process-complete">
                            <CheckCircle2 size={20} />
                            <span>Document processed successfully! AI summary is ready.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
