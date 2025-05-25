import { useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Download,
  Upload,
  Trash2,
  Key,
  Globe,
  Mail,
  Smartphone
} from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    projectUpdates: true,
    costAlerts: false,
    weeklyReports: true,
    aiUpdates: true
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    defaultView: "grid",
    sortBy: "lastActivity",
    currency: "USD"
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your SidePilot preferences and account settings</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your full name" defaultValue="Project Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" defaultValue="manager@vibecodehq.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself" defaultValue="Managing awesome VibeCode projects" />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SettingsIcon className="w-5 h-5" />
                  <span>Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Project View</Label>
                    <Select value={preferences.defaultView} onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, defaultView: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid View</SelectItem>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="kanban">Kanban Board</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Default Sort Order</Label>
                    <Select value={preferences.sortBy} onValueChange={(value) => 
                      setPreferences(prev => ({ ...prev, sortBy: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lastActivity">Last Activity</SelectItem>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="aiUpdates">AI Updates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={preferences.currency} onValueChange={(value) => 
                    setPreferences(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Project Updates</Label>
                    <p className="text-sm text-slate-600">Get notified when project status changes</p>
                  </div>
                  <Switch 
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, projectUpdates: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Cost Alerts</Label>
                    <p className="text-sm text-slate-600">Alert when monthly costs exceed budget</p>
                  </div>
                  <Switch 
                    checked={notifications.costAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, costAlerts: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">Weekly Reports</Label>
                    <p className="text-sm text-slate-600">Receive weekly project summary emails</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base">AI Update Notifications</Label>
                    <p className="text-sm text-slate-600">Get notified about AI-generated updates</p>
                  </div>
                  <Switch 
                    checked={notifications.aiUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, aiUpdates: checked }))
                    }
                  />
                </div>

                <div className="pt-4">
                  <Button>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Appearance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="relative cursor-pointer border-2 border-slate-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                      <div className="w-full h-20 bg-white rounded border mb-2"></div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </div>
                    <div className="relative cursor-pointer border-2 border-slate-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                      <div className="w-full h-20 bg-slate-900 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div className="relative cursor-pointer border-2 border-slate-200 rounded-lg p-4 hover:border-indigo-500 transition-colors">
                      <div className="w-full h-20 bg-gradient-to-br from-white to-slate-900 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Auto</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Accent Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500'].map((color, index) => (
                      <div key={index} className={`w-8 h-8 ${color} rounded-full cursor-pointer border-2 border-transparent hover:border-slate-300 transition-colors`}></div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button>Apply Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Connected Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">GH</span>
                    </div>
                    <div>
                      <h3 className="font-medium">GitHub</h3>
                      <p className="text-sm text-slate-600">Sync repository data</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-emerald-600 border-emerald-600">Connected</Badge>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">JR</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Jira</h3>
                      <p className="text-sm text-slate-600">Import project tasks</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">SL</span>
                    </div>
                    <div>
                      <h3 className="font-medium">Slack</h3>
                      <p className="text-sm text-slate-600">Send notifications to channels</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input value="pk_live_••••••••••••••••••••••••••••" readOnly />
                    <Button variant="outline">Regenerate</Button>
                  </div>
                  <p className="text-sm text-slate-600">Use this key to access the ProjectRank API</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Data Export</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-slate-600">Export your project data for backup or migration purposes.</p>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export as JSON
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export as CSV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Data Import</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-slate-600">Import project data from other tools or backup files.</p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Projects
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-700">
                  <Trash2 className="w-5 h-5" />
                  <span>Danger Zone</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-slate-600">Permanently delete all your project data. This action cannot be undone.</p>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}