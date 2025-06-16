import { requireUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import ConversationView from '@/components/user/ConversationView';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const user = await requireUser();
  const supabase = await createClient();

  // Fetch conversation with messages
  const { data: conversation } = await supabase
    .from('conversations')
    .select(`
      *,
      phone_numbers(number),
      messages(*)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!conversation) {
    notFound();
  }

  // Mark messages as read
  if (conversation.unread_count > 0) {
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', params.id);
  }

  return (
    <AppLayout user={user}>
      <ConversationView 
        conversation={conversation}
        currentUserId={user.id}
      />
    </AppLayout>
  );
} 