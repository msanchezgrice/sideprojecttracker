import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser, UserButton, useClerk } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
  onNewProject?: () => void;
}

export default function Layout({ children, onNewProject }: LayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Logged out successfully" });
    } catch (error) {
      toast({ title: "Logout failed", variant: "destructive" });
    }
  };

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
                <h1 className="text-xl font-bold text-slate-900">Doodad.ai</h1>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={user?.email || ""} />
                      <AvatarFallback>
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName && user?.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user?.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="flex items-center cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{logoutMutation.isPending ? "Logging out..." : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}