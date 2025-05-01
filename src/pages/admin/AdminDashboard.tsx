
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFiles } from '@/contexts/FileContext';

const AdminDashboard = () => {
  const { files } = useFiles();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    avgFileSize: 0
  });

  useEffect(() => {
    // Calculate statistics
    const totalFiles = files.length;
    const totalSize = files.reduce((acc, file) => acc + file.sizeInBytes, 0);
    const avgFileSize = totalFiles > 0 ? totalSize / totalFiles : 0;

    setStats({
      totalFiles,
      totalSize,
      avgFileSize
    });
  }, [files]);

  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-oxxfile-purple">{stats.totalFiles}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-oxxfile-purple">{formatBytes(stats.totalSize)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Average File Size</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-oxxfile-purple">{formatBytes(stats.avgFileSize)}</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length > 0 ? (
            <div className="space-y-4">
              {files.slice(0, 5).map((file) => (
                <div key={file.id} className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-gray-400">{file.type} - {file.size}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No files shared yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
