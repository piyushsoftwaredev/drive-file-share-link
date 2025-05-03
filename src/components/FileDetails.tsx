import React, { useState, useRef } from 'react';
import { useFiles } from '@/contexts/FileContext';
import FileIcon from './FileIcon';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

interface FileDetailsProps {
  fileId: string;
}

const FileDetails: React.FC<FileDetailsProps> = ({ fileId }) => {
  const { getFileById, updateFileMirrors } = useFiles();
  const [isGeneratingGdflix, setIsGeneratingGdflix] = useState(false);
  const [isGeneratingPixeldrain, setIsGeneratingPixeldrain] = useState(false);
  const toastIdsRef = useRef<Record<string, string>>({});
  const file = getFileById(fileId);

  // Function to prevent duplicate toasts
  const showToast = (type: 'success' | 'error' | 'info', message: string, id: string) => {
    // If we already have this toast ID active, don't show again
    if (toastIdsRef.current[id]) {
      return;
    }
    
    // Show toast and store the ID as string
    let toastId: string;
    if (type === 'success') {
      toastId = String(toast.success(message, { id }));
    } else if (type === 'error') {
      toastId = String(toast.error(message, { id }));
    } else {
      toastId = String(toast.info(message, { id }));
    }
    
    // Store the ID and remove from tracking after toast completes
    toastIdsRef.current[id] = toastId;
    setTimeout(() => {
      delete toastIdsRef.current[id];
    }, 5000);
  };

  if (!file) {
    return (
      <Card className="w-full max-w-3xl mx-auto p-8 bg-gray-900/50 border-gray-800 rounded-xl">
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
    showToast('success', "Link copied to clipboard!", "copy-link");
  };

  const handleDownloadClick = (mirrorId: string) => {
    const mirror = file.mirrors[mirrorId];
    if (!mirror || !mirror.downloadUrl) {
      showToast('error', "Download link is not available yet.", "download-error");
      return;
    }
    
    // Open the link in a new tab
    window.open(mirror.downloadUrl, '_blank');
    
    // Show different toast message based on mirror type
    if (mirrorId === 'gdflix') {
      showToast('info', "Redirecting to GDflix...", "redirect-gdflix");
    } else if (mirrorId === 'pixeldrain') {
      showToast('info', "Redirecting to Pixeldrain...", "redirect-pixeldrain");
    } else {
      showToast('info', "Download initiated. This may take a moment.", "download-generic");
    }
  };

  // Function to specifically generate GDflix mirror
  const generateGdflixMirror = async () => {
    if (isGeneratingGdflix) return;

    setIsGeneratingGdflix(true);
    showToast('info', "Generating GDflix mirror...", "generating-gdflix");

    try {
      // Pass a flag to only generate gdflix mirror
      const result = await updateFileMirrors(fileId, { onlyGdflix: true });
      
      // Check if the mirror was generated successfully
      if (result && result.status === 'success') {
        showToast('success', "GDflix mirror generated successfully", "success-gdflix");
      } else {
        throw new Error("Failed to generate GDflix mirror");
      }
    } catch (error) {
<<<<<<< HEAD
      showToast('error', "Failed to generate GDflix mirror", "error-gdflix");
=======
      console.error("Error generating GDflix mirror:", error);
      toast.error("Failed to generate GDflix mirror");
>>>>>>> d66cd27c449b2174febf83f274cdf14afd488e9f
    } finally {
      setIsGeneratingGdflix(false);
    }
  };

  // Function to specifically generate Pixeldrain mirror
  const generatePixeldrainMirror = async () => {
    if (isGeneratingPixeldrain) return;

    setIsGeneratingPixeldrain(true);
    showToast('info', "Generating Pixeldrain mirror...", "generating-pixeldrain");

    try {
      // Pass a flag to only generate pixeldrain mirror
      const result = await updateFileMirrors(fileId, { onlyPixeldrain: true });
      
      // Check if the mirror was generated successfully
      if (result && result.status === 'success') {
        showToast('success', "Pixeldrain mirror generated successfully", "success-pixeldrain");
      } else {
        throw new Error("Failed to generate Pixeldrain mirror");
      }
    } catch (error) {
<<<<<<< HEAD
      showToast('error', "Failed to generate Pixeldrain mirror", "error-pixeldrain");
=======
      console.error("Error generating Pixeldrain mirror:", error);
      toast.error("Failed to generate Pixeldrain mirror");
>>>>>>> d66cd27c449b2174febf83f274cdf14afd488e9f
    } finally {
      setIsGeneratingPixeldrain(false);
    }
  };

  const isVideoFile = ['mp4', 'mkv', 'avi', 'mov'].includes(fileExtension.toLowerCase());

  // Check if GDflix mirror is available
  const hasGdflixMirror = file.mirrors?.gdflix?.status === 'success' && 
                          file.mirrors?.gdflix?.downloadUrl;

  // Check if Pixeldrain mirror is available
  const hasPixeldrainMirror = file.mirrors?.pixeldrain?.status === 'success' && 
                             file.mirrors?.pixeldrain?.downloadUrl;

  // Is currently generating any mirror
  const isGeneratingAny = isGeneratingGdflix || isGeneratingPixeldrain;

  return (
    <div className="rounded-xl overflow-hidden bg-[#14121d] bg-opacity-80 border border-[#2a2440] backdrop-blur-sm shadow-xl">
      {/* File name header in gradient container */}
      <div className="bg-gradient-to-r from-[#1e1736] to-[#281e4a] p-4 rounded-t-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FileIcon type={fileExtension} size="lg" />
          </div>
          <div className="flex-grow overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold text-[#9b87f5] truncate">
              {file.name}
            </h1>
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
        <div className="bg-[#1a1725] rounded-xl p-4 mb-6 border border-[#2a2440]">
          <div className="grid grid-cols-2 gap-y-4">
            <div className="flex items-center gap-2">
              <div className="text-gray-400 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                <span>Full Name</span>
              </div>
            </div>
            <div className="text-right text-white break-words">
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
          className="w-full bg-gradient-to-r from-[#3498db] to-[#2980b9] hover:from-[#2980b9] hover:to-[#3498db] text-white py-6 mb-6 flex items-center justify-center gap-2 font-bold border-0 rounded-xl"
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
            </div>
          </div>

          <Separator className="bg-[#2a2440] mb-4" />

          {/* GDflix Section */}
          <div className="mb-4">
            {hasGdflixMirror ? (
              <Button 
                variant="outline" 
                className="w-full text-left justify-center bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] py-6 text-white hover:text-white rounded-xl"
                onClick={() => handleDownloadClick('gdflix')}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f39c12]"><path d="M8 17L12 21L16 17"></path><path d="M12 12V21"></path><path d="M20.88 18.09C22.08 17.08 22.73 15.53 22.73 13.88C22.73 10.64 20.13 8.04 16.89 8.04C16.24 7.04 15.28 6.26 14.12 5.77C12.96 5.28 11.66 5.11 10.4 5.29C9.14 5.47 7.97 6 7.04 6.81C6.1 7.63 5.44 8.69 5.15 9.87C3.87 10.09 2.73 10.84 1.96 11.93C1.19 13.03 0.850122 14.39 0.999783 15.75C1.14944 17.11 1.77932 18.36 2.79133 19.23C3.80334 20.1 5.1162 20.54 6.5 20.5H7.5"></path></svg>
                  <span className="font-medium">GDflix Mirror</span>
                  <ExternalLink className="w-4 h-4 ml-2 text-gray-500" />
                  <Badge variant="outline" className="ml-2 bg-[#f39c12]/20 border-[#f39c12]/40 text-[#f39c12]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span className="text-xs">Ready</span>
                  </Badge>
                </div>
              </Button>
            ) : (
              <Button 
                className="w-full bg-[#1a1725]/50 hover:bg-[#241e38]/50 border border-[#2a2440] py-6 text-white flex justify-center rounded-xl"
                onClick={generateGdflixMirror}
                disabled={isGeneratingAny}
              >
                <div className="flex items-center gap-2 justify-center">
                  {isGeneratingGdflix ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f39c12]"><path d="M8 17L12 21L16 17"></path><path d="M12 12V21"></path><path d="M20.88 18.09C22.08 17.08 22.73 15.53 22.73 13.88C22.73 10.64 20.13 8.04 16.89 8.04C16.24 7.04 15.28 6.26 14.12 5.77C12.96 5.28 11.66 5.11 10.4 5.29C9.14 5.47 7.97 6 7.04 6.81C6.1 7.63 5.44 8.69 5.15 9.87C3.87 10.09 2.73 10.84 1.96 11.93C1.19 13.03 0.850122 14.39 0.999783 15.75C1.14944 17.11 1.77932 18.36 2.79133 19.23C3.80334 20.1 5.1162 20.54 6.5 20.5H7.5"></path></svg>
                  )}
                  <span>{isGeneratingGdflix ? 'Generating GDflix mirror...' : 'Generate GDflix Mirror'}</span>
                </div>
              </Button>
            )}
          </div>

          {/* Pixeldrain Section */}
          <div className="mb-6">
            {hasPixeldrainMirror ? (
              <Button 
                variant="outline" 
                className="w-full text-left justify-center bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] py-6 text-white hover:text-white rounded-xl"
                onClick={() => handleDownloadClick('pixeldrain')}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3498db]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span className="font-medium">Pixeldrain Mirror</span>
                  <ExternalLink className="w-4 h-4 ml-2 text-gray-500" />
                  <Badge variant="outline" className="ml-2 bg-[#3498db]/20 border-[#3498db]/40 text-[#3498db]">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    <span className="text-xs">Ready</span>
                  </Badge>
                </div>
              </Button>
            ) : (
              <Button 
                className="w-full bg-[#1a1725]/50 hover:bg-[#241e38]/50 border border-[#2a2440] py-6 text-white flex justify-center rounded-xl"
                onClick={generatePixeldrainMirror}
                disabled={isGeneratingAny}
              >
                <div className="flex items-center gap-2 justify-center">
                  {isGeneratingPixeldrain ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3498db]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  )}
                  <span>{isGeneratingPixeldrain ? 'Generating Pixeldrain mirror...' : 'Generate Pixeldrain Mirror'}</span>
                </div>
              </Button>
            )}
          </div>

          {/* Other file options */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button 
              variant="outline" 
<<<<<<< HEAD
              className="bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white"
              onClick={() => showToast('info', "QR Code feature - this is a demo", "qr-code-demo")}
=======
              className="bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white rounded-xl"
              onClick={() => toast.info("QR Code feature - this is a demo")}
>>>>>>> d66cd27c449b2174febf83f274cdf14afd488e9f
            >
              <QrCode className="w-4 h-4 mr-2" />
              Show QR
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white rounded-xl"
              onClick={handleCopyShareLink}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          {isVideoFile && (
            <Button 
              variant="outline" 
<<<<<<< HEAD
              className="w-full mt-4 bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white"
              onClick={() => showToast('info', "Watch Video feature - this is a demo", "watch-video-demo")}
=======
              className="w-full mt-4 bg-[#1a1725]/50 hover:bg-[#241e38]/50 border-[#2a2440] text-white hover:text-white rounded-xl"
              onClick={() => toast.info("Watch Video feature - this is a demo")}
>>>>>>> d66cd27c449b2174febf83f274cdf14afd488e9f
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
