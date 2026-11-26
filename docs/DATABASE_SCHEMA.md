# CHIKITSAK Database Schema (MySQL 8)

Database Name: `chikitsak`  
ORM & Migrations: SQLAlchemy 2.x + Alembic (`backend/alembic/versions/0001_initial_schema.py`)

## Tables & Relationships

### 1. `users`
- **Primary Key**: `id` (Integer, auto-increment)
- **Columns**: `email` (Unique, Indexed), `full_name`, `hashed_password`, `preferred_language`, `is_active`, `created_at`, `updated_at`
- **Relationships**: One-to-many with `patients`, `discharge_reports`, `care_plans`, `reminders`, `appointments`.

### 2. `patients`
- **Primary Key**: `id`
- **Foreign Keys**: `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
- **Columns**: `full_name`, `age`, `blood_group`, `phone`, `emergency_contact`, `preferred_language`, timestamps.

### 3. `discharge_reports`
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
  - `patient_id -> patients.id` (`ON DELETE SET NULL`, indexed)
- **Columns**: `original_filename`, `stored_filename` (Unique), `storage_path`, `mime_type`, `file_size_bytes`, `file_hash` (Indexed), `output_language`, `processing_status` (Indexed), `extraction_method`, `extracted_text`, `error_message`, timestamps.

### 4. `care_plans`
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
  - `patient_id -> patients.id` (`ON DELETE SET NULL`, indexed)
  - `discharge_report_id -> discharge_reports.id` (`ON DELETE CASCADE`, **UNIQUE** `uq_care_plans_discharge_report_id` to prevent duplicate care plans on re-processing)
- **Columns**: `title`, `output_language`, `patient_summary`, `original_excerpt`, `diagnosis_json`, `care_instructions_json`, `warning_signs_json`, `follow_up_json`, `unclear_information_json`, `validation_status` (Indexed), `validation_notes_json`, timestamps.

### 5. `medications`
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
  - `care_plan_id -> care_plans.id` (`ON DELETE CASCADE`, indexed)
- **Columns**: `medicine_name`, `dosage`, `frequency`, `duration`, `administration_time`, `additional_instructions`, `verified_against_source`, `validation_note`, `taken_today`, timestamps.

### 6. `reminders`
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
  - `care_plan_id -> care_plans.id` (`ON DELETE SET NULL`, indexed)
- **Columns**: `title`, `reminder_time`, `frequency`, `category`, `notes`, `is_active`, `is_completed`, timestamps.

### 7. `appointments`
- **Primary Key**: `id`
- **Foreign Keys**:
  - `user_id -> users.id` (`ON DELETE CASCADE`, indexed)
  - `care_plan_id -> care_plans.id` (`ON DELETE SET NULL`, indexed)
- **Columns**: `doctor_name`, `hospital_name`, `appointment_date`, `appointment_notes`, `status` (Indexed), timestamps.
