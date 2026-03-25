import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabase';
import { fetchDepartments, fetchRoles } from '../lib/supabaseData';
import CustomSelect from '../components/ui/CustomSelect';
import './SetupAccount.css';

export default function SetupAccount() {
    const { session, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const pageRef = useRef(null);

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({ username: '', deptId: '', roleId: '', srNo: '', studentClass: '', semester: '' });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDepartments().then(setDepartments);
        fetchRoles().then(setRoles);
    }, []);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el.querySelector('.setup-card'),
            { opacity: 0, y: 30, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.username.trim() || !form.deptId) {
            setError('Please fill in all required fields.');
            return;
        }
        
        const selectedRoleId = form.roleId ? Number(form.roleId) : roles.find(r => r.name === 'Student')?.id;
        const isStudent = studentRoles.some(r => r.id === selectedRoleId);

        if (isStudent && (!form.srNo || !form.studentClass || !form.semester)) {
            setError('Students must provide SR No, Class, and Semester.');
            return;
        }

        setSubmitting(true);

        try {
            // Determine role: default to Student (lowest access) for self-registration
            const defaultStudentId = roles.find(r => r.name === 'Student')?.id;
            const finalRoleId = form.roleId ? Number(form.roleId) : defaultStudentId;
            const isStudentRole = studentRoles.some(r => r.id === finalRoleId);

            const insertPayload = {
                username: form.username.trim(),
                email: session.user.email,
                password_hash: 'google_auth', // Placeholder — actual password managed by Supabase Auth
                google_id: session.user.id,
                is_verified: true,
                role_id: finalRoleId,
                dept_id: Number(form.deptId),
            };

            if (isStudentRole) {
                insertPayload.sr_no = parseInt(form.srNo, 10);
                insertPayload.class = form.studentClass;
                insertPayload.semester = parseInt(form.semester, 10);
            }

            // Insert into public.users table
            const { error: insertError } = await supabase.from('users').insert(insertPayload);

            if (insertError) {
                if (insertError.message.includes('duplicate')) {
                    setError('This username is already taken.');
                } else {
                    setError(insertError.message);
                }
                setSubmitting(false);
                return;
            }

            // Refresh profile in context
            await refreshProfile();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Signup failed. Please try again.');
            console.error(err);
        }
        setSubmitting(false);
    };

    // Only Student role should be available for self-registration; admin assigns higher roles
    const studentRoles = roles.filter(r => r.access_level <= 1);

    return (
        <div ref={pageRef} className="setup-page">
            <div className="setup-bg-glow glow-1" />

            <div className="setup-container">
                <div className="setup-card">
                    <div className="setup-header">
                        <h2>Set Up Your Account</h2>
                        <p>Complete your profile to get started with LexDoc AI.</p>
                    </div>

                    {session?.user?.email && (
                        <div className="setup-email-info" style={{ marginBottom: 'var(--space-4)' }}>
                            Signed in as {session.user.email}
                        </div>
                    )}

                    {error && <div className="setup-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}

                    <form className="setup-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Username *</label>
                            <input
                                type="text"
                                placeholder="e.g. john.doe"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Department *</label>
                            <CustomSelect
                                className="setup-select"
                                value={form.deptId}
                                onChange={(val) => setForm({ ...form, deptId: val })}
                                placeholder="Select department"
                                options={[
                                    { value: '', label: 'Select department' },
                                    ...departments.map(d => ({ value: d.id, label: d.name }))
                                ]}
                            />
                        </div>

                        {/* Role is auto-assigned as Student for self-registration */}
                        <input type="hidden" value={studentRoles[0]?.id || ''} />

                        {studentRoles.length > 0 && (
                            <div className="setup-student-fields">
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <div className="form-group">
                                        <label>SR No *</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 224739"
                                            value={form.srNo}
                                            onChange={(e) => setForm({ ...form, srNo: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Semester *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="8"
                                            placeholder="e.g. 4"
                                            value={form.semester}
                                            onChange={(e) => setForm({ ...form, semester: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Class *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CS-B"
                                        value={form.studentClass}
                                        onChange={(e) => setForm({ ...form, studentClass: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary setup-submit"
                            disabled={submitting}
                            data-hoverable
                        >
                            <UserPlus size={16} />
                            {submitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
