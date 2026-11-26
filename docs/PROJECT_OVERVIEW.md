# CHIKITSAK (चिकित्सक) — Project Overview

**Tagline:** *Understand. Follow. Recover.*

## Purpose
Hospital discharge summaries are written primarily for clinicians, packed with Latin abbreviations (`OD`, `BD`, `HS`), dense diagnostic phrasing, and rapid follow-up checklists. Patients and elderly caregivers returning home often struggle to understand what medicines to take, when to take them, which diet to follow, and which warning symptoms demand immediate medical care.

**CHIKITSAK** bridges this gap by converting uploaded discharge summaries (PDFs and photographed/scanned prescriptions) into clear, structured, multilingual care plans in **English** and **Hindi**, paired with deterministic source validation, medicine schedules, reminders, follow-up tracking, printable family sheets, and browser-based voice narration.

## Core Capabilities
- **Discharge Summary Simplification**: Converts clinical notes into plain-language patient instructions (~Class 8 reading level) via Google Gemini on the FastAPI backend.
- **Original vs. Simplified Separation**: Displays the verbatim hospital excerpt alongside the AI-simplified explanation so families and doctors can verify every instruction.
- **Deterministic Safety Verification**: Validates medication names, numeric dosages, and follow-up dates against the extracted source text (`Verified Against Source`, `Needs Review`, or `Incomplete Source Information`).
- **Multilingual English + Hindi Support**: Supports English, Hindi (`Devanagari`), and Bilingual (`EN + HI`) views plus Web Speech API audio narration (`en-IN` and `hi-IN`).
- **Daily Care Management**: Track today's medicine doses, set recurring medicine/checkup reminders, manage follow-up doctor appointments, and print/download fridge-ready PDF care sheets.

## Medical Disclaimer
CHIKITSAK is a healthcare communication and care-organization tool. It does not replace a licensed physician, clinical judgment, or emergency medical services.
