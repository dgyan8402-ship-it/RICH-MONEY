# Rich Money (Ghana) 🇬🇭

A modern, responsive financial investment platform and growth simulation dashboard designed specifically for users in Ghana, denominated in Ghana Cedis (GH₵).

---

## Key Features

1. **Brand & Visual Design**
   - Premium dark navy (`#050B14`, `#0B1528`), deep emerald green (`#10B981`), and warm gold (`#F59E0B`) palette.
   - Glassmorphic panels, responsive layout across mobile, tablet, and desktop viewports.
   - Distinctive typography using Plus Jakarta Sans and JetBrains Mono.
   - Full navigation: **Home**, **Dashboard**, **Investment**, **Transactions**, **Withdrawals**, **Profile**, **Support**, and protected **Admin Panel**.

2. **Dual-Ledger Segregation & Regulatory Compliance**
   - **Real Funds Ledger**: Verified external deposits and legitimate withdrawals.
   - **Demo Mode Simulator**: Isolated educational sandbox testing the 30% daily compound rate. Demo balances cannot be cashed out.
   - Compliance disclosures grounded in the Securities Industry Act, 2016 (Act 929) and Bank of Ghana (BoG) standards.

3. **30% Daily Growth Simulator**
   - Exact mathematical formula:  
     $$\text{New simulated balance} = \text{Previous simulated balance} \times 1.30$$
   - Interactive starting amount selector (GH₵) and duration slider (1 to 30 days).
   - SVG exponential trajectory chart, day-by-day table showing starting balance, daily gain, and ending balance.
   - Interactive "Step Day (+30%)" and "Allocate Demo Capital" controls.

4. **Withdrawal Rules & Minimum Threshold (GH₵100)**
   - Minimum threshold enforced at **GH₵100.00**.
   - If demo balance $< \text{GH₵}100$: displays *"Your demo balance has not reached the minimum withdrawal threshold of GH₵100."*
   - If demo balance $\ge \text{GH₵}100$: displays *"Your demo balance has reached the threshold."*
   - Real withdrawal mode verifies real available balances, checks Ghana Card KYC compliance for large amounts, and routes requests to the admin review queue.

5. **Ghanaian Deposit Gateway Sandbox**
   - Native support for Ghanaian payment rails:
     - **MTN Mobile Money (MoMo)** (*170# USSD prompt)
     - **Telecel Cash** (*110# prompt)
     - **AT Money** (AirtelTigo)
     - **GhIPSS / Debit Card**
   - Automated sandbox prompt with authentic phone authorization workflow.
   - Server-side settlement endpoint prevents client-side balance spoofing.

6. **Protected Administrator Dashboard**
   - Total registered users & KYC verification metrics.
   - Real deposit and withdrawal volume summaries.
   - Real-time fraud detection alerts (large transactions, unverified user flags).
   - Review and approve or reject withdrawal requests (rejection automatically refunds user balances).
   - User account ledger: adjust balances with audit justifications, toggle account freeze states, update KYC tiers.
   - Security audit trail recording IP addresses, actions, and timestamps.

7. **Ghanaian Customer Support & AI Desk**
   - Interactive live support agent ("Akosua" from Accra desk).
   - Ticket submission system.
   - Educational guides warning against unregulated Ponzi schemes.

---

## Pre-seeded Accounts (For Evaluation)

- **Standard User**:
  - Email: `kofi.mensah@example.com`
  - Password: `Password123!`
  - Security Answer: `accra`

- **Administrator**:
  - Email: `admin@richmoney.gh`
  - Password: `AdminPass123!`
  - Security Answer: `accra`

*(A quick test switcher is also embedded in the top banner for instant 1-click evaluation between user and admin roles).*

---

## Local Setup & Development

```bash
# Install dependencies
npm install

# Start full-stack dev server (Express + Vite on Port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```
