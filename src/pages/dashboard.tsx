import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Role } from '@prisma/client';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on role
    if (user?.role === Role.ADMIN) {
      router.push('/admin/dashboard');
    } else if (user?.role === Role.MANAGER) {
      router.push('/manager/dashboard');
    }
  }, [user, router]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage your change requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>See your recent activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Update your profile settings</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}