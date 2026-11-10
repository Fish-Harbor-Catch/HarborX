# Frontend routing

HarborX uses React Router 7 in declarative mode with `BrowserRouter`. The browser URL is the source of truth for the current screen. Existing menu buttons and dashboard actions use `useNavigate`; ordinary navigation adds history entries, while authentication and role redirects replace the current entry. No server reload is needed for menu navigation.

## Routes

| Role                | URLs                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Guest               | `/login`, `/register`                                                                                                            |
| Seller              | `/seller/dashboard`, `/seller/catches`, `/seller/auctions`, `/seller/payments`, `/seller/activity`, `/seller/settings`           |
| Buyer               | `/buyer/dashboard`, `/buyer/auctions`, `/buyer/bids`, `/buyer/won`, `/buyer/payments`, `/buyer/activity`, `/buyer/settings`      |
| Admin               | `/admin/dashboard`, `/admin/auctions`, `/admin/users`, `/admin/payments`, `/admin/reports`, `/admin/activity`, `/admin/settings` |
| Local seller drafts | `/offline` (requires an existing local draft owner; the existing passphrase and lease checks still apply)                        |

`/` displays the public HarborX homepage for guests and authenticated users. When an offline draft owner is available and the existing offline preference is active, it retains the `/offline` redirect for the installed PWA. Unknown paths show a translated Not Found screen. The existing `overview` screen key maps to `dashboard` in URLs. `route-config.js` derives workspace routes from the existing role navigation metadata, including the shared activity and settings screens.

## Authentication and history

`App.jsx` retains session restoration through `/api/auth/me`, local draft ownership, notifications, and workspace data. Its loading screen stays visible until restoration finishes. `ProtectedRoute.jsx` prevents guest and cross-role workspace rendering. Guests are redirected to Login with the requested URL in history state; successful login returns to a known URL for that account's role, including its query and hash. Foreign-role and external return destinations fall back to the user's dashboard.

Logout clears the server session and existing local access, then replaces the current URL with `/login`. Going Back into an old protected entry runs the guard again and cannot restore authenticated content. The existing API authorization remains authoritative. A 401 during workspace refresh, draft sync, or mutations clears private frontend state and returns to authentication.

`AuthPages.jsx` is a persistent parent for Login and Registration. Form switching adds real history entries, retains the existing shared form values, and keeps the slideshow mounted with its unchanged four-second interval and two-second crossfade. Language switching does not navigate.

Local offline access remains separate from a server-authenticated role. Cold-loading a protected seller URL offline opens `/offline` when local access exists. Returning to Sign in explicitly rechecks the server session without reloading the document. Unsaved offline forms stay open on reconnect, as before.

## Hosting and PWA

- Vite's default SPA handling supports direct client URLs during development and preview.
- Production Express already serves `frontend/dist` and falls back to `index.html` for non-API paths (`backend/src/app.js`). Caddy proxies those requests to Express. No backend or deployment changes are required for these existing configurations.
- The existing service worker falls back to the precached `index.html` for navigation, excluding `/api` and `/api/*`. API responses and mutations remain uncached. Manifest identity, scope, start URL, update prompts, and caching policy are unchanged.
- Any alternate static host must rewrite non-file, non-API paths to `/index.html`. Do not rewrite API requests or use hash-based routing.

## Verification

Run `npm test`, `npm run build`, `npm run test:pwa -w frontend`, and `node scripts/check-translations.mjs`. Playwright requires its matching Chromium and WebKit binaries (`npx playwright install chromium webkit`). Browser tests use a disposable in-memory PGlite database, never existing user data. No lint command is currently configured.

`navigation.spec.js` covers role dashboards, browser Back/Forward, protected refresh and direct links, role guards, logout, session restoration and expiry, unknown paths, translations, mobile tabs, and offline deep links. Demo and slideshow suites verify URL history alongside the existing behavior and timing checks. Component tests and route metadata tests use the project's existing test tooling.

## External history and cached-document restoration

A tab opened from another website (or a browser start page) can legitimately return there when Back is pressed from its first HarborX entry. Successful login replaces the login entry with the role dashboard. It does not add a synthetic login entry. After Dashboard → Catches or Dashboard → Auctions, Back returns to Dashboard and Forward returns to the selected screen.

The normal cold-load path already waits for `/api/auth/me` before mounting Login or a protected screen. Tests observe DOM mutations, including short-lived form mounts, rather than checking only the eventual URL. These tests cover external entry, Forward, direct dashboard loading, refresh, delayed validation, and the Vite development build.

An additional cache-enabled Brave diagnostic exposed a different problem: a document restored from the browser's Back/Forward Cache (BFCache) kept its old authenticated React state without rerunning the mount effect. Clearing the session cookie while away still allowed the cached dashboard to reappear. Before the fix, the regression test confirmed `pageshow.persisted === true` but no new `/api/auth/me` request occurred.

`App.jsx` now commits the existing neutral loading UI during persisted `pagehide`, before the browser freezes its DOM. Persisted `pageshow` revalidates the server session. Restoration clears the previous identity and private view before accepting a validated user. Valid sessions return to their existing URL; invalid sessions go through the existing Login guard. Local draft ownership is reread for the existing offline fallback. There are no extra history entries, navigation traps, or backend changes.

`history-restoration.spec.js` uses a real second HTTP origin for ordinary history tests. Its Chromium-only cached-document test uses the full `chromium` channel (the standalone headless shell disables BFCache), explicitly enables BFCache, and uses CDP, because [Playwright normally disables BFCache and does not support cached restores through its normal navigation tracking](https://playwright.dev/docs/navigations#backforward-cache-bfcache). The test requires a real persisted restore, pauses the new session request, checks that neither Login nor protected content appears while it is pending, then checks valid and expired sessions. This CDP-specific test is skipped on WebKit; ordinary history and delayed session tests still run there.

The reported login flash was not reproduced in the current development or production builds during these checks, including isolated Brave. The cached-session defect above was separately reproduced and fixed. The recording's exact build/profile/cache state remains necessary to attribute its specific flash; it should not be assumed to have the same cause.

## Integrated public homepage

`features/public/PublicHomePage.jsx` is lazy-loaded by the existing root route. It reuses the application router, authenticated user and language provider. Its styles only select descendants of `.hx-public`, and its original animations use distinct keyframe names. The existing Login/Register components, session checks, role guards and login slideshow are unchanged.

Only the homepage was integrated from the standalone prototype. Services, Gallery, About, How It Works and Contact navigation targets are sections on that homepage, not new public-page routes. Guest marketplace links lead to the existing `/login`; authenticated marketplace links lead to the account role’s existing auctions route. Registration links lead to the existing `/register`, where users select their role. No prototype mock authentication, sample auctions, contact form, secondary pages, router or language provider is copied. Public hero/navigation copy uses the existing language preference through a feature-local copy table; other homepage copy remains English. Existing translation dictionaries are unchanged.

The original `PwaStatus` remains mounted on the homepage, preserving registration/update prompts. No service-worker caching policy or draft data is changed. Licensed photographs and credits are copied under `frontend/public/public-home/`, so the existing precache build includes them. The standalone prototype stays intact.
