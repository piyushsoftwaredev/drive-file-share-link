
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';
import { Loader2, FileX, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById, files } = useFiles();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileId = id || '';
  const file = getFileById(fileId);

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
  }, [fileId, files, navigate]);

  // Handle no fileId case right away
  if (!fileId) {
    return null; // Navigation happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0810] to-[#161321] animate-gradient py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="glass-card p-10 flex flex-col items-center pulse-glow">
              <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
              <p className="text-white text-xl">Loading file details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center py-20 text-center">
            <FileX className="w-16 h-16 text-red-500 mb-6 glow-md" />
            <h2 className="text-white text-2xl font-bold mb-4 purple-gradient-text">File Not Found</h2>
            <p className="text-gray-300 mb-8 max-w-md">{error}</p>
            <div className="flex gap-6">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="border-purple-500/30 text-white bg-black/20 hover:bg-purple-900/20 px-6 py-3 text-lg"
              >
                Go to Home
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="glow-button px-6 py-3 text-lg"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : file ? (
          <div className="animate-fade">
            <FileDetails fileId={fileId} />
          </div>
        ) : (
          <div className="glass-card p-10 flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mb-6 glow-md" />
            <h2 className="text-white text-2xl font-bold mb-4 purple-gradient-text">Something Went Wrong</h2>
            <p className="text-gray-300 mb-8 max-w-md">
              We couldn't load the file you requested. Please try again later.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="glow-button px-6 py-3 text-lg"
            >
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileView;
