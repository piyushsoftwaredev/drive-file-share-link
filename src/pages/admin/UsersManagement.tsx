
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Mock users data (this would come from backend/database in real implementation)
const mockUsers = [
  { id: '1', username: 'AMAN', email: 'admin@example.com', isAdmin: true, dateCreated: '2025-01-01' },
  { id: '2', username: 'user1', email: 'user1@example.com', isAdmin: false, dateCreated: '2025-01-02' },
  { id: '3', username: 'user2', email: 'user2@example.com', isAdmin: false, dateCreated: '2025-01-03' },
];

const UsersManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', isAdmin: false });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to create the user
    const newId = (Math.max(...users.map(u => parseInt(u.id))) + 1).toString();
    
    setUsers([
      ...users,
      {
        id: newId,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        dateCreated: new Date().toISOString().split('T')[0]
      }
    ]);
    
    setNewUser({ username: '', email: '', password: '', isAdmin: false });
    toast.success(`User ${newUser.username} added successfully!`);
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would call an API to delete the user
    setUsers(users.filter(user => user.id !== userId));
    toast.success("User deleted successfully!");
  };

  const handleResetPassword = (userId: string) => {
    // In a real app, this would call an API to reset the user's password
    toast.success("Password reset email sent!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Users Management</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-oxxfile-purple"
                />
                <Label htmlFor="isAdmin" className="text-white">Admin Access</Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-oxxfile-purple hover:bg-oxxfile-purple/90"
              >
                Add User
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/60 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-oxxfile-purple">{users.length}</p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Administrators</p>
                <p className="text-3xl font-bold text-oxxfile-purple">
                  {users.filter(u => u.isAdmin).length}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Standard Users</p>
                <p className="text-3xl font-bold text-oxxfile-purple">
                  {users.filter(u => !u.isAdmin).length}
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded">
                <p className="text-gray-400 text-sm">Active Today</p>
                <p className="text-3xl font-bold text-oxxfile-purple">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-900/60 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-white">Username</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Role</TableHead>
                  <TableHead className="text-white">Date Created</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id} className="border-gray-800">
                    <TableCell className="font-medium text-white">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-gray-400">{user.email}</TableCell>
                    <TableCell className="text-gray-400">
                      {user.isAdmin ? (
                        <span className="bg-oxxfile-purple/20 text-oxxfile-purple px-2 py-1 rounded text-xs">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          User
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-400">{user.dateCreated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          Reset Password
                        </Button>
                        {user.id !== '1' && (
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersManagement;
