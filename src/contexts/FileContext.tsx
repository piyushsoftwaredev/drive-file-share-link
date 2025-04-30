
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
  const API_KEY = 'AIzaSyBx2A9I8DtQUeCNW2LVqWZSbpWivnNkomI';

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
    // Pattern for format: https://drive.google.com/uc?id={fileId}
    const ucPattern = /\/uc\?(?:.+&)?id=([^&]+)/;
    
    let match = url.match(filePattern);
    if (match && match[1]) {
      return match[1];
    }
    
    match = url.match(openPattern);
    if (match && match[1]) {
      return match[1];
    }
    
    match = url.match(ucPattern);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  };

  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to get file type from MIME type
  const getFileTypeFromMimeType = (mimeType: string): string => {
    const mimeTypeMap: Record<string, string> = {
      'video/mp4': 'MP4',
      'video/x-matroska': 'MKV',
      'video/x-msvideo': 'AVI',
      'video/quicktime': 'MOV',
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'application/zip': 'ZIP',
      'application/x-rar-compressed': 'RAR',
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
    };

    return mimeTypeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
  };

  // Function to fetch file details from Google Drive API
  const fetchFileDetails = async (fileId: string): Promise<any> => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,fileExtension&supportsAllDrives=true&includeItemsFromAllDrives=true&key=${API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error fetching file details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Google Drive API:', error);
      throw error;
    }
  };

  // Extract file info from Google Drive URL
  const extractFileInfo = async (driveUrl: string): Promise<FileMetadata> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Processing URL:", driveUrl);
      
      // Generate random ID for share link
      const randomId = Array.from(Array(16), () => 
        Math.floor(Math.random() * 36).toString(36)).join('');
      
      // Extract Google Drive file ID
      const fileId = extractGoogleDriveFileId(driveUrl);
      console.log("Extracted file ID:", fileId);
      
      if (!fileId) {
        throw new Error("Could not extract Google Drive file ID");
      }

      // Fetch file details from Google API
      const fileDetails = await fetchFileDetails(fileId);
      console.log("API returned file details:", fileDetails);
      
      // Process file details
      const fileName = fileDetails.name;
      const mimeType = fileDetails.mimeType;
      const fileType = getFileTypeFromMimeType(mimeType);
      const sizeInBytes = Number(fileDetails.size) || 0;
      const size = formatFileSize(sizeInBytes);
      
      // Create the file metadata
      const newFile: FileMetadata = {
        id: randomId,
        name: fileName,
        size,
        sizeInBytes,
        type: fileType,
        mimeType,
        createdAt: fileDetails.createdTime || new Date().toISOString(),
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
        shareLink: `/file/${randomId}`,
        sharedBy: "LDRIVE",
        security: "End-to-end encrypted",
        accessibility: "Public",
        connection: "Fast",
        originalUrl: driveUrl
      };

      console.log("Created file metadata:", newFile);
      
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
      console.error("Error extracting file info:", errorMessage);
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
