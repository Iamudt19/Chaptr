import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');

  // Create a client with the user's token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}
