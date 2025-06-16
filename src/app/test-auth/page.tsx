import { createClient } from '@/lib/supabase/server';

export default async function TestAuthPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Auth Status:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify({ user, error }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="font-semibold">Environment Variables:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify({
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
} 