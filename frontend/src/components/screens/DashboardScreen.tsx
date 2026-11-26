import React, { useState } from 'react';
import {
  Activity,
  AudioLines,
  BarChart2,
  Bell,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  FileCheck2,
  FileText,
  Globe,
  HeartHandshake,
  Moon,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  Volume2,
  Zap,
} from 'lucide-react';
import { CarePlan, MedicineInstruction, ScreenId } from '../../types/chikitsak';
import { MedicalShieldIllustration } from '../BrandLogo';

interface DashboardScreenProps {
  carePlans: CarePlan[];
  activePlan: CarePlan | null;
  onToggleMedicine: (medicineId: string) => void;
  onNavigate: (screen: ScreenId, planId?: string) => void;
  onClearDemoData: () => void;
  onRestoreDemoData: () => void;
  unreadRemindersCount: number;
  completionPercent: number;
  takenDosesCount: number;
  totalDosesCount: number;
  appointmentsKeptCount: number;
  totalAppointmentsCount: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  carePlans,
  activePlan,
  onToggleMedicine,
  onNavigate,
  onClearDemoData,
  onRestoreDemoData,
  unreadRemindersCount,
  completionPercent,
  takenDosesCount,
  totalDosesCount,
  appointmentsKeptCount,
  totalAppointmentsCount,
}) => {
  const [overviewRange, setOverviewRange] = useState<
    'Today' | 'Last 7 Days' | 'Since Discharge'
  >('Today');
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);

  const recentPlan = carePlans[0] ?? activePlan;
  const hasDemoRecords = carePlans.some((p) => p.isDemo);

  const dashboardMedicines: MedicineInstruction[] = activePlan
    ? activePlan.medicines.filter((m) => m.showOnDashboard).slice(0, 3)
    : [];

  const ringRadius = 38;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (completionPercent / 100) * ringCircumference;

  const featureCards = [
    {
      title: 'Smart Summarization',
      subtitle: 'in Simple Language',
      icon: FileText,
      target: (recentPlan ? 'care-plan' : 'upload') as ScreenId,
    },
    {
      title: 'Multi-Language Support',
      subtitle: '(English + Hindi)',
      icon: Globe,
      target: (recentPlan ? 'care-plan' : 'settings') as ScreenId,
    },
    {
      title: 'Accurate &',
      subtitle: 'Reliable Information',
      icon: ShieldCheck,
      target: (recentPlan ? 'warnings' : 'about') as ScreenId,
    },
    {
      title: 'Voice Assistance',
      subtitle: 'for Everyone',
      icon: Volume2,
      target: 'voice' as ScreenId,
    },
  ];

  return (
    <div className="w-full">
      {/* ==================== TABLET & DESKTOP DASHBOARD (md+) ==================== */}
      <div className="hidden md:block space-y-5">
        {/* Hero Banner */}
        <section
          aria-label="Welcome Hero"
          className="relative rounded-[20px] overflow-hidden border border-[#E2E8DC] bg-[#F7F4EA] min-h-[260px] lg:min-h-[288px] xl:min-h-[304px] flex items-center shadow-[0_2px_14px_rgba(21,61,50,0.04)]"
        >
          {/* CHIKITSAK Hero Photograph (Doctor & Elderly Patient) */}
          <img
            src="/assets/chikitsak-hero.png"
            alt="Doctor explaining discharge summary instructions to an elderly patient"
            className="absolute inset-0 w-full h-full object-cover object-[66%_18%] lg:object-[60%_16%]"
          />

          {/* Subtle Warm Ivory Overlay on Text Side for Readability */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#F7F4EA] via-[#F7F4EA]/90 via-36% to-transparent"
          />

          {/* Subtle Decorative Leaf Silhouettes */}
          <svg
            aria-hidden="true"
            viewBox="0 0 220 180"
            className="pointer-events-none absolute left-[34%] bottom-0 w-52 h-44 opacity-30"
          >
            <path
              d="M30 175C45 120 85 88 140 78C125 130 85 162 30 175Z"
              fill="#7BAE80"
            />
            <path
              d="M10 155C10 112 36 74 78 58C80 102 52 138 10 155Z"
              fill="#A5CBA8"
            />
          </svg>

          {/* Curved Deep Forest Green Corner Accent */}
          <svg
            aria-hidden="true"
            viewBox="0 0 420 120"
            className="pointer-events-none absolute right-0 bottom-0 w-[320px] xl:w-[380px] h-[90px]"
            preserveAspectRatio="none"
          >
            <path
              d="M420 120H90C190 95 295 55 420 0V120Z"
              fill="#153D32"
              fillOpacity="0.9"
            />
            <path
              d="M420 120H185C270 100 345 72 420 34V120Z"
              fill="#2B6B4F"
              fillOpacity="0.55"
            />
          </svg>

          <div className="relative z-10 px-7 lg:px-9 py-7 max-w-[540px]">
            <h1 className="font-display text-[32px] lg:text-[36px] xl:text-[40px] font-semibold text-[#153D32] leading-[1.12] tracking-tight">
              Better Understanding.
              <br />
              Healthier Tomorrow.
            </h1>
            <p className="mt-3 text-[15px] text-[#25312C]/85 leading-relaxed max-w-[390px]">
              Turn complex medical reports into simple, easy-to-follow care
              instructions.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="mt-5 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13.5px] font-medium shadow-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Upload Discharge Summary</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        {/* Demo Data Transparency Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-[#F7F4EA] border border-[#E5DEC9] text-[12.5px]">
          {carePlans.length > 0 && hasDemoRecords ? (
            <>
              <div className="flex items-center gap-2 text-[#25312C]/85">
                <span className="px-2 py-0.5 rounded-md bg-[#D7BE8A]/45 text-[#0E3025] font-semibold text-[11px] uppercase tracking-wide">
                  Demo Data
                </span>
                <span>
                  Displaying sample discharge care records for preview. Upload a
                  discharge summary to work with your own records.
                </span>
              </div>
              <button
                type="button"
                onClick={onClearDemoData}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#153D32] hover:underline cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Demo Data</span>
              </button>
            </>
          ) : carePlans.length === 0 ? (
            <>
              <span className="text-[#25312C]/80">
                No patient discharge records loaded yet. Upload a report or load the
                sample demo care plan to explore.
              </span>
              <button
                type="button"
                onClick={onRestoreDemoData}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#153D32] hover:underline cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Load Demo Data</span>
              </button>
            </>
          ) : (
            <span className="text-[#153D32] font-medium">
              Showing verified patient care plan records.
            </span>
          )}
        </div>

        {/* 4 Feature Cards */}
        <section
          aria-label="Key Platform Capabilities"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => onNavigate(card.target)}
                className="group text-left bg-white hover:bg-[#FAFBF8] border border-[#EAECE6] hover:border-[#153D32]/25 rounded-2xl px-4 py-3.5 flex items-center gap-3.5 shadow-[0_1px_6px_rgba(21,61,50,0.03)] transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-[#EAF1E7] group-hover:bg-[#DCE9DC] flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-[#153D32]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#153D32] leading-snug">
                    {card.title}
                  </p>
                  <p className="text-[12px] text-[#25312C]/70 leading-snug mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        {/* Middle Row: Your Recent Care Plans & Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* A. Your Recent Care Plans */}
          <section className="lg:col-span-7 bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-[#153D32]" />
                <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
                  Your Recent Care Plans
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('care-plans')}
                className="text-[13px] font-medium text-[#153D32] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>View All</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {recentPlan ? (
              <div className="rounded-2xl bg-[#FAFBF8] border border-[#EAECE6] p-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-14 h-14 rounded-2xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                    <FileCheck2 className="w-7 h-7 text-[#153D32]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-semibold text-[#153D32] truncate">
                        {recentPlan.title}
                      </p>
                      {recentPlan.isDemo && (
                        <span className="px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#E5DEC9] text-[#8C6514] text-[10.5px] font-semibold shrink-0">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-[#25312C]/65 mt-0.5 tabular-nums">
                      {recentPlan.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3.5 py-1 rounded-full bg-[#EAF1E7] text-[#153D32] text-[12px] font-medium">
                    {recentPlan.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('care-plan', recentPlan.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>View Details</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#FAFBF8] border border-dashed border-[#DCE3D9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[14.5px] font-semibold text-[#153D32]">
                    No Patient Care Plans Yet
                  </p>
                  <p className="text-[12.5px] text-[#25312C]/65 mt-0.5">
                    Upload a hospital discharge summary to view structured guidance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('upload')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] text-white text-[12.5px] font-medium cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Report</span>
                </button>
              </div>
            )}
          </section>

          {/* B. Health Overview */}
          <section className="lg:col-span-5 bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <div className="flex items-center justify-between mb-3 gap-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#153D32]" />
                <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
                  Health Overview
                </h2>
                {hasDemoRecords && (
                  <span className="px-2 py-0.5 rounded bg-[#F7F4EA] text-[#8C6514] text-[10px] font-semibold">
                    Demo
                  </span>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setRangeMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E2E6DC] bg-[#FAFBF8] text-[12px] font-medium text-[#25312C]/80 hover:border-[#153D32]/30 cursor-pointer whitespace-nowrap"
                >
                  <span>{overviewRange}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {rangeMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-[#E2E6DC] shadow-lg py-1 z-20">
                    {(['Today', 'Last 7 Days', 'Since Discharge'] as const).map(
                      (opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setOverviewRange(opt);
                            setRangeMenuOpen(false);
                          }}
                          className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-[#EAF1E7]/70 cursor-pointer ${
                            overviewRange === opt
                              ? 'font-semibold text-[#153D32]'
                              : 'text-[#25312C]/80'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {recentPlan ? (
              <div className="flex items-center justify-between gap-4">
                {/* Circular Completion Ring computed directly from recorded doses */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="relative w-[94px] h-[94px] flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 94 94">
                      <circle
                        cx="47"
                        cy="47"
                        r={ringRadius}
                        fill="none"
                        stroke="#EAF1E7"
                        strokeWidth="8"
                      />
                      <circle
                        cx="47"
                        cy="47"
                        r={ringRadius}
                        fill="none"
                        stroke="#153D32"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <span className="absolute text-[22px] font-bold text-[#153D32] tabular-nums">
                      {completionPercent}%
                    </span>
                  </div>
                  <p className="text-[11.5px] font-medium text-[#25312C]/75 text-center leading-tight mt-1">
                    Doses Recorded
                    <br />
                    Today
                  </p>
                </div>

                {/* Truthful Status Checklist */}
                <div className="flex-1 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('medicines')}
                    className="w-full flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1E7E4E] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </span>
                    <span className="text-[13px] font-medium text-[#25312C] group-hover:text-[#153D32] tabular-nums">
                      {takenDosesCount} of {totalDosesCount} Medicines Taken
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('appointments')}
                    className="w-full flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1E7E4E] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </span>
                    <span className="text-[13px] font-medium text-[#25312C] group-hover:text-[#153D32] tabular-nums">
                      {appointmentsKeptCount} of {totalAppointmentsCount}{' '}
                      Appointments Kept
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('appointments')}
                    className="w-full flex items-center gap-2.5 text-left group cursor-pointer"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#E5E8DE] flex items-center justify-center shrink-0">
                      <Clock className="w-3 h-3 text-[#25312C]/70" />
                    </span>
                    <span className="text-[13px] text-[#25312C]/75 group-hover:text-[#153D32] tabular-nums">
                      Next Follow-up: {recentPlan.followUpDate}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-[13px] text-[#25312C]/70">
                No active care plan records yet. Daily adherence metrics will appear
                once a care plan is added.
              </div>
            )}
          </section>
        </div>

        {/* Bottom Row: Your Health Our Priority | Medicine Schedule | Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-stretch">
          {/* C. Your Health Our Priority */}
          <section className="md:col-span-1 lg:col-span-3 rounded-[20px] bg-gradient-to-b from-[#E5EFE3] via-[#EEF4EC] to-[#D9E8D7] border border-[#D4E2D2] p-5 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <MedicalShieldIllustration className="w-24 h-24 mt-1" />
            <div className="my-2">
              <h2 className="font-display text-[22px] font-semibold text-[#153D32] leading-tight">
                Your Health
                <br />
                Our Priority
              </h2>
              <p className="mt-1.5 text-[12px] text-[#25312C]/75 leading-snug">
                Trusted care guidance
                <br />
                for a healthier you.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('warnings')}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Learn More</span>
              <span aria-hidden="true">→</span>
            </button>
          </section>

          {/* D. Medicine Schedule */}
          <section className="md:col-span-2 lg:col-span-6 lg:order-2 bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="w-5 h-5 text-[#153D32]" />
                <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
                  Medicine Schedule
                </h2>
                {activePlan?.isDemo && (
                  <span className="px-2 py-0.5 rounded bg-[#F7F4EA] text-[#8C6514] text-[10px] font-semibold">
                    Demo
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('medicines')}
                className="text-[13px] font-medium text-[#153D32] hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <span>See Full Schedule</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {dashboardMedicines.length > 0 ? (
              <div className="space-y-2.5">
                {dashboardMedicines.map((med) => {
                  const isNight = med.period === 'Night';
                  return (
                    <div
                      key={med.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#FAFBF8] border border-[#ECEEE8] hover:border-[#DCE9DC] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isNight ? 'bg-[#E6EFE8]' : 'bg-[#FEF3D6]'
                          }`}
                        >
                          {isNight ? (
                            <Moon className="w-4 h-4 text-[#153D32]" />
                          ) : (
                            <Sun className="w-4 h-4 text-[#D98A1A]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13.5px] font-semibold text-[#153D32]">
                              {med.period}
                            </span>
                            <span className="text-[11.5px] text-[#25312C]/55 tabular-nums">
                              {med.time}
                            </span>
                          </div>
                          <p className="text-[13px] text-[#25312C]/85 truncate">
                            {med.name} ({med.dosage})
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleMedicine(med.id)}
                        aria-label={`Mark ${med.name} as ${
                          med.takenToday ? 'not taken' : 'taken'
                        }`}
                        aria-pressed={med.takenToday}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          med.takenToday
                            ? 'bg-[#1E7E4E] text-white'
                            : 'border-2 border-[#C8CFC6] bg-white hover:border-[#153D32]'
                        }`}
                      >
                        {med.takenToday && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center rounded-2xl bg-[#FAFBF8] border border-dashed border-[#DCE3D9]">
                <p className="text-[13.5px] font-medium text-[#153D32]">
                  No medicines scheduled
                </p>
                <p className="text-[12px] text-[#25312C]/65 mt-1">
                  Upload a discharge report or open Medicine Schedule to add doses.
                </p>
              </div>
            )}
          </section>

          {/* E. Quick Actions */}
          <section className="md:col-span-1 lg:col-span-3 lg:order-3 bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col justify-between shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <div className="flex items-center gap-2 mb-3.5">
              <Zap className="w-4 h-4 text-[#1E7E4E]" />
              <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
                Quick Actions
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5 flex-1">
              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="rounded-xl bg-[#FAFBF8] hover:bg-[#EAF1E7]/70 border border-[#ECEEE8] p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5 text-[#153D32]" />
                <span className="text-[12px] font-medium text-[#25312C] leading-tight">
                  Upload
                  <br />
                  Report
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('voice')}
                className="rounded-xl bg-[#FAFBF8] hover:bg-[#EAF1E7]/70 border border-[#ECEEE8] p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer"
              >
                <AudioLines className="w-5 h-5 text-[#153D32]" />
                <span className="text-[12px] font-medium text-[#25312C] leading-tight">
                  Voice
                  <br />
                  Guide
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate(recentPlan ? 'print' : 'upload')}
                className="rounded-xl bg-[#FAFBF8] hover:bg-[#EAF1E7]/70 border border-[#ECEEE8] p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-5 h-5 text-[#153D32]" />
                <span className="text-[12px] font-medium text-[#25312C] leading-tight">
                  Print Care
                  <br />
                  Plan
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('reminders')}
                className="rounded-xl bg-[#FAFBF8] hover:bg-[#EAF1E7]/70 border border-[#ECEEE8] p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5 text-[#153D32]" />
                <span className="text-[12px] font-medium text-[#25312C] leading-tight">
                  Set
                  <br />
                  Reminder
                </span>
              </button>
            </div>
          </section>
        </div>

        {/* Bottom Footer */}
        <footer className="pt-3 pb-1 border-t border-[#EAECE6] flex items-center justify-between text-[12px] text-[#25312C]/65">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#153D32]" />
            <span>Together for a Healthier India</span>
            <span aria-hidden="true">|</span>
            <span className="font-semibold text-[#153D32]">CHIKITSAK</span>
          </div>
          <p>
            Designed with <span className="text-[#D9534F]">♥</span> for Better
            Healthcare
          </p>
        </footer>
      </div>

      {/* ==================== MOBILE DASHBOARD (< md) ==================== */}
      <div className="md:hidden space-y-4">
        {/* Compact Mobile Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-[#E2E8DC] bg-[#F7F4EA] p-4 min-h-[192px] flex items-center">
          <img
            src="/assets/chikitsak-hero.png"
            alt="Doctor explaining discharge summary instructions to an elderly patient"
            className="absolute inset-0 w-full h-full object-cover object-[72%_18%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#F7F4EA] via-[#F7F4EA]/92 via-48% to-transparent"
          />
          <div className="relative z-10 max-w-[66%]">
            <h1 className="font-display text-[21px] font-semibold text-[#153D32] leading-[1.15]">
              Better Understanding.
              <br />
              Healthier Tomorrow.
            </h1>
            <p className="mt-1.5 text-[11.5px] text-[#25312C]/80 leading-snug">
              Turn complex medical reports into simple, easy-to-follow care
              instructions.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#153D32] text-white text-[12px] font-medium cursor-pointer"
            >
              <span>Upload Report</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        {/* Mobile Demo Notice */}
        {hasDemoRecords && (
          <div className="rounded-xl bg-[#F7F4EA] border border-[#E5DEC9] px-3 py-2 flex items-center justify-between gap-2 text-[11.5px]">
            <span className="text-[#25312C]/85">
              <strong className="text-[#8C6514]">Demo Data:</strong> Sample care
              records loaded
            </span>
            <button
              type="button"
              onClick={onClearDemoData}
              className="font-medium text-[#153D32] underline shrink-0"
            >
              Clear
            </button>
          </div>
        )}

        {/* 2-Column Quick Access Cards */}
        <section className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('care-plans')}
            className="bg-white border border-[#EAECE6] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xs cursor-pointer min-h-[104px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF1E7] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#153D32]" />
            </div>
            <span className="text-[13px] font-medium text-[#153D32] leading-tight">
              My Care Plans
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('medicines')}
            className="bg-white border border-[#EAECE6] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xs cursor-pointer min-h-[104px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF1E7] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[#153D32]" />
            </div>
            <span className="text-[13px] font-medium text-[#153D32] leading-tight">
              Medicine Schedule
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reminders')}
            className="relative bg-white border border-[#EAECE6] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xs cursor-pointer min-h-[104px]"
          >
            {unreadRemindersCount > 0 && (
              <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full bg-[#E15241] text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
                {unreadRemindersCount}
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-[#EAF1E7] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#153D32]" />
            </div>
            <span className="text-[13px] font-medium text-[#153D32] leading-tight">
              Reminders
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className="bg-white border border-[#EAECE6] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 shadow-xs cursor-pointer min-h-[104px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAF1E7] flex items-center justify-center">
              <AudioLines className="w-5 h-5 text-[#153D32]" />
            </div>
            <span className="text-[13px] font-medium text-[#153D32] leading-tight">
              Voice Guide
            </span>
          </button>
        </section>

        {/* Mobile Health Overview Card */}
        <button
          type="button"
          onClick={() => onNavigate('medicines')}
          className="w-full text-left bg-white border border-[#EAECE6] rounded-2xl p-4 shadow-xs cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans text-[15.5px] font-semibold text-[#153D32]">
              Health Overview
            </h2>
            <span className="text-[#153D32] text-sm">→</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 94 94">
                  <circle
                    cx="47"
                    cy="47"
                    r={ringRadius}
                    fill="none"
                    stroke="#EAF1E7"
                    strokeWidth="9"
                  />
                  <circle
                    cx="47"
                    cy="47"
                    r={ringRadius}
                    fill="none"
                    stroke="#153D32"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <span className="absolute text-[15px] font-bold text-[#153D32] tabular-nums">
                  {completionPercent}%
                </span>
              </div>
              <div>
                <p className="text-[12.5px] font-medium text-[#25312C]/80 leading-snug">
                  Doses Recorded
                  <br />
                  Today
                </p>
                <p className="text-[11px] text-[#25312C]/60 tabular-nums mt-0.5">
                  {takenDosesCount} of {totalDosesCount} taken
                </p>
              </div>
            </div>

            <div className="flex items-end gap-1.5 h-11 pr-1" aria-hidden="true">
              <span className="w-2.5 h-4 rounded-t bg-[#74B582]" />
              <span className="w-2.5 h-6 rounded-t bg-[#56A068]" />
              <span className="w-2.5 h-8 rounded-t bg-[#3A8B52]" />
              <span className="w-2.5 h-11 rounded-t bg-[#1E7E4E]" />
            </div>
          </div>
        </button>

        {/* Mobile Recent Care Plan */}
        <section className="bg-white border border-[#EAECE6] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sans text-[15.5px] font-semibold text-[#153D32]">
              Recent Care Plan
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('care-plans')}
              className="text-[12.5px] font-medium text-[#153D32] cursor-pointer"
            >
              View All →
            </button>
          </div>

          {recentPlan ? (
            <button
              type="button"
              onClick={() => onNavigate('care-plan', recentPlan.id)}
              className="w-full text-left rounded-xl bg-[#FAFBF8] border border-[#ECEEE8] p-3 flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5 text-[#153D32]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-semibold text-[#153D32] truncate">
                    {recentPlan.title}
                  </p>
                  <p className="text-[11.5px] text-[#25312C]/65 tabular-nums">
                    {recentPlan.createdAt}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#153D32] text-[11px] font-medium shrink-0">
                {recentPlan.isDemo ? 'Demo' : recentPlan.status}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('upload')}
              className="w-full rounded-xl bg-[#FAFBF8] border border-dashed border-[#DCE3D9] p-4 text-center text-[12.5px] font-medium text-[#153D32]"
            >
              No care plans yet — Tap to Upload Report
            </button>
          )}
        </section>
      </div>
    </div>
  );
};
