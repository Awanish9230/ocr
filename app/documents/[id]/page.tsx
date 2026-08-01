'use client';

import { useState } from 'react';
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

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const [editedData, setEditedData] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['document', params.id],
    queryFn: async () => {
      const res = await api.get(`/documents/${params.id}`);
      const doc = res.data;
      if (doc && !editedData) {
        setEditedData(doc.extracted_data || {});
      }
      return doc;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { extracted_data: any }) => {
      return api.put(`/documents/${params.id}`, payload);
    },
    onSuccess: () => {
      toast.success('Document updated successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', params.id] });
      router.push('/documents');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update document');
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading document details...</div>;
  if (!data) return <div className="p-8 text-center">Document not found.</div>;

  const handleSave = () => {
    updateMutation.mutate({ extracted_data: editedData });
  };

  const updateField = (key: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [key]: value }));
  };
  
  const canEdit = data.status === 'Completed' || data.status === 'Validation_Pending';

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
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z_])/g, ' $1').trim()}</Label>
                  <Input 
                    id={key}
                    value={editedData[key]} 
                    onChange={(e) => updateField(key, e.target.value)} 
                    disabled={!canEdit}
                  />
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
