import { NextResponse } from 'next/server';
import { findExperience, getMonth } from '@/lib/booking/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const exp = findExperience(url.searchParams.get('experience') ?? '');
  const month = url.searchParams.get('month') ?? '';
  if (!exp || !/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const days = await getMonth(exp, month);
  return NextResponse.json({ experience: exp.slug, month, days }, { headers: { 'Cache-Control': 'no-store' } });
}
