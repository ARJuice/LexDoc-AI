import { useEffect, useRef, useState } from 'react';
import { User, LogOut, Edit2, Check, X, Building, LayoutTemplate } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabase';
import { fetchDepartments, fetchRoles } from '../lib/supabaseData';
import './Profile.css';

export default function Profile() {
    const pageRef = useRef(null);
    const formRef = useRef(null);
    
    // Auth context brings profile and refreshProfile to update context on save
    const { profile, signOut, refreshProfile } = useAuth();
    
    const [department, setDepartment] = useState(null);
    const [role, setRole] = useState(null);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        srNo: '',
        studentClass: '',
        semester: ''
    });

    useEffect(() => {
        if (profile?.departments) {
            setDepartment(profile.departments);
        } else if (profile?.dept_id) {
            fetchDepartments().then(depts => {
                setDepartment(depts.find(d => d.id === profile.dept_id));
            });
        }

        if (profile?.roles) {
            setRole(profile.roles);
        } else if (profile?.role_id) {
            fetchRoles().then(roles => {
                setRole(roles.find(r => r.id === profile.role_id));
            });
        }

        // Initialize form data when profile loads
        if (profile) {
            setFormData({
                username: profile.username || '',
                srNo: profile.sr_no || '',
                studentClass: profile.class || '',
                semester: profile.semester || ''
            });
        }
    }, [profile]);

    // Initial page load animations
    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        
        const tl = gsap.timeline();
        
        tl.fromTo(el.querySelector('.profile-title-block'), 
            { opacity: 0, x: -30 }, 
            { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out' }
        )
        .fromTo(el.querySelector('.profile-glass-surface'),
            { opacity: 0, y: 40, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'expo.out' },
            "-=0.4"
        )
        .fromTo(el.querySelectorAll('.profile-avatar-capsule > *'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'back.out(1.2)' },
            "-=0.6"
        )
        .fromTo(el.querySelectorAll('.profile-field-group'),
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
            "-=0.5"
        );
    }, [profile]);

    // GSAP animation for mode toggle (View <-> Edit)
    const toggleEditMode = () => {
        const groups = pageRef.current.querySelectorAll('.profile-field-value');
        
        if (!isEditing) {
            // Entering edit mode
            gsap.to(groups, { 
                opacity: 0, 
                y: -10, 
                duration: 0.2, 
                ease: 'power1.in', 
                onComplete: () => setIsEditing(true) 
            });
        } else {
            // Canceling edit mode
            setFormData({
                username: profile.username || '',
                srNo: profile.sr_no || '',
                studentClass: profile.class || '',
                semester: profile.semester || ''
            });
            gsap.to(groups, { 
                opacity: 0, 
                y: -10, 
                duration: 0.2, 
                ease: 'power1.in', 
                onComplete: () => setIsEditing(false) 
            });
        }
    };

    // Fade in inputs when edit mode becomes active
    useEffect(() => {
        if (!pageRef.current) return;
        const groups = pageRef.current.querySelectorAll('.profile-field-value');
        gsap.fromTo(groups, 
            { opacity: 0, y: 10 }, 
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
        );
    }, [isEditing]);

    const handleSave = async () => {
        if (!formData.username.trim()) return;
        
        setIsSaving(true);
        try {
            const updates = { username: formData.username.trim() };
            
            // Only update student fields if the user is a student
            if (role?.access_level <= 1) {
                updates.sr_no = formData.srNo ? parseInt(formData.srNo, 10) : null;
                updates.class = formData.studentClass.trim();
                updates.semester = formData.semester ? parseInt(formData.semester, 10) : null;
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', profile.id);

            if (error) throw error;

            // Refresh the context so UI updates everywhere
            await refreshProfile();
            
            // Turn off edit mode smoothly
            gsap.to(pageRef.current.querySelectorAll('.profile-field-value'), { 
                opacity: 0, 
                y: -10, 
                duration: 0.2, 
                ease: 'power1.in', 
                onComplete: () => setIsEditing(false) 
            });
            
        } catch (err) {
            console.error('Failed to update profile:', err);
            alert('Failed to update profile. Please try again.');
        }
        setIsSaving(false);
    };

    const displayName = profile?.username
        ? profile.username.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : 'User';

    const isStudent = role?.access_level <= 1;

    return (
        <div ref={pageRef} className="page-container profile-page">
            <div className="profile-mesh-bg" />
            <div className="profile-mesh-bg-2" />

            <div className="profile-header-group">
                <div className="profile-title-block">
                    <h2><User size={32} /> My Profile</h2>
                    <p className="profile-subtitle">Manage your personal settings and account preferences.</p>
                </div>
            </div>

            <div className="profile-card-wrapper">
                <div className="profile-glass-surface">
                    <div className="profile-grid">
                        
                        {/* Left Column: Avatar & Actions */}
                        <div className="profile-avatar-capsule">
                            <div className="profile-avatar-circle">
                                <User size={48} />
                            </div>
                            <span className="profile-role-badge">
                                {role?.name || 'Loading Role...'}
                            </span>
                            
                            <div style={{ marginTop: 'var(--space-8)', width: '100%' }}>
                                <div className="profile-field-group" style={{ alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                    <span className="profile-field-label">Department</span>
                                    <span className="profile-field-value" style={{ color: 'var(--color-primary)' }}>
                                        <Building size={16} style={{ marginRight: '6px' }} />
                                        {department?.name || '—'}
                                    </span>
                                </div>
                                <div className="profile-field-group" style={{ alignItems: 'center' }}>
                                    <span className="profile-field-label">Joined</span>
                                    <span className="profile-field-value" style={{ fontSize: 'var(--fs-base)' }}>
                                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                    </span>
                                </div>
                            </div>

                            <button className="profile-btn-logout" onClick={signOut} data-hoverable>
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>

                        {/* Right Column: Editable Data Grid */}
                        <div className="profile-data-section">
                            <div className="profile-data-grid" ref={formRef}>
                                <div className="profile-field-group">
                                    <span className="profile-field-label">Email Address</span>
                                    <span className="profile-field-value">{profile?.email || '—'}</span>
                                    {/* Email is never editable as it's tied to Google OAuth */}
                                </div>

                                <div className="profile-field-group">
                                    <span className="profile-field-label">Username</span>
                                    <div className="profile-field-value">
                                        {isEditing ? (
                                            <input 
                                                className="profile-input" 
                                                value={formData.username}
                                                onChange={e => setFormData({...formData, username: e.target.value})}
                                            />
                                        ) : (
                                            displayName
                                        )}
                                    </div>
                                </div>

                                {isStudent && (
                                    <>
                                        <div className="profile-field-group">
                                            <span className="profile-field-label">SR Number</span>
                                            <div className="profile-field-value">
                                                {isEditing ? (
                                                    <input 
                                                        className="profile-input" 
                                                        type="number"
                                                        value={formData.srNo}
                                                        onChange={e => setFormData({...formData, srNo: e.target.value})}
                                                    />
                                                ) : (
                                                    profile?.sr_no || '—'
                                                )}
                                            </div>
                                        </div>

                                        <div className="profile-field-group">
                                            <span className="profile-field-label">Class</span>
                                            <div className="profile-field-value">
                                                {isEditing ? (
                                                    <input 
                                                        className="profile-input" 
                                                        value={formData.studentClass}
                                                        onChange={e => setFormData({...formData, studentClass: e.target.value})}
                                                    />
                                                ) : (
                                                    profile?.class || '—'
                                                )}
                                            </div>
                                        </div>

                                        <div className="profile-field-group">
                                            <span className="profile-field-label">Semester</span>
                                            <div className="profile-field-value">
                                                {isEditing ? (
                                                    <input 
                                                        className="profile-input"
                                                        type="number"
                                                        min="1" max="8"
                                                        value={formData.semester}
                                                        onChange={e => setFormData({...formData, semester: e.target.value})}
                                                    />
                                                ) : (
                                                    profile?.semester || '—'
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="profile-section-actions">
                                {isEditing ? (
                                    <>
                                        <button className="btn-cancel-edit" onClick={toggleEditMode} disabled={isSaving} data-hoverable>
                                            <X size={16} /> Cancel
                                        </button>
                                        <button className="btn-edit-profile" onClick={handleSave} disabled={isSaving || !formData.username.trim()} data-hoverable>
                                            {isSaving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-edit-profile" onClick={toggleEditMode} data-hoverable>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
