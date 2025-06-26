// ✅ FRONTEND: app/contacts/AddEditContactModal.js
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';

export default function AddEditContactModal({ onClose, contact }) {
  const isEdit = !!contact;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    tags: contact?.tags || [],
    notes: contact?.notes || '',
  });

  const { data: availableTags = [] } = useQuery({
    queryKey: ['available-tags'],
    queryFn: async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!user,
  });

  const toggleTag = (tagName) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter((t) => t !== tagName)
        : [...prev.tags, tagName],
    }));
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const token = await getFirebaseIdToken();
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `http://localhost:5000/api/contacts/${contact._id}`
      : 'http://localhost:5000/api/contacts';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...formData }),
    });

    queryClient.invalidateQueries(['contacts']);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="space-y-6 p-6 bg-white rounded-lg shadow-xl">
        <DialogTitle className="text-xl font-bold text-gray-800">
          {isEdit ? 'Edit Contact' : 'Add Contact'}
        </DialogTitle>
        <div className="space-y-3">
          <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <Input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <Input name="company" placeholder="Company" value={formData.company} onChange={handleChange} />

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const selected = formData.tags.includes(tag.name);
                return (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag.name)}
                    className={`rounded-full px-4 py-1 text-sm border transition duration-200 ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    style={{ borderColor: tag.color, color: selected ? '#fff' : tag.color, backgroundColor: selected ? tag.color : '#fff' }}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 text-sm resize-none"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isEdit ? 'Update' : 'Add'} Contact
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
