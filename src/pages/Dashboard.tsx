
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '@/contexts/FileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const [driveUrl, setDriveUrl] = useState('');
  const { addFile, files, isLoading } = useFiles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveUrl) {
      toast.error("Please enter a Google Drive URL");
      return;
    }

    try {
      const newFile = await addFile(driveUrl);
      toast.success("File added successfully!");
      setDriveUrl(''); // Clear the input
      navigate(`/file/${newFile.id}`); // Navigate to the new file
    } catch (error) {
      console.error("Error adding file:", error);
      toast.error("Failed to add file. Please try again.");
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Add New File</CardTitle>
              <CardDescription className="text-gray-400">
                Add a Google Drive file to generate a share link
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driveUrl" className="text-white">Google Drive URL</Label>
                  <Input
                    id="driveUrl"
                    placeholder="https://drive.google.com/file/d/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </CardContent>
              <CardFooter>
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
              </CardFooter>
            </form>
          </Card>

          <Card className="bg-gray-900/60 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Your Files</CardTitle>
              <CardDescription className="text-gray-400">
                Recently added files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No files added yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer"
                      onClick={() => navigate(`/file/${file.id}`)}
                    >
                      <div className="flex items-center">
                        <div className="flex-1 truncate">
                          <p className="text-white font-medium truncate">{file.name}</p>
                          <p className="text-sm text-gray-400">{file.size}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-oxxfile-purple"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`${window.location.origin}/file/${file.id}`);
                            toast.success("Link copied to clipboard!");
                          }}
                        >
                          Copy Link
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
