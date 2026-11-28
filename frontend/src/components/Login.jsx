import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, sanitizeInput } from '../services/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                navigate(res.user.role === 'admin' ? '/admin/dashboard' : from, { replace: true });
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
        <section className="container flex justify-center py-16">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Welcome Back
                    </p>
                    <CardTitle className="text-2xl">Sign In to Pettikadai</CardTitle>
                    <CardDescription>Access your cart, wishlist, and order history.</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="login-email">Email Address</Label>
                            <Input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="login-password">Password</Label>
                            <Input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? 'Signing in...' : 'Sign In →'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center text-sm text-muted-foreground">
                    <span>
                        New to Pettikadai?{' '}
                        <Link to="/register" className="font-semibold text-foreground underline underline-offset-4">
                            Create an account
                        </Link>
                    </span>
                </CardFooter>
            </Card>
        </section>
    );
}
