import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Bell,
  ChevronDown,
  FileText,
  Globe,
  LogIn,
  LogOut,
  Pill,
  Printer,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import {
  CarePlan,
  LanguageMode,
  NotificationItem,
  PatientProfile,
  ScreenId,
} from '../types/chikitsak';
import { BackendUser } from '../services/api/carePlanService';

import userAvatarImg from '../assets/images/user_avatar_aashish_1795710976489.jpg';
import { ChikitsakMobileMark } from './BrandLogo';

interface TopBarProps {
  activeScreen: ScreenId;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  carePlans: CarePlan[];
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onNavigate: (screen: ScreenId, planId?: string) => void;
  profile: PatientProfile;
  onLanguageChange: (lang: LanguageMode) => void;
  authenticatedUser: BackendUser | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  searchQuery,
  onSearchChange,
  carePlans,
  notifications,
  onMarkAllNotificationsRead,
  onNavigate,
  profile,
  onLanguageChange,
  authenticatedUser,
  onOpenAuth,
  onSignOut,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: {
      id: string;
      kind: 'Care Plan' | 'Medicine';
      title: string;
      subtitle: string;
      screen: ScreenId;
      planId?: string;
    }[] = [];

    for (const plan of carePlans) {
      if (
        plan.title.toLowerCase().includes(q) ||
        plan.diagnosisSimple.toLowerCase().includes(q) ||
        plan.doctorName.toLowerCase().includes(q)
      ) {
        results.push({
          id: plan.id,
          kind: 'Care Plan',
          title: plan.title,
          subtitle: `${plan.diagnosisSimple} • ${plan.createdAt}`,
          screen: 'care-plan',
          planId: plan.id,
        });
      }
      for (const med of plan.medicines) {
        if (
          med.name.toLowerCase().includes(q) ||
          med.period.toLowerCase().includes(q) ||
          med.purpose.toLowerCase().includes(q)
        ) {
          results.push({
            id: `${plan.id}-${med.id}`,
            kind: 'Medicine',
            title: `${med.name} (${med.dosage})`,
            subtitle: `${med.period} • ${med.time} — ${med.timingNote}`,
            screen: 'medicines',
          });
        }
      }
    }
    return results.slice(0, 6);
  }, [searchQuery, carePlans]);

  const tabletQuickTabs: { id: ScreenId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'upload', label: 'Upload' },
    { id: 'care-plans', label: 'Care Plans' },
    { id: 'medicines', label: 'Medicines' },
    { id: 'reminders', label: 'Reminders' },
    { id: 'voice', label: 'Voice' },
  ];

  return (
    <header className="no-print hidden md:flex flex-col sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#EAECE6]">
      <div className="flex items-center justify-between gap-4 px-5 lg:px-8 py-3.5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Compact Brand for Tablet (hidden on Desktop where Sidebar shows it) */}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex lg:hidden items-center gap-2 shrink-0 cursor-pointer"
          >
            <ChikitsakMobileMark className="w-8 h-8" />
            <div className="leading-none text-left">
              <span className="block text-[15px] font-bold tracking-[0.04em] text-[#153D32]">
                CHIKITSAK
              </span>
              <span className="block font-hindi text-[10.5px] text-[#25312C]/75">
                चिकित्सक
              </span>
            </div>
          </button>

          {/* Search Bar */}
          <div ref={searchRef} className="relative w-full max-w-[420px]">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F5F6F1] border border-[#E5E8DE] focus-within:border-[#153D32]/40 focus-within:bg-white transition-colors">
          <Search className="w-4 h-4 text-[#25312C]/50 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search for reports, medicines..."
            aria-label="Search for reports and medicines"
            className="w-full bg-transparent text-[13.5px] text-[#25312C] placeholder:text-[#25312C]/45 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-[#25312C]/45 hover:text-[#153D32] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live search results popover */}
        {searchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-[#E5E8DE] shadow-lg z-40 overflow-hidden">
            {searchResults.length === 0 ? (
              <div className="px-4 py-4 text-[13px] text-[#25312C]/65">
                No reports or medicines matched “{searchQuery}”.
              </div>
            ) : (
              <div className="py-1.5 divide-y divide-[#F1F3EC]">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSearchFocused(false);
                      onNavigate(item.screen, item.planId);
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-[#EAF1E7]/50 flex items-start gap-3 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EAF1E7] flex items-center justify-center shrink-0 mt-0.5">
                      {item.kind === 'Care Plan' ? (
                        <FileText className="w-4 h-4 text-[#153D32]" />
                      ) : (
                        <Pill className="w-4 h-4 text-[#153D32]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-[#153D32] truncate">
                        {item.title}
                      </p>
                      <p className="text-[12px] text-[#25312C]/65 truncate">
                        {item.kind} • {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
        </div>

      {/* Right Notification & User Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full hover:bg-[#EAF1E7]/70 flex items-center justify-center text-[#25312C]/80 transition-colors cursor-pointer"
          >
            <Bell className="w-[19px] h-[19px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#E15241] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-[#E5E8DE] shadow-xl z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F1F3EC] flex items-center justify-between">
                <span className="text-[13.5px] font-semibold text-[#153D32]">
                  Care Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="text-[12px] font-medium text-[#153D32] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#F1F3EC] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setNotifOpen(false);
                      onNavigate(n.targetScreen);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-[#EAF1E7]/50 transition-colors cursor-pointer ${
                      n.unread ? 'bg-[#FAFBF7]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[#153D32]">
                        {n.title}
                      </span>
                      <span className="text-[11px] text-[#25312C]/55 shrink-0">
                        {n.timeLabel}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#25312C]/70 mt-0.5">
                      {n.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-[#F5F6F1] transition-colors cursor-pointer"
          >
            {avatarError ? (
              <span className="w-8 h-8 rounded-full bg-[#153D32] text-white text-[12px] font-semibold flex items-center justify-center shrink-0">
                {profile.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
            ) : (
              <img
                src={userAvatarImg}
                alt={profile.name}
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-8 h-8 rounded-full object-cover border border-[#DCE9DC]"
              />
            )}
            <span className="text-[13.5px] font-medium text-[#25312C] whitespace-nowrap">
              {profile.name}
            </span>
            <ChevronDown className="w-4 h-4 text-[#25312C]/60" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-[#E5E8DE] shadow-xl z-40 py-2">
              <div className="px-4 py-2 border-b border-[#F1F3EC]">
                <p className="text-[13.5px] font-semibold text-[#153D32]">
                  {profile.name}
                </p>
                <p className="text-[11.5px] text-[#25312C]/60">
                  Blood Group {profile.bloodGroup} • Age {profile.age}
                </p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#25312C] hover:bg-[#EAF1E7]/60 flex items-center gap-2.5 cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#153D32]" />
                  <span>Patient Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('print');
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#25312C] hover:bg-[#EAF1E7]/60 flex items-center gap-2.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#153D32]" />
                  <span>Printable Care Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLanguageChange(
                      profile.preferredLanguage === 'bilingual' ? 'en' : 'bilingual'
                    );
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#25312C] hover:bg-[#EAF1E7]/60 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-[#153D32]" />
                    <span>Language</span>
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#153D32]">
                    {profile.preferredLanguage === 'hi'
                      ? 'हिन्दी'
                      : profile.preferredLanguage === 'bilingual'
                      ? 'EN + HI'
                      : 'English'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#25312C] hover:bg-[#EAF1E7]/60 flex items-center gap-2.5 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#153D32]" />
                  <span>Settings</span>
                </button>
                <div className="my-1 border-t border-[#F1F3EC]" />
                {authenticatedUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] text-[#9B1C1C] hover:bg-[#FDF2F2] flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onOpenAuth('login');
                    }}
                    className="w-full px-4 py-2 text-left text-[13px] font-medium text-[#153D32] hover:bg-[#EAF1E7]/60 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-[#153D32]" />
                    <span>Sign In / Register</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Tablet Compact Navigation Bar (768px - 1023px) */}
      <nav
        aria-label="Tablet Navigation"
        className="flex lg:hidden items-center gap-1.5 px-5 py-2 border-t border-[#F1F3EC] bg-[#FAFBF8] overflow-x-auto"
      >
        {tabletQuickTabs.map((tab) => {
          const isActive =
            activeScreen === tab.id ||
            (tab.id === 'care-plans' && activeScreen === 'care-plan');
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#153D32] text-white'
                  : 'text-[#25312C]/80 hover:bg-[#EAF1E7] hover:text-[#153D32]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
