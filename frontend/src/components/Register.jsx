import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { validateName, validateEmail, validatePassword, sanitizeInput } from '../services/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        <section className="container flex justify-center py-16">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Join Pettikadai
                    </p>
                    <CardTitle className="text-2xl">Create Account</CardTitle>
                    <CardDescription>Sign up to save your wishlist, cart, and track orders.</CardDescription>
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
                            <Label htmlFor="register-name">Full Name</Label>
                            <Input
                                id="register-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="register-email">Email Address</Label>
                            <Input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="register-password">Password</Label>
                            <Input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="register-confirm">Confirm Password</Label>
                            <Input
                                id="register-confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? 'Creating account...' : 'Create Account →'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center text-sm text-muted-foreground">
                    <span>
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-foreground underline underline-offset-4">
                            Sign in
                        </Link>
                    </span>
                </CardFooter>
            </Card>
        </section>
    );
}
