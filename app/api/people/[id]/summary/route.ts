export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/auth';
import { getCharacterSummary } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
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

  if (!logs?.length) return NextResponse.json({ error: 'No logs to summarize' }, { status: 400 });

  try {
    const summary = await getCharacterSummary(person.name, person.relationship, logs);

    const { data: updated, error } = await supabaseAdmin
      .from('people')
      .update({
        character_summary: summary.summary,
        strengths: summary.strengths,
        watchouts: summary.watchouts,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'AI unavailable' }, { status: 503 });
  }
}
