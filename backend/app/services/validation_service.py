import re
from dataclasses import dataclass
from typing import List, Tuple

from app.schemas.care_plan import GeminiCarePlanPayload

VERIFIED_STATUS = "Verified Against Source"
NEEDS_REVIEW_STATUS = "Needs Review"
INCOMPLETE_STATUS = "Incomplete Source Information"

_STOP_WORDS = {
    "tab",
    "tablet",
    "tablets",
    "cap",
    "capsule",
    "capsules",
    "syp",
    "syrup",
    "inj",
    "injection",
    "drop",
    "drops",
    "oral",
    "daily",
    "once",
    "twice",
    "thrice",
    "after",
    "before",
    "food",
    "meal",
    "meals",
    "with",
    "water",
    "days",
    "day",
}


@dataclass
class MedicationValidationResult:
    verified: bool
    note: str


@dataclass
class PlanValidationResult:
    validation_status: str
    validation_notes: List[str]
    medication_results: List[MedicationValidationResult]


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _extract_meaningful_tokens(text: str) -> List[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    return [t for t in tokens if len(t) >= 3 and t not in _STOP_WORDS]


def _extract_numeric_quantities(text: str) -> List[str]:
    # Captures numbers like 500, 40, 60000, 5, 2.5
    return re.findall(r"\d+(?:\.\d+)?", text)


def validate_care_plan_against_source(
    source_text: str,
    plan: GeminiCarePlanPayload,
) -> PlanValidationResult:
    normalized_source = _normalize(source_text)
    source_alnum = re.sub(r"[^a-z0-9]+", " ", normalized_source)
    source_compact = re.sub(r"[^a-z0-9]+", "", normalized_source)

    notes: List[str] = []
    med_results: List[MedicationValidationResult] = []

    if len(normalized_source) < 40:
        notes.append("Source discharge text is too brief to verify all clinical details.")
        return PlanValidationResult(
            validation_status=INCOMPLETE_STATUS,
            validation_notes=notes,
            medication_results=[
                MedicationValidationResult(verified=False, note="Insufficient source text")
                for _ in plan.medications
            ],
        )

    any_unverified = False

    for med in plan.medications:
        med_tokens = _extract_meaningful_tokens(med.medicine_name)
        name_matched = False
        if med_tokens:
            # At least the primary drug token (longest meaningful token) must exist in source
            primary_token = max(med_tokens, key=len)
            name_matched = primary_token in source_alnum or primary_token in source_compact

        dosage_numbers = _extract_numeric_quantities(med.dosage)
        dosage_matched = True
        if dosage_numbers:
            dosage_matched = all(num in source_alnum for num in dosage_numbers)

        if not med.medicine_name.strip():
            any_unverified = True
            med_results.append(
                MedicationValidationResult(
                    verified=False,
                    note="Missing medicine name in extracted instruction.",
                )
            )
            notes.append("A medication entry had no medicine name and requires review.")
        elif name_matched and dosage_matched:
            if not med.dosage.strip() or not med.frequency.strip():
                any_unverified = True
                med_results.append(
                    MedicationValidationResult(
                        verified=False,
                        note="Medicine found in source, but dosage or frequency is incomplete.",
                    )
                )
                notes.append(
                    f"Medication '{med.medicine_name}' is missing explicit dosage or frequency in source."
                )
            else:
                med_results.append(
                    MedicationValidationResult(
                        verified=True,
                        note="Medicine name and numeric dosage matched against discharge summary.",
                    )
                )
        else:
            any_unverified = True
            reason_parts = []
            if not name_matched:
                reason_parts.append("medicine name not found verbatim in source")
            if not dosage_matched:
                reason_parts.append("dosage value not matched in source")
            reason = "; ".join(reason_parts) or "requires manual verification"
            med_results.append(
                MedicationValidationResult(verified=False, note=f"Needs review: {reason}.")
            )
            notes.append(f"Medication '{med.medicine_name}' flagged for review ({reason}).")

    # Follow-up date deterministic verification
    if plan.follow_up.date:
        date_nums = _extract_numeric_quantities(plan.follow_up.date)
        date_matched = bool(date_nums) and all(num in source_alnum for num in date_nums)
        if not date_matched:
            any_unverified = True
            notes.append(
                f"Follow-up date '{plan.follow_up.date}' could not be deterministically matched in source text."
            )

    if plan.unclear_information:
        notes.append(
            f"{len(plan.unclear_information)} unclear or missing item(s) flagged from the source record."
        )

    if not plan.medications and not plan.diagnosis:
        return PlanValidationResult(
            validation_status=INCOMPLETE_STATUS,
            validation_notes=notes or ["No diagnoses or medications could be confirmed from source."],
            medication_results=med_results,
        )

    if any_unverified or plan.unclear_information:
        status = NEEDS_REVIEW_STATUS
    else:
        status = VERIFIED_STATUS
        notes.append(
            "All listed medications and follow-up dates matched against the extracted source text. Not a substitute for physician review."
        )

    return PlanValidationResult(
        validation_status=status,
        validation_notes=notes,
        medication_results=med_results,
    )
