import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Download,
  Heart,
  Pill,
  Printer,
  Utensils,
} from 'lucide-react';
import { CarePlan, LanguageMode, ScreenId } from '../../types/chikitsak';
import { downloadCarePlanPdf } from '../../utils/pdfExport';
import { ChikitsakLogoMark } from '../BrandLogo';

interface PrintableCarePlanScreenProps {
  activePlan: CarePlan | null;
  patientName: string;
  language: LanguageMode;
  onNavigate: (screen: ScreenId) => void;
}

export const PrintableCarePlanScreen: React.FC<PrintableCarePlanScreenProps> = ({
  activePlan,
  patientName,
  language,
  onNavigate,
}) => {
  const showHindi = language === 'hi' || language === 'bilingual';

  if (!activePlan) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
        <Printer className="w-10 h-10 text-[#153D32]/40 mx-auto" />
        <h1 className="font-display text-[24px] font-semibold text-[#153D32]">
          No Care Plan Available to Print
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70">
          Upload a discharge summary first to generate a printable family care sheet.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('upload')}
          className="px-5 py-2.5 rounded-full bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
        >
          Upload Discharge Summary
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print bg-white border border-[#EAECE6] rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('care-plan')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#153D32] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Care Plan</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => downloadCarePlanPdf(activePlan, patientName)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#DCE9DC] text-[12.5px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/60 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Care Plan</span>
          </button>
        </div>
      </div>

      {/* Printable Family Sheet matching PDF Page 2 Bottom-Right */}
      <article className="print-only-container bg-white border border-[#DCE3D9] rounded-[20px] p-7 shadow-sm space-y-5">
        <header className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAECE6]">
          <div className="flex items-center gap-3">
            <ChikitsakLogoMark className="w-10 h-10" />
            <div>
              <h1 className="font-sans text-[20px] font-bold text-[#153D32] tracking-wide">
                CHIKITSAK
              </h1>
              <p className="text-[11.5px] text-[#25312C]/70">
                Understand. Follow. Recover.
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[13px] font-semibold text-[#153D32]">
              Care Plan for Family
            </p>
            <p className="text-[12px] text-[#25312C]/65">
              Patient: {patientName} • Simple Guide
            </p>
          </div>
        </header>

        <div className="rounded-xl bg-[#153D32] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-sans text-[17px] font-semibold">
            Patient Care Instructions
          </h2>
          <span className="text-[12.5px] text-[#DCE9DC] tabular-nums">
            {activePlan.createdAt}
          </span>
        </div>

        {/* Medicines */}
        <section className="rounded-xl bg-[#FAFBF8] border border-[#EAECE6] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#153D32] font-semibold text-[15px]">
            <Pill className="w-4 h-4" />
            <h3>Medicines</h3>
          </div>
          <ul className="space-y-1.5 text-[13px] text-[#25312C]">
            {activePlan.medicines.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-2">
                <span>
                  • <strong>{m.name}</strong> ({m.dosage}) — {m.timingNote}
                  {showHindi ? ` (${m.timingNoteHindi})` : ''}
                </span>
                <span className="text-[12px] font-medium text-[#153D32] tabular-nums shrink-0">
                  {m.period} • {m.time}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Diet */}
        <section className="rounded-xl bg-[#FAFBF8] border border-[#EAECE6] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#153D32] font-semibold text-[15px]">
            <Utensils className="w-4 h-4" />
            <h3>Diet &amp; Daily Routine</h3>
          </div>
          <ul className="space-y-1 text-[13px] text-[#25312C]">
            {activePlan.dietAndLifestyle.map((d, i) => (
              <li key={i}>
                • {d}
                {showHindi && activePlan.dietAndLifestyleHindi[i] && (
                  <span className="block font-hindi text-[12px] text-[#153D32]/85 pl-3">
                    {activePlan.dietAndLifestyleHindi[i]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* Warning Signs */}
        <section className="rounded-xl bg-[#FDF4F3] border border-[#F0C2BC] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#B83227] font-semibold text-[15px]">
            <AlertTriangle className="w-4 h-4" />
            <h3>Warning Signs — Seek Immediate Medical Help If:</h3>
          </div>
          <ul className="space-y-1 text-[13px] text-[#25312C]">
            {activePlan.warningSigns.map((w) => (
              <li key={w.id}>
                • <strong>{w.title}</strong> — {w.action}
              </li>
            ))}
          </ul>
        </section>

        {/* Original Note Reference */}
        <section className="rounded-xl border border-[#EAECE6] p-3.5 text-[11.5px] text-[#25312C]/75">
          <strong className="text-[#25312C]">Original Hospital Diagnosis:</strong>{' '}
          {activePlan.diagnosisClinical} — {activePlan.doctorName}
        </section>

        {/* Footer Follow-up Date */}
        <footer className="pt-3 border-t border-[#EAECE6] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-[#153D32]" />
            <div>
              <p className="text-[11px] text-[#25312C]/65">Follow-Up Date</p>
              <p className="text-[14px] font-bold text-[#153D32] tabular-nums">
                {activePlan.followUpDate} • {activePlan.doctorName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#153D32]">
            <span>Take Care, Get Well Soon!</span>
            <Heart className="w-4 h-4 text-[#D9534F] fill-[#D9534F]" />
          </div>
        </footer>
      </article>
    </div>
  );
};
