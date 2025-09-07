'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const PROTECTED_ROUTES = ['/chat', '/account'];

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();
  const pathname = usePathname();
  const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);

  if (loading && isProtectedRoute) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
