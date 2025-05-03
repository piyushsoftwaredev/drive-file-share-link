
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Share, 
  FileText, 
  Settings, 
  Users, 
  LogOut,
  Import,
  Settings2,
  FileDigit
} from 'lucide-react';
import { toast } from 'sonner';

type SidebarLayoutProps = {
  children: React.ReactNode;
};

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  // Check if user is authenticated, if not redirect to login
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Check if user is admin for displaying admin-only menu items
  const isAdmin = user?.isAdmin || false;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-[#0a0810] to-[#161321]">
        <Sidebar className="border-r border-gray-800/30 bg-black/20 backdrop-blur-xl">
          <SidebarHeader className="border-b border-gray-800/30">
            <div className="flex flex-col items-center p-4">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">OXXFILE</h2>
              <p className="text-xs text-purple-300/70">File Sharing Platform</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="glow-sm">
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/dashboard')}
                    isActive={location.pathname === '/dashboard'}
                    tooltip="Dashboard"
                    className="hover:bg-purple-500/10 transition-colors"
                  >
                    <LayoutDashboard className="mr-2 text-purple-400" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/share')}
                    isActive={location.pathname === '/share'}
                    tooltip="Share Files"
                    className="hover:bg-purple-500/10 transition-colors"
                  >
                    <Share className="mr-2 text-purple-400" />
                    <span>Share Files</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/shared-files')}
                    isActive={location.pathname === '/shared-files'}
                    tooltip="Shared Files"
                    className="hover:bg-purple-500/10 transition-colors"
                  >
                    <FileText className="mr-2 text-purple-400" />
                    <span>Shared Files</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/file-queue')}
                    isActive={location.pathname === '/file-queue'}
                    tooltip="File Queue"
                    className="hover:bg-purple-500/10 transition-colors"
                  >
                    <FileDigit className="mr-2 text-purple-400" />
                    <span>File Queue</span>
                    <div className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300">
                      New
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/account-settings')}
                    isActive={location.pathname === '/account-settings'}
                    tooltip="Account Settings"
                    className="hover:bg-purple-500/10 transition-colors"
                  >
                    <Settings className="mr-2 text-purple-400" />
                    <span>Account Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/users')}
                        isActive={location.pathname === '/users'}
                        tooltip="Users Management"
                        className="hover:bg-purple-500/10 transition-colors"
                      >
                        <Users className="mr-2 text-purple-400" />
                        <span>Users Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/import-export')}
                        isActive={location.pathname === '/import-export'}
                        tooltip="Import/Export Files"
                        className="hover:bg-purple-500/10 transition-colors"
                      >
                        <Import className="mr-2 text-purple-400" />
                        <span>Import/Export</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => navigate('/mirror-options')}
                        isActive={location.pathname === '/mirror-options'}
                        tooltip="Mirror Options"
                        className="hover:bg-purple-500/10 transition-colors"
                      >
                        <Settings2 className="mr-2 text-purple-400" />
                        <span>Mirror Options</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-800/30">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout} 
                  tooltip="Logout"
                  className="hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="mr-2 text-red-400" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <div className="flex items-center justify-between p-4 border-b border-gray-800/30 bg-black/30 backdrop-blur-md">
            <div className="flex items-center">
              <SidebarTrigger className="text-purple-400 hover:text-purple-300" />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-purple-300/80 mr-2">
                {user?.username || 'User'}
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-sm text-purple-300">{user?.username?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
