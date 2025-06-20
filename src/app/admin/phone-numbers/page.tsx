import { requireAdmin } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, CheckCircle, XCircle, Phone, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default async function AdminPhoneNumbersPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  // Fetch all phone numbers with their assigned users
  const { data: phoneNumbers } = await supabase
    .from('phone_numbers')
    .select(`
      *,
      users(id, name, username, email)
    `)
    .order('created_at', { ascending: false });

  return (
    <AppLayout user={admin}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phone Number Management</h1>
            <p className="text-gray-600 mt-2">Manage phone numbers from Twilio and SignalWire</p>
          </div>
          <Link href="/admin/phone-numbers/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Phone Number
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Phone Numbers</CardTitle>
            <CardDescription>
              Phone numbers from all providers with their assignment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Provider SID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers?.map((phone) => (
                  <TableRow key={phone.id}>
                    <TableCell className="font-mono">{phone.number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {phone.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {phone.provider_sid || '-'}
                    </TableCell>
                    <TableCell>
                      {phone.is_active ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="mr-1 h-4 w-4" />
                          Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {phone.users ? (
                        <div>
                          <p className="font-medium">{phone.users.name}</p>
                          <p className="text-sm text-gray-500">
                            {phone.users.username || phone.users.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(phone.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/phone-numbers/${phone.id}/test`}>
                              <Phone className="mr-2 h-4 w-4" />
                              Test Connection
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/phone-numbers/${phone.id}/assign`}>
                              Assign to User
                            </Link>
                          </DropdownMenuItem>
                          {phone.user_id && (
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/phone-numbers/${phone.id}/unassign`}>
                                Unassign from User
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/phone-numbers/${phone.id}/sync`}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync with Provider
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 