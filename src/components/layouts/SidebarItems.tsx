
import {
  Home,
  Upload,
  Share2,
  Settings,
  Users,
  FileArchive,
  Network,
  FileCheck
} from "lucide-react";

export type SidebarItem = {
  title: string;
  icon: React.ComponentType;
  href: string;
  badge?: string;
  submenu?: SidebarItem[];
};

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Share Files",
    icon: Upload,
    href: "/share",
  },
  {
    title: "Shared Files",
    icon: Share2,
    href: "/shared-files",
  },
  {
    title: "File Queue",
    icon: FileCheck,
    href: "/file-queue",
    badge: "New",
  },
  {
    title: "Account Settings",
    icon: Settings,
    href: "/account-settings",
  },
  {
    title: "Users Management",
    icon: Users,
    href: "/users",
  },
  {
    title: "Import/Export",
    icon: FileArchive,
    href: "/import-export",
  },
  {
    title: "Mirror Options",
    icon: Network,
    href: "/mirror-options",
  },
];

export default SIDEBAR_ITEMS;
