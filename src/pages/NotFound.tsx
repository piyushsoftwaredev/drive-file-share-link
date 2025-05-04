
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0a19] to-[#16121f] px-4">
      <div className="text-center bg-[#1a1725]/80 p-8 rounded-2xl backdrop-blur-md border border-[#2a2440] shadow-2xl max-w-md w-full glass-dark">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-red-700/20 flex items-center justify-center glow">
            <FileX className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">404</h1>
        <h2 className="text-xl text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-[#9b87f5] to-[#7c5ce0] hover:from-[#8a76e4] hover:to-[#6b4bd0] rounded-xl shadow-lg shadow-purple-500/20 px-8 py-5">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
