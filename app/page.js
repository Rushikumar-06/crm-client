'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/profile');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-indigo-100 via-white to-blue-50">
      <div className="max-w-xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-indigo-800">Welcome to ContactPro CRM</h1>
        <p className="text-lg text-gray-700">
          Manage your contacts, tags, and activities with ease. Secure, fast, and user-friendly.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
