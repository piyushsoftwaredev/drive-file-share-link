
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import FileIcon from '@/components/FileIcon';

const ShareFiles = () => {
  const [driveUrl, setDriveUrl] = useState('');
  const { addFile, isLoading } = useFiles();

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
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to add file. Please check the URL and try again.");
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
                onChange={(e) => setDriveUrl(e.target.value)}
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
            {driveUrl ? (
              <div className="text-center">
                <FileIcon type="MKV" size="lg" />
                <p className="mt-2 text-white text-sm">File preview will appear here</p>
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
                <Label className="text-white">Select Mirror</Label>
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 mt-1">
                  <option value="direct">Direct Link</option>
                  <option value="mirror1">Mirror 1</option>
                  <option value="mirror2">Mirror 2</option>
                </select>
              </div>
              
              <div>
                <Label className="text-white">Security Level</Label>
                <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 mt-1">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="encrypted">Encrypted</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShareFiles;
