# HarborX PWA: operation, security and release checks

HarborX retains the existing React/Vite interface, Express API, cookie sessions,
role checks and PostgreSQL/PGlite data. The PWA adds installation and offline
seller drafts; it does not make auctions or payments available offline.

## Run and build

Use Node.js 22 or newer and install the locked dependencies:

```sh
npm ci
npm run dev
```

Development remains on localhost:5173, proxying `/api` to the backend `PORT`
from `backend/.env` (5050 by default). The development service worker is disabled
to avoid stale Vite code. To test installation and offline behavior locally,
stop the existing development process first, then:

```sh
npm run build
npm start
```

Open http://localhost:5050. The backend serves the built frontend and API on
one origin. Run only one backend against the persistent embedded database.
Do not reset `backend/data/postgres` or overwrite your existing environment.
Phone access through an ordinary HTTP LAN address does not qualify as a secure
origin; use the HTTPS deployment below for device installation.

## Architecture

- `vite-plugin-pwa` generates a stable manifest with app ID `/`, start URL `/`,
  root scope, standalone display and the existing navy/teal HarborX identity.
  PNG icons include 192 and 512 pixel standard icons, a padded 512 pixel maskable
  icon and a 180 pixel Apple touch icon. Regenerate with `npm run icons -w frontend`.
- Workbox precaches only build-time public HTML, JS, CSS and image assets.
  The cached `index.html` is the offline navigation fallback. `/api` navigations
  are excluded. There are no runtime API caches or background sync handlers.
  The API additionally sends `Cache-Control: no-store`; the client requests
  `cache: "no-store"` and includes the existing HttpOnly cookie.
- Initial install downloads the app shell. Subsequent updates install into a
  waiting worker and show a notice. They do not reload the page, claim clients,
  or interrupt forms/uploads. Save work, close every HarborX window, then reopen
  to activate the update. The server revalidates the worker, manifest and HTML.
- Helmet's HTTPS upgrade directive remains enabled in production. It is disabled
  only for development HTTP, because Safari otherwise tries to load localhost
  JavaScript/CSS over nonexistent local TLS and displays a blank page.
- Seller drafts are individual encrypted IndexedDB records. PBKDF2-SHA256
  (310,000 iterations and a random salt) derives a non-extractable AES-256-GCM
  key from a separate local passphrase of at least 12 characters. Each record
  uses a random IV and owner/draft ID as authenticated encryption context.
  The passphrase and key are never persisted; the key remains in memory while
  unlocked. The browser's normal HttpOnly session cookie remains the only
  server authentication mechanism.
- The local workspace stores only seller ID and lease metadata in plaintext;
  catch contents and states are encrypted. It never grants access to server
  auctions, users, payments or reports. It does not turn a cached user object
  into an authenticated React user.

## Enable and use seller drafts

1. Connect, sign in as a Seller, and open **My catches**.
2. Create a separate strong **local draft passphrase**, then select **Enable
   offline drafts**. Do not reuse your account password. There is no passphrase
   recovery or automatic destructive vault reset.
3. Existing `harborx-drafts-<seller ID>` localStorage records migrate to IndexedDB
   with their original catch IDs. The plaintext copy is removed only after the
   encrypted transaction commits. If reading or writing fails, the old copy is
   retained. Legacy drafts remain in their original plaintext storage until
   setup/migration succeeds; do not clear that storage during migration.
4. Wait for the app-shell-ready notice before disconnecting. Close and reopen
   the installed app offline. Unlock the local workspace with the local
   passphrase, choose **Record offline catch**, and save the form.
5. Reconnect. The local workspace stays open so reconnecting cannot discard an
   unfinished form. Choose **Return to sign in** to restore/check the server
   session. Sign in if necessary, open **My catches**, and unlock the vault.
6. Choose **Sync pending drafts**. This is always manual. The app first checks
   `/api/auth/me` and compares the actual seller ID, then uploads one draft at a
   time using its original `client_id`. An expired session or different account
   prevents upload. Successful responses must confirm the same catch ID.

States are **pending**, **syncing**, **synced**, and **failed**. Confirmed local
copies remain visible as synced until explicitly removed. A network error or
lost response keeps the draft as failed. An interrupted upload is recovered as
failed on unlock. Retry manually; the backend's existing same-seller client-ID
check returns the original catch instead of duplicating it. Failed/possibly
committed drafts cannot be edited before retry, so the retry payload stays
consistent with the original attempt. Synced drafts are not uploaded again.

You may remove a local copy after confirmation. Removing a synced copy does
not remove the server catch. Recording directly online still follows the
existing submit workflow; after a failed direct submission, keep the form open
and use **Save on device**, or retry with its existing ID.

## Local access and session boundaries

- Local unlock is not offline server login. Only a previously verified seller
  with an initialized vault can use the normal offline entry point.
- A local lease lasts at most 12 hours from successful online verification.
  Expiration locks access but retains encrypted data. Reconnect and sign in as
  the owner to renew access, then unlock again. Without a configured stable
  development `JWT_SECRET`, server restarts require another sign-in as before.
- Successful logout or an account change revokes the active local lease.
  BroadcastChannel notifies other open HarborX windows to clear their view.
  Drafts remain partitioned by seller, ready for that seller to sign in again.
- Offline revocation cannot discover account disabling or role changes made on
  the server while disconnected. Server checks apply again before upload.
  Lease metadata relies on the device clock and can be changed by someone with
  browser developer access; it is not a signed offline authorization token.
- Encryption protects locked draft contents at rest, not a compromised device,
  malicious same-origin script, unlocked screen or someone who knows the local
  passphrase. Use a device lock and separate browser profiles on shared devices.
- Browser eviction, private browsing, storage clearing, uninstall behavior and
  lost passphrases can make unsynced drafts unavailable. Persistent storage is
  requested on a best-effort basis and is not guaranteed. There is no cross-device
  backup/export in this release. Prefer prompt synchronization when connected.
- Auction bids are disabled offline and blocked again in the submit handler.
  There is no queued bidding, automatic upload retry, or background sync.

## HTTPS deployment

The local Compose file remains unchanged. An optional overlay adds Caddy HTTPS,
removes direct publication of the app's internal HTTP port, and enables secure
cookies. It requires Docker Compose 2.24.4+ and a public DNS name pointing to
the deployment server, with inbound ports 80 and 443 available.

Configure the existing root `.env` privately with strong database/JWT secrets
and `HARBORX_DOMAIN=your-real-domain.example`, then:

```sh
docker compose -f compose.yaml -f compose.https.yaml config --quiet
docker compose -f compose.yaml -f compose.https.yaml up --build -d
```

Caddy obtains/renews TLS certificates and redirects HTTP to HTTPS. The app and
API share that HTTPS origin; there is no cross-origin cookie workaround.
Production continues to require standard PostgreSQL, `DEMO_SEED=false`, and a
stable JWT secret. Preserve the existing database volume/project name and take
a backup before deployment. Moving from local PGlite to hosted PostgreSQL is
a separate data-migration task; this overlay does not migrate or delete data.
Do not run `docker compose down -v` against data you need.

The overlay was configuration-validated without starting containers. Actual
DNS, certificate issuance, HTTPS redirect, secure cookies and live deployment
still require verification on the target host.

## Install on phones

**Android:** Open the HTTPS site in Chrome, then choose **Install HarborX** when
offered, or browser menu → **Install app / Add to Home screen**. Launch it from
the installed icon, sign in online, enable local drafts and wait for shell caching.

**iPhone/iPad:** Open the HTTPS site in Safari, use **Share → Add to Home Screen**,
and enable **Open as Web App** if offered. Launch from the Home Screen and set up
seller drafts there. Browser and installed-app storage/session sharing can differ
by OS version; do not assume setup in a browser tab transfers to the installed app.

Manifest and secure-origin requirements follow [MDN's installation guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).
Update behavior follows the [Vite PWA prompt-update guide](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html).

## Automated checks

```sh
npm test
npx playwright install chromium webkit
npm run test:pwa
```

`npm test` includes storage/manifest unit tests plus existing backend integration
tests. The browser suite serves the actual production shell and real Express
API on isolated localhost:4173 with in-memory PGlite and public demo fixtures.
It never opens the live embedded database or uses real account credentials.
Do not run another service on test port 4173.

Coverage includes manifest/icons, worker registration, public-only Cache Storage,
offline reopening after closing a page, local unlock, legacy migration, draft
recovery, lost-response retry with real server deduplication, expired sessions,
cross-window account changes, offline bid blocking, safe waiting updates and
responsive forms. Browser projects cover Pixel 7 Chromium, iPhone 13 WebKit,
and desktop Chromium. Additional viewport checks cover widths 320, 360, 375,
and 430 pixels and a reduced-height viewport to approximate keyboard space.
Screenshots are written under ignored `frontend/test-results/` for visual review.

Verified on the development Mac:

- 13 frontend storage/manifest tests passed.
- 15 backend startup, authentication and auction/payment tests passed.
- All 21 browser checks passed across the three browser/viewport projects.
- Production build passed and generated the manifest, icons, shell cache and worker.
- HTTPS Compose overlay passed `docker compose ... config --quiet` validation.
- The existing Admin still logged in successfully through localhost:5173, with
  API health and session restoration passing on the preserved local services.
- Built assets were checked against configured private environment values;
  no configured account password, signing secret or database URL was present.

## Manual device release gate

Desktop automation is not proof of native installation or real mobile OS behavior.
Before client deployment, test at least one physical Android phone and iPhone:

1. Confirm a valid certificate, HTTP redirect, manifest, icon appearance/masking,
   install menu, standalone launch, scope and safe-area layout.
2. Launch the installed app online and initialize a seller vault in that app.
   Save a catch, switch to airplane mode, force-close the app, and reopen it.
   Unlock and verify recovery; record another catch and force-close/reopen again.
3. Use the real on-screen keyboard with numeric, date/time and multiline fields.
   Verify scrolling, footer actions, dialogs, orientation and navigation.
4. Reconnect, restore the session, sync manually and confirm exactly one server
   catch per client ID. Test intermittent connectivity and expired sessions.
5. Switch seller/buyer accounts and sign out. Check that prior drafts cannot be
   opened by the next user without the owner's online verification/passphrase.
6. Deploy a new build while an unfinished form is open. Confirm the update stays
   waiting, then save, close all app windows, reopen and verify the new version.
7. Verify offline bidding remains unavailable and that normal buyer/admin auction
   and payment workflows still work over HTTPS with Secure/HttpOnly cookies.

## Remaining release work

- Complete the physical-device and target-host HTTPS checks above.
- Review current build-tool advisories: installation reported 2 low and 8 moderate
  findings in the Workbox build chain (including deepmerge, ejs, glob/minimatch).
  `npm audit --omit=dev` reported zero runtime findings. No forced major downgrade
  or unreviewed transitive override was applied. Recheck upstream fixes before
  your release and rebuild/retest after dependency changes.
- The frontend retains the existing bundle-size warning above 500 kB. Consider
  route/component splitting after measuring target-phone startup performance.
- Confirm backups, storage/data-retention policy, supported OS/browser versions,
  and an account/passphrase recovery policy with the client. Offline account
  revocation and guaranteed browser persistence are not possible in this model.

## Exact source changes for this PWA implementation

Added:

- `frontend/pwa.config.js`
- `frontend/scripts/generate-icons.mjs`
- `frontend/public/icons/pwa-192.png`
- `frontend/public/icons/pwa-512.png`
- `frontend/public/icons/maskable-512.png`
- `frontend/public/icons/apple-touch-icon.png`
- `frontend/src/PwaStatus.jsx`
- `frontend/src/draft-store.js`
- `frontend/src/useDraftVault.js`
- `frontend/src/DraftPanel.jsx`
- `frontend/tests/draft-store.test.js`
- `frontend/tests/pwa.test.js`
- `frontend/tests/serve-pwa.mjs`
- `frontend/tests/browser/pwa.spec.js`
- `frontend/playwright.config.js`
- `compose.https.yaml`
- `deploy/Caddyfile`
- `docs/PWA.md`

Modified:

- `package.json`: runs frontend and backend tests; adds the PWA browser-test command.
- `package-lock.json`: locks PWA, icon and test dependencies.
- `frontend/package.json`: PWA/icon/test dependencies and scripts.
- `frontend/vite.config.js`: installs the PWA plugin while preserving the API proxy.
- `frontend/index.html`: iOS metadata, safe-area viewport and Apple touch icon.
- `frontend/src/main.jsx`: mounts installation/update status and worker registration.
- `frontend/src/App.jsx`: integrates seller vaults, local reopening, manual sync,
  account-view clearing and reactive offline bid blocking.
- `frontend/src/api.js`: explicitly disables HTTP caching for API requests.
- `frontend/src/styles.css`: safe areas, touch targets, mobile form/scroll behavior
  and local-workspace styles while preserving desktop design.
- `backend/src/app.js`: revalidation headers for public PWA entry assets and a
  development-only fix for Safari's localhost HTTPS upgrade behavior.
- `backend/tests/workflow.test.js`: regression coverage confirming production
  retains the HTTPS upgrade policy while local HTTP development remains usable.
- `.gitignore`, `.dockerignore`: exclude browser test artifacts.
- `README.md`, `docs/ARCHITECTURE.md`: replace obsolete offline descriptions.

`frontend/dist/` is regenerated build output containing the manifest, worker,
Workbox helper, icons and versioned assets; it remains ignored. Existing private
environment files, credentials, database files and auction/payment business rules
were not edited.
