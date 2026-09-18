import React, { useState } from 'react';
import {
  Globe,
  Bell,
  Lock,
  Smartphone,
  Check,
  X,
  RotateCcw,
  CheckCircle,
  Sliders,
} from 'lucide-react';
import { store } from '../services/store';
import { Language } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number>(
    store.pickupPoints[0]?.geofenceRadiusMeters || 500
  );
  const [driverPin, setDriverPin] = useState(store.driverPin);
  const [adminPass, setAdminPass] = useState(store.adminPassword);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleLanguageChange = (newLang: Language) => {
    store.setLanguage(newLang);
    showToast(newLang === 'te' ? 'భాష తెలుగుకి మార్చబడింది' : 'Language set to English');
  };

  const handleRadiusChange = (radius: number) => {
    setSelectedRadius(radius);
    store.updateGeofenceRadius(radius);
    showToast(
      lang === 'te'
        ? `జీయోఫెన్స్ పరిధి ${radius} మీటర్లకు మార్చబడింది`
        : `Geofence radius set to ${radius}m`
    );
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverPin.trim().length >= 4) {
      store.updateDriverPin(driverPin.trim());
    }
    if (adminPass.trim().length >= 4) {
      store.updateAdminPassword(adminPass.trim());
    }
    showToast(lang === 'te' ? 'భద్రతా వివరాలు భద్రపరచబడ్డాయి' : 'Security credentials saved');
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        lang === 'te'
          ? 'అన్ని సెట్టింగ్స్‌ను డిఫాల్ట్ స్థితికి మార్చాలా?'
          : 'Reset all application settings to factory default?'
      )
    ) {
      store.resetAllToDefault();
      setSelectedRadius(500);
      setDriverPin('1234');
      setAdminPass('admin@123');
      showToast(lang === 'te' ? 'డిఫాల్ట్ స్థితికి రీసెట్ చేయబడింది' : 'Reset to default successfully');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#E2E7FF] flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-[#00236F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {lang === 'te' ? 'యాప్ సెట్టింగ్స్' : 'Application Settings'}
              </h3>
              <p className="text-[11px] text-white/80">
                {lang === 'te' ? 'భాష, భద్రత మరియు జీపీఎస్ అమరికలు' : 'Language, alerts & security'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="bg-[#004A31] text-white px-4 py-2 text-xs font-bold flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4 text-[#4EDEA3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-4 overflow-y-auto space-y-5">
          {/* 1. Language Selection (Single source of truth) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00236F]" />
              <label className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                {lang === 'te' ? 'యాప్ భాష (Language)' : 'Application Language'}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleLanguageChange('te')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  lang === 'te'
                    ? 'bg-[#EAEDFF] border-[#00236F] text-[#00236F] ring-2 ring-[#00236F]/20 font-bold'
                    : 'bg-[#FAF8FF] border-[#E2E7FF] text-[#444651] hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="text-sm font-black">తెలుగు</div>
                  <div className="text-[10px] opacity-75">Telugu Interface</div>
                </div>
                {lang === 'te' && (
                  <div className="w-6 h-6 rounded-full bg-[#00236F] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  lang === 'en'
                    ? 'bg-[#EAEDFF] border-[#00236F] text-[#00236F] ring-2 ring-[#00236F]/20 font-bold'
                    : 'bg-[#FAF8FF] border-[#E2E7FF] text-[#444651] hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="text-sm font-black">English</div>
                  <div className="text-[10px] opacity-75">English Interface</div>
                </div>
                {lang === 'en' && (
                  <div className="w-6 h-6 rounded-full bg-[#00236F] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* 2. Geofence Proximity Perimeter */}
          <div className="space-y-2 pt-1 border-t border-[#E2E7FF]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#855300]" />
                <label className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                  {lang === 'te' ? 'జీయోఫెన్స్ హెచ్చరిక దూరం' : 'Geofence Proximity Alert'}
                </label>
              </div>
              <span className="text-xs font-black text-[#00236F] bg-[#EAEDFF] px-2 py-0.5 rounded-full">
                {selectedRadius}m
              </span>
            </div>
            <p className="text-[11px] text-[#444651]">
              {lang === 'te'
                ? 'బస్సు మీ స్టాప్‌కి ఎంత దూరంలోకి వచ్చినప్పుడు మొబైల్ నోటిఫికేషన్ రావాలి?'
                : 'Alert when bus approaches within this radius from your stop.'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[300, 500, 1000].map((radius) => (
                <button
                  key={radius}
                  type="button"
                  onClick={() => handleRadiusChange(radius)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedRadius === radius
                      ? 'bg-[#00236F] text-white border-[#00236F] shadow-xs'
                      : 'bg-[#FAF8FF] border-[#E2E7FF] text-[#444651] hover:bg-gray-50'
                  }`}
                >
                  {radius} m
                </button>
              ))}
            </div>
          </div>

          {/* 3. Security PIN / Password Settings */}
          <form onSubmit={handleSaveSecurity} className="space-y-2.5 pt-1 border-t border-[#E2E7FF]">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#BA1A1A]" />
              <label className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                {lang === 'te' ? 'సిబ్బంది పిన్ & పాస్‌వర్డ్' : 'Staff Security Credentials'}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-[#444651] font-semibold block mb-1">
                  {lang === 'te' ? 'డ్రైవర్ సెక్యూరిటీ పిన్' : 'Driver PIN (4 Digits)'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={driverPin}
                  onChange={(e) => setDriverPin(e.target.value)}
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-[#131B2E]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#444651] font-semibold block mb-1">
                  {lang === 'te' ? 'అడ్మిన్ పాస్‌వర్డ్' : 'Admin Password'}
                </label>
                <input
                  type="text"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#131B2E]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#00236F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#001b57] transition-colors"
            >
              {lang === 'te' ? 'పిన్ / పాస్‌వర్డ్ సేవ్ చేయి' : 'Save Security Credentials'}
            </button>
          </form>

          {/* 4. Telematics & Hardware Status */}
          <div className="space-y-2 pt-1 border-t border-[#E2E7FF]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#004A31]" />
              <label className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
                {lang === 'te' ? 'లైవ్ టెలిమెట్రిక్స్ & క్లౌడ్ సింక్' : 'Telematics & Cloud Engine'}
              </label>
            </div>
            <div className="bg-[#F2F3FF] rounded-2xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#444651]">{lang === 'te' ? 'క్లౌడ్ సర్వర్' : 'Cloud Server'}:</span>
                <span className="font-bold text-[#004A31] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#004A31] animate-pulse" />
                  Firebase RTDB (Online)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#444651]">{lang === 'te' ? 'స్క్రీన్ వేక్-లాక్' : 'Screen Wake-Lock'}:</span>
                <span className="font-bold text-[#00236F]">
                  {lang === 'te' ? 'సహాయక (Supported)' : 'Supported'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#444651]">{lang === 'te' ? 'పాఠశాల' : 'Campus'}:</span>
                <span className="font-bold text-[#131B2E]">Sri Chaitanya • Ghanpur</span>
              </div>
            </div>
          </div>

          {/* 5. Reset to Default */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'te' ? 'డిఫాల్ట్ స్థితికి రీసెట్ చేయి' : 'Reset All to Factory Defaults'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF8FF] border-t border-[#E2E7FF] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#00236F] text-white font-bold text-xs shadow-xs hover:bg-[#001b57] transition-colors"
          >
            {lang === 'te' ? 'పూర్తయింది' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
