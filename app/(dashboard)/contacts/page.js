'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Upload, Trash, Tag, Grid, List, Pencil, CheckSquare } from 'lucide-react';
import AddEditContactModal from './AddEditContactModal';
import ImportCSVModal from './ImportCSVModal';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { useAuth } from '@/context/AuthContext';

export default function ContactsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [view, setView] = useState('grid');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  const selectAllRef = useRef();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const token = await getFirebaseIdToken();
      const res = await fetch('http://localhost:5000/api/contacts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    },
    enabled: !!user,
  });

  const allTags = useMemo(() => {
    const tags = new Set();
    contacts?.forEach((c) => {
      if (Array.isArray(c.tags)) {
        c.tags.forEach((t) => t.split(',').map((tag) => tag.trim()).forEach((tag) => tags.add(tag)));
      } else if (typeof c.tags === 'string') {
        c.tags.split(',').forEach((tag) => tags.add(tag.trim()));
      }
    });
    return Array.from(tags);
  }, [contacts]);

  const filtered = contacts
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => {
      const tagList = Array.isArray(c.tags) ? c.tags.flatMap(t => t.split(',').map(tag => tag.trim())) : [];
      return tagFilter ? tagList.includes(tagFilter) : true;
    });

  const paginated = filtered.slice(page * limit, (page + 1) * limit);

  // Select all logic
  useEffect(() => {
    if (!bulkMode) return;
    if (!selectAllRef.current) return;
    const allIds = paginated.map(c => c._id);
    const selectedOnPage = allIds.filter(id => selectedContacts.includes(id));
    selectAllRef.current.indeterminate = selectedOnPage.length > 0 && selectedOnPage.length < allIds.length;
  }, [bulkMode, paginated, selectedContacts]);

  const handleSelect = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    const allIds = paginated.map(c => c._id);
    if (e.target.checked) {
      setSelectedContacts(prev => Array.from(new Set([...prev, ...allIds])));
    } else {
      setSelectedContacts(prev => prev.filter(id => !allIds.includes(id)));
    }
  };

  const handleDeleteSelected = async () => {
    const token = await getFirebaseIdToken();

    await fetch('http://localhost:5000/api/contacts/bulk-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: selectedContacts }),
    });

    setSelectedContacts([]);
    queryClient.invalidateQueries(['contacts']);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contacts</h2>
        <div className="flex gap-2">
          <Button variant={bulkMode ? 'secondary' : 'outline'} onClick={() => setBulkMode(!bulkMode)}>
            <Trash className="w-4 h-4 mr-2" /> {bulkMode ? 'Cancel' : 'Bulk Delete'}
          </Button>
          <Button variant="outline" onClick={() => setView(view === 'list' ? 'grid' : 'list')}>
            {view === 'list' ? <Grid className="w-4 h-4 mr-2" /> : <List className="w-4 h-4 mr-2" />} View
          </Button>
          <Button onClick={() => setImportOpen(true)}><Upload className="mr-2 h-4 w-4" /> Import</Button>
          <Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {bulkMode && selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
          <span>{selectedContacts.length} selected</span>
          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash className="w-4 h-4 mr-1" /> Confirm Delete
          </Button>
        </div>
      )}

      {view === 'list' ? (
        <Table>
          <TableHeader>
            <TableRow>
              {bulkMode && (
                <TableHead>
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={paginated.length > 0 && paginated.every(c => selectedContacts.includes(c._id))}
                    onChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((c) => (
              <TableRow key={c._id}>
                {bulkMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(c._id)}
                      onChange={() => handleSelect(c._id)}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <button onClick={() => router.push(`/contacts/${c._id}`)} className="text-blue-600 hover:underline">
                    {c.name}
                  </button>
                </TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.company}</TableCell>
                <TableCell>
                  {c.tags?.flatMap(tag => tag.split(',').map(t => t.trim())).map((t, i) => (
                    <span key={i} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded mr-1">
                      {t}
                    </span>
                  ))}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingContact(c);
                    setModalOpen(true);
                  }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((c) => (
            <div
              key={c._id}
              onClick={() => !bulkMode && router.push(`/contacts/${c._id}`)}
              className={`border rounded-xl p-6 shadow hover:shadow-lg transition relative group bg-white cursor-pointer ${selectedContacts.includes(c._id) ? 'ring-2 ring-blue-500' : ''}`}
            >
              {bulkMode && (
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(c._id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelect(c._id);
                    }}
                  />
                </div>
              )}
              <div className="absolute top-3 right-3 hidden group-hover:block">
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  setEditingContact(c);
                  setModalOpen(true);
                }}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-lg font-bold mb-1 text-gray-800">{c.name}</h3>
              <p className="text-sm text-gray-600">📧 {c.email}</p>
              <p className="text-sm text-gray-600">🏢 {c.company}</p>
              <p className="text-sm text-gray-600">📞 {c.phone}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {c.tags?.flatMap(tag => tag.split(',').map(t => t.trim())).map((t, i) => (
                  <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-4 gap-2">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <Button variant="outline" disabled={(page + 1) * limit >= filtered.length} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>

      {modalOpen && (
        <AddEditContactModal
          onClose={() => {
            setModalOpen(false);
            setEditingContact(null);
            queryClient.invalidateQueries(['contacts']);
          }}
          contact={editingContact}
        />
      )}
      {importOpen && <ImportCSVModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}
