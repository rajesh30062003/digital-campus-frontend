import React, { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useInstitution } from "@/hooks/useInstitution";
import { ThemeProvider } from "next-themes";
import { Loader2 } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

// Lazy loaded page components for optimal bundle splitting
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attendance = lazy(() => import("@/pages/Attendance"));
const Marks = lazy(() => import("@/pages/Marks"));
const Timetable = lazy(() => import("@/pages/Timetable"));
const Profile = lazy(() => import("@/pages/Profile"));
const Assignments = lazy(() => import("@/pages/Assignments"));
const Notices = lazy(() => import("@/pages/Notices"));
const Library = lazy(() => import("@/pages/Library"));
const Placement = lazy(() => import("@/pages/Placement"));
const Settings = lazy(() => import("@/pages/Settings"));
const Hospital = lazy(() => import("@/pages/Hospital"));
const OnboardWizard = lazy(() => import("@/pages/OnboardWizard"));
const AiHub = lazy(() => import("@/pages/AiHub"));
const WorkflowAutomation = lazy(() => import("@/pages/WorkflowAutomation"));
const SecurityAudit = lazy(() => import("@/pages/SecurityAudit"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Admin pages lazy loaded
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminStudents = lazy(() => import("@/pages/admin/AdminStudents"));
const AdminFaculty = lazy(() => import("@/pages/admin/AdminFaculty"));
const AdminDepartments = lazy(() => import("@/pages/admin/AdminDepartments"));
const AdminCourses = lazy(() => import("@/pages/admin/AdminCourses"));
const AdminTimetable = lazy(() => import("@/pages/admin/AdminTimetable"));
const AdminResults = lazy(() => import("@/pages/admin/AdminResults"));
const AdminLibrary = lazy(() => import("@/pages/admin/AdminLibrary"));
const AdminPlacement = lazy(() => import("@/pages/admin/AdminPlacement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000, gcTime: 300_000 },
  },
});

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3" aria-label="Loading page content">
    <Loader2 className="h-8 w-8 text-primary animate-spin" />
    <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading Digital Campus Module...</p>
  </div>
);

const ProtectedRoute = ({
  component: Component,
  roles,
  module,
}: {
  component: React.ComponentType;
  roles?: string[];
  module?: string;
}) => {
  const { isAuthenticated, user } = useAuth();
  const { isModuleEnabled } = useInstitution();

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (roles && user && !roles.includes(user.role)) return <Redirect to="/dashboard" />;
  if (module && !isModuleEnabled(module)) return <Redirect to="/dashboard" />;

  return (
    <AppShell>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </AppShell>
  );
};

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/onboard" component={OnboardWizard} />
        <Route path="/" component={() => <Redirect to="/dashboard" />} />

        {/* Common routes */}
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/attendance" component={() => <ProtectedRoute component={Attendance} module="attendance" />} />
        <Route path="/marks" component={() => <ProtectedRoute component={Marks} module="results" />} />
        <Route path="/timetable" component={() => <ProtectedRoute component={Timetable} module="timetable" />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
        <Route path="/assignments" component={() => <ProtectedRoute component={Assignments} module="academics" />} />
        <Route path="/notices" component={() => <ProtectedRoute component={Notices} module="academics" />} />
        <Route path="/library" component={() => <ProtectedRoute component={Library} module="library" />} />
        <Route path="/placement" component={() => <ProtectedRoute component={Placement} module="placement" />} />
        <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
        <Route path="/hospital" component={() => <ProtectedRoute component={Hospital} module="hospital" />} />
        <Route path="/ai-hub" component={() => <ProtectedRoute component={AiHub} module="ai-assistant" />} />
        <Route path="/workflows" component={() => <ProtectedRoute component={WorkflowAutomation} />} />
        <Route path="/security" component={() => <ProtectedRoute component={SecurityAudit} />} />

        {/* Admin routes */}
        <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} roles={["admin"]} />} />
        <Route path="/admin/students" component={() => <ProtectedRoute component={AdminStudents} roles={["admin"]} module="admissions" />} />
        <Route path="/admin/faculty" component={() => <ProtectedRoute component={AdminFaculty} roles={["admin"]} module="hr" />} />
        <Route path="/admin/departments" component={() => <ProtectedRoute component={AdminDepartments} roles={["admin"]} module="departments" />} />
        <Route path="/admin/courses" component={() => <ProtectedRoute component={AdminCourses} roles={["admin", "faculty"]} module="courses" />} />
        <Route path="/admin/timetable" component={() => <ProtectedRoute component={AdminTimetable} roles={["admin"]} module="timetable" />} />
        <Route path="/admin/results" component={() => <ProtectedRoute component={AdminResults} roles={["admin", "faculty"]} module="results" />} />
        <Route path="/admin/library" component={() => <ProtectedRoute component={AdminLibrary} roles={["admin"]} module="library" />} />
        <Route path="/admin/placement" component={() => <ProtectedRoute component={AdminPlacement} roles={["admin"]} module="placement" />} />

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

const ThemeProviderAny = ThemeProvider as any;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviderAny attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProviderAny>
    </QueryClientProvider>
  );
}

export default App;
