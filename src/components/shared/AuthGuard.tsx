import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'barber')[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as 'admin' | 'barber')) {
    // Redirect based on role
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/barbeiro/fila');
    }
    return null;
  }

  return <>{children}</>;
}