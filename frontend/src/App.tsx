import { useMemo, useState } from 'react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_CARE_PLANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENT_PROFILE,
  INITIAL_REMINDERS,
} from './data/mockCareData';
import {
  AppointmentItem,
  CarePlan,
  LanguageMode,
  MedicineInstruction,
  NotificationItem,
  PatientProfile,
  ReminderItem,
  ScreenId,
  UploadedReportFile,
} from './types/chikitsak';
import {
  appointmentsApi,
  authApi,
  BackendUser,
  carePlansApi,
  dashboardApi,
  mapBackendAppointment,
  mapBackendCarePlan,
  mapBackendMedication,
  mapBackendReminder,
  medicationsApi,
  remindersApi,
} from './services/api/carePlanService';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MobileBottomNav, MobileHeader } from './components/MobileShell';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { UploadScreen } from './components/screens/UploadScreen';
import { ProcessingScreen } from './components/screens/ProcessingScreen';
import { CarePlanScreen } from './components/screens/CarePlanScreen';
import { MedicineScheduleScreen } from './components/screens/MedicineScheduleScreen';
import { WarningSignsScreen } from './components/screens/WarningSignsScreen';
import { AppointmentsScreen } from './components/screens/AppointmentsScreen';
import { RemindersScreen } from './components/screens/RemindersScreen';
import { VoiceAssistantScreen } from './components/screens/VoiceAssistantScreen';
import {
  AboutScreen,
  SettingsScreen,
} from './components/screens/SettingsAboutScreen';
import { PrintableCarePlanScreen } from './components/screens/PrintableCarePlanScreen';

function toLanguageMode(val?: string): LanguageMode {
  if (val === 'en' || val === 'hi' || val === 'bilingual') return val;
  if (val?.toLowerCase() === 'hindi') return 'hi';
  if (val?.toLowerCase() === 'english') return 'en';
  return 'bilingual';
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [carePlans, setCarePlans] = useState<CarePlan[]>(INITIAL_CARE_PLANS);
  const [activePlanId, setActivePlanId] = useState<string | null>(
    INITIAL_CARE_PLANS[0]?.id ?? null
  );
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const [appointments, setAppointments] =
    useState<AppointmentItem[]>(INITIAL_APPOINTMENTS);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [profile, setProfile] = useState<PatientProfile>(INITIAL_PATIENT_PROFILE);
  const [searchQuery, setSearchQuery] = useState('');

  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedMeta, setStagedMeta] = useState<UploadedReportFile | null>(null);

  const [authenticatedUser, setAuthenticatedUser] = useState<BackendUser | null>(
    null
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(
    undefined
  );

  const activePlan = useMemo(
    () =>
      carePlans.find((p) => p.id === activePlanId) ?? carePlans[0] ?? null,
    [carePlans, activePlanId]
  );

  const unreadRemindersCount = useMemo(
    () => reminders.filter((r) => r.active && !r.completed).length,
    [reminders]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const takenDosesCount = useMemo(
    () =>
      activePlan
        ? activePlan.medicines.filter((m) => m.takenToday).length
        : 0,
    [activePlan]
  );

  const totalDosesCount = useMemo(
    () => (activePlan ? activePlan.medicines.length : 0),
    [activePlan]
  );

  const completionPercent = useMemo(() => {
    if (!activePlan || activePlan.medicines.length === 0) return 0;
    return Math.round((takenDosesCount / activePlan.medicines.length) * 100);
  }, [activePlan, takenDosesCount]);

  const appointmentsKeptCount = useMemo(
    () => appointments.filter((a) => a.status === 'Kept').length,
    [appointments]
  );

  const refreshBackendOverview = async (preferredPlanId?: string) => {
    try {
      const overview = await dashboardApi.getOverview();
      const mappedPlans = overview.care_plans.map(mapBackendCarePlan);
      setCarePlans(mappedPlans);
      setActivePlanId((prev) => {
        if (preferredPlanId && mappedPlans.some((p) => p.id === preferredPlanId)) {
          return preferredPlanId;
        }
        if (prev && mappedPlans.some((p) => p.id === prev)) {
          return prev;
        }
        return mappedPlans[0]?.id ?? null;
      });
      setReminders(overview.reminders.map(mapBackendReminder));
      setAppointments(overview.appointments.map(mapBackendAppointment));
      setNotifications([]);
    } catch {
      // Keep current state if transient overview refresh fails
    }
  };

  const handleOpenAuth = (
    mode: 'login' | 'register' = 'login',
    message?: string
  ) => {
    setAuthModalMode(mode);
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = async (user: BackendUser) => {
    setAuthenticatedUser(user);
    setProfile((prev) => ({
      ...prev,
      name: user.full_name,
      age: user.patient?.age ?? prev.age,
      bloodGroup: user.patient?.blood_group ?? prev.bloodGroup,
      phone: user.patient?.phone ?? prev.phone,
      emergencyContact: user.patient?.emergency_contact ?? prev.emergencyContact,
      preferredLanguage: toLanguageMode(user.preferred_language),
    }));
    await refreshBackendOverview();
  };

  const handleSignOut = () => {
    authApi.logout();
    setAuthenticatedUser(null);
    setCarePlans(INITIAL_CARE_PLANS);
    setActivePlanId(INITIAL_CARE_PLANS[0]?.id ?? null);
    setReminders(INITIAL_REMINDERS);
    setAppointments(INITIAL_APPOINTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProfile(INITIAL_PATIENT_PROFILE);
  };

  const handleNavigate = (screen: ScreenId, planId?: string) => {
    if (planId) {
      setActivePlanId(planId);
    }
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleMedicine = async (medicineId: string) => {
    if (!activePlan) return;
    const targetMed = activePlan.medicines.find((m) => m.id === medicineId);
    if (!targetMed) return;
    const nextTaken = !targetMed.takenToday;

    setCarePlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan;
        return {
          ...plan,
          medicines: plan.medicines.map((m) =>
            m.id === medicineId ? { ...m, takenToday: nextTaken } : m
          ),
        };
      })
    );

    if (authenticatedUser && targetMed.backendId) {
      try {
        await medicationsApi.toggleTaken(targetMed.backendId, nextTaken);
      } catch {
        // Roll back on API error
        setCarePlans((prev) =>
          prev.map((plan) => {
            if (plan.id !== activePlan.id) return plan;
            return {
              ...plan,
              medicines: plan.medicines.map((m) =>
                m.id === medicineId ? { ...m, takenToday: !nextTaken } : m
              ),
            };
          })
        );
      }
    }
  };

  const handleAddMedicine = async (med: Omit<MedicineInstruction, 'id'>) => {
    if (!activePlan) return;

    if (authenticatedUser && activePlan.backendId) {
      try {
        const created = await medicationsApi.create({
          care_plan_id: activePlan.backendId,
          medicine_name: med.name,
          dosage: med.dosage,
          frequency: med.timingNote,
          administration_time: `${med.period} (${med.time})`,
          additional_instructions: med.purpose,
        });
        const mapped = mapBackendMedication(created, activePlan.medicines.length);
        setCarePlans((prev) =>
          prev.map((plan) =>
            plan.id === activePlan.id
              ? { ...plan, medicines: [...plan.medicines, mapped] }
              : plan
          )
        );
        return;
      } catch {
        // Fall through to local update only if non-backend plan
      }
    }

    setCarePlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan;
        return {
          ...plan,
          medicines: [
            ...plan.medicines,
            { ...med, id: `med-${Date.now()}` },
          ],
        };
      })
    );
  };

  const handleDeletePlan = async (planId: string) => {
    const target = carePlans.find((p) => p.id === planId);
    if (!target) return;

    if (authenticatedUser && target.backendId) {
      try {
        await carePlansApi.remove(target.backendId);
      } catch {
        return;
      }
    }

    setCarePlans((prev) => {
      const remaining = prev.filter((p) => p.id !== planId);
      if (activePlanId === planId) {
        setActivePlanId(remaining[0]?.id ?? null);
      }
      return remaining;
    });
  };

  const handleContinueToProcess = (file: File, meta: UploadedReportFile) => {
    setStagedFile(file);
    setStagedMeta(meta);
    setProfile((prev) => ({ ...prev, preferredLanguage: meta.selectedLanguage }));
    handleNavigate('processing');
  };

  const handleAnalysisSuccess = (newPlan: CarePlan) => {
    setCarePlans((prev) => [newPlan, ...prev.filter((p) => !p.isDemo)]);
    setActivePlanId(newPlan.id);
    handleNavigate('care-plan');
    if (authenticatedUser) {
      void refreshBackendOverview(newPlan.id);
    }
  };

  const handleClearDemoData = () => {
    setCarePlans((prev) => prev.filter((p) => !p.isDemo));
    setActivePlanId(null);
    setReminders([]);
    setAppointments([]);
    setNotifications([]);
  };

  const handleRestoreDemoData = () => {
    setCarePlans(INITIAL_CARE_PLANS);
    setActivePlanId(INITIAL_CARE_PLANS[0].id);
    setReminders(INITIAL_REMINDERS);
    setAppointments(INITIAL_APPOINTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleLanguageChange = (lang: LanguageMode) => {
    setProfile((prev) => ({ ...prev, preferredLanguage: lang }));
    if (authenticatedUser) {
      void authApi.updateProfile({ preferred_language: lang }).catch(() => {});
    }
  };

  const handleUpdateProfile = async (next: PatientProfile) => {
    setProfile(next);
    if (authenticatedUser) {
      try {
        const updated = await authApi.updateProfile({
          full_name: next.name,
          preferred_language: next.preferredLanguage,
          age: next.age,
          blood_group: next.bloodGroup,
          phone: next.phone,
          emergency_contact: next.emergencyContact,
        });
        setAuthenticatedUser(updated);
      } catch {
        // Keep local preference update
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleReminderActive = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;
    const nextActive = !target.active;

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: nextActive } : r))
    );

    if (authenticatedUser && target.backendId) {
      try {
        await remindersApi.update(target.backendId, { is_active: nextActive });
      } catch {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, active: !nextActive } : r))
        );
      }
    }
  };

  const handleToggleReminderCompleted = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: nextCompleted } : r))
    );

    if (authenticatedUser && target.backendId) {
      try {
        await remindersApi.update(target.backendId, {
          is_completed: nextCompleted,
        });
      } catch {
        setReminders((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, completed: !nextCompleted } : r
          )
        );
      }
    }
  };

  const handleDeleteReminder = async (id: string) => {
    const target = reminders.find((r) => r.id === id);
    setReminders((prev) => prev.filter((r) => r.id !== id));

    if (authenticatedUser && target?.backendId) {
      try {
        await remindersApi.remove(target.backendId);
      } catch {
        if (target) {
          setReminders((prev) => [target, ...prev]);
        }
      }
    }
  };

  const handleAddReminder = async (rem: Omit<ReminderItem, 'id'>) => {
    if (authenticatedUser) {
      try {
        const created = await remindersApi.create({
          title: rem.title,
          reminder_time: rem.time,
          frequency: rem.frequency,
          category: rem.category,
          notes: rem.notes ?? undefined,
          care_plan_id: activePlan?.backendId,
        });
        setReminders((prev) => [mapBackendReminder(created), ...prev]);
        return;
      } catch {
        // Fallback if request failed
      }
    }
    setReminders((prev) => [{ ...rem, id: `rem-${Date.now()}` }, ...prev]);
  };

  const handleMarkAppointmentKept = async (id: string) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Kept' } : a))
    );

    if (authenticatedUser && target.backendId) {
      try {
        await appointmentsApi.update(target.backendId, { status: 'Kept' });
      } catch {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: target.status } : a))
        );
      }
    }
  };

  const handleRescheduleAppointment = async (
    id: string,
    newDate: string,
    newTime: string
  ) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, date: newDate, time: newTime, status: 'Rescheduled' }
          : a
      )
    );

    if (authenticatedUser && target.backendId) {
      try {
        await appointmentsApi.update(target.backendId, {
          appointment_date: newTime ? `${newDate} (${newTime})` : newDate,
          status: 'Rescheduled',
        });
      } catch {
        // Revert on error
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? target : a))
        );
      }
    }
  };

  const handleAddAppointment = async (apt: Omit<AppointmentItem, 'id'>) => {
    if (authenticatedUser) {
      try {
        const created = await appointmentsApi.create({
          doctor_name: apt.doctor,
          hospital_name: apt.hospital || 'Clinic',
          appointment_date: apt.time ? `${apt.date} • ${apt.time}` : apt.date,
          appointment_notes: apt.purpose || apt.notes,
          status: apt.status,
          care_plan_id: activePlan?.backendId,
        });
        setAppointments((prev) => [mapBackendAppointment(created), ...prev]);
        return;
      } catch {
        // Fallback below
      }
    }
    setAppointments((prev) => [{ ...apt, id: `apt-${Date.now()}` }, ...prev]);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFBF7] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Desktop Full-Height Sticky Sidebar */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={(screen) => handleNavigate(screen)}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Mobile Sticky Header (< md) */}
      <MobileHeader
        unreadCount={unreadNotificationsCount}
        notifications={notifications}
        onNavigate={(screen) => handleNavigate(screen)}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Navigation (md+) */}
        <TopBar
          activeScreen={activeScreen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          carePlans={carePlans}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNavigate={handleNavigate}
          profile={profile}
          onLanguageChange={handleLanguageChange}
          authenticatedUser={authenticatedUser}
          onOpenAuth={(mode) => handleOpenAuth(mode)}
          onSignOut={handleSignOut}
        />

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 w-full px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6 pb-24 md:pb-8">
          {activeScreen === 'dashboard' && (
            <DashboardScreen
              carePlans={carePlans}
              activePlan={activePlan}
              onToggleMedicine={handleToggleMedicine}
              onNavigate={handleNavigate}
              onClearDemoData={handleClearDemoData}
              onRestoreDemoData={handleRestoreDemoData}
              unreadRemindersCount={unreadRemindersCount}
              completionPercent={completionPercent}
              takenDosesCount={takenDosesCount}
              totalDosesCount={totalDosesCount}
              appointmentsKeptCount={appointmentsKeptCount}
              totalAppointmentsCount={appointments.length}
            />
          )}

          {activeScreen === 'upload' && (
            <UploadScreen
              defaultLanguage={profile.preferredLanguage}
              onBack={() => handleNavigate('dashboard')}
              onContinueToProcess={handleContinueToProcess}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'processing' && (
            <ProcessingScreen
              stagedFile={stagedFile}
              stagedMeta={stagedMeta}
              isAuthenticated={Boolean(authenticatedUser)}
              onOpenAuth={() =>
                handleOpenAuth(
                  'login',
                  'Sign in or create an account to process your discharge summary with Gemini AI and save it securely.'
                )
              }
              onAnalysisSuccess={handleAnalysisSuccess}
              onNavigate={handleNavigate}
            />
          )}

          {(activeScreen === 'care-plans' || activeScreen === 'care-plan') && (
            <CarePlanScreen
              mode={activeScreen === 'care-plans' ? 'list' : 'detail'}
              carePlans={carePlans}
              activePlan={activePlan}
              patientName={profile.name}
              language={profile.preferredLanguage}
              onLanguageChange={handleLanguageChange}
              onSelectPlan={(planId) => setActivePlanId(planId)}
              onToggleMedicine={handleToggleMedicine}
              onNavigate={handleNavigate}
              onRestoreDemoData={handleRestoreDemoData}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeScreen === 'medicines' && (
            <MedicineScheduleScreen
              activePlan={activePlan}
              language={profile.preferredLanguage}
              onToggleMedicine={handleToggleMedicine}
              onAddMedicine={handleAddMedicine}
              onNavigateToUpload={() => handleNavigate('upload')}
            />
          )}

          {activeScreen === 'warnings' && (
            <WarningSignsScreen
              activePlan={activePlan}
              language={profile.preferredLanguage}
              emergencyContact={profile.emergencyContact}
              onNavigate={handleNavigate}
            />
          )}

          {activeScreen === 'appointments' && (
            <AppointmentsScreen
              appointments={appointments}
              onMarkKept={handleMarkAppointmentKept}
              onReschedule={handleRescheduleAppointment}
              onAddAppointment={handleAddAppointment}
            />
          )}

          {activeScreen === 'reminders' && (
            <RemindersScreen
              reminders={reminders}
              onToggleActive={handleToggleReminderActive}
              onToggleCompleted={handleToggleReminderCompleted}
              onDeleteReminder={handleDeleteReminder}
              onAddReminder={handleAddReminder}
            />
          )}

          {activeScreen === 'voice' && (
            <VoiceAssistantScreen
              activePlan={activePlan}
              language={profile.preferredLanguage}
              voiceRate={profile.voiceRate}
              onLanguageChange={handleLanguageChange}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              authenticatedUser={authenticatedUser}
              onOpenAuth={(mode) => handleOpenAuth(mode)}
              onSignOut={handleSignOut}
            />
          )}

          {activeScreen === 'about' && <AboutScreen />}

          {activeScreen === 'print' && (
            <PrintableCarePlanScreen
              activePlan={activePlan}
              patientName={profile.name}
              language={profile.preferredLanguage}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>

      {/* Dedicated Mobile Bottom Navigation (< md) */}
      <MobileBottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => handleNavigate(screen)}
        unreadRemindersCount={unreadRemindersCount}
      />

      {/* Sign In / Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        contextMessage={authModalMessage}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
