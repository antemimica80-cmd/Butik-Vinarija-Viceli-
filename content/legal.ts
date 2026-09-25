/**
 * Legal pages — DRAFTS written for the proposal. A Croatian lawyer (or the owner's
 * accountant) must review every word before the site goes live. Each page shows a
 * visible draft notice while `draft: true`. TODO markers = facts only the owner has.
 */
type L = { en: string; hr: string };
export type Block = { h: L } | { p: L } | { ul: L[] };
export type LegalPage = { title: L; updated: string; draft: boolean; blocks: Block[] };

import { site } from './site';

const a = site.address;
const addr = `${site.legalName}, ${a.street}, ${a.postalCode} ${a.city}, Croatia`;

export const legalNotice = {
  draft: {
    en: 'Draft for review — this text has not yet been checked by a lawyer and is not in force.',
    hr: 'Nacrt za pregled — ovaj tekst još nije pregledao pravnik i nije na snazi.',
  },
  updated: { en: 'Last updated', hr: 'Zadnja izmjena' },
};

export const legal: Record<'terms' | 'privacy' | 'cookies' | 'imprint', LegalPage> = {
  terms: {
    title: { en: 'Terms of purchase and booking', hr: 'Uvjeti kupnje i rezervacije' },
    updated: 'TODO',
    draft: true,
    blocks: [
      { h: { en: '1. Who we are', hr: '1. Tko smo' } },
      {
        p: {
          en: `The seller and organiser is ${addr} (OIB: ${site.oib}). Contact: ${site.email}, ${site.phone}.`,
          hr: `Prodavatelj i organizator je ${addr} (OIB: ${site.oib}). Kontakt: ${site.email}, ${site.phone}.`,
        },
      },
      { h: { en: '2. Age', hr: '2. Dob' } },
      {
        p: {
          en: 'We sell and serve alcoholic drinks only to persons aged 18 or over. By buying or booking you confirm that you are 18 or older. Deliveries are handed only to an adult, who may be asked for identification. Children are welcome at tastings; they are not served alcohol.',
          hr: 'Alkoholna pića prodajemo i poslužujemo samo osobama starijima od 18 godina. Kupnjom ili rezervacijom potvrđujete da imate najmanje 18 godina. Pošiljke predajemo samo punoljetnoj osobi, od koje se može zatražiti identifikacija. Djeca su dobrodošla na degustacijama; ne poslužujemo im alkohol.',
        },
      },
      { h: { en: '3. Prices and payment', hr: '3. Cijene i plaćanje' } },
      {
        p: {
          en: 'All prices are in euros and include VAT at 25%. Shipping is shown before you pay. Payment is taken by card, Apple Pay or Google Pay through Stripe; we never see or store your card details. A receipt/invoice is sent by email.',
          hr: 'Sve cijene izražene su u eurima i uključuju PDV od 25 %. Trošak dostave prikazuje se prije plaćanja. Plaćanje se obavlja karticom, Apple Payem ili Google Payem putem Stripea; podatke o kartici nikada ne vidimo niti pohranjujemo. Račun šaljemo e-poštom.',
        },
      },
      { h: { en: '4. Tastings: booking and cancellation', hr: '4. Degustacije: rezervacija i otkazivanje' } },
      {
        ul: [
          { en: 'A tasting is booked when payment is complete and you receive our confirmation email.', hr: 'Degustacija je rezervirana kad je plaćanje dovršeno i primite našu potvrdu e-poštom.' },
          { en: 'Cancel 48 hours or more before the start: full refund.', hr: 'Otkaz najkasnije 48 sati prije početka: puni povrat novca.' },
          { en: 'Cancel less than 48 hours before, or no-show: no refund. We will try to move you to another day.', hr: 'Otkaz manje od 48 sati prije početka ili nedolazak: bez povrata novca. Pokušat ćemo vas premjestiti na drugi dan.' },
          { en: 'If we must cancel (weather, harvest, force majeure), you choose a new date or a full refund.', hr: 'Ako mi moramo otkazati (vrijeme, berba, viša sila), birate novi termin ili puni povrat novca.' },
          {
            en: 'Tastings are leisure services on a fixed date, so the 14-day right of withdrawal for distance contracts does not apply to them; the cancellation terms above apply instead.',
            hr: 'Degustacije su usluge slobodnog vremena na određeni datum, pa se na njih ne primjenjuje pravo na jednostrani raskid ugovora sklopljenog na daljinu u roku od 14 dana; umjesto toga vrijede gornji uvjeti otkazivanja.',
          },
        ],
      },
      { h: { en: '5. Wine orders and delivery', hr: '5. Narudžbe vina i dostava' } },
      {
        p: {
          en: 'We ship within Croatia and to EU countries listed at checkout. We do not ship to the United States or outside the EU. Delivery times: TODO (courier to be confirmed). Collection at the estate is free.',
          hr: 'Šaljemo unutar Hrvatske i u zemlje EU navedene pri plaćanju. Ne šaljemo u SAD niti izvan EU. Rokovi dostave: TODO (dostavna služba za potvrdu). Preuzimanje na imanju je besplatno.',
        },
      },
      { h: { en: '6. Right of withdrawal (wine orders)', hr: '6. Pravo na jednostrani raskid (narudžbe vina)' } },
      {
        p: {
          en: 'As a consumer you may withdraw from an online wine order within 14 days of receiving it, without giving a reason. Tell us in writing (email is fine), then return the unopened bottles within 14 days; you pay the return shipping. We refund the price and the standard delivery cost within 14 days of receiving the bottles back.',
          hr: 'Kao potrošač možete jednostrano raskinuti online narudžbu vina u roku od 14 dana od primitka, bez navođenja razloga. Obavijestite nas pisanim putem (dovoljna je e-pošta), zatim vratite neotvorene boce u roku od 14 dana; trošak povrata snosite vi. Cijenu i standardni trošak dostave vraćamo u roku od 14 dana od primitka vraćenih boca.',
        },
      },
      { h: { en: '7. Damaged bottles and complaints', hr: '7. Oštećene boce i prigovori' } },
      {
        p: {
          en: `If a bottle arrives broken or faulty, send us a photo within 48 hours and we replace it or refund it. Written complaints can be sent to ${site.email} or by post to ${addr}; we reply in writing within 15 days.`,
          hr: `Ako boca stigne razbijena ili neispravna, pošaljite nam fotografiju u roku od 48 sati i zamijenit ćemo je ili vratiti novac. Pisani prigovor možete poslati na ${site.email} ili poštom na ${addr}; odgovaramo pisanim putem u roku od 15 dana.`,
        },
      },
      { h: { en: '8. Law', hr: '8. Mjerodavno pravo' } },
      {
        p: {
          en: 'Croatian law applies, without taking away the protection you have under the law of your own country as a consumer.',
          hr: 'Primjenjuje se hrvatsko pravo, pri čemu vam ostaje zaštita koju kao potrošač imate prema pravu svoje države.',
        },
      },
    ],
  },

  privacy: {
    title: { en: 'Privacy policy', hr: 'Politika privatnosti' },
    updated: 'TODO',
    draft: true,
    blocks: [
      { h: { en: 'Controller', hr: 'Voditelj obrade' } },
      { p: { en: `${addr} (OIB: ${site.oib}) · ${site.email}`, hr: `${addr} (OIB: ${site.oib}) · ${site.email}` } },
      { h: { en: 'What we collect and why', hr: 'Što prikupljamo i zašto' } },
      {
        ul: [
          {
            en: 'Bookings and orders: name, email, phone, address (for delivery), what you booked or bought, notes you give us. To provide the tasting or deliver the wine (contract) and to keep accounting records (legal obligation).',
            hr: 'Rezervacije i narudžbe: ime, e-pošta, telefon, adresa (za dostavu), što ste rezervirali ili kupili, napomene koje nam date. Radi pružanja degustacije ili dostave vina (ugovor) i vođenja knjigovodstvene evidencije (zakonska obveza).',
          },
          {
            en: 'Enquiries (trade and winter requests): the details you send, to answer you (legitimate interest / pre-contract).',
            hr: 'Upiti (partnerski i zimski): podaci koje pošaljete, kako bismo vam odgovorili (legitimni interes / predugovorni odnos).',
          },
          {
            en: 'Payments: handled by Stripe. We receive the payment status, not your card details.',
            hr: 'Plaćanja: obavlja Stripe. Mi primamo status plaćanja, ne podatke o kartici.',
          },
          {
            en: 'Analytics: Plausible, without cookies and without personal data — only aggregate page counts.',
            hr: 'Analitika: Plausible, bez kolačića i bez osobnih podataka — samo zbirni broj posjeta.',
          },
        ],
      },
      { h: { en: 'Who processes data for us', hr: 'Tko za nas obrađuje podatke' } },
      {
        p: {
          en: 'Stripe (payments), Resend (email), our hosting and database providers (TODO: confirm, e.g. Vercel and Neon), Plausible (analytics). Some are outside the EU and use EU Standard Contractual Clauses.',
          hr: 'Stripe (plaćanja), Resend (e-pošta), pružatelji hostinga i baze podataka (TODO: potvrditi, npr. Vercel i Neon), Plausible (analitika). Neki su izvan EU i koriste standardne ugovorne klauzule EU.',
        },
      },
      { h: { en: 'How long we keep it', hr: 'Koliko dugo čuvamo podatke' } },
      {
        p: {
          en: 'Booking and order records are kept as long as accounting law requires (TODO: confirm the period with the accountant). Enquiries are deleted after 2 years without contact.',
          hr: 'Evidencija rezervacija i narudžbi čuva se onoliko koliko propisuje zakon o računovodstvu (TODO: rok potvrditi s računovođom). Upiti se brišu nakon 2 godine bez kontakta.',
        },
      },
      { h: { en: 'Your rights', hr: 'Vaša prava' } },
      {
        p: {
          en: `You can ask to see, correct, delete or export your data, or object to its use: write to ${site.email}. You may also complain to the Croatian Personal Data Protection Agency (AZOP).`,
          hr: `Možete zatražiti uvid, ispravak, brisanje ili prijenos svojih podataka te uložiti prigovor na njihovu obradu: pišite na ${site.email}. Pritužbu možete podnijeti i Agenciji za zaštitu osobnih podataka (AZOP).`,
        },
      },
    ],
  },

  cookies: {
    title: { en: 'Cookie policy', hr: 'Politika kolačića' },
    updated: 'TODO',
    draft: true,
    blocks: [
      {
        p: {
          en: 'We use as little as possible. Necessary cookies make the site work; anything else loads only if you choose “Allow all”. You can change your choice at any time with “Cookie settings” at the bottom of every page.',
          hr: 'Koristimo što je manje moguće. Nužni kolačići omogućuju rad stranice; sve ostalo učitava se samo ako odaberete „Dopusti sve”. Odabir možete promijeniti bilo kada putem „Postavke kolačića” na dnu svake stranice.',
        },
      },
      { h: { en: 'Necessary', hr: 'Nužni' } },
      {
        ul: [
          { en: 'vicelic_age — remembers that you confirmed you are 18 or older (1 year).', hr: 'vicelic_age — pamti da ste potvrdili da imate 18 ili više godina (1 godina).' },
          { en: 'vicelic_consent — remembers your cookie choice (1 year).', hr: 'vicelic_consent — pamti vaš odabir kolačića (1 godina).' },
          { en: 'NEXT_LOCALE — remembers your language (1 year).', hr: 'NEXT_LOCALE — pamti vaš jezik (1 godina).' },
          { en: 'Cart — stored in your browser (local storage), not a cookie, and never sent to us until you check out.', hr: 'Košarica — pohranjena u vašem pregledniku (local storage), nije kolačić i ne šalje nam se dok ne dovršite kupnju.' },
          { en: 'Stripe — sets its own cookies on its payment page to prevent fraud.', hr: 'Stripe — postavlja vlastite kolačiće na svojoj stranici za plaćanje radi sprječavanja prijevara.' },
        ],
      },
      { h: { en: 'Only with your consent', hr: 'Samo uz vaš pristanak' } },
      {
        ul: [
          { en: 'Map (OpenStreetMap) on the Visit and Experience pages.', hr: 'Karta (OpenStreetMap) na stranicama Posjet i Degustacije.' },
          { en: 'Video from third-party players, if we ever embed one.', hr: 'Video vanjskih pružatelja, ako ga ikad ugradimo.' },
        ],
      },
      { h: { en: 'Analytics', hr: 'Analitika' } },
      {
        p: {
          en: 'Plausible Analytics sets no cookies and collects no personal data, so it runs without a consent banner.',
          hr: 'Plausible Analytics ne postavlja kolačiće i ne prikuplja osobne podatke, pa radi bez traženja pristanka.',
        },
      },
    ],
  },

  imprint: {
    title: { en: 'Imprint', hr: 'Impresum' },
    updated: 'TODO',
    draft: true,
    blocks: [
      {
        ul: [
          { en: `Name: ${site.legalName}`, hr: `Naziv: ${site.legalName}` },
          { en: 'Legal form: family farm (obiteljsko poljoprivredno gospodarstvo, OPG)', hr: 'Pravni oblik: obiteljsko poljoprivredno gospodarstvo (OPG)' },
          { en: `Address: ${a.street}, ${a.postalCode} ${a.city}, Croatia`, hr: `Adresa: ${a.street}, ${a.postalCode} ${a.city}, Hrvatska` },
          { en: `OIB: ${site.oib}`, hr: `OIB: ${site.oib}` },
          { en: 'MIBPG (farm ID): TODO', hr: 'MIBPG: TODO' },
          { en: 'VAT ID: TODO', hr: 'PDV ID: TODO' },
          { en: `Responsible person: ${site.winemaker}`, hr: `Odgovorna osoba: ${site.winemaker}` },
          { en: `Contact: ${site.email} · ${site.phone}`, hr: `Kontakt: ${site.email} · ${site.phone}` },
          { en: 'Organic certification body and certificate number: TODO', hr: 'Certifikacijsko tijelo za ekološku proizvodnju i broj certifikata: TODO' },
        ],
      },
      {
        p: {
          en: 'Photography: © the photographers credited (TODO). Design and website: TODO.',
          hr: 'Fotografije: © navedeni fotografi (TODO). Dizajn i izrada: TODO.',
        },
      },
    ],
  },
};
