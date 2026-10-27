import type { ReactNode } from "react";
import "./globals.css";

// The <html> element is rendered by app/[locale]/layout.tsx so it can carry the `lang` attribute.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
