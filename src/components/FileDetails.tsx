
import React from 'react';
import { useFiles } from '@/contexts/FileContext';
import FileIcon from './FileIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Lock, 
  Globe, 
  Wifi, 
  User, 
  Download, 
  Share2, 
  QrCode, 
  PlayCircle, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface FileDetailsProps {
  fileId: string;
}

const FileDetails: React.FC<FileDetailsProps> = ({ fileId }) => {
  const { getFileById, updateFileMirrors } = useFiles();
  const file = getFileById(fileId);

  if (!file) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-8 bg-gray-900/50 border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">File not found</h2>
        <p className="text-gray-400">The requested file could not be found.</p>
      </Card>
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

  const handleDownloadClick = (mirrorId: string) => {
    const mirror = file.mirrors[mirrorId];
    if (!mirror || !mirror.downloadUrl) {
      toast.error("Download link is not available yet.");
      return;
    }
    window.open(mirror.downloadUrl, '_blank');
    toast.info("Download initiated. This may take a moment.");
  };

  const handleRegenerateMirrors = async () => {
    toast.info("Regenerating mirrors. This may take a moment.");
    try {
      await updateFileMirrors(fileId);
      toast.success("Mirror regeneration initiated.");
    } catch (error) {
      toast.error("Failed to regenerate mirrors.");
    }
  };

  const isVideoFile = ['mp4', 'mkv', 'avi', 'mov'].includes(fileExtension.toLowerCase());

  // Check if any mirrors are available (not processing or failed)
  const hasMirrors = Object.values(file.mirrors || {}).some(
    mirror => mirror.status === 'success' && mirror.downloadUrl
  );

  return (
    <div className="rounded-lg overflow-hidden bg-[#14121d] bg-opacity-80 border border-[#2a2440] backdrop-blur-sm shadow-xl">
      {/* File name header in gradient container */}
      <div className="bg-gradient-to-r from-[#1e1736] to-[#281e4a] p-4 rounded-t-lg">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <FileIcon type={fileExtension} size="lg" />
          </div>
          <div className="flex-grow">
            <h1 className="text-xl md:text-2xl font-bold text-[#9b87f5] truncate">{file.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-white font-medium">{file.size}</span>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File details */}
      <div className="p-4 md:p-6">
        <div className="bg-[#1a1725] rounded-lg p-4 mb-6 border border-[#2a2440]">
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Full Name</span>
              </div>
            </div>
            <div className="text-right text-white truncate">
              {file.name}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </div>
            </div>
            <div className="text-right text-white">
              {file.security}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>Accessibility</span>
              </div>
            </div>
            <div className="text-right text-white">
              {file.accessibility}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <Wifi className="w-4 h-4" />
                <span>Connection</span>
              </div>
            </div>
            <div className="text-right text-white">
              {file.connection}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>Shared By</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[#9b87f5] font-medium">{file.sharedBy}</span>
            </div>
          </div>
        </div>

        {/* Call to action button */}
        <Button 
          className="w-full bg-gradient-to-r from-[#3498db] to-[#2980b9] hover:from-[#2980b9] hover:to-[#3498db] text-white py-6 mb-6 flex items-center justify-center gap-2 font-bold border-0"
          onClick={handleCopyShareLink}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white" fillOpacity="0.2" />
            <path d="M12 6V18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 9H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg">Join @LDRIVE</span>
        </Button>

        {/* Download section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-medium text-white">Downloads</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 bg-[#1a1725] px-3 py-1 rounded-full">
                {fileExtension}
              </span>
              <Button 
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white"
                onClick={handleRegenerateMirrors}
                disabled={file.isProcessing}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator className="bg-[#2a2440] mb-4" />

          {file.isProcessing ? (
            <div className="bg-[#1a1725]/50 border-[#2a2440] p-8 rounded-md text-center">
              <div className="animate-spin mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-[#9b87f5]" />
              </div>
              <p className="text-white">Processing your file...</p>
              <p className="text-gray-400 text-sm mt-2">This may take a few moments depending on file size</p>
            </div>
          ) : hasMirrors ? (
            <div className="flex flex-col gap-3">
              {Object.entries(file.mirrors || {}).map(([mirrorId, mirror]) => {
                // Only show mirrors that are ready
                if (mirror.status !== 'success' || !mirror.downloadUrl) return null;
                
                let iconClass = "text-[#3498db]"; // Default color
                let mirrorName = "Download";
                
                // Set icon color and name based on mirror type
                switch (mirrorId) {
                  case 'direct':
                    iconClass = "text-[#3498db]";
                    mirrorName = "Direct Google Drive";
                    break;
                  case 'pixeldrain':
                    iconClass = "text-[#9b87f5]";
                    mirrorName = "PixelDrain Download";
                    break;
                  case 'gdflix':
                    iconClass = "text-[#f39c12]";
                    mirrorName = "GDflix Download";
                    break;
                  default:
                    iconClass = "text-[#3498db]";
                }
                
                return (
                  <Button 
                    key={mirrorId}
                    variant="outline" 
                    className="w-full text-left justify-start bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] py-6 text-white hover:text-white"
                    onClick={() => handleDownloadClick(mirrorId)}
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={iconClass}><path d="M8 17L12 21L16 17"></path><path d="M12 12V21"></path><path d="M20.88 18.09C22.08 17.08 22.73 15.53 22.73 13.88C22.73 10.64 20.13 8.04 16.89 8.04C16.24 7.04 15.28 6.26 14.12 5.77C12.96 5.28 11.66 5.11 10.4 5.29C9.14 5.47 7.97 6 7.04 6.81C6.1 7.63 5.44 8.69 5.15 9.87C3.87 10.09 2.73 10.84 1.96 11.93C1.19 13.03 0.850122 14.39 0.999783 15.75C1.14944 17.11 1.77932 18.36 2.79133 19.23C3.80334 20.1 5.1162 20.54 6.5 20.5H7.5"></path></svg>
                        <span className="font-medium">{mirrorName}</span>
                      </div>
                      <div className="flex items-center">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#1a1725]/50 border-[#2a2440] p-8 rounded-md text-center">
              <p className="text-white">No mirrors available</p>
              <p className="text-gray-400 text-sm mt-2">Click the refresh button to regenerate mirrors</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
              className="bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white"
              onClick={() => toast.info("QR Code feature - this is a demo")}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Show QR
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white"
              onClick={handleCopyShareLink}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          {isVideoFile && (
            <Button 
              variant="outline" 
              className="w-full mt-4 bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white"
              onClick={() => toast.info("Watch Video feature - this is a demo")}
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Watch Video
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
