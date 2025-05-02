import React, { createContext, useContext, useState, useEffect } from 'react';
import { Mirror, MirrorConfig, DEFAULT_CONFIG, regenerateMirrorUrl } from '../models/MirrorConfig';

interface MirrorContextType {
  mirrorConfig: MirrorConfig;
  updateMirrorConfig: (config: Partial<MirrorConfig>) => void;
  enableMirror: (id: string, enabled: boolean) => void;
  updateMirror: (id: string, mirrorData: Partial<Mirror>) => void;
  regenerateMirrorLink: (mirror: Mirror, fileId: string, originalUrl: string) => Promise<string>;
  isProcessing: boolean;
}

const MirrorContext = createContext<MirrorContextType | undefined>(undefined);

export const MirrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mirrorConfig, setMirrorConfig] = useState<MirrorConfig>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load saved configuration from localStorage on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('mirrorConfig');
      if (savedConfig) {
        setMirrorConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading mirror config:', error);
    }
  }, []);

  // Save configuration to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('mirrorConfig', JSON.stringify(mirrorConfig));
    } catch (error) {
      console.error('Error saving mirror config:', error);
    }
  }, [mirrorConfig]);

  const updateMirrorConfig = (config: Partial<MirrorConfig>) => {
    setMirrorConfig(prev => ({ ...prev, ...config }));
  };

  const enableMirror = (id: string, enabled: boolean) => {
    setMirrorConfig(prev => ({
      ...prev,
      mirrors: prev.mirrors.map(mirror => 
        mirror.id === id ? { ...mirror, isEnabled: enabled } : mirror
      )
    }));
  };

  const updateMirror = (id: string, mirrorData: Partial<Mirror>) => {
    setMirrorConfig(prev => ({
      ...prev,
      mirrors: prev.mirrors.map(mirror => 
        mirror.id === id ? { ...mirror, ...mirrorData } : mirror
      )
    }));
  };

  const regenerateMirrorLink = async (mirror: Mirror, fileId: string, originalUrl: string): Promise<string> => {
    setIsProcessing(true);
    try {
      const result = await regenerateMirrorUrl(mirror, fileId, originalUrl);
      if (result.status === 'success' && result.downloadUrl) {
        // Update last regenerated timestamp
        updateMirror(mirror.id, { 
          lastRegenerated: new Date().toISOString() 
        });
        return result.downloadUrl;
      } else {
        throw new Error(result.message || `Failed to generate ${mirror.name} mirror`);
      }
    } catch (error) {
      console.error(`Error regenerating ${mirror.name} mirror:`, error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MirrorContext.Provider value={{
      mirrorConfig,
      updateMirrorConfig,
      enableMirror,
      updateMirror,
      regenerateMirrorLink,
      isProcessing
    }}>
      {children}
    </MirrorContext.Provider>
  );
};

export const useMirror = () => {
  const context = useContext(MirrorContext);
  if (context === undefined) {
    throw new Error('useMirror must be used within a MirrorProvider');
  }
  return context;
};