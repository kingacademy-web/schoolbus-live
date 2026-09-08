import React, { useState } from 'react';
import { Bus as BusIcon, Bell, Globe, User, ShieldCheck } from 'lucide-react';
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
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  role,
  onOpenProfile,
  onOpenAlerts,
  unreadCount,
  gpsMode = store.gpsMode,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const toggleGpsMode = () => {
    const nextMode = gpsMode === 'LIVE' ? 'DEMO' : 'LIVE';
    store.setGpsMode(nextMode);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'te' : 'en';
    store.setLanguage(nextLang);
  };

  const handleSelectRole = (newRole: UserRole) => {
    store.setRole(newRole);
    setRoleMenuOpen(false);
  };

  const roleLabel =
    role === 'PARENT'
      ? getTranslation(lang, 'parentTag')
      : role === 'DRIVER'
      ? getTranslation(lang, 'driverTag')
      : getTranslation(lang, 'adminTag');

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2E7FF] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between gap-2">
        {/* Logo & School Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#00236F] text-white flex items-center justify-center shadow-sm shrink-0">
            <BusIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#131B2E] truncate">
                {getTranslation(lang, 'appName')}
              </span>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="inline-flex items-center gap-1 bg-[#EAEDFF] hover:bg-[#DAE2FD] px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#4059AA] transition-colors"
                title="Click to switch role"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FEA619] animate-pulse" />
                <span>{roleLabel}</span>
              </button>

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
            <span className="text-[11px] text-[#444651] leading-none truncate">
              {getTranslation(lang, 'appSubtitle')}
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

      {/* Role Switcher Dropdown */}
      {roleMenuOpen && (
        <div className="absolute top-18 left-4 z-50 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E7FF] p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#757682] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00236F]" />
            <span>Select Active Persona</span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectRole('PARENT')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              role === 'PARENT' ? 'bg-[#EAEDFF] text-[#00236F]' : 'hover:bg-gray-50 text-[#131B2E]'
            }`}
          >
            <span>Parent (Sadvik Sharma)</span>
            {role === 'PARENT' && <span className="text-xs font-bold text-[#004A31]">Active</span>}
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole('DRIVER')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              role === 'DRIVER' ? 'bg-[#EAEDFF] text-[#00236F]' : 'hover:bg-gray-50 text-[#131B2E]'
            }`}
          >
            <span>Driver (Ravi Kumar - BUS-07)</span>
            {role === 'DRIVER' && <span className="text-xs font-bold text-[#004A31]">Active</span>}
          </button>
          <button
            type="button"
            onClick={() => handleSelectRole('ADMIN')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
              role === 'ADMIN' ? 'bg-[#EAEDFF] text-[#00236F]' : 'hover:bg-gray-50 text-[#131B2E]'
            }`}
          >
            <span>School Admin (Fleet Control)</span>
            {role === 'ADMIN' && <span className="text-xs font-bold text-[#004A31]">Active</span>}
          </button>
        </div>
      )}
    </header>
  );
};
