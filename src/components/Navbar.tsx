
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-oxxfile-dark border-b border-b-gray-800">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded-md">
          <div className="w-4 h-4 bg-oxxfile-dark rounded-sm"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-blue-500">LDRIVE</span>
          <span className="text-xs text-gray-400">PREMIUM SHARING</span>
        </div>
      </Link>
      <div>
        {isAuthenticated ? (
          <div className="flex gap-4 items-center">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-white hover:text-blue-500">
                Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={logout}
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Link to="/login">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
