import { revalidatePath } from 'next/cache';
import { experiences } from '@content/experiences';
import { availability } from '@content/availability';
import { listBlocked, listBookings, setBlocked } from '@/lib/booking/store';
import { formatDate, todayIn } from '@/lib/booking/time';
import { formatEur } from '@/lib/format';
import { getStock, listOrders } from '@/lib/shop/store';
import { addressLines } from '@/lib/shop/confirm';

export const dynamic = 'force-dynamic';

async function block(form: FormData) {
  'use server';
  const date = String(form.get('date') ?? '');
  const exp = String(form.get('experience') ?? '');
  const time = String(form.get('time') ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const key = exp && time ? `${exp}|${date}|${time}` : date;
  await setBlocked(key, true, String(form.get('reason') ?? ''));
  revalidatePath('/admin');
}

async function unblock(form: FormData) {
  'use server';
  await setBlocked(String(form.get('key')), false);
  revalidatePath('/admin');
}

export default async function Admin() {
  const today = todayIn(availability.timezone);
  const [bookings, blocked, orders, stock] = await Promise.all([listBookings(today), listBlocked(), listOrders(50), getStock()]);
  const byDate = Map.groupBy(bookings, (b) => b.date);
  const paid = bookings.filter((b) => b.status === 'paid');

  return (
    <main className="container-x py-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-display-m font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Rezervacije
        </h1>
        <p className="font-mono text-sm text-ink-soft">
          {paid.length} plaćenih · {paid.reduce((n, b) => n + b.guests, 0)} gostiju · {formatEur(paid.reduce((n, b) => n + b.amount_cents, 0) / 100, 'hr')}
        </p>
      </div>

      <section className="mt-10">
        {bookings.length === 0 && <p className="text-ink-soft">Nema nadolazećih rezervacija.</p>}
        {[...byDate.entries()].map(([date, list]) => (
          <div key={date} className="mb-8">
            <h2 className="label mb-3 text-sun-deep">{formatDate(date, 'hr')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] table-fixed border-collapse text-sm">
                <colgroup>
                  <col className="w-16" />
                  <col className="w-40" />
                  <col className="w-14" />
                  <col className="w-64" />
                  <col />
                  <col className="w-24" />
                  <col className="w-44" />
                </colgroup>
                <tbody>
                  {list.map((b) => (
                    <tr key={b.id} className="border-b border-basalt/10 align-top">
                      <td className="py-2 pr-3 font-mono">{b.time}</td>
                      <td className="py-2 pr-3">{experiences.find((e) => e.slug === b.experience)?.name}</td>
                      <td className="py-2 pr-3 font-mono">
                        {b.adults}+{b.children}
                      </td>
                      <td className="py-2 pr-3">
                        {b.name}
                        <br />
                        <a className="text-ink-soft underline" href={`mailto:${b.email}`}>
                          {b.email}
                        </a>{' '}
                        {b.phone && (
                          <a className="text-ink-soft underline" href={`https://wa.me/${b.phone.replace(/\D/g, '')}`}>
                            {b.phone}
                          </a>
                        )}
                      </td>
                      <td className="py-2 pr-3 text-ink-soft">{b.notes}</td>
                      <td className="py-2 pr-3 font-mono">{formatEur(b.amount_cents / 100, 'hr')}</td>
                      <td className="py-2 font-mono text-xs">
                        <span className={b.status === 'paid' ? 'text-basalt' : 'text-sun-deep'}>{b.status === 'paid' ? 'PLAĆENO' : 'ČEKA PLAĆANJE'}</span>
                        <br />
                        {b.id} · {b.payment_mode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-display-s font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Narudžbe
          </h2>
          <p className="font-mono text-sm text-ink-soft">
            Zalihe: {Object.entries(stock).map(([w, n]) => `${w} ${n}`).join(' · ')}
          </p>
        </div>
        {orders.length === 0 && <p className="mt-4 text-ink-soft">Nema plaćenih narudžbi.</p>}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-sm">
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-basalt/10 align-top">
                  <td className="py-2 pr-3 font-mono text-xs">
                    {o.id}
                    <br />
                    {o.paid_at && new Date(o.paid_at).toLocaleString('hr-HR', { timeZone: 'Europe/Zagreb' })}
                  </td>
                  <td className="py-2 pr-3">
                    {o.lines.map((x) => (
                      <span key={x.sku} className="block">
                        {x.qty} × {x.name} · {x.format}
                      </span>
                    ))}
                  </td>
                  <td className="py-2 pr-3">
                    {o.name}
                    <br />
                    <a className="text-ink-soft underline" href={`mailto:${o.email}`}>
                      {o.email}
                    </a>{' '}
                    {o.phone}
                  </td>
                  <td className="py-2 pr-3 text-ink-soft">{'pickup' in o.address ? 'Preuzimanje na imanju' : addressLines(o).slice(1).join(', ')}</td>
                  <td className="py-2 pr-3 font-mono">{formatEur(o.total_cents / 100, 'hr')}</td>
                  <td className="py-2 font-mono text-xs">
                    {o.stock_ok === false ? <span className="text-plavac">⚠ ZALIHE</span> : 'OK'} · {o.payment_mode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2">
        <form action={block} className="space-y-3 border border-basalt/15 bg-bone p-6">
          <h2 className="label">Blokiraj datum ili termin</h2>
          <p className="text-sm text-ink-soft">Bez degustacije i vremena blokira se cijeli dan za sve degustacije.</p>
          <input type="date" name="date" required className="w-full border border-basalt/25 bg-limestone px-3 py-2" />
          <select name="experience" className="w-full border border-basalt/25 bg-limestone px-3 py-2">
            <option value="">Sve degustacije (cijeli dan)</option>
            {experiences.map((e) => (
              <option key={e.slug} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
          <input name="time" placeholder="Vrijeme, npr. 11:00 (neobavezno)" pattern="\d{2}:\d{2}" className="w-full border border-basalt/25 bg-limestone px-3 py-2" />
          <input name="reason" placeholder="Razlog (interno)" className="w-full border border-basalt/25 bg-limestone px-3 py-2" />
          <button className="btn btn-primary">Blokiraj</button>
        </form>
        <div>
          <h2 className="label mb-3">Blokirano</h2>
          {blocked.length === 0 && <p className="text-sm text-ink-soft">Ništa.</p>}
          <ul className="space-y-2">
            {blocked.map((b) => (
              <li key={b.key} className="flex items-center justify-between gap-4 border-b border-basalt/10 py-2 font-mono text-sm">
                <span>
                  {b.key} {b.reason && <span className="text-ink-soft">— {b.reason}</span>}
                </span>
                <form action={unblock}>
                  <input type="hidden" name="key" value={b.key} />
                  <button className="text-xs underline">Odblokiraj</button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
