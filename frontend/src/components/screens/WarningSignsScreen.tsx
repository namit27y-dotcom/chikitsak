import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { CarePlan, LanguageMode, ScreenId } from '../../types/chikitsak';
import { MedicalShieldIllustration } from '../BrandLogo';

interface WarningSignsScreenProps {
  activePlan: CarePlan | null;
  language: LanguageMode;
  emergencyContact: string;
  onNavigate: (screen: ScreenId) => void;
}

export const WarningSignsScreen: React.FC<WarningSignsScreenProps> = ({
  activePlan,
  language,
  emergencyContact,
  onNavigate,
}) => {
  const showEnglish = language === 'en' || language === 'bilingual';
  const showHindi = language === 'hi' || language === 'bilingual';

  if (!activePlan) {
    return (
      <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
        <AlertOctagon className="w-10 h-10 text-[#B83227]/60 mx-auto" />
        <h1 className="font-display text-[24px] font-semibold text-[#153D32]">
          Warning Signs &amp; Emergency Info
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 max-w-md mx-auto">
          No discharge care plan is currently loaded. In any medical emergency in
          India, please dial <strong>108</strong> or <strong>112</strong> immediately.
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
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#EAF1E7] via-[#F4F7F1] to-white border border-[#DCE9DC] rounded-[20px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MedicalShieldIllustration className="w-16 h-16 shrink-0" />
          <div>
            <h1 className="font-display text-[26px] font-semibold text-[#153D32]">
              Warning Signs &amp; Safety Guide
            </h1>
            <p className="text-[13.5px] text-[#25312C]/75 mt-0.5">
              Know when to seek immediate hospital care vs. routine doctor follow-up.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('care-plan')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#DCE9DC] text-[12.5px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/50 cursor-pointer shrink-0 self-start md:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Care Plan</span>
        </button>
      </div>

      {/* Urgent vs Monitor List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-3.5">
          {activePlan.warningSigns.map((ws) => {
            const isUrgent = ws.severity === 'urgent';
            return (
              <section
                key={ws.id}
                className={`rounded-[20px] p-5 border ${
                  isUrgent
                    ? 'bg-[#FDF4F3] border-[#F0C2BC]'
                    : 'bg-[#FDFBF4] border-[#EADCB8]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isUrgent
                        ? 'bg-[#FBE2DF] text-[#B83227]'
                        : 'bg-[#F8ECCB] text-[#9A6B16]'
                    }`}
                  >
                    {isUrgent ? (
                      <AlertOctagon className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {showEnglish && (
                        <h2 className="font-sans text-[16px] font-semibold text-[#25312C]">
                          {ws.title}
                        </h2>
                      )}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isUrgent
                            ? 'bg-[#B83227] text-white'
                            : 'bg-[#D7BE8A] text-[#0E3025]'
                        }`}
                      >
                        {isUrgent ? 'Seek Immediate Care' : 'Call Clinic'}
                      </span>
                    </div>

                    {showHindi && (
                      <p className="font-hindi text-[13.5px] font-semibold text-[#153D32] mt-1">
                        {ws.titleHindi}
                      </p>
                    )}

                    {showEnglish && (
                      <p className="text-[13px] text-[#25312C]/80 mt-2">
                        {ws.description}
                      </p>
                    )}
                    {showHindi && (
                      <p className="font-hindi text-[12.5px] text-[#25312C]/75 mt-1">
                        {ws.descriptionHindi}
                      </p>
                    )}

                    <div className="mt-3 pt-3 border-t border-black/8">
                      <p className="text-[12.5px] font-semibold text-[#153D32]">
                        Recommended Action: {ws.action}
                      </p>
                      {showHindi && (
                        <p className="font-hindi text-[12px] text-[#153D32]/85 mt-0.5">
                          {ws.actionHindi}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Emergency Support Column */}
        <div className="lg:col-span-4 space-y-4">
          <section className="bg-white border border-[#EAECE6] rounded-[20px] p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-5 h-5 text-[#153D32]" />
              <h2 className="font-sans text-[16px] font-semibold text-[#153D32]">
                Emergency Helplines
              </h2>
            </div>

            <div className="rounded-xl bg-[#FAFBF8] border border-[#EAECE6] p-3.5">
              <p className="text-[12px] text-[#25312C]/65">National Emergency (India)</p>
              <p className="text-[20px] font-bold text-[#B83227] tabular-nums mt-0.5">
                108 / 112
              </p>
            </div>

            <div className="rounded-xl bg-[#FAFBF8] border border-[#EAECE6] p-3.5">
              <p className="text-[12px] text-[#25312C]/65">Attending Physician</p>
              <p className="text-[14px] font-semibold text-[#153D32] mt-0.5">
                {activePlan.doctorName}
              </p>
              <p className="text-[12px] text-[#25312C]/70">
                {activePlan.hospitalName}
              </p>
            </div>

            <div className="rounded-xl bg-[#FAFBF8] border border-[#EAECE6] p-3.5">
              <p className="text-[12px] text-[#25312C]/65">Family Contact</p>
              <p className="text-[13.5px] font-medium text-[#153D32] mt-0.5">
                {emergencyContact}
              </p>
            </div>
          </section>

          <section className="bg-[#EAF1E7] border border-[#DCE9DC] rounded-[20px] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#153D32]" />
              <h3 className="text-[14.5px] font-semibold text-[#153D32]">
                Normal Recovery Signs
              </h3>
            </div>
            <p className="text-[12.5px] text-[#25312C]/80 leading-relaxed">
              Mild fatigue for 3–5 days after discharge and slight afternoon tiredness
              are normal while your body recovers. Rest well and stay hydrated.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
