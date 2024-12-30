import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Manage system users and roles</p>
            <Button onClick={() => router.push('/admin/users')}>
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>View all change requests</p>
            <Button onClick={() => router.push('/admin/changes')}>
              View Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Configure system settings</p>
            <Button onClick={() => router.push('/admin/settings')}>
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Changes</h3>
                <p>Total: 0</p>
                <p>Pending: 0</p>
              </div>
              <div>
                <h3 className="font-semibold">Users</h3>
                <p>Total: 0</p>
                <p>Active: 0</p>
              </div>
              <div>
                <h3 className="font-semibold">Activity</h3>
                <p>Today: 0</p>
                <p>This Week: 0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}