# CHIKITSAK API Documentation

Base URL (Local): `http://localhost:8000`  
API Prefix: `/api/v1`  
Interactive Swagger Docs: `GET /docs` • ReDoc: `GET /redoc`

All `/api/v1` endpoints except `/auth/register` and `/auth/login` require:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

## Endpoints

### Health
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Returns API & database connectivity status without exposing secrets | Public |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register user + primary patient profile, returns JWT | Public |
| `POST` | `/api/v1/auth/login` | Authenticate user via email & password, returns JWT | Public |
| `GET` | `/api/v1/auth/me` | Get authenticated user and patient profile | Bearer JWT |
| `PATCH` | `/api/v1/auth/me` | Update user and patient profile preferences | Bearer JWT |

### Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/overview` | Aggregated adherence stats, recent care plan, medications, reminders & appointments | Bearer JWT |

### Discharge Reports (`/api/v1/reports`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reports/upload` | Multipart upload (`file`, `output_language`) -> extract -> Gemini AI -> validate -> persist | Bearer JWT |
| `GET` | `/api/v1/reports` | List uploaded discharge reports for current user | Bearer JWT |
| `GET` | `/api/v1/reports/{report_id}` | Get metadata for a specific report | Bearer JWT |
| `GET` | `/api/v1/reports/{report_id}/status` | Check processing & validation status (`care_plan_id`, `extraction_method`, `validation_status`) | Bearer JWT |

### Care Plans (`/api/v1/care-plans`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/care-plans` | List all care plans owned by current user | Bearer JWT |
| `GET` | `/api/v1/care-plans/{care_plan_id}` | Fetch structured care plan, validation notes, and medications | Bearer JWT |
| `DELETE` | `/api/v1/care-plans/{care_plan_id}` | Delete a user-owned care plan | Bearer JWT |

### Medications (`/api/v1/medications`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/medications` | List medications (optional `?care_plan_id=` filter) | Bearer JWT |
| `POST` | `/api/v1/medications` | Add a manual medication dose to an existing care plan | Bearer JWT |
| `GET` | `/api/v1/medications/{medication_id}` | Get single medication record | Bearer JWT |
| `PATCH` | `/api/v1/medications/{medication_id}` | Toggle `taken_today` dose completion | Bearer JWT |

### Reminders (`/api/v1/reminders`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reminders` | List reminders for current user | Bearer JWT |
| `POST` | `/api/v1/reminders` | Create a new reminder | Bearer JWT |
| `PATCH` | `/api/v1/reminders/{reminder_id}` | Toggle active/completed state or edit fields | Bearer JWT |
| `DELETE` | `/api/v1/reminders/{reminder_id}` | Delete a reminder | Bearer JWT |

### Appointments (`/api/v1/appointments`)
| Method | Endpoint | Purpose | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/appointments` | List follow-up appointments for current user | Bearer JWT |
| `POST` | `/api/v1/appointments` | Create a follow-up appointment | Bearer JWT |
| `PATCH` | `/api/v1/appointments/{appointment_id}` | Update status (`Upcoming`/`Kept`/`Rescheduled`/`Cancelled`) or date | Bearer JWT |
| `DELETE` | `/api/v1/appointments/{appointment_id}` | Delete an appointment | Bearer JWT |
