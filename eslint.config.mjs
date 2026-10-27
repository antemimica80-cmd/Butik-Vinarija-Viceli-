import cwv from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

export default [
  ...cwv,
  ...ts,
  // App Router project: plain <a> is used only for API downloads and the locale-less 404 page.
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
  { ignores: [".next/**", "node_modules/**", "storage/**", "playwright-report/**", "test-results/**", "next-env.d.ts", "public/vendor/**"] },
];
