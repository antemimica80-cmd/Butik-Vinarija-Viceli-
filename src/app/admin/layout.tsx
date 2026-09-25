import '@fontsource/ibm-plex-mono/400.css';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { FontFaces } from '@/components/layout/FontFaces';

export const metadata: Metadata = { title: 'Vicelić — admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hr" data-age-ok="" data-consent="necessary">
      <head>
        <FontFaces />
      </head>
      <body className="bg-limestone">{children}</body>
    </html>
  );
}
