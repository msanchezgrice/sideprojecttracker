import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  onSuccess: () => void;
}

export default function ProjectForm({ onSuccess }: ProjectFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      progress: 0,
      monthlyCost: 0,
      aiUpdates: 0,
      githubUrl: "",
      liveUrl: "",
      docsUrl: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Project created successfully" });
      onSuccess();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create project", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    // Convert dollar amounts to cents
    const formattedData = {
      ...data,
      monthlyCost: Math.round((data.monthlyCost || 0) * 100),
      githubUrl: data.githubUrl || undefined,
      liveUrl: data.liveUrl || undefined,
      docsUrl: data.docsUrl || undefined,
    };
    createProjectMutation.mutate(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what this project is about..."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress (%)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    max="100" 
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthlyCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Cost ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Links (Optional)</h3>
          
          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Repository</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/username/repo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="liveUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Live Demo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://myproject.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="docsUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documentation URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://docs.myproject.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createProjectMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
