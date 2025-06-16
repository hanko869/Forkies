'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, UserCredits } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, MessageSquare, Phone, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface UserWithCredits extends User {
  user_credits: UserCredits | null;
}

export default function CreditsPage() {
  const [users, setUsers] = useState<UserWithCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithCredits | null>(null);
  const [smsCredits, setSmsCredits] = useState('');
  const [voiceCredits, setVoiceCredits] = useState('');
  const [isAddMode, setIsAddMode] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_credits(*)
      `)
      .eq('role', 'user')
      .order('email');

    if (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateCredits = async () => {
    if (!selectedUser) return;

    const smsAmount = parseInt(smsCredits) || 0;
    const voiceAmount = parseInt(voiceCredits) || 0;

    if (smsAmount === 0 && voiceAmount === 0) {
      toast.error('Please enter at least one credit amount');
      return;
    }

    try {
      if (selectedUser.user_credits) {
        // Update existing credits
        const newSmsCredits = isAddMode
          ? selectedUser.user_credits.sms_credits + smsAmount
          : Math.max(0, selectedUser.user_credits.sms_credits - smsAmount);
        
        const newVoiceCredits = isAddMode
          ? selectedUser.user_credits.voice_credits + voiceAmount
          : Math.max(0, selectedUser.user_credits.voice_credits - voiceAmount);

        const { error } = await supabase
          .from('user_credits')
          .update({
            sms_credits: newSmsCredits,
            voice_credits: newVoiceCredits,
          })
          .eq('user_id', selectedUser.id);

        if (error) throw error;
      } else {
        // Create new credits record
        const { error } = await supabase
          .from('user_credits')
          .insert({
            user_id: selectedUser.id,
            sms_credits: smsAmount,
            voice_credits: voiceAmount,
          });

        if (error) throw error;
      }

      // Record the transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: selectedUser.id,
          type: isAddMode ? 'add' : 'deduct',
          sms_credits: smsAmount,
          voice_credits: voiceAmount,
          description: `Admin ${isAddMode ? 'added' : 'deducted'} credits`,
        });

      toast.success(`Credits ${isAddMode ? 'added' : 'deducted'} successfully`);
      setDialogOpen(false);
      setSmsCredits('');
      setVoiceCredits('');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update credits');
      console.error(error);
    }
  };

  const openCreditDialog = (user: UserWithCredits, addMode: boolean) => {
    setSelectedUser(user);
    setIsAddMode(addMode);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Credit Management</h1>
        <p className="text-muted-foreground">Manage SMS and voice credits for users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SMS Credits</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + (user.user_credits?.sms_credits || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Voice Credits</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((sum, user) => sum + (user.user_credits?.voice_credits || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.user_credits && (user.user_credits.sms_credits > 0 || user.user_credits.voice_credits > 0)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Credits</CardTitle>
          <CardDescription>View and manage credits for all users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>SMS Credits</TableHead>
                  <TableHead>Voice Credits</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {user.user_credits?.sms_credits || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {user.user_credits?.voice_credits || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.user_credits
                        ? new Date(user.user_credits.updated_at).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreditDialog(user, true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreditDialog(user, false)}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Deduct
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddMode ? 'Add' : 'Deduct'} Credits for {selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Current balance: {selectedUser?.user_credits?.sms_credits || 0} SMS, {selectedUser?.user_credits?.voice_credits || 0} Voice
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sms" className="text-right">
                SMS Credits
              </Label>
              <Input
                id="sms"
                type="number"
                min="0"
                value={smsCredits}
                onChange={(e) => setSmsCredits(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="voice" className="text-right">
                Voice Credits
              </Label>
              <Input
                id="voice"
                type="number"
                min="0"
                value={voiceCredits}
                onChange={(e) => setVoiceCredits(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateCredits}>
              {isAddMode ? 'Add' : 'Deduct'} Credits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 