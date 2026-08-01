'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { User, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  const { user } = useAppStore();

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 mt-2">You do not have permission to view user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage system users and their roles.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Active Users
          </CardTitle>
          <CardDescription>This feature is a placeholder. API integration required.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Coming soon in next iteration.</p>
        </CardContent>
      </Card>
    </div>
  );
}
