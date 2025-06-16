import { getUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, CreditCard, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getUser();
  
  // This should not happen as middleware protects this route
  if (!user) {
    return <div>Not authenticated</div>;
  }
  
  const supabase = await createClient();

  // Fetch user credits
  const { data: credits } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Fetch recent conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*, phone_numbers(number)')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(5);

  // Fetch phone numbers count
  const { count: phoneNumbersCount } = await supabase
    .from('phone_numbers')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Here's an overview of your account activity.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMS Credits</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits?.sms_credits || 0}</div>
              <p className="text-xs text-muted-foreground">Available for messaging</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Voice Credits</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{credits?.voice_credits || 0}</div>
              <p className="text-xs text-muted-foreground">Minutes available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phone Numbers</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{phoneNumbersCount || 0}</div>
              <p className="text-xs text-muted-foreground">Active numbers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active threads</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/conversations/new">
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            </Link>
            <Link href="/conversations">
              <Button variant="outline">
                View All Conversations
              </Button>
            </Link>
            <Link href="/phone-numbers">
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Manage Numbers
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        {conversations && conversations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>Your latest message threads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.map((conversation: any) => (
                  <Link
                    key={conversation.id}
                    href={`/conversations/${conversation.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{conversation.recipient_number}</p>
                      <p className="text-sm text-gray-500">
                        From: {conversation.phone_numbers?.number}
                      </p>
                    </div>
                    {conversation.unread_count > 0 && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {conversation.unread_count} new
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 