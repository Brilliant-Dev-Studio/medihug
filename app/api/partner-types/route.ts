import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const partnerTypes = await db.partnerType.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ partnerTypes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
