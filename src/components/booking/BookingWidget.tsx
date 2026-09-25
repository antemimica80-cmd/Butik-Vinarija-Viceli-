'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { widget as w } from '@content/booking';
import { Link } from '@/i18n/navigation';
import { track } from '@/lib/analytics';
import { fill, formatEur } from '@/lib/format';
import { formatDate, todayIn } from '@/lib/booking/time';
import type { Day } from '@/lib/booking/slots';
import { ArrowRight } from '@/components/ui/icons';

export type WidgetExperience = {
  slug: string;
  name: string;
  tier: number;
  price: number;
  minGuests: number;
  maxGuests: number;
  durationLabel: string;
  winterSlots: string[];
};

type Props = {
  locale: 'en' | 'hr';
  experiences: WidgetExperience[];
  today: string;
  demo: boolean;
};

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'error'; message: string; fields?: string[] } | { kind: 'sent' };

const monthOf = (date: string) => date.slice(0, 7);
function shiftMonth(month: string, n: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return d.toISOString().slice(0, 7);
}

export function BookingWidget({ locale, experiences, today: builtToday, demo }: Props) {
  const l = <T,>(x: { en: T; hr: T }) => x[locale];
  const [slug, setSlug] = useState(experiences[0].slug);
  const exp = experiences.find((e) => e.slug === slug)!;
  const [today, setToday] = useState(builtToday);
  const [month, setMonth] = useState(monthOf(builtToday));
  // Availability is stored with the tasting+month it belongs to; anything else reads as "loading".
  const [loaded, setLoaded] = useState<{ key: string; days: Day[] } | null>(null);
  const days = loaded?.key === `${slug}|${month}` ? loaded.days : null;
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [adultsRaw, setAdults] = useState(2);
  const [childrenRaw, setChildren] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [req, setReq] = useState<Status>({ kind: 'idle' });
  const autoAdvanced = useRef(0);
  const detailsRef = useRef<HTMLFieldSetElement>(null);
  const startedRef = useRef(false);

  // The page is static: "today" from the build is corrected to the real date on arrival.
  useEffect(() => {
    const real = todayIn('Europe/Zagreb');
    if (real !== builtToday) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync with the clock after hydration
      setToday(real);
      setMonth(monthOf(real));
    }
  }, [builtToday]);

  // Pre-select a tasting from the URL hash (#book=the-slope) — used by the tier cards and the home page.
  useEffect(() => {
    const read = () => {
      const m = location.hash.match(/^#book=([a-z0-9-]+)/);
      if (m && experiences.some((e) => e.slug === m[1])) {
        setSlug(m[1]);
        setTime(null);
        autoAdvanced.current = 0;
        document.getElementById('book')?.scrollIntoView({ block: 'start' });
      }
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, [experiences]);

  // Returning from an abandoned payment: release the held seats straight away.
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const b = p.get('cancelled');
    const t = p.get('t');
    if (b && t) {
      fetch('/api/booking/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ b, t }) }).catch(() => null);
      history.replaceState(null, '', location.pathname + location.hash);
    }
  }, []);

  const [reload, setReload] = useState(0);
  useEffect(() => {
    let live = true;
    const key = `${slug}|${month}`;
    fetch(`/api/availability?experience=${slug}&month=${month}`, { cache: 'no-store' })
      .then((r) => r.json() as Promise<{ days: Day[] }>)
      .then((json) => {
        if (!live) return;
        setLoaded({ key, days: json.days });
        // On first load, skip forward past months with nothing bookable.
        if (autoAdvanced.current < 2 && !json.days.some((d) => d.status === 'open' || d.status === 'request')) {
          autoAdvanced.current++;
          setMonth(shiftMonth(month, 1));
        }
      })
      .catch(() => live && setLoaded({ key, days: [] }));
    return () => {
      live = false;
    };
  }, [slug, month, reload]);

  const day = days?.find((d) => d.date === date) ?? null;
  const slot = day?.slots.find((s) => s.time === time) ?? null;
  const maxForSlot = slot ? slot.remaining : exp.maxGuests;
  // Guest counts always stay inside the limits of the tasting and the chosen slot.
  const cap = Math.max(1, Math.min(exp.maxGuests, maxForSlot));
  const adults = Math.max(1, Math.min(adultsRaw, cap));
  const children = Math.max(0, Math.min(childrenRaw, cap - adults));
  const guests = adults + children;
  const total = adults * exp.price;
  const ready = Boolean(day?.status === 'open' && slot?.status === 'open' && guests >= exp.minGuests && guests <= maxForSlot);

  // Lift the floating WhatsApp button above the mobile summary bar while it is shown.
  useEffect(() => {
    const root = document.documentElement;
    if (ready) root.setAttribute('data-booking-bar', '');
    else root.removeAttribute('data-booking-bar');
    return () => root.removeAttribute('data-booking-bar');
  }, [ready]);

  const grid = useMemo(() => {
    if (!days) return null;
    const first = new Date(`${month}-01T00:00:00Z`).getUTCDay(); // 0 Sun
    const pad = (first + 6) % 7; // Monday first
    return [...Array<null>(pad).fill(null), ...days];
  }, [days, month]);

  function chooseExperience(s: string) {
    setSlug(s);
    setTime(null); // keep the date; availability reloads for the new tasting
    autoAdvanced.current = 2;
  }

  function begin() {
    if (!startedRef.current) {
      startedRef.current = true;
      track({ name: 'booking_started', props: { experience: slug, guests } });
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready || !date || !time) return;
    const form = new FormData(e.currentTarget);
    begin();
    setStatus({ kind: 'loading' });
    try {
      const res = await fetch('/api/booking/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience: slug,
          date,
          time,
          adults,
          children,
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          notes: form.get('notes'),
          terms: form.get('terms') === 'on',
          website: form.get('website'),
          locale,
        }),
      });
      const json = (await res.json()) as { url?: string; error?: string; fields?: string[] };
      if (json.url) {
        location.assign(json.url);
        return;
      }
      const key = (json.error ?? 'generic') as keyof typeof w.errors;
      const msg = fill(l(w.errors[key] ?? w.errors.generic), { min: exp.minGuests, max: exp.maxGuests });
      setStatus({ kind: 'error', message: msg, fields: json.fields });
      if (res.status === 409) setReload((n) => n + 1);
    } catch {
      setStatus({ kind: 'error', message: l(w.errors.generic) });
    }
  }

  async function submitRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setReq({ kind: 'loading' });
    const res = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'winter',
        experience: slug,
        date,
        time: form.get('time') ?? '',
        guests,
        name: form.get('name'),
        email: form.get('email'),
        phone: form.get('phone'),
        message: form.get('message'),
        website: form.get('website'),
        locale,
      }),
    }).catch(() => null);
    setReq(res?.ok ? { kind: 'sent' } : { kind: 'error', message: l(w.errors.invalid) });
  }

  const invalid = (f: string) => status.kind === 'error' && status.fields?.includes(f);
  const money = (n: number) => formatEur(n, locale);
  const monthLabel = new Intl.DateTimeFormat(locale === 'hr' ? 'hr-HR' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
  const canPrev = month > monthOf(today);

  const stepLabel = (n: number, text: string) => (
    <legend className="label flex items-center gap-3 text-sun-deep">
      <span className="font-mono tracking-normal">0{n}</span>
      <span className="h-px w-6 bg-current opacity-50" aria-hidden />
      <span className="text-basalt">{text}</span>
    </legend>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_24rem] lg:gap-14">
      <div className="space-y-12">
        {/* 01 — tasting */}
        <fieldset>
          {stepLabel(1, l(w.chooseTasting))}
          <div className="mt-5 grid gap-2 sm:grid-cols-3" role="radiogroup">
            {experiences.map((e) => (
              <label
                key={e.slug}
                className={`flex cursor-pointer flex-col gap-1 border p-4 transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 ${
                  e.slug === slug ? 'border-plavac bg-plavac text-bone' : 'border-basalt/20 bg-limestone hover:border-basalt/50'
                }`}
              >
                <input type="radio" name="experience" value={e.slug} checked={e.slug === slug} onChange={() => chooseExperience(e.slug)} className="sr-only" />
                <span className="font-mono text-xs opacity-70">{['I', 'II', 'III'][e.tier - 1]}</span>
                <span className="text-lg leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {e.name}
                </span>
                <span className="text-sm opacity-80">
                  {money(e.price)} · {e.durationLabel}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 02 — date */}
        <fieldset>
          {stepLabel(2, l(w.chooseDate))}
          <div className="mt-5 border border-basalt/15 bg-limestone p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setMonth(shiftMonth(month, -1))} disabled={!canPrev} aria-label={l(w.prevMonth)} className="inline-flex size-11 items-center justify-center disabled:opacity-25">
                <ArrowRight size={18} className="rotate-180" />
              </button>
              <p className="text-xl capitalize" style={{ fontFamily: 'var(--font-display)' }} aria-live="polite">
                {monthLabel}
              </p>
              <button type="button" onClick={() => setMonth(shiftMonth(month, 1))} aria-label={l(w.nextMonth)} className="inline-flex size-11 items-center justify-center">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 text-center" aria-hidden>
              {l(w.weekdaysShort).map((d) => (
                <span key={d} className="label py-2 text-xs text-ink-soft">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid min-h-[17rem] grid-cols-7 gap-1">
              {!grid && <p className="col-span-7 self-center text-center text-sm text-ink-soft">{l(w.loading)}</p>}
              {grid?.map((d, i) => {
                if (!d) return <span key={`pad-${i}`} />;
                const n = Number(d.date.slice(8));
                const selectable = d.status === 'open' || d.status === 'request';
                const selected = d.date === date;
                const label = `${formatDate(d.date, locale)} — ${d.status === 'open' ? l(w.legend.open) : d.status === 'full' ? l(w.legend.full) : d.status === 'request' ? l(w.legend.request) : l(w.unavailable)}`;
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={selected}
                    aria-label={label}
                    onClick={() => {
                      setDate(d.date);
                      setTime(null);
                      begin();
                    }}
                    className={`relative flex aspect-square items-center justify-center font-mono text-sm transition-colors duration-300 ${
                      selected
                        ? 'bg-plavac text-bone'
                        : d.status === 'open'
                          ? 'bg-bone text-basalt hover:bg-sun-pale'
                          : d.status === 'request'
                            ? 'border border-dashed border-basalt/30 text-basalt hover:bg-sun-pale/60'
                            : d.status === 'full'
                              ? 'text-ink-soft line-through'
                              : 'text-basalt/30'
                    }`}
                  >
                    {n}
                    {d.date === today && <span aria-hidden className="absolute bottom-1.5 size-1 rounded-full bg-current" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
              <span className="flex items-center gap-2">
                <span className="size-3 bg-bone ring-1 ring-basalt/15" aria-hidden /> {l(w.legend.open)}
              </span>
              <span className="flex items-center gap-2">
                <span className="size-3 border border-dashed border-basalt/40" aria-hidden /> {l(w.legend.request)}
              </span>
              <span className="flex items-center gap-2">
                <span className="line-through">14</span> {l(w.legend.full)}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-soft">{l(w.leadTime)}</p>
        </fieldset>

        {/* 03 — time (or winter request) */}
        {day?.status === 'request' ? (
          <form onSubmit={submitRequest} className="border border-dashed border-basalt/30 p-5 sm:p-8">
            <p className="text-display-s font-light">{l(w.request.title)}</p>
            <p className="mt-3 text-ink-soft">{l(w.request.body)}</p>
            {req.kind === 'sent' ? (
              <p className="mt-6 text-lede" role="status">
                {l(w.request.sent)}
              </p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <GuestsStepper l={l} adults={adults} setAdults={setAdults} childCount={children} setChildren={setChildren} max={exp.maxGuests} price={money(exp.price)} />
                <Field label={l(w.request.time)} name="time" as="select" options={exp.winterSlots} />
                <Field label={l(w.name)} name="name" required autoComplete="name" />
                <Field label={l(w.email)} name="email" type="email" required autoComplete="email" />
                <Field label={l(w.phone)} name="phone" type="tel" autoComplete="tel" />
                <Field label={l(w.notes)} name="message" />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
                <div className="sm:col-span-2">
                  <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={req.kind === 'loading'}>
                    {l(w.request.submit)}
                  </button>
                  {req.kind === 'error' && (
                    <p className="mt-3 text-sm text-plavac" role="alert">
                      {req.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        ) : (
          <fieldset>
            {stepLabel(3, l(w.chooseTime))}
            {!day ? (
              <p className="mt-5 text-ink-soft">{l(w.noDate)}</p>
            ) : (
              <div className="mt-5 flex flex-wrap gap-2" role="radiogroup">
                {day.slots.map((s) => {
                  const open = s.status === 'open';
                  const sel = s.time === time;
                  return (
                    <label
                      key={s.time}
                      className={`flex min-w-28 flex-col border px-4 py-3 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 ${
                        sel ? 'border-plavac bg-plavac text-bone' : open ? 'cursor-pointer border-basalt/20 bg-limestone hover:border-basalt/50' : 'border-basalt/10 text-basalt/40'
                      }`}
                    >
                      <input type="radio" name="time" value={s.time} disabled={!open} checked={sel} onChange={() => setTime(s.time)} className="sr-only" />
                      <span className="font-mono text-lg">{s.time}</span>
                      <span className="text-xs opacity-80">
                        {open ? fill(l(w.seatsLeft), { n: s.remaining }) : s.status === 'full' ? l(w.full) : s.status === 'past' ? l(w.tooLate) : l(w.unavailable)}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>
        )}

        {/* 04 — guests */}
        {day?.status !== 'request' && (
          <fieldset>
            {stepLabel(4, l(w.guests))}
            <div className="mt-5 max-w-md">
              <GuestsStepper l={l} adults={adults} setAdults={setAdults} childCount={children} setChildren={setChildren} max={Math.min(exp.maxGuests, maxForSlot)} price={money(exp.price)} />
            </div>
          </fieldset>
        )}
      </div>

      {/* Summary + details + pay */}
      {day?.status !== 'request' && (
        <form onSubmit={submit} className="self-start lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]" noValidate>
          <div className="surface-shade grain p-6 sm:p-8">
            <p className="label text-sun">{l(w.title)}</p>
            <p className="mt-4 text-display-s font-light">{exp.name}</p>
            <dl className="mt-6 space-y-3 border-t border-bone/15 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone-light">{l(w.chooseDate)}</dt>
                <dd className="text-right">{date ? formatDate(date, locale, { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-light">{l(w.chooseTime)}</dt>
                <dd className="font-mono">{time ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone-light">{l(w.guests)}</dt>
                <dd>
                  {adults} × {money(exp.price)}
                  {children > 0 && ` + ${children} ${l(w.childrenLabel).toLowerCase()}`}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-bone/15 pt-5">
              <span className="label text-stone-light">{l(w.total)}</span>
              <span className="text-right">
                <span className="text-display-s font-light">{money(total)}</span>
                <span className="block text-xs text-stone-light">{l(w.vat)}</span>
              </span>
            </div>

            <fieldset ref={detailsRef} className="mt-8 space-y-4" disabled={!ready}>
              <legend className="label mb-4 text-sun">{l(w.details)}</legend>
              <Field dark label={l(w.name)} name="name" required autoComplete="name" invalid={invalid('name')} />
              <Field dark label={l(w.email)} name="email" type="email" required autoComplete="email" invalid={invalid('email')} />
              <Field dark label={l(w.phone)} name="phone" type="tel" autoComplete="tel" hint={l(w.phoneHint)} />
              <Field dark label={l(w.notes)} name="notes" as="textarea" />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <label className={`flex gap-3 text-sm leading-relaxed ${invalid('terms') ? 'text-sun-pale' : 'text-bone/80'}`}>
                <input type="checkbox" name="terms" required className="mt-1 size-4 shrink-0 accent-[var(--color-sun)]" />
                <span>
                  {l(w.terms).split('{terms}')[0]}
                  <Link href={{ pathname: '/legal/[slug]', params: { slug: 'terms' } }} className="underline underline-offset-4" target="_blank">
                    {l(w.termsLink)}
                  </Link>
                  {l(w.terms).split('{terms}')[1]}
                </span>
              </label>
            </fieldset>

            <button type="submit" disabled={!ready || status.kind === 'loading'} className="btn btn-sun mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40">
              {status.kind === 'loading' ? l(w.paying) : fill(l(w.pay), { total: money(total) })}
            </button>
            <p className="mt-3 text-center text-xs text-stone-light">{demo ? l(w.demoNote) : l(w.secure)}</p>
            <div aria-live="assertive">
              {status.kind === 'error' && (
                <p className="mt-4 border-l-2 border-sun pl-3 text-sm text-sun-pale" role="alert">
                  {status.message}
                </p>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Mobile: a sticky summary once a time is chosen */}
      {ready && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-plavac px-[var(--gutter)] py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] text-bone lg:hidden">
          <span className="text-sm">
            <span className="block font-mono text-xs text-bone/70">
              {date && formatDate(date, locale, { day: 'numeric', month: 'short' })} · {time} · {guests}
            </span>
            <span className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {money(total)}
            </span>
          </span>
          <button type="button" className="btn btn-sun min-h-11 px-5" onClick={() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            {l(w.details)}
          </button>
        </div>
      )}
    </div>
  );
}

function GuestsStepper({
  l,
  adults,
  setAdults,
  childCount,
  setChildren,
  max,
  price,
}: {
  l: <T>(x: { en: T; hr: T }) => T;
  adults: number;
  setAdults: (n: number) => void;
  childCount: number;
  setChildren: (n: number) => void;
  max: number;
  price: string;
}) {
  const total = adults + childCount;
  const row = (label: string, note: string, value: number, set: (n: number) => void, min: number) => (
    <div className="flex items-center justify-between gap-4 border-b border-basalt/15 py-3">
      <div>
        <p>{label}</p>
        <p className="text-xs text-ink-soft">{note}</p>
      </div>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`${label} −`} className="inline-flex size-11 items-center justify-center border border-basalt/20 text-lg disabled:opacity-30">
          −
        </button>
        <output className="w-10 text-center font-mono text-lg" aria-live="polite">
          {value}
        </output>
        <button type="button" onClick={() => set(value + 1)} disabled={total >= max} aria-label={`${label} +`} className="inline-flex size-11 items-center justify-center border border-basalt/20 text-lg disabled:opacity-30">
          +
        </button>
      </div>
    </div>
  );
  return (
    <div className="sm:col-span-2">
      {row(l(w.adults), fill(l(w.adultsNote), { price }), adults, setAdults, 1)}
      {row(l(w.childrenLabel), l(w.childrenNote), childCount, setChildren, 0)}
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  as = 'input',
  required,
  autoComplete,
  hint,
  invalid,
  dark,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  as?: 'input' | 'textarea' | 'select';
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  invalid?: boolean;
  dark?: boolean;
  options?: string[];
}) {
  const id = `f-${name}`;
  const cls = `mt-1.5 w-full border bg-transparent px-3 py-3 text-base outline-none transition-colors focus:border-current ${
    invalid ? 'border-sun' : dark ? 'border-bone/25' : 'border-basalt/25'
  }`;
  return (
    <div>
      <label htmlFor={id} className={`text-sm ${dark ? 'text-bone/80' : 'text-ink-soft'}`}>
        {label}
        {required && <span aria-hidden> *</span>}
      </label>
      {as === 'textarea' ? (
        <textarea id={id} name={name} rows={2} className={cls} />
      ) : as === 'select' ? (
        <select id={id} name={name} className={`${cls} ${dark ? '' : 'bg-limestone'}`}>
          {options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input id={id} name={name} type={type} required={required} autoComplete={autoComplete} aria-invalid={invalid || undefined} className={cls} />
      )}
      {hint && <p className={`mt-1 text-xs ${dark ? 'text-stone-light' : 'text-ink-soft'}`}>{hint}</p>}
    </div>
  );
}
