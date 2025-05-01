
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import FileIcon from '@/components/FileIcon';

const ShareFiles = () => {
  const [driveUrl, setDriveUrl] = useState('');
  const [preview, setPreview] = useState<{name: string, type: string} | null>(null);
  const { addFile, isLoading } = useFiles();

  const handlePreviewUrl = () => {
    // Extract file name from URL if possible
    if (driveUrl) {
      // This is just a placeholder, we'd normally extract more information from the URL
      setPreview({
        name: "Preview file",
        type: "MKV"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) {
      toast.error("Please enter a Google Drive URL");
      return;
    }

    try {
      const newFile = await addFile(driveUrl);
      toast.success(`File "${newFile.name}" added successfully!`);
      setDriveUrl(''); // Clear the input
      setPreview(null); // Clear the preview
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to add file. Please check the URL and try again.");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDriveUrl(e.target.value);
    if (e.target.value) {
      handlePreviewUrl();
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Share Files</h1>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Share Google Drive File</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driveUrl" className="text-white">Google Drive URL</Label>
              <Input
                id="driveUrl"
                placeholder="https://drive.google.com/file/d/..."
                value={driveUrl}
                onChange={handleUrlChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <p className="text-xs text-gray-400">
                Paste the Google Drive URL of the file you want to share
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-oxxfile-purple hover:bg-oxxfile-purple/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Share Link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">File Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-10">
            {preview ? (
              <div className="text-center">
                <FileIcon type={preview.type} size="lg" />
                <p className="mt-2 text-white text-sm">{preview.name}</p>
              </div>
            ) : (
              <p className="text-gray-400">Enter a URL to preview the file</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Connection Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Mirrors</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-[#3498db]" />
                      <span className="text-white">Direct Link</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mr-2">
                        Active
                      </span>
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-[#9b87f5]" />
                      <span className="text-white">Pixel Download</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mr-2">
                        Active
                      </span>
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      <LinkIcon className="w-4 h-4 mr-2 text-[#f39c12]" />
                      <span className="text-white">GDFlix Download</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded mr-2">
                        Active
                      </span>
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-white">Security Level</Label>
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 mt-1">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="encrypted">Encrypted</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Control who can access your shared file
                </p>
              </div>
              
              <div>
                <Label className="text-white">Processing Priority</Label>
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 mt-1">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Set the priority for mirror generation process
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShareFiles;
