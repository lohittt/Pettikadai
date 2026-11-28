import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

export function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <section className="container py-16">
                <Card className="bg-card py-12 text-center">
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Checking session...</p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
    }

    return children;
}
