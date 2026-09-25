/**
 * Guest reviews. PLACEHOLDERS ONLY — never invent a quote.
 * Replace with real reviews (with the guest's permission or from a public platform),
 * set placeholder: false and fill author / platform / url.
 */
export type Testimonial = {
  placeholder: boolean;
  quote: { en: string; hr: string };
  author: string;
  origin: string;
  platform: 'Tripadvisor' | 'Google' | 'Other';
  url: string | null;
};

const placeholderQuote = {
  en: 'A real guest review will appear here — a sentence or two, in the guest’s own words.',
  hr: 'Ovdje će stajati stvarna recenzija gosta — rečenica ili dvije, njegovim riječima.',
};

export const testimonials: Testimonial[] = [
  { placeholder: true, quote: placeholderQuote, author: 'Guest name', origin: 'City, Country', platform: 'Tripadvisor', url: null },
  { placeholder: true, quote: placeholderQuote, author: 'Guest name', origin: 'City, Country', platform: 'Google', url: null },
  { placeholder: true, quote: placeholderQuote, author: 'Guest name', origin: 'City, Country', platform: 'Tripadvisor', url: null },
];
