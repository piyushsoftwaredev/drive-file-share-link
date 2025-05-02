
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
    
    // Build the endpoint URL
    const apiEndpoint = `${baseUrl}/api/pixeldrain`;
    console.log(`Calling Pixeldrain API endpoint: ${apiEndpoint}`);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        apiKey,
        originalUrl,
        forceRefresh
      })
    });
    
    // First, check if the response is OK before attempting to parse JSON
    if (!response.ok) {
      // Try to get the text of the response for better error reporting
      const errorText = await response.text();
      
      // If response contains HTML (starts with <!DOCTYPE or <html), it's not a valid API response
      if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
        throw new Error(`Server returned HTML instead of JSON. The API endpoint might be misconfigured or unavailable.`);
      }
      
      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `API error: ${response.status}`);
      } catch (e) {
        // If parsing fails, return the raw error text (truncated if too long)
        const truncatedText = errorText.length > 100 ? `${errorText.substring(0, 100)}...` : errorText;
        throw new Error(`API error (${response.status}): ${truncatedText}`);
      }
    }
    
    // Now try to get JSON response
    try {
      const data = await response.json();
      console.log('Pixeldrain API response:', data);
      
      if (data.success) {
        // Update the cache
        pixeldrainCache[fileId] = {
          pixeldrainId: data.pixeldrainId,
          url: data.downloadUrl,
          timestamp: Date.now(),
          fileName: data.fileName
        };
        
        return {
          success: true,
          pixeldrainId: data.pixeldrainId,
          downloadUrl: data.downloadUrl,
          fileName: data.fileName,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message || 'Pixeldrain processing failed'
        };
      }
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Received invalid JSON response from Pixeldrain API');
    }
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
