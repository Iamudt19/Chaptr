export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/auth';
import { extractTraits, detectPattern, getTrustScore } from '@/lib/ai';
import type { LogCategory } from '@/types/database';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from('logs')
    .select('*')
    .eq('person_id', params.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { content } = body;
  if (!content?.trim()) return NextResponse.json({ error: 'Content is required' }, { status: 400 });

  // Get person details
  const { data: person, error: personError } = await supabaseAdmin
    .from('people')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', userId)
    .single();

  if (personError || !person) return NextResponse.json({ error: 'Person not found' }, { status: 404 });

  // Get existing logs for context
  const { data: existingLogs } = await supabaseAdmin
    .from('logs')
    .select('*')
    .eq('person_id', params.id)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const logs = existingLogs ?? [];

  // Extract traits via AI (best effort — don't fail if AI is down)
  let extractedPositive: string[] = [];
  let extractedNegative: string[] = [];
  let detectedCategory: LogCategory = 'one_off';

  try {
    const traits = await extractTraits(content.trim(), logs);
    extractedPositive = traits.positive;
    extractedNegative = traits.negative;
    detectedCategory = traits.category;
  } catch (e) {
    console.error('Trait extraction failed:', e);
  }

  // Insert the log
  const { data: newLog, error: logError } = await supabaseAdmin
    .from('logs')
    .insert({
      person_id: params.id,
      user_id: userId,
      content: content.trim(),
      category: detectedCategory,
      extracted_traits: { positive: extractedPositive, negative: extractedNegative },
    })
    .select()
    .single();

  if (logError) return NextResponse.json({ error: logError.message }, { status: 500 });

  // Update person's trait arrays
  const updatedPositive = Array.from(new Set([...(person.positive_traits ?? []), ...extractedPositive]));
  const updatedNegative = Array.from(new Set([...(person.negative_traits ?? []), ...extractedNegative]));

  const allLogs = [newLog, ...logs];

  // Background updates
  const updates: Record<string, unknown> = {
    positive_traits: updatedPositive,
    negative_traits: updatedNegative,
  };

  // Detect patterns if 3+ logs
  if (allLogs.length >= 3) {
    try {
      const pattern = await detectPattern(person.name, person.relationship, allLogs);
      if (pattern.detected && pattern.pattern_text) {
        await supabaseAdmin.from('patterns').insert({
          person_id: params.id,
          user_id: userId,
          pattern_text: pattern.pattern_text,
        });
      }
    } catch (e) {
      console.error('Pattern detection failed:', e);
    }
  }

  // Update trust score if 5+ logs
  if (allLogs.length >= 5) {
    try {
      const trust = await getTrustScore(person.name, person.relationship, allLogs);
      updates.trust_level = trust.level;
      updates.trust_reason = trust.reason;
    } catch (e) {
      console.error('Trust score update failed:', e);
    }
  }

  await supabaseAdmin
    .from('people')
    .update(updates)
    .eq('id', params.id);

  return NextResponse.json(newLog, { status: 201 });
}
