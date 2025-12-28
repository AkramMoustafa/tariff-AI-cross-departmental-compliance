def extract_cfr_references(
    text: str,
    source_id: str,
    context_title: str | None = None
):
    refs = []

    # Full CFR references (still globally resolvable)
    for match in CFR_REGEX.finditer(text):
        title = match.group("title")
        part = match.group("part")
        section = match.group("section")

        target_id = (
            f"cfr:{title}:{part}:{part}.{section}"
            if section else f"cfr:{title}:{part}"
        )

        refs.append({
            "from": source_id,
            "to": target_id,
            "type": "cfr_reference",
            "source_text": match.group(0)
        })

    # § references — resolve globally IF title exists, otherwise keep local
    for match in SECTION_REGEX.finditer(text):
        part = match.group("part")
        section = match.group("section")

        if context_title:
            target = f"cfr:{context_title}:{part}:{part}.{section}"
            ref_type = "cfr_section_reference"
        else:
            target = {
                "part": part,
                "section": section
            }
            ref_type = "local_cfr_section_reference"

        refs.append({
            "from": source_id,
            "to": target,
            "type": ref_type,
            "source_text": match.group(0)
        })
import re
from typing import List, Dict, Optional

# Full CFR references like:
#   45 CFR 164.308(a)(4)
#   29 CFR 1910.120
CFR_REGEX = re.compile(
    r"""
    (?P<title>\d+)\s*CFR\s+
    (?P<part>\d+)
    (?:\.(?P<section>\d+(?:[-–]\d+)?(?:\([a-z0-9]+\))*))?
    """,
    re.IGNORECASE | re.VERBOSE
)

SECTION_REGEX = re.compile(
    r"""
    §\s*
    (?P<part>\d+)
    \.
    (?P<section>\d+(?:\([a-z0-9]+\))*)
    """,
    re.IGNORECASE | re.VERBOSE
)

def extract_cfr_references(
    text: str,
    source_id: str,
) -> List[Dict]:
    """
    Extract CFR references from regulation text.

    IMPORTANT DESIGN DECISION:
    - Every regulation JSON already represents a single CFR section/file.
    - Therefore, § references are resolved *locally* without requiring a title.
    - NO hard failure if title is missing.
    """

    if not text:
        return []

    refs: List[Dict] = []

    for match in CFR_REGEX.finditer(text):
        title = match.group("title")
        part = match.group("part")
        section = match.group("section")

        if section:
            target_id = f"cfr:{title}:{part}:{part}.{section}"
        else:
            target_id = f"cfr:{title}:{part}"

        refs.append({
            "from": source_id,
            "to": target_id,
            "type": "cfr_reference",
            "source_text": match.group(0).strip()
        })

    for match in SECTION_REGEX.finditer(text):
        part = match.group("part")
        section = match.group("section")

        refs.append({
            "from": source_id,
            "to": {
                "part": part,
                "section": section
            },
            "type": "local_cfr_section_reference",
            "source_text": match.group(0).strip()
        })

    return refs


DEFINITION_PATTERNS = [
    re.compile(r"\bas used in\b", re.IGNORECASE),
    re.compile(r"\bmeans\b", re.IGNORECASE),
    re.compile(r"\brefers to\b", re.IGNORECASE),
]


def is_definition_section(regulation: Dict) -> bool:
    """
    Heuristic detection of definition sections.
    Used to avoid auditing definitions as requirements.
    """

    heading = (regulation.get("heading") or "").lower()
    if "definition" in heading:
        return True

    for para in regulation.get("text_paragraphs", []):
        for pattern in DEFINITION_PATTERNS:
            if pattern.search(para):
                return True

    return False

    return refs


def _normalize_regulations(self, regulations):
    normalized = []

    for reg in regulations:
        reg_id = reg.get("Reg_ID", "")
        text = reg.get("Requirement_Text", "")

        # Detect full CFR sections and split them
        if reg_id.startswith("cfr-") and "\n(" in text:
            subsections = split_cfr_subsections(reg_id, text)
            if subsections:
                normalized.extend(subsections)
                continue  # drop the parent section

        normalized.append(reg)

    return normalized

def split_cfr_subsections(section_id: str, full_text: str):
    pattern = re.compile(
        r"\((?P<label>[a-z])\)\s*(?P<body>.*?)(?=\n\s*\([a-z]\)|$)",
        re.DOTALL | re.IGNORECASE
    )

    results = []

    for match in pattern.finditer(full_text):
        label = match.group("label")
        body = match.group("body").strip()

        if len(body) < 40:
            continue

        results.append({
            "Reg_ID": f"{section_id}({label})",
            "Requirement_Text": body,
            "Risk_Rating": "High",
            "Target_Area": "HIPAA Security Rule",
            "Dow_Focus": "Federal"
        })

    return results
