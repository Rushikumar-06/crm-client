'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${pathname}`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="text-center mt-10">Checking authentication...</div>;
  }

  return <>{children}</>;
}
