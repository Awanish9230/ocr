'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { api } from '@/utils/axios';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export default function SettingsPage() {
  const { user, setUser } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const updateMutation = useMutation({
    mutationFn: async (payload: { name: string, email: string }) => {
      const res = await api.put('/auth/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setUser(data);
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    }
  });

  const handleSave = () => {
    updateMutation.mutate({ name, email });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="pt-4">
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
