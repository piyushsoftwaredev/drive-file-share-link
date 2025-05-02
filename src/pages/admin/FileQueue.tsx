
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, AlertTriangle, CheckCircle, Clock, FileIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const FileQueue = () => {
  const { files, updateFileMirrors } = useFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [processingFiles, setProcessingFiles] = useState<{[key: string]: boolean}>({});

  // Function to handle refreshing mirrors for a specific file
  const handleRefreshMirrors = async (fileId: string, mirrorType?: 'gdflix' | 'pixeldrain') => {
    setProcessingFiles(prev => ({ ...prev, [fileId]: true }));
    
    try {
      if (mirrorType === 'gdflix') {
        await updateFileMirrors(fileId, { onlyGdflix: true });
        toast.success('GDflix mirror refresh started');
      } else if (mirrorType === 'pixeldrain') {
        await updateFileMirrors(fileId, { onlyPixeldrain: true });
        toast.success('Pixeldrain mirror refresh started');
      } else {
        await updateFileMirrors(fileId);
        toast.success('All mirrors refresh started');
      }
    } catch (error) {
      console.error('Error refreshing mirrors:', error);
      toast.error('Failed to refresh mirrors');
    } finally {
      setProcessingFiles(prev => ({ ...prev, [fileId]: false }));
    }
  };

  // Get status badge for mirror
  const getMirrorStatusBadge = (status: 'success' | 'processing' | 'failed' | undefined) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-400 border-green-500 hover:bg-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />Ready
        </Badge>;
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500 hover:bg-amber-500/20">
          <Clock className="w-3 h-3 mr-1 animate-pulse" />Processing
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500 hover:bg-red-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />Failed
        </Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-400 border-gray-500 hover:bg-gray-500/20">
          Pending
        </Badge>;
    }
  };

  // Filter files based on search query
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.googleDriveId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">File Queue</h1>
      
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <Input 
          className="bg-gray-800 border-gray-700 text-white"
          placeholder="Search files by name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {filteredFiles.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-white">No files in queue</h3>
            <p className="text-gray-400 mt-2">Files will appear here after you share them.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map(file => (
            <Card key={file.id} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white truncate">{file.name}</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                    onClick={() => handleRefreshMirrors(file.id)}
                    disabled={processingFiles[file.id] || file.isProcessing}
                  >
                    {(processingFiles[file.id] || file.isProcessing) ? 
                      <RefreshCw className="h-4 w-4 animate-spin" /> : 
                      <RefreshCw className="h-4 w-4" />}
                    <span className="ml-2">Refresh All</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="ml-2 text-white">{file.size}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-2 text-white">{file.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">ID:</span>
                    <span className="ml-2 text-white">{file.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Google Drive ID:</span>
                    <span className="ml-2 text-white">{file.googleDriveId}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-white font-medium mb-3">Mirrors Status</h4>
                  
                  <div className="space-y-3">
                    {/* GDflix Mirror */}
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#f39c12]/10 flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-[#f39c12]" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">GDflix Download</h5>
                          <div className="mt-1">
                            {getMirrorStatusBadge(file.mirrors?.gdflix?.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.mirrors?.gdflix?.status === 'failed' && (
                          <div className="max-w-xs overflow-hidden text-xs text-red-400">
                            {file.mirrors.gdflix.message}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                          onClick={() => handleRefreshMirrors(file.id, 'gdflix')}
                          disabled={processingFiles[file.id] || file.isProcessing}
                        >
                          <RefreshCw className={`h-4 w-4 ${(processingFiles[file.id] || file.isProcessing) ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pixeldrain Mirror */}
                    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-[#9b87f5]" />
                        </div>
                        <div>
                          <h5 className="text-white font-medium">Pixel Download</h5>
                          <div className="mt-1">
                            {getMirrorStatusBadge(file.mirrors?.pixeldrain?.status)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.mirrors?.pixeldrain?.status === 'failed' && (
                          <div className="max-w-xs overflow-hidden text-xs text-red-400">
                            {file.mirrors.pixeldrain.message}
                          </div>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                          onClick={() => handleRefreshMirrors(file.id, 'pixeldrain')}
                          disabled={processingFiles[file.id] || file.isProcessing}
                        >
                          <RefreshCw className={`h-4 w-4 ${(processingFiles[file.id] || file.isProcessing) ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Links section */}
                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-white font-medium mb-3">Share Links</h4>
                  <div className="flex items-center space-x-2">
                    <Input 
                      className="bg-gray-800 border-gray-700 text-white"
                      value={`${window.location.origin}/file/${file.id}`} 
                      readOnly 
                    />
                    <Button 
                      variant="outline" 
                      className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/file/${file.id}`);
                        toast.success('Share link copied to clipboard!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileQueue;
