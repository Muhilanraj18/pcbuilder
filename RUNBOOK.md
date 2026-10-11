# Runbook — PC Builder India

Operational procedures for maintaining the live site.

---

## Adding a new product

1. **Open Prisma Studio:**
   ```bash
   npm run db:studio
   ```
2. **Create a new Product record** with these required fields:
   - `name` — unique, human-readable (e.g. "AMD Ryzen 5 7600X")
   - `category` — one of: `Processor`, `Graphics Card`, `Motherboard`, `RAM`, `Storage`, `Power Supply`, `Cabinet`, `Keyboard`, `Mouse`, `Cooling`, `Monitor`
   - `tier` — e.g. `budget`, `midRange`, `highEnd`, `enthusiast` (or `ddr4`/`ddr5` for RAM, `ssd`/`nvme`/`hdd` for Storage)
   - `brand` — manufacturer name
   - `currentPrice` — price in ₹ (integer, no decimals)
   - `specs` — JSON object with category-specific specs (socket, TDP, wattage, etc.)
   - `amazonUrl` / `flipkartUrl` / `mdcomputersUrl` — affiliate buy links (at least one)
   - `imageUrl` — product image URL
   - `isVerified` — set to `true` once you've confirmed the listing is accurate
   - `inStock` — set to `true`
3. **Verify** it appears in the catalog:
   ```bash
   npm run test-catalog
   ```

### Bulk import via migration script

For larger imports, add products to the source data in `scripts/migrateToDb.ts` and run:
```bash
npm run migrate-db
```

---

## Triggering a manual price sync

### Via npm script
```bash
npm run update-prices               # full sync (all products)
npm run update-prices:priority      # only volatile-tier products (GPUs, CPUs)
```

### Via API (production)
```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/sync-prices
```

The `CRON_SECRET` env var must match what's configured in Vercel.

---

## Checking cron job health

1. **Vercel Dashboard → Cron Jobs tab:** Shows last execution time, status, and duration.
2. **Check product freshness in Prisma Studio:**
   - Sort by `lastPriceCheckAt` ascending — products at the top haven't been checked recently.
   - Any product with `lastPriceCheckAt` older than 7 days needs attention.
3. **Quick CLI check:**
   ```bash
   npm run test-catalog
   ```
   This prints per-category counts and confirms the database is reachable.

### Common cron failures

| Symptom | Likely cause | Fix |
|---|---|---|
| 401 Unauthorized | `CRON_SECRET` mismatch between Vercel env and `vercel.json` | Re-check the env var in Vercel settings |
| Prices not updating | SerpAPI key exhausted or expired | Check SerpAPI dashboard for usage/quota |
| Partial updates | API rate limit hit mid-run | The next cron cycle will pick up remaining products |

---

## Affiliate link troubleshooting

### Symptoms of a broken affiliate link
- "Buy on Amazon" button leads to a generic page instead of the product
- Commission dashboard shows zero clicks for a product you know is getting traffic

### Diagnosis
1. Open the product in Prisma Studio
2. Click the `amazonUrl` / `flipkartUrl` / `mdcomputersUrl` — does it resolve to the correct product page?
3. Check if your affiliate tag is present in the URL query string (e.g. `?tag=yourtag-21` for Amazon)

### Fix
- Update the URL in the Product record with a fresh affiliate link from the retailer's affiliate portal
- If the product has been delisted, set `inStock = false` — the build logic will skip it automatically

---

## Environment variables reference

| Variable | Required | Used by | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Prisma | PostgreSQL connection string |
| `CRON_SECRET` | ✅ (prod) | `/api/cron/sync-prices` | Bearer token for cron auth |
| `SERPAPI_KEY` | ✅ (sync) | Price sync scripts | SerpAPI key for price lookups |
| `NEXT_PUBLIC_API_URL` | ❌ | Frontend | API base URL (defaults to `/api`) |
| `NEXT_PUBLIC_GA_ID` | ❌ | Analytics | Google Analytics measurement ID |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ❌ | Shop map | Google Maps API key |
