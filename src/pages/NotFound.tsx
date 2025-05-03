
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileX } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0810] to-[#161321] py-8 px-4 animate-gradient">
      <div className="glass-card p-10 text-center max-w-lg w-full pulse-glow animate-fade relative overflow-hidden rounded-xl">
        {/* Add a subtle glow effect in the background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-20 blur-xl animate-pulse"></div>
        
        <div className="relative z-10">
          <FileX className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4 purple-gradient-text">404</h1>
          <p className="text-xl text-gray-300 mb-6">Oops! Page not found</p>
          <p className="text-sm text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="glow-button px-8 py-6 rounded-xl text-white font-medium text-lg"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
