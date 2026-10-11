# PC Builder India

An AI-powered PC recommendation and upgrade advisor for the Indian market. Users describe their budget and use case, and the app builds a compatible, price-optimised parts list sourced from real product data, with affiliate buy links to Amazon, Flipkart, and MDComputers.

## Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (Pages Router), React 18, Tailwind CSS, Framer Motion |
| **API** | Next.js API Routes (`src/pages/api/`) |
| **Database** | PostgreSQL (Supabase), Prisma ORM |
| **Price sync** | Scheduled cron job (`/api/cron/sync-prices`) backed by SerpAPI / PA-API |
| **Deployment** | Vercel |

> **Note:** A legacy Python backend exists in `legacy-python-backend/` for reference only. It is not part of the live application and is not deployed.

## Key routes

| Page | Purpose |
|---|---|
| `/` | Landing page |
| `/usecase` | Use-case selection (gaming, editing, etc.) |
| `/budget` | Budget input |
| `/build` | AI-generated build recommendation with part cards and buy links |
| `/upgrade` | Upgrade advisor — swap individual parts in an existing build |
| `/monitor` | Price tracking dashboard |
| `/guide` | PC building guide |
| `/part/[id]` | Individual product detail page |

### API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/build` | `POST` | Generate a recommended build for a given budget and use case |
| `/api/products` | `GET` | Query the product catalog (filterable by category, budget, tier) |
| `/api/cron/sync-prices` | `GET` | Automated price refresh (Vercel Cron, auth-gated) |
| `/api/price` | `GET` | Single product price lookup |
| `/api/upgrade` | `POST` | Upgrade recommendation logic |

## Getting started

### Prerequisites

- Node.js ≥ 18
- npm
- A PostgreSQL database (Supabase free tier works)

### 1. Clone and install

```bash
git clone <repo-url> && cd pc-builder-india
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Price sync (needed only if running sync-prices)
SERPAPI_KEY=your_serpapi_key
CRON_SECRET=a_random_secret_for_cron_auth

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

### 3. Set up the database

```bash
npx prisma db push        # apply schema to your database
npm run migrate-db         # seed initial product catalog
```

### 4. Run locally

```bash
npm run dev                # starts Next.js on http://localhost:3000
```

### 5. Verify the catalog

```bash
npm run test-catalog       # prints product counts per category
```

## Available scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start local development server |
| Build | `npm run build` | Production build |
| Migrate DB | `npm run migrate-db` | Seed product data from source files into Postgres |
| Test catalog | `npm run test-catalog` | Verify product counts and sample queries |
| Sync prices | `npm run update-prices` | Manually trigger a price refresh cycle |
| Prisma Studio | `npm run db:studio` | Open the Prisma database GUI |
| DB push | `npm run db:push` | Push Prisma schema changes to the database |

## Project structure

```
├── prisma/
│   └── schema.prisma          # Product and PriceHistory models
├── scripts/
│   ├── migrateToDb.ts          # Seed script
│   ├── syncPrices.ts           # Price sync runner
│   └── testCatalog.ts          # Catalog verification
├── src/
│   ├── components/             # Shared React components
│   ├── lib/
│   │   ├── catalog.ts          # Authorised product query layer
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── priceLookup.ts      # Multi-source price fetcher
│   │   ├── serpApiClient.ts    # SerpAPI integration
│   │   └── syncPricesCore.ts   # Core sync logic
│   ├── pages/
│   │   ├── api/                # Next.js API routes
│   │   └── *.tsx               # Page components
│   ├── styles/                 # Global CSS
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utilities (affiliate links, analytics, etc.)
├── legacy-python-backend/      # Archived — not deployed, kept for reference
└── public/                     # Static assets
```

## License

Private — not open source.
