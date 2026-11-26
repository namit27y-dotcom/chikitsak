import React, { useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Moon,
  Plus,
  Sun,
} from 'lucide-react';
import {
  CarePlan,
  DosePeriod,
  LanguageMode,
  MedicineInstruction,
} from '../../types/chikitsak';

interface MedicineScheduleScreenProps {
  activePlan: CarePlan | null;
  language: LanguageMode;
  onToggleMedicine: (medicineId: string) => void;
  onAddMedicine: (med: Omit<MedicineInstruction, 'id'>) => void;
  onNavigateToUpload: () => void;
}

export const MedicineScheduleScreen: React.FC<MedicineScheduleScreenProps> = ({
  activePlan,
  language,
  onToggleMedicine,
  onAddMedicine,
  onNavigateToUpload,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'All' | DosePeriod>('All');
  const [showAllDays, setShowAllDays] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('1 Tablet');
  const [newPeriod, setNewPeriod] = useState<DosePeriod>('Morning');
  const [newTime, setNewTime] = useState('8:30 AM');
  const [newTimingNote, setNewTimingNote] = useState('After Breakfast');

  if (!activePlan) {
    return (
      <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
        <CalendarDays className="w-10 h-10 text-[#153D32]/40 mx-auto" />
        <h1 className="font-display text-[24px] font-semibold text-[#153D32]">
          No Medicine Schedule Yet
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 max-w-md mx-auto">
          Upload a hospital discharge summary to view prescribed medicine timings
          and daily dose tracking.
        </p>
        <button
          type="button"
          onClick={onNavigateToUpload}
          className="mt-2 px-5 py-2.5 rounded-full bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
        >
          Upload Discharge Summary
        </button>
      </div>
    );
  }

  const showHindi = language === 'hi' || language === 'bilingual';
  const periods: DosePeriod[] = ['Morning', 'Afternoon', 'Night'];

  const visiblePeriods =
    selectedPeriod === 'All' ? periods : [selectedPeriod];

  const takenCount = activePlan.medicines.filter((m) => m.takenToday).length;
  const totalCount = activePlan.medicines.length;

  const visibleDays = showAllDays
    ? activePlan.sevenDayPlan
    : activePlan.sevenDayPlan.slice(0, 3);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddMedicine({
      name: newName.trim(),
      dosage: newDosage.trim() || '1 Tablet',
      period: newPeriod,
      time: newTime.trim() || '9:00 AM',
      timingNote: newTimingNote.trim() || 'After Meal',
      timingNoteHindi: 'भोजन के बाद',
      purpose: 'Added to personal medicine schedule',
      purposeHindi: 'व्यक्तिगत दवा समय-सारिणी में जोड़ा गया',
      takenToday: false,
      showOnDashboard: false,
    });
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
              Medicine Schedule
            </h1>
            {activePlan.isDemo && (
              <span className="px-2 py-0.5 rounded bg-[#F7F4EA] border border-[#E5DEC9] text-[#8C6514] text-[11px] font-semibold">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-[13.5px] text-[#25312C]/70 mt-0.5 tabular-nums">
            {takenCount} of {totalCount} doses completed today • {activePlan.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#FAFBF8] border border-[#EAECE6] rounded-full p-1">
            {(['All', 'Morning', 'Afternoon', 'Night'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPeriod(p)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                  selectedPeriod === p
                    ? 'bg-[#153D32] text-white'
                    : 'text-[#25312C]/75 hover:text-[#153D32]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Dose</span>
          </button>
        </div>
      </div>

      {/* Add Medicine Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white border border-[#DCE9DC] rounded-[20px] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Medicine Name
            </label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Atorvastatin 10mg"
              className="w-full px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Dosage
            </label>
            <input
              type="text"
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Time of Day
            </label>
            <div className="flex gap-2">
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value as DosePeriod)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] bg-white focus:outline-none focus:border-[#153D32]"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-24 px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTimingNote}
              onChange={(e) => setNewTimingNote(e.target.value)}
              placeholder="Timing note"
              className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#153D32] text-white text-[13px] font-medium cursor-pointer shrink-0"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Daily Dose List by Period */}
        <div className="lg:col-span-7 space-y-4">
          {visiblePeriods.map((period) => {
            const meds = activePlan.medicines.filter((m) => m.period === period);
            if (meds.length === 0) return null;
            const isNight = period === 'Night';

            return (
              <section
                key={period}
                className="bg-white border border-[#EAECE6] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]"
              >
                <div className="flex items-center gap-2.5 mb-3.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isNight ? 'bg-[#E6EFE8]' : 'bg-[#FEF3D6]'
                    }`}
                  >
                    {isNight ? (
                      <Moon className="w-4 h-4 text-[#153D32]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#D98A1A]" />
                    )}
                  </div>
                  <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                    {period}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {meds.map((med) => (
                    <div
                      key={med.id}
                      className="rounded-2xl bg-[#FAFBF8] border border-[#ECEEE8] p-3.5 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[14.5px] font-semibold text-[#153D32]">
                            {med.name}
                          </span>
                          <span className="text-[12.5px] text-[#25312C]/70">
                            • {med.dosage}
                          </span>
                          <span className="text-[12px] font-medium text-[#153D32]/80 tabular-nums">
                            • {med.time}
                          </span>
                        </div>
                        <p className="text-[12.5px] text-[#25312C]/75 mt-0.5">
                          {med.timingNote} — {med.purpose}
                        </p>
                        {showHindi && (
                          <p className="font-hindi text-[12px] text-[#153D32]/80 mt-0.5">
                            {med.timingNoteHindi} — {med.purposeHindi}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleMedicine(med.id)}
                        aria-label={`Toggle ${med.name}`}
                        aria-pressed={med.takenToday}
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          med.takenToday
                            ? 'bg-[#1E7E4E] text-white'
                            : 'border-2 border-[#C8CFC6] bg-white hover:border-[#153D32]'
                        }`}
                      >
                        {med.takenToday && (
                          <Check className="w-4 h-4 stroke-[3]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 7-Day Plan & Daily Tip matching PDF Page 2 */}
        <div className="lg:col-span-5 space-y-4">
          <section className="bg-white border border-[#EAECE6] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#153D32]" />
                <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                  7-Day Plan
                </h2>
              </div>
              <span className="text-[12px] text-[#25312C]/60">
                Nov 24 – Nov 30
              </span>
            </div>

            <div className="space-y-3">
              {visibleDays.map((day) => (
                <div
                  key={day.dayLabel}
                  className="flex items-start justify-between gap-3 pb-3 border-b border-[#F1F3EC] last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#EAF1E7] text-[#153D32] flex items-center justify-center shrink-0">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[13px] font-semibold text-[#153D32] whitespace-nowrap tabular-nums">
                      {day.dayLabel}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[12.5px] font-medium text-[#25312C]">
                      {day.focus}
                    </p>
                    <p className="text-[11.5px] text-[#25312C]/60">
                      {day.eveningNote}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {activePlan.sevenDayPlan.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllDays((prev) => !prev)}
                className="mt-4 w-full py-2 rounded-xl bg-[#FAFBF8] hover:bg-[#EAF1E7]/60 border border-[#EAECE6] text-[12.5px] font-medium text-[#153D32] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {showAllDays ? (
                  <>
                    <span>Show fewer days</span>
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>
                      + {activePlan.sevenDayPlan.length - 3} more days
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </section>

          {/* Warm Tip Card matching PDF Page 2 */}
          <div className="rounded-[20px] bg-[#F7F4EA] border border-[#E5DEC9] p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F2E5BC] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-[#8C6514]" />
            </div>
            <div>
              <p className="text-[13.5px] font-semibold text-[#153D32]">Tip:</p>
              <p className="text-[13px] text-[#25312C]/85 mt-0.5">
                Take medicines at the same time every day for better recovery
                results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
