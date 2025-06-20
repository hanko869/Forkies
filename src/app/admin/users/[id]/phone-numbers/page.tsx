'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Phone } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { User, PhoneNumber } from '@/types';

interface UserWithCredits extends User {
  user_credits?: {
    sms_credits: number;
    voice_credits: number;
  }[];
}

export default function UserPhoneNumbersPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<UserWithCredits | null>(null);
  const [assignedNumbers, setAssignedNumbers] = useState<PhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [selectedNumberId, setSelectedNumberId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

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
      fetchUserData();
      fetchPhoneNumbers();
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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error('Failed to load user details');
    }
  };

  const fetchPhoneNumbers = async () => {
    const supabase = createClient();
    
    try {
      // Fetch assigned numbers
      const { data: assigned } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      setAssignedNumbers(assigned || []);

      // Fetch available numbers (unassigned and active)
      const { data: available } = await supabase
        .from('phone_numbers')
        .select('*')
        .is('user_id', null)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      setAvailableNumbers(available || []);
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      toast.error('Failed to load phone numbers');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignNumber = async () => {
    if (!selectedNumberId) {
      toast.error('Please select a phone number');
      return;
    }

    setAssigning(true);
    try {
      const response = await fetch(`/api/admin/phone-numbers/${selectedNumberId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign phone number');
      }

      toast.success('Phone number assigned successfully');
      setSelectedNumberId('');
      fetchPhoneNumbers(); // Refresh lists
    } catch (error) {
      console.error('Error assigning phone number:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign phone number');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignNumber = async (phoneNumberId: string) => {
    if (!confirm('Are you sure you want to unassign this phone number?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/phone-numbers/${phoneNumberId}/unassign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unassign phone number');
      }

      toast.success('Phone number unassigned successfully');
      fetchPhoneNumbers(); // Refresh lists
    } catch (error) {
      console.error('Error unassigning phone number:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unassign phone number');
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

  // Filter available numbers based on user's preferred provider
  const filteredAvailableNumbers = user.preferred_provider
    ? availableNumbers.filter(num => num.provider === user.preferred_provider)
    : availableNumbers;

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
              <h1 className="text-3xl font-bold">Phone Numbers for {user.name}</h1>
              <p className="text-gray-600">{user.username || user.email}</p>
            </div>
          </div>
          <Badge variant="outline">
            Provider: {user.preferred_provider || 'Any'}
          </Badge>
        </div>

        {/* Assign New Number */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Phone Number</CardTitle>
            <CardDescription>
              Assign an available {user.preferred_provider || 'phone'} number to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="phoneNumber">Available Phone Numbers</Label>
                <Select
                  value={selectedNumberId}
                  onValueChange={setSelectedNumberId}
                  disabled={filteredAvailableNumbers.length === 0}
                >
                  <SelectTrigger id="phoneNumber">
                    <SelectValue placeholder={
                      filteredAvailableNumbers.length === 0 
                        ? `No available ${user.preferred_provider || ''} numbers` 
                        : "Select a phone number"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableNumbers.map((number) => (
                      <SelectItem key={number.id} value={number.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{number.number}</span>
                          <Badge variant="outline" className="ml-2">
                            {number.provider}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {user.preferred_provider && availableNumbers.length > 0 && filteredAvailableNumbers.length === 0 && (
                  <p className="text-sm text-amber-600 mt-2">
                    No available {user.preferred_provider} numbers. Add more numbers in Phone Number Management.
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAssignNumber}
                  disabled={!selectedNumberId || assigning}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {assigning ? 'Assigning...' : 'Assign Number'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Numbers */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Phone Numbers</CardTitle>
            <CardDescription>
              Phone numbers currently assigned to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedNumbers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No phone numbers assigned to this user
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedNumbers.map((number) => (
                    <TableRow key={number.id}>
                      <TableCell className="font-mono">
                        <div className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          {number.number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {number.provider}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={number.is_active ? 'default' : 'secondary'}>
                          {number.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(number.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassignNumber(number.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Credits Info */}
        <Card>
          <CardHeader>
            <CardTitle>User Credits</CardTitle>
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
      </div>
    </AppLayout>
  );
} 