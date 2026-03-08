import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../lib/supabase';
import { fetchDepartments, fetchRoles } from '../lib/supabaseData';
import './SetupAccount.css';

export default function SetupAccount() {
    const { session, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const pageRef = useRef(null);

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', deptId: '', roleId: '' });
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

        if (!form.username.trim() || !form.password || !form.deptId) {
            setError('Please fill in all required fields.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);

        try {
            // Determine role: default to Staff (lowest access) if not selected
            const selectedRoleId = form.roleId ? Number(form.roleId) : roles.find(r => r.name === 'Staff')?.id;

            // Insert into public.users table
            const { error: insertError } = await supabase.from('users').insert({
                username: form.username.trim(),
                email: session.user.email,
                password_hash: form.password, // In production, this would be hashed server-side
                google_id: session.user.id,
                is_verified: true,
                role_id: selectedRoleId,
                dept_id: Number(form.deptId),
            });

            if (insertError) {
                if (insertError.message.includes('duplicate')) {
                    setError('This username is already taken.');
                } else {
                    setError(insertError.message);
                }
                setSubmitting(false);
                return;
            }

            // Update the Supabase auth user password so they can login with email/password next time
            await supabase.auth.updateUser({ password: form.password });

            // Refresh profile in context
            await refreshProfile();
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError('Signup failed. Please try again.');
            console.error(err);
        }
        setSubmitting(false);
    };

    // Only Staff role should be available for self-registration; admin assigns higher roles
    const staffRoles = roles.filter(r => r.access_level <= 1);

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
                            <label>Password *</label>
                            <input
                                type="password"
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password *</label>
                            <input
                                type="password"
                                placeholder="Re-enter password"
                                value={form.confirmPassword}
                                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Department *</label>
                            <select
                                value={form.deptId}
                                onChange={(e) => setForm({ ...form, deptId: e.target.value })}
                                required
                            >
                                <option value="">Select department</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Role is auto-assigned as Staff for self-registration */}
                        <input type="hidden" value={staffRoles[0]?.id || ''} />

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
