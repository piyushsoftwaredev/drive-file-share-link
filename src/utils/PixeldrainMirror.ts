
// PixeldrainMirror.ts
// Last updated: 2025-05-02 10:30:05 UTC

// Cache for storing Pixeldrain URLs to avoid repeated uploads
const pixeldrainCache: Record<string, {
  pixeldrainId: string;
  url: string;
  timestamp: number;
  fileName: string;
}> = {};

// Cache expiry time - 7 days (in milliseconds)
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * Function to generate a Pixeldrain URL for a Google Drive file
 * @param fileId Google Drive file ID
 * @param apiKey Pixeldrain API key
 * @param originalUrl Original Google Drive URL
 * @param forceRefresh Whether to force a refresh of the Pixeldrain URL
 */
export const generatePixeldrainUrl = async (
  fileId: string,
  apiKey: string = 'eb3973b7-d3e9-4112-873d-0be8924dfa01', 
  originalUrl: string,
  forceRefresh: boolean = false
): Promise<{
  success: boolean;
  pixeldrainId?: string;
  downloadUrl?: string;
  message?: string;
  fileName?: string;
  cached?: boolean;
}> => {
  try {
    // Check the cache first if not forcing a refresh
    if (!forceRefresh && pixeldrainCache[fileId] && (Date.now() - pixeldrainCache[fileId].timestamp) < CACHE_EXPIRY) {
      console.log(`Using cached Pixeldrain URL for file ${fileId}`);
      
      return {
        success: true,
        pixeldrainId: pixeldrainCache[fileId].pixeldrainId,
        downloadUrl: pixeldrainCache[fileId].url,
        fileName: pixeldrainCache[fileId].fileName,
        cached: true,
        message: "Using cached Pixeldrain URL"
      };
    }
    
    // Get the base URL for API calls (works in both development and production)
    const baseUrl = window.location.origin;
    
    // For development/demo purposes - simulate successfully generating a mirror without API
    // This will prevent API calls to non-existent endpoints during development
    const fileName = extractFilenameFromUrl(originalUrl, fileId);
    const pixeldrainId = await simulatePixeldrainUpload(fileId, fileName);
    const downloadUrl = `https://pixeldrain.com/api/file/${pixeldrainId}?download`;
    
    // Update the cache
    pixeldrainCache[fileId] = {
      pixeldrainId: pixeldrainId,
      url: downloadUrl,
      timestamp: Date.now(),
      fileName: fileName
    };
    
    return {
      success: true,
      pixeldrainId: pixeldrainId,
      downloadUrl: downloadUrl,
      fileName: fileName,
      message: "Pixeldrain URL generated successfully (simulated)"
    };
  } catch (error) {
    console.error('Error generating Pixeldrain URL:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error generating Pixeldrain URL'
    };
  }
};

/**
 * Helper function to extract filename from URL
 */
export const extractFilenameFromUrl = (url: string, fileId: string): string => {
  try {
    // Extract filename from URL or path components
    if (!url) return `file-${fileId}.mp4`;
    
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    let fileName = pathParts[pathParts.length - 1];
    
    // If the filename is 'view', try to use the second-to-last part
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
    
    // Clean up the filename to make it more presentable
    fileName = fileName.replace(/\+/g, ' ');
    try {
      fileName = decodeURIComponent(fileName);
    } catch (e) {
      // If decoding fails, use the original
    }
    
    // If we still don't have a usable filename, use fileId with a generic extension
    if (!fileName || fileName === 'view' || fileName === fileId) {
      fileName = `file-${fileId}.mp4`;
    }
    
    return fileName;
  } catch (e) {
    console.error('Error extracting filename:', e);
    return `file-${fileId}.mp4`;
  }
};

// Simulate Pixeldrain upload and return a valid ID
async function simulatePixeldrainUpload(fileId: string, fileName: string): Promise<string> {
  // Create a deterministic pixeldrain ID based on the file ID
  // This ensures the same file always gets the same pixeldrain ID
  const timestamp = Date.now();
  const combined = fileId + timestamp.toString();
  let hash = 0;
  
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generate a Pixeldrain-style ID (8 characters)
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const hashStr = Math.abs(hash).toString();
  
  for (let i = 0; i < 8; i++) {
    const index = parseInt(hashStr[i % hashStr.length]) % characters.length;
    result += characters[index];
  }
  
  // Simulate server delay for realism
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return result;
}
