import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthUser, isAuthenticated, type UserRole } from '@/lib/auth';

export default function ProtectedRoute({
    children,
    roles,
}: {
    children: ReactNode;
    roles?: UserRole[];
}) {
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    const user = getAuthUser();

    if (roles?.length && user && !roles.includes(user.role)) {
        const fallback = user.role === 'ADMIN' ? '/admin' : user.role === 'DRIVER' ? '/driver' : '/mechanic';
        return <Navigate to={fallback} replace />;
    }

    return <>{children}</>;
}