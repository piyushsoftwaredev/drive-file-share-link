
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, FileX, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById, files } = useFiles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileId = id || '';
  const file = getFileById(fileId);
  const isAdmin = user?.isAdmin || false;

  useEffect(() => {
    if (!fileId) {
      navigate('/');
      return;
    }

    // Short delay to ensure files are loaded from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!getFileById(fileId)) {
        console.error(`File with ID ${fileId} not found`);
        setError("File not found. Please check the URL or try again.");
        toast.error("File not found. Please check the URL or try again.");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fileId, files, navigate, getFileById]);

  // Handle no fileId case right away
  if (!fileId) {
    return null; // Navigation happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0812] via-[#100b19] to-[#170e2d] py-4 px-2 md:py-8 md:px-4">
      <div className="container mx-auto max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-oxxfile-purple mb-4" />
              <p className="text-white">Loading file details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#0f0a19] p-8 rounded-2xl border border-[#2a2440] shadow-lg w-full max-w-md glass-dark">
              <FileX className="w-16 h-16 text-red-500 mb-4 mx-auto" />
              <h2 className="text-white text-xl font-bold mb-2">File Not Found</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="border-gray-700 text-white hover:bg-gray-800 rounded-xl"
                >
                  Go to Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 rounded-xl"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : file ? (
          <FileDetails fileId={fileId} isAdmin={isAdmin} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#0f0a19] p-8 rounded-2xl border border-[#2a2440] shadow-lg w-full max-w-md glass-dark">
              <AlertCircle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
              <h2 className="text-white text-xl font-bold mb-2">Something Went Wrong</h2>
              <p className="text-gray-400 mb-6">
                We couldn't load the file you requested. Please try again later.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 rounded-xl"
              >
                Return to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileView;
