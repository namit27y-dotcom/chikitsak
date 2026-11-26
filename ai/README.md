# CHIKITSAK AI Module

This directory houses the prompt engineering specifications and evaluation guidelines used by CHIKITSAK's backend Gemini AI pipeline (`backend/app/services/ai_service.py` and `backend/app/services/validation_service.py`).

## Design Principles
1. **Strict Source Grounding**: Only extract and simplify facts explicitly present in the discharge summary text.
2. **Medication & Dosage Preservation**: Never alter numeric strengths, units, or frequencies, and never invent unlisted medicines.
3. **Explicit Uncertainty Reporting**: Any missing, blurred, or ambiguous detail must be recorded under `unclear_information` rather than guessed.
4. **Accessible Reading Level**: Explanations target an approximate Class 8 reading level in everyday English or Hindi (Devanagari script).
5. **Backend-Only Execution**: All `@google/genai` SDK calls execute exclusively on the FastAPI backend using server-side `GEMINI_API_KEY`.
