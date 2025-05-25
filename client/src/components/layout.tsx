import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  onNewProject?: () => void;
}

export default function Layout({ children, onNewProject }: LayoutProps) {
  const [location] = useLocation();

  const getNavLinkClass = (path: string) => {
    return location === path
      ? "text-indigo-600 font-medium"
      : "text-slate-600 hover:text-slate-900";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-trophy text-white text-sm"></i>
                </div>
                <h1 className="text-xl font-bold text-slate-900">ProjectRank</h1>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className={getNavLinkClass("/")}>Dashboard</Link>
                <Link href="/projects" className={getNavLinkClass("/projects")}>Projects</Link>
                <Link href="/analytics" className={getNavLinkClass("/analytics")}>Analytics</Link>
                <Link href="/settings" className={getNavLinkClass("/settings")}>Settings</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {onNewProject && (
                <Button 
                  onClick={onNewProject}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              )}
              <div className="w-8 h-8 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}