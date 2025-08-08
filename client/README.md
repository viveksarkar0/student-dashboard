Client (Next.js)

Tech
- Next.js App Router
- TailwindCSS (pre-configured)
- Minimal components using native elements to keep the code small and readable

Env
- NEXT_PUBLIC_API_URL: base URL of the backend (default http://localhost:4000)

Structure
- app/
  - auth/login: login form
  - auth/register: registration form
  - dashboard: metrics + trend chart with filters
  - profile: view/update user + avatar upload
- lib/api.ts: tiny fetch wrapper with credentials

Run
- pnpm dev

Notes
- Filters are composed into query params and both summary and trends react to the same state.
- Lightweight bar chart uses CSS grid; swap to Recharts easily where needed.
- API calls include credentials for JWT cookie support.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
