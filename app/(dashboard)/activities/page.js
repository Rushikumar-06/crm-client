'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getBackendUrl } from '@/lib/utils';

const ACTIVITY_ICONS = {
  contact_created: '🟢',
  contact_updated: '📝',
  contact_deleted: '❌',
  bulk_import: '📥',
  bulk_delete: '🧹',
  user_login: '🔐',
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['activities', actionFilter, startDate, endDate],
    queryFn: async ({ pageParam = 0 }) => {
      const token = await getFirebaseIdToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/activities?page=${pageParam}&action=${actionFilter}&start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: !!user,
  });

  const activities = data?.pages.flatMap(p => p.activities) || [];

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Activity Timeline</h2>

      <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-4 rounded-md shadow">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded text-sm"
        >
          <option value=''>All Actions</option>
          <option value='contact_created'>Contact Created</option>
          <option value='contact_updated'>Contact Updated</option>
          <option value='contact_deleted'>Contact Deleted</option>
          <option value='bulk_import'>Bulk Import</option>
          <option value='bulk_delete'>Bulk Delete</option>
          <option value='user_login'>User Login</option>
        </select>
        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="max-w-xs" />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="max-w-xs" />
      </div>

      <div className="space-y-6">
        {activities.map((a) => (
          <div key={a._id} className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm hover:shadow transition">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-xl">{ACTIVITY_ICONS[a.action]}</span>
                <div>
                  <div className="font-semibold text-gray-700">
                    {a.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} — <span className="text-indigo-600">{a.entityName}</span>
                  </div>
                  {a.metadata?.count && <div className="text-sm text-gray-500"> {a.action === 'bulk_import' ? 'Imported' : 'Deleted'} {a.metadata.count} items</div>}
                  {a.metadata?.updatedFields && (
                    <div className="text-sm text-gray-500">Updated Fields: {a.metadata.updatedFields.join(', ')}</div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-400 whitespace-nowrap">{format(new Date(a.timestamp), 'PPpp')}</div>
            </div>
          </div>
        ))}
        {hasNextPage && (
          <div className="text-center">
            <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}