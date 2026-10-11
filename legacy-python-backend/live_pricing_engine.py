"""
Live Intelligent Pricing Engine

Autonomous multi-agent system that fetches, cleans, compares, and decides
best real-time component pricing across Indian e-commerce sources.

Sources:
- Amazon India
- Flipkart India
- MDComputers
- PrimeABGB
"""

from __future__ import annotations

import asyncio
import json
import os
import re
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import requests
from pathlib import Path

from components_db import CPUs, GPUs, MOTHERBOARDs, MONITORS, PSUs, RAMs, STORAGE


def _load_env_file(file_name: str = ".env.local") -> None:
    """Load simple KEY=VALUE pairs from a local env file if present."""
    env_path = Path(__file__).resolve().parent / file_name
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_env_file()


SOURCE_SITES = {
    "Amazon India": "amazon.in",
    "Flipkart India": "flipkart.com",
    "MDComputers": "mdcomputers.in",
    "PrimeABGB": "primeabgb.com",
}

SOURCE_TRUST = {
    "Amazon India": 0.95,
    "Flipkart India": 0.92,
    "MDComputers": 0.94,
    "PrimeABGB": 0.93,
}

CACHE_FILE = "live_prices_cache.json"


@dataclass
class ProductHit:
    source: str
    title: str
    price: Optional[float]
    url: str
    availability: str
    rating: Optional[float]


def _parse_price(raw: Any) -> Optional[float]:
    if raw is None:
        return None
    text = str(raw)
    text = text.replace("Rs.", "").replace("₹", "").replace(",", "").strip()
    match = re.search(r"\d+(?:\.\d+)?", text)
    if not match:
        return None
    value = float(match.group(0))
    if value <= 0:
        return None
    return value


def _normalize_title(title: str) -> str:
    title = title.lower()
    title = re.sub(r"\b(buy|online|offer|latest|in india|price|shop|new)\b", " ", title)
    title = re.sub(r"[^a-z0-9+ ]", " ", title)
    title = re.sub(r"\s+", " ", title).strip()
    return title


def _extract_model_tokens(text: str) -> Dict[str, set]:
    lower = text.lower()
    numbers = set(re.findall(r"\b\d{3,5}\b", lower))
    families = set()

    for family in ["rtx", "gtx", "rx", "ryzen", "intel", "i3", "i5", "i7", "i9", "ddr4", "ddr5", "nvme", "ssd"]:
        if family in lower:
            families.add(family)

    return {"numbers": numbers, "families": families}


def _variant_match(query: str, title: str) -> bool:
    q = _extract_model_tokens(query)
    t = _extract_model_tokens(title)

    # If query has model numbers, all of them should exist in title to avoid wrong variant.
    if q["numbers"] and not q["numbers"].issubset(t["numbers"]):
        return False

    # If query has family tokens, at least one must overlap.
    if q["families"] and not (q["families"] & t["families"]):
        return False

    return True


def _fallback_price_for_component(component: str) -> Optional[float]:
    lookup_groups = [CPUs, GPUs, MOTHERBOARDs, RAMs, STORAGE, PSUs, MONITORS]
    for group in lookup_groups:
        if component in group and isinstance(group[component], dict):
            price = group[component].get("price")
            if isinstance(price, (int, float)) and price > 0:
                return float(price)
    return None


class ParallelScrapingAgent:
    def __init__(self, timeout_sec: int = 8):
        self.timeout_sec = timeout_sec
        self.serp_key = os.getenv("SERP_API_KEY") or os.getenv("NEXT_PUBLIC_SERPAPI_KEY")
        self.executor = ThreadPoolExecutor(max_workers=12)

    def build_queries(self, component_name: str) -> Dict[str, str]:
        base = component_name.strip()
        return {
            "Amazon India": f"{base} site:amazon.in",
            "Flipkart India": f"{base} site:flipkart.com",
            "MDComputers": f"{base} site:mdcomputers.in",
            "PrimeABGB": f"{base} site:primeabgb.com",
        }

    def _fetch_from_serpapi(self, source: str, query: str) -> List[ProductHit]:
        if not self.serp_key:
            return []

        url = "https://serpapi.com/search.json"
        params = {
            "engine": "google_shopping",
            "google_domain": "google.co.in",
            "q": query,
            "api_key": self.serp_key,
            "num": 8,
        }

        try:
            resp = requests.get(url, params=params, timeout=self.timeout_sec)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return []

        hits: List[ProductHit] = []
        for item in data.get("shopping_results", [])[:8]:
            title = str(item.get("title", "")).strip()
            if not title:
                continue
            price = _parse_price(item.get("price"))
            link = str(item.get("link", "")).strip()
            if link and SOURCE_SITES[source] not in link.lower():
                continue

            rating = None
            raw_rating = item.get("rating")
            if isinstance(raw_rating, (int, float)):
                rating = float(raw_rating)

            hits.append(
                ProductHit(
                    source=source,
                    title=title,
                    price=price,
                    url=link,
                    availability="In Stock" if price else "Unknown",
                    rating=rating,
                )
            )

        return hits

    async def fetch_component_parallel(self, component_name: str) -> List[ProductHit]:
        queries = self.build_queries(component_name)
        loop = asyncio.get_running_loop()
        tasks = [
            loop.run_in_executor(self.executor, self._fetch_from_serpapi, source, query)
            for source, query in queries.items()
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        merged: List[ProductHit] = []
        for result in results:
            if isinstance(result, Exception):
                continue
            merged.extend(result)
        return merged


class DataCleaningAgent:
    @staticmethod
    def clean_and_match(component_name: str, raw_hits: List[ProductHit]) -> List[ProductHit]:
        dedup: Dict[Tuple[str, str], ProductHit] = {}

        for hit in raw_hits:
            if not _variant_match(component_name, hit.title):
                continue

            norm = _normalize_title(hit.title)
            key = (hit.source, norm)

            # Keep the better entry if duplicate exists.
            if key in dedup:
                existing = dedup[key]
                current_score = (0 if hit.price is None else 1) + (0 if hit.rating is None else hit.rating / 5)
                existing_score = (0 if existing.price is None else 1) + (0 if existing.rating is None else existing.rating / 5)
                if current_score > existing_score:
                    dedup[key] = hit
            else:
                dedup[key] = hit

        return list(dedup.values())


class PriceComparisonAgent:
    @staticmethod
    def compare(clean_hits: List[ProductHit]) -> Dict[str, Any]:
        available = [h for h in clean_hits if h.price is not None]
        if not available:
            return {
                "lowest": None,
                "price_difference": None,
                "by_source": {},
            }

        by_source: Dict[str, ProductHit] = {}
        for hit in available:
            if hit.source not in by_source or (hit.price or 0) < (by_source[hit.source].price or float("inf")):
                by_source[hit.source] = hit

        source_list = list(by_source.values())
        source_list.sort(key=lambda x: x.price or float("inf"))

        lowest = source_list[0]
        highest = source_list[-1]
        diff = (highest.price or 0) - (lowest.price or 0)

        return {
            "lowest": lowest,
            "price_difference": round(diff, 2),
            "by_source": {s.source: s for s in source_list},
        }


class DecisionAgent:
    @staticmethod
    def _score(hit: ProductHit, min_price: float, max_price: float) -> float:
        if hit.price is None:
            return 0.0

        if max_price <= min_price:
            price_score = 1.0
        else:
            price_score = 1.0 - ((hit.price - min_price) / (max_price - min_price))

        rating_score = (hit.rating / 5.0) if hit.rating is not None else 0.65
        trust_score = SOURCE_TRUST.get(hit.source, 0.8)
        availability_score = 1.0 if "stock" in hit.availability.lower() else 0.6

        return (price_score * 0.45) + (rating_score * 0.20) + (trust_score * 0.25) + (availability_score * 0.10)

    @staticmethod
    def decide(component_name: str, clean_hits: List[ProductHit]) -> Dict[str, Any]:
        available = [h for h in clean_hits if h.price is not None]
        if not available:
            return {
                "best": None,
                "alternatives": [],
                "insight": "Live listings not found; fallback pricing used with caution.",
            }

        prices = [h.price for h in available if h.price is not None]
        min_price, max_price = min(prices), max(prices)

        ranked = sorted(
            available,
            key=lambda h: DecisionAgent._score(h, min_price, max_price),
            reverse=True,
        )

        best = ranked[0]
        alternatives = ranked[1:3]

        # If options are in similar range, provide practical performance insight.
        close_range = [h for h in ranked if h.price is not None and abs(h.price - (best.price or 0)) <= 2000]
        if len(close_range) > 1 and "rtx 4060" in component_name.lower():
            insight = "Best in this range due to stronger feature stack (DLSS/frame generation) and better power efficiency in real gaming workloads."
        else:
            insight = "Best overall based on balanced score: lower price, reliable seller trust, and available listing quality."

        return {
            "best": best,
            "alternatives": alternatives,
            "insight": insight,
        }


class LivePricingEngine:
    def __init__(self):
        self.scraper = ParallelScrapingAgent()
        self.cleaner = DataCleaningAgent()
        self.comparator = PriceComparisonAgent()
        self.decision = DecisionAgent()

    async def analyze_component(self, component_name: str, component_type: Optional[str] = None) -> Dict[str, Any]:
        raw_hits = await self.scraper.fetch_component_parallel(component_name)
        clean_hits = self.cleaner.clean_and_match(component_name, raw_hits)
        comparison = self.comparator.compare(clean_hits)
        decision = self.decision.decide(component_name, clean_hits)

        fallback_used = False
        warning = None

        if decision["best"] is None:
            fallback_price = _fallback_price_for_component(component_name)
            fallback_used = fallback_price is not None
            if fallback_used:
                decision["best"] = ProductHit(
                    source="Fallback Database",
                    title=component_name,
                    price=fallback_price,
                    url="",
                    availability="Assumed Available",
                    rating=None,
                )
                warning = "Real-time scrape failed, fallback price used."
            else:
                warning = "Product not found across live sources and fallback database."

        best = decision["best"]
        alts = decision["alternatives"]

        result = {
            "component": f"{(component_type or 'Component').upper()} ({component_name})",
            "best_option": {
                "price": round(best.price, 2) if best and best.price else None,
                "platform": best.source if best else None,
                "link": best.url if best else None,
                "title": best.title if best else None,
                "availability": best.availability if best else "Unknown",
                "rating": best.rating if best else None,
            },
            "alternative_options": [
                {
                    "price": round(a.price, 2) if a.price else None,
                    "platform": a.source,
                    "link": a.url,
                    "title": a.title,
                    "availability": a.availability,
                    "rating": a.rating,
                }
                for a in alts
            ],
            "insight": decision["insight"],
            "price_comparison": {
                "price_difference": comparison.get("price_difference"),
                "lowest_price_platform": comparison.get("lowest").source if comparison.get("lowest") else None,
            },
            "fallback_used": fallback_used,
            "warning": warning,
            "raw_count": len(raw_hits),
            "matched_count": len(clean_hits),
        }

        return result

    async def analyze_build(self, configuration: Dict[str, str], auto_update: bool = True) -> Dict[str, Any]:
        items = [(k, v) for k, v in configuration.items() if isinstance(v, str) and v.strip()]
        tasks = [self.analyze_component(component_name=v, component_type=k) for k, v in items]
        component_results = await asyncio.gather(*tasks)

        total = 0.0
        fallback_count = 0
        warnings: List[str] = []

        for comp in component_results:
            price = comp["best_option"].get("price")
            if price:
                total += price
            if comp.get("fallback_used"):
                fallback_count += 1
            if comp.get("warning"):
                warnings.append(f"{comp['component']}: {comp['warning']}")

        # Savings estimate: sum of (max alt - best) where possible
        savings = 0.0
        for comp in component_results:
            best_price = comp["best_option"].get("price")
            alt_prices = [a.get("price") for a in comp.get("alternative_options", []) if a.get("price")]
            if best_price and alt_prices:
                highest_alt = max(alt_prices)
                if highest_alt > best_price:
                    savings += highest_alt - best_price

        output = {
            "components": component_results,
            "global_build_output": {
                "total_build_cost": round(total, 2),
                "savings_from_best_deals": round(savings, 2),
                "warnings": warnings,
                "fallback_components": fallback_count,
                "generated_at": datetime.utcnow().isoformat() + "Z",
                "sources": list(SOURCE_SITES.keys()),
            },
        }

        if auto_update:
            self.auto_update_cache(output)
            self.apply_prices_to_component_db(component_results)

        return output

    def auto_update_cache(self, payload: Dict[str, Any]) -> None:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)

    @staticmethod
    def apply_prices_to_component_db(component_results: List[Dict[str, Any]]) -> None:
        # Runtime in-memory price patching so recommendation calls can use latest values.
        groups = [CPUs, GPUs, MOTHERBOARDs, RAMs, STORAGE, PSUs, MONITORS]

        for comp in component_results:
            title = comp.get("best_option", {}).get("title")
            price = comp.get("best_option", {}).get("price")
            if not title or not price:
                continue

            for group in groups:
                if title in group and isinstance(group[title], dict):
                    group[title]["price"] = int(price)
                    break

    def controller_queries(self, component_name: str) -> Dict[str, Any]:
        queries = self.scraper.build_queries(component_name)
        return {
            "component": component_name,
            "queries": {
                "amazon_india": queries["Amazon India"],
                "flipkart_india": queries["Flipkart India"],
            },
        }

    async def controller_search(self, component_name: str) -> Dict[str, Any]:
        queries = self.controller_queries(component_name)
        raw_hits = await self.scraper.fetch_component_parallel(component_name)
        cleaned = self.cleaner.clean_and_match(component_name, raw_hits)

        # Return compact controller-friendly JSON
        extracted = []
        for hit in cleaned:
            if hit.source not in ("Amazon India", "Flipkart India"):
                continue
            extracted.append(
                {
                    "source": hit.source,
                    "title": hit.title,
                    "price": hit.price,
                    "link": hit.url,
                }
            )

        return {
            **queries,
            "results": extracted,
        }


def run_component(component_name: str, component_type: Optional[str] = None) -> Dict[str, Any]:
    engine = LivePricingEngine()
    return asyncio.run(engine.analyze_component(component_name, component_type))


def run_build(configuration: Dict[str, str], auto_update: bool = True) -> Dict[str, Any]:
    engine = LivePricingEngine()
    return asyncio.run(engine.analyze_build(configuration, auto_update=auto_update))


def run_controller(component_name: str) -> Dict[str, Any]:
    engine = LivePricingEngine()
    return asyncio.run(engine.controller_search(component_name))


if __name__ == "__main__":
    demo_config = {
        "cpu": "Intel Core i5-12400F",
        "gpu": "NVIDIA RTX 4060",
        "ram": "Corsair Vengeance LPX 16GB DDR4",
        "motherboard": "ASUS ROG STRIX B660-F",
        "storage": "Samsung 970 EVO Plus 1TB",
        "psu": "Corsair RM750x",
    }
    data = run_build(demo_config)
    print(json.dumps(data, indent=2, ensure_ascii=False))
