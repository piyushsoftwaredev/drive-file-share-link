
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
  },
  {
    id: 'gdflix',
    name: 'GDFlix Download',
    baseUrl: 'https://new6.gdflix.dad/file/',
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
        // Generate GDflix mirror
        if (!mirror.apiKey || !mirror.currentDomain) {
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: 'Missing API key or domain for GDflix'
          };
        }
        
        // Implementation of GDflix API call with retry logic
        let retries = mirror.retryCount || 5;
        let response = null;
        
        while (retries > 0 && !response) {
          try {
            const apiUrl = `${mirror.currentDomain}v2/share?id=${fileId}&key=${mirror.apiKey}`;
            console.log(`Attempting GDflix API call: ${apiUrl}`);
            
            const res = await fetch(apiUrl);
            const data: GDflixResponse = await res.json();
            
            if (data.key) {
              return {
                mirrorId: mirror.id,
                fileId,
                downloadUrl: `${mirror.currentDomain}file/${data.key}`,
                status: 'success'
              };
            }
            
            console.log("GDflix API response:", data);
            if (data.error) {
              throw new Error(data.message || 'Unknown GDflix error');
            }
            
            response = data;
          } catch (err) {
            console.error(`GDflix API attempt failed, retries left: ${retries}`, err);
            retries--;
            
            if (retries > 0) {
              // Wait for retry delay before next attempt
              await new Promise(resolve => setTimeout(resolve, (mirror.retryDelay || 5) * 1000));
            }
          }
        }
        
        // If we've exhausted retries
        if (!response) {
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
        // This would typically involve an API call to upload to pixeldrain
        // For now, we'll simulate the response
        try {
          // Example API endpoint - in production, this would be a proper file upload endpoint
          console.log(`Initiating Pixeldrain upload for file ID: ${fileId}`);
          
          // In a real implementation, you would stream the download from Google Drive
          // directly to Pixeldrain using their API, without storing on your server
          
          // Simulate an async process
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '', // Empty while processing
            status: 'processing',
            message: 'File is being processed on Pixeldrain'
          };
        } catch (error) {
          console.error('Pixeldrain upload failed:', error);
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl: '',
            status: 'failed',
            message: 'Failed to upload to Pixeldrain'
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
