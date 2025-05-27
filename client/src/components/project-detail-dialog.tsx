import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProjectEditForm from "./project-edit-form";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Github, 
  ExternalLink, 
  BookOpen, 
  Calendar,
  DollarSign,
  TrendingUp,
  Bot,
  Globe,
  Edit
} from "lucide-react";

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailDialog({ project, open, onOpenChange }: ProjectDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Screenshot query
  const { data: screenshotData, isLoading: screenshotLoading } = useQuery({
    queryKey: ["/api/screenshot", project?.liveUrl],
    queryFn: async () => {
      if (!project?.liveUrl) return null;
      const response = await fetch(`/api/screenshot?url=${encodeURIComponent(project.liveUrl)}`);
      if (!response.ok) throw new Error('Failed to capture screenshot');
      const data = await response.json();
      return data.screenshot;
    },
    enabled: !!(project?.liveUrl),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  if (!project) return null;

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-emerald-100 text-emerald-700" },
      paused: { label: "Paused", className: "bg-amber-100 text-amber-700" },
      planning: { label: "Planning", className: "bg-slate-100 text-slate-600" },
      completed: { label: "Completed", className: "bg-blue-100 text-blue-700" },
      blocked: { label: "Blocked", className: "bg-red-100 text-red-700" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planning;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(project.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </Button>
            </div>
          </div>
          <DialogDescription>
            {project.description}
          </DialogDescription>
        </DialogHeader>

        {isEditing ? (
          <div className="space-y-4">
            <ProjectEditForm 
              project={project} 
              onSuccess={() => {
                setIsEditing(false);
                onOpenChange(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="links">Links & Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Project Preview */}
            {project.liveUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Live Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-slate-100 rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <Globe className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Live Preview</p>
                      <p className="text-sm text-slate-500 mt-1">{project.liveUrl}</p>
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        asChild
                      >
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Site
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-slate-600">Progress</p>
                      <p className="text-2xl font-bold">{project.progress}%</p>
                    </div>
                  </div>
                  <Progress value={project.progress} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm text-slate-600">Monthly Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(project.monthlyCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">AI Updates</p>
                      <p className="text-2xl font-bold">{project.aiUpdates}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-slate-600">Last Activity</p>
                      <p className="text-sm font-medium">{formatTimeAgo(project.lastActivity)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-slate-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(project.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Created:</span>
                    <p className="text-sm text-slate-900">{new Date(project.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Last Updated:</span>
                    <p className="text-sm text-slate-900">{formatTimeAgo(project.lastActivity)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Description:</span>
                    <p className="text-slate-700 leading-relaxed mt-1">{project.description}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-slate-600">Progress:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <Progress value={project.progress} className="flex-1" />
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">Monthly Cost:</span>
                    <p className="text-lg font-semibold text-slate-900">{formatCurrency(project.monthlyCost)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600">AI Updates:</span>
                    <p className="text-sm text-slate-900">{project.aiUpdates} pending</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {project.githubUrl && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Github className="w-6 h-6 text-slate-700" />
                        <div>
                          <h3 className="font-medium text-slate-900">GitHub Repository</h3>
                          <p className="text-sm text-slate-600">{project.githubUrl}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.liveUrl && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ExternalLink className="w-6 h-6 text-slate-700" />
                        <div>
                          <h3 className="font-medium text-slate-900">Live Demo</h3>
                          <p className="text-sm text-slate-600">{project.liveUrl}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.docsUrl && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="w-6 h-6 text-slate-700" />
                        <div>
                          <h3 className="font-medium text-slate-900">Documentation</h3>
                          <p className="text-sm text-slate-600">{project.docsUrl}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.docsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!project.githubUrl && !project.liveUrl && !project.docsUrl && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Links Added</h3>
                  <p className="text-slate-600">Add links to your project resources to keep everything organized.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}