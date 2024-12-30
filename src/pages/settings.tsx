import type { NextPage } from 'next';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,  
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useSettings } from '@/utils/SettingsContext';

const SettingsPage: NextPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [TeamsNotifications, setTeamsNotifications] = useState(false);
  const { dateFormat, applyDateFormat, darkMode, setDarkMode } = useSettings();

  const handleDateFormatChange = (value: string) => {
    applyDateFormat(value);
  };

  return (
    <div className={`space-y-6 ${darkMode ? 'dark' : ''}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-gray-500">Enable dark theme</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode}/>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={dateFormat}
                    onValueChange={handleDateFormatChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                      <SelectItem value="us">MM/DD/YYYY</SelectItem>
                      <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive change requests and updates via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Slack Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications in Teams
                    </p>
                  </div>
                  <Switch
                    checked={TeamsNotifications}
                    onCheckedChange={setTeamsNotifications}
                  />
                </div>

                {emailNotifications && (
                  <div className="space-y-2">
                    <Label>Notification Email</Label>
                    <Input type="email" placeholder="Enter email address" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Role for New Users</Label>
                  <Select defaultValue="viewer">
                    <SelectTrigger>
                      <SelectValue placeholder="Select default role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Change Manager</SelectItem>
                      <SelectItem value="requester">Change Requester</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Teams Integration</h3>
                      <p className="text-sm text-gray-500">
                        Connect with Teams for notifications
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">PowerBi Integration</h3>
                      <p className="text-sm text-gray-500">
                        Sync with PowerBi
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;