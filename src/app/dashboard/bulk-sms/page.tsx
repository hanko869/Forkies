'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PhoneNumber } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Upload, Download, AlertCircle } from 'lucide-react';
import { formatPhoneNumber } from '@/utils/phone';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Recipient {
  number: string;
  name?: string;
  status?: 'pending' | 'sent' | 'failed';
  error?: string;
}

export default function BulkSMSPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [selectedPhoneId, setSelectedPhoneId] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientText, setRecipientText] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [credits, setCredits] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchPhoneNumbers();
    fetchCredits();
  }, []);

  const fetchPhoneNumbers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      toast.error('Failed to fetch phone numbers');
      console.error(error);
    } else {
      setPhoneNumbers(data || []);
      if (data && data.length > 0) {
        setSelectedPhoneId(data[0].id);
      }
    }
  };

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_credits')
      .select('sms_credits')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setCredits(data?.sms_credits || 0);
    }
  };

  const parseRecipients = () => {
    const lines = recipientText.split('\n').filter(line => line.trim());
    const parsedRecipients: Recipient[] = [];

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      const number = parts[0];
      const name = parts[1];

      // Basic phone number validation
      if (number && /^\+?[1-9]\d{1,14}$/.test(number.replace(/\D/g, ''))) {
        parsedRecipients.push({
          number: number.replace(/\D/g, ''),
          name,
          status: 'pending'
        });
      }
    });

    setRecipients(parsedRecipients);
    return parsedRecipients;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRecipientText(text);
      parseRecipients();
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'phone_number,name\n+1234567890,John Doe\n+0987654321,Jane Smith';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_sms_template.csv';
    a.click();
  };

  const sendBulkSMS = async () => {
    if (!selectedPhoneId) {
      toast.error('Please select a phone number');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const validRecipients = recipients.filter(r => r.status === 'pending');
    if (validRecipients.length === 0) {
      toast.error('No valid recipients');
      return;
    }

    if (credits < validRecipients.length) {
      toast.error(`Insufficient credits. You need ${validRecipients.length} credits but have ${credits}`);
      return;
    }

    setSending(true);
    setProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRecipients.length; i++) {
      const recipient = validRecipients[i];
      const personalizedMessage = message.replace('{name}', recipient.name || 'there');

      try {
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumberId: selectedPhoneId,
            recipientNumber: recipient.number,
            message: personalizedMessage,
          }),
        });

        if (response.ok) {
          recipient.status = 'sent';
          successCount++;
        } else {
          const error = await response.json();
          recipient.status = 'failed';
          recipient.error = error.error || 'Failed to send';
          failCount++;
        }
      } catch (error) {
        recipient.status = 'failed';
        recipient.error = 'Network error';
        failCount++;
      }

      setProgress(((i + 1) / validRecipients.length) * 100);
      setRecipients([...recipients]);
    }

    setSending(false);
    fetchCredits(); // Refresh credits

    toast.success(`Bulk SMS complete! Sent: ${successCount}, Failed: ${failCount}`);
  };

  const totalCost = recipients.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bulk SMS</h1>
        <p className="text-muted-foreground">Send personalized messages to multiple recipients</p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You have <strong>{credits}</strong> SMS credits available. Each message costs 1 credit.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Select Phone Number</CardTitle>
            <CardDescription>Choose which phone number to send from</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPhoneId} onValueChange={setSelectedPhoneId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.id}>
                    {formatPhoneNumber(phone.number)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Add Recipients</CardTitle>
            <CardDescription>
              Enter recipients manually or upload a CSV file. Use {'{name}'} in your message for personalization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="recipients">Recipients (one per line: phone,name)</Label>
              <Textarea
                id="recipients"
                placeholder="+1234567890,John Doe&#10;+0987654321,Jane Smith"
                value={recipientText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRecipientText(e.target.value)}
                onBlur={parseRecipients}
                rows={5}
              />
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <div>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </label>
                </Button>
              </div>
            </div>
            {recipients.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {recipients.length} recipients loaded ({recipients.filter(r => r.status === 'pending').length} pending)
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Compose Message</CardTitle>
            <CardDescription>
              Write your message. Use {'{name}'} to personalize with recipient names.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Hi {name}, this is a test message..."
              value={message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="mt-2 text-sm text-muted-foreground">
              {message.length} characters
            </div>
          </CardContent>
        </Card>

        {sending && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sending messages...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </CardContent>
          </Card>
        )}

        {recipients.length > 0 && !sending && (
          <Card>
            <CardHeader>
              <CardTitle>Recipients Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      {formatPhoneNumber(recipient.number)}
                      {recipient.name && ` (${recipient.name})`}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        recipient.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : recipient.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {recipient.status}
                      {recipient.error && `: ${recipient.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Total cost: {totalCost} credits
          </div>
          <Button
            onClick={sendBulkSMS}
            disabled={sending || recipients.length === 0 || !message || !selectedPhoneId}
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Bulk SMS ({totalCost})
          </Button>
        </div>
      </div>
    </div>
  );
} 