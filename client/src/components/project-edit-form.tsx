import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type Project, type InsertProject } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface ProjectEditFormProps {
  project: Project;
  onSuccess: () => void;
}

export default function ProjectEditForm({ project, onSuccess }: ProjectEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertProject>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status as "planning" | "active" | "paused" | "completed" | "blocked",
      progress: project.progress,
      monthlyCost: Math.round(project.monthlyCost / 100), // Convert cents to dollars
      aiUpdates: project.aiUpdates,
      githubUrl: project.githubUrl || "",
      liveUrl: project.liveUrl || "",
      docsUrl: project.docsUrl || "",
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: InsertProject) => 
      apiRequest("PUT", `/api/projects/${project.id}`, data),
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Your project has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProject) => {
    // Convert dollars back to cents for storage
    const updatedData = {
      ...data,
      monthlyCost: data.monthlyCost * 100
    };
    updateProjectMutation.mutate(updatedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                      <SelectValue />
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
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progress ({field.value}%)</FormLabel>
                <FormControl>
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={100}
                    step={5}
                    className="mt-2"
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
                    {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Links & Resources</h3>
          
          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub Repository</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/..." {...field} />
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
                  <Input placeholder="https://..." {...field} />
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
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateProjectMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {updateProjectMutation.isPending ? "Updating..." : "Update Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}