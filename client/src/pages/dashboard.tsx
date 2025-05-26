import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Project } from "@shared/schema";
import StatsOverview from "@/components/stats-overview";
import FilterControls from "@/components/filter-controls";
import ProjectCard from "@/components/project-card";
import ProjectForm from "@/components/project-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

type SortOption = "lastActivity" | "progress" | "cost" | "aiUpdates";

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<SortOption>("lastActivity");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects", sortBy],
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b border-slate-200" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-slate-200">
                  <div className="h-20 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 font-inter">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage and track your development projects</p>
          </div>
          <Button 
            onClick={() => setIsProjectFormOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        
        <StatsOverview />

        {/* Filter Controls */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-slate-900">Project Leaderboard</h2>
            <div className="flex flex-wrap gap-3 items-center">
              <FilterControls sortBy={sortBy} onSortChange={setSortBy} />
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Project Leaderboard */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
              <p className="text-slate-600 mb-4">
                {searchQuery ? "Try adjusting your search query" : "Get started by creating your first project"}
              </p>
              <Button onClick={() => setIsProjectFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} rank={index + 1} />
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setIsProjectFormOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* Project Form Dialog */}
      <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSuccess={() => setIsProjectFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
