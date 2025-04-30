
import React from 'react';
import { useFiles } from '@/contexts/FileContext';
import FileIcon from './FileIcon';
import { Button } from '@/components/ui/button';
import { Clock, Lock, Globe, Wifi, User, Download, Share2, QrCode, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FileDetailsProps {
  fileId: string;
}

const FileDetails: React.FC<FileDetailsProps> = ({ fileId }) => {
  const { getFileById } = useFiles();
  const file = getFileById(fileId);

  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-white mb-4">File not found</h2>
        <p className="text-gray-400">The requested file could not be found.</p>
      </div>
    );
  }

  // Extract file extension
  const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} days ago`;
  };

  const handleCopyShareLink = () => {
    // Construct the absolute URL
    const shareUrl = `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const handleDownloadClick = () => {
    toast.info("Download option selected. This is a demo feature.");
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto p-4">
      {/* Header with file name and info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          <FileIcon type={fileExtension} size="lg" />
        </div>
        <div className="flex flex-col flex-grow">
          <h1 className="text-xl md:text-2xl font-bold text-white">{file.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white">{file.size}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">{formatDate(file.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* File details */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 gap-y-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Full Name</span>
          </div>
          <div className="text-right text-white truncate">
            {file.name}
          </div>

          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Security</span>
          </div>
          <div className="text-right text-white">
            {file.security}
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Accessibility</span>
          </div>
          <div className="text-right text-white">
            {file.accessibility}
          </div>

          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Connection</span>
          </div>
          <div className="text-right text-white">
            {file.connection}
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Shared By</span>
          </div>
          <div className="text-right">
            <span className="text-oxxfile-purple">{file.sharedBy}</span>
          </div>
        </div>
      </div>

      {/* Call to action button */}
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 mb-4 flex items-center justify-center gap-2"
        onClick={handleCopyShareLink}
      >
        <span className="text-lg">Join @OxxFile</span>
      </Button>

      {/* Download section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg text-white">Downloads</h2>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <div className="flex items-center gap-2 w-full justify-between">
              <span>Instant Download</span>
              <span className="text-xs text-gray-500">twilight-cloud-58bc</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <span>GDToT Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <span>HubCloud Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <span>FilePress Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <span>PixelDrain Download</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full text-left justify-start bg-gray-900/50 hover:bg-gray-800/50 border-gray-700 py-6"
            onClick={handleDownloadClick}
          >
            <span>Viking Download</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button 
            variant="outline" 
            className="bg-gray-900/50 hover:bg-gray-800/50 border-gray-700"
            onClick={() => toast.info("QR Code feature - this is a demo")}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Show QR
          </Button>
          
          <Button 
            variant="outline" 
            className="bg-gray-900/50 hover:bg-gray-800/50 border-gray-700"
            onClick={handleCopyShareLink}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4 bg-gray-900/50 hover:bg-gray-800/50 border-gray-700"
          onClick={() => toast.info("Watch Video feature - this is a demo")}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Watch Video
        </Button>
      </div>
    </div>
  );
};

export default FileDetails;
