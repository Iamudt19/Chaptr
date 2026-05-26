import { NextRequest, NextResponse } from 'next/server';

// Simple middleware — just pass through
// Auth is handled at component level via Supabase client
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
