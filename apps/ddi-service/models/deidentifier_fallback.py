# models/deidentifier_fallback.py
# Simple regex-based deidentifier that doesn't require ML models

import re
from typing import Dict, List

# ─── Regex patterns ───────────────────────────────────────────
regex_patterns = {
    "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    "PHONE": r"\b\d{10,}\b",
    "ADDRESS": r"\d+\s[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Blvd|Boulevard|Drive|Dr)\b",
    "NAME": r"\b[A-Z][a-z]+\s[A-Z][a-z]+\b",  # Simple name pattern
    "DATE": r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b",  # Date patterns
    "ID": r"\b\d{6,}\b"  # ID numbers
}

def deidentify_text(text: str) -> Dict:
    """
    Simple regex-based deidentification that works without ML models
    """
    regex_entities = []
    for entity_type, pattern in regex_patterns.items():
        for match in re.finditer(pattern, text):
            regex_entities.append({
                "entity_group": entity_type,
                "start": match.start(),
                "end": match.end()
            })

    # Sort by start position in reverse order for proper replacement
    all_entities = sorted(regex_entities, key=lambda e: e['start'], reverse=True)

    redacted_text = text
    extracted_info = []
    
    for ent in all_entities:
        start, end = ent["start"], ent["end"]
        original = text[start:end]
        entity_type = ent["entity_group"]

        redacted_text = redacted_text[:start] + f"[REDACTED:{entity_type}]" + redacted_text[end:]
        extracted_info.append({
            "original": original,
            "start": start,
            "end": end,
            "original_tag": entity_type,
            "remapped_tag": entity_type
        })

    return {
        "input_text": text,
        "deidentified_text": redacted_text,
        "entities": list(reversed(extracted_info))
    }