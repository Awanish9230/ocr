'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Check, X, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ReviewDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editedData, setEditedData] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['document', params.id],
    queryFn: async () => {
      // Need an API route to fetch a single doc. Assuming /api/documents/[id] exists.
      // Wait, we didn't create GET /api/documents/[id]. We can fetch all and filter for now
      // or assume we'll create it. Let's assume /api/documents returns a list and we can filter, 
      // or we just rely on /api/documents and filter in client (not ideal but works for mockup).
      // Let's assume we create a quick /api/documents/[id] route later.
      const res = await api.get('/documents');
      const doc = res.data.documents.find((d: any) => d._id === params.id);
      if (doc && !editedData) {
        const initialData = { ...(doc.extractedData || {}) };
        for (const key in initialData) {
          if (typeof initialData[key] === 'object' && initialData[key] !== null) {
            initialData[key] = JSON.stringify(initialData[key], null, 2);
          }
        }
        setEditedData(initialData);
      }
      return doc;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (payload: { action: 'approve' | 'reject'; extractedData?: any; remarks?: string }) => {
      return api.put(`/documents/${params.id}/review`, payload);
    },
    onSuccess: () => {
      toast.success('Document review saved successfully');
      queryClient.invalidateQueries({ queryKey: ['documents-pending-review'] });
      router.push('/review');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  });

  if (isLoading) return <div>Loading document details...</div>;
  if (!data) return <div>Document not found.</div>;

  const handleApprove = () => {
    const payload = { ...editedData };
    for (const key in payload) {
      if (typeof payload[key] === 'string' && (payload[key].trim().startsWith('[') || payload[key].trim().startsWith('{'))) {
        try {
          payload[key] = JSON.parse(payload[key]);
        } catch (e) {}
      }
    }
    reviewMutation.mutate({ action: 'approve', extractedData: payload });
  };

  const handleReject = () => {
    if (!remarks.trim()) {
      toast.error('Please provide remarks for rejection.');
      return;
    }
    reviewMutation.mutate({ action: 'reject', remarks });
  };

  const updateField = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  };

  const renderField = (key: string) => {
    const isString = typeof editedData[key] === 'string';
    let parsedArray = null;
    if (isString && editedData[key].trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(editedData[key]);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
          parsedArray = parsed;
        }
      } catch (e) {}
    }

    if (parsedArray) {
      const columns = Object.keys(parsedArray[0]);
      return (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-zinc-800 mt-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500">
              <tr>
                {columns.map(col => <th key={col} className="px-3 py-2 capitalize font-medium">{col.replace(/_/g, ' ')}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {parsedArray.map((row: any, i: number) => (
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col} className="p-1">
                      <Input
                        value={row[col] !== undefined && row[col] !== null ? String(row[col]) : ''}
                        onChange={(e) => {
                          const newArr = [...parsedArray];
                          newArr[i] = { ...newArr[i], [col]: e.target.value };
                          updateField(key, JSON.stringify(newArr, null, 2));
                        }}
                        className="h-8 px-2 min-w-[100px] bg-transparent border-transparent hover:border-gray-200 focus:bg-white dark:focus:bg-zinc-950"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (isString && (editedData[key].trim().startsWith('{') || editedData[key].includes('\n'))) {
      return (
        <textarea
          id={key}
          value={editedData[key]}
          onChange={(e) => updateField(key, e.target.value)}
          className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 font-mono mt-1"
        />
      );
    }

    return (
      <Input 
        id={key}
        value={editedData[key] !== null && editedData[key] !== undefined ? String(editedData[key]) : ''} 
        onChange={(e) => updateField(key, e.target.value)} 
        className="mt-1"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/review" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Review: {data.title}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original Document</CardTitle>
            <CardDescription>Click below to open the full image/PDF</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center border-t border-gray-100 p-6 bg-gray-50 dark:bg-zinc-900/50 min-h-[400px]">
            <a href={data.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline' })}>
              View Original File <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extracted Data & Validation</CardTitle>
            <CardDescription>
              Confidence: {data.confidenceScore}%
              <br/>
              <span className="text-red-500 text-sm">
                Issues: {Object.entries(data.validationErrors || {}).map(([k, v]) => `${k}: ${v}`).join(' | ')}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editedData && Object.keys(editedData).map((key) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={key} className="capitalize font-semibold text-gray-900 dark:text-gray-100">{key.replace(/([A-Z_])/g, ' $1').trim()}</Label>
                {renderField(key)}
              </div>
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-2 mt-6">
              <Label htmlFor="remarks">Remarks (Required for rejection)</Label>
              <Input 
                id="remarks"
                placeholder="Why is this being rejected?"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="destructive" onClick={handleReject} disabled={reviewMutation.isPending}>
                <X className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={reviewMutation.isPending}>
                <Check className="w-4 h-4 mr-2" /> Approve & Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
