import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, BarChart, Bot, DollarSign, GitBranch, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [showGuestLogin, setShowGuestLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const guestLoginMutation = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiRequest("POST", "/api/auth/guest-login", credentials),
    onSuccess: () => {
      toast({ title: "Welcome to SidePilot!", description: "Successfully logged in" });
      window.location.reload();
    },
    onError: () => {
      toast({ title: "Login failed", description: "Invalid credentials", variant: "destructive" });
    },
  });

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    guestLoginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">SidePilot</span>
          </div>
          <Button onClick={handleGetStarted} variant="outline">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            All Your Projects.<br />
            One Dashboard.<br />
            Your AI Co‑Pilot for Code Projects.
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tired of losing track of side projects or digging through scattered docs? SidePilot brings 
            everything together in one place, with an AI assistant to help your projects soar. It's the 
            ultimate control center for solo developers managing multiple code-based projects.
          </p>

          <div className="flex flex-col items-center space-y-4">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4"
            >
              Get Started – It's Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button 
              onClick={() => setShowGuestLogin(!showGuestLogin)}
              variant="outline"
              size="lg" 
              className="text-lg px-8 py-4"
            >
              Try Guest Demo
            </Button>
          </div>

          {showGuestLogin && (
            <Card className="max-w-md mx-auto mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Guest Login</h3>
                <form onSubmit={handleGuestLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Try: guest@sidepilot.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Try: password123"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={guestLoginMutation.isPending}
                  >
                    {guestLoginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium">Demo Accounts:</p>
                  <p>guest@sidepilot.com / password123</p>
                  <p>demo@doodad.ai / demo123</p>
                  <p>test@sidepilot.com / test123</p>
                  <p>user1@sidepilot.com / user123</p>
                  <p>user2@sidepilot.com / user123</p>
                  <p>admin@doodad.ai / admin123</p>
                  <p>developer@sidepilot.com / dev123</p>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-sm text-gray-500 mt-4">
            By clicking Get Started, you'll connect your first project in seconds – and finally have the clarity you've been missing.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Ready to bring order to your project chaos?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <BarChart className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">🗂 Unified Project Portfolio</h3>
                <p className="text-gray-600">
                  View all your projects at a glance on a single dashboard – no more pieces spread across 
                  multiple apps or forgotten in a drawer. SidePilot keeps your repos, docs, and key info 
                  neatly organized by project.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <GitBranch className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">🔗 Integrated with Your Tools</h3>
                <p className="text-gray-600">
                  Connect your GitHub and Notion (more integrations coming) to automatically sync code 
                  commits, docs, and notes. No manual copy-paste – changes in your tools reflect in 
                  SidePilot in real time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Bot className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">🤖 Proactive AI Assistant</h3>
                <p className="text-gray-600">
                  Let the AI monitor your projects and alert you with helpful insights. It'll remind you 
                  when a project's gone stale, suggest updates (e.g. "Dependency XYZ has a new version"), 
                  and even summarize progress after a burst of commits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <BarChart className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">📊 Track Progress & Status</h3>
                <p className="text-gray-600">
                  Know exactly where each project stands. SidePilot shows project status, recent activity, 
                  and progress metrics so you can easily decide "what's next." A leaderboard can rank 
                  projects by last touched or furthest along.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">💰 Monitor Spending</h3>
                <p className="text-gray-600">
                  Keep an eye on expenses for each project – hosting fees, SaaS subscriptions, domain 
                  renewals – all in one spot. SidePilot aggregates your project costs so you won't be 
                  surprised by bills.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-indigo-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">⚡ Ship Faster</h3>
                <p className="text-gray-600">
                  Turn your project backlog into a motivational overview. Set budget alerts, see which 
                  project is burning the most cash, and get AI-powered recommendations to keep momentum going.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to bring order to your project chaos?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Start your free trial of SidePilot today and let your new co-pilot help you ship faster.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started – It's Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
}