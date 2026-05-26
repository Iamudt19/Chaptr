export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/auth';
import { getJudgement } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { question } = body;
  if (!question?.trim()) return NextResponse.json({ error: 'Question is required' }, { status: 400 });

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

  if (!logs?.length) return NextResponse.json({ error: 'No logs to assess' }, { status: 400 });

  try {
    const judgement = await getJudgement(question, person.name, person.relationship, logs);
    return NextResponse.json(judgement);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI unavailable' }, { status: 503 });
  }
}
