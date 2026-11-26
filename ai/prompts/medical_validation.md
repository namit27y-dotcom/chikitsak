# Medical Information Validation Specification

## Deterministic Post-AI Validation (`backend/app/services/validation_service.py`)

Every Gemini-generated `GeminiCarePlanPayload` is checked deterministically against the extracted discharge summary text before saving:

1. **Minimum Source Threshold**:
   - If normalized source text is shorter than 40 characters, status is set to `Incomplete Source Information`.
2. **Medication Name & Dosage Verification**:
   - Extracts primary drug token(s) from `medicine_name` and checks presence in normalized alphanumeric source text.
   - Extracts numeric quantities from `dosage` (e.g., `500`, `40`, `2.5`) and verifies every numeric value appears in the source text.
   - Requires non-empty `dosage` and `frequency`; otherwise sets `verified_against_source = False`.
3. **Follow-Up Date Verification**:
   - Extracts numeric components from `follow_up.date` and checks presence in source text.
4. **Final Status Assignment**:
   - `Verified Against Source`: All medications, numeric dosages, and follow-up dates match source text and `unclear_information` is empty.
   - `Needs Review`: One or more medications/dosages/dates did not match deterministically or `unclear_information` is non-empty.
   - `Incomplete Source Information`: Source text is insufficient or lacks confirmable diagnoses and medications.
