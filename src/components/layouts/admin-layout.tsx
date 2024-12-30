import { useAuth } from '@/context/auth-context';
import { Role } from '@prisma/client';
import { useRouter } from 'next/router';
import { Settings, Users, FileText, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <FileText className="w-4 h-4" />,
      href: '/admin/dashboard'
    },
    {
      title: 'Users',
      icon: <Users className="w-4 h-4" />,
      href: '/admin/users'
    },
    {
      title: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      href: '/admin/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 ${
                      router.pathname === item.href ? 'bg-gray-100' : ''
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t">
            <button
              onClick={logout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
}