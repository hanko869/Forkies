'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface UserDetails {
  id: string;
  email?: string;
  username?: string;
  name: string;
  role: 'admin' | 'user';
  preferred_provider?: 'twilio' | 'signalwire';
  created_at: string;
  user_credits?: {
    sms_credits: number;
    voice_credits: number;
  }[];
  phone_numbers?: {
    id: string;
    number: string;
    provider: string;
  }[];
}

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'twilio' | 'signalwire'>('twilio');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (userId) {
      fetchCurrentUser();
      fetchUserDetails();
    }
  }, [userId]);

  const fetchCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setCurrentUser(userData);
      }
    }
  };

  const fetchUserDetails = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const data = await response.json();
      setUser(data);
      setSelectedProvider(data.preferred_provider || 'twilio');
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProvider = async () => {
    if (!user || !userId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferred_provider: selectedProvider,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast.success('User provider preference updated successfully');
      await fetchUserDetails(); // Refresh data
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <AppLayout user={currentUser}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">User not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.username || user.email || 'No username/email'}</p>
            </div>
          </div>
          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
            {user.role}
          </Badge>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic information about the user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">Username</Label>
                <p className="font-medium">{user.username || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Email</Label>
                <p>{user.email || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">User ID</Label>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Created</Label>
                <p>{new Date(user.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Provider Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Settings</CardTitle>
            <CardDescription>Configure which SMS/Voice provider this user should use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Preferred Provider</Label>
              <Select
                value={selectedProvider}
                onValueChange={(value: 'twilio' | 'signalwire') => setSelectedProvider(value)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="signalwire">SignalWire</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                All outgoing messages from this user will be sent through the selected provider.
              </p>
            </div>
            <Button
              onClick={handleSaveProvider}
              disabled={saving || selectedProvider === user.preferred_provider}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Provider Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Credits Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
            <CardDescription>Current credit balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-500">SMS Credits</Label>
                <p className="text-2xl font-bold">{user.user_credits?.[0]?.sms_credits || 0}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-500">Voice Credits</Label>
                <p className="text-2xl font-bold">{user.user_credits?.[0]?.voice_credits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Numbers */}
        {user.phone_numbers && user.phone_numbers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Phone Numbers</CardTitle>
              <CardDescription>Phone numbers assigned to this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.phone_numbers.map((phone) => (
                  <div key={phone.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-mono">{phone.number}</span>
                    <Badge variant="outline">{phone.provider}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-4">
          <Link href={`/admin/users/${user.id}/credits`}>
            <Button variant="outline">Manage Credits</Button>
          </Link>
          <Link href={`/admin/users/${user.id}/phone-numbers`}>
            <Button variant="outline">Manage Phone Numbers</Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
} 