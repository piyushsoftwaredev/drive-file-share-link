// server.js
// Last updated: 2025-05-01 08:00:57 UTC
// Current User's Login: piyushsoftwaredev

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.json());

// Service account credentials
const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "saf-p9qydxzlrny10cegknl-6baie2",
  "private_key_id": "eef828349dfc4723b86862acc725157ddc26bf51",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDdiIC14uv299aV\npsXYGCuu530i5F6uKhTYN0zkegc71d6qD2Sm4fDtvKujceaplr6uL9NXfBnEAh8b\n+fku00eDDyjpAvf7ZMR+xMSA3uBTgjtS3KL2sU3LRb4T/SdAW8oir3zp4+WSo+O4\nk1OoLP85B0/7uYn63HRY6LtGraEPU3uRBmEOtCQwHLTV3on8+5dVvpoJo/yEy2Y8\nl8872bFUPSxQubtn1zv9zxM9+1PRgFvTOG6cx9cP1wt2LxyLwmWbJA1gfUW1sNBO\nzpSJ4lamS/C1e2C85zg5+Ub2hF7gUvEkjX3BXrIAhPSuHW/K+uc1uuVjt11U0SvI\nzh2IQ6m3AgMBAAECggEAHutdY4V/f6HJvmtfc7Cz8B55FbSgDljrPd5CCiWJ+uz3\nve6WEsC4OsY5gn90PTk/9dnQ+oXkprnRE7uI7uMoOP+Vqyfx6pF+516ZOo9g6ebk\nVsVarWnDvNpIFEwh/VaSWNL7cT2Qni3nq6xMYc2d9ZyyqiSUQIIibwJUmSHEt/mh\nTO4ybIifJPAf5VhJ2d5hC9LYDAF31trH3lxWFnRXJxCqmkvlmIHRW7sBDiEWvD5X\noSQI5nTVQhV9BwNut/wLa4bCmeguyw6aWHEcCenAvod0lTPL7Vn05ZtLBXCRmddz\nadiOApOEdizD2u7bjEcAl39qq3mqzYUyNb6uHw1M+QKBgQD9F37pfqMRR+1W0l6P\naao7i2vO75C4m5QvTXpjXr6FSG6gE3x3v4V3qBxn8MAvLtVCHoaxtj97lDcLMFFO\nE0aFBIlvsSVRGC5PLFeoVC0vdGbJq+ZOvJEeChWrmRefZlXMrFni8XWXKZ5+11r0\nWgWvm80gTCJOaqAdGr6lDw4aZQKBgQDgFCxUlg4BF2RhPz9oFd9I3X9vz7n9dTgI\nse3NZ8V1OLtGGqIMtQOaJHxvi4baQ4mME5SobZQ0OBIaLNU4z48fCj4WGH97ZT6D\nEIMORQzuURhsEFEOuP/6djAbTW1yTdLKXrvoMYP8UFvdw6cDXzLSKUeTlehXOpI8\nowIuLLVD6wKBgGNkO8HkqpNZxNooyVvWqjSyHwdoS1REPOCKs7qcdYOQG2mf3WyF\neRuxmF41TLP612Mc69aUdL/KSAeL1RItPa91RafoUHhVX7JV/qKrVAdj1g3zBQH8\nyZybZ0E5YO6HWMCFGtOl8YEIpia32g9F3x/EtrytSXe0JeboHuBhVi+FAoGAeyA6\nl6P4P/tFifYB9kSGc3haLOscjLvbNVPnkkViB55LsSKzRn40Y3+G7JfjWo1fyBt+\nROopVGQ29jEKXHQYdXrgUK3XZstkBQqOqMmiaFUhMUfp8kgPR+WnW2k5KWS/3bke\nUWDb4EmboQh//edSeo56KQtnJn8lmbIMYajpVU8CgYAlxMd+9ohfI7l+oGLrArUJ\nbOEq7Q/lZo/as56K6K9Um+lUCYToKi/+VmFiddObyqO/0M3skWPzA4MbDXtUbxVn\n1L3rf6Xx9H3NXzf0/XWoszdFxmDW2fN7vR2Vq/exLTqZwmmubAhKYQ1+UpjSFvhZ\nbRyPaLAc3+iLCmmmSr74Ug==\n-----END PRIVATE KEY-----\n",
  "client_email": "mfc-h2xv0za4krpe03w4beugv5lp37@saf-p9qydxzlrny10cegknl-6baie2.iam.gserviceaccount.com",
  "client_id": "112831622260331361941",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mfc-h2xv0za4krpe03w4beugv5lp37%40saf-p9qydxzlrny10cegknl-6baie2.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Create the service account file if it doesn't exist
const serviceAccountFile = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountFile)) {
  console.log('Creating service account file...');
  fs.writeFileSync(serviceAccountFile, JSON.stringify(SERVICE_ACCOUNT, null, 2));
  console.log(`Service account file created at: ${serviceAccountFile}`);
}

// Authorization with service account
const authorize = () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountFile,
      scopes: ['https://www.googleapis.com/auth/drive']
    });
    return auth;
  } catch (error) {
    console.error('Error creating auth client:', error);
    throw error;
  }
};

// Function to check if a file exists in Pixeldrain by name
const checkPixeldrainByFilename = async (fileName, apiKey) => {
  try {
    console.log(`Checking if file "${fileName}" exists on Pixeldrain...`);
    
    const searchUrl = `https://pixeldrain.com/api/user/files?filter=${encodeURIComponent(fileName)}`;
    
    // Create auth token for Pixeldrain API
    const authToken = Buffer.from(`api:${apiKey}`).toString('base64');
    
    const response = await axios({
      method: 'GET',
      url: searchUrl,
      headers: {
        'Authorization': `Basic ${authToken}`
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (response.status === 200 && response.data.success) {
      const files = response.data.files || [];
      console.log(`Found ${files.length} files with similar name on Pixeldrain`);
      
      // Look for exact match or very close match
      const exactMatch = files.find(f => f.name === fileName);
      if (exactMatch) {
        console.log(`Found exact match: ${exactMatch.id} - ${exactMatch.name}`);
        return {
          exists: true,
          id: exactMatch.id,
          name: exactMatch.name,
          size: exactMatch.size,
          date_upload: exactMatch.date_upload,
          existing: true
        };
      } else if (files.length > 0) {
        // Use the most recent file with a similar name
        const mostRecent = files.sort((a, b) => 
          new Date(b.date_upload) - new Date(a.date_upload)
        )[0];
        
        console.log(`No exact match, using most recent similar file: ${mostRecent.id} - ${mostRecent.name}`);
        return {
          exists: true,
          id: mostRecent.id,
          name: mostRecent.name,
          size: mostRecent.size,
          date_upload: mostRecent.date_upload,
          existing: true
        };
      }
    }
    
    console.log('No matching file found on Pixeldrain');
    return { exists: false };
  } catch (error) {
    console.error('Error checking Pixeldrain:', error.message);
    
    // If we get a 401 Unauthorized, the API key is likely invalid
    if (error.response && error.response.status === 401) {
      console.error('Pixeldrain API key is invalid or expired');
    }
    
    return { exists: false, error: error.message };
  }
};

// Function to check if a file ID is from a Shared Drive
const checkIfSharedDriveFile = async (drive, fileId) => {
  try {
    // First try to get the file with supportsAllDrives
    const response = await drive.files.get({
      fileId,
      fields: 'driveId,parents',
      supportsAllDrives: true
    });
    
    // If driveId is present, it's a shared drive file
    if (response.data.driveId) {
      return {
        isSharedDrive: true,
        driveId: response.data.driveId
      };
    }
    
    return { isSharedDrive: false };
  } catch (error) {
    console.log('Error checking if file is from shared drive:', error.message);
    // If there's an error, assume it's not a shared drive file
    return { isSharedDrive: false };
  }
};

// Function to get file name from Google Drive (without downloading)
const getFileInfo = async (fileId) => {
  try {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });
    
    // Check if it's a shared drive file
    const sharedDriveInfo = await checkIfSharedDriveFile(drive, fileId);
    
    // Get file metadata with proper shared drive support
    const response = await drive.files.get({
      fileId,
      fields: 'name,size,mimeType,md5Checksum',
      supportsAllDrives: true, // Add support for shared drives
      ...(sharedDriveInfo.isSharedDrive && { driveId: sharedDriveInfo.driveId })
    });
    
    return {
      fileName: response.data.name,
      fileSize: Number(response.data.size) || 0,
      mimeType: response.data.mimeType,
      md5Checksum: response.data.md5Checksum,
      isSharedDrive: sharedDriveInfo.isSharedDrive,
      driveId: sharedDriveInfo.driveId
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
};

// Download public file from Google Drive using direct download URL
const downloadPublicFile = async (fileId) => {
  try {
    // First, try to get file info to get the name
    let fileName, fileSize, mimeType;
    
    try {
      const fileInfo = await getFileInfo(fileId);
      fileName = fileInfo.fileName;
      fileSize = fileInfo.fileSize;
      mimeType = fileInfo.mimeType;
    } catch (error) {
      console.log('Could not get file info, using default values:', error.message);
      fileName = `file-${fileId}.mp4`;
      fileSize = 0;
      mimeType = 'application/octet-stream';
    }
    
    console.log(`Downloading public file: ${fileName}`);
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), fileName);
    
    // URL with the "confirm" parameter to bypass the virus scan warning
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    
    console.log(`Using public download URL: ${directDownloadUrl}`);
    console.log(`Downloading to: ${tempFilePath}`);
    
    // Download the file using axios
    const writer = fs.createWriteStream(tempFilePath);
    
    const response = await axios({
      method: 'get',
      url: directDownloadUrl,
      responseType: 'stream',
      timeout: 120000, // 2 minute timeout for larger files
      maxContentLength: Infinity, // Allow large files
      maxBodyLength: Infinity
    });
    
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      
      writer.on('close', () => {
        if (!error) {
          console.log('Public file download complete!');
          resolve({
            filePath: tempFilePath,
            fileName,
            size: fileSize,
            mimeType
          });
        }
        // No need to call reject here as it would have been called in the 'error' event
      });
    });
  } catch (error) {
    console.error('Error downloading public file:', error);
    throw error;
  }
};

// Function to download file from shared drive using service account
const downloadWithServiceAccount = async (fileId) => {
  console.log('Attempting to download with service account...');
  const auth = await authorize();
  const drive = google.drive({ version: 'v3', auth });
  
  // Check if it's a shared drive file
  const sharedDriveInfo = await checkIfSharedDriveFile(drive, fileId);
  
  // Get file metadata
  const fileMetadata = await drive.files.get({
    fileId,
    fields: 'name,size,mimeType,md5Checksum',
    supportsAllDrives: true,
    ...(sharedDriveInfo.isSharedDrive && { driveId: sharedDriveInfo.driveId })
  });
  
  const fileName = fileMetadata.data.name || `file-${fileId}.mp4`;
  const fileSize = Number(fileMetadata.data.size) || 0;
  const mimeType = fileMetadata.data.mimeType || 'application/octet-stream';
  const md5Checksum = fileMetadata.data.md5Checksum || '';
  
  console.log(`File info: ${fileName} (${fileSize} bytes) - ${mimeType}`);
  console.log(`MD5: ${md5Checksum}`);
  console.log(`Is Shared Drive: ${sharedDriveInfo.isSharedDrive}, Drive ID: ${sharedDriveInfo.driveId || 'N/A'}`);
  
  // Create a temporary file path
  const tempFilePath = path.join(os.tmpdir(), fileName);
  
  console.log(`Downloading to temp path: ${tempFilePath}`);
  
  // Download the file with shared drive support
  const response = await drive.files.get(
    { 
      fileId, 
      alt: 'media',
      supportsAllDrives: true,
      ...(sharedDriveInfo.isSharedDrive && { driveId: sharedDriveInfo.driveId })
    },
    { 
      responseType: 'stream',
      // Increase timeouts for large files
      timeout: 300000 // 5 minutes
    }
  );
  
  await new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(tempFilePath);
    let progress = 0;
    
    response.data
      .on('data', (chunk) => {
        progress += chunk.length;
        if (fileSize > 0) {
          const percent = Math.round((progress / fileSize) * 100);
          process.stdout.write(`\rDownloading... ${percent}% complete`);
        }
      })
      .on('error', (err) => {
        dest.close();
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        reject(err);
      })
      .on('end', () => {
        dest.close();
        console.log('\nDownload complete!');
        resolve();
      })
      .pipe(dest);
  });
  
  return { 
    filePath: tempFilePath, 
    fileName, 
    size: fileSize,
    mimeType,
    md5Checksum,
    isSharedDrive: sharedDriveInfo.isSharedDrive,
    driveId: sharedDriveInfo.driveId
  };
};

// Upload file to Pixeldrain
const uploadToPixeldrain = async (filePath, fileName, mimeType, apiKey) => {
  console.log(`Uploading ${filePath} to Pixeldrain as ${fileName}`);
  console.log(`Using Pixeldrain API key: ${apiKey ? '****' + apiKey.substr(-4) : 'none'}`);
  
  // Verify we have a valid API key
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Missing or invalid Pixeldrain API key');
  }
  
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), { 
    filename: fileName,
    contentType: mimeType 
  });
  
  // Create proper basic auth token
  // Format should be "api:KEY" encoded as Base64
  const authToken = Buffer.from(`api:${apiKey.trim()}`).toString('base64');
  
  console.log('Preparing Pixeldrain upload with authentication');
  
  return new Promise((resolve, reject) => {
    // Create request options with proper authentication
    const requestOptions = {
      method: 'POST',
      host: 'pixeldrain.com',
      path: '/api/file',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Basic ${authToken}`
      },
      timeout: 300000 // 5 minutes
    };
    
    console.log(`Sending request to ${requestOptions.host}${requestOptions.path}`);
    
    const request = https.request(
      requestOptions,
      response => {
        let data = '';
        
        response.on('data', chunk => {
          data += chunk;
        });
        
        response.on('end', () => {
          try {
            console.log(`Pixeldrain API response status: ${response.statusCode}`);
            console.log(`Pixeldrain API response data: ${data}`);
            
            // Parse the response JSON
            const result = JSON.parse(data);
            
            // Check for both 200 OK and 201 Created as valid success responses
            if (response.statusCode === 200 || response.statusCode === 201) {
              if (result.success && result.id) {
                console.log(`Pixeldrain upload successful, file ID: ${result.id}`);
                resolve({ 
                  id: result.id, 
                  success: true,
                  name: fileName
                });
              } else {
                console.error('Malformed success response:', result);
                reject(new Error(`Pixeldrain upload returned unexpected response format: ${JSON.stringify(result)}`));
              }
            } else {
              // Handle real error responses
              console.error(`Error response: ${data}`);
              reject(
                new Error(
                  `Pixeldrain API error: ${response.statusCode} - ${data}`
                )
              );
            }
          } catch (error) {
            console.error('Error parsing response:', error);
            reject(error);
          }
        });
      }
    );
    
    request.on('error', err => {
      console.error('Request error:', err);
      reject(err);
    });
    
    // Track upload progress
    let uploadedBytes = 0;
    const fileSize = fs.statSync(filePath).size;
    
    form.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      const percentage = Math.round((uploadedBytes / fileSize) * 100);
      process.stdout.write(`\rUploading to Pixeldrain... ${percentage}%`);
    });
    
    form.pipe(request);
  });
};

// Process Google Drive files and upload to Pixeldrain
app.post('/api/pixeldrain', async (req, res) => {
  // Extract parameters
  const { fileId, apiKey = 'eb3973b7-d3e9-4112-873d-0be8924dfa01', driveId, forceRefresh = false } = req.body;
  
  if (!fileId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing fileId parameter' 
    });
  }
  
  console.log(`Processing file ${fileId} for Pixeldrain upload`);
  console.log(`Using API key: ${apiKey}`);
  console.log(`Force refresh: ${forceRefresh}`);
  
  if (driveId) {
    console.log(`Drive ID provided: ${driveId}`);
  }
  
  let tempFilePath = '';
  
  try {
    // Step 1: Get file info
    console.log('Step 1: Getting file information from Google Drive');
    const fileInfo = await getFileInfo(fileId);
    const fileName = fileInfo.fileName;
    const fileSize = fileInfo.fileSize;
    
    // Step 2: Check if file exists in Pixeldrain
    if (!forceRefresh) {
      console.log('Step 2: Checking if file already exists in Pixeldrain');
      const pixeldrainCheck = await checkPixeldrainByFilename(fileName, apiKey);
      
      if (pixeldrainCheck.exists) {
        console.log(`File already exists in Pixeldrain with ID: ${pixeldrainCheck.id}`);
        
        // Return the existing Pixeldrain file information
        const pixeldrainUrl = `https://pixeldrain.com/api/file/${pixeldrainCheck.id}?download`;
        
        return res.status(200).json({
          success: true,
          fileId: fileId,
          downloadUrl: pixeldrainUrl,
          pixeldrainId: pixeldrainCheck.id,
          fileName: pixeldrainCheck.name,
          size: pixeldrainCheck.size,
          message: "File already exists in Pixeldrain, no re-upload needed",
          timestamp: new Date().toISOString(),
          isSharedDrive: fileInfo.isSharedDrive || false,
          driveId: fileInfo.driveId || null,
          existing: true
        });
      }
      
      console.log('File does not exist in Pixeldrain, proceeding with download and upload');
    } else {
      console.log('Force refresh requested, skipping Pixeldrain check');
    }
    
    // Step 3: Download the file from Google Drive
    console.log('Step 3: Downloading from Google Drive');
    
    let downloadResult;
    try {
      // First try using the service account with shared drive support
      downloadResult = await downloadWithServiceAccount(fileId);
    } catch (serviceAccountError) {
      console.error('Service account download failed:', serviceAccountError.message);
      console.log('Trying public download approach...');
      
      // Fall back to public download method
      downloadResult = await downloadPublicFile(fileId);
    }
    
    tempFilePath = downloadResult.filePath;
    
    // Step 4: Upload to Pixeldrain
    console.log('Step 4: Uploading to Pixeldrain');
    console.log(`File details: ${downloadResult.fileName} (${downloadResult.size} bytes)`);
    
    const uploadResult = await uploadToPixeldrain(
      tempFilePath, 
      downloadResult.fileName,
      downloadResult.mimeType,
      apiKey
    );
    
    // Step 5: Generate Pixeldrain URL
    const pixeldrainUrl = `https://pixeldrain.com/api/file/${uploadResult.id}?download`;
    
    console.log(`Success! Pixeldrain URL: ${pixeldrainUrl}`);
    
    // Return success response
    return res.status(200).json({
      success: true,
      fileId: fileId,
      downloadUrl: pixeldrainUrl,
      pixeldrainId: uploadResult.id,
      fileName: downloadResult.fileName,
      size: downloadResult.size,
      message: "File successfully processed and uploaded to Pixeldrain",
      timestamp: new Date().toISOString(),
      isSharedDrive: downloadResult.isSharedDrive || false,
      driveId: downloadResult.driveId || null,
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
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
  }
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Pixeldrain endpoint: http://localhost:${PORT}/api/pixeldrain`);
});