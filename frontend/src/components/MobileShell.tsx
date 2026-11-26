import React, { useState } from 'react';
import { Bell, FileText, Home, User } from 'lucide-react';
import { NotificationItem, ScreenId } from '../types/chikitsak';
import { ChikitsakMobileMark } from './BrandLogo';

interface MobileHeaderProps {
  unreadCount: number;
  notifications: NotificationItem[];
  onNavigate: (screen: ScreenId) => void;
  onMarkAllRead: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  unreadCount,
  notifications,
  onNavigate,
  onMarkAllRead,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#EAECE6] px-4 py-3 flex items-center justify-between">
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2.5 text-left cursor-pointer"
      >
        <ChikitsakMobileMark className="w-9 h-9 shrink-0" />
        <div className="leading-none">
          <span className="block text-[17px] font-bold tracking-[0.04em] text-[#153D32]">
            CHIKITSAK
          </span>
          <span className="block font-hindi text-[11.5px] font-medium text-[#25312C]/75 mt-0.5">
            चिकित्सक
          </span>
        </div>
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open notifications"
          className="relative w-10 h-10 rounded-full bg-[#FAFBF7] border border-[#EAECE6] flex items-center justify-center text-[#153D32]"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E15241] text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#E5E8DE] shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#F1F3EC] flex items-center justify-between">
              <span className="text-[13px] font-semibold text-[#153D32]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="text-[11.5px] text-[#153D32] font-medium"
                >
                  Mark read
                </button>
              )}
            </div>
            <div className="divide-y divide-[#F1F3EC]">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onNavigate(n.targetScreen);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#EAF1E7]/50"
                >
                  <p className="text-[12.5px] font-semibold text-[#153D32]">
                    {n.title}
                  </p>
                  <p className="text-[11.5px] text-[#25312C]/70 mt-0.5">
                    {n.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

interface MobileBottomNavProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadRemindersCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeScreen,
  onNavigate,
  unreadRemindersCount,
}) => {
  const tabs: {
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    match: ScreenId[];
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      match: ['dashboard', 'upload', 'processing', 'voice'],
    },
    {
      id: 'care-plans',
      label: 'Care Plans',
      icon: FileText,
      match: ['care-plans', 'care-plan', 'print', 'warnings', 'appointments'],
    },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      match: ['reminders', 'medicines'],
      badge: unreadRemindersCount,
    },
    {
      id: 'settings',
      label: 'Profile',
      icon: User,
      match: ['settings', 'about'],
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="no-print md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E8DE] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_16px_rgba(14,48,37,0.06)]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.match.includes(activeScreen);
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className={`relative flex flex-col items-center justify-center min-w-[68px] py-1 px-2 rounded-xl transition-colors cursor-pointer ${
              isActive
                ? 'text-[#153D32] font-semibold'
                : 'text-[#25312C]/60 hover:text-[#153D32]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#E15241] text-white text-[9.5px] font-bold flex items-center justify-center tabular-nums">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
