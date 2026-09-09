import React from 'react';
import { Bus as BusIcon, Bell, Globe, User, ShieldCheck, LogOut } from 'lucide-react';
import { store } from '../services/store';
import { Language, UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

interface HeaderProps {
  lang: Language;
  role: UserRole;
  onOpenProfile: () => void;
  onOpenAlerts: () => void;
  unreadCount: number;
  gpsMode?: 'LIVE' | 'DEMO';
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  role,
  onOpenProfile,
  onOpenAlerts,
  unreadCount,
  gpsMode = store.gpsMode,
  onLogout,
}) => {
  const toggleGpsMode = () => {
    const nextMode = gpsMode === 'LIVE' ? 'DEMO' : 'LIVE';
    store.setGpsMode(nextMode);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'te' : 'en';
    store.setLanguage(nextLang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2E7FF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between gap-2">
        {/* Logo & School Branding */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-white shadow-xs shrink-0 overflow-hidden border border-[#E2E7FF] p-0.5 flex items-center justify-center">
            <img
              src="./school-logo.png"
              alt={store.schoolInfo.name}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#131B2E] truncate">
                {lang === 'te' ? store.schoolInfo.nameTe : store.schoolInfo.name}
              </span>

              {/* Role Indicator: Non-clickable for Parent; With Logout for Staff */}
              {role === 'PARENT' ? (
                <div className="inline-flex items-center gap-1 bg-[#EAEDFF] px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#00236F] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{lang === 'te' ? 'తల్లిదండ్రులు' : 'Parent'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <span className="inline-flex items-center gap-1 bg-[#FFDDB8] text-[#2A1700] px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>
                      {role === 'DRIVER'
                        ? lang === 'te'
                          ? 'డ్రైవర్'
                          : 'Driver'
                        : lang === 'te'
                        ? 'అడ్మిన్'
                        : 'Admin'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                    title={lang === 'te' ? 'లాగ్ అవుట్' : 'Exit Staff Session'}
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{lang === 'te' ? 'నిష్క్రమించు' : 'Exit'}</span>
                  </button>
                </div>
              )}

              {/* Mode Badge: LIVE vs DEMO */}
              <button
                type="button"
                onClick={toggleGpsMode}
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-2xs ${
                  gpsMode === 'LIVE'
                    ? 'bg-[#004A31] text-emerald-100 ring-1 ring-emerald-400/40'
                    : 'bg-amber-100 text-amber-900 ring-1 ring-amber-400/50'
                }`}
                title="Toggle between Real GPS and Simulation Demo mode"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    gpsMode === 'LIVE' ? 'bg-[#4EDEA3] animate-ping' : 'bg-amber-500'
                  }`}
                />
                <span>{gpsMode === 'LIVE' ? 'LIVE GPS' : 'DEMO'}</span>
              </button>
            </div>
            <span className="text-[10px] sm:text-[11px] text-[#444651] leading-none truncate">
              {lang === 'te' ? 'ఘన్‌పూర్ (స్టేషన్) • లైవ్ బస్ ట్రాకింగ్' : 'Ghanpur (Stn), Jangaon • Live GPS'}
            </span>
          </div>
        </div>

        {/* Action Controls: Language Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* High-Contrast Tactile Language Selector */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-9 px-2.5 rounded-full bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs border border-[#C5C5D3]/40"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#00236F]" />
            <span className="tracking-wide">{lang === 'en' ? 'EN | తెలుగు' : 'తెలుగు | EN'}</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#444651] hover:bg-[#EAEDFF] transition-colors active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#BA1A1A] ring-2 ring-[#FAF8FF]" />
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-8.5 h-8.5 rounded-full bg-[#00236F] text-white flex items-center justify-center shadow-xs active:scale-95 transition-transform"
            aria-label="User Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
