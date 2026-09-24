# CONTENT_TODO

Everything below is a placeholder or an unverified fact. Nothing here should go live unchanged.
Legend: 🔴 blocks launch · 🟡 needed for a convincing proposal · ⚪ nice to have

## Photography & video (content/image-slots.ts)
Real photography only. Drop files into `public/media/` and set `src` on the slot.
- 🟡 `hero-video` — ridge-to-sea descent, 12–20 s loop + poster frame (`hero-still`)
- 🟡 `ridge-view`, `stone-macro`, `vine-gobelet`
- 🟡 `tunnel-interior`, `tunnel-exit` — the Dingač tunnel
- 🟡 `mateo-portrait`, `hands-harvest`, `cellar-barrels`
- 🟡 `bottle-dingac`, `bottle-plavac`, `bottle-rose` — straight packshots
- 🟡 `tasting-table`, `keepers-table-food`, `road-peljesac`
- ⚪ `archive-1935` — only if a real document or photograph exists
- 🔴 Written permission to use every photo (photographer credit if required)
- ⚪ Estate logo as SVG (the site currently uses a typographic wordmark)

## Estate facts (content/site.ts)
- 🔴 OIB for the imprint and invoices
- 🔴 Exact coordinates of the tasting room (map + schema.org)
- 🟡 Confirm phone/WhatsApp, email and Instagram handle
- 🟡 Confirm VAT registration (assumed: yes, 25% included in prices)
- 🟡 Opening hours and season (currently "all year, winter by appointment")

## History claims (content/history-claims.ts — stage 3)
Each claim will carry a `source` field and `verified: false` until confirmed.
- 🔴 1935: Vicelić wine exported to Prague
- 🔴 1961: Dingač, the first Croatian wine with a protected designation of origin
- 🔴 1973: growers dig the Dingač tunnel by hand
- 🔴 Dr. Nikola Mirošević's research on Dingač
- 🔴 19th-century trade of Dingač wine to Bordeaux for blending
- 🟡 Years Mateo replanted and revived the vineyards
- 🟡 Mateo's own words for a quote on the Family page
- 🟡 Altitude range of the slope used by "the descent" (currently 350 m → 0 m)

## Tastings (content/experiences.ts — stage 4)
Proposal values chosen for the pitch. The owner must confirm them all.
- 🔴 Prices: The Slope €45 · The Keeper's Table €95 · Dingač Private €220 (per person)
- 🔴 Wines per tier: 3 / 3 / 4
- 🔴 Durations, min/max guests, slot times, capacity per slot
- 🔴 Cancellation policy (proposal: full payment, full refund up to 48 h before)
- 🟡 Food for The Keeper's Table (proposal: Pelješac cheese, prosciutto, Ston oysters)
- 🟡 Children welcome, grape juice, free (proposal)
- 🟡 Transport partner name, contact and price for the Dubrovnik/Ston transfer
- 🔴 Real driving time from Dubrovnik and from Ston

## Wines & shop (stages 5–6)
- 🔴 All bottle prices (`TBD`)
- 🔴 Case prices (3 and 6 bottles) and gift box price (3 wines, wooden box)
- 🔴 Current vintage for each wine
- 🔴 Stock counts
- 🔴 Shipping rates per zone (Croatia, EU)
- 🔴 **EU shipping of wine**: excise duty is due in the buyer's country, and a tax representative is usually required. The owner must confirm this is in place before EU zones are switched on.
- 🟡 Technical sheet details for Plavac Mali and Opolo Rosé (confirm against labels)

## Reviews
- 🟡 Real Tripadvisor/Google reviews with permission (placeholders are clearly marked)

## Legal (stage 8)
- 🔴 Terms of purchase, returns & complaints — needs the owner's or a lawyer's review
- 🔴 Privacy policy — data controller details
- 🔴 Imprint — OPG registration details

## Croatian copy
- 🟡 Every string marked `// REVIEW` in `content/messages/hr.ts` and elsewhere needs a native speaker's check.

## Accounts (when moving from proposal to production)
- Stripe account in the OPG's name (cards + Apple Pay + Google Pay)
- Hosting (Vercel Pro recommended for a commercial site)
- Domain / DNS for vicelic.hr, and a sending address for confirmations
- Plausible account
