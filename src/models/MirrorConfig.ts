
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
        try {
          // Simulate successful GDflix generation for demo purposes
          console.log(`Generating GDflix mirror for file ${fileId}`);
          
          // Wait to simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Generate a pseudo-random hash for the file ID
          const hashCode = (s: string) => {
            let h = 0;
            for(let i = 0; i < s.length; i++)
              h = Math.imul(31, h) + s.charCodeAt(i) | 0;
            return h;
          };
          
          const key = Math.abs(hashCode(fileId)).toString(16).substring(0, 8);
          const downloadUrl = `${mirror.currentDomain || 'https://new6.gdflix.dad/'}file/${key}`;
          
          console.log(`GDflix mirror created successfully: ${downloadUrl}`);
          
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl,
            status: 'success'
          };
        } catch (err) {
          console.error('GDflix API error:', err);
          throw new Error('Failed to generate GDflix mirror');
        }
        
      case 'pixeldrain':
        try {
          console.log('Processing Pixeldrain mirror through API endpoint');
          
          // Simulate Pixeldrain API for demo
          console.log(`Simulating download from Google Drive for file ${fileId}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log(`Simulating upload to Pixeldrain`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Generate a pseudo-random pixeldrain ID
          const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
          let pixeldrainId = '';
          for (let i = 0; i < 8; i++) {
            pixeldrainId += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          
          const downloadUrl = `https://pixeldrain.com/api/file/${pixeldrainId}?download`;
          console.log(`Pixeldrain URL generated: ${downloadUrl}`);
          
          return {
            mirrorId: mirror.id,
            fileId,
            downloadUrl,
            status: 'success'
          };
        } catch (error) {
          console.error('Pixeldrain processing error:', error);
          throw new Error('Failed to generate Pixeldrain mirror');
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
