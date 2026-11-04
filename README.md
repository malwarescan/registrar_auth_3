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

## NameSilo prices

NameMog is run by NameSilo. Registration prices shown in search results come from NameSilo's official API:

- **Live:** when `NAMESILO_API_KEY` is set, each search calls `checkRegisterAvailability` and `getPrices` (cached 5 minutes). Prices are labelled "NameSilo price, checked <date>".
- **Snapshot:** `data/namesilo-prices.json` (`{source, checked, prices: {tld: {register, renew, transfer}}}`) is the committed copy of `getPrices`. It is used when the live `getPrices` call fails or returns nothing, and for the demo search. It is read through `lib/namesilo/price-snapshot.ts`; do not type NameSilo prices anywhere else.
- **Refresh the snapshot:** `NAMESILO_API_KEY=... npm run prices:namesilo`, then commit the file. On any API error the file is left unchanged.
- **Check:** `npm run qa:namesilo-prices` renders a result card and checks the price and label equal the snapshot.

### Setting `NAMESILO_API_KEY` in Railway

1. Open the Railway project, select the NameMog service, then **Variables**.
2. **New Variable**: name `NAMESILO_API_KEY`, value = the key from NameSilo (Account > API Manager). Mark it sealed if offered.
3. Save; Railway redeploys. Without the variable, searches show "Availability not checked" and no prices.

Never commit the key or paste it into code, logs or issues.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
