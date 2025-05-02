
// MirrorConfig.ts
// Last updated: 2025-05-02 07:08:31 UTC
// Updated by: lovable.dev

export interface Mirror {
  id: string;
  name: string;
  baseUrl: string;
  isEnabled: boolean;
  regenerationPeriod: number; // in hours
  lastRegenerated?: string;
  apiKey?: string;
  isProcessing?: boolean;
  retryCount?: number;
  retryDelay?: number; // in seconds
  currentDomain?: string;
}

export interface MirrorConfig {
  mirrors: Mirror[];
  activeCount: number;
  maxParallelDownloads: number;
}

export const DEFAULT_MIRRORS: Mirror[] = [
  {
    id: 'direct',
    name: 'Direct Link',
    baseUrl: 'https://drive.google.com/uc?export=download&id=',
    isEnabled: true,
    regenerationPeriod: 24,
  },
  {
    id: 'pixeldrain',
    name: 'Pixel Download',
    baseUrl: 'https://pixeldrain.com/api/file/',
    isEnabled: true,
    regenerationPeriod: 48,
    apiKey: 'eb3973b7-d3e9-4112-873d-0be8924dfa01',
    retryCount: 3,
    retryDelay: 3,
  },
  {
    id: 'gdflix',
    name: 'GDFlix Download',
    baseUrl: 'https://new6.gdflix.dad/v2/share',
    currentDomain: 'https://new6.gdflix.dad/',
    apiKey: '54fbce203feecf6e90ba3d3750254c39',
    isEnabled: true,
    regenerationPeriod: 24,
    retryCount: 5,
    retryDelay: 5,
  }
];

export const DEFAULT_CONFIG: MirrorConfig = {
  mirrors: DEFAULT_MIRRORS,
  activeCount: 2,
  maxParallelDownloads: 3
};

export const getActiveMirrors = (config: MirrorConfig): Mirror[] => {
  return config.mirrors.filter(mirror => mirror.isEnabled);
};

export interface MirrorResponse {
  mirrorId: string;
  fileId: string;
  downloadUrl: string;
  status: 'success' | 'processing' | 'failed';
  message?: string;
}

// GDflix API Response interface
export interface GDflixResponse {
  id: number;
  md_user_email: string;
  key: string;
  status: number;
  file_creator: string;
  file: string;
  name: string;
  format: string;
  mime: string;
  size: number;
  md5: string;
  download: number;
  create_at: string;
  cron: number;
  tg_log: number;
  time: number;
  error: number;
  message: string;
}

// Pixeldrain API Response interface
export interface PixeldrainResponse {
  id: string;
  name: string;
  size: number;
  success: boolean;
  url?: string;
  message?: string;
}

// Helper function to encode string to base64
const btoa = (str: string): string => {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(str);
  }
  return Buffer.from(str).toString('base64');
};

// Function to extract filename from URL or use a default name
const getFilenameFromUrl = (url: string, fileId: string): string => {
  try {
    // Extract filename from the URL's path
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    
    // If the filename is 'view' (common in Google Drive URLs), try to use the second-to-last part
    if (fileName === 'view' && pathParts.length > 2) {
      fileName = pathParts[pathParts.length - 2];
    }
    
    // If still no good filename, check query parameters
    if (!fileName || fileName === 'view' || fileName === 'edit') {
      const queryParams = new URLSearchParams(urlObj.search);
      const nameFromQuery = queryParams.get('filename');
      if (nameFromQuery) {
        fileName = nameFromQuery;
      }
    }
    
    // If we still don't have a usable filename, use fileId with a generic extension
    if (!fileName || fileName === 'view' || fileName === fileId) {
      fileName = `file-${fileId}.mp4`;
    }
    
    console.log(`Extracted filename: ${fileName} from URL: ${url}`);
    return fileName;
  } catch (e) {
    console.error('Error extracting filename:', e);
    return `file-${fileId}.mp4`;
  }
};

// Function to generate mirror URL based on mirror type
export const regenerateMirrorUrl = async (mirror: Mirror, fileId: string, originalUrl: string): Promise<MirrorResponse> => {
  try {
    console.log(`Regenerating mirror URL for ${mirror.id} with file ID: ${fileId}`);
    console.log(`Mirror config:`, mirror);
    
    switch (mirror.id) {
      case 'direct':
        // Direct link is simply the Google Drive download URL
        return {
          mirrorId: mirror.id,
          fileId,
          downloadUrl: `${mirror.baseUrl}${fileId}`,
          status: 'success'
        };
        
      case 'gdflix':
        // Generate GDflix mirror using their API
        if (!mirror.apiKey || !mirror.currentDomain) {
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: 'Missing API key or domain for GDflix'
          };
        }
        
        // Implementation of GDflix API call with retry logic as per docs
        let retries = mirror.retryCount || 5;
        let gdflixResponse = null;
        
        while (retries > 0 && !gdflixResponse) {
          try {
            console.log(`GDflix API attempt ${mirror.retryCount! - retries + 1} for file ${fileId}`);
            const apiUrl = `${mirror.currentDomain}v2/share?id=${fileId}&key=${mirror.apiKey}`;
            console.log(`Calling GDflix API: ${apiUrl}`);
            
            const res = await fetch(apiUrl);
            const data = await res.json();
            console.log("GDflix API response:", data);
            
            // If we got a key, we're successful
            if (data && data.key) {
              const downloadUrl = `${mirror.currentDomain}file/${data.key}`;
              console.log(`GDflix mirror created successfully: ${downloadUrl}`);
              
              return {
                mirrorId: mirror.id,
                fileId,
                downloadUrl,
                status: 'success'
              };
            }
            
            // If there's an error, throw it
            if (data.error) {
              throw new Error(data.message || 'Unknown GDflix error');
            }
            
            gdflixResponse = data;
          } catch (err) {
            console.error(`GDflix API attempt failed, retries left: ${retries - 1}`, err);
            retries--;
            
            if (retries > 0) {
              // Wait for retry delay before next attempt
              const delay = (mirror.retryDelay || 5) * 1000;
              console.log(`Waiting ${delay}ms before retrying...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        // If we've exhausted retries
        if (!gdflixResponse) {
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: 'GDflix API failed after multiple attempts'
          };
        }
        
        return {
          mirrorId: mirror.id,
          fileId,
          downloadUrl: '',
          status: 'processing',
          message: 'GDflix file is being processed'
        };
        
      case 'pixeldrain':
        // Implementation for Pixeldrain API using our server API
        if (!mirror.apiKey) {
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: 'Missing API key for Pixeldrain'
          };
        }
      
        console.log(`Processing Pixeldrain mirror for file ID: ${fileId}`);
        
        try {
          // Call our server-side API endpoint that handles everything
          const apiUrl = 'http://localhost:3001/api/pixeldrain';
          console.log(`Calling Pixeldrain server API at: ${apiUrl}`);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileId,
              apiKey: mirror.apiKey
            })
          });
          
          console.log("API response status:", response.status);
          
          if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            try {
              const errorData = await response.json();
              console.error("Error data:", errorData);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch (e) {
              console.error("Could not parse error response:", e);
            }
            throw new Error(errorMessage);
          }
          
          const data = await response.json();
          console.log('Server API response:', data);
          
          if (data.success && data.downloadUrl) {
            return {
              mirrorId: mirror.id,
              fileId,
              downloadUrl: data.downloadUrl,
              status: 'success'
            };
          } else {
            throw new Error(data.message || 'Failed to process file');
          }
        } catch (error) {
          console.error('Pixeldrain processing error:', error);
          
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: error instanceof Error ? error.message : 'Failed to generate Pixeldrain mirror'
          };
        }
      
      default:
        return {
          mirrorId: mirror.id,
          fileId,
          downloadUrl: '',
          status: 'failed',
          message: `Unknown mirror type: ${mirror.id}`
        };
    }
  } catch (error) {
    console.error(`Error regenerating mirror URL for ${mirror.id}:`, error);
    return {
      mirrorId: mirror.id,
      fileId,
      downloadUrl: '',
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
