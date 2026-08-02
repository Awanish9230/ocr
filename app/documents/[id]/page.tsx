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
import { Check, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';

export default function DocumentDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const [editedData, setEditedData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const res = await api.get(`/documents/${id}`);
      const doc = res.data;
      if (doc && !editedData) {
        const initialData = { ...(doc.extracted_data || {}) };
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

  const updateMutation = useMutation({
    mutationFn: async (payload: { extracted_data: any }) => {
      return api.put(`/documents/${id}`, payload);
    },
    onSuccess: () => {
      toast.success('Document updated successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      router.push('/documents');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading document details...</div>;
  if (!data) return <div className="p-8 text-center">Document not found.</div>;

  const handleSave = () => {
    const payload = { ...editedData };
    for (const key in payload) {
      if (typeof payload[key] === 'string' && (payload[key].trim().startsWith('[') || payload[key].trim().startsWith('{'))) {
        try {
          payload[key] = JSON.parse(payload[key]);
        } catch (e) {}
      }
    }
    updateMutation.mutate({ extracted_data: payload });
  };

  const updateField = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  };
  
  const canEdit = data.status === 'Completed' || data.status === 'Validation_Pending';

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
                        disabled={!canEdit}
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
          disabled={!canEdit}
          className="flex min-h-[120px] w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 font-mono mt-1"
        />
      );
    }

    return (
      <Input 
        id={key}
        value={editedData[key] !== null && editedData[key] !== undefined ? String(editedData[key]) : ''} 
        onChange={(e) => updateField(key, e.target.value)} 
        disabled={!canEdit}
        className="mt-1"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Documents
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{data.title} Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original File</CardTitle>
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
            <CardTitle>Extracted Data</CardTitle>
            <CardDescription>
              Status: <span className="font-semibold">{data.status}</span>
              {data.confidence_score !== null && ` • Confidence: ${data.confidence_score}%`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editedData && Object.keys(editedData).length > 0 ? (
              Object.keys(editedData).map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="capitalize font-semibold text-gray-900 dark:text-gray-100">{key.replace(/([A-Z_])/g, ' $1').trim()}</Label>
                  {renderField(key)}
                </div>
              ))
            ) : (
              <div className="text-gray-500 py-4 text-center">
                {data.status === 'Processing' ? 'Data is currently being extracted...' : 'No extracted data available.'}
              </div>
            )}

            {canEdit && (
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-zinc-800">
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleSave} disabled={updateMutation.isPending}>
                  <Check className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
