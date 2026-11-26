# Hindi Translation & Simplification Prompt Specification

## Objective
Generate patient-friendly discharge care plans in simple everyday Hindi using Devanagari script while preserving exact medical accuracy.

## Rules
1. Write `patient_summary`, `diagnosis`, `care_instructions`, `warning_signs`, `follow_up.instructions`, and `unclear_information` in clear, respectful Hindi at an approximate Class 8 reading level.
2. Preserve exact medicine names (or standard Latin/English drug names alongside Hindi phrasing) and exact numeric dosages (e.g., `500mg`, `40mg`) so patients and pharmacists can verify against medicine strips.
3. Translate timing and meal instructions accurately (e.g., `सुबह भोजन के बाद`, `रात को सोने से पहले`).
4. Do not add cultural remedies, unprescribed supplements, or advice not found in the source document.
