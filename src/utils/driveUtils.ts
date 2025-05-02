/**
 * Utility functions for working with Google Drive URLs
 */

/**
 * Extracts the file ID from a Google Drive URL
 * 
 * Handles various URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?export=download&id=FILE_ID
 * 
 * @param url The Google Drive URL
 * @returns The file ID if found, null otherwise
 */
export const extractFileId = (url: string): string | null => {
    if (!url) return null;
    
    try {
      // Handle /file/d/ pattern
      const fileRegex = /\/file\/d\/([^\/\?&]+)/;
      const fileMatch = url.match(fileRegex);
      
      if (fileMatch && fileMatch[1]) {
        return fileMatch[1];
      }
      
      // Handle ?id= pattern
      const idRegex = /[?&]id=([^&]+)/;
      const idMatch = url.match(idRegex);
      
      if (idMatch && idMatch[1]) {
        return idMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting file ID:', error);
      return null;
    }
  };
  
  /**
   * Creates a direct download URL from a Google Drive file ID
   * 
   * @param fileId The Google Drive file ID
   * @returns A direct download URL
   */
  export const createDirectDownloadUrl = (fileId: string): string => {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  };
  
  /**
   * Creates a preview URL from a Google Drive file ID
   * 
   * @param fileId The Google Drive file ID
   * @returns A preview URL
   */
  export const createPreviewUrl = (fileId: string): string => {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };