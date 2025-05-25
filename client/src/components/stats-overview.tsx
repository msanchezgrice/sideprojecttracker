import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, DollarSign, TrendingUp, Bot } from "lucide-react";

interface Stats {
  activeProjects: number;
  totalCost: number;
  avgProgress: number;
  pendingAiUpdates: number;
}

export default function StatsOverview() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-20 bg-slate-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  const statCards = [
    {
      title: "Active Projects",
      value: stats.activeProjects.toString(),
      icon: Rocket,
      change: "+2 this week",
      changeType: "positive" as const,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalCost),
      icon: DollarSign,
      change: "This month",
      changeType: "neutral" as const,
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Avg Progress",
      value: `${stats.avgProgress}%`,
      icon: TrendingUp,
      change: "+12% vs last month",
      changeType: "positive" as const,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "AI Updates",
      value: stats.pendingAiUpdates.toString(),
      icon: Bot,
      change: "Pending review",
      changeType: "neutral" as const,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} w-6 h-6`} />
              </div>
            </div>
            <div className="mt-4">
              <span 
                className={`text-sm font-medium ${
                  stat.changeType === "positive" 
                    ? "text-emerald-600" 
                    : "text-slate-600"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
