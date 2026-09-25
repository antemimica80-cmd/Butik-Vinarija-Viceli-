import { NextResponse } from 'next/server';
import { getStock } from '@/lib/shop/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ stock: await getStock() }, { headers: { 'Cache-Control': 'no-store' } });
}
