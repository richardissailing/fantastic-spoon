import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  Settings,
  FileText,
  Kanban
} from 'lucide-react';
import { useSettings } from '@/utils/SettingsContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  {
    icon: ListTodo,
    label: 'Changes',
    href: '/changes',
    subItems: [
      { icon: ListTodo, label: 'List View', href: '/changes/list' },
      { icon: Kanban, label: 'Kanban Board', href: '/changes/kanban' },
      { icon: PlusCircle, label: 'New Change', href: '/changes/new' },
    ]
  },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const Sidebar = () => {
  const router = useRouter();
  const { darkMode } = useSettings();

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === href;
    }
    return router.pathname.startsWith(href);
  };

  const isSubActive = (href: string) => router.pathname === href;

  return (
    <div className={`
      w-64 min-h-screen
      border-r
      bg-background
      transition-colors duration-200
    `}>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">CMS</h1>
      </div>
      <nav className="mt-5 px-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <div key={item.href}>
              {item.subItems ? (
                <>
                  <div
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      transition-colors duration-200
                      ${active
                        ? 'bg-secondary text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                      }
                    `}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </div>
                  <div className="ml-6 space-y-1">
                    {item.subItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const subActive = isSubActive(subItem.href);
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`
                            group flex items-center px-2 py-2 text-sm font-medium rounded-md
                            transition-colors duration-200
                            ${subActive
                              ? 'bg-secondary text-secondary-foreground'
                              : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                            }
                          `}
                        >
                          <SubIcon className="mr-3 h-4 w-4" />
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md
                    transition-colors duration-200
                    ${active
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;