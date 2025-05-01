
import React, { useState } from 'react';
import { useFiles } from '@/contexts/FileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Link, Copy } from 'lucide-react';
import { toast } from 'sonner';
import FileIcon from '@/components/FileIcon';

const SharedFiles = () => {
  const { files } = useFiles();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = (fileId: string) => {
    const link = `${window.location.origin}/file/${fileId}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const handleRenameFile = (fileId: string) => {
    // This would be implemented with a modal or inline editing functionality
    toast.info("Rename functionality will be implemented soon");
  };

  const handleDeleteFile = (fileId: string) => {
    // This would be implemented with the actual delete functionality
    toast.info("Delete functionality will be implemented soon");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Shared Files</h1>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Your Files</CardTitle>
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs bg-gray-800 border-gray-700 text-white"
          />
        </CardHeader>
        <CardContent>
          {filteredFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-white">File</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Size</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map(file => (
                    <TableRow key={file.id} className="border-gray-800">
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center">
                          <FileIcon type={file.type} size="sm" />
                          <span className="ml-2">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">{file.type}</TableCell>
                      <TableCell className="text-gray-400">{file.size}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleCopyLink(file.id)}
                          >
                            <Copy className="h-4 w-4 text-oxxfile-purple" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRenameFile(file.id)}
                          >
                            <Edit className="h-4 w-4 text-oxxfile-purple" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No files found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedFiles;
