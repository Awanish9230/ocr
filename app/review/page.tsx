'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { FileText, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReviewListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['documents-pending-review'],
    queryFn: async () => {
      const res = await api.get('/documents?status=Validation_Pending');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Manual Review</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-gray-100 dark:bg-zinc-800 border-none h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Failed to load documents for review.</div>;
  }

  const documents = data?.documents || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Manual Review Queue</h1>
        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
          {documents.length} pending
        </span>
      </div>
      
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" /> Documents Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-zinc-600 mb-3" />
                <p className="text-gray-500 text-lg">Great job! The review queue is empty.</p>
              </div>
            ) : (
              documents.map((doc: any) => (
                <div key={doc._id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 dark:border-zinc-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{doc.title}</span>
                    <span className="text-sm text-gray-500 dark:text-zinc-400">
                      Type: {doc.documentType} • Confidence: {doc.confidenceScore}%
                    </span>
                    <div className="text-xs text-red-500 mt-1">
                      Issues: {Object.keys(doc.validationErrors || {}).join(', ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/review/${doc._id}`} className={buttonVariants({ variant: 'outline' })}>
                      Review <ExternalLink className="ml-2 w-4 h-4" />
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
