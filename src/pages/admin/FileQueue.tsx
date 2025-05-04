
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, XCircle, Save } from 'lucide-react';
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

  const handleSaveQueueSettings = () => {
    toast.success("Queue settings saved successfully");
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">File Queue</h1>
        <Button
          onClick={handleSaveQueueSettings}
          className="bg-gradient-to-r from-[#4c2c8f] to-[#3d1e70] hover:from-[#5d37a8] hover:to-[#4c2c8f] text-white rounded-lg flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <Card className="bg-[#0a0812]/90 border-[#2a2440] shadow-lg">
        <CardHeader className="border-b border-[#2a2440]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Processing Queue</CardTitle>
            <Badge 
              variant="outline" 
              className="bg-[#1a1725] text-gray-300 border-[#2a2440]"
            >
              {files.filter(f => f.isProcessing).length} active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#14101d] border-[#2a2440] mb-4">
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
            
            <TabsContent value={activeTab}>
              <div className="bg-[#14101d]/50 p-4 rounded-lg border border-[#2a2440] mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium mb-1">Queue Options</h3>
                    <p className="text-gray-400 text-sm">Configure how files are processed in the queue</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="bg-[#1a1725] px-4 py-2 rounded-lg border border-[#2a2440]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-300">Auto Process</span>
                        <Badge variant="outline" className="bg-[#3d1e70]/30 text-[#9b87f5] border-[#4c2c8f]/50">
                          Enabled
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="bg-[#1a1725] px-4 py-2 rounded-lg border border-[#2a2440]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-300">Max Parallel</span>
                        <Badge variant="outline" className="bg-[#3d1e70]/30 text-[#9b87f5] border-[#4c2c8f]/50">
                          5
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
              <ScrollArea className="h-[450px] pr-4">
                {filteredFiles.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFiles.map((file) => (
                      <Card key={file.id} className="bg-[#14101d]/70 border-[#2a2440]">
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
                                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-600/50">
                                      <Loader2 className="w-3 h-3 text-yellow-300 animate-spin mr-1" />
                                      Processing
                                    </Badge>
                                  ) : Object.values(file.mirrors).some(m => m.status === 'failed') ? (
                                    <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-600/50">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Failed
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-600/50">
                                      <CheckCircle className="w-3 h-3 mr-1" />
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
                                    <div key={mirrorId} className="bg-[#0a0812]/90 p-2 rounded-md border border-[#2a2440]">
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
                              className="bg-[#1a1725]/80 border-[#2a2440] text-white hover:bg-[#281e4a] hover:text-white rounded-lg flex items-center gap-2"
                              onClick={() => handleRegenerateMirrors(file.id)}
                              disabled={file.isProcessing}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Regenerate Mirrors
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-[#1a1725]/50 p-3 mb-4">
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
