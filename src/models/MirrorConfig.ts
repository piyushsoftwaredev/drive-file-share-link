
export interface Mirror {
  id: string;
  name: string;
  baseUrl: string;
  isEnabled: boolean;
  regenerationPeriod: number; // in hours
  lastRegenerated?: string;
}

export interface MirrorConfig {
  mirrors: Mirror[];
  activeCount: number;
  maxParallelDownloads: number;
}

export const DEFAULT_MIRRORS: Mirror[] = [
  {
    id: 'mirror1',
    name: 'Direct Link',
    baseUrl: 'https://drive.google.com/uc?export=download&id=',
    isEnabled: true,
    regenerationPeriod: 24,
  },
  {
    id: 'mirror2',
    name: 'Pixel Download',
    baseUrl: 'https://pixeldrain.com/api/file/',
    isEnabled: true,
    regenerationPeriod: 48,
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

export const regenerateMirrorUrl = (mirror: Mirror, fileId: string): string => {
  // In a real implementation, this could involve making API calls to regenerate the URL
  // For demonstration purposes, we're just adding a timestamp parameter
  const timestamp = new Date().getTime();
  return `${mirror.baseUrl}${fileId}?t=${timestamp}`;
};
