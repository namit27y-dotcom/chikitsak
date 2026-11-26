import React from 'react';
import {
  AudioLines,
  Bell,
  CalendarDays,
  CloudUpload,
  FileText,
  Headphones,
  Info,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { ScreenId } from '../types/chikitsak';
import { BotanicalWatermark, ChikitsakLogoMark } from './BrandLogo';

interface SidebarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadRemindersCount: number;
}

interface NavItemConfig {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  matchScreens?: ScreenId[];
  badgeCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeScreen,
  onNavigate,
  unreadRemindersCount,
}) => {
  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'upload',
      label: 'Upload Report',
      icon: CloudUpload,
      matchScreens: ['upload', 'processing'],
    },
    {
      id: 'care-plans',
      label: 'My Care Plans',
      icon: FileText,
      matchScreens: ['care-plans', 'care-plan', 'print', 'warnings', 'appointments'],
    },
    { id: 'medicines', label: 'Medicine Schedule', icon: CalendarDays },
    {
      id: 'reminders',
      label: 'Reminders',
      icon: Bell,
      badgeCount: unreadRemindersCount,
    },
    { id: 'voice', label: 'Voice Assistant', icon: AudioLines },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="no-print hidden lg:flex flex-col justify-between w-[250px] shrink-0 bg-white border-r border-[#EAECE6] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto relative select-none">
      {/* Subtle bottom-left botanical silhouette */}
      <BotanicalWatermark className="pointer-events-none absolute bottom-0 -left-4 w-40 h-40 opacity-65" />

      <div className="relative z-10 flex flex-col px-4 pt-5">
        {/* Brand Block */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center text-center mb-5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153D32] rounded-xl py-1"
        >
          <ChikitsakLogoMark className="w-11 h-11 transition-transform duration-200 group-hover:scale-105" />
          <span className="mt-1 text-[18px] font-bold tracking-[0.06em] text-[#153D32] leading-tight">
            CHIKITSAK
          </span>
          <span className="font-hindi text-[12.5px] font-medium text-[#25312C]/80 mt-0.5">
            चिकित्सक
          </span>
        </button>

        {/* Primary Nav */}
        <nav className="flex flex-col gap-1" aria-label="Primary Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeScreen === item.id ||
              (item.matchScreens?.includes(activeScreen) ?? false);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#153D32] ${
                  isActive
                    ? 'bg-[#153D32] text-white shadow-sm'
                    : 'text-[#25312C]/85 hover:bg-[#EAF1E7]/70 hover:text-[#153D32]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 ${
                      isActive ? 'text-white' : 'text-[#25312C]/70'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span
                    className={`ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold tabular-nums ${
                      isActive
                        ? 'bg-[#D7BE8A] text-[#0E3025]'
                        : 'bg-[#E15241] text-white'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Support Card & Powered By */}
      <div className="relative z-10 px-4 pb-4 pt-4 flex flex-col gap-3.5">
        <div className="rounded-2xl bg-[#EAF1E7] border border-[#DCE9DC] px-3.5 py-3.5 flex flex-col items-center text-center shadow-[0_2px_10px_rgba(21,61,50,0.04)]">
          <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs mb-2">
            <Headphones className="w-4 h-4 text-[#153D32]" />
          </div>
          <p className="text-[13.5px] font-semibold text-[#153D32]">Need Help?</p>
          <p className="text-[11.5px] text-[#25312C]/75 mt-0.5 leading-snug">
            Talk to our AI Assistant
          </p>
          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#153D32] hover:bg-[#0E3025] text-white text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>Start Chat</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10.5px] text-[#25312C]/55">Powered by</p>
          <p className="text-[12px] font-bold tracking-[0.06em] text-[#153D32] mt-0.5">
            CHIKITSAK
          </p>
        </div>
      </div>
    </aside>
  );
};
