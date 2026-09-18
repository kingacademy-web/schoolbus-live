import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  User,
  ShieldCheck,
  LogOut,
  Settings,
  Car as SteeringWheel,
  UserCheck,
  ChevronDown,
  Phone,
} from 'lucide-react';
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
  onOpenSettings: () => void;
  onOpenStaffLogin: (role: 'DRIVER' | 'ADMIN') => void;
  onEditProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  role,
  onOpenProfile,
  onOpenAlerts,
  unreadCount,
  gpsMode = store.gpsMode,
  onLogout,
  onOpenSettings,
  onOpenStaffLogin,
  onEditProfile,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const driver = store.getDriver();
  const student = store.getStudent();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#FAF8FF]/95 backdrop-blur-xl border-b border-[#E2E7FF] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-18 flex items-center justify-between gap-2">
        {/* Logo & Full School Branding */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white shadow-xs shrink-0 overflow-hidden border border-[#E2E7FF] p-0.5 flex items-center justify-center">
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
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-[#131B2E] leading-snug">
                {lang === 'te' ? store.schoolInfo.nameTe : store.schoolInfo.name}
              </h1>

              {/* Active Role Indicator Badge */}
              {role === 'PARENT' ? (
                <span className="hidden xs:inline-flex items-center gap-1 bg-[#EAEDFF] text-[#00236F] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{lang === 'te' ? 'తల్లిదండ్రులు' : 'Parent'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#FFDDB8] text-[#2A1700] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0">
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
              )}
            </div>
            {/* Full Campus & Location Address Line */}
            <span className="text-[10px] sm:text-[11px] text-[#444651] font-medium leading-tight">
              {lang === 'te'
                ? 'స్టేషన్ ఘన్‌పూర్, జనగాం • లైవ్ ట్రాకింగ్'
                : 'Ghanpur (Stn), Jangaon • TG - 506143'}
            </span>
          </div>
        </div>

        {/* Action Controls: Notifications Bell & Profile Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative" ref={dropdownRef}>
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

          {/* User Profile Trigger Button */}
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full transition-all active:scale-95 ${
              role === 'PARENT'
                ? 'bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F]'
                : 'bg-[#00236F] hover:bg-[#001b57] text-white shadow-xs'
            }`}
            aria-label="User Profile and Login Menu"
            aria-expanded={dropdownOpen}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                role === 'PARENT'
                  ? 'bg-[#00236F] text-white'
                  : 'bg-[#FEA619] text-[#2A1700]'
              }`}
            >
              {role === 'PARENT' ? (
                <User className="w-3.5 h-3.5" />
              ) : role === 'DRIVER' ? (
                <SteeringWheel className="w-3.5 h-3.5" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
            </div>
            <span className="text-xs font-bold hidden sm:inline-block">
              {role === 'PARENT'
                ? lang === 'te'
                  ? 'ఖాతా / లాగిన్'
                  : 'Account'
                : role === 'DRIVER'
                ? lang === 'te'
                  ? 'రవి కుమార్'
                  : 'Driver'
                : lang === 'te'
                ? 'అడ్మిన్'
                : 'Admin'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile & Login Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-12 right-0 w-64 sm:w-72 bg-white rounded-2xl shadow-2xl border border-[#E2E7FF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[#131B2E]">
              {/* Profile Card Header */}
              <div className="px-4 py-3 bg-[#FAF8FF] border-b border-[#E2E7FF] -mt-2 rounded-t-2xl">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      role === 'PARENT'
                        ? 'bg-[#EAEDFF] text-[#00236F]'
                        : 'bg-[#00236F] text-white'
                    }`}
                  >
                    {role === 'PARENT' ? 'P' : role === 'DRIVER' ? 'D' : 'A'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-extrabold text-[#131B2E] truncate">
                      {role === 'PARENT'
                        ? lang === 'te'
                          ? 'తల్లిదండ్రుల ఖాతా (Parent)'
                          : 'Parent Account'
                        : role === 'DRIVER'
                        ? lang === 'te'
                          ? `${driver?.nameTe || 'రవి కుమార్'} (డ్రైవర్)`
                          : `${driver?.name || 'Ravi Kumar'} (Driver)`
                        : lang === 'te'
                        ? 'రవాణా నిర్వాహకులు (Admin)'
                        : 'Transport Administrator'}
                    </span>
                    <span className="text-[11px] text-[#444651] truncate">
                      {role === 'PARENT'
                        ? lang === 'te'
                          ? `విద్యార్థి: ${student?.nameTe || 'సాద్విక్'}`
                          : `Student: ${student?.name || 'A. Sadvik'}`
                        : role === 'DRIVER'
                        ? 'Bus #07 • Active Trip'
                        : 'Sri Chaitanya Fleet Control'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-1">
                {/* When NOT logged in as staff (Parent mode): show Login options */}
                {role === 'PARENT' ? (
                  <>
                    <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-[#444651]">
                      {lang === 'te' ? 'స్టాఫ్ లాగిన్ ఎంపికలు' : 'Staff Login Options'}
                    </div>

                    {/* Driver Login Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenStaffLogin('DRIVER');
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold hover:bg-[#EAEDFF] text-[#00236F] transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#DAE2FD] flex items-center justify-center shrink-0">
                        <SteeringWheel className="w-4 h-4 text-[#00236F]" />
                      </div>
                      <div className="flex flex-col">
                        <span>{lang === 'te' ? '🚍 డ్రైవర్ లాగిన్ (Driver Login)' : '🚍 Driver Login'}</span>
                        <span className="text-[10px] font-normal text-[#444651]">
                          {lang === 'te' ? 'ట్రిప్ ప్రారంభించు / లైవ్ GPS' : 'Start trip & live broadcast'}
                        </span>
                      </div>
                    </button>

                    {/* Admin Login Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenStaffLogin('ADMIN');
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold hover:bg-[#EAEDFF] text-[#00236F] transition-colors text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#DAE2FD] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4 text-[#00236F]" />
                      </div>
                      <div className="flex flex-col">
                        <span>{lang === 'te' ? '🛡️ అడ్మిన్ లాగిన్ (Admin Fleet)' : '🛡️ Admin Fleet Portal'}</span>
                        <span className="text-[10px] font-normal text-[#444651]">
                          {lang === 'te' ? 'బస్సుల నిర్వహణ & సెట్టింగ్స్' : 'Fleet control & settings'}
                        </span>
                      </div>
                    </button>

                    <div className="border-t border-[#E2E7FF] my-1" />

                    {/* Parent Profile Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenProfile();
                      }}
                      className="w-full px-4 py-2 flex items-center gap-3 text-xs font-bold hover:bg-[#F2F3FF] text-[#131B2E] transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-[#444651]" />
                      <span>{lang === 'te' ? 'విద్యార్థి వివరాలు (Student Info)' : 'Student Details'}</span>
                    </button>
                  </>
                ) : (
                  /* When LOGGED IN as Driver / Admin: show Edit Profile & Logout */
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        onEditProfile();
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold hover:bg-[#EAEDFF] text-[#00236F] transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-[#00236F]" />
                      <div className="flex flex-col">
                        <span>{lang === 'te' ? '✏️ ప్రొఫైల్ ఎడిట్ (Edit Profile)' : '✏️ Edit Profile'}</span>
                        <span className="text-[10px] font-normal text-[#444651]">
                          {lang === 'te' ? 'పేరు, ఫోన్ నంబర్, వివరాలు' : 'Name, phone & details'}
                        </span>
                      </div>
                    </button>

                    <div className="border-t border-[#E2E7FF] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold hover:bg-red-50 text-red-600 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <div className="flex flex-col">
                        <span>{lang === 'te' ? '🚪 లాగ్ అవుట్ (Logout)' : '🚪 Logout Staff Session'}</span>
                        <span className="text-[10px] font-normal text-red-500">
                          {lang === 'te' ? 'తల్లిదండ్రుల వ్యూకి తిరిగి వెళ్ళు' : 'Switch back to Parent view'}
                        </span>
                      </div>
                    </button>
                  </>
                )}

                {/* Common App Settings Item (Always accessible) */}
                <div className="border-t border-[#E2E7FF] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-bold hover:bg-[#F2F3FF] text-[#131B2E] transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#EAEDFF] flex items-center justify-center shrink-0">
                    <Settings className="w-4 h-4 text-[#00236F]" />
                  </div>
                  <div className="flex flex-col">
                    <span>{lang === 'te' ? '⚙️ యాప్ సెట్టింగ్స్ (Settings)' : '⚙️ App Settings'}</span>
                    <span className="text-[10px] font-normal text-[#444651]">
                      {lang === 'te' ? 'భాష (Language), అలర్ట్స్, పాస్‌వర్డ్' : 'Language, Geofence & Security'}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
