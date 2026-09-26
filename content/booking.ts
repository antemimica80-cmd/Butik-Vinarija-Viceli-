/**
 * Copy for the Experience page, the booking widget, confirmations and emails.
 * Policies are PROPOSAL VALUES — confirm with the owner (see CONTENT_TODO.md).
 */
type L = { en: string; hr: string };

export const experiencePage = {
  eyebrow: { en: 'The Experience', hr: 'Degustacije' }, // REVIEW
  title: { en: 'The Experience', hr: 'Degustacije' }, // REVIEW — used for the page title / SEO
  heroTitle: { en: ['Taste Dingač', 'where it is born.'], hr: ['Kušajte Dingač', 'ondje gdje nastaje.'] }, // REVIEW
  heroLede: {
    en: 'Three tastings on the Dingač terroir, above the Adriatic. Choose a date, pay securely, and the family will be waiting.',
    hr: 'Tri degustacije na terroiru Dingača, iznad Jadrana. Odaberite datum, platite sigurno, a obitelj vas čeka.', // REVIEW
  },
  heroCta: { en: 'Book a tasting', hr: 'Rezerviraj degustaciju' },
  heroSecondary: { en: 'The three tastings', hr: 'Tri degustacije' }, // REVIEW
  metaWines: { en: 'wines', hr: 'vina' },
  metaGuests: { en: 'guests', hr: 'gostiju' },
  metaFood: { en: 'local food', hr: 'domaća hrana' }, // REVIEW
  metaPrivate: { en: 'private', hr: 'privatno' },
  bookNamed: { en: 'Book {name}', hr: 'Rezerviraj {name}' },
  viewExperience: { en: 'View the experience', hr: 'Pogledajte iskustvo' }, // REVIEW
  hideExperience: { en: 'Close', hr: 'Zatvori' },
  signature: {
    label: { en: 'The signature experience', hr: 'Ekskluzivno iskustvo' }, // REVIEW
    detail: { en: 'Private · max {max} guests', hr: 'Privatno · najviše {max} gostiju' }, // REVIEW
  },
  bookingEyebrow: { en: 'Reserve', hr: 'Rezervacija' },
  bookingTitle: { en: 'Choose your day on the terroir.', hr: 'Odaberite svoj dan na terroiru.' }, // REVIEW
  whereOverlay: {
    en: ['Above the Adriatic.', 'On the southern slopes of Pelješac.'],
    hr: ['Iznad Jadrana.', 'Na južnim obroncima Pelješca.'], // REVIEW
  },
  route: [
    { name: { en: 'Dubrovnik', hr: 'Dubrovnik' }, time: { en: 'start', hr: 'polazak' } },
    { name: { en: 'Ston', hr: 'Ston' }, time: { en: '~TODO min', hr: '~TODO min' } },
    { name: { en: 'Dingač', hr: 'Dingač' }, time: { en: '~TODO min', hr: '~TODO min' } },
  ],
  tradeBanner: {
    label: { en: 'For hotels, concierges & private drivers', hr: 'Za hotele, concierge službe i privatne vozače' }, // REVIEW
    text: { en: 'Trade bookings and private arrangements.', hr: 'Partnerske rezervacije i privatni dogovori.' }, // REVIEW
    cta: { en: 'Enquire', hr: 'Upit' },
  },
  lede: {
    en: 'Three tastings, one terroir. Choose a date, choose a time, pay securely. You will have a confirmation in your inbox before you close this page.',
    hr: 'Tri degustacije, jedan terroir. Odaberite datum i vrijeme, platite sigurno. Potvrda će vam stići e-poštom prije nego zatvorite ovu stranicu.', // REVIEW
  },
  jump: { en: 'Choose a date', hr: 'Odaberite datum' }, // REVIEW
  perPerson: { en: 'per person', hr: 'po osobi' },
  duration: { en: 'Duration', hr: 'Trajanje' },
  group: { en: 'Group', hr: 'Grupa' },
  wines: { en: 'Wines', hr: 'Vina' },
  food: { en: 'Food', hr: 'Hrana' },
  languages: { en: 'Languages', hr: 'Jezici' },
  included: { en: 'Included', hr: 'Uključeno' },
  children: { en: 'Children', hr: 'Djeca' },
  guestsRange: { en: '{min}–{max} guests', hr: '{min}–{max} gostiju' }, // REVIEW
  noFood: { en: 'Wine only', hr: 'Samo vino' },
  expect: { en: 'What to expect', hr: 'Što vas očekuje' }, // REVIEW
  book: { en: 'Book this tasting', hr: 'Rezerviraj ovu degustaciju' }, // REVIEW
  proposal: { en: 'Proposal prices and times — to be confirmed by the estate.', hr: 'Predložene cijene i termini — potvrđuje vinarija.' },
  langNames: { en: { en: 'English', hr: 'Croatian' }, hr: { en: 'engleski', hr: 'hrvatski' } },
  where: {
    eyebrow: { en: 'Where', hr: 'Gdje' },
    title: { en: 'On the Pelješac peninsula, above the sea.', hr: 'Na poluotoku Pelješcu, iznad mora.' }, // REVIEW
    fromDubrovnik: { en: 'From Dubrovnik: ~TODO min by car', hr: 'Iz Dubrovnika: ~TODO min automobilom' },
    transfer: {
      en: 'No car? Our transfer partner collects from Dubrovnik and Ston. Mention it in your booking notes.',
      hr: 'Nemate automobil? Naš partner za prijevoz dolazi po vas u Dubrovnik i Ston. Navedite to u napomeni uz rezervaciju.', // REVIEW
    },
    directions: { en: 'Directions', hr: 'Upute za dolazak' },
  },
  faqTitle: { en: 'Before you come', hr: 'Prije dolaska' }, // REVIEW
  trade: {
    eyebrow: { en: 'For concierges & tour operators', hr: 'Za concierge službe i turoperatore' }, // REVIEW
    title: { en: 'Booking for your guests?', hr: 'Rezervirate za svoje goste?' }, // REVIEW
    body: {
      en: 'Hotels, private drivers and agencies: tell us who you are and we will send trade rates and a direct line for your bookings.',
      hr: 'Hoteli, privatni vozači i agencije: javite nam tko ste i poslat ćemo vam partnerske cijene i izravan kontakt za rezervacije.', // REVIEW
    },
    fields: {
      company: { en: 'Company / hotel', hr: 'Tvrtka / hotel' },
      role: { en: 'Your role', hr: 'Vaša uloga' },
      name: { en: 'Name', hr: 'Ime i prezime' },
      email: { en: 'Email', hr: 'E-pošta' },
      phone: { en: 'Phone / WhatsApp', hr: 'Telefon / WhatsApp' },
      volume: { en: 'Guests per season (approx.)', hr: 'Gostiju po sezoni (okvirno)' }, // REVIEW
      message: { en: 'Anything else', hr: 'Napomena' },
    },
    roles: [
      { en: 'Hotel concierge', hr: 'Hotelski concierge' },
      { en: 'Private driver', hr: 'Privatni vozač' },
      { en: 'Tour operator / agency', hr: 'Turoperator / agencija' },
      { en: 'Other', hr: 'Ostalo' },
    ],
    submit: { en: 'Request trade rates', hr: 'Zatražite partnerske cijene' }, // REVIEW
    sent: { en: 'Thank you. We will reply within one working day.', hr: 'Hvala. Odgovorit ćemo unutar jednog radnog dana.' }, // REVIEW
  },
};

export const widget = {
  title: { en: 'Book a tasting', hr: 'Rezervirajte degustaciju' }, // REVIEW
  step: { en: 'Step', hr: 'Korak' },
  chooseTasting: { en: 'Tasting', hr: 'Degustacija' },
  chooseDate: { en: 'Date', hr: 'Datum' },
  chooseTime: { en: 'Time', hr: 'Vrijeme' },
  guests: { en: 'Guests', hr: 'Gosti' },
  adults: { en: 'Adults', hr: 'Odrasli' },
  adultsNote: { en: '18+ · {price} each', hr: '18+ · {price} po osobi' }, // REVIEW
  childrenLabel: { en: 'Children', hr: 'Djeca' },
  childrenNote: { en: 'Under 18 · free · grape juice', hr: 'Mlađi od 18 · besplatno · sok od grožđa' }, // REVIEW
  details: { en: 'Your details', hr: 'Vaši podaci' },
  name: { en: 'Full name', hr: 'Ime i prezime' },
  email: { en: 'Email', hr: 'E-pošta' },
  phone: { en: 'Phone / WhatsApp', hr: 'Telefon / WhatsApp' },
  phoneHint: { en: 'So we can reach you on the day.', hr: 'Kako bismo vas mogli dobiti na dan dolaska.' }, // REVIEW
  notes: { en: 'Notes — dietary needs, transfer, occasion', hr: 'Napomena — prehrana, prijevoz, prigoda' }, // REVIEW
  terms: {
    en: 'I accept the {terms}. Full refund if cancelled 48 hours or more before the tasting.',
    hr: 'Prihvaćam {terms}. Puni povrat novca za otkaz najkasnije 48 sati prije degustacije.', // REVIEW
  },
  termsLink: { en: 'terms of booking', hr: 'uvjete rezervacije' },
  total: { en: 'Total', hr: 'Ukupno' },
  vat: { en: 'VAT included', hr: 'PDV uključen' },
  pay: { en: 'Pay {total} securely', hr: 'Platite {total} sigurno' }, // REVIEW
  bookSecurely: { en: 'Book securely', hr: 'Rezerviraj sigurno' }, // REVIEW
  book: { en: 'Book', hr: 'Rezerviraj' },
  guestsCount: { en: '{n} guests', hr: 'gostiju: {n}' }, // REVIEW
  paying: { en: 'Opening secure payment…', hr: 'Otvaramo sigurno plaćanje…' }, // REVIEW
  secure: { en: 'Card, Apple Pay or Google Pay · processed by Stripe', hr: 'Kartica, Apple Pay ili Google Pay · obrađuje Stripe' }, // REVIEW
  demoNote: { en: 'Demo mode — no real payment is taken.', hr: 'Demo način — ne naplaćuje se stvarno.' },
  prevMonth: { en: 'Previous month', hr: 'Prethodni mjesec' },
  nextMonth: { en: 'Next month', hr: 'Sljedeći mjesec' },
  loading: { en: 'Checking availability…', hr: 'Provjeravamo dostupnost…' }, // REVIEW
  noDate: { en: 'Choose a date to see times.', hr: 'Odaberite datum za prikaz termina.' }, // REVIEW
  seatsLeft: { en: '{n} left', hr: 'još {n}' }, // REVIEW
  full: { en: 'Full', hr: 'Popunjeno' },
  tooLate: { en: 'Too soon', hr: 'Prekasno' }, // REVIEW
  unavailable: { en: 'Unavailable', hr: 'Nedostupno' },
  legend: { open: { en: 'Available', hr: 'Slobodno' }, full: { en: 'Full', hr: 'Popunjeno' }, request: { en: 'On request', hr: 'Na upit' } },
  leadTime: { en: 'Bookings close 12 hours before each tasting.', hr: 'Rezervacije se zatvaraju 12 sati prije svake degustacije.' }, // REVIEW
  request: {
    title: { en: 'Winter tastings are by appointment.', hr: 'Zimske degustacije su uz najavu.' }, // REVIEW
    body: {
      en: 'Tell us the day and the size of your group. We confirm within a day, then send a payment link.',
      hr: 'Javite nam dan i veličinu grupe. Potvrdit ćemo unutar jednog dana i poslati poveznicu za plaćanje.', // REVIEW
    },
    time: { en: 'Preferred time', hr: 'Željeno vrijeme' },
    submit: { en: 'Send request', hr: 'Pošaljite upit' },
    sent: { en: 'Request sent. We will write to you within a day.', hr: 'Upit je poslan. Javit ćemo vam se unutar jednog dana.' }, // REVIEW
  },
  errors: {
    generic: { en: 'Something went wrong. Please try again, or message us on WhatsApp.', hr: 'Nešto nije u redu. Pokušajte ponovno ili nam pišite na WhatsApp.' }, // REVIEW
    not_enough_seats: { en: 'Those seats were just taken. Please choose another time.', hr: 'Ta su mjesta upravo zauzeta. Odaberite drugi termin.' }, // REVIEW
    slot_unavailable: { en: 'That time is no longer available.', hr: 'Taj termin više nije dostupan.' }, // REVIEW
    date_unavailable: { en: 'That date is no longer available.', hr: 'Taj datum više nije dostupan.' }, // REVIEW
    too_few_guests: { en: 'This tasting needs at least {min} guests.', hr: 'Za ovu degustaciju potrebno je najmanje {min} gostiju.' }, // REVIEW
    too_many_guests: { en: 'For more than {max} guests, please contact us.', hr: 'Za više od {max} gostiju, javite nam se.' }, // REVIEW
    invalid: { en: 'Please check the highlighted fields.', hr: 'Provjerite označena polja.' }, // REVIEW
  },
  weekdaysShort: { en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], hr: ['Po', 'Ut', 'Sr', 'Če', 'Pe', 'Su', 'Ne'] },
};

export const confirmation = {
  eyebrow: { en: 'Booking confirmed', hr: 'Rezervacija potvrđena' }, // REVIEW
  title: { en: 'The terroir is expecting you.', hr: 'Terroir vas očekuje.' }, // REVIEW
  pendingTitle: { en: 'Confirming your payment…', hr: 'Potvrđujemo vaše plaćanje…' }, // REVIEW
  pendingBody: { en: 'This takes a few seconds. You can refresh this page.', hr: 'To traje nekoliko sekundi. Možete osvježiti stranicu.' }, // REVIEW
  failedTitle: { en: 'This booking was not completed.', hr: 'Ova rezervacija nije dovršena.' }, // REVIEW
  failedBody: { en: 'No payment was taken. The seats have been released.', hr: 'Ništa nije naplaćeno. Mjesta su oslobođena.' }, // REVIEW
  tryAgain: { en: 'Choose another time', hr: 'Odaberite drugi termin' },
  sentTo: { en: 'A confirmation has been sent to {email}.', hr: 'Potvrda je poslana na {email}.' }, // REVIEW
  reference: { en: 'Reference', hr: 'Broj rezervacije' },
  when: { en: 'When', hr: 'Kada' },
  guests: { en: 'Guests', hr: 'Gosti' },
  paid: { en: 'Paid', hr: 'Plaćeno' },
  where: { en: 'Where', hr: 'Gdje' },
  addToCalendar: { en: 'Add to calendar', hr: 'Dodaj u kalendar' },
  directions: { en: 'Directions', hr: 'Upute za dolazak' },
  whatsapp: { en: 'Message us on WhatsApp', hr: 'Pišite nam na WhatsApp' },
  whatsappText: { en: 'Hello, this is about my booking {ref}.', hr: 'Dobar dan, javljam se u vezi rezervacije {ref}.' }, // REVIEW
  cancellation: {
    en: 'Plans change. Cancel 48 hours or more before your tasting for a full refund — just reply to the confirmation email or message us.',
    hr: 'Planovi se mijenjaju. Otkažite najkasnije 48 sati prije degustacije za puni povrat — odgovorite na e-poruku s potvrdom ili nam pišite.', // REVIEW
  },
  // EN plural forms are chosen in code (adult/adults, child/children); HR uses a count form that needs no plural.
  adultsChildren: { en: '{adults} {adultWord}, {children} {childWord}', hr: 'odraslih: {adults}, djece: {children}' }, // REVIEW
  adultsOnly: { en: '{adults} {adultWord}', hr: 'odraslih: {adults}' }, // REVIEW
};

export const email = {
  guestSubject: { en: 'Your tasting at Vicelić — {when}', hr: 'Vaša degustacija u vinariji Vicelić — {when}' }, // REVIEW
  greeting: { en: 'Dear {name},', hr: 'Poštovani/a {name},' }, // REVIEW
  intro: {
    en: 'Your tasting on Dingač is booked. We look forward to welcoming you.',
    hr: 'Vaša degustacija na Dingaču je rezervirana. Veselimo se vašem dolasku.', // REVIEW
  },
  ics: { en: 'The calendar invitation is attached.', hr: 'Pozivnica za kalendar je u privitku.' }, // REVIEW
  signoff: { en: 'See you on the terroir,', hr: 'Vidimo se na terroiru,' }, // REVIEW
  family: { en: 'The Vicelić family', hr: 'Obitelj Vicelić' },
  wineryNew: { en: 'New booking', hr: 'Nova rezervacija' },
  wineryOverbooked: {
    en: 'WARNING: this payment arrived after the seat hold expired and the slot is now over capacity. Please contact the guest.',
    hr: 'UPOZORENJE: plaćanje je stiglo nakon isteka zadržavanja i termin je sada prebukiran. Molimo kontaktirajte gosta.',
  },
};

export const faq: { q: L; a: L }[] = [
  {
    q: { en: 'Can we bring children?', hr: 'Možemo li povesti djecu?' }, // REVIEW
    a: {
      en: 'Yes. Children are welcome and free of charge; they get grape juice from our own grapes. Please add them when you book so we set a place.',
      hr: 'Da. Djeca su dobrodošla i ne plaćaju; dobivaju sok od našeg grožđa. Dodajte ih pri rezervaciji kako bismo pripremili mjesto.', // REVIEW
    },
  },
  {
    q: { en: 'Accessibility', hr: 'Pristupačnost' }, // REVIEW
    a: {
      en: 'TODO: owner to describe step-free access to the terrace and the cellar, and whether the vineyard walk suits limited mobility.',
      hr: 'TODO: vlasnik treba opisati pristup bez stepenica do terase i podruma te je li šetnja vinogradom prikladna za osobe smanjene pokretljivosti.',
    },
  },
  {
    q: { en: 'Dietary requirements', hr: 'Posebna prehrana' }, // REVIEW
    a: {
      en: "Tell us in the booking notes — vegetarian, no shellfish, allergies. The Keeper's Table is adapted for you.",
      hr: 'Navedite u napomeni uz rezervaciju — vegetarijanska prehrana, bez školjaka, alergije. Keeper’s Table prilagodit ćemo vama.', // REVIEW
    },
  },
  {
    q: { en: 'Cancellation', hr: 'Otkazivanje' }, // REVIEW
    a: {
      en: 'Cancel 48 hours or more before your tasting and we refund you in full. Later than that, the booking cannot be refunded, but we will always try to move you to another day.',
      hr: 'Otkažete li najkasnije 48 sati prije degustacije, vraćamo cijeli iznos. Nakon toga povrat nije moguć, ali uvijek ćemo vas pokušati premjestiti na drugi dan.', // REVIEW
    },
  },
  {
    q: { en: 'Getting here', hr: 'Kako doći' }, // REVIEW
    a: {
      en: 'By car along the coast to Ston, then along the Pelješac road (~TODO min). No car? Our transfer partner collects from Dubrovnik and Ston — mention it when you book.',
      hr: 'Automobilom uz obalu do Stona, zatim cestom kroz Pelješac (~TODO min). Nemate automobil? Naš partner za prijevoz dolazi po vas u Dubrovnik i Ston — navedite to pri rezervaciji.', // REVIEW
    },
  },
  {
    q: { en: 'Who drives?', hr: 'Tko vozi?' }, // REVIEW
    a: {
      en: 'Please plan a designated driver — drink-driving limits in Croatia are strict. There is water and a spittoon on every table, and we are glad to recommend a driver.',
      hr: 'Molimo dogovorite vozača koji neće piti — ograničenja za vožnju pod utjecajem alkohola u Hrvatskoj su stroga. Na svakom stolu su voda i posuda za izlijevanje, a rado ćemo vam preporučiti vozača.', // REVIEW
    },
  },
];
