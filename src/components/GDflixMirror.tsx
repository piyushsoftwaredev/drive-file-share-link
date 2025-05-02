import React, { useState } from 'react';
import { regenerateMirrorUrl, DEFAULT_MIRRORS } from '../models/MirrorConfig';
import { extractFileId } from '../utils/driveUtils';

interface GDflixMirrorProps {
  originalUrl?: string;
}

const GDflixMirror: React.FC<GDflixMirrorProps> = ({ originalUrl = '' }) => {
  const [driveUrl, setDriveUrl] = useState<string>(originalUrl || '');
  const [gdflixUrl, setGdflixUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Find GDflix mirror configuration
  const gdflixMirror = DEFAULT_MIRRORS.find(m => m.id === 'gdflix');

  const generateGDflixLink = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!driveUrl.trim()) {
      setError('Please enter a Google Drive URL');
      return;
    }

    if (!gdflixMirror) {
      setError('GDflix mirror configuration not found');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGdflixUrl('');
    setIsSuccess(false);

    try {
      const fileId = extractFileId(driveUrl);
      
      if (!fileId) {
        throw new Error('Could not extract file ID from the provided URL');
      }

      console.log(`Generating GDflix mirror for file ID: ${fileId}`);
      const result = await regenerateMirrorUrl(gdflixMirror, fileId, driveUrl);

      if (result.status === 'success' && result.downloadUrl) {
        setGdflixUrl(result.downloadUrl);
        setIsSuccess(true);
      } else {
        throw new Error(result.message || 'Failed to generate GDflix mirror');
      }
    } catch (err: any) {
      console.error('Error generating GDflix mirror:', err);
      setError(err.message || 'An error occurred while generating the GDflix mirror');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (gdflixUrl) {
      navigator.clipboard.writeText(gdflixUrl)
        .then(() => {
          alert('GDflix link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          alert('Failed to copy link. Please select and copy manually.');
        });
    }
  };

  return (
    <div className="gdflix-mirror-container">
      <div className="section-header">
        <h3>GDflix Mirror Generator</h3>
        <p className="section-description">
          Generate GDflix mirror links for Google Drive files
        </p>
      </div>

      <form onSubmit={generateGDflixLink} className="url-form">
        <div className="input-group">
          <input
            type="text"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="Enter Google Drive URL"
            className="url-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="action-button primary"
            disabled={isLoading || !driveUrl.trim()}
          >
            {isLoading ? 'Generating...' : 'Generate GDflix Mirror'}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <span className="icon">⚠️</span> {error}
        </div>
      )}

      {isSuccess && gdflixUrl && (
        <div className="result-container">
          <h4>GDflix Mirror Link</h4>
          <div className="result-group">
            <input
              type="text"
              value={gdflixUrl}
              readOnly
              className="result-input"
            />
            <button 
              onClick={copyToClipboard}
              className="action-button secondary"
            >
              Copy
            </button>
          </div>
          <div className="button-group">
            <a 
              href={gdflixUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-button link"
            >
              Open Mirror
            </a>
          </div>
        </div>
      )}

      <div className="info-section">
        <h4>About GDflix Mirror</h4>
        <ul className="info-list">
          <li>GDflix provides alternative hosting for Google Drive files</li>
          <li>Links typically remain active for extended periods</li>
          <li>Some files may take time to process on their servers</li>
          <li>Current GDflix domain: {gdflixMirror?.currentDomain || 'Not configured'}</li>
        </ul>
      </div>

      
    </div>
  );
};

export default GDflixMirror;