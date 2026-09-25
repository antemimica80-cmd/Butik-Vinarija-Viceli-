import { NextResponse } from 'next/server';
import { z } from 'zod';
import { saveEnquiry } from '@/lib/booking/store';
import { resendEnabled, sendMail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const base = {
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(''),
  message: z.string().trim().max(2000).default(''),
  locale: z.enum(['en', 'hr']),
  website: z.string().max(0).optional(), // honeypot
};

const body = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('trade'), company: z.string().trim().min(2).max(160), role: z.string().max(80), volume: z.string().max(40).default(''), ...base }),
  z.object({
    kind: z.literal('winter'),
    experience: z.string().max(60),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().max(20).default(''),
    guests: z.number().int().min(1).max(60),
    ...base,
  }),
]);

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid', fields: parsed.error.issues.map((i) => i.path.join('.')) }, { status: 400 });
  const { website: _hp, ...data } = parsed.data;
  const id = await saveEnquiry(data.kind, data);
  const to = process.env.WINERY_NOTIFY_EMAIL || (resendEnabled() ? null : 'winery@outbox.local');
  if (to) {
    const text = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    const subject = data.kind === 'trade' ? `Partnerski upit — ${data.company}` : `Zimski upit — ${data.experience}, ${data.date}, ${data.guests} gost.`;
    await sendMail({ to, subject, text, html: `<pre style="font:14px/1.6 Menlo,monospace">${text.replace(/</g, '&lt;')}</pre>`, replyTo: data.email }).catch((e) =>
      console.error('[enquiry email]', e),
    );
  }
  return NextResponse.json({ ok: true, id });
}
