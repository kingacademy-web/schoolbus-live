import React from 'react';
import { Home, MapPin, Bell, User, Car as SteeringWheel, School, LogOut } from 'lucide-react';
import { Language, UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

export type NavTab = 'home' | 'live' | 'alerts' | 'profile' | 'driver_portal' | 'admin_fleet';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  role: UserRole;
  unreadAlerts: number;
  onLogout?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  lang,
  role,
  unreadAlerts,
  onLogout,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-t border-[#E2E7FF] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {/* TAB 1: Home (for Parent) OR Driver Console / Admin Fleet (for Staff) */}
        {role === 'PARENT' ? (
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
        ) : role === 'DRIVER' ? (
          <button
            type="button"
            onClick={() => onSelectTab('driver_portal')}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
              currentTab === 'driver_portal'
                ? 'text-[#00236F] font-bold'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                currentTab === 'driver_portal' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
              }`}
            >
              <SteeringWheel className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight text-center font-bold">
              {getTranslation(lang, 'navDriver')}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelectTab('admin_fleet')}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 ${
              currentTab === 'admin_fleet'
                ? 'text-[#00236F] font-bold'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-7 rounded-full transition-colors ${
                currentTab === 'admin_fleet' ? 'bg-[#FFDDB8] text-[#2A1700]' : ''
              }`}
            >
              <School className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-tight text-center font-bold">
              {getTranslation(lang, 'navAdmin')}
            </span>
          </button>
        )}

        {/* TAB 2: Live Bus Map */}
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

        {/* TAB 3: Alerts */}
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

        {/* TAB 4: Profile / Settings */}
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

        {/* TAB 5: ONLY DISPLAYED FOR AUTHENTICATED STAFF (Driver / Admin) -> EXIT / LOGOUT */}
        {role !== 'PARENT' && (
          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all gap-1 text-red-600 hover:text-red-800 hover:bg-red-50"
            title={lang === 'te' ? 'లాగ్ అవుట్' : 'Exit Staff Mode'}
          >
            <div className="flex items-center justify-center w-10 h-7 rounded-full bg-red-100 text-red-700 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-tight text-center font-bold">
              {lang === 'te' ? 'నిష్క్రమించు' : 'Exit'}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};
