'use client';

import { useAppStore } from '@/store/useAppStore';
import { Bell, Search, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function Topbar() {
  const { user, logout } = useAppStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Assuming we have an API endpoint to clear cookies
      // await axios.post('/api/auth/logout');
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-zinc-950 dark:border-zinc-800">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden dark:text-zinc-400">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden dark:bg-zinc-800" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 dark:text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm dark:bg-zinc-950 dark:text-white"
            placeholder="Search documents, reports, PAN..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-zinc-300">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:bg-zinc-800" aria-hidden="true" />

          {/* Profile dropdown stub */}
          <div className="flex items-center gap-x-4">
            <span className="hidden lg:flex lg:items-center">
              <span className="text-sm font-semibold leading-6 text-gray-900 dark:text-white" aria-hidden="true">
                {user?.name || 'Guest'}
              </span>
              <span className="ml-2 text-xs font-medium text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {user?.role || 'User'}
              </span>
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
