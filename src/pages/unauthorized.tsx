import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Button
          onClick={() => router.push(user ? '/dashboard' : '/login')}
          className="mx-auto"
        >
          Go to {user ? 'Dashboard' : 'Login'}
        </Button>
      </div>
    </div>
  );
}