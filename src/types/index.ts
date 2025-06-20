// User types
export interface User {
  id: string;
  email?: string;
  username?: string;
  role: 'admin' | 'user';
  name: string;
  preferred_provider?: 'twilio' | 'signalwire';
  created_at: string;
  updated_at: string;
}

// Phone number types
export interface PhoneNumber {
  id: string;
  number: string;
  provider: 'twilio' | 'signalwire';
  provider_sid?: string;
  user_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Credits types
export interface UserCredits {
  id: string;
  user_id: string;
  sms_credits: number;
  voice_credits: number;
  created_at: string;
  updated_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  phone_number_id: string;
  recipient_number: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  unread_count: number;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  updated_at: string;
  provider_sid?: string;
  error_message?: string;
}

// Call types
export interface Call {
  id: string;
  user_id: string;
  phone_number_id: string;
  recipient_number: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  status: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  provider_sid?: string;
}

// Usage types
export interface UsageRecord {
  id: string;
  user_id: string;
  type: 'sms' | 'voice';
  credits_used: number;
  details: Record<string, any>;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Bulk SMS types
export interface BulkSMSRequest {
  phone_number_id: string;
  recipients: string[];
  message: string;
}

export interface BulkSMSResult {
  successful: string[];
  failed: Array<{
    number: string;
    error: string;
  }>;
} 