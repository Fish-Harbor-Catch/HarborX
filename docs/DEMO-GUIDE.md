# HarborX — Evaluation walkthrough

Start the project with `npm install` and `npm run dev`, then open http://localhost:5173. Use the root README for account details.

## Demonstrate the complete flow

1. **Seller:** Sign in as `seller@harborx.demo`. Select **Register catch**.
2. Enter Yellowfin Tuna, Grade A, 100 kg, base price 1,000 LKR/kg, increment 50, Dikkowita harbor, boat name, and an estimated arrival. Submit.
3. The catch appears in **My catches → Awaiting review**. Its details are stored in PostgreSQL. The Seller can still edit it.
4. Sign out and sign in as **Manager**. Open **Auctions → Awaiting review**, select the new lot, and click **Approve & publish**.
5. Click **Start round 1**. The default duration is 10 minutes. The catch is now open to verified Buyers.
6. Sign out and sign in as **Buyer**. Open that lot and submit a bid of **1,000**. A server success message confirms acceptance.
7. In another browser profile or private window sign in as `buyer2@harborx.demo`. Submit **1,000** on the same lot. It is rejected because the first bid already established a minimum of **1,050**.
8. Bid **1,050** from the second Buyer. It is accepted. Refresh the first Buyer's bid history to show the change in position.
9. Sign in as **Manager**. In the lot details, click **Verify arrival**, enter the inspected weight **100**, and confirm.
10. Click **End current round** and confirm. You may start round 2 or 3 if required. For this demo, click **Finalize auction** and confirm.
11. The highest valid bidder wins. Total sale = **100 kg × 1,050 = LKR 105,000**. At the default 5% commission, commission is **LKR 5,250**, leaving seller proceeds of **LKR 99,750**.
12. Open the lot's **Payments** tab. Record **40,000** with reference `CASH-DEMO-001`. The invoice becomes **Partially Paid**, balance **65,000**.
13. Record the remaining **65,000**, reference `BANK-DEMO-002`. The invoice becomes **Paid**.
14. Open **Reports**, show the species/harbor summaries, and download the CSV.
15. Open **Activity log** or the lot's **Timeline** to show the audit trail.

## Demonstrate weak-internet behaviour

1. Sign in as Seller while connected. Keep the app open.
2. Register a catch and choose **Save on device** instead of Submit.
3. Explain that the draft is stored in this browser for this Seller. It is not visible to Buyers.
4. Open **My catches**, show the device draft, and click **Sync drafts** while the backend is reachable.
5. The server uses the draft's UUID to prevent duplicate lots when a sync is retried.
6. The manager still needs to approve the catch before bidding starts.

If there is no connection before arrival, skip pre-arrival bidding. Once connected at the harbor, sync and publish the catch, then start the first online round. Never queue bids offline.

## Explain the main rules simply

- The Seller proposes the base price. The manager approves and controls the auction.
- All bid amounts are per kilogram.
- The server locks the auction record while checking and saving a bid.
- Only the first valid equal bid is accepted. The next request sees the new minimum and fails.
- The manager confirms arrival and the actual weight before choosing the winner.
- If weight changes after bids, cancel and register a corrected lot. Previous bids remain in the audit history.
- No bids means an unsold lot. A cancelled or closed lot cannot accept bids.
- Payments are records of money already received. No money is transferred by this demo.

## Useful commands for the evaluation

```powershell
npm test
npm run build
```

Show that the test suite passes and the frontend builds. The build and automated tests do not prove real harbor rules or production readiness.
