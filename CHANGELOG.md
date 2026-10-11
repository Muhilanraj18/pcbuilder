# Changelog

All notable changes to PC Builder India are documented here.

---

## 2026-07-14

### Codebase cleanup (Phase 1)

- **Deleted 32 stale markdown files** at project root that described the old Python-backend architecture — replaced with three focused docs: `README.md`, `RUNBOOK.md`, `CHANGELOG.md`.
- **Deleted orphaned Python backend** (`app/` directory) — `app/services/pc_builder/` and `app/api/v2/` including all `__pycache__` contents. Confirmed no live frontend code references these.
- **Deleted runtime junk** from `legacy-python-backend/`: `api_output.log` and `live_prices_cache.json`.
- **Deleted unused `src/utils/allComponents.ts`** — confirmed no file imports it.
- **Deleted committed build artifact** `tsconfig.tsbuildinfo` — already covered by `.gitignore`.

### Prior work (pre-cleanup)

- Prisma schema and migration scripts implemented (`prisma/schema.prisma`, `scripts/migrateToDb.ts`, `scripts/syncPrices.ts`, `scripts/testCatalog.ts`).
- `/api/products` and `/api/cron/sync-prices` endpoints created; cron auth bug fixed.
- `build.tsx` layout converted to grid; dead buttons wired to real actions.
