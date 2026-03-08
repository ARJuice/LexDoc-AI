import { useEffect, useRef } from 'react';
import { User, Mail, Building, Shield, Key, LogOut } from 'lucide-react';
import gsap from 'gsap';
import { currentUser, getDeptById, getRoleById } from '../data/mockData';
import './Profile.css';

export default function Profile() {
    const pageRef = useRef(null);
    const dept = getDeptById(currentUser.dept_id);
    const role = getRoleById(currentUser.role_id);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('.profile-card, .profile-actions button'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
        );
    }, []);

    return (
        <div ref={pageRef} className="page-container profile-page">
            <h2 className="page-title">Profile Settings</h2>
            <p className="page-subtitle">Manage your account and preferences.</p>

            <div className="profile-layout">
                <div className="card profile-card">
                    <div className="profile-header">
                        <div className="profile-avatar-lg">
                            {currentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-title-block">
                            <h3>{currentUser.username.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h3>
                            <span className={`badge ${currentUser.is_verified ? 'badge-primary' : 'badge-accent'}`}>
                                {currentUser.is_verified ? 'Verified Account' : 'Pending Verification'}
                            </span>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="detail-item">
                            <User size={18} className="detail-icon" />
                            <div>
                                <label>Username</label>
                                <p>@{currentUser.username}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Mail size={18} className="detail-icon" />
                            <div>
                                <label>Email Address</label>
                                <p>{currentUser.email}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Building size={18} className="detail-icon" />
                            <div>
                                <label>Department</label>
                                <p>{dept?.name}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <Shield size={18} className="detail-icon" />
                            <div>
                                <label>System Role</label>
                                <p>{role?.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="btn btn-outline full-width" data-hoverable>
                        <Key size={18} /> Change Password
                    </button>
                    <button className="btn btn-outline full-width danger-outline" data-hoverable>
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}
