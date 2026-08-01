'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show sidebar/topbar on public routes like login or register
  const isPublicRoute = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname === '/';

  if (isPublicRoute) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        {children}
        <Toaster richColors position="top-right" />
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-900">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
