import React from 'react';
import { Home, MapPin, Bell, User, Car as SteeringWheel } from 'lucide-react';
import { Language, UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

export type NavTab = 'home' | 'live' | 'alerts' | 'profile' | 'driver_portal' | 'admin_fleet';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  role: UserRole;
  unreadAlerts: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
  role,
  unreadAlerts,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-t border-[#E2E7FF] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
            currentTab === 'home'
              ? 'text-[#00236F] font-bold'
              : 'text-[#444651] hover:text-[#131B2E]'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
              currentTab === 'home' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight text-center font-medium">
            {getTranslation(lang, 'navHome')}
          </span>
        </button>

        {/* Tab 2: Live Bus */}
        <button
          type="button"
          onClick={() => onSelectTab('live')}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
            currentTab === 'live'
              ? 'text-[#00236F] font-bold'
              : 'text-[#444651] hover:text-[#131B2E]'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
              currentTab === 'live' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight text-center font-medium">
            {getTranslation(lang, 'navLiveBus')}
          </span>
        </button>

        {/* Tab 3: Alerts */}
        <button
          type="button"
          onClick={() => onSelectTab('alerts')}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 relative ${
            currentTab === 'alerts'
              ? 'text-[#00236F] font-bold'
              : 'text-[#444651] hover:text-[#131B2E]'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors relative ${
              currentTab === 'alerts' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#FEA619] ring-2 ring-white" />
            )}
          </div>
          <span className="text-[11px] leading-tight text-center font-medium">
            {getTranslation(lang, 'navAlerts')}
          </span>
        </button>

        {/* Tab 4: Profile */}
        <button
          type="button"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
            currentTab === 'profile'
              ? 'text-[#00236F] font-bold'
              : 'text-[#444651] hover:text-[#131B2E]'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
              currentTab === 'profile' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight text-center font-medium">
            {getTranslation(lang, 'navProfile')}
          </span>
        </button>

        {/* Tab 5: Dynamic Role Portal (Driver Console or Admin Fleet) */}
        <button
          type="button"
          onClick={() => {
            if (role === 'ADMIN') {
              onSelectTab('admin_fleet');
            } else {
              onSelectTab('driver_portal');
            }
          }}
          className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
            currentTab === 'driver_portal' || currentTab === 'admin_fleet'
              ? 'text-[#00236F] font-bold'
              : 'text-[#444651] hover:text-[#131B2E]'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
              currentTab === 'driver_portal' || currentTab === 'admin_fleet'
                ? 'bg-[#FFDDB8] text-[#2A1700]'
                : ''
            }`}
          >
            <SteeringWheel className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight text-center font-medium">
            {role === 'ADMIN' ? getTranslation(lang, 'navAdmin') : getTranslation(lang, 'navDriver')}
          </span>
        </button>
      </div>
    </nav>
  );
};
