import { getUser } from '@/lib/auth/utils';
import { createClient } from '@/lib/supabase/server';
import AppLayout from '@/components/shared/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Phone, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import AnalyticsCharts from '@/components/admin/AnalyticsCharts';

export default async function AnalyticsPage() {
  const user = await getUser();
  
  if (!user || user.role !== 'admin') {
    return <div>Not authorized</div>;
  }
  
  const supabase = await createClient();

  // Fetch various analytics data
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total messages sent
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true });

  // Messages in last 30 days
  const { count: monthlyMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Active users (users who sent messages in last 30 days)
  const { data: activeUsers } = await supabase
    .from('messages')
    .select('conversation:conversations(user_id)')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const uniqueActiveUsers = new Set(activeUsers?.map((m: any) => m.conversation?.user_id).filter(Boolean));
  const activeUserCount = uniqueActiveUsers.size;

  // Total credits used
  const { data: usageRecords } = await supabase
    .from('usage_records')
    .select('credits_used, type, created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const totalCreditsUsed = usageRecords?.reduce((sum, record) => sum + record.credits_used, 0) || 0;

  // Daily message volume for last 7 days
  const { data: dailyMessages } = await supabase
    .from('messages')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString());

  // Process daily message data
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dayMessages = dailyMessages?.filter(msg => {
      const msgDate = new Date(msg.created_at);
      return msgDate.toDateString() === date.toDateString();
    });
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      messages: dayMessages?.length || 0,
    };
  });

  // Message direction breakdown
  const { data: messageDirections } = await supabase
    .from('messages')
    .select('direction')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const directionData = [
    {
      name: 'Outbound',
      value: messageDirections?.filter(m => m.direction === 'outbound').length || 0,
    },
    {
      name: 'Inbound',
      value: messageDirections?.filter(m => m.direction === 'inbound').length || 0,
    },
  ];

  // Top users by message volume
  const { data: topUsersData } = await supabase
    .from('messages')
    .select('conversation:conversations(user:users(email))')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const userMessageCounts = topUsersData?.reduce((acc: any, msg: any) => {
    const email = msg.conversation?.user?.email;
    if (email) {
      acc[email] = (acc[email] || 0) + 1;
    }
    return acc;
  }, {});

  const topUsers = Object.entries(userMessageCounts || {})
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)
    .map(([email, count]) => ({ email, count }));

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform usage statistics and insights</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Messages</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyMessages || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUserCount}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCreditsUsed}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <AnalyticsCharts dailyData={dailyData} directionData={directionData} />

        {/* Top Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Message Volume</CardTitle>
            <CardDescription>Most active users in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUsers.map((user: any, index) => (
                <div key={user.email} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{user.count} messages</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
} 