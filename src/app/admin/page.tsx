import { getUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Phone, MessageSquare, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  const user = await getUser();
  
  // This should not happen as middleware protects this route
  if (!user || user.role !== 'admin') {
    return <div>Not authorized</div>;
  }
  
  const supabase = await createClient();

  // Fetch statistics
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user');

  const { count: phoneNumbersCount } = await supabase
    .from('phone_numbers')
    .select('*', { count: 'exact', head: true });

  const { count: messagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  const { data: totalCredits } = await supabase
    .from('user_credits')
    .select('sms_credits, voice_credits');

  const totalSmsCredits = totalCredits?.reduce((sum, credit) => sum + (credit.sms_credits || 0), 0) || 0;
  const totalVoiceCredits = totalCredits?.reduce((sum, credit) => sum + (credit.voice_credits || 0), 0) || 0;

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your SMS platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{phoneNumbersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messagesCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSmsCredits}</div>
              <p className="text-xs text-muted-foreground">SMS: {totalSmsCredits} | Voice: {totalVoiceCredits}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/admin/users">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/phone-numbers">
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Manage Phone Numbers
              </Button>
            </Link>
            <Link href="/admin/credits">
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Manage Credits
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 