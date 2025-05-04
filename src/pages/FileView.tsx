
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileDetails from '@/components/FileDetails';
import { useFiles } from '@/contexts/FileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, FileX, AlertCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const FileView = () => {
  const { id } = useParams<{ id: string }>();
  const { getFileById, files } = useFiles();
  const { user, isAuthenticated } = useAuth();
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
  }, [fileId, files, navigate]);

  // Handle no fileId case right away
  if (!fileId) {
    return null; // Navigation happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0a19] via-[#16121f] to-[#1d1730] py-4 px-2 md:py-8 md:px-4">
      <div className="container mx-auto max-w-3xl">
        {isAdmin && (
          <div className="mb-4 bg-gradient-to-r from-[#2a1e4a] to-[#3d1e70] p-3 rounded-xl border border-[#4c2c8f] shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-white gap-2">
                <Shield className="h-5 w-5 text-[#9b87f5]" />
                <span>Admin Controls</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  variant="outline" 
                  className="bg-[#2a1e4a]/60 text-white border-[#4c2c8f] hover:bg-[#3d1e70] hover:text-white rounded-lg"
                  onClick={() => toast.info("Edit functionality is a demo")}
                >
                  Edit File
                </Button>
                <Button 
                  size="sm"
                  variant="destructive"
                  className="rounded-lg"
                  onClick={() => toast.info("Delete functionality is a demo")}
                >
                  Remove File
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 animate-spin text-oxxfile-purple mb-4" />
              <p className="text-white">Loading file details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-[#1a1725] p-8 rounded-xl border border-[#2a2440] shadow-lg w-full max-w-md">
              <FileX className="w-16 h-16 text-red-500 mb-4 mx-auto" />
              <h2 className="text-white text-xl font-bold mb-2">File Not Found</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="border-gray-700 text-white hover:bg-gray-800 rounded-lg"
                >
                  Go to Home
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 rounded-lg"
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
            <div className="bg-[#1a1725] p-8 rounded-xl border border-[#2a2440] shadow-lg w-full max-w-md">
              <AlertCircle className="w-16 h-16 text-amber-500 mb-4 mx-auto" />
              <h2 className="text-white text-xl font-bold mb-2">Something Went Wrong</h2>
              <p className="text-gray-400 mb-6">
                We couldn't load the file you requested. Please try again later.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 rounded-lg"
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
