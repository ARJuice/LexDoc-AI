import { useEffect, useRef, useState } from 'react';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { fetchDepartments, fetchUsers } from '../lib/supabaseData';
import './Admin.css';

export default function AdminDepartments() {
    const pageRef = useRef(null);

    const [departments, setDepartments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const [d, u] = await Promise.all([fetchDepartments(), fetchUsers()]);
            setDepartments(d); setUsers(u);
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
        return <div className="page-container admin-page"><p style={{ color: 'var(--color-text-muted)' }}>Loading departments...</p></div>;
    }

    return (
        <div ref={pageRef} className="page-container admin-page">
            <div className="admin-header">
                <div>
                    <h2 className="page-title"><Building2 size={28} className="title-icon" /> Departments</h2>
                    <p className="page-subtitle">Manage organizational structure and codes.</p>
                </div>
                <button className="btn btn-primary" data-hoverable>
                    <Plus size={18} /> Add Department
                </button>
            </div>

            <div className="card admin-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Department Name</th>
                            <th>Code</th>
                            <th>Active Users</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(d => {
                            const userCount = users.filter(u => u.dept_id === d.id).length;
                            return (
                                <tr key={d.id}>
                                    <td className="text-muted">#{d.id}</td>
                                    <td className="fw-600">{d.name}</td>
                                    <td><span className="tag-chip">{d.code}</span></td>
                                    <td>{userCount}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon" title="Edit" data-hoverable><Edit2 size={16} /></button>
                                            <button className="btn-icon danger" title="Delete" data-hoverable><Trash2 size={16} /></button>
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
