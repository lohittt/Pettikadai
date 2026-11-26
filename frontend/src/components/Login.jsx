import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, sanitizeInput } from '../services/validation';

export function Login({ notify }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = sanitizeInput(email);
        const emailErr = validateEmail(cleanEmail);
        if (emailErr) return setError(emailErr);

        const passErr = validatePassword(password);
        if (passErr) return setError(passErr);

        setSubmitting(true);
        try {
            const res = await login(cleanEmail, password);
            if (res.success) {
                if (notify) notify(`Welcome back, ${res.user.name}!`);
                navigate(res.user.role === 'admin' ? '/admin' : from, { replace: true });
            } else {
                setError(res.error || 'Invalid email or password.');
            }
        } catch {
            setError('Could not connect to server.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="auth-section container">
            <div className="auth-card">
                <p className="subtitle">WELCOME BACK</p>
                <h2>Sign In to Pettikadai</h2>
                <p className="auth-subtext">Access your cart, wishlist, and order history.</p>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button type="submit" className="place-order-btn" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign In →'}
                    </button>
                </form>

                <p className="auth-footer">
                    New to Pettikadai? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </section>
    );
}
