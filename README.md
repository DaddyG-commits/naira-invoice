# NairaInvoice

**SMB Invoice + Payment Links in Naira**

Create invoice → share WhatsApp link → mark paid. Built for small shops in Nigeria.

## Features

- Create invoices with customer name, phone, and line items (amounts in ₦)
- One-tap **WhatsApp share** with pre-filled payment message + public invoice link
- **Mark as paid** from dashboard or invoice page
- Business name settings
- Simple pricing page (₦1,000–5,000/month or % per paid invoice)
- Demo storage: browser `localStorage` (no backend required)

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Connected to Vercel via GitHub. Push to `main` to deploy.

## Note

This is an MVP demo. Invoices live in the browser that creates them. Cross-device / multi-user requires a backend (planned).
