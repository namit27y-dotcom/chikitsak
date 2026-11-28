import json
from typing import Literal

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import ValidationError

from app.core.config import get_settings
from app.core.exceptions import AppError
from app.schemas.care_plan import GeminiCarePlanPayload

SYSTEM_INSTRUCTION = """You are CHIKITSAK, a cautious medical communication assistant.
Your sole task is to convert a hospital discharge summary into a clear, patient-friendly JSON care plan at an approximate Class 8 reading level.

STRICT SAFETY RULES:
1. Rely ONLY on the provided discharge summary text.
2. NEVER invent medicine names, dosages, frequencies, durations, diagnoses, or follow-up dates.
3. NEVER alter a dosage or strength from the source text.
4. If any dosage, timing, duration, or follow-up detail is missing or ambiguous in the source text, leave that field empty (or null for follow_up.date) and add an explanatory entry in "unclear_information".
5. Preserve all important warning signs mentioned in the source text.
6. Simplify medical jargon without changing medical meaning.
7. Output ONLY valid JSON matching the requested schema.
"""


def _normalize_output_language(language: str) -> Literal["English", "Hindi"]:
    lowered = language.strip().lower()
    if lowered in {"hi", "hindi"}:
        return "Hindi"
    return "English"


def is_gemini_configured() -> bool:
    settings = get_settings()
    return bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip())


def generate_care_plan_from_text(
    extracted_text: str,
    requested_language: str = "English",
) -> GeminiCarePlanPayload:
    settings = get_settings()
    if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
        raise AppError(
            "AI service is not configured. Please configure GEMINI_API_KEY.",
            status_code=503,
            code="ai_not_configured",
        )

    target_language = _normalize_output_language(requested_language)
    prompt = (
        f"Target output_language: {target_language}.\n"
        "Write all patient-facing explanations in "
        f"{'simple everyday Hindi (Devanagari script)' if target_language == 'Hindi' else 'simple everyday English (Class 8 reading level)'}, "
        "while preserving exact medication names and numeric dosages from the discharge summary.\n\n"
        "DISCHARGE SUMMARY TEXT:\n"
        f"{extracted_text}"
    )

    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=GeminiCarePlanPayload,
                temperature=0.1,
            ),
        )
    except genai_errors.APIError as exc:
        code = getattr(exc, "code", None)
        if code == 429:
            raise AppError(
                "Gemini AI rate limit reached. Please retry shortly.",
                status_code=429,
                code="ai_rate_limited",
            )
        raise AppError(
            "Gemini AI service returned an error while analyzing the discharge summary.",
            status_code=502,
            code="ai_api_error",
        )
    except TimeoutError:
        raise AppError(
            "Gemini AI request timed out. Please retry.",
            status_code=504,
            code="ai_timeout",
        )
    except Exception:
        raise AppError(
            "Unable to complete Gemini AI analysis right now.",
            status_code=502,
            code="ai_unavailable",
        )

    raw_text = getattr(response, "text", None)
    if not raw_text:
        raise AppError(
            "Gemini AI returned an empty response.",
            status_code=502,
            code="ai_empty_response",
        )

    try:
        data = json.loads(raw_text)
        payload = GeminiCarePlanPayload.model_validate(data)
        payload.output_language = target_language
        return payload
    except (json.JSONDecodeError, ValidationError):
        raise AppError(
            "Gemini AI returned an invalid or unsupported response structure.",
            status_code=502,
            code="ai_invalid_json",
        )
