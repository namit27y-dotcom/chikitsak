import hashlib
import io
import uuid
from pathlib import Path
from typing import Tuple

import pymupdf
from PIL import Image, UnidentifiedImageError
import pytesseract

from app.core.config import get_settings
from app.core.exceptions import AppError

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
}


def validate_and_read_upload(
    filename: str | None,
    content_type: str | None,
    raw_bytes: bytes,
) -> Tuple[str, str, str]:
    settings = get_settings()
    if not filename:
        raise AppError("Uploaded file must include a filename.", status_code=400, code="missing_filename")

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppError(
            "Unsupported file type. Allowed formats: PDF, JPG, JPEG, PNG.",
            status_code=400,
            code="unsupported_file_type",
        )

    if len(raw_bytes) == 0:
        raise AppError("Uploaded file is empty.", status_code=400, code="empty_file")

    if len(raw_bytes) > settings.max_upload_bytes:
        raise AppError(
            f"File exceeds the {settings.MAX_UPLOAD_SIZE_MB} MB upload limit.",
            status_code=413,
            code="file_too_large",
        )

    # Content-level magic byte & parser validation
    if ext == ".pdf":
        if not raw_bytes.lstrip().startswith(b"%PDF"):
            raise AppError(
                "Invalid PDF content. The uploaded file does not appear to be a valid PDF.",
                status_code=400,
                code="invalid_pdf_content",
            )
        detected_mime = "application/pdf"
    else:
        try:
            with Image.open(io.BytesIO(raw_bytes)) as img:
                img.verify()
                fmt = (img.format or "").upper()
                if fmt not in {"JPEG", "PNG"}:
                    raise AppError(
                        "Invalid image format. Only JPEG and PNG images are supported.",
                        status_code=400,
                        code="invalid_image_format",
                    )
                detected_mime = "image/jpeg" if fmt == "JPEG" else "image/png"
        except AppError:
            raise
        except (UnidentifiedImageError, Exception):
            raise AppError(
                "Corrupted or unreadable image file.",
                status_code=400,
                code="corrupted_image",
            )

    if content_type and content_type not in ALLOWED_MIME_TYPES and content_type != "application/octet-stream":
        # Magic bytes already passed, keep detected_mime authoritative
        pass

    file_hash = hashlib.sha256(raw_bytes).hexdigest()
    return ext, detected_mime, file_hash


def save_private_upload(raw_bytes: bytes, ext: str, user_id: int) -> Tuple[str, Path]:
    settings = get_settings()
    base_dir = settings.resolved_upload_dir.resolve()
    user_dir = (base_dir / f"user_{user_id}").resolve()
    if not user_dir.is_relative_to(base_dir):
        raise AppError("Invalid storage path.", status_code=400, code="invalid_storage_path")
    user_dir.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = (user_dir / stored_filename).resolve()
    if not target_path.is_relative_to(user_dir):
        raise AppError("Invalid target file path.", status_code=400, code="invalid_storage_path")

    target_path.write_bytes(raw_bytes)
    return stored_filename, target_path


def _run_ocr_on_pil_image(image: Image.Image) -> str:
    settings = get_settings()
    if settings.TESSERACT_CMD:
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")
    try:
        return pytesseract.image_to_string(image, lang="eng") or ""
    except pytesseract.TesseractNotFoundError:
        raise AppError(
            "Tesseract OCR binary is not installed or configured on the server.",
            status_code=503,
            code="ocr_unavailable",
        )
    except Exception as exc:
        raise AppError(
            f"OCR processing failed: {type(exc).__name__}",
            status_code=422,
            code="ocr_failed",
        )


def extract_text_from_document(file_path: Path, mime_type: str) -> Tuple[str, str]:
    """
    Extracts text from PDF (PyMuPDF + Tesseract OCR fallback for scanned pages)
    or images (Pillow + Tesseract OCR).
    Returns (extracted_text, extraction_method).
    """
    if mime_type == "application/pdf":
        text_chunks: list[str] = []
        used_ocr = False
        used_text = False

        try:
            doc = pymupdf.open(str(file_path))
        except Exception:
            raise AppError(
                "Unable to open PDF document. It may be corrupted or password-protected.",
                status_code=422,
                code="unreadable_pdf",
            )

        with doc:
            if doc.is_encrypted:
                raise AppError(
                    "Password-protected PDFs are not supported. Please upload an unlocked PDF.",
                    status_code=422,
                    code="encrypted_pdf",
                )
            for page in doc:
                page_text = (page.get_text("text") or "").strip()
                if len(page_text) >= 40:
                    text_chunks.append(page_text)
                    used_text = True
                else:
                    # Scanned page or sparse text -> render at 200 DPI and run OCR
                    pix = page.get_pixmap(dpi=200)
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    ocr_text = _run_ocr_on_pil_image(img).strip()
                    if ocr_text:
                        text_chunks.append(ocr_text)
                        used_ocr = True

        combined = "\n\n".join(text_chunks).strip()
        if len(combined) < 25:
            raise AppError(
                "Document appears unreadable or contains insufficient medical text to process.",
                status_code=422,
                code="unreadable_document",
            )

        if used_text and used_ocr:
            method = "pymupdf+ocr"
        elif used_ocr:
            method = "ocr"
        else:
            method = "pymupdf"
        return combined, method

    # Image (JPEG / PNG)
    try:
        with Image.open(file_path) as img:
            ocr_text = _run_ocr_on_pil_image(img).strip()
    except AppError:
        raise
    except Exception:
        raise AppError(
            "Unable to open image for OCR processing.",
            status_code=422,
            code="unreadable_image",
        )

    if len(ocr_text) < 25:
        raise AppError(
            "Image appears blurry or contains insufficient readable medical text.",
            status_code=422,
            code="unreadable_document",
        )
    return ocr_text, "ocr"
