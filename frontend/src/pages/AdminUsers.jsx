import { useEffect, useRef, useState } from 'react';
import { Users, UserPlus, Edit2, ShieldOff } from 'lucide-react';
import gsap from 'gsap';
import { fetchUsers, fetchRoles, fetchDepartments } from '../lib/supabaseData';
import './Admin.css';

export default function AdminUsers() {
    const pageRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [u, r, d] = await Promise.all([fetchUsers(), fetchRoles(), fetchDepartments()]);
            setUsers(u); setRoles(r); setDepartments(d);
            setLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('tbody tr'),
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
        );
    }, [loading]);

    if (loading) {
        return <div className="page-container admin-page"><p style={{ color: 'var(--color-text-muted)' }}>Loading users...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="page-title"><Users size={28} className="title-icon" /> User Management</h2>
                    <p className="page-subtitle">Manage organization users, roles, and access levels.</p>
                </div>
                <button className="btn btn-primary" data-hoverable>
                    <UserPlus size={18} /> Invite User
                </button>
            </div>

            <div className="card admin-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Department</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const dept = departments.find(d => d.id === u.dept_id);
                            const role = roles.find(r => r.id === u.role_id);
                            return (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-avatar">{u.username?.charAt(0)?.toUpperCase() || '?'}</div>
                                            <div>
                                                <div className="user-name">{u.username ? u.username.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : '—'}</div>
                                                <div className="user-email">{u.email || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{dept?.name || '—'}</td>
                                    <td>
                                        <span className="badge" style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)' }}>
                                            {role?.name || '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${u.is_verified ? 'badge-primary' : 'badge-accent'}`}>
                                            {u.is_verified ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Edit Role" data-hoverable><Edit2 size={16} /></button>
                                            <button className="btn-icon danger" title="Deactivate" data-hoverable><ShieldOff size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
