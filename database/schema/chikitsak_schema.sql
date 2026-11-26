-- CHIKITSAK Reference MySQL 8 Schema
-- Note: Application tables are created and versioned via Alembic (backend/alembic/versions/0001_initial_schema.py).
-- Use this file as a human-readable schema reference and initial database creation script.

CREATE DATABASE IF NOT EXISTS chikitsak
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chikitsak;

-- Tables managed by Alembic:
-- 1. users (id, email UNIQUE, full_name, hashed_password, preferred_language, is_active, created_at, updated_at)
-- 2. patients (id, user_id FK->users.id, full_name, age, blood_group, phone, emergency_contact, preferred_language, created_at, updated_at)
-- 3. discharge_reports (id, user_id FK->users.id, patient_id FK->patients.id, original_filename, stored_filename UNIQUE, storage_path, mime_type, file_size_bytes, file_hash, output_language, processing_status, extraction_method, extracted_text, error_message, created_at, updated_at)
-- 4. care_plans (id, user_id FK->users.id, patient_id FK->patients.id, discharge_report_id UNIQUE FK->discharge_reports.id, title, output_language, patient_summary, original_excerpt, diagnosis_json, care_instructions_json, warning_signs_json, follow_up_json, unclear_information_json, validation_status, validation_notes_json, created_at, updated_at)
-- 5. medications (id, user_id FK->users.id, care_plan_id FK->care_plans.id, medicine_name, dosage, frequency, duration, administration_time, additional_instructions, verified_against_source, validation_note, taken_today, created_at, updated_at)
-- 6. reminders (id, user_id FK->users.id, care_plan_id FK->care_plans.id, title, reminder_time, frequency, category, notes, is_active, is_completed, created_at, updated_at)
-- 7. appointments (id, user_id FK->users.id, care_plan_id FK->care_plans.id, doctor_name, hospital_name, appointment_date, appointment_notes, status, created_at, updated_at)
