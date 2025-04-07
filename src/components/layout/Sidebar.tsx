import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Camera,
  FileVideo,
  Grid,
  Terminal,
  Settings,
  Cpu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const SidebarComponent = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Camera, label: "Cameras", path: "/cameras" },
    { icon: FileVideo, label: "Records", path: "/records" },
    { icon: Grid, label: "Templates", path: "/templates" },
    { icon: Terminal, label: "I/O", path: "/io" },
    { icon: Cpu, label: "ECS", path: "/ecs" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
            M
          </div>
          <span className="text-xl font-bold">Movita</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={isActive(item.path)}>
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button variant="outline" className="w-full justify-start gap-2">
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default SidebarComponent;
