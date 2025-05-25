import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Github, ExternalLink, BookOpen, Play, Pause, Trash2, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProjectDetailDialog from "./project-detail-dialog";

interface ProjectCardProps {
  project: Project;
  rank: number;
}

export default function ProjectCard({ project, rank }: ProjectCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

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

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return "bg-gradient-to-br from-yellow-400 to-orange-500";
    } else if (rank === 2) {
      return "bg-gradient-to-br from-slate-400 to-slate-600";
    } else if (rank === 3) {
      return "bg-gradient-to-br from-amber-500 to-orange-600";
    }
    return "bg-slate-300";
  };

  const updateActivityMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/projects/${project.id}/activity`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Activity updated" });
    },
    onError: () => {
      toast({ title: "Failed to update activity", variant: "destructive" });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/projects/${project.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Project deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (newStatus: string) => 
      apiRequest("PATCH", `/api/projects/${project.id}`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Project status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const handleOpenProject = () => {
    updateActivityMutation.mutate();
    setShowDetail(true);
  };

  const handleToggleStatus = () => {
    const newStatus = project.status === "active" ? "paused" : "active";
    toggleStatusMutation.mutate(newStatus);
  };

  return (
    <>
      <Card className="border-slate-200 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 ${getRankBadge(rank)} rounded-lg text-white font-bold text-lg`}>
              {rank}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">{project.name}</h3>
              <p className="text-slate-600">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(project.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="w-8 h-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleStatus} disabled={toggleStatusMutation.isPending}>
                  {project.status === "active" ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Project
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Resume Project
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteProjectMutation.mutate()} 
                  disabled={deleteProjectMutation.isPending}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <div>
            <p className="text-slate-600 text-sm mb-1">Progress</p>
            <div className="flex items-center space-x-2">
              <Progress value={project.progress} className="flex-1" />
              <span className="text-sm font-medium text-slate-900">{project.progress}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-slate-600 text-sm mb-1">Monthly Cost</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(project.monthlyCost)}</p>
          </div>
          
          <div>
            <p className="text-slate-600 text-sm mb-1">Last Activity</p>
            <p className="text-sm text-slate-900">{formatTimeAgo(project.lastActivity)}</p>
          </div>
          
          <div>
            <p className="text-slate-600 text-sm mb-1">AI Updates</p>
            <div className="flex items-center space-x-1">
              {project.aiUpdates > 0 ? (
                <>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                  <span className="text-sm text-slate-900">{project.aiUpdates} pending</span>
                </>
              ) : (
                <span className="text-sm text-slate-500">None</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                <Github className="w-4 h-4 mr-2" />
                Repository
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            )}
            {project.docsUrl && (
              <a 
                href={project.docsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Docs
              </a>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={handleOpenProject}
              disabled={updateActivityMutation.isPending || project.status === "blocked"}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {project.status === "planning" ? "Start Project" : 
               project.status === "paused" ? "Resume Work" : 
               project.status === "blocked" ? "Blocked" : "Open Project"}
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>

      <ProjectDetailDialog 
        project={project}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </>
  );
}
