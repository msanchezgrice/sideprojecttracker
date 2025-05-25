import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Grid, List, Calendar, TrendingUp, DollarSign, Filter } from "lucide-react";

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">All Projects</h1>
          <p className="text-slate-600">Manage and monitor all your VibeCode projects</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "active", "paused", "planning", "completed", "blocked"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active ({projects.filter(p => p.status === "active").length})</TabsTrigger>
            <TabsTrigger value="archived">Completed ({projects.filter(p => p.status === "completed").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="border-slate-200 hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-slate-600 text-sm">{project.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="flex items-center text-slate-600 mb-1">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Cost
                            </div>
                            <p className="font-medium">{formatCurrency(project.monthlyCost)}/mo</p>
                          </div>
                          <div>
                            <div className="flex items-center text-slate-600 mb-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Updated
                            </div>
                            <p className="font-medium text-xs">
                              {new Date(project.lastActivity).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="border-slate-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold">{project.name}</h3>
                            {getStatusBadge(project.status)}
                          </div>
                          <p className="text-slate-600 mb-3">{project.description}</p>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-1 text-indigo-600" />
                              {project.progress}% complete
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1 text-amber-600" />
                              {formatCurrency(project.monthlyCost)}/month
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-slate-600" />
                              Updated {new Date(project.lastActivity).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="w-32">
                          <Progress value={project.progress} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status === "active").map((project) => (
                <Card key={project.id} className="border-emerald-200 bg-emerald-50/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-emerald-900">{project.name}</CardTitle>
                    <p className="text-emerald-700 text-sm">{project.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={project.progress} className="bg-emerald-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-700">{project.progress}% Complete</span>
                        <span className="text-emerald-700">{formatCurrency(project.monthlyCost)}/mo</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status === "completed").map((project) => (
                <Card key={project.id} className="border-blue-200 bg-blue-50/30">
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-900">{project.name}</CardTitle>
                    <p className="text-blue-700 text-sm">{project.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={100} className="bg-blue-100" />
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700">Completed</span>
                        <span className="text-blue-700">
                          {new Date(project.lastActivity).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
}