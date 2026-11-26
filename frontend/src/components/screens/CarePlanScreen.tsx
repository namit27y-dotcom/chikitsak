import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Info,
  Pill,
  Printer,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Utensils,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CarePlan, LanguageMode, ScreenId } from '../../types/chikitsak';
import { downloadCarePlanPdf } from '../../utils/pdfExport';
import { speakText, stopSpeaking } from '../../utils/speechHelper';

interface CarePlanScreenProps {
  mode: 'list' | 'detail';
  carePlans: CarePlan[];
  activePlan: CarePlan | null;
  patientName: string;
  language: LanguageMode;
  onLanguageChange: (lang: LanguageMode) => void;
  onSelectPlan: (planId: string) => void;
  onToggleMedicine: (medicineId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onRestoreDemoData: () => void;
  onDeletePlan?: (planId: string) => void;
}

export const CarePlanScreen: React.FC<CarePlanScreenProps> = ({
  mode,
  carePlans,
  activePlan,
  patientName,
  language,
  onLanguageChange,
  onSelectPlan,
  onToggleMedicine,
  onNavigate,
  onRestoreDemoData,
  onDeletePlan,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'medicines' | 'warnings' | 'followup'
  >('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const showEnglish = language === 'en' || language === 'bilingual';
  const showHindi = language === 'hi' || language === 'bilingual';

  const handleListenToggle = () => {
    if (!activePlan) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const speechLang = language === 'hi' ? 'hi-IN' : 'en-IN';
    const textToSpeak =
      language === 'hi'
        ? `${activePlan.titleHindi}. निदान: ${activePlan.diagnosisSimpleHindi}. ${activePlan.simplifiedSummaryHindi} मुख्य निर्देश: ${activePlan.simpleInstructionsHindi.join(' ')}`
        : `${activePlan.title}. Diagnosis: ${activePlan.diagnosisSimple}. ${activePlan.simplifiedSummary} Key instructions: ${activePlan.simpleInstructions.join(' ')} Follow-up date is ${activePlan.followUpDate} with ${activePlan.doctorName}.`;

    speakText(textToSpeak, speechLang, 1.0, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  if (mode === 'list') {
    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-semibold text-[#153D32]">
              My Care Plans
            </h1>
            <p className="text-[13.5px] text-[#25312C]/70">
              Verified discharge summaries paired with simple English and Hindi instructions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer whitespace-nowrap"
          >
            <span>+ Upload New Report</span>
          </button>
        </div>

        {carePlans.length === 0 ? (
          <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-[#153D32]/40 mx-auto" />
            <h2 className="font-display text-[22px] font-semibold text-[#153D32]">
              No Care Plans Yet
            </h2>
            <p className="text-[13.5px] text-[#25312C]/70 max-w-md mx-auto">
              Upload a discharge summary PDF or photo to get started, or load the
              sample Demo Data care plan to preview the full experience.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('upload')}
                className="px-5 py-2.5 rounded-full bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
              >
                Upload Discharge Summary
              </button>
              <button
                type="button"
                onClick={onRestoreDemoData}
                className="px-5 py-2.5 rounded-full border border-[#DCE9DC] text-[#153D32] text-[13px] font-medium hover:bg-[#EAF1E7]/50 cursor-pointer"
              >
                Load Demo Data
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-3.5">
          {carePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_8px_rgba(21,61,50,0.03)]"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-6 h-6 text-[#153D32]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-[17px] font-semibold text-[#153D32]">
                      {plan.title}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1E7] text-[#153D32] text-[11.5px] font-medium">
                      {plan.status}
                    </span>
                    {plan.isDemo && (
                      <span className="px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#E5DEC9] text-[#8C6514] text-[11px] font-semibold">
                        Demo Data
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[#25312C]/80 mt-0.5">
                    {plan.diagnosisSimple} • {plan.doctorName}
                  </p>
                  <p className="text-[12px] text-[#25312C]/60 mt-1 tabular-nums">
                    {plan.createdAt} • Follow-up: {plan.followUpDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {onDeletePlan && !plan.isDemo && (
                  <button
                    type="button"
                    onClick={() => onDeletePlan(plan.id)}
                    aria-label={`Delete ${plan.title}`}
                    className="p-2 rounded-full border border-[#F5C6CB] text-[#9B1C1C] hover:bg-[#FDF2F2] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlan(plan.id);
                    onNavigate('print');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DCE9DC] text-[12.5px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/60 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlan(plan.id);
                    onNavigate('care-plan');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer"
                >
                  <span>View Care Plan →</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
        <FileText className="w-10 h-10 text-[#153D32]/40 mx-auto" />
        <h1 className="font-display text-[24px] font-semibold text-[#153D32]">
          No Active Care Plan Selected
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 max-w-md mx-auto">
          Upload a discharge summary or load Demo Data to view structured instructions.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="px-5 py-2.5 rounded-full bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
          >
            Upload Discharge Summary
          </button>
          <button
            type="button"
            onClick={onRestoreDemoData}
            className="px-5 py-2.5 rounded-full border border-[#DCE9DC] text-[#153D32] text-[13px] font-medium cursor-pointer"
          >
            Load Demo Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Action Header */}
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#1E7E4E] text-white flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-[25px] font-semibold text-[#153D32] leading-tight">
                  Your Care Plan is Ready!
                </h1>
                {activePlan.isDemo && (
                  <span className="px-2.5 py-0.5 rounded bg-[#F7F4EA] border border-[#E5DEC9] text-[#8C6514] text-[11px] font-semibold">
                    Demo Data
                  </span>
                )}
              </div>
              <p className="text-[13px] text-[#25312C]/70 mt-0.5">
                {activePlan.title} • {activePlan.createdAt} • {activePlan.hospitalName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#DCE9DC] text-[12.5px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/50 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => downloadCarePlanPdf(activePlan, patientName)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('print')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DCE9DC] bg-[#FAFBF8] hover:bg-[#EAF1E7]/60 text-[12.5px] font-medium text-[#153D32] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs + Language Switch */}
        <div className="mt-5 pt-4 border-t border-[#EAECE6] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'medicines', label: 'Medicine Schedule' },
                { id: 'warnings', label: 'Warnings' },
                { id: 'followup', label: 'Follow-up' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#EAF1E7] text-[#153D32] font-semibold'
                    : 'text-[#25312C]/70 hover:bg-[#FAFBF8] hover:text-[#153D32]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAFBF8] border border-[#EAECE6] rounded-full p-1 self-start">
            {(
              [
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिन्दी' },
                { id: 'bilingual', label: 'EN + HI' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onLanguageChange(opt.id)}
                className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer ${
                  language === opt.id
                    ? 'bg-[#153D32] text-white'
                    : 'text-[#25312C]/70 hover:text-[#153D32]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Deterministic Medical Validation Status Banner */}
          {activePlan.validationStatus && (
            <div
              className={`rounded-[18px] border px-5 py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                activePlan.validationStatus === 'Verified Against Source'
                  ? 'bg-[#EAF1E7]/75 border-[#C9DEC9]'
                  : 'bg-[#FDFBF4] border-[#E6D9B8]'
              }`}
            >
              <div className="flex items-start gap-3">
                {activePlan.validationStatus === 'Verified Against Source' ? (
                  <ShieldCheck className="w-5 h-5 text-[#1E7E4E] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#9A6B16] shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-[13.5px] font-semibold text-[#153D32]">
                    Safety Validation: {activePlan.validationStatus}
                  </p>
                  {activePlan.validationNotes &&
                    activePlan.validationNotes.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[12.5px] text-[#25312C]/80">
                        {activePlan.validationNotes.map((note, idx) => (
                          <li key={idx}>• {note}</li>
                        ))}
                      </ul>
                    )}
                  {activePlan.unclearInformation &&
                    activePlan.unclearInformation.length > 0 && (
                      <p className="mt-1.5 text-[12px] text-[#8C6514] font-medium">
                        Unclear in source:{' '}
                        {activePlan.unclearInformation.join(' • ')}
                      </p>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Clear Separation: Original Medical Information vs AI-Simplified Explanation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Original Medical Record */}
            <section className="bg-[#FAFBF8] border border-[#DCE3D9] rounded-[20px] p-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#25312C]" />
                  <h2 className="font-sans text-[15px] font-semibold text-[#25312C]">
                    Original Medical Information
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#E7EAE2] text-[#25312C] text-[11px] font-medium">
                  Verbatim Hospital Record
                </span>
              </div>
              <p className="text-[12.5px] font-medium text-[#153D32] mb-2">
                Clinical Diagnosis: {activePlan.diagnosisClinical}
              </p>
              <div className="rounded-xl bg-white border border-[#EAECE6] p-3.5 text-[12.5px] text-[#25312C]/80 leading-relaxed font-mono">
                {activePlan.originalDischargeNote}
              </div>
            </section>

            {/* AI-Generated Simplified Explanation */}
            <section className="bg-white border border-[#C9DEC9] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#153D32]" />
                  <h2 className="font-sans text-[15px] font-semibold text-[#153D32]">
                    Simplified Explanation
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#EAF1E7] text-[#153D32] text-[11px] font-medium">
                  AI-Simplified Patient Guide
                </span>
              </div>
              {showEnglish && (
                <p className="text-[13.5px] text-[#25312C] leading-relaxed">
                  {activePlan.simplifiedSummary}
                </p>
              )}
              {showHindi && (
                <p
                  className={`font-hindi text-[13.5px] text-[#153D32]/90 leading-relaxed ${
                    showEnglish ? 'mt-3 pt-3 border-t border-[#EAF1E7]' : ''
                  }`}
                >
                  {activePlan.simplifiedSummaryHindi}
                </p>
              )}
            </section>
          </div>

          {/* Key Information & Simple Instructions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Key Information */}
            <section className="lg:col-span-5 bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-4">
              <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                Key Information
              </h2>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-[#153D32]" />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-medium text-[#25312C]/60">
                      Diagnosis
                    </p>
                    {showEnglish && (
                      <p className="text-[13.5px] font-semibold text-[#153D32]">
                        {activePlan.diagnosisSimple}
                      </p>
                    )}
                    {showHindi && (
                      <p className="font-hindi text-[12.5px] text-[#25312C]/80">
                        {activePlan.diagnosisSimpleHindi}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#153D32]" />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-medium text-[#25312C]/60">
                      Follow-up Date
                    </p>
                    <p className="text-[13.5px] font-semibold text-[#153D32] tabular-nums">
                      {activePlan.followUpDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-[#153D32]" />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-medium text-[#25312C]/60">
                      Attending Doctor
                    </p>
                    <p className="text-[13.5px] font-semibold text-[#153D32]">
                      {activePlan.doctorName}
                    </p>
                    <p className="text-[12px] text-[#25312C]/65">
                      {activePlan.doctorSpecialty}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Simple Instructions & Diet */}
            <section className="lg:col-span-7 bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-4">
              <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                Simple Care &amp; Diet Instructions
              </h2>

              <ul className="space-y-2.5">
                {activePlan.simpleInstructions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1E7E4E] shrink-0 mt-1" />
                    <div>
                      {showEnglish && (
                        <p className="text-[13.5px] text-[#25312C]">{item}</p>
                      )}
                      {showHindi && activePlan.simpleInstructionsHindi[idx] && (
                        <p className="font-hindi text-[12.5px] text-[#153D32]/85 mt-0.5">
                          {activePlan.simpleInstructionsHindi[idx]}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-[#EAECE6]">
                <div className="flex items-center gap-2 mb-2">
                  <Utensils className="w-4 h-4 text-[#153D32]" />
                  <h3 className="text-[14px] font-semibold text-[#153D32]">
                    Diet &amp; Lifestyle
                  </h3>
                </div>
                <ul className="space-y-1.5 text-[13px] text-[#25312C]/85">
                  {activePlan.dietAndLifestyle.map((diet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#153D32] font-bold">•</span>
                      <div>
                        {showEnglish && <span>{diet}</span>}
                        {showHindi && activePlan.dietAndLifestyleHindi[idx] && (
                          <p className="font-hindi text-[12px] text-[#153D32]/80">
                            {activePlan.dietAndLifestyleHindi[idx]}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* MEDICINES TAB */}
      {activeTab === 'medicines' && (
        <section className="bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
              Prescribed Medicine Instructions
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('medicines')}
              className="text-[12.5px] font-medium text-[#153D32] hover:underline cursor-pointer"
            >
              Open Full Schedule →
            </button>
          </div>
          {activePlan.medicines.length === 0 ? (
            <p className="text-[13px] text-[#25312C]/65">
              No scheduled daily medicines attached to this plan.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePlan.medicines.map((med) => (
                <div
                  key={med.id}
                  className="rounded-2xl bg-[#FAFBF8] border border-[#EAECE6] p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4 text-[#153D32]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#153D32]">
                        {med.name} ({med.dosage})
                      </p>
                      <p className="text-[12px] text-[#25312C]/70 tabular-nums">
                        {med.period} • {med.time} • {med.timingNote}
                      </p>
                      {showEnglish && (
                        <p className="text-[12.5px] text-[#25312C]/80 mt-1">
                          {med.purpose}
                        </p>
                      )}
                      {showHindi && (
                        <p className="font-hindi text-[12px] text-[#153D32]/80 mt-0.5">
                          {med.purposeHindi}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleMedicine(med.id)}
                    className={`px-3 py-1 rounded-full text-[11.5px] font-medium shrink-0 cursor-pointer ${
                      med.takenToday
                        ? 'bg-[#1E7E4E] text-white'
                        : 'bg-white border border-[#DCE9DC] text-[#153D32]'
                    }`}
                  >
                    {med.takenToday ? 'Taken ✓' : 'Mark Taken'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* WARNINGS TAB */}
      {activeTab === 'warnings' && (
        <section className="bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
              Warning Signs to Watch For
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('warnings')}
              className="text-[12.5px] font-medium text-[#153D32] hover:underline cursor-pointer"
            >
              Open Safety Guide →
            </button>
          </div>
          {activePlan.warningSigns.map((ws) => (
            <div
              key={ws.id}
              className={`rounded-2xl p-4 border ${
                ws.severity === 'urgent'
                  ? 'bg-[#FDF4F3] border-[#F3C8C3]'
                  : 'bg-[#FDFBF4] border-[#EADDB8]'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    ws.severity === 'urgent' ? 'text-[#C0392B]' : 'text-[#9A6B16]'
                  }`}
                />
                <div>
                  {showEnglish && (
                    <p className="text-[14px] font-semibold text-[#25312C]">
                      {ws.title}
                    </p>
                  )}
                  {showHindi && (
                    <p className="font-hindi text-[13px] font-medium text-[#25312C]/85">
                      {ws.titleHindi}
                    </p>
                  )}
                  <p className="text-[12.5px] text-[#25312C]/75 mt-1">
                    {ws.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* FOLLOW-UP TAB */}
      {activeTab === 'followup' && (
        <section className="bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                Scheduled Follow-up Visit
              </h2>
              <p className="text-[13px] text-[#25312C]/70 mt-0.5">
                {activePlan.followUpDate} • {activePlan.doctorName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('appointments')}
              className="px-4 py-2 rounded-full bg-[#153D32] text-white text-[12.5px] font-medium cursor-pointer"
            >
              Manage Appointments
            </button>
          </div>
          <p className="text-[13.5px] text-[#25312C]/80">
            Please bring your 7-day evening blood pressure readings and morning fasting blood
            sugar report to {activePlan.hospitalName}.
          </p>
        </section>
      )}

      {/* Listen to Instructions Bar matching PDF Page 2 */}
      <div className="rounded-2xl bg-[#F7F4EA] border border-[#E5DEC9] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#EAF1E7] flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-[#153D32]" />
          </div>
          <p className="text-[13.5px] font-medium text-[#153D32]">
            You can also listen to these instructions in{' '}
            {language === 'hi' ? 'Hindi' : 'English'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleListenToggle}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer whitespace-nowrap"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Play Audio</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
