
import React, { createContext, useContext, useState, useEffect } from 'react';

interface FileMetadata {
  id: string;
  name: string;
  size: string;
  sizeInBytes: number;
  type: string;
  mimeType: string;
  createdAt: string;
  downloadUrl: string;
  shareLink: string;
  sharedBy: string;
  security: string;
  accessibility: string;
  connection: string;
}

interface FileContextType {
  files: FileMetadata[];
  addFile: (driveUrl: string) => Promise<FileMetadata>;
  getFileById: (id: string) => FileMetadata | undefined;
  isLoading: boolean;
  error: string | null;
}

const FileContext = createContext<FileContextType | null>(null);

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

export const FileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load files from localStorage on initialization
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    }
  }, []);

  // Mock function to extract file info from Google Drive URL
  const extractFileInfo = async (driveUrl: string): Promise<FileMetadata> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call your backend API
      // For now, we'll simulate a file with random data
      
      // Generate random ID for share link
      const randomId = Array.from(Array(16), () => 
        Math.floor(Math.random() * 36).toString(36)).join('');
      
      // Extract filename from URL or use placeholder
      let fileName = "Sample File";
      if (driveUrl.includes("drive.google.com")) {
        // Extract file ID
        const urlParts = driveUrl.split('/');
        const fileIdIndex = urlParts.findIndex(part => part === 'd' || part === 'file');
        if (fileIdIndex !== -1 && urlParts[fileIdIndex + 1]) {
          fileName = `File_${urlParts[fileIdIndex + 1].substring(0, 8)}`;
        }
      }

      // For demo, we'll use the sample data from the screenshot
      const fileExtension = ['.mkv', '.mp4', '.pdf', '.zip'][Math.floor(Math.random() * 4)];
      const fileSize = Math.floor(Math.random() * 2000) + 100;
      
      // Create the file metadata
      const newFile: FileMetadata = {
        id: randomId,
        name: `${fileName}${fileExtension}`,
        size: `${fileSize} MB`,
        sizeInBytes: fileSize * 1024 * 1024,
        type: fileExtension.substring(1).toUpperCase(),
        mimeType: getMimeType(fileExtension),
        createdAt: new Date().toISOString(),
        downloadUrl: driveUrl,
        shareLink: `/file/${randomId}`,
        sharedBy: "Admin",
        security: "End-to-end encrypted",
        accessibility: "Public",
        connection: "Fast"
      };

      // Wait for simulated network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to state and localStorage
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, newFile];
        localStorage.setItem('files', JSON.stringify(updatedFiles));
        return updatedFiles;
      });
      
      setIsLoading(false);
      return newFile;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getMimeType = (extension: string): string => {
    switch (extension.toLowerCase()) {
      case '.mkv':
        return 'video/x-matroska';
      case '.mp4':
        return 'video/mp4';
      case '.pdf':
        return 'application/pdf';
      case '.zip':
        return 'application/zip';
      default:
        return 'application/octet-stream';
    }
  };

  const getFileById = (id: string): FileMetadata | undefined => {
    return files.find(file => file.id === id);
  };

  return (
    <FileContext.Provider 
      value={{ 
        files, 
        addFile: extractFileInfo, 
        getFileById,
        isLoading,
        error
      }}
    >
      {children}
    </FileContext.Provider>
  );
};
