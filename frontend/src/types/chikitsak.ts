export type ScreenId =
  | 'dashboard'
  | 'upload'
  | 'processing'
  | 'care-plans'
  | 'care-plan'
  | 'medicines'
  | 'warnings'
  | 'appointments'
  | 'reminders'
  | 'voice'
  | 'settings'
  | 'about'
  | 'print';

export type LanguageMode = 'en' | 'hi' | 'bilingual';

export type DosePeriod = 'Morning' | 'Afternoon' | 'Night';

export type ValidationStatus =
  | 'Verified Against Source'
  | 'Needs Review'
  | 'Incomplete Source Information';

export interface MedicineInstruction {
  id: string;
  backendId?: number;
  name: string;
  dosage: string;
  period: DosePeriod;
  time: string;
  timingNote: string;
  timingNoteHindi: string;
  purpose: string;
  purposeHindi: string;
  takenToday: boolean;
  showOnDashboard?: boolean;
  verifiedAgainstSource?: boolean;
  validationNote?: string | null;
}

export interface WarningSign {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi: string;
  severity: 'urgent' | 'monitor';
  action: string;
  actionHindi: string;
}

export interface AppointmentItem {
  id: string;
  backendId?: number;
  doctor: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  purpose: string;
  status: 'Upcoming' | 'Kept' | 'Rescheduled' | 'Cancelled';
  notes: string;
}

export interface CarePlan {
  id: string;
  backendId?: number;
  isDemo?: boolean;
  title: string;
  titleHindi: string;
  createdAt: string;
  status: 'Ready' | 'Pending Review';
  outputLanguage?: string;
  validationStatus?: ValidationStatus;
  validationNotes?: string[];
  unclearInformation?: string[];
  hospitalName: string;
  doctorName: string;
  doctorSpecialty: string;
  followUpDate: string;
  diagnosisClinical: string;
  diagnosisSimple: string;
  diagnosisSimpleHindi: string;
  originalDischargeNote: string;
  simplifiedSummary: string;
  simplifiedSummaryHindi: string;
  simpleInstructions: string[];
  simpleInstructionsHindi: string[];
  dietAndLifestyle: string[];
  dietAndLifestyleHindi: string[];
  medicines: MedicineInstruction[];
  warningSigns: WarningSign[];
  sevenDayPlan: {
    dayLabel: string;
    focus: string;
    eveningNote: string;
  }[];
}

export interface ReminderItem {
  id: string;
  backendId?: number;
  title: string;
  time: string;
  frequency: 'Daily' | 'Once' | 'Weekly';
  category: 'Medicine' | 'Appointment' | 'Checkup';
  notes?: string | null;
  active: boolean;
  completed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  unread: boolean;
  targetScreen: ScreenId;
}

export interface UploadedReportFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  previewUrl: string | null;
  uploadedAt: string;
  selectedLanguage: LanguageMode;
}

export interface PatientProfile {
  name: string;
  age: number;
  bloodGroup: string;
  phone: string;
  emergencyContact: string;
  preferredLanguage: LanguageMode;
  voiceRate: number;
  smsReminders: boolean;
}
