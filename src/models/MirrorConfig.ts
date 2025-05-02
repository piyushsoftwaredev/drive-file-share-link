
// MirrorConfig.ts
// Last updated: 2025-05-02 10:21:05 UTC

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
        // Call our API endpoint for Pixeldrain processing
        try {
          console.log('Processing Pixeldrain mirror through API endpoint');
          
          // Get base URL for API calls (works in both development and production)
          const baseUrl = window.location.origin;
          
          // Build the endpoint URL
          const apiEndpoint = `${baseUrl}/api/pixeldrain`;
          console.log(`Calling Pixeldrain API endpoint: ${apiEndpoint}`);
          
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId,
              apiKey: mirror.apiKey,
              originalUrl
            })
          });
          
          // Check if the response is JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from Pixeldrain API");
          }
          
          const data = await response.json();
          console.log('Pixeldrain API response:', data);
          
          if (!response.ok) {
            throw new Error(data.message || 'Error processing Pixeldrain request');
          }
          
          if (data.success) {
            return {
              mirrorId: mirror.id,
              fileId,
              downloadUrl: data.downloadUrl,
              status: 'success'
            };
          } else {
            return {
              mirrorId: mirror.id,
              fileId,
              downloadUrl: '',
              status: 'failed',
              message: data.message || 'Pixeldrain processing failed'
            };
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
