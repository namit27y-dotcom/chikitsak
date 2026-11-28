import {
  AppointmentItem,
  CarePlan,
  DosePeriod,
  LanguageMode,
  MedicineInstruction,
  ReminderItem,
  UploadedReportFile,
  ValidationStatus,
} from '../../types/chikitsak';
import {
  ApiError,
  apiRequest,
  getApiBaseUrl,
  getAuthToken,
  isBackendConfigured,
  setAuthToken,
} from './apiClient';

export interface BackendPatientProfile {
  id: number;
  full_name: string;
  age: number | null;
  blood_group: string | null;
  phone: string | null;
  emergency_contact: string | null;
  preferred_language: string;
}

export interface BackendUser {
  id: number;
  email: string;
  full_name: string;
  preferred_language: string;
  is_active: boolean;
  created_at: string;
  patient: BackendPatientProfile | null;
}

export interface BackendTokenResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

export interface BackendMedication {
  id: number;
  care_plan_id: number;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  administration_time: string;
  additional_instructions: string | null;
  verified_against_source: boolean;
  validation_note: string | null;
  taken_today: boolean;
  created_at: string;
}

export interface BackendCarePlan {
  id: number;
  discharge_report_id: number | null;
  title: string;
  output_language: string;
  patient_summary: string;
  original_excerpt: string | null;
  diagnosis: string[];
  care_instructions: string[];
  warning_signs: string[];
  follow_up: {
    date: string | null;
    instructions: string;
  };
  unclear_information: string[];
  validation_status: ValidationStatus;
  validation_notes: string[];
  medications: BackendMedication[];
  created_at: string;
  updated_at: string;
}

export interface BackendReminder {
  id: number;
  care_plan_id: number | null;
  title: string;
  reminder_time: string;
  frequency: 'Daily' | 'Once' | 'Weekly';
  category: 'Medicine' | 'Appointment' | 'Checkup';
  notes: string | null;
  is_active: boolean;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendAppointment {
  id: number;
  care_plan_id: number | null;
  doctor_name: string;
  hospital_name: string;
  appointment_date: string;
  appointment_notes: string | null;
  status: 'Upcoming' | 'Kept' | 'Rescheduled' | 'Cancelled';
  created_at: string;
  updated_at: string;
}

export interface BackendDashboardOverview {
  stats: {
    total_care_plans: number;
    total_medications: number;
    taken_medications_today: number;
    adherence_percent: number;
    active_reminders_count: number;
    appointments_kept_count: number;
    total_appointments_count: number;
    next_follow_up: string | null;
  };
  recent_care_plan: BackendCarePlan | null;
  care_plans: BackendCarePlan[];
  medications: BackendMedication[];
  reminders: BackendReminder[];
  appointments: BackendAppointment[];
}

export interface BackendDischargeReport {
  id: number;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  output_language: string;
  processing_status: string;
  extraction_method: string | null;
  error_message: string | null;
  care_plan_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendReportStatus {
  report_id: number;
  processing_status: string;
  extraction_method: string | null;
  error_message: string | null;
  care_plan_id: number | null;
  validation_status: string | null;
  updated_at: string;
}

export interface BackendAnalysisResponse {
  backendConnected: boolean;
  status:
    | 'analyzed'
    | 'auth_required'
    | 'backend_unavailable'
    | 'ai_not_configured'
    | 'error';
  message: string;
  carePlan?: CarePlan;
  endpointUrl: string;
}

function inferPeriod(adminTime: string, frequency: string): { period: DosePeriod; time: string } {
  const combined = `${adminTime} ${frequency}`.toLowerCase();
  if (combined.includes('night') || combined.includes('bed') || combined.includes('pm') || combined.includes('रात')) {
    if (!combined.includes('morning') && !combined.includes('सुबह')) {
      return { period: 'Night', time: adminTime || '9:00 PM' };
    }
  }
  if (combined.includes('afternoon') || combined.includes('lunch') || combined.includes('दोपहर')) {
    return { period: 'Afternoon', time: adminTime || '2:00 PM' };
  }
  return { period: 'Morning', time: adminTime || '8:00 AM' };
}

function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapBackendMedication(m: BackendMedication, index = 0): MedicineInstruction {
  const { period, time } = inferPeriod(m.administration_time, m.frequency);
  const timingParts = [m.frequency, m.duration, m.additional_instructions]
    .map((p) => (p || '').trim())
    .filter(Boolean);
  const timingNote = timingParts.join(' • ') || 'As prescribed';

  return {
    id: `med-${m.id}`,
    backendId: m.id,
    name: m.medicine_name,
    dosage: m.dosage || 'As prescribed',
    period,
    time,
    timingNote,
    timingNoteHindi: timingNote,
    purpose: m.validation_note || 'Extracted from your discharge summary',
    purposeHindi: m.validation_note || 'डिस्चार्ज रिपोर्ट से प्राप्त निर्देश',
    takenToday: m.taken_today,
    showOnDashboard: index < 3,
    verifiedAgainstSource: m.verified_against_source,
    validationNote: m.validation_note,
  };
}

export function mapBackendCarePlan(bp: BackendCarePlan): CarePlan {
  const diagnosisText =
    bp.diagnosis.length > 0 ? bp.diagnosis.join(', ') : 'Refer to discharge summary';
  const isHindi = bp.output_language.toLowerCase() === 'hindi';

  return {
    id: `cp-${bp.id}`,
    backendId: bp.id,
    isDemo: false,
    title: bp.title,
    titleHindi: bp.title,
    createdAt: formatIsoDate(bp.created_at),
    status:
      bp.validation_status === 'Verified Against Source' ? 'Ready' : 'Pending Review',
    outputLanguage: bp.output_language,
    validationStatus: bp.validation_status,
    validationNotes: bp.validation_notes,
    unclearInformation: bp.unclear_information,
    hospitalName: 'Verified Discharge Record',
    doctorName: 'Attending Physician',
    doctorSpecialty: 'Hospital Discharge Team',
    followUpDate: bp.follow_up?.date || 'Not specified in summary',
    diagnosisClinical: diagnosisText,
    diagnosisSimple: diagnosisText,
    diagnosisSimpleHindi: diagnosisText,
    originalDischargeNote:
      bp.original_excerpt || 'Extracted discharge text stored on backend.',
    simplifiedSummary: bp.patient_summary,
    simplifiedSummaryHindi: isHindi ? bp.patient_summary : bp.patient_summary,
    simpleInstructions:
      bp.care_instructions.length > 0
        ? bp.care_instructions
        : ['Follow prescribed medicines and contact your doctor if symptoms worsen.'],
    simpleInstructionsHindi: bp.care_instructions,
    dietAndLifestyle:
      bp.follow_up?.instructions
        ? [bp.follow_up.instructions]
        : ['Follow the hospital diet and rest instructions listed in your care plan.'],
    dietAndLifestyleHindi: bp.follow_up?.instructions ? [bp.follow_up.instructions] : [],
    medicines: bp.medications.map((m, idx) => mapBackendMedication(m, idx)),
    warningSigns: bp.warning_signs.map((w, idx) => ({
      id: `ws-${bp.id}-${idx}`,
      title: w,
      titleHindi: w,
      description: w,
      descriptionHindi: w,
      severity: idx === 0 ? 'urgent' : 'monitor',
      action: 'Seek prompt medical attention or call your doctor/108 if this occurs.',
      actionHindi: 'यह लक्षण दिखने पर तुरंत डॉक्टर से संपर्क करें या 108 पर कॉल करें।',
    })),
    sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
      dayLabel: `Day ${i + 1}`,
      focus:
        bp.care_instructions[i % Math.max(bp.care_instructions.length, 1)] ||
        'Take medicines on schedule',
      eveningNote: bp.follow_up?.date
        ? `Follow-up: ${bp.follow_up.date}`
        : 'Monitor symptoms',
    })),
  };
}

export function mapBackendReminder(br: BackendReminder): ReminderItem {
  return {
    id: `rem-${br.id}`,
    backendId: br.id,
    title: br.title,
    time: br.reminder_time,
    frequency: br.frequency,
    category: br.category,
    notes: br.notes,
    active: br.is_active,
    completed: br.is_completed,
  };
}

export function mapBackendAppointment(ba: BackendAppointment): AppointmentItem {
  return {
    id: `apt-${ba.id}`,
    backendId: ba.id,
    doctor: ba.doctor_name,
    specialty: 'Follow-up Consultation',
    hospital: ba.hospital_name,
    date: ba.appointment_date,
    time: 'Scheduled Visit',
    purpose: ba.appointment_notes || 'Post-discharge follow-up',
    status: ba.status,
    notes: ba.appointment_notes || '',
  };
}

export function mapLanguageToBackend(lang: LanguageMode): 'English' | 'Hindi' {
  return lang === 'hi' ? 'Hindi' : 'English';
}

export const authApi = {
  async register(payload: {
    email: string;
    password: string;
    full_name: string;
    preferred_language?: string;
    age?: number;
    blood_group?: string;
    phone?: string;
    emergency_contact?: string;
  }): Promise<BackendTokenResponse> {
    const res = await apiRequest<BackendTokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async login(payload: { email: string; password: string }): Promise<BackendTokenResponse> {
    const res = await apiRequest<BackendTokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async me(): Promise<BackendUser> {
    return apiRequest<BackendUser>('/auth/me');
  },

  async updateProfile(payload: {
    full_name?: string;
    preferred_language?: string;
    age?: number;
    blood_group?: string;
    phone?: string;
    emergency_contact?: string;
  }): Promise<BackendUser> {
    return apiRequest<BackendUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  logout(): void {
    setAuthToken(null);
  },
};

export const dashboardApi = {
  async getOverview(): Promise<BackendDashboardOverview> {
    return apiRequest<BackendDashboardOverview>('/dashboard/overview');
  },
};

export const carePlansApi = {
  async list(): Promise<BackendCarePlan[]> {
    return apiRequest<BackendCarePlan[]>('/care-plans');
  },
  async get(id: number): Promise<BackendCarePlan> {
    return apiRequest<BackendCarePlan>(`/care-plans/${id}`);
  },
  async remove(id: number): Promise<void> {
    await apiRequest(`/care-plans/${id}`, { method: 'DELETE' });
  },
};

export const medicationsApi = {
  async list(): Promise<BackendMedication[]> {
    return apiRequest<BackendMedication[]>('/medications');
  },
  async create(payload: {
    care_plan_id: number;
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    administration_time?: string;
    additional_instructions?: string;
  }): Promise<BackendMedication> {
    return apiRequest<BackendMedication>('/medications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async toggleTaken(id: number, takenToday: boolean): Promise<BackendMedication> {
    return apiRequest<BackendMedication>(`/medications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ taken_today: takenToday }),
    });
  },
};

export const remindersApi = {
  async create(payload: {
    title: string;
    reminder_time: string;
    frequency: 'Daily' | 'Once' | 'Weekly';
    category: 'Medicine' | 'Appointment' | 'Checkup';
    notes?: string;
    care_plan_id?: number;
  }): Promise<BackendReminder> {
    return apiRequest<BackendReminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async update(
    id: number,
    payload: { is_active?: boolean; is_completed?: boolean; title?: string }
  ): Promise<BackendReminder> {
    return apiRequest<BackendReminder>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async remove(id: number): Promise<void> {
    await apiRequest(`/reminders/${id}`, { method: 'DELETE' });
  },
};

export const appointmentsApi = {
  async create(payload: {
    doctor_name: string;
    hospital_name: string;
    appointment_date: string;
    appointment_notes?: string;
    status?: 'Upcoming' | 'Kept' | 'Rescheduled' | 'Cancelled';
    care_plan_id?: number;
  }): Promise<BackendAppointment> {
    return apiRequest<BackendAppointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async update(
    id: number,
    payload: {
      appointment_date?: string;
      appointment_notes?: string;
      status?: 'Upcoming' | 'Kept' | 'Rescheduled' | 'Cancelled';
    }
  ): Promise<BackendAppointment> {
    return apiRequest<BackendAppointment>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
  async remove(id: number): Promise<void> {
    await apiRequest(`/appointments/${id}`, { method: 'DELETE' });
  },
};

export const carePlanService = {
  getConfiguredApiUrl(): string {
    return getApiBaseUrl();
  },

  isConfigured(): boolean {
    return isBackendConfigured();
  },

  async submitReportForAnalysis(
    file: File,
    meta: UploadedReportFile
  ): Promise<BackendAnalysisResponse> {
    if (!isBackendConfigured()) {
      return {
        backendConnected: false,
        status: 'backend_unavailable',
        endpointUrl: 'Not configured (VITE_API_BASE_URL)',
        message:
          'Backend API URL is not configured for this environment (VITE_API_BASE_URL is not set). Configure VITE_API_BASE_URL with your FastAPI /api/v1 endpoint to upload and analyze discharge summaries.',
      };
    }

    const endpointUrl = `${getApiBaseUrl()}/reports/upload`;

    if (!getAuthToken()) {
      return {
        backendConnected: true,
        status: 'auth_required',
        endpointUrl,
        message:
          'Please sign in or create an account to upload and analyze your discharge summary securely.',
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('output_language', mapLanguageToBackend(meta.selectedLanguage));

      const report = await apiRequest<BackendDischargeReport>('/reports/upload', {
        method: 'POST',
        body: formData,
      });

      if (report.processing_status === 'Failed') {
        return {
          backendConnected: true,
          status: 'error',
          endpointUrl,
          message:
            report.error_message ||
            'Document processing failed. Please upload a clearer PDF or image.',
        };
      }

      let carePlanId = report.care_plan_id;
      if (!carePlanId) {
        const statusRes = await apiRequest<BackendReportStatus>(
          `/reports/${report.id}/status`
        );
        if (statusRes.processing_status === 'Failed') {
          return {
            backendConnected: true,
            status: 'error',
            endpointUrl,
            message:
              statusRes.error_message ||
              'Unable to process discharge report into a care plan.',
          };
        }
        carePlanId = statusRes.care_plan_id;
      }

      if (!carePlanId) {
        return {
          backendConnected: true,
          status: 'error',
          endpointUrl,
          message: 'Report was stored, but no care plan was generated yet.',
        };
      }

      const backendPlan = await carePlansApi.get(carePlanId);
      return {
        backendConnected: true,
        status: 'analyzed',
        endpointUrl,
        message: 'Report analyzed and validated successfully.',
        carePlan: mapBackendCarePlan(backendPlan),
      };
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError || err.code === 'backend_not_configured') {
          return {
            backendConnected: false,
            status: 'backend_unavailable',
            endpointUrl,
            message:
              err.code === 'backend_not_configured'
                ? err.message
                : 'Unable to reach the configured FastAPI backend server. Verify the backend is running and VITE_API_BASE_URL is reachable.',
          };
        }
        if (err.status === 401) {
          return {
            backendConnected: true,
            status: 'auth_required',
            endpointUrl,
            message: 'Your session expired. Please sign in again to process reports.',
          };
        }
        if (err.status === 503 || err.code === 'ai_not_configured') {
          return {
            backendConnected: true,
            status: 'ai_not_configured',
            endpointUrl,
            message:
              err.message ||
              'AI service is not configured. Please configure GEMINI_API_KEY on the backend server.',
          };
        }
        return {
          backendConnected: true,
          status: 'error',
          endpointUrl,
          message: err.message,
        };
      }
      return {
        backendConnected: false,
        status: 'backend_unavailable',
        endpointUrl,
        message: 'Unexpected error while submitting report.',
      };
    }
  },
};
