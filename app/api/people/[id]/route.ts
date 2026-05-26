export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: person, error: personError } = await supabaseAdmin
    .from('people')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (personError || !person) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: logs } = await supabaseAdmin
    .from('logs')
    .select('*')
    .eq('person_id', params.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const { data: patterns } = await supabaseAdmin
    .from('patterns')
    .select('*')
    .eq('person_id', params.id)
    .eq('user_id', userId)
    .eq('dismissed', false)
    .order('created_at', { ascending: false });

  return NextResponse.json({ ...person, logs: logs ?? [], patterns: patterns ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabaseAdmin
    .from('people')
    .update(body)
    .eq('id', params.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('people')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
