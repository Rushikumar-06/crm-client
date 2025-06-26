'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import Topbar from '@/components/shared/Topbar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [user, loading, pathname, router]);

  if (!user) return null;

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
