// server.js - Fixed to properly check existing files on Pixeldrain
// Last updated: 2025-05-02 05:10:25 UTC
// Current User's Login: piyushsoftwaredev

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const bodyParser = require('body-parser');
const axios = require('axios');
const { PassThrough, Transform } = require('stream');
const cheerio = require('cheerio');
const crypto = require('crypto');

const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Cache for Pixeldrain files
let pixeldrainFileCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 300000; // 5 minutes in milliseconds

// Service account path
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// Configure timeouts and retries
const CONFIG = {
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  RESPONSE_TIMEOUT: 120000, // 2 minutes
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  CHUNK_SIZE: 8 * 1024 * 1024, // 8MB chunks for streams
};

// Authorization with service account
const authorize = () => {
  try {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      throw new Error(`Service account file not found at ${SERVICE_ACCOUNT_PATH}`);
    }
    
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    return auth;
  } catch (error) {
    console.error('Error creating auth client:', error);
    throw error;
  }
};

// Retry function for API calls
const withRetry = async (fn, retries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) => {
  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Attempt ${attempt}/${retries} failed: ${error.message}`);
      lastError = error;
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        // Calculate exponential backoff
        const backoff = delay * Math.pow(1.5, attempt - 1);
        console.log(`Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }
  
  throw lastError;
};

// Get file info without downloading
const getFileInfo = async (fileId) => {
  return withRetry(async () => {
    try {
      const auth = await authorize();
      const drive = google.drive({ version: 'v3', auth });
      
      // Get file metadata
      const response = await drive.files.get({
        fileId,
        fields: 'name,size,mimeType,md5Checksum',
        supportsAllDrives: true
      });
      
      return {
        fileName: response.data.name,
        fileSize: Number(response.data.size) || 0,
        mimeType: response.data.mimeType,
        md5Checksum: response.data.md5Checksum || null
      };
    } catch (error) {
      console.error('Error getting file info:', error.message);
      
      // Try to get some basic info without authentication
      console.log('Falling back to public metadata...');
      const response = await axios({
        method: 'HEAD',
        url: `https://drive.google.com/uc?id=${fileId}&export=download`,
        timeout: CONFIG.CONNECTION_TIMEOUT,
        validateStatus: () => true
      });
      
      let fileName = `file-${fileId}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (match && match[1]) {
          fileName = match[1].replace(/['"]/g, '');
        }
      }
      
      return {
        fileName,
        fileSize: parseInt(response.headers['content-length'] || '0', 10),
        mimeType: response.headers['content-type'] || 'application/octet-stream'
      };
    }
  });
};

// Get a normalized key for comparing filenames
const getNormalizedFilename = (filename) => {
  if (!filename) return '';
  
  return filename
    .toLowerCase()
    .replace(/[\(\)\[\]]/g, '')                                 // Remove brackets
    .replace(/(720p|1080p|2160p|4k|hd|hq|hdts|webrip)/gi, '')  // Remove quality indicators
    .replace(/(x264|x265|avc|hevc|h264|h265)/gi, '')           // Remove codec info
    .replace(/\.(mkv|mp4|avi|mov)$/i, '')                      // Remove extension
    .replace(/[^a-z0-9]/gi, '')                                // Remove all non-alphanumeric chars
    .trim();
};

// Load Pixeldrain files (with caching)
const loadPixeldrainFiles = async (apiKey) => {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (pixeldrainFileCache && (now - lastCacheUpdate < CACHE_TTL)) {
    console.log('Using cached Pixeldrain file list');
    return pixeldrainFileCache;
  }
  
  console.log('Refreshing Pixeldrain file list cache...');
  
  try {
    // Create auth token for Pixeldrain API
    const authToken = Buffer.from(`api:${apiKey.trim()}`).toString('base64');
    
    // Get all files from Pixeldrain
    const response = await axios({
      method: 'GET',
      url: 'https://pixeldrain.com/api/user/files',
      headers: {
        'Authorization': `Basic ${authToken}`
      },
      timeout: CONFIG.CONNECTION_TIMEOUT
    });
    
    if (response.status === 200 && response.data.success) {
      const files = response.data.files || [];
      
      // Process files to add normalized names for easier matching
      const processedFiles = files.map(file => ({
        ...file,
        normalized_name: getNormalizedFilename(file.name)
      }));
      
      // Update cache
      pixeldrainFileCache = processedFiles;
      lastCacheUpdate = now;
      
      console.log(`Cached ${processedFiles.length} files from Pixeldrain`);
      return processedFiles;
    }
    
    console.log('Failed to get files from Pixeldrain API');
    return [];
  } catch (error) {
    console.error('Error loading Pixeldrain files:', error.message);
    return [];
  }
};

// Check if a file exists on Pixeldrain
const checkExistingFileOnPixeldrain = async (fileName, fileSize, apiKey) => {
  console.log(`Checking if file "${fileName}" exists on Pixeldrain...`);
  
  // Skip empty filenames
  if (!fileName || fileName.trim() === '') {
    return { exists: false };
  }
  
  try {
    // Load all files from Pixeldrain (using cache if available)
    const allFiles = await loadPixeldrainFiles(apiKey);
    
    if (allFiles.length === 0) {
      console.log('No files found in Pixeldrain account');
      return { exists: false };
    }
    
    console.log(`Checking against ${allFiles.length} files in your Pixeldrain account`);
    
    // Normalize the input filename
    const normalizedFileName = getNormalizedFilename(fileName);
    console.log(`Normalized filename for matching: "${normalizedFileName}"`);
    
    // Try exact matches first
    const exactMatches = allFiles.filter(file => 
      file.name.toLowerCase() === fileName.toLowerCase()
    );
    
    if (exactMatches.length > 0) {
      const exactMatch = exactMatches[0];
      console.log(`Found exact match: ${exactMatch.id} - ${exactMatch.name}`);
      
      return {
        exists: true,
        id: exactMatch.id,
        name: exactMatch.name,
        size: exactMatch.size,
        date_upload: exactMatch.date_upload,
        existing: true,
        match_type: 'exact'
      };
    }
    
    // Then try normalized name matches
    if (normalizedFileName) {
      const normalizedMatches = allFiles.filter(file => 
        file.normalized_name === normalizedFileName && 
        file.normalized_name !== ''
      );
      
      if (normalizedMatches.length > 0) {
        // If we have multiple normalized matches, prefer one with similar size
        let bestMatch = normalizedMatches[0];
        
        if (fileSize > 0) {
          const sizeMatches = normalizedMatches.filter(file => {
            const sizeDiff = Math.abs(file.size - fileSize) / fileSize;
            return sizeDiff < 0.1; // 10% tolerance
          });
          
          if (sizeMatches.length > 0) {
            bestMatch = sizeMatches[0];
          }
        }
        
        console.log(`Found normalized match: ${bestMatch.id} - ${bestMatch.name}`);
        
        return {
          exists: true,
          id: bestMatch.id,
          name: bestMatch.name,
          size: bestMatch.size,
          date_upload: bestMatch.date_upload,
          existing: true,
          match_type: 'normalized'
        };
      }
    }
    
    // Lastly, try partial name matches for movie/TV files
    if (fileName.length > 10) {  // Only for longer filenames
      const possibleMovieMatch = allFiles.find(file => {
        // Check if this is likely a movie file
        if (file.normalized_name.length < 5) return false;
        
        // For movies, just check if the core name is contained
        const isMovieFile = /\d{4}/.test(file.name); // Has a year like 2023
        
        if (isMovieFile) {
          // Extract likely movie name
          const movieName = file.normalized_name
            .replace(/\d{4}.*$/, ''); // Remove year and everything after
          
          // Check if the movie name is contained in our file or vice versa
          return normalizedFileName.includes(movieName) || 
                 movieName.includes(normalizedFileName);
        }
        
        return false;
      });
      
      if (possibleMovieMatch) {
        console.log(`Found possible movie match: ${possibleMovieMatch.id} - ${possibleMovieMatch.name}`);
        
        return {
          exists: true,
          id: possibleMovieMatch.id,
          name: possibleMovieMatch.name,
          size: possibleMovieMatch.size,
          date_upload: possibleMovieMatch.date_upload,
          existing: true,
          match_type: 'movie'
        };
      }
    }
    
    // No match found
    console.log('No matching file found on Pixeldrain');
    return { exists: false };
  } catch (error) {
    console.error('Error checking Pixeldrain:', error.message);
    return { exists: false, error: error.message };
  }
};

// Stream download from Google Drive
const streamFromGoogleDrive = async (fileId) => {
  return withRetry(async () => {
    try {
      // First try with service account
      const auth = await authorize();
      const drive = google.drive({ version: 'v3', auth });
      
      const response = await drive.files.get(
        {
          fileId,
          alt: 'media',
          supportsAllDrives: true,
        },
        {
          responseType: 'stream'
        }
      );
      
      // Create a pass-through stream to handle the data
      const passThrough = new PassThrough();
      response.data.pipe(passThrough);
      
      return passThrough;
    } catch (serviceError) {
      console.error('Error with service account download:', serviceError.message);
      console.log('Trying direct download method...');
      
      // Try direct method with cookie handling for large files
      const initialResponse = await axios.get(
        `https://drive.google.com/uc?id=${fileId}&export=download`,
        {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
          timeout: CONFIG.CONNECTION_TIMEOUT
        }
      );
      
      let downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
      let cookieHeader = '';
      
      // Handle virus scan warning page if present
      if (initialResponse.headers['content-type'].includes('text/html')) {
        console.log('Received HTML warning page, extracting download link...');
        
        // Get cookies from initial response
        const cookies = initialResponse.headers['set-cookie'] || [];
        cookieHeader = cookies.map(cookie => cookie.split(';')[0]).join('; ');
        
        // Parse HTML to get confirmation token
        const $ = cheerio.load(initialResponse.data);
        const form = $('#download-form');
        
        if (form.length) {
          const confirmValue = form.find('input[name="confirm"]').val() || 't';
          downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download&confirm=${confirmValue}`;
        }
      }
      
      // Create request for streaming
      const streamResponse = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
          'Cookie': cookieHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        },
        timeout: CONFIG.RESPONSE_TIMEOUT,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      
      // Verify we didn't get HTML
      const contentType = streamResponse.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        // Check the first chunk to see if it's HTML
        const firstChunkPromise = new Promise((resolve, reject) => {
          let firstChunk = '';
          const onData = chunk => {
            firstChunk += chunk.toString('utf8', 0, 100);
            streamResponse.data.removeListener('data', onData);
            
            if (firstChunk.includes('<!DOCTYPE html>') || firstChunk.includes('<html>')) {
              reject(new Error('Received HTML instead of file data'));
            } else {
              resolve();
            }
          };
          
          streamResponse.data.on('data', onData);
          
          // Set a timeout just in case
          setTimeout(() => resolve(), 1000);
        });
        
        await firstChunkPromise;
      }
      
      return streamResponse.data;
    }
  });
};

// Stream upload to Pixeldrain directly
const streamUploadToPixeldrain = async (fileStream, fileName, mimeType, apiKey) => {
  return new Promise((resolve, reject) => {
    console.log(`Streaming upload of "${fileName}" to Pixeldrain`);
    
    // Create form with streaming file
    const form = new FormData();
    form.append('file', fileStream, { 
      filename: fileName,
      contentType: mimeType 
    });
    
    // Create auth token
    const authToken = Buffer.from(`api:${apiKey.trim()}`).toString('base64');
    
    // Track upload progress
    let uploadedBytes = 0;
    
    // Create stream progress tracker
    const progressTracker = new Transform({
      transform(chunk, encoding, callback) {
        uploadedBytes += chunk.length;
        process.stdout.write(`\rUploading to Pixeldrain... ${Math.round(uploadedBytes / 1024 / 1024)}MB`);
        callback(null, chunk);
      }
    });
    
    // Setup request options
    const options = {
      method: 'POST',
      host: 'pixeldrain.com',
      path: '/api/file',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Basic ${authToken}`
      },
      timeout: CONFIG.RESPONSE_TIMEOUT
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\nPixeldrain upload complete!');
        console.log(`Response status: ${res.statusCode}`);
        
        try {
          const result = JSON.parse(data);
          
          // Status 200 or 201 are both successful
          if ((res.statusCode === 200 || res.statusCode === 201) && result.success && result.id) {
            // Clear the cache since we've added a new file
            pixeldrainFileCache = null;
            
            resolve({ 
              id: result.id, 
              success: true,
              name: fileName
            });
          } else {
            reject(new Error(`Pixeldrain API error: ${res.statusCode} - ${data}`));
          }
        } catch (error) {
          reject(new Error(`Error parsing Pixeldrain response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Pixeldrain upload request error:', error.message);
      reject(error);
    });
    
    // Set a timeout for the entire request
    req.setTimeout(600000, () => {  // 10 minutes
      req.destroy();
      reject(new Error('Pixeldrain upload timed out after 10 minutes'));
    });
    
    // Pipe the file stream through the progress tracker to the request
    fileStream
      .pipe(progressTracker)
      .pipe(form)
      .pipe(req);
  });
};

// Main API endpoint
app.post('/api/pixeldrain', async (req, res) => {
  // Extract parameters
  const { fileId, apiKey = 'eb3973b7-d3e9-4112-873d-0be8924dfa01', forceRefresh = false } = req.body;
  
  if (!fileId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing fileId parameter' 
    });
  }
  
  console.log(`Processing file ${fileId} for Pixeldrain upload`);
  console.log(`API Key: ${apiKey ? '*****' + apiKey.substr(-4) : 'none'}`);
  console.log(`Force refresh: ${forceRefresh}`);
  
  try {
    // Step 1: Get file info
    console.log('Step 1: Getting file metadata from Google Drive');
    const fileInfo = await getFileInfo(fileId);
    console.log(`File info: ${fileInfo.fileName} (${fileInfo.fileSize} bytes)`);
    
    // Step 2: Check if file exists in Pixeldrain
    if (!forceRefresh) {
      console.log('Step 2: Checking if file already exists on Pixeldrain');
      const pixeldrainCheck = await checkExistingFileOnPixeldrain(fileInfo.fileName, fileInfo.fileSize, apiKey);
      
      if (pixeldrainCheck.exists) {
        console.log(`File already exists in Pixeldrain with ID: ${pixeldrainCheck.id}`);
        console.log(`Match type: ${pixeldrainCheck.match_type}`);
        
        // Return the existing info
        const pixeldrainUrl = `https://pixeldrain.com/api/file/${pixeldrainCheck.id}?download`;
        
        return res.status(200).json({
          success: true,
          fileId: fileId,
          downloadUrl: pixeldrainUrl,
          pixeldrainId: pixeldrainCheck.id,
          fileName: pixeldrainCheck.name,
          size: pixeldrainCheck.size,
          message: `File ${pixeldrainCheck.match_type === 'exact' ? 'already exists' : 'found with similar name'} on Pixeldrain`,
          timestamp: new Date().toISOString(),
          existing: true,
          match_type: pixeldrainCheck.match_type || 'unknown'
        });
      }
    }
    
    // Step 3: Stream download and upload
    console.log('Step 3: Setting up streaming download from Google Drive');
    const downloadStream = await streamFromGoogleDrive(fileId);
    
    console.log('Step 4: Starting streaming upload to Pixeldrain');
    const uploadResult = await streamUploadToPixeldrain(
      downloadStream,
      fileInfo.fileName,
      fileInfo.mimeType,
      apiKey
    );
    
    // Generate download URL
    const pixeldrainUrl = `https://pixeldrain.com/api/file/${uploadResult.id}?download`;
    
    console.log(`Success! Pixeldrain URL: ${pixeldrainUrl}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      fileId: fileId,
      downloadUrl: pixeldrainUrl,
      pixeldrainId: uploadResult.id,
      fileName: fileInfo.fileName,
      size: fileInfo.fileSize,
      message: "File successfully streamed to Pixeldrain",
      timestamp: new Date().toISOString(),
      existing: false
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Unknown error occurred',
      fileId: fileId,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint to clear Pixeldrain cache
app.post('/api/pixeldrain/clear-cache', (req, res) => {
  pixeldrainFileCache = null;
  lastCacheUpdate = 0;
  console.log('Pixeldrain file cache cleared');
  return res.status(200).json({ 
    success: true, 
    message: 'Cache cleared',
    timestamp: new Date().toISOString()
  });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    serviceAccount: fs.existsSync(SERVICE_ACCOUNT_PATH) ? 'Present' : 'Missing',
    cache: {
      pixeldrain_files: pixeldrainFileCache ? pixeldrainFileCache.length : 0,
      last_update: lastCacheUpdate ? new Date(lastCacheUpdate).toISOString() : 'never'
    },
    version: '2.2.0 (Perfect File Matching)'
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Pixeldrain endpoint: http://localhost:${PORT}/api/pixeldrain`);
  console.log(`Service account path: ${SERVICE_ACCOUNT_PATH}`);
});