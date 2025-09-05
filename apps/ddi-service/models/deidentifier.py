# models/deidentifier.py

import re
from typing import Dict, List
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# ─── Load DeID model lazily to avoid startup crashes ───────────────────────────────
model_name = "StanfordAIMI/stanford-deidentifier-base"
tokenizer = None
model = None
nlp_pipeline = None

def _load_model():
    global tokenizer, model, nlp_pipeline
    if nlp_pipeline is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForTokenClassification.from_pretrained(model_name)
            nlp_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")
        except Exception as e:
            print(f"Warning: Could not load deidentifier model: {e}")
            # Return a dummy pipeline that just returns empty results
            nlp_pipeline = lambda x: []

# ─── Regex patterns ───────────────────────────────────────────
regex_patterns = {
    "EMAIL": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    "PHONE": r"\b\d{10,}\b",
    "ADDRESS": r"\d+\s[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Lane|Ln|Blvd|Boulevard|Drive|Dr)\b"
}

# ─── Entity remapping ─────────────────────────────────────────
ENTITY_REMAP = {
    "HCW": "NAME",
    "PATIENT": "NAME",
    "HOSPITAL": "ADDRESS",
    "VENDOR": "OTHER",
    "ID": "ID",
    "PHONE": "PHONE",
    "EMAIL": "EMAIL",
    "DATE": "DATE",
}

# ─── Main function to expose ──────────────────────────────────
def deidentify_text(text: str) -> Dict:
    _load_model()  # Load model on first use
    
    try:
        ner_entities = nlp_pipeline(text) if nlp_pipeline else []
    except Exception as e:
        print(f"Warning: NER pipeline failed: {e}")
        ner_entities = []

    regex_entities = []
    for entity_type, pattern in regex_patterns.items():
        for match in re.finditer(pattern, text):
            regex_entities.append({
                "entity_group": entity_type,
                "start": match.start(),
                "end": match.end()
            })

    all_entities = ner_entities + regex_entities
    all_entities = sorted(all_entities, key=lambda e: e['start'], reverse=True)

    redacted_text = text
    extracted_info = []
    for ent in all_entities:
        start, end = ent["start"], ent["end"]
        original = text[start:end]
        original_tag = ent["entity_group"]
        remapped_tag = ENTITY_REMAP.get(original_tag, "OTHER")

        redacted_text = redacted_text[:start] + f"[REDACTED:{remapped_tag}]" + redacted_text[end:]
        extracted_info.append({
            "original": original,
            "start": start,
            "end": end,
            "original_tag": original_tag,
            "remapped_tag": remapped_tag
        })

    return {
        "input_text": text,
        "deidentified_text": redacted_text,
        "entities": list(reversed(extracted_info))
    }
