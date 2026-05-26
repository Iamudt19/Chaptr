export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getAvatarColorHex } from '@/lib/avatar';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('people')
    .select('*, logs(count)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const people = (data ?? []).map((p: any) => ({
    ...p,
    log_count: p.logs?.[0]?.count ?? 0,
    logs: undefined,
  }));

  return NextResponse.json(people);
}

export async function POST(req: NextRequest) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, relationship } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const avatar_color = getAvatarColorHex(name.trim());

  const { data, error } = await supabaseAdmin
    .from('people')
    .insert({
      user_id: userId,
      name: name.trim(),
      relationship: relationship || 'friend',
      avatar_color,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
