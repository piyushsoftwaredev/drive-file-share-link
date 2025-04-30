
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
  originalUrl: string;
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

  // Function to extract file ID from Google Drive URL
  const extractGoogleDriveFileId = (url: string): string | null => {
    // Pattern for format: https://drive.google.com/file/d/{fileId}/view
    const filePattern = /\/file\/d\/([^\/]+)(?:\/|$)/;
    // Pattern for format: https://drive.google.com/open?id={fileId}
    const openPattern = /[?&]id=([^&]+)/;
    
    let match = url.match(filePattern);
    if (match && match[1]) {
      return match[1];
    }
    
    match = url.match(openPattern);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  };

  // Function to extract file name from Google Drive URL or ID
  const extractFileName = (url: string, fileId: string): string => {
    // Try to get filename from URL
    const urlParts = url.split('/');
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    
    // Check if filename is in the URL path
    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i].includes('.') && !urlParts[i].includes('google.com')) {
        return urlParts[i];
      }
    }
    
    // Check if filename is in query parameters
    if (queryParams.has('name')) {
      return queryParams.get('name') || `File_${fileId.substring(0, 8)}`;
    }
    
    // Default filename based on ID
    return `File_${fileId.substring(0, 8)}`;
  };

  // Function to guess file type from name
  const guessFileTypeFromName = (fileName: string): { type: string; mimeType: string } => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'mp4':
        return { type: 'MP4', mimeType: 'video/mp4' };
      case 'mkv':
        return { type: 'MKV', mimeType: 'video/x-matroska' };
      case 'avi':
        return { type: 'AVI', mimeType: 'video/x-msvideo' };
      case 'mov':
        return { type: 'MOV', mimeType: 'video/quicktime' };
      case 'pdf':
        return { type: 'PDF', mimeType: 'application/pdf' };
      case 'doc':
      case 'docx':
        return { type: 'DOC', mimeType: 'application/msword' };
      case 'xls':
      case 'xlsx':
        return { type: 'XLS', mimeType: 'application/vnd.ms-excel' };
      case 'ppt':
      case 'pptx':
        return { type: 'PPT', mimeType: 'application/vnd.ms-powerpoint' };
      case 'zip':
        return { type: 'ZIP', mimeType: 'application/zip' };
      case 'rar':
        return { type: 'RAR', mimeType: 'application/x-rar-compressed' };
      case 'jpg':
      case 'jpeg':
        return { type: 'JPG', mimeType: 'image/jpeg' };
      case 'png':
        return { type: 'PNG', mimeType: 'image/png' };
      case 'gif':
        return { type: 'GIF', mimeType: 'image/gif' };
      default:
        return { type: 'FILE', mimeType: 'application/octet-stream' };
    }
  };

  // Generate random file size for demo purposes
  const generateRandomFileSize = (): { size: string; sizeInBytes: number } => {
    const sizeMb = Math.floor(Math.random() * 5000) + 50;
    return {
      size: `${sizeMb} MB`,
      sizeInBytes: sizeMb * 1024 * 1024
    };
  };

  // Extract file info from Google Drive URL
  const extractFileInfo = async (driveUrl: string): Promise<FileMetadata> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call your backend API
      // For now, we'll extract what we can from the URL
      
      // Generate random ID for share link
      const randomId = Array.from(Array(16), () => 
        Math.floor(Math.random() * 36).toString(36)).join('');
      
      // Extract Google Drive file ID
      const fileId = extractGoogleDriveFileId(driveUrl) || randomId;
      
      // Extract or generate file name
      let fileName = extractFileName(driveUrl, fileId);
      
      // If no extension, assign one randomly for demo
      if (!fileName.includes('.')) {
        const extensions = ['.mkv', '.mp4', '.pdf', '.zip', '.rar'];
        fileName += extensions[Math.floor(Math.random() * extensions.length)];
      }
      
      // Get file type and MIME type
      const { type, mimeType } = guessFileTypeFromName(fileName);
      
      // Get file size
      const { size, sizeInBytes } = generateRandomFileSize();
      
      // Create the file metadata
      const newFile: FileMetadata = {
        id: randomId,
        name: fileName,
        size,
        sizeInBytes,
        type,
        mimeType,
        createdAt: new Date().toISOString(),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        shareLink: `/file/${randomId}`,
        sharedBy: "Admin",
        security: "End-to-end encrypted",
        accessibility: "Public",
        connection: "Fast",
        originalUrl: driveUrl
      };

      // Wait for simulated network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
