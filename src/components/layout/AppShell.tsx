import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, ClipboardList, BookOpen, GraduationCap,
  Building2, Bell, Settings, User, BookMarked, FileText, Menu, X,
  LogOut, Sun, Moon, ChevronLeft, ChevronRight, Users, BookCopy,
  BarChart3, Clock, ShieldCheck, Stethoscope, Sparkles, Cpu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useInstitution } from "@/hooks/useInstitution";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = { path: string; label: string; icon: React.ElementType; module?: string };

const studentNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workflows", label: "Workflow Automation", icon: Cpu },
  { path: "/security", label: "Security & Audit", icon: ShieldCheck },
  { path: "/ai-hub", label: "AI Campus Hub", icon: Sparkles, module: "ai-assistant" },
  { path: "/hospital", label: "Hospital ERP", icon: Stethoscope, module: "hospital" },
  { path: "/attendance", label: "Attendance", icon: Calendar, module: "attendance" },
  { path: "/marks", label: "Marks & Results", icon: ClipboardList, module: "results" },
  { path: "/timetable", label: "Timetable", icon: BookMarked, module: "timetable" },
  { path: "/assignments", label: "Assignments", icon: FileText, module: "academics" },
  { path: "/notices", label: "Notices Board", icon: Bell, module: "academics" },
  { path: "/library", label: "Library Books", icon: BookOpen, module: "library" },
  { path: "/placement", label: "Placements", icon: Building2, module: "placement" },
  { path: "/profile", label: "My Profile", icon: User },
  { path: "/settings", label: "System Settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { path: "/admin", label: "Admin Dashboard", icon: BarChart3 },
  { path: "/workflows", label: "Workflow Automation", icon: Cpu },
  { path: "/security", label: "Security & Audit", icon: ShieldCheck },
  { path: "/ai-hub", label: "AI Campus Hub", icon: Sparkles, module: "ai-assistant" },
  { path: "/hospital", label: "Hospital ERP", icon: Stethoscope, module: "hospital" },
  { path: "/admin/students", label: "Students", icon: Users, module: "admissions" },
  { path: "/admin/faculty", label: "Faculty Info", icon: GraduationCap, module: "hr" },
  { path: "/admin/departments", label: "Departments", icon: Building2, module: "departments" },
  { path: "/admin/courses", label: "Courses", icon: BookCopy, module: "courses" },
  { path: "/admin/timetable", label: "Timetables", icon: Clock, module: "timetable" },
  { path: "/admin/results", label: "Grades & Results", icon: ClipboardList, module: "results" },
  { path: "/admin/library", label: "Library ERP", icon: BookOpen, module: "library" },
  { path: "/admin/placement", label: "Placement ERP", icon: ShieldCheck, module: "placement" },
  { path: "/notices", label: "Notice Announcements", icon: Bell, module: "academics" },
  { path: "/settings", label: "Settings Panel", icon: Settings },
];

const facultyNavItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/workflows", label: "Workflow Automation", icon: Cpu },
  { path: "/security", label: "Security & Audit", icon: ShieldCheck },
  { path: "/ai-hub", label: "AI Campus Hub", icon: Sparkles, module: "ai-assistant" },
  { path: "/hospital", label: "Hospital ERP", icon: Stethoscope, module: "hospital" },
  { path: "/admin/courses", label: "My Courses", icon: BookCopy, module: "courses" },
  { path: "/admin/results", label: "Grades Entry", icon: ClipboardList, module: "results" },
  { path: "/attendance", label: "Attendance Entry", icon: Calendar, module: "attendance" },
  { path: "/timetable", label: "Faculty Timetable", icon: BookMarked, module: "timetable" },
  { path: "/notices", label: "Notices & Info", icon: Bell, module: "academics" },
  { path: "/profile", label: "Faculty Profile", icon: User },
  { path: "/settings", label: "Settings Center", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workflows": "Workflow Automation",
  "/security": "Enterprise Security & Audit",
  "/ai-hub": "AI Campus Suite",
  "/hospital": "Hospital ERP & Clinics",
  "/attendance": "Attendance",
  "/marks": "Marks & Results",
  "/timetable": "Timetable",
  "/assignments": "Assignments",
  "/notices": "Notice Board",
  "/library": "Library",
  "/placement": "Placement",
  "/profile": "Profile",
  "/settings": "Settings",
  "/admin": "Admin Dashboard",
  "/admin/students": "Student Management",
  "/admin/faculty": "Faculty Management",
  "/admin/departments": "Departments",
  "/admin/courses": "Courses",
  "/admin/timetable": "Timetable Management",
  "/admin/results": "Results & Marks",
  "/admin/library": "Library Management",
  "/admin/placement": "Placement Management",
};

function NavItem({ item, active, collapsed, onClick }: { item: NavItem; active: boolean; collapsed?: boolean; onClick?: () => void; key?: any }) {
  return (
    <Link href={item.path}>
      <div
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
          active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <item.icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border text-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </div>
    </Link>
  );
}

function SidebarContent({ collapsed, onNavClick }: { collapsed?: boolean; onNavClick?: () => void }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { config, isModuleEnabled, institutionType } = useInstitution();

  const baseNavItems =
    user?.role === "admin"
      ? adminNavItems
      : user?.role === "faculty"
      ? facultyNavItems
      : studentNavItems;

  const roleLabel =
    user?.role === "admin" ? "Admin Portal" : user?.role === "faculty" ? "Faculty Portal" : "Student Portal";

  // Filter items dynamically based on module config
  const navItems = baseNavItems.filter((item) => {
    if (item.module && !isModuleEnabled(item.module)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? "justify-center" : ""}`}>
        {config?.logo ? (
          <img src={config.logo} alt="Logo" className="h-8 w-8 object-contain shrink-0" />
        ) : (
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold leading-tight text-foreground truncate">{config?.name || "Digital Campus"}</h1>
            <p className="text-[10px] text-muted-foreground truncate">{institutionType} • {roleLabel}</p>
          </div>
        )}
      </div>
      <div className="h-px bg-border mx-3 mb-3" />
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} active={location === item.path} collapsed={collapsed} onClick={onNavClick} />
        ))}
      </nav>
      <div className="h-px bg-border mx-3 mt-3" />
      <div className={`p-3 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          {theme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
          {!collapsed && <span className="font-medium">Toggle Theme</span>}
        </button>
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-medium">Log out</span>}
        </button>
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-1">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              <Badge variant="secondary" className="text-[9px] h-4 px-1.5 capitalize">{user.role}</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tabletCollapsed, setTabletCollapsed] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { config, isModuleEnabled } = useInstitution();

  useEffect(() => { setMobileOpen(false); }, [location]);
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const pageTitle = pageTitles[location] ?? "Portal";

  const rawNavItems =
    user?.role === "admin" ? adminNavItems : user?.role === "faculty" ? facultyNavItems : studentNavItems;
  
  const navItems = rawNavItems.filter((item) => {
    if (item.module && !isModuleEnabled(item.module)) {
      return false;
    }
    return true;
  });

  const bottomNavItems = navItems.slice(0, 5);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col border-r bg-card transition-all duration-200 ${tabletCollapsed ? "w-16" : "w-60"}`}>
        <SidebarContent collapsed={tabletCollapsed} />
        <button
          onClick={() => setTabletCollapsed((v) => !v)}
          className="absolute top-[72px] -right-3 z-20 hidden lg:flex h-6 w-6 rounded-full bg-card border border-border shadow-sm items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {tabletCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Tablet sidebar */}
      <aside className="hidden md:flex lg:hidden flex-col border-r bg-card w-16">
        <SidebarContent collapsed />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside key="drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r shadow-2xl md:hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <div className="flex items-center gap-2">
                  {config?.logo ? (
                    <img src={config.logo} alt="Logo" className="h-7 w-7 object-contain" />
                  ) : (
                    <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <span className="font-bold text-sm truncate max-w-[150px]">{config?.name || "Digital Campus"}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto"><SidebarContent onNavClick={() => setMobileOpen(false)} /></div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="h-14 border-b bg-card/80 backdrop-blur-md flex items-center px-4 md:px-5 justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground md:hidden"><Menu className="h-5 w-5" /></button>
            <h2 className="text-sm font-semibold text-foreground">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-muted text-muted-foreground">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-card" />
            </button>
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/20 pb-16 md:pb-0">
          <div className="p-4 sm:p-5 lg:p-7 max-w-7xl mx-auto">{children}</div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item) => {
            const active = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <item.icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                  <span className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
          <button onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground">
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
