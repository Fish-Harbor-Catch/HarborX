# Local login failure: diagnosis and verification

The browser loads React from Vite on port 5173. `frontend/src/api.js` sends
relative `/api` requests with `credentials: "include"`. Authentication state
lives in `App.jsx`: login stores the returned public user in React state;
on reload, `/api/auth/me` restores it using the HttpOnly session cookie.
There is no separate authentication context or browser-stored JWT.

## Evidence and root causes

- The backend environment specified port 5050, but Vite's proxy still targeted
  port 5000. `lsof` identified macOS Control Center on 5000, Elmedia on 5001,
  HarborX on 5050, and Vite on 5173.
- Before the fix, direct `GET :5050/api/health` returned 200 JSON with a healthy
  embedded PostgreSQL connection. `GET :5173/api/health` returned an empty 403.
  Vite was forwarding API requests to the AirPlay service.
- The frontend helper attempts JSON parsing and substitutes an empty object
  if parsing fails. An unsuccessful response without an `error` property
  therefore becomes “The request could not be completed.” This was a routing
  failure, not evidence of an incorrect password.
- Express 5 invokes the `app.listen` callback on bind errors as well as success.
  A minimal probe against the occupied port reproduced an `EADDRINUSE` error
  with `listening: false` in that callback. The previous callback ignored its
  argument, printed a success banner, and let the process end with no listener.
  Node watch mode then reported completion and waited for changes.
- Express intentionally serves `frontend/dist` when present. HTML from
  `GET :5050/` does not indicate a misplaced API; `/api/health` tests the API.

## Changes

- Vite reads the backend port from environment configuration, defaulting to
  5050. Backend environment values are read only in Vite's Node configuration;
  they are not injected into client code. `strictPort` keeps the frontend on
  its expected and allowed port 5173.
- Backend startup also defaults to 5050, waits for the listening event before
  announcing readiness, and closes its database and reports an error on a bind
  failure. The example backend environment uses the same default.
- Regression tests cover the actual entry point with disposable embedded
  databases, occupied-port errors, and Admin cookie authentication.

The provisioning script and API both use `createDatabase`, whose embedded path
is resolved relative to the module, so they use the same persistent
`backend/data/postgres` database. Provisioning and login use the same salted
scrypt hashing and constant-time comparison functions. Seeding skips databases
that already contain users. No data reset, password reset, CORS relaxation,
authentication bypass, or role change was needed.

## Verification performed

- Direct and proxied health endpoints: 200 JSON, database connected.
- Existing provisioned Admin credentials, read privately from the local
  environment, succeeded through Vite using the real frontend API helper.
  Passwords and cookie values were never printed.
- A subsequent `/auth/me` call restored that Admin and `/users` authorized it.
- Incorrect password and unauthenticated session requests returned 401.
- Logout cleared the test session; subsequent protected access returned 401.
- Credentialed CORS headers allow the configured localhost frontend origin.
- All 14 backend tests passed, including isolated startup, clean shutdown,
  port collision, session attributes, role checks and existing workflow tests.
- `npm run build` passed, with an existing bundle-size warning above 500 kB.

The browser form and reload were not automated. Session restoration was tested
at HTTP/API-helper level. Without `JWT_SECRET` configured, sessions intentionally
expire when the backend restarts because a fresh signing secret is generated.
The existing account remained available after the development watcher restarted
the backend. Tests never opened the live embedded database.

`.gitignore` already excludes `backend/.env`, root `.env`, and `backend/data/`.
This extracted workspace has no Git repository metadata, so tracked-file status
could not be checked. If placing it under Git, confirm private files are ignored
before committing.

## Future troubleshooting

Compare the direct API health response with the response through Vite first.
If only the direct request works, inspect the proxy target. If neither works,
check listeners and the backend terminal. In browser DevTools, inspect the login
request URL, status and content type: a real authentication rejection is 401
with a JSON message; HTML or an empty response suggests a different service or
incorrect route. For cookie problems, inspect cookie attributes and the
`/api/auth/me` response without copying token values into logs or reports.
