import { getBooking } from '@/lib/booking/store';
import { icsFor } from '@/lib/booking/confirm';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const booking = await getBooking(url.searchParams.get('b') ?? '', url.searchParams.get('t') ?? '');
  if (!booking || booking.status !== 'paid') return new Response('Not found', { status: 404 });
  return new Response(icsFor(booking), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="vicelic-${booking.id}.ics"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
