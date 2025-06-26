// ✅ FRONTEND: app/(protected)/tags/page.js
'use client';

import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { Tooltip } from 'react-tooltip';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

export default function TagsPage() {
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editingTag, setEditingTag] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.tags || data;
    },
  });

  const addTag = async () => {
    setError('');
    setSuccess('');
    if (!newTag.trim()) {
      setError('Tag name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newTag, color: newColor }),
      });
      if (!res.ok) throw new Error('Failed to add tag');
      setNewTag('');
      setNewColor('#6366f1');
      setSuccess('Tag added!');
      queryClient.invalidateQueries(['tags']);
      queryClient.invalidateQueries(['available-tags']);
    } catch (e) {
      setError('Failed to add tag.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (id) => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const token = await getFirebaseIdToken();
      const res = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete tag');
      setSuccess('Tag deleted!');
      queryClient.invalidateQueries(['tags']);
      queryClient.invalidateQueries(['available-tags']);
    } catch (e) {
      setError('Failed to delete tag.');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const openEditDialog = (tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
    setError('');
    setSuccess('');
  };

  const saveEdit = async () => {
    setError('');
    setSuccess('');
    if (!editName.trim()) {
      setError('Tag name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      const token = await getFirebaseIdToken();
      const res = await fetch(`http://localhost:5000/api/tags/${editingTag._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, color: editColor }),
      });
      if (!res.ok) throw new Error('Failed to update tag');
      setEditingTag(null);
      setSuccess('Tag updated!');
      queryClient.invalidateQueries(['tags']);
      queryClient.invalidateQueries(['available-tags']);
    } catch (e) {
      setError('Failed to update tag.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 pb-20">
      <div className="w-full bg-gradient-to-r from-indigo-500  py-10 mb-10 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Tags</h1>
          <p className="text-indigo-100 mt-2">Organize your workspace with custom tags.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-10">
        {/* Tag Creation Card */}
        <Card className="border-l-8 border-indigo-500/80 bg-white/90 shadow-xl">
          <CardHeader>
            <CardTitle className="text-indigo-700">Create a New Tag</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={e => { e.preventDefault(); addTag(); }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
            >
              <div className="md:col-span-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  placeholder="e.g., Important, Client, Personal"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  aria-label="Tag Name"
                  disabled={loading}
                  className="bg-indigo-50/50 focus:bg-white"
                />
              </div>
              <div>
                <Label htmlFor="tag-color">Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    id="tag-color"
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    aria-label="Tag Color"
                    disabled={loading}
                    className="w-12 h-12 rounded-full shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                    style={{ borderColor: newColor, background: newColor }}
                  />
                  <span className="text-xs text-gray-500">{newColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <Button
                  className="h-12 w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-blue-600"
                  onClick={addTag}
                  disabled={!newTag.trim() || loading}
                  aria-label="Add Tag"
                  type="submit"
                >
                  <Plus size={18} className="mr-2" /> {loading ? 'Adding...' : 'Add Tag'}
                </Button>
              </div>
            </form>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mt-4 bg-green-50 border-green-300">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Tag List */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))
          ) : tags.length === 0 ? (
            <div className="col-span-full text-center text-gray-400">No tags found.</div>
          ) : (
            tags.map((tag) => (
              <Card
                key={tag._id}
                className="relative bg-white/95 border-t-8 shadow-lg border-t-[var(--tag-color)] hover:shadow-2xl transition group"
                style={{
                  // Use tag color for top border
                  '--tag-color': tag.color,
                }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span
                    className="w-12 h-12 rounded-full border-4 border-white shadow-lg block"
                    style={{ backgroundColor: tag.color }}
                  />
                </div>
                <CardHeader className="pt-10 pb-2 flex flex-col items-center">
                  <CardTitle className="text-lg font-bold text-gray-800">{tag.name}</CardTitle>
                  <span className="text-xs text-gray-500 mt-1">{tag.usageCount} uses</span>
                </CardHeader>
                <CardContent className="flex justify-center gap-3 pt-2">
                  <Button size="sm" variant="secondary" className="rounded-full px-4" onClick={() => openEditDialog(tag)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="rounded-full px-4" onClick={() => setConfirmDelete(tag)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Confirm Delete Dialog */}
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="space-y-4 border-t-8 border-indigo-500">
            <DialogTitle className="text-xl font-semibold text-indigo-700">Delete Tag</DialogTitle>
            <div>Are you sure you want to delete the tag <span className="font-semibold">"{confirmDelete?.name}"</span>?</div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => deleteTag(confirmDelete._id)} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent className="space-y-4 border-t-8 border-indigo-500">
            <DialogTitle className="text-xl font-semibold text-indigo-700">Edit Tag</DialogTitle>
            <Input
              placeholder="Tag Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              aria-label="Edit Tag Name"
              disabled={loading}
              className="bg-indigo-50/50 focus:bg-white"
            />
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={editColor}
                onChange={e => setEditColor(e.target.value)}
                aria-label="Edit Tag Color"
                disabled={loading}
                className="w-12 h-12 rounded-full border-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                style={{ borderColor: editColor, background: editColor }}
              />
              <span className="text-xs text-gray-500">{editColor.toUpperCase()}</span>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingTag(null)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={loading || !editName.trim()} className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-semibold hover:from-indigo-600 hover:to-blue-600">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}