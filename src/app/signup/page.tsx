'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Link from 'next/link';
import { MessageSquare, CheckCircle } from 'lucide-react';

export default function SMSOptInPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consent) {
      toast.error('Please check the consent box to continue');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - in production, this would save to your database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the opt-in data (in production, save to database)
      console.log('SMS Opt-in Data:', {
        name,
        phone,
        email,
        consent,
        consentTimestamp: new Date().toISOString(),
        ipAddress: 'User IP would be logged here',
        source: 'forkies.com/sms-signup'
      });

      setSubmitted(true);
      toast.success('Successfully subscribed to SMS notifications!');
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl border-0">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Thank You!</h2>
              <p className="text-gray-600">
                You've successfully subscribed to receive SMS notifications from Forkies.
              </p>
              <p className="text-sm text-gray-500">
                You'll receive appointment reminders, promotional messages, and important notifications at {phone}.
              </p>
              <div className="pt-4">
                <Link href="/login">
                  <Button className="w-full">Go to Login</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl border-0">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Subscribe to SMS Notifications
          </CardTitle>
          <CardDescription className="text-center">
            Get appointment reminders, exclusive offers, and important updates from Forkies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                pattern="[+]?[0-9]{1,4}?[-.\s]?[(]?[0-9]{1,3}?[)]?[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}"
                className="w-full"
              />
              <p className="text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consent}
                  onCheckedChange={(checked: boolean) => setConsent(checked)}
                  className="mt-1"
                />
                <Label 
                  htmlFor="consent" 
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  By checking this box, I consent to receive promotional and alert SMS from Forkies. 
                  This includes appointment reminders, special offers, and important notifications. 
                  Message and data rates may apply. Reply STOP to unsubscribe at any time.
                </Label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading || !consent}
              >
                {loading ? 'Subscribing...' : 'Subscribe to SMS Notifications'}
              </Button>
            </div>

            <div className="text-center space-y-2 pt-4">
              <p className="text-xs text-gray-500">
                By subscribing, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                Standard message and data rates may apply. Frequency varies.
              </p>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 