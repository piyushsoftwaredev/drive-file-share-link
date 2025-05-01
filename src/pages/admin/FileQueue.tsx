
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import FileIcon from '@/components/FileIcon';

const FileQueue = () => {
  const { files, updateFileMirrors } = useFiles();
  const [activeTab, setActiveTab] = useState('all');
  
  // Sort files by creation date (newest first)
  const sortedFiles = [...files].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter files based on active tab
  const filteredFiles = sortedFiles.filter(file => {
    if (activeTab === 'all') return true;
    if (activeTab === 'processing') return file.isProcessing;
    if (activeTab === 'complete') {
      return !file.isProcessing && Object.values(file.mirrors).some(m => m.status === 'success');
    }
    if (activeTab === 'failed') {
      return Object.values(file.mirrors).some(m => m.status === 'failed');
    }
    return true;
  });
  
  const handleRegenerateMirrors = async (fileId: string) => {
    try {
      toast.info("Regenerating mirrors...");
      await updateFileMirrors(fileId);
      toast.success("Mirror regeneration started");
    } catch (error) {
      toast.error("Failed to regenerate mirrors");
      console.error(error);
    }
  };
  
  const getMirrorStatusIcon = (status: string) => {
    switch(status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const getTimeSince = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">File Queue</h1>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Processing Queue</CardTitle>
            <Badge 
              variant="outline" 
              className="bg-gray-800 text-gray-300 border-gray-700"
            >
              {files.filter(f => f.isProcessing).length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-oxxfile-purple data-[state=active]:text-white">
                All Files
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-oxxfile-purple data-[state=active]:text-white">
                Processing
              </TabsTrigger>
              <TabsTrigger value="complete" className="data-[state=active]:bg-oxxfile-purple data-[state=active]:text-white">
                Complete
              </TabsTrigger>
              <TabsTrigger value="failed" className="data-[state=active]:bg-oxxfile-purple data-[state=active]:text-white">
                Failed
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[450px] pr-4">
                {filteredFiles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="bg-gray-800/40 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="mt-1">
                              <FileIcon type={file.type} size="md" />
                            </div>
                            
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <h3 className="text-white font-medium">
                                  {file.name}
                                </h3>
                                <div>
                                  {file.isProcessing ? (
                                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-600">
                                      Processing
                                    </Badge>
                                  ) : Object.values(file.mirrors).some(m => m.status === 'failed') ? (
                                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-600">
                                      Failed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-600">
                                      Complete
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-400 mt-1">
                                {file.size} • {file.type} • Added {getTimeSince(file.createdAt)}
                              </div>
                              
                              <div className="mt-3 space-y-2">
                                <div className="text-sm text-gray-300 font-medium">Mirrors status:</div>
                                <div className="grid grid-cols-1 gap-2">
                                  {Object.entries(file.mirrors || {}).map(([mirrorId, mirror]) => (
                                    <div key={mirrorId} className="bg-gray-900/80 p-2 rounded-md border border-gray-800">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          {getMirrorStatusIcon(mirror.status)}
                                          <span className="text-white capitalize">
                                            {mirrorId} 
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                          {mirror.status === 'success' ? 'Ready' : mirror.status}
                                        </span>
                                      </div>
                                      {mirror.message && (
                                        <div className="mt-1 text-xs text-gray-400 italic">
                                          {mirror.message}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700 hover:text-white"
                              onClick={() => handleRegenerateMirrors(file.id)}
                              disabled={file.isProcessing}
                            >
                              <RefreshCw className="mr-2 h-3 w-3" />
                              Regenerate Mirrors
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-gray-800/50 p-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-gray-300 font-medium">No files found</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {activeTab === 'all' 
                        ? 'Share some files to see them here' 
                        : `No ${activeTab} files at the moment`}
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileQueue;
