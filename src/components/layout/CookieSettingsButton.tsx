'use client';

import { reopenConsent } from './ConsentBanner';

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={reopenConsent} className="text-left hover:text-bone">
      {label}
    </button>
  );
}
