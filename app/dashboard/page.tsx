'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-100 dark:bg-zinc-800 border-none h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load dashboard data.</div>;
  }

  const { stats, recentUploads, charts } = data;

  const statCards = [
    { title: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'text-indigo-600' },
    { title: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle, color: 'text-emerald-500' },
    { title: 'Pending Review', value: stats.pendingReviewDocs, icon: AlertTriangle, color: 'text-amber-500' },
    { title: 'Failure Rate', value: `${stats.failureRate}%`, icon: XCircle, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Monthly Uploads</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyUploads}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Document Types</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {charts.documentTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.documentTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.documentTypes.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUploads.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent uploads.</p>
            ) : (
              recentUploads.map((doc: any) => (
                <div key={doc._id} className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.title}</span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                      {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      doc.status === 'Completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      doc.status === 'Failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      doc.status === 'Validation_Pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                      'bg-gray-50 text-gray-600 ring-gray-500/10'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
