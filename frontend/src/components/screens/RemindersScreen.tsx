import React, { useState } from 'react';
import { Bell, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { ReminderItem } from '../../types/chikitsak';

interface RemindersScreenProps {
  reminders: ReminderItem[];
  onToggleActive: (id: string) => void;
  onToggleCompleted: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderItem, 'id'>) => void;
}

export const RemindersScreen: React.FC<RemindersScreenProps> = ({
  reminders,
  onToggleActive,
  onToggleCompleted,
  onDeleteReminder,
  onAddReminder,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('6:00 PM');
  const [frequency, setFrequency] = useState<'Daily' | 'Once' | 'Weekly'>('Daily');
  const [category, setCategory] = useState<'Medicine' | 'Appointment' | 'Checkup'>(
    'Medicine'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddReminder({
      title: title.trim(),
      time: time.trim() || '8:00 AM',
      frequency,
      category,
      active: true,
      completed: false,
    });
    setTitle('');
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
          Care &amp; Medicine Reminders
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 mt-0.5">
          Manage daily dose alerts, blood pressure logs, and doctor visit notifications.
        </p>

        {/* Add Reminder Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-5 pt-4 border-t border-[#EAECE6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Reminder Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check Fasting Blood Sugar"
              className="w-full px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] focus:outline-none focus:border-[#153D32]"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Category &amp; Repeat
            </label>
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value as 'Medicine' | 'Appointment' | 'Checkup'
                  )
                }
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] bg-white"
              >
                <option value="Medicine">Medicine</option>
                <option value="Checkup">Checkup</option>
                <option value="Appointment">Appointment</option>
              </select>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as 'Daily' | 'Once' | 'Weekly')
                }
                className="w-full px-2.5 py-2 rounded-xl border border-[#DCE9DC] text-[13px] bg-white"
              >
                <option value="Daily">Daily</option>
                <option value="Once">Once</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </form>
        <p className="mt-3 text-[11.5px] text-[#25312C]/60">
          Note: Reminders are managed in your active browser session; SMS/push delivery requires connecting the FastAPI backend notification service.
        </p>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="bg-white border border-dashed border-[#DCE3D9] rounded-2xl p-8 text-center text-[13.5px] text-[#25312C]/70">
          No reminders scheduled. Use the form above to add a medicine or checkup reminder.
        </div>
      ) : (
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className="bg-white border border-[#EAECE6] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_6px_rgba(21,61,50,0.03)]"
          >
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                onClick={() => onToggleCompleted(rem.id)}
                aria-label={`Mark ${rem.title} completed`}
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                  rem.completed
                    ? 'bg-[#1E7E4E] text-white'
                    : 'border-2 border-[#C8CFC6] bg-white hover:border-[#153D32]'
                }`}
              >
                {rem.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div>
                <p
                  className={`text-[14.5px] font-semibold ${
                    rem.completed
                      ? 'line-through text-[#25312C]/50'
                      : 'text-[#153D32]'
                  }`}
                >
                  {rem.title}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#25312C]/65 mt-0.5">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {rem.time}
                  </span>
                  <span>• {rem.frequency}</span>
                  <span>• {rem.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                type="button"
                onClick={() => onToggleActive(rem.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-colors ${
                  rem.active
                    ? 'bg-[#EAF1E7] text-[#153D32]'
                    : 'bg-[#F3F4EF] text-[#25312C]/60'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{rem.active ? 'Alert On' : 'Paused'}</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteReminder(rem.id)}
                aria-label={`Delete ${rem.title}`}
                className="p-2 rounded-lg text-[#25312C]/55 hover:text-[#B91C1C] hover:bg-[#FDF2F2] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
