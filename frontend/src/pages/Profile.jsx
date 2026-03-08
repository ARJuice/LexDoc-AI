import { useEffect, useRef, useState } from 'react';
import { User, LogOut, Key } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import { fetchDepartments, fetchRoles } from '../lib/supabaseData';
import './Profile.css';

export default function Profile() {
    const pageRef = useRef(null);
    const { profile, signOut } = useAuth();

    const [department, setDepartment] = useState(null);
    const [role, setRole] = useState(null);

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
    }, [profile]);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('.profile-card, .profile-actions'),
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.15 }
        );
    }, []);

    const displayName = profile?.username
        ? profile.username.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : 'User';

    return (
        <div ref={pageRef} className="page-container profile-page">
            <h2 className="page-title"><User size={28} className="title-icon" /> My Profile</h2>

            <div className="profile-card card">
                <div className="profile-avatar">
                    {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="profile-details">
                    <div className="profile-item">
                        <span className="profile-label">Name</span>
                        <span className="profile-value">{displayName}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Email</span>
                        <span className="profile-value">{profile?.email || '—'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Department</span>
                        <span className="profile-value">{department?.name || '—'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Role</span>
                        <span className="profile-value">{role?.name || '—'}</span>
                    </div>
                    <div className="profile-item">
                        <span className="profile-label">Joined</span>
                        <span className="profile-value">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                    </div>
                </div>
            </div>

            <div className="profile-actions">
                <button className="btn btn-primary" onClick={signOut} data-hoverable>
                    <LogOut size={16} /> Log Out
                </button>
            </div>
        </div>
    );
}
