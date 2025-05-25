import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, CheckCircle, HelpCircle, Rocket, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema, type InsertProject } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const steps = [
  {
    title: "Welcome to SidePilot! 🚀",
    description: "Let's create your first project to get you started",
  },
  {
    title: "Project Basics",
    description: "Tell us about your project",
  },
  {
    title: "Project Status",
    description: "Help us understand where you are",
  },
  {
    title: "Resources & Links",
    description: "Connect your project resources",
  },
  {
    title: "You're All Set! 🎉",
    description: "Your first project is ready",
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({
        title: "Project created!",
        description: "Welcome to SidePilot! Your first project has been added to your dashboard.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setCurrentStep(4);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: InsertProject) => {
    createProjectMutation.mutate(data);
  };

  const goToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-indigo-600 mr-2" />
            <span className="text-2xl font-bold text-gray-900">SidePilot</span>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <Rocket className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to organize your projects?</h3>
                    <p className="text-gray-600">
                      We'll help you add your first project and show you how SidePilot can transform 
                      your development workflow. This should only take 2-3 minutes.
                    </p>
                  </div>
                  <Button onClick={nextStep} className="bg-indigo-600 hover:bg-indigo-700">
                    Let's Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Project Name
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Awesome Project" 
                            {...field} 
                            className="text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Give your project a memorable name. This is what you'll see on your dashboard.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Description
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="A brief description of what this project does..." 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          Help future you remember what this project is about. A few sentences is perfect.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!form.watch("name") || !form.watch("description")}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Current Status
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planning">📋 Planning - Still figuring things out</SelectItem>
                              <SelectItem value="active">🚀 Active - Actively working on it</SelectItem>
                              <SelectItem value="paused">⏸️ Paused - Taking a break</SelectItem>
                              <SelectItem value="completed">✅ Completed - It's done!</SelectItem>
                              <SelectItem value="blocked">🚫 Blocked - Stuck on something</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          This helps us understand where you are and provide relevant AI insights.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="progress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Progress: {field.value}%
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                          />
                        </FormControl>
                        <FormDescription>
                          Rough estimate is fine! This helps prioritize which projects need attention.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monthlyCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Monthly Cost (USD)
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Include hosting, domains, services, etc. We'll help you track spending across projects.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Optional:</strong> Add links to keep everything connected. 
                      You can always add these later from your dashboard.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="githubUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          GitHub Repository
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://github.com/username/repo" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link your code repository so you can jump to it quickly.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="liveUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Live Demo/Website
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://myproject.com" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          If your project is deployed, add the live URL here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="docsUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Documentation
                          <HelpCircle className="w-4 h-4 ml-1 text-gray-400" />
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://docs.myproject.com" 
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to your project docs, Notion page, or README.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex space-x-3">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createProjectMutation.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                      <Rocket className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="text-center space-y-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Welcome to SidePilot! 🎉</h3>
                    <p className="text-gray-600">
                      Your first project has been created. You can now:
                    </p>
                    <ul className="text-sm text-gray-600 mt-4 space-y-1">
                      <li>• View all projects on your dashboard</li>
                      <li>• Get AI-powered insights and suggestions</li>
                      <li>• Track progress and costs across projects</li>
                      <li>• Add more projects anytime</li>
                    </ul>
                  </div>
                  <Button onClick={goToDashboard} className="bg-indigo-600 hover:bg-indigo-700">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}