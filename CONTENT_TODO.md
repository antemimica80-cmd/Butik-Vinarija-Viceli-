# CONTENT_TODO

Everything below is a placeholder or an unverified fact. Nothing here should go live unchanged.
Legend: 🔴 blocks launch · 🟡 needed for a convincing proposal · ⚪ nice to have

## Photography & video (content/image-slots.ts)
Real photography only. Drop files into `public/media/` and set `src` on the slot.

✅ In use: aerial of Dingač (hero), terrace & sea (ridge), slope to the sea (tunnel exit, Dingač hero),
guests toasting (The Slope), cheese & prosciutto (Keeper's Table), pouring wine (Dingač Private);
a couple toasting is uploaded and not yet placed.
- 🟡 Higher-resolution originals (current files are ~1180 px wide; the hero is shown up to 1440+ px)
- 🔴 The bottle images uploaded so far appear AI-generated (label typos, 1024×1536) — kept out of the site in `media-inbox/`. Real packshots needed.
- 🔴 Who is the man serving cheese in `serving-cheese-prosciutto.jpg`? (Not labelled as Mateo until confirmed.)
- 🟡 Logo file (SVG or transparent PNG) to replace the typographic wordmark
- 🟡 `hero-video` — ridge-to-sea descent, 12–20 s loop (the aerial still is used until then)
- 🟡 `stone-macro`, `vine-gobelet`
- 🟡 `tunnel-interior` — the Dingač tunnel
- 🟡 `mateo-portrait`, `hands-harvest`, `cellar-barrels`
- 🟡 `bottle-dingac`, `bottle-plavac`, `bottle-rose` — straight packshots
- 🟡 `road-peljesac`
- ⚪ `archive-1935` — only if a real document or photograph exists
- 🔴 Written permission to use every photo (photographer credit if required)
- ⚪ Estate logo as SVG (the site currently uses a typographic wordmark)

## Estate facts (content/site.ts)
- 🔴 OIB for the imprint and invoices
- 🔴 Exact coordinates of the tasting room (map + schema.org)
- 🟡 Confirm phone/WhatsApp, email and Instagram handle
- 🟡 Confirm VAT registration (assumed: yes, 25% included in prices)
- 🟡 Opening hours and season (currently "all year, winter by appointment")

## History claims (content/history-claims.ts)
Each claim has a `source` field (currently TODO) and `verified: false`. The home page shows them as written — confirm or correct the wording, too.
- 🔴 1935: Vicelić wine exported to Prague
- 🔴 1961: Dingač, the first Croatian wine with a protected designation of origin
- 🔴 1973: growers dig the Dingač tunnel by hand
- 🔴 Dr. Nikola Mirošević's research on Dingač
- 🔴 19th-century trade of Dingač wine to Bordeaux for blending
- 🟡 Years Mateo replanted and revived the vineyards
- 🟡 Mateo's own words for a quote on the Family page
- 🟡 Altitude range of the slope used by "the descent" (currently 350 m → 0 m)

## Tastings (content/experiences.ts, content/availability.ts, content/booking.ts)
Proposal values chosen for the pitch. The owner must confirm them all.
- 🔴 Prices: The Slope €45 · The Keeper's Table €95 · Dingač Private €220 (per person)
- 🔴 Wines per tier: 3 / 3 / 4
- 🔴 Durations, min/max guests, slot times, capacity per slot
- 🔴 Cancellation policy (proposal: full payment, full refund up to 48 h before)
- 🟡 Food for The Keeper's Table (proposal: Pelješac cheese, prosciutto, Ston oysters)
- 🟡 Children welcome, grape juice, free (proposal)
- 🟡 Transport partner name, contact and price for the Dubrovnik/Ston transfer
- 🔴 Real driving time from Dubrovnik and from Ston
- 🔴 "What to expect" minute-by-minute schedule for each tasting (proposal text)
- 🔴 Can two tastings run at the same time? (currently yes — separate capacity; `sharedCapacity` in availability.ts)
- 🟡 Blackout dates (harvest, holidays) and winter slot times
- 🟡 Lead time (12 h) and how far ahead guests may book (270 days)
- 🔴 FAQ: accessibility answer (TODO in content/booking.ts)
- 🟡 FAQ: dietary, cancellation, transport, designated driver — confirm wording
- 🟡 Trade enquiries: who answers, and the promised reply time (one working day)

## Wines & shop (stages 5–6)
- 🔴 Bottle prices — proposal values in content/products.ts: Dingač €55, Plavac Mali €28, Opolo Rosé €22
- 🔴 Cases are priced as n × bottle (no discount) — confirm, or set a case discount
- 🔴 Gift box: name ("The Three Suns Box" is a proposal), price (proposal €115), photo
- 🔴 Current vintage for each wine
- 🔴 Stock counts (proposal: 600 / 300 / 240 bottles in content/products.ts)
- 🔴 Shipping rates — proposal in content/shipping.ts: Croatia €7 (free from 6 bottles), EU €25; courier and parcel limits (36 HR / 18 EU bottles)
- 🟡 Pickup at the estate — confirm this is offered
- 🔴 **EU shipping of wine**: excise duty is due in the buyer's country, and a tax representative is usually required. The owner must confirm this is in place before EU zones are switched on.
- 🟡 Technical sheet details for Plavac Mali and Opolo Rosé (confirm against labels)
- 🟡 Parcel names for Plavac Mali and Opolo Rosé (`TBD` in content/wines.ts)
- 🟡 Food pairing for Dingač (`TBD` — not stated on vicelic.hr)

## Dingač & Family pages (content/dingac.ts, content/family.ts)
- 🔴 Sources for the footnoted claims on /dingac (the Sources list shows "to be added" until then)
- 🟡 Confirm the descriptive copy: "too steep for machines", gobelet training, roots in rock, the stone giving heat back at night
- 🔴 Mateo's own words for the quote on /family (clearly marked placeholder)
- 🔴 Years for "The return" (replanting) and organic certification (shown as "year TBD")
- 🟡 Confirm "war and collectivisation" as the family's story, in those words
- 🟡 Archive document or photo for 1935, if one exists

## Home page (content/home.ts)
- 🟡 "The silence" beat (war, collectivisation) — confirm the family's story in these words
- 🟡 Year of "The return" (Mateo's replanting)
- 🟡 Route descriptions from Dubrovnik, Ston and Split, and real driving times (`~TODO`)
- ⚪ All English copy is a proposal in the brand voice — the owner should read it once end to end

## Reviews
- 🟡 Real Tripadvisor/Google reviews with permission (placeholders are clearly marked)

## Legal (content/legal.ts — drafts, shown with a "draft for review" notice)
- 🔴 Lawyer review of all four pages: terms of purchase & booking, privacy, cookies, imprint
- 🔴 OIB, MIBPG, VAT ID, organic certification body and certificate number (imprint)
- 🔴 Courier and delivery times; retention period for accounting records (with the accountant)
- 🔴 Hosting / database providers to name in the privacy policy
- 🟡 "Last updated" dates

## Visit page (content/visit.ts)
- 🔴 Exact opening hours
- 🟡 Parking, accessibility of the tasting room

## Croatian copy
- 🟡 Every string marked `// REVIEW` in `content/messages/hr.ts` and elsewhere needs a native speaker's check.

## Accounts (when moving from proposal to production)
- Stripe test keys first (`sk_test_…`, `pk_test_…`, webhook secret) — until then the site runs in demo-payment mode
- Neon/Postgres `DATABASE_URL` (local builds use an embedded database in `.data/`)
- Resend API key + verified sending domain; `WINERY_NOTIFY_EMAIL` for booking notifications
- `ADMIN_PASSWORD` for /admin
- Stripe account in the OPG's name (cards + Apple Pay + Google Pay)
- Hosting (Vercel Pro recommended for a commercial site)
- Domain / DNS for vicelic.hr, and a sending address for confirmations
- Plausible account
