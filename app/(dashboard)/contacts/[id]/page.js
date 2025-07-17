'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getFirebaseIdToken } from '@/lib/firebaseAuth'; 
import AddEditContactModal from '../AddEditContactModal';
import { getBackendUrl } from '@/lib/utils';

export default function ContactDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const fetchContact = async () => {
    const token = await getFirebaseIdToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setContact(data);
  };

  useEffect(() => {
    if (user && id) fetchContact();
  }, [user, id]);

  const handleDelete = async () => {
    const token = await getFirebaseIdToken();
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/contacts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    router.push('/contacts');
  };

  if (!contact) return <p className="p-6 text-lg text-gray-500">Loading contact...</p>;

  return (
    <div className="p-6 flex justify-center items-start min-h-[60vh] bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="w-full max-w-xl bg-white/95 rounded-2xl shadow-lg border-t-8 border-indigo-400/70 p-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-extrabold text-indigo-700 tracking-tight">{contact.name}</h2>
          <span className="text-xs text-gray-400">Last Interaction: {new Date(contact.lastInteraction).toLocaleDateString()}</span>
        </div>
        <div className="space-y-2 text-base text-gray-700">
          <div><span className="font-semibold text-indigo-600">Email:</span> {contact.email}</div>
          <div><span className="font-semibold text-indigo-600">Phone:</span> {contact.phone}</div>
          <div><span className="font-semibold text-indigo-600">Company:</span> {contact.company}</div>
          <div><span className="font-semibold text-indigo-600">Tags:</span> {contact.tags?.length ? contact.tags.join(', ') : <span className='italic text-gray-400'>None</span>}</div>
          <div><span className="font-semibold text-indigo-600">Notes:</span> {contact.notes || <span className='italic text-gray-400'>No notes</span>}</div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => router.push('/contacts')} className="rounded-full px-5 font-semibold">
            Back
          </Button>
          <Button variant="default" onClick={() => setEditModalOpen(true)} className="rounded-full px-5 font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600">
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="rounded-full px-5 font-semibold">
            Delete
          </Button>
        </div>
        {editModalOpen && (
          <AddEditContactModal
            contact={contact}
            onClose={async () => {
              setEditModalOpen(false);
              await fetchContact();
            }}
          />
        )}
      </div>
    </div>
  );
}
