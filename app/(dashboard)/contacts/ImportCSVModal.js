'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { getFirebaseIdToken } from '@/lib/firebaseAuth';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export default function ImportCSVModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); 
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setUploadStatus(null);
      }
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      const token = await getFirebaseIdToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/contacts/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('success');
        queryClient.invalidateQueries(['contacts']);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Import Contacts
        </DialogTitle>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {!file ? (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Drop your CSV file here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2"
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="mx-auto h-12 w-12 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {uploadStatus && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                uploadStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {uploadStatus === 'success' 
                    ? 'Contacts imported successfully!' 
                    : 'Failed to import contacts. Please try again.'}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              CSV Format Requirements:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• First row should contain headers: name, email, phone, company, tags</li>
              <li>• Tags should be comma-separated</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Supported format: .csv only</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="min-w-[100px]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </div>
              ) : (
                'Import Contacts'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}