import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: "📊" },
  { title: "My Courses", url: "/dashboard/courses", icon: "📚" },
  { title: "Progress", url: "/dashboard/progress", icon: "📈" },
  { title: "Quizzes", url: "/dashboard/quizzes", icon: "❓" },
  { title: "Certificates", url: "/dashboard/certificates", icon: "🏆" },
];

const accountItems = [
  { title: "Profile", url: "/dashboard/profile", icon: "👤" },
  { title: "Settings", url: "/dashboard/settings", icon: "⚙️" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50";

  const isMainExpanded = mainItems.some((item) => isActive(item.url));
  const isAccountExpanded = accountItems.some((item) => isActive(item.url));

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          {!collapsed && <span className="text-xl font-bold text-foreground">CyberLearn</span>}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className={getNavCls(item.url)}>
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <span className="mr-2 text-lg">{item.icon}</span>
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout */}
        <div className="mt-auto p-4">
          <SidebarMenuButton asChild>
            <NavLink to="/" className="hover:bg-destructive/10 text-destructive">
              <span className="mr-2 text-lg">🚪</span>
              {state !== "collapsed" && <span>Logout</span>}
            </NavLink>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}