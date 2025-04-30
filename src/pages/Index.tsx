
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">Premium File Sharing</h1>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-2xl">
          Share your files securely with OxxFile. Fast, reliable, and encrypted file sharing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 text-white px-8 py-6 text-lg">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 text-white px-8 py-6 text-lg">
                Get Started
              </Button>
            </Link>
          )}
          <Link to="/how-it-works">
            <Button variant="outline" className="border-oxxfile-purple text-oxxfile-purple hover:bg-oxxfile-purple/10 px-8 py-6 text-lg">
              How it Works
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-800 text-center">
        <p className="text-gray-500">
          &copy; {new Date().getFullYear()} OxxFile. Premium file sharing service.
        </p>
      </div>
    </div>
  );
};

export default Index;
