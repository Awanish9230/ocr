'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, ExternalLink } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

import { useState } from 'react';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', search, type, status],
    queryFn: async () => {
      const res = await api.get('/documents', { params: { search, type, status } });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-100 dark:bg-zinc-800 border-none h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load documents.</div>;
  }

  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Documents</h1>
        <Link href="/upload" className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-700' })}>
          Upload New
        </Link>
      </div>

      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" /> Document History
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search PAN, GST, etc..."
                  className="pl-9 h-9 w-full sm:w-[250px] rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:border-zinc-800 dark:text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Invoice">Invoice</option>
                <option value="Bank Statement">Bank Statement</option>
                <option value="Salary Slip">Salary Slip</option>
                <option value="Income Tax Return">ITR</option>
                <option value="GST Return">GST Return</option>
                <option value="Balance Sheet">Balance Sheet</option>
              </select>
              <select
                className="h-9 rounded-md border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Validation_Pending">Validation Pending</option>
                <option value="Failed">Failed</option>
                <option value="Processing">Processing</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
                <p className="text-gray-500 text-lg">No documents found. Start by uploading one!</p>
              </div>
            ) : (
              documents.map((doc: any) => (
                <div key={doc._id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{doc.title}</span>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">
                      Type: {doc.documentType} • Confidence: {doc.confidenceScore || 0}% • {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      doc.status === 'Completed' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      doc.status === 'Failed' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      doc.status === 'Validation_Pending' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                      'bg-gray-50 text-gray-600 ring-gray-500/10'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                    <Link href={`/documents/${doc._id || doc.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                      View Details <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
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
