import { useState, useEffect, useRef } from 'react';
import { Sparkles, LogIn } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../context/AuthProvider';
import './Login.css';

export default function Login() {
    const { signInWithGoogle, signInWithPassword, authError, setAuthError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const pageRef = useRef(null);

    useEffect(() => {
        const el = pageRef.current;
        if (!el) return;
        gsap.fromTo(el.querySelector('.login-card'),
            { opacity: 0, y: 30, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
        );
    }, []);

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) return;

        // Domain check
        const domain = email.split('@')[1];
        if (domain !== 'sahrdaya.ac.in') {
            setAuthError('Only @sahrdaya.ac.in accounts are allowed.');
            return;
        }

        setSubmitting(true);
        await signInWithPassword(email, password);
        setSubmitting(false);
    };

    return (
        <div ref={pageRef} className="login-page">
            <div className="login-bg-glow glow-1" />
            <div className="login-bg-glow glow-2" />

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Sparkles size={28} />
                        </div>
                        <h1>LexDoc AI</h1>
                        <p>AI-Powered Document Intelligence</p>
                    </div>

                    {authError && (
                        <div className="login-error">{authError}</div>
                    )}

                    {/* Google OAuth — for new users */}
                    <button
                        className="google-btn"
                        onClick={signInWithGoogle}
                        data-hoverable
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="login-divider">
                        <span>or sign in with email</span>
                    </div>

                    {/* Email/Password — for returning users */}
                    <form className="login-form" onSubmit={handlePasswordLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="you@sahrdaya.ac.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary login-submit"
                            disabled={submitting}
                            data-hoverable
                        >
                            <LogIn size={16} />
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="login-footer">
                        First time? Use <span>Google Sign-In</span> to create your account.
                    </div>
                </div>
            </div>
        </div>
    );
}
