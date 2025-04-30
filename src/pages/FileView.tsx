
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById } = useFiles();
  const navigate = useNavigate();

  const fileId = id || '';
  const file = getFileById(fileId);

  useEffect(() => {
    if (!file && fileId) {
      console.error(`File with ID ${fileId} not found`);
      toast.error("File not found. Please check the URL or try again.");
    }
  }, [file, fileId]);

  if (!fileId) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-oxxfile-dark">
      {!file ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p className="text-white">Loading file details...</p>
          </div>
        </div>
      ) : (
        <FileDetails fileId={fileId} />
      )}
    </div>
  );
};

export default FileView;
