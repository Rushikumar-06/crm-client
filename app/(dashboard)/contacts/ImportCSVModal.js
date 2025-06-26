
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';

export default function ImportCSVModal({ onClose }) {
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const handleUpload = async () => {
    if (!file) return;
    const token = await getFirebaseIdToken();
    const formData = new FormData();
    formData.append('file', file);

    await fetch('http://localhost:5000/api/contacts/import', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    queryClient.invalidateQueries(['contacts']);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="space-y-4">
        <DialogTitle>Import Contacts</DialogTitle>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Import Contacts from a CSV file.</p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <Button onClick={handleUpload} disabled={!file}>
          Upload CSV
        </Button>
      </DialogContent>
    </Dialog>
  );
}