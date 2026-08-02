'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { User, ShieldAlert, Trash2, Shield, User as UserIcon, RefreshCcw } from 'lucide-react';
import { api } from '@/utils/axios';
import { toast } from 'sonner';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_email_verified: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const { user } = useAppStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users);
    } catch (e) {
      console.error(e);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.detail || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.detail || 'Failed to delete user');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 mt-2">You do not have permission to view user management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system users and their roles.</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Active Users
          </CardTitle>
          <CardDescription>View and manage all registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 py-4">Loading users...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Joined</th>
                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {u.name} {u.id === user.id && <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">You</span>}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                          u.role === 'Analyst' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role === 'Admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {u.role !== 'Admin' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRoleChange(u.id, 'Admin')}
                            disabled={u.id === user.id}
                          >
                            Make Admin
                          </Button>
                        )}
                        {u.role === 'Admin' && u.id !== user.id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRoleChange(u.id, 'User')}
                          >
                            Revoke Admin
                          </Button>
                        )}
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
