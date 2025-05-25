import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";

export default function Analytics() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Calculate analytics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "active").length;
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
    : 0;
  
  const totalCost = projects.reduce((sum, p) => sum + p.monthlyCost, 0);
  const avgCostPerProject = totalProjects > 0 ? totalCost / totalProjects : 0;
  
  const projectsByStatus = {
    active: projects.filter(p => p.status === "active").length,
    paused: projects.filter(p => p.status === "paused").length,
    planning: projects.filter(p => p.status === "planning").length,
    completed: projects.filter(p => p.status === "completed").length,
    blocked: projects.filter(p => p.status === "blocked").length,
  };

  const formatCurrency = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const topPerformers = projects
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  const costAnalysis = projects
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 5);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Insights and metrics for your project portfolio</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Total Projects</p>
                  <p className="text-3xl font-bold text-slate-900">{totalProjects}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-emerald-600 font-medium">
                  {completedProjects} completed
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Avg Progress</p>
                  <p className="text-3xl font-bold text-slate-900">{avgProgress}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="mt-4">
                <Progress value={avgProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Total Monthly Cost</p>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalCost)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-slate-600">
                  {formatCurrency(avgCostPerProject)} avg per project
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold text-slate-900">{activeProjects}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-slate-600">
                  {Math.round((activeProjects / totalProjects) * 100)}% of portfolio
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Project Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Project Status Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(projectsByStatus).map(([status, count]) => {
                      const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                      const statusColors = {
                        active: "bg-emerald-500",
                        paused: "bg-amber-500", 
                        planning: "bg-slate-500",
                        completed: "bg-blue-500",
                        blocked: "bg-red-500"
                      };
                      
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                            <span className="capitalize text-sm font-medium">{status}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 w-8">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects
                      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
                      .slice(0, 5)
                      .map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{project.name}</p>
                            <p className="text-xs text-slate-600">
                              Last updated {new Date(project.lastActivity).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{project.progress}%</p>
                            <div className="w-16 bg-slate-200 rounded-full h-1 mt-1">
                              <div 
                                className="bg-indigo-500 h-1 rounded-full"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Top Performing Projects</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((project, index) => (
                    <div key={project.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-sm text-slate-600">{project.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{project.progress}%</p>
                        <p className="text-xs text-slate-500">{formatCurrency(project.monthlyCost)}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Cost Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {costAnalysis.map((project, index) => {
                    const percentage = (project.monthlyCost / totalCost) * 100;
                    return (
                      <div key={project.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{project.name}</h3>
                          <div className="flex items-center space-x-2 mt-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-amber-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600">{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold">{formatCurrency(project.monthlyCost)}</p>
                          <p className="text-xs text-slate-500">per month</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Progress Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Progress tracking over time</p>
                      <p className="text-sm text-slate-500 mt-2">Coming soon - Historical data visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Activity Heatmap</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Project activity patterns</p>
                      <p className="text-sm text-slate-500 mt-2">Coming soon - Activity visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}