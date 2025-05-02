
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById, files } = useFiles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const fileId = id || '';
  const file = getFileById(fileId);

  useEffect(() => {
    // Short delay to ensure files are loaded from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!getFileById(fileId) && fileId) {
        console.error(`File with ID ${fileId} not found`);
        toast.error("File not found. Please check the URL or try again.");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fileId, files]);

  if (!fileId) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a19] to-[#16121f] py-4 px-2 md:py-8 md:px-4">
      <div className="container mx-auto max-w-3xl">
        {isLoading || !file ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-oxxfile-purple mb-4" />
              <p className="text-white">Loading file details...</p>
            </div>
          </div>
        ) : (
          <FileDetails fileId={fileId} />
        )}
      </div>
    </div>
  );
};

export default FileView;
