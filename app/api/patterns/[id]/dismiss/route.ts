export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await getUserFromRequest(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('patterns')
    .update({ dismissed: true })
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
