import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { useLocation } from "wouter";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";

function Router() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [location, setLocation] = useLocation();
  
  // Add refresh functionality for stuck states
  React.useEffect(() => {
    if (isSignedIn && location.includes('__clerk_handshake')) {
      // If we're stuck on handshake URL, redirect to dashboard
      setLocation('/dashboard');
    }
  }, [isSignedIn, location, setLocation]);
  
  // Check if user has projects to determine if they need onboarding
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isSignedIn,
  });
  
  const needsOnboarding = false; // Disable onboarding redirect for now

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {/* Add refresh button for stuck states */}
          <button 
            onClick={() => window.location.href = "/"} 
            className="mt-4 text-sm text-indigo-600 hover:text-indigo-800 underline"
          >
            Having trouble? Go to landing page
          </button>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Handle SSO callback route */}
      <Route path="/sso-callback">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Completing sign-in...</p>
          </div>
        </div>
      </Route>
      
      {!isSignedIn ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={Landing} />
        </>
      ) : needsOnboarding ? (
        <>
          <Route path="/onboarding" component={Onboarding} />
          <Route component={Onboarding} />
        </>
      ) : (
        <Layout>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/projects" component={Projects} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route path="/landing" component={Landing} />
        </Layout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
