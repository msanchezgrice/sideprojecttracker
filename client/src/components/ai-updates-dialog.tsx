import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Calendar, CheckCircle, AlertCircle } from "lucide-react";

interface AIUpdate {
  id: string;
  type: "suggestion" | "optimization" | "fix" | "feature";
  title: string;
  description: string;
  timestamp: string;
  status: "pending" | "applied" | "dismissed";
}

interface AIUpdatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  updateCount: number;
}

export default function AIUpdatesDialog({ open, onOpenChange, projectName, updateCount }: AIUpdatesDialogProps) {
  // Mock AI updates data - in a real app this would come from your API
  const aiUpdates: AIUpdate[] = [
    {
      id: "1",
      type: "optimization" as const,
      title: "Database Query Optimization",
      description: "Consider adding an index on the 'user_id' column to improve query performance by 40%",
      timestamp: "2 hours ago",
      status: "pending" as const
    },
    {
      id: "2", 
      type: "suggestion" as const,
      title: "Code Refactoring Opportunity",
      description: "The UserService class could be split into smaller, more focused services for better maintainability",
      timestamp: "5 hours ago",
      status: "pending" as const
    },
    {
      id: "3",
      type: "fix" as const,
      title: "Security Vulnerability",
      description: "Update JWT token expiration to 15 minutes for better security",
      timestamp: "1 day ago",
      status: "applied" as const
    },
    {
      id: "4",
      type: "feature" as const,
      title: "UI Enhancement",
      description: "Add loading states to improve user experience during API calls",
      timestamp: "2 days ago",
      status: "dismissed" as const
    }
  ].slice(0, updateCount);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "optimization": return "bg-blue-100 text-blue-800";
      case "suggestion": return "bg-green-100 text-green-800";
      case "fix": return "bg-red-100 text-red-800";
      case "feature": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "dismissed": return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default: return <Bot className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>AI Updates for {projectName}</span>
            <Badge variant="secondary">{updateCount}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {aiUpdates.length > 0 ? (
            aiUpdates.map((update) => (
              <Card key={update.id} className="border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(update.status)}
                      <Badge className={getTypeColor(update.type)}>
                        {update.type.charAt(0).toUpperCase() + update.type.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {update.timestamp}
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-slate-900 mb-2">{update.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{update.description}</p>
                  
                  {update.status === "pending" && (
                    <div className="flex space-x-2 mt-3">
                      <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
                        Apply
                      </button>
                      <button className="text-xs bg-slate-200 text-slate-700 px-3 py-1 rounded-md hover:bg-slate-300 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No AI Updates</h3>
              <p className="text-slate-600">All caught up! AI will continue monitoring your project.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}