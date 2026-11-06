# HarborX API

Base path: `/api`. Requests and responses use JSON except CSV export. Login sets an HttpOnly session cookie. Browser calls use credentials; do not store JWTs in localStorage.

Error shape: `{ "error": "A readable explanation" }`. Common status codes: 400 invalid input, 401 missing/expired session, 403 role or verification restriction, 404 missing record, 409 workflow conflict or bid no longer meeting the minimum.

## Authentication

| Method | Path | Access | Body / result |
| --- | --- | --- | --- |
| GET | `/health` | Public | Service/database status, demo flag, commission rate |
| POST | `/auth/register` | Public | `name, email, password, role, phone?, boat_name?`; role must be `seller` or `buyer`, password 12–128 characters |
| POST | `/auth/login` | Public | `email, password`; returns public user and session cookie |
| POST | `/auth/logout` | Any | Clears session cookie |
| GET | `/auth/me` | Signed in | Current public user |
| PATCH | `/auth/profile` | Signed in | `name, phone, boat_name` |

## Catches and auctions

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/lots` | Signed in | Visible lots with seller/winner, bid count, payment balance |
| GET | `/lots/:id` | Signed in | One visible lot, accepted bids, and events |
| POST | `/lots` | Seller | Register pending catch |
| PATCH | `/lots/:id` | Owning Seller | Edit a pending catch |
| POST | `/lots/:id/publish` | Admin | Approve pending catch |
| POST | `/lots/:id/start-round` | Admin | Start next of at most three rounds; body `{ "minutes": 10 }`, range 1–120 |
| POST | `/lots/:id/end-round` | Admin | End active round immediately |
| POST | `/lots/:id/arrival` | Admin | Body `{ "actual_weight": 100 }` |
| POST | `/lots/:id/close` | Admin | Finalize after arrival and round end; award or mark unsold |
| POST | `/lots/:id/cancel` | Admin or eligible Seller | Body `{ "reason": "Reason of at least five characters" }`; Sellers can only cancel their own pending catches |
| POST | `/lots/:id/bids` | Verified Buyer | Body `{ "amount": 1050, "request_key": "UUID" }`; amount is LKR/kg |
| GET | `/my-bids` | Buyer | Own accepted bid history and current position |

### Catch request example

```json
{
  "client_id": "21a7737f-65e0-4798-8ac5-235d3e9a7802",
  "species": "Yellowfin Tuna",
  "grade": "A",
  "weight": 100,
  "base_price": 1000,
  "min_increment": 50,
  "harbor": "Dikkowita",
  "boat_name": "Ocean Pearl LK-2048",
  "arrival_at": "2026-11-05T04:30:00.000Z",
  "notes": "Fresh catch, stored on ice.",
  "image_key": "tuna"
}
```

`client_id` is optional for ordinary creation. Offline clients must reuse it when retrying a draft. Values are validated using the enums in `backend/src/app.js`. Dates are ISO-8601 UTC timestamps, not device-local strings.

## Payments, users, and reports

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/payments` | Signed in | Admin sees all invoices; Seller/Buyer sees their own |
| GET | `/lots/:id/payments` | Admin, owning Seller, or winning Buyer | Payment receipt history |
| POST | `/lots/:id/payments` | Admin | Body `{ "amount": 40000, "reference": "BANK-001" }`; rejects overpayment |
| GET | `/users` | Admin | Public user records |
| PATCH | `/users/:id` | Admin | `verified` and/or `active` booleans; cannot alter Admin status |
| GET | `/activity` | Signed in | Latest 25 relevant audit events |
| GET | `/reports` | Admin | All lots with report fields and generation timestamp |
| GET | `/reports/export` | Admin | CSV download; cells protected against common formula injection prefixes |

## Configuration

See `backend/.env.example`. Production requires a normal PostgreSQL connection, a long JWT secret, and disabled demo seeding. Normal production cookies require HTTPS; local Docker testing explicitly opts out of Secure cookies while bound to loopback.
