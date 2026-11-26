import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Stethoscope,
} from 'lucide-react';
import { AppointmentItem } from '../../types/chikitsak';

interface AppointmentsScreenProps {
  appointments: AppointmentItem[];
  onMarkKept: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onAddAppointment: (apt: Omit<AppointmentItem, 'id'>) => void;
}

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({
  appointments,
  onMarkKept,
  onReschedule,
  onAddAppointment,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');
  const [showAdd, setShowAdd] = useState(false);

  const [doctor, setDoctor] = useState('Dr. Rajeshwar Sharma, MD');
  const [hospital, setHospital] = useState('Indraprastha Care & Heart Institute');
  const [date, setDate] = useState('10 Dec 2025');
  const [time, setTime] = useState('11:00 AM');
  const [purpose, setPurpose] = useState('Routine Blood Pressure & Sugar Check');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor.trim() || !date.trim()) return;
    onAddAppointment({
      doctor: doctor.trim(),
      specialty: 'Follow-up Consultation',
      hospital: hospital.trim(),
      date: date.trim(),
      time: time.trim(),
      purpose: purpose.trim(),
      status: 'Upcoming',
      notes: 'Bring updated medication log.',
    });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
            Follow-up Appointments
          </h1>
          <p className="text-[13.5px] text-[#25312C]/70 mt-0.5">
            Track upcoming doctor visits, diagnostic tests, and completed consultations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Follow-up</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white border border-[#DCE9DC] rounded-[20px] p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Doctor / Clinic
            </label>
            <input
              type="text"
              required
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Hospital
            </label>
            <input
              type="text"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Date &amp; Time
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
              />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-24 px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
          >
            Save Visit
          </button>
        </form>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-8 text-center text-[13.5px] text-[#25312C]/70">
          No follow-up appointments recorded yet. Click <strong>Add Follow-up</strong> above to schedule a visit.
        </div>
      ) : (
      <div className="space-y-3.5">
        {appointments.map((apt) => (
          <section
            key={apt.id}
            className="bg-white border border-[#EAECE6] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    apt.status === 'Kept' ? 'bg-[#EAF1E7]' : 'bg-[#F7F4EA]'
                  }`}
                >
                  <Stethoscope className="w-6 h-6 text-[#153D32]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                      {apt.doctor}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
                        apt.status === 'Kept'
                          ? 'bg-[#EAF1E7] text-[#1E7E4E]'
                          : 'bg-[#F7EED7] text-[#8C6514]'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#25312C]/80 mt-0.5">
                    {apt.purpose} • {apt.specialty}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-[12px] text-[#25312C]/65">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="w-3.5 h-3.5" />
                      {apt.date}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {apt.time}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {apt.hospital}
                    </span>
                  </div>
                  {apt.notes && (
                    <p className="mt-2 text-[12.5px] text-[#153D32]/85 bg-[#FAFBF8] border border-[#EAECE6] rounded-xl px-3 py-2">
                      Preparation: {apt.notes}
                    </p>
                  )}
                </div>
              </div>

              {apt.status !== 'Kept' && (
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(editingId === apt.id ? null : apt.id);
                      setRescheduleDate(apt.date);
                      setRescheduleTime(apt.time);
                    }}
                    className="px-4 py-2 rounded-full border border-[#DCE9DC] text-[12.5px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/50 cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkKept(apt.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Kept</span>
                  </button>
                </div>
              )}
            </div>

            {editingId === apt.id && (
              <div className="mt-4 pt-4 border-t border-[#EAECE6] flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  placeholder="New Date (e.g. 5 Dec 2025)"
                  className="px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
                />
                <input
                  type="text"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  placeholder="Time"
                  className="px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    onReschedule(apt.id, rescheduleDate, rescheduleTime);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#153D32] text-white text-[13px] font-medium cursor-pointer"
                >
                  Save New Time
                </button>
              </div>
            )}
          </section>
        ))}
      </div>
      )}
    </div>
  );
};
