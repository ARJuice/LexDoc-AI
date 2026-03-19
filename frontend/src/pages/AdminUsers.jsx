import { useEffect, useRef, useState } from 'react';
import { Users, UserPlus, Edit2, ShieldOff, ChevronDown, ChevronUp, Check, X, ClipboardList, Eye, UploadCloud, FileText } from 'lucide-react';
import gsap from 'gsap';
import { fetchUsersAdmin, fetchRoles, fetchDepartments, updateUserBulkDelete, fetchAuditLogs, fetchDocuments, formatDateTime, updateUserRole } from '../lib/supabaseData';
import { useAuth } from '../context/AuthProvider';
import './Admin.css';

export default function AdminUsers() {
    const pageRef = useRef(null);

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { profile } = useAuth();

    const [expandedUserId, setExpandedUserId] = useState(null);

    useEffect(() => {
        async function load() {
            // Re-use fetchUsersAdmin from prior updates
            const [u, r, d, l, docs] = await Promise.all([
                fetchUsersAdmin(), fetchRoles(), fetchDepartments(), fetchAuditLogs(), fetchDocuments()
            ]);
            setUsers(u); setRoles(r); setDepartments(d); setAuditLogs(l); setDocuments(docs);
            setLoading(false);
        }
        load();
    }, []);

    useEffect(() => {
        if (loading) return;
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        gsap.fromTo(el.querySelectorAll('tbody .main-row'),
            { opacity: 0, x: -16 },
            { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', delay: 0.1 }
        );
    }, [loading]);

    const handleToggleBulkDelete = async (user, e) => {
        e.stopPropagation();
        const newVal = !user.bulk_delete_enabled;
        try {
            await updateUserBulkDelete(user.id, newVal);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, bulk_delete_enabled: newVal } : u));
        } catch (err) {
            alert('Failed to update permission');
        }
    };

    const handleRoleChange = async (user, newRoleId) => {
        try {
            await updateUserRole(user.id, newRoleId);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role_id: newRoleId } : u));
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const toggleExpand = (userId) => {
        setExpandedUserId(prev => prev === userId ? null : userId);
    };

    if (loading) {
        return <div className="page-container admin-page"><p style={{ color: 'var(--color-text-muted)' }}>Loading users...</p></div>;
    }

    if (profile && profile.roles?.access_level < 10) {
        return <div className="page-container admin-page"><h2 style={{color: 'var(--color-danger)'}}>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
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
                            <th>Bulk Delete</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const dept = departments.find(d => d.id === u.dept_id);
                            const role = roles.find(r => r.id === u.role_id);
                            const isExpanded = expandedUserId === u.id;
                            
                            // Get logs for this user, newest first
                            const userLogs = auditLogs.filter(l => l.user_id === u.id).slice(0, 10);

                            return (
                                <optgroup key={u.id} style={{ display: 'contents' }}>
                                    <tr 
                                        className={`main-row ${isExpanded ? 'expanded-row-active' : ''}`}
                                        onClick={() => toggleExpand(u.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
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
                                            <select
                                                className="liquid-glass-input"
                                                style={{ padding: '6px 12px', fontSize: 'var(--fs-xs)', width: 'auto', backgroundColor: 'var(--glass-bg)' }}
                                                value={u.role_id}
                                                onChange={(e) => handleRoleChange(u, Number(e.target.value))}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {roles.map(r => (
                                                    <option key={r.id} value={r.id} style={{ color: 'var(--text-inverse)' }}>{r.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                className={`glass-toggle ${u.bulk_delete_enabled ? 'on' : 'off'}`}
                                                onClick={(e) => handleToggleBulkDelete(u, e)}
                                                title={u.bulk_delete_enabled ? 'Revoke bulk delete' : 'Grant bulk delete'}
                                                data-hoverable
                                            >
                                                {u.bulk_delete_enabled ? <Check size={14} /> : <X size={14} />}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.is_verified ? 'badge-primary' : 'badge-accent'}`}>
                                                {u.is_verified ? 'Active' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-icon" title="Edit Role" onClick={e => e.stopPropagation()} data-hoverable><Edit2 size={16} /></button>
                                                <button className="btn-icon danger" title="Deactivate" onClick={e => e.stopPropagation()} data-hoverable><ShieldOff size={16} /></button>
                                                <button className="btn-icon" title={isExpanded ? 'Collapse' : 'Expand Activity'} data-hoverable>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expandable sub-row with audit logs */}
                                    {isExpanded && (
                                        <tr className="expanded-subrow">
                                            <td colSpan="6">
                                                <div className="subrow-content">
                                                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', color: 'var(--color-primary)', fontSize: 'var(--fs-sm)' }}>
                                                        <ClipboardList size={16} /> Recent Activity
                                                    </h4>
                                                    
                                                    {userLogs.length === 0 ? (
                                                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>No recent activity found.</p>
                                                    ) : (
                                                        <div className="mini-logs-list">
                                                            {userLogs.map(log => {
                                                                const doc = documents.find(d => d.id === log.doc_id);
                                                                const isUpload = log.action === 'UPLOAD';
                                                                const isLogin = log.action === 'LOGIN';
                                                                const isLogout = log.action === 'LOGOUT';
                                                                const isDelete = log.action === 'DELETE';
                                                                
                                                                let icon = <Eye size={14} />;
                                                                let color = 'var(--text-primary)';
                                                                
                                                                if (isUpload) { icon = <UploadCloud size={14} />; color = 'var(--color-primary)'; }
                                                                if (isDelete) { icon = <Trash2 size={14} />; color = 'var(--color-danger)'; }
                                                                if (isLogin) { icon = <ShieldOff size={14} />; color = 'var(--color-accent)'; }
                                                                if (isLogout) { icon = <User size={14} />; color = 'var(--text-muted)'; }

                                                                return (
                                                                    <div key={log.id} className="mini-log-item">
                                                                        <span style={{ color, flexShrink: 0 }}>{icon}</span>
                                                                        <div className="mini-log-desc">
                                                                            {isUpload && 'Uploaded document '}
                                                                            {isDelete && 'Deleted document '}
                                                                            {isLogin && 'System login '}
                                                                            {isLogout && 'System logout '}
                                                                            {(!isUpload && !isDelete && !isLogin && !isLogout) && 'Viewed document '}
                                                                            
                                                                            {(doc || log.doc_id) && (
                                                                                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                                                    {doc?.title || `ID: ${log.doc_id}`}
                                                                                </strong>
                                                                            )}
                                                                        </div>
                                                                        <div className="mini-log-time">{formatDateTime(log.timestamp)}</div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </optgroup>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
