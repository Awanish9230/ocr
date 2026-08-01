'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  BarChart, 
  ShieldAlert, 
  Settings,
  Users
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const getNavigation = (role: string = 'User') => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/upload', icon: UploadCloud },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  if (role === 'Admin' || role === 'Analyst') {
    baseNavigation.push(
      { name: 'Manual Review', href: '/review', icon: CheckCircle },
      { name: 'Reports', href: '/reports', icon: BarChart }
    );
  }

  if (role === 'Admin') {
    baseNavigation.push(
      { name: 'User Management', href: '/admin/users', icon: Users },
      { name: 'Audit Logs', href: '/audit', icon: ShieldAlert },
      { name: 'Settings', href: '/settings', icon: Settings }
    );
  }

  return baseNavigation;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppStore();
  const navigation = getNavigation(user?.role);

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 dark:bg-zinc-950 dark:border-zinc-800">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">AutoParse</span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 h-5 w-5 shrink-0 transition-colors
                    ${isActive ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-zinc-500 dark:group-hover:text-zinc-300'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
