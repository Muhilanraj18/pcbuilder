"""
SerpAPI Google Shopping helper for PC Builder.

Usage:
  python scripts/serpapi_price_lookup.py "RTX 4060"

Reads SERP_API_KEY or NEXT_PUBLIC_SERPAPI_KEY from the environment,
or from .env.local in the project root.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import requests


def load_local_env(env_name: str = ".env.local") -> None:
    env_path = Path(__file__).resolve().parent.parent / env_name
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and value and not os.getenv(key):
            os.environ[key] = value


def get_api_key() -> str:
    return os.getenv("SERP_API_KEY") or os.getenv("NEXT_PUBLIC_SERPAPI_KEY") or ""


def search_google_shopping(query: str) -> list[dict[str, object]]:
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("Missing SERP_API_KEY or NEXT_PUBLIC_SERPAPI_KEY")

    params = {
        "engine": "google_shopping",
        "q": query,
        "google_domain": "google.co.in",
        "hl": "en",
        "gl": "in",
        "api_key": api_key,
    }

    response = requests.get("https://serpapi.com/search.json", params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    results = data.get("shopping_results") or []
    output: list[dict[str, object]] = []
    for item in results[:5]:
        output.append({
            "title": item.get("title", "Unknown product"),
            "price": item.get("price") or item.get("extracted_price"),
            "source": item.get("source") or item.get("merchant") or "Google Shopping",
            "link": item.get("link", ""),
        })

    return output


def main() -> None:
    load_local_env()
    query = " ".join(sys.argv[1:]).strip() or "RTX 4060"
    results = search_google_shopping(query)
    print(json.dumps({"query": query, "results": results}, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()