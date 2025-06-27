'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function Topbar({ sidebarCollapsed = false, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-indigo-100 via-white to-blue-50 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 hover:bg-indigo-100 transition-colors focus:outline-none border border-indigo-200 shadow"
          aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL} />
            <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <p className="text-sm font-medium">{user?.displayName}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout();
              router.push('/login');
            }}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
