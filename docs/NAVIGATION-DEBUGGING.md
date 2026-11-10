# Investigating the actual Brave tab

Passing isolated browser tests does not establish what an existing Brave profile is running. Keep the failing tab, its storage, and its worker intact until evidence is collected. Do not clear site data, unregister workers, delete drafts, or force an update as an initial debugging step.

## Environment established in this investigation

- Branch: `refactor/react-router`; all existing uncommitted work was retained.
- Node PID 2324 listens on port 5173, with its working directory in this checkout's `frontend`. Node PID 2347 has its working directory in `backend`.
- Reading `http://127.0.0.1:5173/src/App.jsx`, `/src/app/router.jsx`, and `/src/main.jsx` confirmed that this server serves the current React Router code and the new diagnostic entry point.
- Process command inspection could not run because automatic approval review failed. Other Vite processes and their executable commands have not been established.
- Brave is running, but the browser access host was unavailable and native capture failed. The actual tab's address, console, loaded assets, history and worker therefore remain unverified.
- PWA registration is disabled in development. This does not prove that a worker previously installed on that origin no longer controls an existing tab. Production uses prompted updates; no update/caching policy was changed.

These facts do not establish the cause of the reported failure. In particular, an old worker or wrong server is a hypothesis until the failing tab provides evidence.

## Enable diagnostics in development

1. In the failing Brave tab, record the address bar's **origin and port** locally. Check that it is the intended Vite server (normally `http://localhost:5173` or `http://127.0.0.1:5173`). These are different origins with separate sessions and workers. Do not switch origins while reproducing.
2. Open DevTools with **Option–Command–I**, select Console, and run:

   ```js
   sessionStorage.setItem("harborx.navigationDebug", "1");
   location.reload();
   ```

   This changes only the diagnostic flag in this tab's session storage. Save any unsaved form before the explicit reload.

3. After loading, run:

   ```js
   typeof window.harborxNavigationDebug;
   ```

   It should be `"object"`. If it is `"undefined"`, **stop and record that result**. It can mean production code, an older development entry point, a different server, or a stale document. Do not interpret it as proof of a stale worker. In Network inspect the document and `/src/main.jsx`: the current development entry point imports `navigation-debug.js`. In Application → Service Workers inspect the controller, active/waiting workers and scope without clicking Update, Unregister or Clear storage. Do not share raw HAR files, API responses or storage dumps containing credentials/account details.

4. Read the initial safe environment report:

   ```js
   await window.harborxNavigationDebug.snapshot();
   ```

   `marker` should be `harborx-navigation-debug-v1`, `development` true, and `port` the intended server port. `scripts` distinguishes the Vite entry point from production assets. `workers` reports only worker presence, root scope and whether the worker is the expected `/sw.js`; it never updates or removes one.

## Reproduce both scenarios

For each run start with `window.harborxNavigationDebug.clear()` after enabling. For Scenario A use an actual browser start page or another website, then navigate to HarborX **in that same tab**. If this requires a fresh tab, enable the flag there first, then navigate away and enter HarborX from the external page. Session storage is per tab. Do not use `history.pushState` to invent an external entry.

**Scenario A:** external/start page → HarborX Login → seller login → Dashboard → browser Back → browser Forward. Record the actual outside destination locally. When Back leaves HarborX, its JavaScript cannot inspect the outside page; return with Forward before exporting the trace. Login intentionally replaces its history entry. Back leaving HarborX is expected when that external page is the preceding entry. A tab opened directly may have no preceding application entry at all.

**Scenario B:** Dashboard → sidebar **My catches** → browser Back → browser Forward. At each step check the address bar and visible heading: `/seller/dashboard` + **Catch overview**, then `/seller/catches` + **My catches**, then Dashboard, then Catches. A normal click should record `menu`, one `push` with index +1, then `popstate` at the previous index on Back and the next index on Forward. No `boot` should occur during these internal transitions. `boot` marks a new document/module initialization; `pageshow` with `persisted: true` marks a cached-document return. Refresh legitimately creates another boot and session-validation sequence.

Also reproduce the actual failing menu interaction, repeat with Buyer/Admin, refresh/direct entry, and logout then Back. During session validation the screen should be `loading`; protected content should only follow a valid session. `redirect` records the decision reason and sanitized destination. A `replace` after `popstate` should be explained by a guard decision rather than ordinary menu navigation.

Export after each run (Chrome/Brave DevTools provides `copy`):

```js
copy(JSON.stringify(await window.harborxNavigationDebug.snapshot(), null, 2));
```

Share that JSON and the scenario/step that failed. It contains up to 300 events, retained across reloads and external round trips within this tab. Pathnames are restricted to known route shapes; queries, fragments, raw history state, arbitrary DOM text, account identifiers, cookies, credentials and API payloads are excluded. Fixed English headings are recorded; other/translated headings are redacted, so record the expected translated screen manually without account details. The report contains no outside URL or browsing history. History length/index cannot reveal the destination of an earlier cross-origin entry.

Interpretation examples:

- No `menu` or `push` after the actual click: investigate which element received the click and which code is loaded.
- `push` then unexpected `replace`/`redirect`: inspect the recorded guard/session reason.
- Correct `popstate` path/index but wrong visible heading: investigate route/render synchronization.
- A new `boot` on an internal menu action: investigate a document navigation or reload.
- A controller/waiting worker on the Vite origin: inspect its served version before deciding whether it is stale. Presence alone is not proof of a defect.

Disable and remove **only** diagnostic data afterward:

```js
window.harborxNavigationDebug.disable();
```

If the utility never loaded, remove only its own keys:

```js
sessionStorage.removeItem("harborx.navigationDebug");
sessionStorage.removeItem("harborx.navigationTrace");
```

## Production and automated checks

Production deliberately excludes this development utility, even with the flag set. For production reproduction use DevTools' read-only Network/Application inspection and the existing production browser tests. Do not enable unsafe logging or clear production storage to make the tests pass.

`navigation-debug.spec.js` verifies opt-in behavior, exact URL/content and history indices through Back/Forward, safe export, persistence across refresh, redirect/session evidence, disable behavior and production exclusion. Existing `navigation-content.spec.js` and `history-restoration.spec.js` cover all roles, external history, delayed authentication, logout and real BFCache restoration in isolated browsers against a disposable in-memory database. These tests complement the failing-tab trace; they cannot substitute for it.
