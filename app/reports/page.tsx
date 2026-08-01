'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadCloud, FileSpreadsheet } from 'lucide-react';
import { api } from '@/utils/axios';
import { toast } from 'sonner';

export default function ReportsPage() {
  const handleExport = async (statusFilter?: string) => {
    try {
      toast.info('Preparing export...');
      const url = statusFilter ? `/reports/export?status=${statusFilter}` : '/reports/export';
      
      const response = await api.get(url, { responseType: 'blob' });
      
      // Create a download link for the blob
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export reports');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports & Exports</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              All Documents
            </CardTitle>
            <CardDescription>Export all parsed and raw documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleExport()} className="w-full">
              <DownloadCloud className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              Completed Only
            </CardTitle>
            <CardDescription>Export only successfully parsed documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleExport('Completed')} variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
              <DownloadCloud className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              Pending Review
            </CardTitle>
            <CardDescription>Export documents requiring manual review</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleExport('Validation_Pending')} variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/20">
              <DownloadCloud className="w-4 h-4 mr-2" /> Download CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
