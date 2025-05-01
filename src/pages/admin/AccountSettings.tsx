
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Key, Mail, User } from 'lucide-react';

const AccountSettings = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Account Settings</h1>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-oxxfile-purple rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.username.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.username}</h2>
              <p className="text-gray-400">
                {user?.isAdmin ? 'Administrator' : 'Standard User'}
              </p>
            </div>
          </div>
        </CardContent>
        <Separator className="bg-gray-800" />
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                value={user?.username || ''}
                readOnly
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value="admin@example.com"
                readOnly
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-white">API Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="api-key"
                value="AIzaSyBx2A9I8DtQUeCNW2LVqWZSbpWivnNkomI"
                readOnly
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <p className="text-xs text-gray-400">This is your Google Drive API key. Keep it secure.</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Account Created</Label>
            <p className="text-gray-400">May 1, 2025</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-white">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-white">New Password</Label>
              <Input
                id="new-password"
                type="password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <Button 
              type="submit" 
              className="bg-oxxfile-purple hover:bg-oxxfile-purple/90"
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
