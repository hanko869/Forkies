'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PhoneNumber, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Plus, Trash2, User as UserIcon } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/phone';
import { toast } from 'sonner';

export default function PhoneNumbersPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<(PhoneNumber & { user?: User })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNumber, setNewNumber] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchPhoneNumbers();
    fetchUsers();
  }, []);

  const fetchPhoneNumbers = async () => {
    const { data, error } = await supabase
      .from('phone_numbers')
      .select(`
        *,
        user:users(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch phone numbers');
      console.error(error);
    } else {
      setPhoneNumbers(data || []);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'user')
      .order('email');

    if (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } else {
      setUsers(data || []);
    }
  };

  const addPhoneNumber = async () => {
    if (!newNumber) {
      toast.error('Please enter a phone number');
      return;
    }

    const { error } = await supabase
      .from('phone_numbers')
      .insert({
        number: newNumber,
        user_id: selectedUserId || null,
      });

    if (error) {
      toast.error('Failed to add phone number');
      console.error(error);
    } else {
      toast.success('Phone number added successfully');
      setNewNumber('');
      setSelectedUserId('');
      fetchPhoneNumbers();
    }
  };

  const assignPhoneNumber = async (phoneNumberId: string, userId: string | null) => {
    const { error } = await supabase
      .from('phone_numbers')
      .update({ user_id: userId })
      .eq('id', phoneNumberId);

    if (error) {
      toast.error('Failed to assign phone number');
      console.error(error);
    } else {
      toast.success(userId ? 'Phone number assigned' : 'Phone number unassigned');
      fetchPhoneNumbers();
    }
  };

  const deletePhoneNumber = async (phoneNumberId: string) => {
    if (!confirm('Are you sure you want to delete this phone number?')) return;

    const { error } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', phoneNumberId);

    if (error) {
      toast.error('Failed to delete phone number');
      console.error(error);
    } else {
      toast.success('Phone number deleted');
      fetchPhoneNumbers();
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Phone Number Management</h1>
        <p className="text-muted-foreground">Manage and assign phone numbers to users</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Phone Number</CardTitle>
          <CardDescription>Add a new phone number to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="user">Assign to User (Optional)</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No user</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addPhoneNumber}>
                <Plus className="mr-2 h-4 w-4" />
                Add Number
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phone Numbers</CardTitle>
          <CardDescription>All phone numbers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers.map((phoneNumber) => (
                  <TableRow key={phoneNumber.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {formatPhoneNumber(phoneNumber.number)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {phoneNumber.user ? (
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          {phoneNumber.user.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          phoneNumber.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {phoneNumber.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(phoneNumber.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={phoneNumber.user_id || ''}
                          onValueChange={(value) =>
                            assignPhoneNumber(phoneNumber.id, value || null)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassign</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePhoneNumber(phoneNumber.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 