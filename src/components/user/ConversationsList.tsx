'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, MessageSquare } from 'lucide-react';

interface ConversationsListProps {
  conversations: any[];
}

export default function ConversationsList({ conversations }: ConversationsListProps) {
  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversations/${conversation.id}`}
          className="block"
        >
          <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <MessageSquare className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold truncate">
                    {conversation.recipient_number}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                  <Phone className="h-3 w-3" />
                  <span>{conversation.phone_numbers?.number}</span>
                </div>
                
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage.direction === 'outbound' && (
                      <span className="text-gray-400">You: </span>
                    )}
                    {conversation.lastMessage.content}
                  </p>
                )}
              </div>
              
              {conversation.unread_count > 0 && (
                <Badge className="bg-blue-600 text-white">
                  {conversation.unread_count}
                </Badge>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
} 