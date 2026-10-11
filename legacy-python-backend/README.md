# Legacy Python Backend

These files were the original Python/FastAPI recommendation and pricing engine.
They are **not used by the live Next.js application** and have been archived here
for reference (compatibility rules, pricing logic, etc.) during the Phase 2 migration.

## Contents

| File | Purpose |
|------|---------|
| `api.py` | FastAPI server entry point |
| `recommendation_engine.py` | ML-based build recommendation logic |
| `live_pricing_engine.py` | SerpAPI price scraping |
| `compatibility.py` | CPU/GPU/RAM compatibility scoring |
| `components_db.py` | Component database (Python) |
| `component_reference_db.py` | Extended component reference data |
| `ranker.py` | Component ranking/scoring utilities |
| `pc_builder_demo.py` | CLI demo script |
| `reference_summary.py` | Reference data summary tool |
| `integration_test.py` | Integration tests for the Python backend |
| `test_suite.py` | Full test suite |
| `requirements.txt` | Python dependencies |
| `start.ps1` | Windows PowerShell startup script |

## Status

**None of these files should be imported, run, or deployed** as part of the live app.

The compatibility logic (socket matching, PSU wattage headroom) from `compatibility.py`
should be ported to TypeScript in Phase 2 when rewiring the build API to use the Postgres catalog.
