import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { FileProvider } from "@/contexts/FileContext";
import { MirrorProvider } from "@/contexts/MirrorContext"; // Added MirrorProvider

// Layouts
import SidebarLayout from "@/components/layouts/SidebarLayout";

// Public Pages
import Navbar from "@/components/Navbar";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import HowItWorks from "@/pages/HowItWorks";
import FileView from "@/pages/FileView";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ShareFiles from "@/pages/admin/ShareFiles";
import SharedFiles from "@/pages/admin/SharedFiles";
import AccountSettings from "@/pages/admin/AccountSettings";
import UsersManagement from "@/pages/admin/UsersManagement";
import ImportExport from "@/pages/admin/ImportExport";
import MirrorOptions from "@/pages/admin/MirrorOptions";
import FileQueue from "@/pages/admin/FileQueue";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <SidebarLayout>{children}</SidebarLayout>;
};

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <FileProvider>
            <MirrorProvider> {/* Added MirrorProvider to wrap the app */}
              <TooltipProvider>
                <div className="min-h-screen bg-oxxfile-dark flex flex-col">
                  <Routes>
                    {/* Public Routes */}
                    <Route 
                      path="/" 
                      element={
                        <>
                          <Navbar />
                          <Index />
                        </>
                      } 
                    />
                    <Route 
                      path="/login" 
                      element={
                        <>
                          <Navbar />
                          <Login />
                        </>
                      } 
                    />
                    <Route 
                      path="/file/:id" 
                      element={
                        <>
                          <Navbar />
                          <FileView />
                        </>
                      } 
                    />
                    <Route 
                      path="/how-it-works" 
                      element={
                        <>
                          <Navbar />
                          <HowItWorks />
                        </>
                      } 
                    />

                    {/* Admin/Protected Routes */}
                    <Route
                      path="/dashboard"
                      element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
                    />
                    <Route
                      path="/share"
                      element={<ProtectedRoute><ShareFiles /></ProtectedRoute>}
                    />
                    <Route
                      path="/shared-files"
                      element={<ProtectedRoute><SharedFiles /></ProtectedRoute>}
                    />
                    <Route
                      path="/account-settings"
                      element={<ProtectedRoute><AccountSettings /></ProtectedRoute>}
                    />
                    <Route
                      path="/users"
                      element={<ProtectedRoute><UsersManagement /></ProtectedRoute>}
                    />
                    <Route
                      path="/import-export"
                      element={<ProtectedRoute><ImportExport /></ProtectedRoute>}
                    />
                    <Route
                      path="/mirror-options"
                      element={<ProtectedRoute><MirrorOptions /></ProtectedRoute>}
                    />
                    <Route
                      path="/file-queue"
                      element={<ProtectedRoute><FileQueue /></ProtectedRoute>}
                    />

                    {/* Fallback Routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
                <Sonner />
              </TooltipProvider>
            </MirrorProvider> {/* Closing MirrorProvider */}
          </FileProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;