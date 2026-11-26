import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateName, validateEmail, validatePassword, sanitizeInput } from '../services/validation';

export function Register({ notify }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const cleanName = sanitizeInput(name);
        const cleanEmail = sanitizeInput(email);

        const nameErr = validateName(cleanName);
        if (nameErr) return setError(nameErr);

        const emailErr = validateEmail(cleanEmail);
        if (emailErr) return setError(emailErr);

        const passErr = validatePassword(password);
        if (passErr) return setError(passErr);

        if (password !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        setSubmitting(true);
        try {
            const res = await register(cleanName, cleanEmail, password);
            if (res.success) {
                if (notify) notify(`Account created! Welcome, ${res.user.name} ✓`);
                navigate('/', { replace: true });
            } else {
                setError(res.error || 'Registration failed.');
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
                <p className="subtitle">JOIN PETTIKADAI</p>
                <h2>Create Account</h2>
                <p className="auth-subtext">Sign up to save your wishlist, cart, and track orders.</p>

                {error && <div className="auth-error" role="alert">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="register-name">Full Name</label>
                        <input
                            id="register-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-email">Email Address</label>
                        <input
                            id="register-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-password">Password</label>
                        <input
                            id="register-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="register-confirm">Confirm Password</label>
                        <input
                            id="register-confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button type="submit" className="place-order-btn" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Create Account →'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </section>
    );
}
