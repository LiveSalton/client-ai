#!/usr/bin/env python3
"""Heuristic validator for Google Play ASO metadata drafts.

Usage:
    python scripts/validate_metadata.py metadata.json

Input shape:
    {
      "app_name": "...",
      "short_description": "...",
      "full_description": "...",
      "variants": [
        {"name": "A", "app_name": "...", "short_description": "...", "full_description": "..."}
      ]
    }

The script uses only Python standard library and prints a JSON report.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

LIMITS = {
    "app_name": 30,
    "short_description": 80,
    "full_description": 4000,
}

RISKY_PATTERNS = {
    "ranking_or_award_claim": re.compile(r"(#\s*1|\bno\.\s*1\b|\bbest\b|\btop rated\b|\bpopular\b|\baward\b|app of the year)", re.I),
    "promotion_or_price_claim": re.compile(r"(free|no ads|discount|sale|limited time|cash back|%\s*off|\$\s*\d+)", re.I),
    "overclaim": re.compile(r"(guaranteed|instantly|100%|always|never|ultimate|perfect|virus-free|boosts? speed)", re.I),
    "official_or_impersonation_risk": re.compile(r"\bofficial\b|\bpartner\b|\bendorsed\b", re.I),
    "excessive_punctuation": re.compile(r"[!?]{2,}|[.]{4,}"),
    "emoji_or_symbol_cluster": re.compile(r"[\U0001F300-\U0001FAFF]|[★☆✓✔✕✖]{2,}"),
}

WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9']+")


def load_json(path: Path) -> Dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"Input file not found: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}")


def normalize_variants(data: Dict[str, Any]) -> List[Dict[str, Any]]:
    variants = []
    if any(key in data for key in LIMITS):
        variants.append({"name": data.get("name", "root"), **{k: data.get(k, "") for k in LIMITS}})
    raw_variants = data.get("variants", [])
    if isinstance(raw_variants, list):
        for idx, item in enumerate(raw_variants, start=1):
            if isinstance(item, dict):
                variants.append({"name": item.get("name", f"variant_{idx}"), **{k: item.get(k, "") for k in LIMITS}})
    return variants


def repeated_words(text: str) -> List[Tuple[str, int]]:
    words = [w.lower() for w in WORD_RE.findall(text)]
    stop = {"the", "and", "for", "with", "your", "you", "app", "apps", "this", "that", "from", "are", "use", "to", "of", "in", "on", "a", "an"}
    counts = Counter(w for w in words if w not in stop and len(w) > 2)
    return [(word, count) for word, count in counts.most_common() if count >= 5]


def validate_field(field: str, text: str) -> Dict[str, Any]:
    text = text or ""
    result: Dict[str, Any] = {
        "field": field,
        "length": len(text),
        "limit": LIMITS[field],
        "ok_length": len(text) <= LIMITS[field],
        "warnings": [],
    }
    if not text.strip():
        result["warnings"].append("missing_or_empty")
    if len(text) > LIMITS[field]:
        result["warnings"].append(f"over_limit_by_{len(text) - LIMITS[field]}")
    for name, pattern in RISKY_PATTERNS.items():
        if pattern.search(text):
            result["warnings"].append(name)
    repeats = repeated_words(text)
    if repeats:
        result["warnings"].append({"keyword_repetition": repeats[:10]})
    return result


def validate(data: Dict[str, Any]) -> Dict[str, Any]:
    variants = normalize_variants(data)
    if not variants:
        return {"ok": False, "error": "No metadata fields or variants found."}
    report = {"ok": True, "variants": []}
    for variant in variants:
        fields = [validate_field(field, str(variant.get(field, ""))) for field in LIMITS]
        ok = all(f["ok_length"] and not any(isinstance(w, str) and w.startswith("missing") for w in f["warnings"]) for f in fields)
        has_policy_warnings = any(f["warnings"] for f in fields)
        report["variants"].append({
            "name": variant.get("name", "unnamed"),
            "ok_basic_lengths": ok,
            "has_warnings": has_policy_warnings,
            "fields": fields,
        })
        if not ok:
            report["ok"] = False
    return report


def main(argv: List[str]) -> int:
    if len(argv) != 2:
        print("Usage: python scripts/validate_metadata.py metadata.json", file=sys.stderr)
        return 2
    data = load_json(Path(argv[1]))
    report = validate(data)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
