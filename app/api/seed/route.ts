import { NextResponse } from 'next/server';

// Seed endpoint disabled for production — sample data removed.
export async function POST() {
  return NextResponse.json({ message: 'Seed endpoint disabled.' }, { status: 410 });
}
