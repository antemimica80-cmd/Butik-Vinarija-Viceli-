import '@fontsource-variable/hanken-grotesk/wght.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Vicelić — admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hr" data-age-ok="" data-consent="necessary">
      <body className="bg-limestone">{children}</body>
    </html>
  );
}
