# Testing and QA

## Automated checks (all passing at handover)

| Check | Command | Result |
|---|---|---|
| TypeScript (strict) | `npm run typecheck` | clean |
| ESLint | `npm run lint` | 0 errors (warnings: intentional `<img>` for user uploads served through the access-controlled media route) |
| Unit + DB integration | `npm test` | 26 tests |
| End-to-end (Playwright) | `npm run test:e2e` | 18 tests (16 desktop, 2 mobile) |
| Production build | `npm run build` | succeeds without warnings |

## Acceptance scenarios → tests

| # | Scenario | Where |
|---|---|---|
| 1 | Croatian user: homepage → map → Dalmacija → Dalmatian wineries | e2e `public.spec.ts` #1 |
| 2 | English search for Plavac Mali → wineries and wines | e2e #2, integration |
| 3 | `dingac` → Dingač | e2e #3, integration, unit `norm` |
| 4 | Map marker click → popup → profile | e2e #4 (real WebGL marker click) |
| 5 | Profile shows grapes, wines, locations, verified awards | e2e #5/12 and `roles.spec.ts` 5b |
| 6 | Inquiry without registration is stored | e2e #6, #6b |
| 7 | Owner sees only their winery | `roles.spec.ts` #7, #7b |
| 8 | Admin update appears on public page | `roles.spec.ts` #8 |
| 9 | Language switch keeps the page | e2e #9 |
| 10 | Build and share a route | e2e #10 |
| 11 | Region filter correctness | e2e #11, integration |
| 12 | Missing data shown gracefully | e2e #5/12 |
| 13 | Mobile map/search usable | `mobile.spec.ts` |
| 14 | Metadata, hreflang, structured data, accessible structure | e2e #14 |
| 15 | Unauthorised users cannot change data | `roles.spec.ts` #15 |

## Manual QA checklist

- Keyboard: Tab through header, search suggestions (↑/↓/Enter/Esc), filters, list items (focus highlights the marker), lightbox (Esc/←/→), bottom-sheet handle (Enter cycles sizes).
- Screen reader: landmarks (`header`, `nav`, `main`, `footer`), live result counts, labelled map region, form errors announced with `role="alert"`.
- Reduced motion: animations are disabled under `prefers-reduced-motion`.
- With tiles blocked: map shows a plain base layer and a notice; the directory works without the map.
- Without `RESEND_API_KEY`: inquiries succeed, the visitor sees that email is queued, Admin › Email shows `no_provider`.

## Limitations of the test environment

The build/test container had no internet access: map tiles, Google Fonts at runtime, Resend and routing services were not reachable, so those integrations were tested only through their offline/fallback paths.
