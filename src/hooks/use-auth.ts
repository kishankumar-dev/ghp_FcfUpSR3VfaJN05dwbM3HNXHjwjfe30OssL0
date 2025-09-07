'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  email: string;
  username: string;
  photoURL?: string;
}

const PROTECTED_ROUTES = ['/chat', '/account'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        setUser(null);
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
    
    const handleStorageChange = (event: StorageEvent) => {
       if (event.key === 'userToken' || event.key === 'user') {
        checkAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);
  
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname === '/login' || pathname === '/signup';
      
      // If user is on an auth page
      if (isAuthPage) {
        if (user) {
          router.push('/');
        }
      } 
      // If user is on a protected route
      else if (PROTECTED_ROUTES.includes(pathname)) {
        if (!user) {
          router.push('/login');
        }
      }
    }
  }, [user, loading, pathname, router]);

  return { user, loading };
}
