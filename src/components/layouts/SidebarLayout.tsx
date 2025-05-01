
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  LogOut 
} from 'lucide-react';
import { toast } from 'sonner';

type SidebarLayoutProps = {
  children: React.ReactNode;
};

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
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
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-gray-800">
          <SidebarHeader className="border-b border-gray-800">
            <div className="flex flex-col items-center p-4">
              <h2 className="text-xl font-bold text-gradient">OXXFILE</h2>
              <p className="text-xs text-muted-foreground">File Sharing Platform</p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/dashboard')}
                    isActive={location.pathname === '/dashboard'}
                    tooltip="Dashboard"
                  >
                    <LayoutDashboard className="mr-2" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/share')}
                    isActive={location.pathname === '/share'}
                    tooltip="Share Files"
                  >
                    <Share className="mr-2" />
                    <span>Share Files</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/shared-files')}
                    isActive={location.pathname === '/shared-files'}
                    tooltip="Shared Files"
                  >
                    <FileText className="mr-2" />
                    <span>Shared Files</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => navigate('/account-settings')}
                    isActive={location.pathname === '/account-settings'}
                    tooltip="Account Settings"
                  >
                    <Settings className="mr-2" />
                    <span>Account Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => navigate('/users')}
                      isActive={location.pathname === '/users'}
                      tooltip="Users Management"
                    >
                      <Users className="mr-2" />
                      <span>Users Management</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                  <LogOut className="mr-2" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center">
              <SidebarTrigger />
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                {user?.username || 'User'}
              </span>
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
