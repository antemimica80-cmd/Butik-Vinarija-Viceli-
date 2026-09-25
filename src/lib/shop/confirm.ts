import 'server-only';
import { site } from '@content/site';
import { shopCopy as S } from '@content/products';
import { resendEnabled, sendMail } from '@/lib/email';
import { fill, formatEur } from '@/lib/format';
import { claimOrderEmails, markOrderPaid, type Order } from './store';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function addressLines(o: Order): string[] {
  return 'pickup' in o.address ? [] : [o.name, o.address.street, `${o.address.postal} ${o.address.city}`, o.address.country];
}

function customerEmail(o: Order) {
  const l = o.locale === 'hr' ? 'hr' : 'en';
  const eur = (c: number) => formatEur(c / 100, l);
  const pickup = 'pickup' in o.address;
  const rows = o.lines
    .map((x) => `<tr><td style="padding:8px 0;border-bottom:1px solid #e0d9cc;font:15px Helvetica,Arial,sans-serif">${x.qty} × ${esc(x.name)} <span style="color:#5c564d">· ${esc(x.format)}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #e0d9cc;font:15px Helvetica,Arial,sans-serif">${eur(x.unit_cents * x.qty)}</td></tr>`)
    .join('');
  const html = `<!doctype html><html lang="${l}"><body style="margin:0;background:#ede7dc"><table role="presentation" width="100%" style="background:#ede7dc"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#f7f4ee">
<tr><td style="background:#121110;padding:28px 32px;color:#ede7dc;font:24px Georgia,serif;letter-spacing:.2em">VICELIĆ</td></tr>
<tr><td style="padding:32px">
<p style="margin:0 0 6px;font:11px Helvetica,Arial,sans-serif;letter-spacing:.26em;text-transform:uppercase;color:#7a6130">${S.ordered.eyebrow[l]} · ${o.id}</p>
<h1 style="margin:0 0 24px;font:400 28px/1.2 Georgia,serif;color:#121110">${pickup ? S.ordered.pickupTitle[l] : S.ordered.title[l]}</h1>
<table role="presentation" width="100%">${rows}
<tr><td style="padding:8px 0;font:14px Helvetica,Arial,sans-serif;color:#5c564d">${S.cart.shipping[l]}</td><td align="right" style="font:14px Helvetica,Arial,sans-serif">${o.shipping_cents ? eur(o.shipping_cents) : S.cart.free[l]}</td></tr>
<tr><td style="padding:12px 0;border-top:1px solid #121110;font:600 16px Helvetica,Arial,sans-serif">${S.cart.total[l]}</td><td align="right" style="padding:12px 0;border-top:1px solid #121110;font:600 16px Helvetica,Arial,sans-serif">${eur(o.total_cents)}</td></tr>
<tr><td colspan="2" style="font:12px Helvetica,Arial,sans-serif;color:#5c564d">${fill(S.cart.vatNote[l], { vat: eur(o.vat_cents) })}</td></tr></table>
<p style="margin:24px 0 0;font:14px/1.6 Helvetica,Arial,sans-serif;color:#121110"><strong>${pickup ? S.ordered.pickup[l] : S.ordered.deliverTo[l]}</strong><br>${(pickup ? [site.address.street, `${site.address.postalCode} ${site.address.city}`] : addressLines(o)).map(esc).join('<br>')}</p>
<p style="margin:24px 0 0;font:15px Georgia,serif">${l === 'hr' ? 'Hvala,' : 'Thank you,'}<br>${l === 'hr' ? 'Obitelj Vicelić' : 'The Vicelić family'}</p>
</td></tr>
<tr><td style="padding:20px 32px;background:#121110;color:#a39c90;font:12px/1.6 Helvetica,Arial,sans-serif">${site.legalName} · ${site.address.street}, ${site.address.postalCode} ${site.address.city} · ${site.phone}</td></tr>
</table></td></tr></table></body></html>`;
  const text = [`${S.ordered.eyebrow[l]} ${o.id}`, ...o.lines.map((x) => `${x.qty} × ${x.name} (${x.format}) — ${eur(x.unit_cents * x.qty)}`), `${S.cart.total[l]}: ${eur(o.total_cents)}`].join('\n');
  return { subject: `${S.ordered.eyebrow[l]} ${o.id} — Vicelić`, html, text };
}

function wineryEmail(o: Order) {
  const lines = [
    o.stock_ok === false ? '⚠ ZALIHE: narudžba je plaćena, ali nije bilo dovoljno boca na stanju. Provjerite i javite se kupcu.\n' : '',
    `Narudžba ${o.id} · ${formatEur(o.total_cents / 100, 'hr')} (${o.payment_mode === 'stripe' ? 'Stripe' : 'DEMO'})`,
    ...o.lines.map((x) => `${x.qty} × ${x.name} — ${x.format}`),
    `Boca po vinu: ${Object.entries(o.bottles).map(([w, n]) => `${w} ${n}`).join(', ')}`,
    '',
    'pickup' in o.address ? 'PREUZIMANJE NA IMANJU' : `Dostava (${o.zone.toUpperCase()}):\n${addressLines(o).join('\n')}`,
    `E-pošta: ${o.email} · Telefon: ${o.phone || '—'}`,
    `Napomena: ${o.notes || '—'}`,
  ].filter(Boolean);
  return { subject: `${o.stock_ok === false ? '⚠ ' : ''}Nova narudžba ${o.id} — ${formatEur(o.total_cents / 100, 'hr')}`, text: lines.join('\n'), html: `<pre style="font:14px/1.6 Menlo,monospace">${esc(lines.join('\n'))}</pre>` };
}

export async function finalizeOrder(id: string) {
  const res = await markOrderPaid(id);
  if (!res) return null;
  const { order } = res;
  if (order.status === 'paid' && (await claimOrderEmails(order.id))) {
    const c = customerEmail(order);
    const w = wineryEmail(order);
    const winery = process.env.WINERY_NOTIFY_EMAIL || (resendEnabled() ? null : 'winery@outbox.local');
    await Promise.allSettled([
      sendMail({ to: order.email, subject: c.subject, html: c.html, text: c.text, replyTo: site.email }),
      winery ? sendMail({ to: winery, subject: w.subject, html: w.html, text: w.text, replyTo: order.email }) : Promise.resolve(null),
    ]).then((r) => r.forEach((x) => x.status === 'rejected' && console.error('[email]', x.reason)));
  }
  return order;
}
