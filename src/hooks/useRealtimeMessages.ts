import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeMessagesProps {
  conversationId: string;
  onNewMessage: (message: Message) => void;
  onMessageUpdate?: (message: Message) => void;
}

export function useRealtimeMessages({
  conversationId,
  onNewMessage,
  onMessageUpdate,
}: UseRealtimeMessagesProps) {
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Subscribe to new messages for this conversation
      channel = supabase
        .channel(`messages:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            onNewMessage(payload.new as Message);
          }
        );

      // Subscribe to message updates if handler provided
      if (onMessageUpdate) {
        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            onMessageUpdate(payload.new as Message);
          }
        );
      }

      channel.subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, onNewMessage, onMessageUpdate]);
}

// Hook for real-time conversation updates
export function useRealtimeConversations(userId: string, onUpdate: () => void) {
  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      // Subscribe to conversation updates for this user
      channel = supabase
        .channel(`conversations:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            onUpdate();
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, onUpdate]);
} 