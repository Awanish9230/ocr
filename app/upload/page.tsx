'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UploadCloud, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('Invoice');
  const router = useRouter();
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Document uploaded and processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      if (data.document.status === 'Validation_Pending') {
        toast.warning('Document requires manual review due to low confidence.');
        router.push(`/review/${data.document._id}`);
      } else {
        router.push('/documents');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to upload document');
    }
  });

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', docType);

    uploadMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Upload Document</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a financial document for AI parsing and data extraction.</p>
      </div>
      
      <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>Select File</CardTitle>
          <CardDescription>Supported formats: PDF, PNG, JPG, JPEG.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <input {...getInputProps()} />
            
            {file ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  Remove file
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your file here
                </p>
                <p className="text-sm text-gray-500">or click to browse from your computer</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="docType">Expected Document Type</Label>
            <select 
              id="docType" 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Invoice">Invoice</option>
              <option value="BankStatement">Bank Statement</option>
              <option value="SalarySlip">Salary Slip / Pay Stub</option>
              <option value="PAN">PAN Card</option>
              <option value="TaxForm">Tax Form (W2, Form16)</option>
              <option value="Unknown">Auto-detect (Slower)</option>
            </select>
          </div>

          <Button 
            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white" 
            onClick={handleUpload}
            disabled={!file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Document (Can take up to 10s)...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Upload & Process with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
