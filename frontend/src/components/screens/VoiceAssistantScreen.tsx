import React, { useState } from 'react';
import {
  AlertTriangle,
  AudioLines,
  Calendar,
  Pill,
  Send,
  Utensils,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CarePlan, LanguageMode } from '../../types/chikitsak';
import { isSpeechSupported, speakText, stopSpeaking } from '../../utils/speechHelper';

interface VoiceAssistantScreenProps {
  activePlan: CarePlan | null;
  language: LanguageMode;
  voiceRate: number;
  onLanguageChange: (lang: LanguageMode) => void;
}

interface GuideMessage {
  id: string;
  sender: 'patient' | 'assistant';
  textEn: string;
  textHi: string;
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({
  activePlan,
  language,
  voiceRate,
  onLanguageChange,
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<GuideMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      textEn: activePlan
        ? `Namaste! I am your CHIKITSAK care plan voice guide for "${activePlan.title}"${activePlan.isDemo ? ' (Demo Data)' : ''}. Tap any topic below to hear instructions aloud using your browser voice engine.`
        : 'Namaste! Upload a discharge summary first so I can read your medicines, diet, and follow-up instructions aloud.',
      textHi: activePlan
        ? `नमस्ते! मैं "${activePlan.titleHindi}" के लिए आपका चिकित्सक वॉइस गाइड हूं। निर्देश सुनने के लिए नीचे किसी भी विषय पर टैप करें।`
        : 'नमस्ते! कृपया पहले अपनी डिस्चार्ज रिपोर्ट अपलोड करें ताकि मैं आपकी दवाएं और निर्देश पढ़ सकूं।',
    },
  ]);

  const speechLang: 'en-IN' | 'hi-IN' = language === 'hi' ? 'hi-IN' : 'en-IN';
  const showHindi = language === 'hi' || language === 'bilingual';

  const speakMessage = (msg: GuideMessage) => {
    if (speakingId === msg.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    const spoken = language === 'hi' ? msg.textHi : msg.textEn;
    speakText(spoken, speechLang, voiceRate, {
      onStart: () => setSpeakingId(msg.id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  if (!activePlan) {
    return (
      <div className="bg-white border border-dashed border-[#DCE3D9] rounded-[20px] p-10 text-center space-y-3">
        <AudioLines className="w-10 h-10 text-[#153D32]/40 mx-auto" />
        <h1 className="font-display text-[24px] font-semibold text-[#153D32]">
          Voice Assistant Ready
        </h1>
        <p className="text-[13.5px] text-[#25312C]/70 max-w-md mx-auto">
          No active patient care plan is currently loaded. Upload a discharge summary
          or load the Demo Data sample to listen to bilingual instructions.
        </p>
      </div>
    );
  }

  const quickTopics = [
    {
      id: 'topic-meds',
      label: "Today's Medicines",
      icon: Pill,
      textEn: `Your medicines today: ${activePlan.medicines
        .map((m) => `${m.period} at ${m.time}, ${m.name} (${m.dosage}), ${m.timingNote}`)
        .join('. ')}.`,
      textHi: `आज की आपकी दवाएं: ${activePlan.medicines
        .map((m) => `${m.time} पर ${m.name}, ${m.timingNoteHindi}`)
        .join('। ')}।`,
    },
    {
      id: 'topic-diet',
      label: 'Diet & Lifestyle',
      icon: Utensils,
      textEn: `Diet and lifestyle guidance: ${activePlan.dietAndLifestyle.join(' ')}`,
      textHi: `खानपान और जीवनशैली सलाह: ${activePlan.dietAndLifestyleHindi.join(' ')}`,
    },
    {
      id: 'topic-warnings',
      label: 'Warning Signs',
      icon: AlertTriangle,
      textEn: `Please seek immediate medical help if you notice: ${activePlan.warningSigns
        .map((w) => w.title)
        .join(', ')}.`,
      textHi: `यदि इनमें से कोई लक्षण दिखे तो तुरंत डॉक्टर से संपर्क करें: ${activePlan.warningSigns
        .map((w) => w.titleHindi)
        .join(', ')}।`,
    },
    {
      id: 'topic-followup',
      label: 'Follow-up Date',
      icon: Calendar,
      textEn: `Your next follow-up visit is scheduled on ${activePlan.followUpDate} with ${activePlan.doctorName} at ${activePlan.hospitalName}.`,
      textHi: `आपकी अगली जांच ${activePlan.followUpDate} को ${activePlan.doctorName} के साथ निर्धारित है।`,
    },
  ];

  const handleTopicClick = (topic: (typeof quickTopics)[number]) => {
    const assistantMsg: GuideMessage = {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      textEn: topic.textEn,
      textHi: topic.textHi,
    };
    setMessages((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        sender: 'patient',
        textEn: topic.label,
        textHi: topic.label,
      },
      assistantMsg,
    ]);
    speakMessage(assistantMsg);
  };

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    const lower = q.toLowerCase();
    let answerEn = '';
    let answerHi = '';

    if (lower.includes('med') || lower.includes('tablet') || lower.includes('dose') || lower.includes('दवा')) {
      answerEn = quickTopics[0].textEn;
      answerHi = quickTopics[0].textHi;
    } else if (lower.includes('diet') || lower.includes('food') || lower.includes('eat') || lower.includes('खान')) {
      answerEn = quickTopics[1].textEn;
      answerHi = quickTopics[1].textHi;
    } else if (lower.includes('warn') || lower.includes('pain') || lower.includes('emergency') || lower.includes('दर्द')) {
      answerEn = quickTopics[2].textEn;
      answerHi = quickTopics[2].textHi;
    } else if (lower.includes('follow') || lower.includes('doctor') || lower.includes('date') || lower.includes('डॉक्टर')) {
      answerEn = quickTopics[3].textEn;
      answerHi = quickTopics[3].textHi;
    } else {
      answerEn = `From your verified ${activePlan.title}: ${activePlan.simplifiedSummary} For custom medical questions outside this summary, please consult ${activePlan.doctorName} or connect the FastAPI Gemini AI service.`;
      answerHi = `आपकी प्रमाणित ${activePlan.titleHindi} से: ${activePlan.simplifiedSummaryHindi} अतिरिक्त चिकित्सीय प्रश्नों के लिए कृपया ${activePlan.doctorName} से परामर्श करें।`;
    }

    const userMsg: GuideMessage = {
      id: `u-${Date.now()}`,
      sender: 'patient',
      textEn: q,
      textHi: q,
    };
    const replyMsg: GuideMessage = {
      id: `a-${Date.now() + 1}`,
      sender: 'assistant',
      textEn: answerEn,
      textHi: answerHi,
    };

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setQuestion('');
    speakMessage(replyMsg);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
            <AudioLines className="w-6 h-6 text-[#153D32]" />
          </div>
          <div>
            <h1 className="font-display text-[25px] font-semibold text-[#153D32]">
              Voice Assistant
            </h1>
            <p className="text-[13px] text-[#25312C]/70">
              Audio guidance over your verified Care Plan in English &amp; Hindi
            </p>
          </div>
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
              className={`px-3 py-1 rounded-full text-[12px] font-medium cursor-pointer ${
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

      {/* Quick Speak Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleTopicClick(topic)}
              className="bg-white hover:bg-[#EAF1E7]/50 border border-[#EAECE6] rounded-2xl p-4 flex items-center gap-3 text-left transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-[#153D32]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#153D32]">
                  {topic.label}
                </p>
                <p className="text-[11px] text-[#25312C]/60">Tap to listen</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Transcript & Interactive Prompt */}
      <div className="bg-white border border-[#EAECE6] rounded-[20px] p-5 flex flex-col gap-4 shadow-[0_1px_8px_rgba(21,61,50,0.03)]">
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === 'patient' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.sender === 'patient'
                    ? 'bg-[#153D32] text-white'
                    : 'bg-[#FAFBF8] border border-[#EAECE6] text-[#25312C]'
                }`}
              >
                <p className="text-[13.5px] leading-relaxed">{msg.textEn}</p>
                {showHindi && msg.sender === 'assistant' && (
                  <p className="font-hindi text-[13px] text-[#153D32]/90 mt-2 pt-2 border-t border-[#EAECE6] leading-relaxed">
                    {msg.textHi}
                  </p>
                )}

                {msg.sender === 'assistant' && isSpeechSupported() && (
                  <button
                    type="button"
                    onClick={() => speakMessage(msg)}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1E7] hover:bg-[#DCE9DC] text-[#153D32] text-[11.5px] font-medium cursor-pointer"
                  >
                    {speakingId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleAskSubmit}
          className="pt-3 border-t border-[#EAECE6] flex items-center gap-2.5"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your medicines, diet, warning signs, or follow-up..."
            className="flex-1 px-4 py-2.5 rounded-full bg-[#FAFBF8] border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[13px] font-medium cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
