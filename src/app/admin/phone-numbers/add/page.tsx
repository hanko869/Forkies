'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';
import type { User } from '@/types';

export default function AddPhoneNumberPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<'twilio' | 'signalwire'>('twilio');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [providerSid, setProviderSid] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        setCurrentUser(userData);
      }
    }
  };

  const verifyPhoneNumber = async () => {
    if (!phoneNumber || !providerSid) {
      toast.error('Please enter both phone number and provider SID');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/admin/phone-numbers/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          phoneNumber,
          providerSid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify phone number');
      }

      if (data.verified) {
        setVerified(true);
        toast.success('Phone number verified successfully!');
      } else {
        toast.error('Could not verify phone number. Please check the details.');
      }
    } catch (error) {
      console.error('Error verifying phone number:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to verify phone number');
    } finally {
      setVerifying(false);
    }
  };

  const handleAddPhoneNumber = async () => {
    if (!phoneNumber || !providerSid) {
      toast.error('Please enter all required fields');
      return;
    }

    if (!verified) {
      toast.error('Please verify the phone number first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          phoneNumber,
          providerSid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add phone number');
      }

      toast.success('Phone number added successfully!');
      router.push('/admin/phone-numbers');
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add phone number');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <AppLayout user={currentUser}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/phone-numbers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add Phone Number</h1>
            <p className="text-gray-600">Add a phone number from your provider</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Phone Number Details</CardTitle>
            <CardDescription>
              Enter the phone number and SID from your provider's dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select
                value={provider}
                onValueChange={(value: 'twilio' | 'signalwire') => {
                  setProvider(value);
                  setVerified(false);
                }}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="signalwire">SignalWire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setVerified(false);
                }}
                required
              />
              <p className="text-xs text-gray-500">Enter the phone number in E.164 format (e.g., +1234567890)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="providerSid">Provider SID/ID</Label>
              <Input
                id="providerSid"
                type="text"
                placeholder={provider === 'twilio' ? 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
                value={providerSid}
                onChange={(e) => {
                  setProviderSid(e.target.value);
                  setVerified(false);
                }}
                required
              />
              <p className="text-xs text-gray-500">
                {provider === 'twilio' 
                  ? 'Find this in your Twilio console under Phone Numbers' 
                  : 'Find this in your SignalWire dashboard under Phone Numbers'}
              </p>
            </div>

            {/* Verification Status */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Verification Status</h4>
                  <p className="text-sm text-gray-500">
                    {verified 
                      ? 'Phone number has been verified with the provider' 
                      : 'Click verify to check the phone number with the provider'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {verified ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="ml-2 font-medium">Verified</span>
                    </div>
                  ) : (
                    <Button
                      onClick={verifyPhoneNumber}
                      disabled={verifying || !phoneNumber || !providerSid}
                      variant="outline"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Connection'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Link href="/admin/phone-numbers">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button
                onClick={handleAddPhoneNumber}
                disabled={loading || !verified}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Phone Number'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Provider Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Find Your Phone Number SID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {provider === 'twilio' ? (
              <div>
                <h4 className="font-medium mb-2">Twilio Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Log in to your Twilio Console</li>
                  <li>Navigate to Phone Numbers → Manage → Active Numbers</li>
                  <li>Click on the phone number you want to add</li>
                  <li>Copy the Phone Number SID (starts with PN)</li>
                </ol>
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-2">SignalWire Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Log in to your SignalWire Space</li>
                  <li>Go to Phone Numbers → Manage</li>
                  <li>Click on the phone number you want to add</li>
                  <li>Copy the Number ID (UUID format)</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 