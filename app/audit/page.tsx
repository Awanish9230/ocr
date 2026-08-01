'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, Activity, User, FileText, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function AuditLogsPage() {
  const { user } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const res = await api.get('/audit?limit=100');
      return res.data;
    },
    enabled: user?.role === 'Admin',
  });

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 mt-2">You do not have permission to view audit logs.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <Card className="animate-pulse h-[400px] bg-gray-100 dark:bg-zinc-800 border-none" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load audit logs.</div>;
  }

  const logs = data?.logs || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide immutable activity trail.</p>
      </div>
      
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" /> Recent Activity
          </CardTitle>
          <CardDescription>Showing latest 100 events</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-zinc-900/30 border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th scope="col" className="px-6 py-3">Timestamp</th>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                  <th scope="col" className="px-6 py-3">Resource</th>
                  <th scope="col" className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log._id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-zinc-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {log.userId?.name || 'System / Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {log.resource}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          {log.ipAddress || 'Unknown'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
