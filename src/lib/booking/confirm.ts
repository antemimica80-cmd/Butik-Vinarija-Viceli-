import 'server-only';
import { site } from '@content/site';
import { confirmation, email as copy } from '@content/booking';
import { resendEnabled, sendMail } from '@/lib/email';
import { directionsUrl, fill, formatEur } from '@/lib/format';
import { siteUrl } from '@/lib/stripe';
import { bookingIcs } from './ics';
import { claimEmails, findExperience, markPaid, slotOverbooked, type Booking } from './store';
import { formatDate } from './time';

type Loc = 'en' | 'hr';
const loc = (b: Booking): Loc => (b.locale === 'hr' ? 'hr' : 'en');

export const address = `${site.address.street}, ${site.address.postalCode} ${site.address.city}, ${site.address.country}`;

export function describe(b: Booking) {
  const l = loc(b);
  const exp = findExperience(b.experience);
  const when = `${formatDate(b.date, l)}, ${b.time}`;
  const words = { adults: b.adults, children: b.children, adultWord: b.adults === 1 ? 'adult' : 'adults', childWord: b.children === 1 ? 'child' : 'children' };
  const guests = fill(b.children > 0 ? confirmation.adultsChildren[l] : confirmation.adultsOnly[l], words);
  return { l, exp, when, guests, total: formatEur(b.amount_cents / 100, l), title: `${exp?.name ?? b.experience} — ${site.nameEn}` };
}

export function icsFor(b: Booking) {
  const d = describe(b);
  return bookingIcs({
    id: b.id,
    title: d.title,
    date: b.date,
    time: b.time,
    durationMinutes: d.exp?.durationMinutes ?? 90,
    description: `${confirmation.reference[d.l]}: ${b.id}\n${d.guests}\n${site.phone} · WhatsApp https://wa.me/${site.whatsapp}\n${directionsUrl(address)}`,
  });
}

function row(label: string, value: string) {
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #e0d9cc;color:#5c564d;font:12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;width:38%">${label}</td><td style="padding:10px 0;border-bottom:1px solid #e0d9cc;color:#121110;font:15px/1.5 Helvetica,Arial,sans-serif">${value}</td></tr>`;
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function guestEmail(b: Booking) {
  const d = describe(b);
  const l = d.l;
  const manage = `${siteUrl()}/${l}/${l === 'hr' ? 'degustacije' : 'experience'}/booked?b=${b.id}&t=${b.token}`;
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(fill(confirmation.whatsappText[l], { ref: b.id }))}`;
  const html = `<!doctype html><html lang="${l}"><body style="margin:0;background:#ede7dc">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede7dc"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f7f4ee">
<tr><td style="background:#121110;padding:28px 32px;color:#ede7dc;font:24px/1 Georgia,serif;letter-spacing:.2em">VICELIĆ<div style="font:10px/1.8 Helvetica,Arial,sans-serif;letter-spacing:.4em;color:#a39c90;margin-top:6px">DINGAČ · PELJEŠAC</div></td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 6px;font:11px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#7a6130">${confirmation.eyebrow[l]}</p>
<h1 style="margin:0 0 20px;font:400 30px/1.15 Georgia,serif;color:#121110">${confirmation.title[l]}</h1>
<p style="margin:0 0 12px;font:15px/1.6 Helvetica,Arial,sans-serif;color:#121110">${esc(fill(copy.greeting[l], { name: b.name }))}</p>
<p style="margin:0 0 24px;font:15px/1.6 Helvetica,Arial,sans-serif;color:#5c564d">${copy.intro[l]}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
${row(confirmation.reference[l], `<strong>${b.id}</strong>`)}
${row(l === 'hr' ? 'Degustacija' : 'Tasting', esc(d.exp?.name ?? b.experience))}
${row(confirmation.when[l], d.when)}
${row(confirmation.guests[l], d.guests)}
${row(confirmation.paid[l], d.total)}
${row(confirmation.where[l], `${esc(address)}<br><a href="${directionsUrl(address)}" style="color:#3b0a12">${confirmation.directions[l]}</a>`)}
</table>
<p style="margin:28px 0 0"><a href="${wa}" style="display:inline-block;background:#3b0a12;color:#ede7dc;padding:14px 22px;font:600 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;text-decoration:none">WhatsApp</a>
&nbsp; <a href="${manage}" style="color:#3b0a12;font:13px Helvetica,Arial,sans-serif">${l === 'hr' ? 'Vaša rezervacija' : 'Your booking'}</a></p>
<p style="margin:24px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:#5c564d">${copy.ics[l]}</p>
<p style="margin:12px 0 0;font:13px/1.6 Helvetica,Arial,sans-serif;color:#5c564d">${confirmation.cancellation[l]}</p>
<p style="margin:28px 0 0;font:15px/1.6 Georgia,serif;color:#121110">${copy.signoff[l]}<br>${copy.family[l]}</p>
</td></tr>
<tr><td style="padding:20px 32px;background:#121110;color:#a39c90;font:12px/1.6 Helvetica,Arial,sans-serif">${site.legalName} · ${esc(address)}<br>${site.phone} · ${site.email}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [
    fill(copy.greeting[l], { name: b.name }),
    '',
    copy.intro[l],
    '',
    `${confirmation.reference[l]}: ${b.id}`,
    `${d.exp?.name}: ${d.when}`,
    `${confirmation.guests[l]}: ${d.guests}`,
    `${confirmation.paid[l]}: ${d.total}`,
    `${confirmation.where[l]}: ${address}`,
    directionsUrl(address),
    `WhatsApp: ${wa}`,
    '',
    confirmation.cancellation[l],
    '',
    copy.signoff[l],
    copy.family[l],
  ].join('\n');
  return { subject: fill(copy.guestSubject[l], { when: d.when }), html, text };
}

function wineryEmail(b: Booking, overbooked: boolean) {
  const d = describe(b);
  const lines = [
    overbooked ? `⚠ ${copy.wineryOverbooked.hr}\n` : '',
    `${b.id} · ${d.exp?.name}`,
    `${formatDate(b.date, 'hr')} u ${b.time}`,
    `Odraslih: ${b.adults}, djece: ${b.children}`,
    `Plaćeno: ${formatEur(b.amount_cents / 100, 'hr')} (${b.payment_mode === 'stripe' ? 'Stripe' : 'DEMO'})`,
    '',
    `Gost: ${b.name}`,
    `E-pošta: ${b.email}`,
    `Telefon: ${b.phone || '—'}`,
    `Jezik: ${b.locale.toUpperCase()}`,
    `Napomena: ${b.notes || '—'}`,
  ].filter(Boolean);
  return {
    subject: `${overbooked ? '⚠ ' : ''}${copy.wineryNew.hr} ${b.id} — ${d.exp?.name}, ${b.date} ${b.time}, ${b.guests} gost.`,
    text: lines.join('\n'),
    html: `<pre style="font:14px/1.6 Menlo,monospace">${esc(lines.join('\n'))}</pre>`,
  };
}

/**
 * The single place a booking becomes paid. Called from the Stripe webhook, the
 * success page (in case the webhook is late) and the demo checkout. Idempotent:
 * emails are sent exactly once.
 */
export async function finalizeBooking(id: string) {
  const result = await markPaid(id);
  if (!result) return null;
  const { booking } = result;
  if (booking.status === 'paid' && (await claimEmails(booking.id))) {
    const ics = icsFor(booking);
    const g = guestEmail(booking);
    const attachments = [{ filename: `vicelic-${booking.id}.ics`, content: ics, contentType: 'text/calendar; charset=utf-8; method=PUBLISH' }];
    const overbooked = await slotOverbooked(booking);
    const w = wineryEmail(booking, overbooked);
    // Never email the real estate address by accident from a proposal build: the
    // winery copy goes only to WINERY_NOTIFY_EMAIL (or to the local outbox).
    const winery = process.env.WINERY_NOTIFY_EMAIL || (resendEnabled() ? null : 'winery@outbox.local');
    await Promise.allSettled([
      sendMail({ to: booking.email, subject: g.subject, html: g.html, text: g.text, replyTo: site.email, attachments }),
      winery ? sendMail({ to: winery, subject: w.subject, html: w.html, text: w.text, replyTo: booking.email, attachments }) : Promise.resolve(null),
    ]).then((r) => r.forEach((x) => x.status === 'rejected' && console.error('[email]', x.reason)));
  }
  return booking;
}
