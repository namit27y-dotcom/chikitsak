import React, { useState } from 'react';
import { AlertCircle, Loader2, Lock, Mail, User, X } from 'lucide-react';
import { authApi, BackendUser } from '../services/api/carePlanService';
import { ApiError, isBackendConfigured } from '../services/api/apiClient';
import { ChikitsakLogoMark } from './BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  contextMessage?: string;
  onClose: () => void;
  onSuccess: (user: BackendUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  contextMessage,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const backendConfigured = isBackendConfigured();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await authApi.login({ email: email.trim(), password });
        onSuccess(res.user);
      } else {
        const res = await authApi.register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          preferred_language: 'bilingual',
          age: age ? Number(age) : undefined,
          blood_group: bloodGroup.trim() || undefined,
        });
        onSuccess(res.user);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to complete authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0E3025]/45 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'login' ? 'Sign In to CHIKITSAK' : 'Create CHIKITSAK Account'}
    >
      <div className="w-full max-w-md bg-white border border-[#DCE9DC] rounded-[24px] p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 p-2 rounded-full text-[#25312C]/60 hover:bg-[#EAF1E7] hover:text-[#153D32] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <ChikitsakLogoMark className="w-10 h-10 shrink-0" />
          <div>
            <h2 className="font-display text-[22px] font-semibold text-[#153D32] leading-tight">
              {mode === 'login' ? 'Sign In to CHIKITSAK' : 'Create Patient Account'}
            </h2>
            <p className="text-[12.5px] text-[#25312C]/70">
              Securely save care plans, medicines &amp; reminders
            </p>
          </div>
        </div>

        {!backendConfigured && (
          <div className="mb-4 rounded-xl bg-[#FDFBF4] border border-[#E6D9B8] px-3.5 py-2.5 text-[12.5px] text-[#25312C]">
            <strong className="text-[#153D32]">Backend API not configured:</strong>{' '}
            Set <code className="px-1 py-0.5 rounded bg-[#F5F6F1]">VITE_API_BASE_URL</code> to
            your FastAPI <code className="px-1 py-0.5 rounded bg-[#F5F6F1]">/api/v1</code> URL to
            enable sign-in and report uploads. Demo mode remains usable offline.
          </div>
        )}

        {contextMessage && (
          <div className="mb-4 rounded-xl bg-[#F7F4EA] border border-[#E5DEC9] px-3.5 py-2.5 text-[12.5px] text-[#25312C]">
            {contextMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-1.5 bg-[#FAFBF8] border border-[#EAECE6] rounded-full p-1 mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-1.5 rounded-full text-[12.5px] font-medium cursor-pointer ${
              mode === 'login'
                ? 'bg-[#153D32] text-white'
                : 'text-[#25312C]/70 hover:text-[#153D32]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-1.5 rounded-full text-[12.5px] font-medium cursor-pointer ${
              mode === 'register'
                ? 'bg-[#153D32] text-white'
                : 'text-[#25312C]/70 hover:text-[#153D32]'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-[#FDF2F2] border border-[#F5C6CB] px-3.5 py-2.5 flex items-start gap-2 text-[12.5px] text-[#9B1C1C]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-[#153D32] mb-1">
                  Patient Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#25312C]/45 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aashish Yadav"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#153D32] mb-1">
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={130}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 58"
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#153D32] mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="e.g. B+"
                    className="w-full px-3 py-2 rounded-xl border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#25312C]/45 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#153D32] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#25312C]/45 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={mode === 'register' ? 8 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Enter password'}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DCE9DC] text-[13.5px] focus:outline-none focus:border-[#153D32]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full bg-[#153D32] hover:bg-[#0E3025] disabled:bg-[#8FA69C] text-white text-[13.5px] font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
