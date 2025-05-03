// FileContext.tsx
// Last updated: 2025-05-02 05:28:04
// Current User's Login: piyushsoftwaredev

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Mirror, 
  MirrorResponse, 
  regenerateMirrorUrl,
  DEFAULT_MIRRORS 
} from '@/models/MirrorConfig';
import { toast } from 'sonner';

interface MirrorStatus {
  [key: string]: MirrorResponse;
}

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
  googleDriveId: string;
  mirrors: MirrorStatus;
  isProcessing: boolean;
}

// Updated mirror options interface
interface MirrorOptions {
  onlyGdflix?: boolean;
  onlyPixeldrain?: boolean;
  timeoutSeconds?: number;
  forceRefresh?: boolean;
}

interface FileContextType {
  files: FileMetadata[];
  addFile: (driveUrl: string) => Promise<FileMetadata>;
  getFileById: (id: string) => FileMetadata | undefined;
  updateFileMirrors: (fileId: string, options?: MirrorOptions) => Promise<MirrorResponse | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
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
  
  // Toast tracking to prevent duplicates
  const activeToastsRef = useRef<Record<string, string>>({});

  // Show toast with duplicate prevention
  const showToast = (type: 'success' | 'error' | 'info', message: string, id: string) => {
    // If this toast ID is already active, don't show again
    if (activeToastsRef.current[id]) return;
    
    // Show the toast based on type
    let toastId;
    if (type === 'success') {
      toastId = toast.success(message);
    } else if (type === 'error') {
      toastId = toast.error(message);
    } else {
      toastId = toast.info(message);
    }
    
    // Store the ID and clean up after toast completes
    activeToastsRef.current[id] = String(toastId);
    setTimeout(() => {
      delete activeToastsRef.current[id];
    }, 5000);
  };

  useEffect(() => {
    // Load files from localStorage on initialization
    const storedFiles = localStorage.getItem('files');
    if (storedFiles) {
      try {
        setFiles(JSON.parse(storedFiles));
      } catch (e) {
        console.error('Error parsing stored files:', e);
      }
    }
  }, []);

  // Function to extract file ID from Google Drive URL
  const extractGoogleDriveFileId = (url: string): string | null => {
    console.log("Extracting ID from URL:", url);
    
    // Pattern for format: https://drive.google.com/file/d/{fileId}/view
    const filePattern = /\/file\/d\/([^\/]+)(?:\/|$)/;
    // Pattern for format: https://drive.google.com/open?id={fileId}
    const openPattern = /[?&]id=([^&]+)/;
    // Pattern for format: https://drive.google.com/uc?id={fileId}
    const ucPattern = /\/uc\?(?:.+&)?id=([^&]+)/;
    // Pattern for shared drive: https://drive.google.com/drive/folders/{folderId}/...
    const folderPattern = /\/drive\/folders\/([^\/]+)(?:\/|$)/;
    
    // Try each pattern in sequence
    let match = url.match(filePattern);
    if (match && match[1]) {
      console.log("Matched file pattern:", match[1]);
      return match[1];
    }
    
    match = url.match(openPattern);
    if (match && match[1]) {
      console.log("Matched open pattern:", match[1]);
      return match[1];
    }
    
    match = url.match(ucPattern);
    if (match && match[1]) {
      console.log("Matched uc pattern:", match[1]);
      return match[1];
    }
    
    match = url.match(folderPattern);
    if (match && match[1]) {
      console.log("Matched folder pattern:", match[1]);
      return match[1];
    }
    
    console.log("No pattern matched for URL");
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
      console.log("Fetching details for file:", fileId);
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,createdTime,fileExtension&supportsAllDrives=true&includeItemsFromAllDrives=true&key=${API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error?.message || 'Error fetching file details');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching from Google Drive API:', error);
      throw error;
    }
  };

  // Clear current error
  const clearError = () => {
    setError(null);
  };

  // Optimized mirror processing function
  const processMirrors = async (fileId: string, googleDriveId: string, originalUrl: string, options?: MirrorOptions): Promise<MirrorResponse | null> => {
    console.log(`Starting mirror processing for file: ${fileId}`, options);
    
    // Get active mirrors from configuration
    let activeMirrors = DEFAULT_MIRRORS.filter(m => m.isEnabled);
    
    // Filter for specific mirrors as requested
    if (options?.onlyGdflix) {
      activeMirrors = activeMirrors.filter(mirror => mirror.id === 'gdflix');
      if (activeMirrors.length === 0) {
        showToast('error', "GDflix mirror is not enabled", "gdflix-disabled");
        return null;
      }
    } else if (options?.onlyPixeldrain) {
      activeMirrors = activeMirrors.filter(mirror => mirror.id === 'pixeldrain');
      if (activeMirrors.length === 0) {
        showToast('error', "Pixeldrain mirror is not enabled", "pixeldrain-disabled");
        return null;
      }
    }
    
    // Update file to show it's processing
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId
          ? { ...file, isProcessing: true }
          : file
      )
    );
    
    // Save updated files to localStorage
    const updatedFiles = [...files];
    const fileIndex = updatedFiles.findIndex(f => f.id === fileId);
    if (fileIndex >= 0) {
      updatedFiles[fileIndex] = { ...updatedFiles[fileIndex], isProcessing: true };
      localStorage.setItem('files', JSON.stringify(updatedFiles));
    }
    
    // Set timeout for mirror generation if specified
    const timeoutDuration = (options?.timeoutSeconds || 120) * 1000; // Default 120 seconds
    
    // Process each mirror with timeout protection
    const processMirrorWithTimeout = async (mirror: Mirror): Promise<MirrorResponse> => {
      try {
        console.log(`Generating mirror for ${mirror.id} with ${timeoutDuration/1000}s timeout`);
        
        // Add forceRefresh parameter if specified
        const mirrorOptions = options?.forceRefresh ? { forceRefresh: true } : undefined;
        
        // Create a promise for the mirror generation
        const mirrorPromise = regenerateMirrorUrl(mirror, googleDriveId, originalUrl);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<MirrorResponse>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Timeout generating ${mirror.name} mirror after ${timeoutDuration/1000} seconds`));
          }, timeoutDuration);
        });
        
        // Race the mirror generation against the timeout
        const mirrorResponse = await Promise.race([mirrorPromise, timeoutPromise]);
        
        // Update file with mirror status
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => {
            if (file.id === fileId) {
              const updatedMirrors = {
                ...file.mirrors,
                [mirror.id]: mirrorResponse
              };
              
              // Check if any mirrors are still processing
              const isStillProcessing = Object.values(updatedMirrors)
                .some(m => m.status === 'processing');
              
              return { 
                ...file, 
                mirrors: updatedMirrors,
                isProcessing: isStillProcessing
              };
            }
            return file;
          });
          
          // Save to localStorage
          localStorage.setItem('files', JSON.stringify(updatedFiles));
          return updatedFiles;
        });
        
        return mirrorResponse;
      } catch (error) {
        console.error(`Error generating mirror for ${mirror.id}:`, error);
        
        // Create a failure response
        const failureResponse: MirrorResponse = {
          mirrorId: mirror.id,
          fileId: googleDriveId,
          downloadUrl: '',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
        
        // Update file with failure status
        setFiles(prevFiles => {
          const updatedFiles = prevFiles.map(file => {
            if (file.id === fileId) {
              const updatedMirrors = {
                ...file.mirrors,
                [mirror.id]: failureResponse
              };
              
              // Check if any mirrors are still processing
              const isStillProcessing = Object.values(updatedMirrors)
                .some(m => m.status === 'processing');
              
              return { 
                ...file, 
                mirrors: updatedMirrors,
                isProcessing: isStillProcessing
              };
            }
            return file;
          });
          
          // Save to localStorage
          localStorage.setItem('files', JSON.stringify(updatedFiles));
          return updatedFiles;
        });
        
        return failureResponse;
      }
    };
    
    try {
      // Process mirrors based on options and return result
      if (options?.onlyGdflix || options?.onlyPixeldrain) {
        // For single mirror generation, process sequentially
        const mirror = activeMirrors[0];
        const mirrorResult = await processMirrorWithTimeout(mirror);
        
        return mirrorResult;
      } else {
        // For all mirrors, process in parallel
        const results = await Promise.all(activeMirrors.map(processMirrorWithTimeout));
        return results[0]; // Return the first result
      }
    } finally {
      // Final update to ensure isProcessing is correctly set
      setFiles(prevFiles => {
        const updatedFiles = prevFiles.map(file => {
          if (file.id === fileId) {
            const isStillProcessing = Object.values(file.mirrors)
              .some(m => m.status === 'processing');
            
            return { 
              ...file, 
              isProcessing: isStillProcessing
            };
          }
          return file;
        });
        
        // Save to localStorage
        localStorage.setItem('files', JSON.stringify(updatedFiles));
        return updatedFiles;
      });
      
      console.log(`Completed mirror processing for file: ${fileId}`);
    }
  };

  // Updated to handle mirror options and return the result
  const updateFileMirrors = async (fileId: string, options?: MirrorOptions): Promise<MirrorResponse | null> => {
    const file = files.find(f => f.id === fileId);
    if (!file) {
      showToast('error', "File not found", "file-not-found");
      throw new Error('File not found');
    }
    
    // Skip if already processing unless force refresh or specific mirror is requested
    if (file.isProcessing && !options?.forceRefresh && !options?.onlyGdflix && !options?.onlyPixeldrain) {
      showToast('info', "File mirrors are already being processed", "mirrors-processing");
      return null;
    }
    
    try {
      // Call the mirror processing function and return the result
      return await processMirrors(fileId, file.googleDriveId, file.originalUrl, options);
    } catch (error) {
      console.error("Error updating file mirrors:", error);
      
      // Show error toast if it's a specific mirror generation
      if (options?.onlyGdflix) {
        showToast('error', "Failed to generate GDflix mirror", "gdflix-error");
      } else if (options?.onlyPixeldrain) {
        showToast('error', "Failed to generate Pixeldrain mirror", "pixeldrain-error");
      } else {
        showToast('error', "Failed to process mirrors", "mirrors-error");
      }
      
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
      const googleDriveId = extractGoogleDriveFileId(driveUrl);
      console.log("Extracted file ID:", googleDriveId);
      
      if (!googleDriveId) {
        throw new Error("Could not extract Google Drive file ID");
      }

      // Fetch file details from Google API with support for shared drives
      const fileDetails = await fetchFileDetails(googleDriveId);
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
        downloadUrl: `https://drive.google.com/uc?export=download&id=${googleDriveId}&supportsAllDrives=true&includeItemsFromAllDrives=true`,
        shareLink: `/file/${randomId}`,
        sharedBy: "LDRIVE",
        security: "End-to-end encrypted",
        accessibility: "Public",
        connection: "Fast",
        originalUrl: driveUrl,
        googleDriveId,
        mirrors: {},
        isProcessing: true
      };

      console.log("Created file metadata:", newFile);
      
      // Save to state and localStorage
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, newFile];
        localStorage.setItem('files', JSON.stringify(updatedFiles));
        return updatedFiles;
      });
      
      // Start mirror processing in the background
      processMirrors(randomId, googleDriveId, driveUrl);
      
      setIsLoading(false);
      return newFile;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("Error extracting file info:", errorMessage);
      setError(errorMessage);
      showToast('error', errorMessage, "extract-error");
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
        updateFileMirrors,
        isLoading,
        error,
        clearError
      }}
    >
      {children}
    </FileContext.Provider>
  );
};