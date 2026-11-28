import io
import json
import shutil
from types import SimpleNamespace

import pymupdf
import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw
from sqlalchemy import select

from app.core.config import get_settings
from app.models.care_plan import CarePlan
from app.schemas.care_plan import (
    GeminiCarePlanPayload,
    GeminiFollowUpSchema,
    GeminiMedicationSchema,
)
from app.services.validation_service import (
    INCOMPLETE_STATUS,
    NEEDS_REVIEW_STATUS,
    VERIFIED_STATUS,
    validate_care_plan_against_source,
)
from tests.conftest import register_and_get_headers


def _make_pdf_bytes(text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((72, 72), text, fontsize=11)
    data = doc.tobytes()
    doc.close()
    return data


def _make_text_image_bytes(lines: list[str]) -> bytes:
    img = Image.new("RGB", (1100, 420), color="white")
    draw = ImageDraw.Draw(img)
    y = 30
    for line in lines:
        draw.text((30, y), line, fill="black")
        y += 38
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_file_upload_validation_rejects_bad_files(client: TestClient) -> None:
    headers = register_and_get_headers(client, email="uploadcheck@example.com")

    # Unsupported extension
    bad_ext = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("notes.txt", b"hello world", "text/plain")},
    )
    assert bad_ext.status_code == 400

    # Spoofed PDF bytes
    bad_pdf = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("fake.pdf", b"NOT_A_REAL_PDF", "application/pdf")},
    )
    assert bad_pdf.status_code == 400

    # Empty file
    empty_pdf = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert empty_pdf.status_code == 400


def test_pdf_upload_ai_pipeline_validation_and_isolation(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sample_payload = {
        "patient_summary": "You were treated for mild pneumonia and fever. Finish all prescribed tablets and rest.",
        "diagnosis": ["Community-acquired pneumonia"],
        "medications": [
            {
                "medicine_name": "Paracetamol",
                "dosage": "500mg",
                "frequency": "Twice daily",
                "duration": "5 days",
                "administration_time": "Morning & Night",
                "additional_instructions": "Take after meals",
            }
        ],
        "care_instructions": ["Drink warm water and rest well."],
        "warning_signs": ["High fever above 102 F or difficulty breathing"],
        "follow_up": {
            "date": "12 Dec 2025",
            "instructions": "Visit OPD with chest X-ray",
        },
        "unclear_information": [],
        "output_language": "English",
    }

    class FakeModels:
        def generate_content(self, **_kwargs):
            return SimpleNamespace(text=json.dumps(sample_payload))

    class FakeClient:
        def __init__(self, **_kwargs):
            self.models = FakeModels()

    monkeypatch.setattr("app.services.ai_service.genai.Client", FakeClient)

    pdf_bytes = _make_pdf_bytes(
        "DISCHARGE SUMMARY\n"
        "Diagnosis: Community-acquired pneumonia.\n"
        "Rx: Tab Paracetamol 500mg twice daily for 5 days after meals.\n"
        "Warning signs: Return if high fever above 102 F or difficulty breathing.\n"
        "Follow-up: 12 Dec 2025 in OPD with chest X-ray."
    )

    headers_a = register_and_get_headers(client, email="alice@example.com", full_name="Alice")
    headers_b = register_and_get_headers(client, email="bob@example.com", full_name="Bob")

    upload_res = client.post(
        "/api/v1/reports/upload",
        headers=headers_a,
        data={"output_language": "English"},
        files={"file": ("discharge.pdf", pdf_bytes, "application/pdf")},
    )
    assert upload_res.status_code == 201, upload_res.text
    report_data = upload_res.json()
    assert report_data["processing_status"] == "Completed"
    assert report_data["extraction_method"] == "pymupdf"
    care_plan_id = report_data["care_plan_id"]
    assert care_plan_id is not None

    # Status check
    status_res = client.get(f"/api/v1/reports/{report_data['id']}/status", headers=headers_a)
    assert status_res.status_code == 200
    assert status_res.json()["validation_status"] == VERIFIED_STATUS

    # Care plan retrieval + medication toggle
    plan_res = client.get(f"/api/v1/care-plans/{care_plan_id}", headers=headers_a)
    assert plan_res.status_code == 200
    plan_data = plan_res.json()
    assert plan_data["validation_status"] == VERIFIED_STATUS
    assert len(plan_data["medications"]) == 1
    assert plan_data["medications"][0]["verified_against_source"] is True
    med_id = plan_data["medications"][0]["id"]

    toggle_res = client.patch(
        f"/api/v1/medications/{med_id}",
        headers=headers_a,
        json={"taken_today": True},
    )
    assert toggle_res.status_code == 200
    assert toggle_res.json()["taken_today"] is True

    # User B cannot access User A's report, care plan, or medication
    assert client.get(f"/api/v1/reports/{report_data['id']}", headers=headers_b).status_code == 404
    assert client.get(f"/api/v1/care-plans/{care_plan_id}", headers=headers_b).status_code == 404
    assert client.get(f"/api/v1/medications/{med_id}", headers=headers_b).status_code == 404

    # Delete care plan
    assert client.delete(f"/api/v1/care-plans/{care_plan_id}", headers=headers_a).status_code == 200


def test_hindi_care_plan_and_ai_failure_handling(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    hindi_payload = {
        "patient_summary": "आपको हल्का बुखार था। दी गई दवाएं समय पर लें।",
        "diagnosis": ["वायरल बुखार"],
        "medications": [
            {
                "medicine_name": "Paracetamol",
                "dosage": "500mg",
                "frequency": "दिन में दो बार",
                "duration": "3 दिन",
                "administration_time": "सुबह और रात",
                "additional_instructions": "भोजन के बाद लें",
            }
        ],
        "care_instructions": ["पर्याप्त आराम करें और पानी पिएं।"],
        "warning_signs": ["तेज बुखार होने पर तुरंत डॉक्टर से मिलें।"],
        "follow_up": {"date": "15 Dec 2025", "instructions": "ओपीडी में दिखाएं।"},
        "unclear_information": [],
        "output_language": "Hindi",
    }

    class FakeHindiModels:
        def generate_content(self, **_kwargs):
            return SimpleNamespace(text=json.dumps(hindi_payload))

    class FakeHindiClient:
        def __init__(self, **_kwargs):
            self.models = FakeHindiModels()

    monkeypatch.setattr("app.services.ai_service.genai.Client", FakeHindiClient)
    headers = register_and_get_headers(client, email="hindi@example.com")
    pdf_bytes = _make_pdf_bytes(
        "Patient discharged in stable condition. Diagnosis: Viral Fever. "
        "Tab Paracetamol 500mg BD x 3 days after meals. Follow up 15 Dec 2025."
    )

    res = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        data={"output_language": "Hindi"},
        files={"file": ("hindi_report.pdf", pdf_bytes, "application/pdf")},
    )
    assert res.status_code == 201
    cp_id = res.json()["care_plan_id"]
    cp = client.get(f"/api/v1/care-plans/{cp_id}", headers=headers).json()
    assert cp["output_language"] == "Hindi"
    assert "आराम" in cp["care_instructions"][0]

    # Invalid JSON from Gemini marks report Failed cleanly without 500
    class BrokenModels:
        def generate_content(self, **_kwargs):
            return SimpleNamespace(text="{not valid json")

    class BrokenClient:
        def __init__(self, **_kwargs):
            self.models = BrokenModels()

    monkeypatch.setattr("app.services.ai_service.genai.Client", BrokenClient)
    failed = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("broken_ai.pdf", pdf_bytes, "application/pdf")},
    )
    assert failed.status_code == 201
    assert failed.json()["processing_status"] == "Failed"
    assert failed.json()["care_plan_id"] is None

    # Missing Gemini API key: independent extraction succeeds, AI care-plan generation returns HTTP 503
    monkeypatch.setenv("GEMINI_API_KEY", "")
    get_settings.cache_clear()

    extract_only = client.post(
        "/api/v1/reports/extract",
        headers=headers,
        files={"file": ("extract_only.pdf", pdf_bytes, "application/pdf")},
    )
    assert extract_only.status_code == 201
    assert extract_only.json()["processing_status"] == "Extracted"
    assert extract_only.json()["extraction_method"] == "pymupdf"
    assert "Paracetamol" in (extract_only.json()["extracted_text_preview"] or "")

    gen_missing_key = client.post(
        f"/api/v1/reports/{extract_only.json()['id']}/generate-care-plan",
        headers=headers,
    )
    assert gen_missing_key.status_code == 503
    assert (
        gen_missing_key.json()["detail"]
        == "AI service is not configured. Please configure GEMINI_API_KEY."
    )

    no_key = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("no_key.pdf", pdf_bytes, "application/pdf")},
    )
    assert no_key.status_code == 503
    assert (
        no_key.json()["detail"]
        == "AI service is not configured. Please configure GEMINI_API_KEY."
    )
    assert no_key.json()["code"] == "ai_not_configured"


def test_image_ocr_and_blank_image_rejection(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    if shutil.which("tesseract") is None:
        pytest.skip("Tesseract binary not installed in current test environment")

    headers = register_and_get_headers(client, email="ocr@example.com")

    # Blank image should fail gracefully
    blank = Image.new("RGB", (300, 120), color="white")
    blank_buf = io.BytesIO()
    blank.save(blank_buf, format="PNG")
    blank_res = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("blank.png", blank_buf.getvalue(), "image/png")},
    )
    assert blank_res.status_code == 201
    assert blank_res.json()["processing_status"] == "Failed"
    assert blank_res.json()["care_plan_id"] is None

    # Readable prescription PNG triggers OCR + Gemini + Validation
    sample_payload = {
        "patient_summary": "Continue prescribed tablet daily and return for review.",
        "diagnosis": ["Hypertension"],
        "medications": [
            {
                "medicine_name": "Amlodipine",
                "dosage": "5mg",
                "frequency": "Once daily",
                "duration": "30 days",
                "administration_time": "Morning",
                "additional_instructions": "",
            }
        ],
        "care_instructions": ["Monitor blood pressure weekly."],
        "warning_signs": ["Severe dizziness"],
        "follow_up": {"date": None, "instructions": "Schedule outpatient review."},
        "unclear_information": ["Follow-up date not specified in image."],
        "output_language": "English",
    }

    class FakeModels:
        def generate_content(self, **_kwargs):
            return SimpleNamespace(text=json.dumps(sample_payload))

    class FakeClient:
        def __init__(self, **_kwargs):
            self.models = FakeModels()

    monkeypatch.setattr("app.services.ai_service.genai.Client", FakeClient)

    png_bytes = _make_text_image_bytes(
        [
            "HOSPITAL DISCHARGE SUMMARY",
            "Diagnosis: Hypertension",
            "Rx: Tab Amlodipine 5mg once daily",
            "Warning: Severe dizziness",
        ]
    )
    ocr_res = client.post(
        "/api/v1/reports/upload",
        headers=headers,
        files={"file": ("rx.png", png_bytes, "image/png")},
    )
    assert ocr_res.status_code == 201
    assert ocr_res.json()["extraction_method"] == "ocr"
    assert ocr_res.json()["care_plan_id"] is not None


def test_deterministic_medical_validation_rules() -> None:
    source = (
        "Discharge Summary: Diagnosis Hypertension. "
        "Tab Amlodipine 5mg once daily morning for 30 days. "
        "Follow-up on 18 Dec 2025."
    )

    # 1. Exact match -> Verified Against Source
    good_plan = GeminiCarePlanPayload(
        patient_summary="Take Amlodipine 5mg daily.",
        diagnosis=["Hypertension"],
        medications=[
            GeminiMedicationSchema(
                medicine_name="Amlodipine",
                dosage="5mg",
                frequency="Once daily",
                duration="30 days",
                administration_time="Morning",
            )
        ],
        follow_up=GeminiFollowUpSchema(date="18 Dec 2025", instructions="OPD"),
        unclear_information=[],
    )
    ok_res = validate_care_plan_against_source(source, good_plan)
    assert ok_res.validation_status == VERIFIED_STATUS
    assert ok_res.medication_results[0].verified is True

    # 2. Altered dosage or hallucinated medicine -> Needs Review
    bad_plan = GeminiCarePlanPayload(
        patient_summary="Take Amlodipine 10mg and Aspirin 75mg.",
        diagnosis=["Hypertension"],
        medications=[
            GeminiMedicationSchema(
                medicine_name="Amlodipine",
                dosage="10mg",
                frequency="Once daily",
            ),
            GeminiMedicationSchema(
                medicine_name="Aspirin",
                dosage="75mg",
                frequency="Once daily",
            ),
        ],
        follow_up=GeminiFollowUpSchema(date="25 Dec 2025", instructions="OPD"),
    )
    flagged = validate_care_plan_against_source(source, bad_plan)
    assert flagged.validation_status == NEEDS_REVIEW_STATUS
    assert flagged.medication_results[0].verified is False
    assert flagged.medication_results[1].verified is False

    # 3. Very short/insufficient source -> Incomplete Source Information
    incomplete = validate_care_plan_against_source("Short text", good_plan)
    assert incomplete.validation_status == INCOMPLETE_STATUS


def test_duplicate_care_plan_uniqueness_constraint(test_db) -> None:
    with test_db() as db:
        from app.models.discharge_report import DischargeReport
        from app.models.user import User
        from sqlalchemy.exc import IntegrityError

        user = User(
            email="uniq@example.com",
            full_name="Unique Test",
            hashed_password="hash",
        )
        db.add(user)
        db.flush()

        report = DischargeReport(
            user_id=user.id,
            original_filename="r.pdf",
            stored_filename="r1.pdf",
            storage_path="/tmp/r1.pdf",
            mime_type="application/pdf",
            file_size_bytes=100,
            file_hash="abc",
        )
        db.add(report)
        db.flush()

        db.add(
            CarePlan(
                user_id=user.id,
                discharge_report_id=report.id,
                title="Plan 1",
                patient_summary="Summary 1",
            )
        )
        db.commit()

        db.add(
            CarePlan(
                user_id=user.id,
                discharge_report_id=report.id,
                title="Plan 2",
                patient_summary="Summary 2",
            )
        )
        with pytest.raises(IntegrityError):
            db.commit()
        db.rollback()
        plans = db.scalars(select(CarePlan).where(CarePlan.discharge_report_id == report.id)).all()
        assert len(plans) == 1
