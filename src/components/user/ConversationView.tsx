'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Send, ArrowLeft, PhoneCall } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatPhoneNumber } from '@/utils/phone';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import { Message } from '@/types';

interface ConversationViewProps {
  conversation: any;
  currentUserId: string;
}

export default function ConversationView({ conversation, currentUserId }: ConversationViewProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>(conversation.messages || []);
  const [calling, setCalling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Set up real-time message updates
  useRealtimeMessages({
    conversationId: conversation.id,
    onNewMessage: (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onMessageUpdate: (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    },
  });

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: conversation.phone_number_id,
          recipientNumber: conversation.recipient_number,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      toast.success('Message sent successfully');
      setMessage('');
      // Message will appear via real-time subscription
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleCall = async () => {
    if (calling) return;

    setCalling(true);
    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumberId: conversation.phone_number_id,
          recipientNumber: conversation.recipient_number,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate call');
      }

      toast.success('Call initiated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to initiate call');
    } finally {
      setCalling(false);
    }
  };

  // Sort messages by created_at
  const sortedMessages = messages.sort(
    (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/conversations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{formatPhoneNumber(conversation.recipient_number)}</h1>
            <p className="text-sm text-gray-500 flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              From: {formatPhoneNumber(conversation.phone_numbers?.number)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCall}
          disabled={calling}
          title="Make a call"
        >
          <PhoneCall className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <Card className="mb-4">
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {sortedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            sortedMessages.map((msg: any) => (
              <div
                key={msg.id}
                className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.direction === 'outbound'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    {msg.status === 'failed' && ' • Failed'}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Message Input */}
      <Card>
        <form onSubmit={handleSendMessage} className="p-4">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 