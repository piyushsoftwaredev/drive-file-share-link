
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RefreshCw, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { Mirror, DEFAULT_MIRRORS } from '@/models/MirrorConfig';

const MirrorOptions = () => {
  const [mirrors, setMirrors] = useState<Mirror[]>(DEFAULT_MIRRORS);

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

  const handleRegenerateMirror = (id: string) => {
    // Logic to regenerate mirror would go here
    setMirrors(prev => 
      prev.map(mirror => 
        mirror.id === id ? { ...mirror, lastRegenerated: new Date().toISOString() } : mirror
      )
    );
    toast.success(`Mirror ${id} regenerated`);
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
                  readOnly
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
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
              defaultValue="3"
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
              defaultValue="50"
              className="bg-gray-800 border-gray-700 text-white w-24"
              min="1"
              max="100"
            />
            <p className="text-xs text-gray-400 mt-1">
              Controls the bandwidth allocation for file regeneration processes
            </p>
          </div>
          
          <Button className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 mt-4">
            Save Global Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MirrorOptions;
