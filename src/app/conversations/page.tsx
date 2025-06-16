import { requireUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import ConversationsList from '@/components/user/ConversationsList';

export default async function ConversationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // Fetch all conversations with last message
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      phone_numbers(number),
      messages(
        content,
        direction,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false });

  // Process conversations to get last message
  const processedConversations = conversations?.map(conv => {
    const lastMessage = conv.messages
      ?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    return {
      ...conv,
      lastMessage,
    };
  });

  return (
    <AppLayout user={user}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Conversations</h1>
            <p className="text-gray-600 mt-2">Manage your SMS conversations</p>
          </div>
          <Link href="/conversations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        {processedConversations && processedConversations.length > 0 ? (
          <ConversationsList conversations={processedConversations} />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
              <p className="text-gray-500 text-center mb-4">
                Start a new conversation to begin messaging
              </p>
              <Link href="/conversations/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Start Your First Conversation
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
} 