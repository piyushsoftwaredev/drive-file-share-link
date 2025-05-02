import { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import FormData from 'form-data';
import https from 'https';

// These should be in environment variables, not hard-coded
const SERVICE_ACCOUNTS = [
  {
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
  },
  {
    "type": "service_account",
    "project_id": "saf-p9qydxzlrny10cegknl-6baie2",
    "private_key_id": "e958095b95891edfe3008ccf8db77a2ccd31400c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDqn8mkXyF7DmcP\ncWd4ToLNb7pRrDIW7MPwt8bvJI1ly3OM4OXW0aq6CV6b8S74KoctEC9zPU4WDY/M\nVriDXEhLW97VNFGqfKB/jQ5LrWjcURU88r9W8kiAOg4EAy+PBaw+tDcF2piKOLJo\n6lwKPkJbWlN0HjkRC1LiW1D0Qoobnis5debuHUoT2PQbZL5SV2HRWnz/rEjGEIX9\nUNj81V/4Z45vt9SJhFp9ERR9e0p9rXCL37qTrACXwY/KOxg8fn1WMWHg6iSHlUzQ\nFPvQYSe2VsM++zPf2eGdO1iyH2Kg+hq4XQwRRAYsTOGhDUwIRP9d21nRY29EUpnt\n8zLCVWW9AgMBAAECggEAMkHegU9gXlnoMRpnYdGderCFXmPOifMXCKvxGL5BbI3v\nVzzAdurMEZQauDgqSb3gXUKDi4GVBavLgueLmBXPJZdNDOnrWWPfRFs8dfD0Dodu\nz3KnElKNPaxR3sGo8Q+zxO25AI/Bz4/UBZ237/jEoYlgaXXk3vYIP9T0KxJKv53R\niVhkdF+UNvVBwT2D/N8GsOAlaPOrOoyvJ/YDUcbUuWh/2sRSe1NYLo0ZPvSxXnU1\njTsrx0ur+cFvytVONkrsWFcO438nTWZSlBXnomBnbd52sJlUgBWRTQrBYukUR3LP\ntxdOOjDvBG3RjWHTB3M117EnQYMhC/nwfxHSrWeOIQKBgQD/oFcy8ADBz7TuwZKs\nqC8V8FB+OPX9IWTt5blQpaht1T0Q1BTW3ul4OijXH9uCwrBiXaFy9/aQFxy5GKHD\nnm8Byfg5ovdumAPO13d3Om2g3e94xu4PQALIoRo9ssNUIh9KwBBfnzZj6eD8SyDV\nrC4IQGTVFdweJlLicPWALR3fXQKBgGNkO8HkqpNZxNooyVvWqjSyHwdoS1REPOCKs7qcdYOQG2mf3WyF\neRuxmF41TLP612Mc69aUdL/KSAeL1RItPa91RafoUHhVX7JV/qKrVAdj1g3zBQH8\nyZybZ0E5YO6HWMCFGtOl8YEIpia32g9F3x/EtrytSXe0JeboHuBhVi+FAoGAeyA6\nl6P4P/tFifYB9kSGc3haLOscjLvbNVPnkkViB55LsSKzRn40Y3+G7JfjWo1fyBt+\nROopVGQ29jEKXHQYdXrgUK3XZstkBQqOqMmiaFUhMUfp8kgPR+WnW2k5KWS/3bke\nUWDb4EmboQh//edSeo56KQtnJn8lmbIMYajpVU8CgYAlxMd+9ohfI7l+oGLrArUJ\nbOEq7Q/lZo/as56K6K9Um+lUCYToKi/+VmFiddObyqO/0M3skWPzA4MbDXtUbxVn\n1L3rf6Xx9H3NXzf0/XWoszdFxmDW2fN7vR2Vq/exLTqZwmmubAhKYQ1+UpjSFvhZ\nbRyPaLAc3+iLCmmmSr74Ug==\n-----END PRIVATE KEY-----\n",
    "client_email": "mfc-yckpfbs7ox14-tbgdwb2h6w8s4@saf-p9qydxzlrny10cegknl-6baie2.iam.gserviceaccount.com",
    "client_id": "104620225775549914769",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mfc-yckpfbs7ox14-tbgdwb2h6w8s4%40saf-p9qydxzlrny10cegknl-6baie2.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
];

// Create an OAuth2 client with the service account credentials
const authorize = () => {
  // Use a random service account from the pool
  const serviceAccount = SERVICE_ACCOUNTS[Math.floor(Math.random() * SERVICE_ACCOUNTS.length)];
  
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    undefined,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/drive']
  );
  
  return jwtClient;
};

// Download file from Google Drive
const downloadFileFromDrive = async (fileId: string) => {
  const auth = authorize();
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    // Get file metadata
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'name,size,mimeType'
    });
    
    const fileName = fileMetadata.data.name || `file-${fileId}.mp4`;
    const fileSize = Number(fileMetadata.data.size) || 0;
    const mimeType = fileMetadata.data.mimeType || 'application/octet-stream';
    
    // Create a temporary file path
    const tempFilePath = path.join(os.tmpdir(), fileName);
    
    console.log(`Downloading file: ${fileName} (${fileSize} bytes) to ${tempFilePath}`);
    
    // Download the file
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    
    return new Promise<{ filePath: string; fileName: string; size: number, mimeType: string }>(
      (resolve, reject) => {
        const dest = fs.createWriteStream(tempFilePath);
        let progress = 0;
        
        response.data
          .on('data', (chunk: Buffer) => {
            progress += chunk.length;
            if (fileSize > 0) {
              const percent = Math.round((progress / fileSize) * 100);
              process.stdout.write(`\rDownloading... ${percent}% complete`);
            }
          })
          .on('error', (err: Error) => {
            dest.close();
            fs.unlinkSync(tempFilePath);
            reject(err);
          })
          .on('end', () => {
            dest.close();
            console.log('\nDownload complete!');
            resolve({ 
              filePath: tempFilePath, 
              fileName, 
              size: fileSize,
              mimeType 
            });
          })
          .pipe(dest);
      }
    );
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

// Upload file to Pixeldrain
const uploadToPixeldrain = async (
  filePath: string, 
  fileName: string, 
  mimeType: string,
  apiKey: string
) => {
  console.log(`Uploading ${filePath} to Pixeldrain as ${fileName}`);
  
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), { 
    filename: fileName,
    contentType: mimeType 
  });
  
  // Create basic auth token from API key
  const authToken = Buffer.from(`api:${apiKey}`).toString('base64');
  
  return new Promise<{ id: string; success: boolean; name: string }>(
    (resolve, reject) => {
      const request = https.request(
        {
          method: 'POST',
          host: 'pixeldrain.com',
          path: '/api/file',
          headers: {
            ...form.getHeaders(),
            'Authorization': `Basic ${authToken}`
          }
        },
        response => {
          let data = '';
          
          response.on('data', chunk => {
            data += chunk;
          });
          
          response.on('end', () => {
            try {
              if (response.statusCode !== 200) {
                reject(
                  new Error(
                    `Pixeldrain API error: ${response.statusCode} - ${data}`
                  )
                );
                return;
              }
              
              const result = JSON.parse(data);
              if (result.success && result.id) {
                resolve({ 
                  id: result.id, 
                  success: true,
                  name: fileName
                });
              } else {
                reject(new Error(`Pixeldrain upload failed: ${data}`));
              }
            } catch (error) {
              reject(error);
            }
          });
        }
      );
      
      request.on('error', err => {
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
    }
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  // Extract parameters
  const { fileId, apiKey = 'eb3973b7-d3e9-4112-873d-0be8924dfa01' } = req.body;
  
  if (!fileId) {
    return res.status(400).json({ success: false, message: 'Missing fileId parameter' });
  }
  
  console.log(`Starting pixeldrain processing for fileId: ${fileId}`);
  console.log(`Using API key: ${apiKey}`);
  
  let tempFilePath = '';
  
  try {
    // Step 1: Download file from Google Drive
    console.log(`Starting download process for Google Drive file: ${fileId}`);
    const downloadResult = await downloadFileFromDrive(fileId);
    tempFilePath = downloadResult.filePath;
    
    // Step 2: Upload to Pixeldrain
    console.log(`Starting upload to Pixeldrain for file: ${downloadResult.fileName}`);
    const uploadResult = await uploadToPixeldrain(
      tempFilePath, 
      downloadResult.fileName,
      downloadResult.mimeType,
      apiKey
    );
    
    // Step 3: Generate Pixeldrain URL
    const pixeldrainUrl = `https://pixeldrain.com/api/file/${uploadResult.id}?download`;
    
    // Log all details
    console.log(`Successfully created Pixeldrain mirror:`);
    console.log(`- Original file: ${downloadResult.fileName} (${downloadResult.size} bytes)`);
    console.log(`- Pixeldrain ID: ${uploadResult.id}`);
    console.log(`- Download URL: ${pixeldrainUrl}`);
    
    // Return success with the Pixeldrain URL
    return res.status(200).json({
      success: true,
      fileId: fileId,
      downloadUrl: pixeldrainUrl,
      pixeldrainId: uploadResult.id,
      fileName: downloadResult.fileName,
      size: downloadResult.size,
      message: "File successfully processed and uploaded to Pixeldrain",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing PixelDrain mirror:', error);
    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      fileId: fileId,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Removed temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
  }
}