# HarborX Verification Scripts

This directory contains standalone automated verification scripts for HarborX frontend internationalization, responsive layout, typography, and interactive components.

---

## 1. `check-translations.mjs`

- **Purpose**: Validates 100% translation key parity across English (`en`), Tamil (`ta`), and Sinhala (`si`) in `frontend/src/i18n.jsx`.
- **Prerequisites**: Node.js (v18+). No running server or external dependencies required.
- **Execution Command**:
  ```bash
  node scripts/check-translations.mjs
  ```
- **Expected Result**: Exits with code `0` and outputs key counts per language confirming zero missing keys across all three languages. Exits with code `1` if any missing keys are detected.

---

## 2. `verify-demo-role-selection.mjs`

- **Purpose**: End-to-end browser verification of the login demo role selection cards (Seller, Buyer, Auction Manager), label formatting, credential autofill, Tamil/Sinhala translations, and mobile 360px stacked responsive layout with >=44px touch targets.
- **Prerequisites**: Playwright (`npm i -D playwright`), with the HarborX frontend running.
- **Execution Command**:
  ```bash
  node scripts/verify-demo-role-selection.mjs
  # Or with custom base URL:
  BASE_URL=http://localhost:5173 node scripts/verify-demo-role-selection.mjs
  ```
- **Expected Result**: Verifies role titles, descriptions, equal desktop card widths, selection state transitions, credential fill, multilingual labels, and exits with code `0`.

---

## 3. `verify-language-dropdown.mjs`

- **Purpose**: End-to-end browser verification of the compact global language switcher dropdown across the auth screen, registration screen, and workspace topbar.
- **Prerequisites**: Playwright, with the HarborX frontend running.
- **Execution Command**:
  ```bash
  node scripts/verify-language-dropdown.mjs
  # Optional: capture screenshots to a directory
  SAVE_SCREENSHOTS=true SCREENSHOT_DIR=./test-results node scripts/verify-language-dropdown.mjs
  ```
- **Expected Result**: Verifies default closed label (`EN`), dropdown menu rendering, active item checkmark, outside click and Escape key dismissal, selection updates (`TA`, `SI`), and exits with code `0`.

---

## 4. `verify-sidebar-typography.mjs`

- **Purpose**: End-to-end browser verification of the sidebar navigation typography, font size scales (13–14px), active button font weight (>=600), section headings (11–12px), collapse/expand toggle (68px width), multilingual text rendering without overflow (EN, TA, SI), and mobile drawer toggle at 760px.
- **Prerequisites**: Playwright, with the HarborX frontend running.
- **Execution Command**:
  ```bash
  node scripts/verify-sidebar-typography.mjs
  ```
- **Expected Result**: Inspects live computed CSS styles for navigation labels, section headings, and badges, verifies collapse/expand mechanics, tests mobile drawer open/close, and exits with code `0`.

---

## 5. `verify-global-localization.mjs`

- **Purpose**: End-to-end browser verification of the complete trilingual user journey across multiple views and dialogs (Auth eyebrow, Tamil login, demo ribbon, Overview hero banner, Catch Registration 3-step modal, Topbar switch to Sinhala, Auctions screen, Lot Details modal, and page reload persistence).
- **Prerequisites**: Playwright, with the HarborX frontend running.
- **Execution Command**:
  ```bash
  node scripts/verify-global-localization.mjs
  # Or with custom base URL:
  BASE_URL=http://localhost:5173 node scripts/verify-global-localization.mjs
  ```
- **Expected Result**: Verifies Tamil and Sinhala localized strings across auth, overview hero, catch registration modal, auctions, and details tabs, confirms reload persistence, and exits with code `0`.
