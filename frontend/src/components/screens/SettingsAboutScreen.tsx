import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Globe,
  HeartHandshake,
  LogIn,
  LogOut,
  ShieldCheck,
  User,
  Volume2,
} from 'lucide-react';
import { LanguageMode, PatientProfile } from '../../types/chikitsak';
import { BackendUser } from '../../services/api/carePlanService';
import { ChikitsakLogoMark } from '../BrandLogo';

interface SettingsScreenProps {
  profile: PatientProfile;
  onUpdateProfile: (next: PatientProfile) => Promise<void> | void;
  authenticatedUser: BackendUser | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSignOut: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  onUpdateProfile,
  authenticatedUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [form, setForm] = useState<PatientProfile>(profile);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile(form);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-6 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
          Settings &amp; Patient Profile
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 mt-0.5">
          Manage language preferences, voice speed, emergency contact, and reminder settings.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {/* Patient Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#153D32]">
              <User className="w-4 h-4" />
              <span>Patient Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#25312C]/75 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DC] text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#25312C]/75 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DC] text-[13.5px]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#25312C]/75 mb-1">
                  Emergency Family Contact
                </label>
                <input
                  type="text"
                  value={form.emergencyContact}
                  onChange={(e) =>
                    setForm({ ...form, emergencyContact: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DC] text-[13.5px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#25312C]/75 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) =>
                      setForm({ ...form, age: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DC] text-[13.5px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#25312C]/75 mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={form.bloodGroup}
                    onChange={(e) =>
                      setForm({ ...form, bloodGroup: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DC] text-[13.5px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Language & Voice */}
          <div className="pt-5 border-t border-[#EAECE6] grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#153D32] mb-2">
                <Globe className="w-4 h-4" />
                <span>Preferred Language</span>
              </div>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'en', label: 'English' },
                    { id: 'hi', label: 'हिन्दी' },
                    { id: 'bilingual', label: 'English + हिन्दी' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, preferredLanguage: opt.id as LanguageMode })
                    }
                    className={`px-3.5 py-2 rounded-xl text-[12.5px] font-medium cursor-pointer ${
                      form.preferredLanguage === opt.id
                        ? 'bg-[#153D32] text-white'
                        : 'bg-[#FAFBF8] border border-[#DCE9DC] text-[#153D32]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[14px] font-semibold text-[#153D32] mb-2">
                <Volume2 className="w-4 h-4" />
                <span>Voice Reading Speed ({form.voiceRate.toFixed(1)}x)</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.1"
                value={form.voiceRate}
                onChange={(e) =>
                  setForm({ ...form, voiceRate: parseFloat(e.target.value) })
                }
                className="w-full accent-[#153D32]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAECE6] flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2.5 cursor-pointer text-[13.5px] text-[#25312C]">
              <input
                type="checkbox"
                checked={form.smsReminders}
                onChange={(e) =>
                  setForm({ ...form, smsReminders: e.target.checked })
                }
                className="w-4 h-4 accent-[#153D32]"
              />
              <span>Enable medicine &amp; follow-up reminder alerts</span>
            </label>

            <div className="flex items-center gap-3">
              {savedNotice && (
                <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1E7E4E]">
                  <CheckCircle2 className="w-4 h-4" />
                  Settings saved
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Account & Backend Connection Card */}
      <div className="bg-[#FAFBF8] border border-[#EAECE6] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-[#153D32]" />
          </div>
          <div>
            <h2 className="font-sans text-[15px] font-semibold text-[#153D32]">
              {authenticatedUser
                ? `Signed in as ${authenticatedUser.email}`
                : 'Account Session & Cloud Sync'}
            </h2>
            <p className="text-[12.5px] text-[#25312C]/75 mt-1 leading-relaxed">
              {authenticatedUser
                ? 'Your discharge summaries, care plans, medications, reminders, and appointments are persisted to the FastAPI + MySQL backend.'
                : 'Sign in or create an account to upload discharge reports, run Gemini AI analysis, and save your care plans permanently.'}
            </p>
          </div>
        </div>
        {authenticatedUser ? (
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#F5C6CB] text-[#9B1C1C] bg-white hover:bg-[#FDF2F2] text-[12.5px] font-medium cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </div>
  );
};

export const AboutScreen: React.FC = () => (
  <div className="max-w-4xl space-y-5">
    <div className="bg-white border border-[#EAECE6] rounded-[20px] p-7 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
      <div className="flex items-center gap-4 mb-5">
        <ChikitsakLogoMark className="w-14 h-14" />
        <div>
          <h1 className="font-display text-[28px] font-semibold text-[#153D32]">
            CHIKITSAK <span className="font-hindi text-[22px]">• चिकित्सक</span>
          </h1>
          <p className="text-[14px] font-medium text-[#153D32]/80">
            Understand. Follow. Recover.
          </p>
        </div>
      </div>

      <p className="text-[14.5px] text-[#25312C]/85 leading-relaxed">
        CHIKITSAK is an AI-powered patient discharge and care management platform
        built for Indian patients and families. Hospital discharge summaries are
        often filled with clinical abbreviations that are hard to follow at home.
        CHIKITSAK pairs verbatim hospital records with clear, structured care
        plans, medicine schedules, bilingual English + Hindi guidance, and voice
        assistance.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#FAFBF8] border border-[#EAECE6] p-4">
          <div className="flex items-center gap-2 text-[#153D32] font-semibold text-[14px] mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Clinical Transparency</span>
          </div>
          <p className="text-[13px] text-[#25312C]/75 leading-relaxed">
            Original hospital discharge instructions are always kept separate and
            visibly labeled from simplified patient explanations.
          </p>
        </div>

        <div className="rounded-2xl bg-[#FAFBF8] border border-[#EAECE6] p-4">
          <div className="flex items-center gap-2 text-[#153D32] font-semibold text-[14px] mb-1.5">
            <HeartHandshake className="w-4 h-4" />
            <span>Family-First Accessibility</span>
          </div>
          <p className="text-[13px] text-[#25312C]/75 leading-relaxed">
            Designed with high-contrast forest green typography, printable fridge-ready
            care sheets, and Hindi/English audio narration for elders and caregivers.
          </p>
        </div>
      </div>
    </div>
  </div>
);
