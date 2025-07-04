import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, Calendar, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";

interface AIUpdate {
  id: string;
  type: "suggestion" | "optimization" | "fix" | "feature";
  title: string;
  description: string;
  detailedDescription: string;
  impact: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  timestamp: string;
  status: "pending" | "applied" | "dismissed";
}

interface AIUpdatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  updateCount: number;
  onCountChange?: (newCount: number) => void;
}

export default function AIUpdatesDialog({ open, onOpenChange, projectName, updateCount, onCountChange }: AIUpdatesDialogProps) {
  const [selectedUpdate, setSelectedUpdate] = useState<AIUpdate | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Show empty array for zero state - no placeholder data
  const [updates, setUpdates] = useState<AIUpdate[]>([]);

  const handleDismiss = (updateId: string) => {
    const newUpdates = updates.map(update => 
      update.id === updateId ? { ...update, status: "dismissed" as const } : update
    );
    setUpdates(newUpdates);
    
    // Update the count in parent component
    const newPendingCount = newUpdates.filter(update => update.status === "pending").length;
    onCountChange?.(newPendingCount);
  };

  const handleLearnMore = (update: AIUpdate) => {
    setSelectedUpdate(update);
    setDetailModalOpen(true);
  };

  const pendingUpdates = updates.filter(update => update.status === "pending");

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
          {pendingUpdates.length > 0 ? (
            pendingUpdates.map((update) => (
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
                      <Button 
                        size="sm" 
                        onClick={() => handleLearnMore(update)}
                        className="text-xs bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Learn more
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDismiss(update.id)}
                        className="text-xs"
                      >
                        Dismiss
                      </Button>
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

      {/* Detail Modal for Learn More */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span>{selectedUpdate?.title}</span>
              <Badge className={getTypeColor(selectedUpdate?.type || "")}>
                {selectedUpdate?.type.charAt(0).toUpperCase()}{selectedUpdate?.type.slice(1)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedUpdate && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Overview</h3>
                <p className="text-slate-600">{selectedUpdate.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Detailed Analysis</h3>
                <p className="text-slate-600 leading-relaxed">{selectedUpdate.detailedDescription}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-1">Impact</h4>
                  <p className="text-sm text-slate-600">{selectedUpdate.impact}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-1">Difficulty</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedUpdate.difficulty === "easy" ? "default" : selectedUpdate.difficulty === "medium" ? "secondary" : "destructive"}>
                      {selectedUpdate.difficulty.charAt(0).toUpperCase()}{selectedUpdate.difficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-1">Estimated Time</h4>
                  <p className="text-sm text-slate-600">{selectedUpdate.estimatedTime}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleDismiss(selectedUpdate.id);
                    setDetailModalOpen(false);
                  }}
                  variant="outline"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}