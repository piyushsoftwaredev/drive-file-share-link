
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HowItWorks = () => {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">How OxxFile Works</h1>
        
        <div className="space-y-8">
          <div className="bg-gray-900/60 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">1. Login to Your Account</h2>
            <p className="text-gray-400 mb-4">
              Access your secure dashboard with your credentials. For this demo, use username <span className="text-white font-mono">AMAN</span> and password <span className="text-white font-mono">AMAN</span>.
            </p>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">2. Add Your Google Drive File</h2>
            <p className="text-gray-400 mb-4">
              Paste any Google Drive file URL into the dashboard. OxxFile will extract all the necessary file information automatically.
            </p>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">3. Generate Share Link</h2>
            <p className="text-gray-400 mb-4">
              OxxFile generates a unique, easy-to-share link for your file. The system creates a random ID for each file to ensure security.
            </p>
          </div>
          
          <div className="bg-gray-900/60 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-3">4. Share with Anyone</h2>
            <p className="text-gray-400 mb-4">
              Share your link with anyone who needs access to the file. They'll be able to view file details and access multiple download options.
            </p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link to="/dashboard">
            <Button className="bg-oxxfile-purple hover:bg-oxxfile-purple/90 text-white px-6 py-2">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
