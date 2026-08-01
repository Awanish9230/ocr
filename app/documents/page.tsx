'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, ExternalLink } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';

export default function DocumentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">My Documents</h1>
        <Link href="/upload" className={buttonVariants({ className: 'bg-indigo-600 hover:bg-indigo-700' })}>
          Upload New
        </Link>
      </div>
      
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" /> Document History
          </CardTitle>
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
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                      View File <ExternalLink className="ml-2 w-4 h-4" />
                    </a>
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
