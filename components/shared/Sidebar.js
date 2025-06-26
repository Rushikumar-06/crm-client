'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Contact,
  ListTodo,
  Tag,
  Bot,
  LogOut
} from 'lucide-react';

export default function Sidebar({ collapsed = false }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <aside className={`transition-all duration-300 h-full flex flex-col justify-between bg-gradient-to-b from-indigo-100 via-white to-blue-50 border-r shadow-md ${collapsed ? 'w-20 p-2' : 'w-64 p-4'}`}>
      <div>
        <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <Avatar className={collapsed ? 'h-8 w-8' : ''}>
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <p className="font-semibold text-sm">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </div>
        <nav className="space-y-1">
          <Button variant="ghost" className={`w-full justify-start rounded-lg transition-all ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`} onClick={() => router.push('/dashboard')} title="Dashboard">
            <LayoutDashboard className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Dashboard</span>}
          </Button>
          <Button variant="ghost" className={`w-full justify-start rounded-lg transition-all ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`} onClick={() => router.push('/contacts')} title="Contacts">
            <Contact className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Contacts</span>}
          </Button>
          <Button variant="ghost" className={`w-full justify-start rounded-lg transition-all ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`} onClick={() => router.push('/activities')} title="Activities">
            <ListTodo className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Activities</span>}
          </Button>
          <Button variant="ghost" className={`w-full justify-start rounded-lg transition-all ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`} onClick={() => router.push('/tags')} title="Tags">
            <Tag className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Tags</span>}
          </Button>
          <Button variant="ghost" className={`w-full justify-start rounded-lg transition-all ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`} onClick={() => router.push('/ai')} title="AI Assistant">
            <Bot className="h-5 w-5" />
            {!collapsed && <span className="ml-3">AI Assistant</span>}
          </Button>
        </nav>
      </div>
      <Button
        onClick={() => {
          logout();
          router.push('/login');
        }}
        variant="destructive"
        className={`w-full justify-start rounded-lg ${collapsed ? 'px-2 py-3 flex items-center justify-center' : ''}`}
        title="Logout"
      >
        <LogOut className="h-5 w-5" />
        {!collapsed && <span className="ml-3">Logout</span>}
      </Button>
    </aside>
  );
}