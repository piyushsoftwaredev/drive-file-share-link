
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, ArrowDown, Settings2, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Mirror, DEFAULT_MIRRORS, DEFAULT_CONFIG } from '@/models/MirrorConfig';

const MirrorOptions = () => {
  const [mirrors, setMirrors] = useState<Mirror[]>(DEFAULT_MIRRORS);
  const [maxParallelDownloads, setMaxParallelDownloads] = useState(DEFAULT_CONFIG.maxParallelDownloads);
  const [bandwidthUsage, setBandwidthUsage] = useState(50);

  const handleToggleMirror = (id: string) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, isEnabled: !mirror.isEnabled } : mirror
      )
    );
    toast.success(`Mirror ${id} ${mirrors.find(m => m.id === id)?.isEnabled ? 'disabled' : 'enabled'}`);
  };

  const handleRegenerationPeriodChange = (id: string, period: number) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, regenerationPeriod: period } : mirror
      )
    );
  };

  const handleApiKeyChange = (id: string, apiKey: string) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, apiKey } : mirror
      )
    );
  };

  const handleDomainChange = (id: string, domain: string) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, currentDomain: domain } : mirror
      )
    );
  };

  const handleRetryCountChange = (id: string, count: number) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, retryCount: count } : mirror
      )
    );
  };

  const handleRetryDelayChange = (id: string, delay: number) => {
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, retryDelay: delay } : mirror
      )
    );
  };

  const handleRegenerateMirror = (id: string) => {
    // Logic to regenerate mirror would go here
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, lastRegenerated: new Date().toISOString() } : mirror
      )
    );
    toast.success(`Mirror ${id} regenerated`);
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to localStorage or a backend API
    toast.success("Global mirror settings saved");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Mirror Options</h1>
      
      <div className="grid gap-6 md:grid-cols-1">
        {mirrors.map((mirror) => (
          <Card key={mirror.id} className="bg-gray-900/60 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">{mirror.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`mirror-${mirror.id}`} className="text-white">
                  {mirror.isEnabled ? 'Enabled' : 'Disabled'}
                </Label>
                <Switch
                  id={`mirror-${mirror.id}`}
                  checked={mirror.isEnabled}
                  onCheckedChange={() => handleToggleMirror(mirror.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Base URL</Label>
                <Input
                  value={mirror.baseUrl}
                  onChange={(e) => setMirrors(prev => 
                    prev.map(m => 
                      m.id === mirror.id ? { ...m, baseUrl: e.target.value } : m
                    )
                  )}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              {mirror.id === 'gdflix' && (
                <>
                  <div>
                    <Label className="text-white">Current Domain</Label>
                    <Input
                      value={mirror.currentDomain || ''}
                      onChange={(e) => handleDomainChange(mirror.id, e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://new6.gdflix.dad/"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">API Key</Label>
                    <Input
                      value={mirror.apiKey || ''}
                      onChange={(e) => handleApiKeyChange(mirror.id, e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Enter API key"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Retry Count</Label>
                      <Input
                        type="number"
                        value={mirror.retryCount || 5}
                        onChange={(e) => handleRetryCountChange(mirror.id, parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white"
                        min="1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white">Retry Delay (seconds)</Label>
                      <Input
                        type="number"
                        value={mirror.retryDelay || 5}
                        onChange={(e) => handleRetryDelayChange(mirror.id, parseInt(e.target.value))}
                        className="bg-gray-800 border-gray-700 text-white"
                        min="1"
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div>
                <Label className="text-white">Regeneration Period (hours)</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={mirror.regenerationPeriod}
                    onChange={(e) => handleRegenerationPeriodChange(mirror.id, parseInt(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white w-24"
                    min="1"
                  />
                  <Button 
                    onClick={() => handleRegenerateMirror(mirror.id)}
                    className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 flex items-center"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Now
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-white">Last Regenerated</Label>
                <p className="text-gray-400">
                  {mirror.lastRegenerated 
                    ? new Date(mirror.lastRegenerated).toLocaleString() 
                    : 'Never'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-gray-800">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white w-full flex items-center justify-center"
                  onClick={() => handleToggleMirror(mirror.id)}
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  {mirror.isEnabled ? 'Disable Mirror' : 'Enable Mirror'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Global Mirror Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Maximum Parallel Downloads</Label>
            <Input
              type="number"
              value={maxParallelDownloads}
              onChange={(e) => setMaxParallelDownloads(parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white w-24"
              min="1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Limits the number of simultaneous downloads to optimize bandwidth
            </p>
          </div>
          
          <div>
            <Label className="text-white">Bandwidth Usage (%)</Label>
            <Input
              type="number"
              value={bandwidthUsage}
              onChange={(e) => setBandwidthUsage(parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white w-24"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-400 mt-1">
              Controls the bandwidth allocation for file regeneration processes
            </p>
          </div>
          
          <Button 
            className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 mt-4"
            onClick={handleSaveSettings}
          >
            Save Global Settings
          </Button>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Backend Performance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Worker Threads</Label>
            <Input
              type="number"
              defaultValue="4"
              className="bg-gray-800 border-gray-700 text-white w-24"
              min="1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Number of simultaneous background processes for file operations
            </p>
          </div>
          
          <div>
            <Label className="text-white">Processing Queue Size</Label>
            <Input
              type="number"
              defaultValue="100"
              className="bg-gray-800 border-gray-700 text-white w-24"
              min="1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Maximum number of files in the processing queue
            </p>
          </div>
          
          <div>
            <Label className="text-white">Processing Priority</Label>
            <select className="w-full bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 mt-1">
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Control how system resources are allocated to file processing
            </p>
          </div>
          
          <Button 
            className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 flex items-center mt-4"
            onClick={() => toast.success("Backend performance settings saved")}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            Save Performance Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MirrorOptions;
