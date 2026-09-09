import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  X,
  CheckCircle,
  AlertCircle,
  Car as SteeringWheel,
  School,
  Delete,
} from 'lucide-react';
import { store } from '../services/store';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface StaffAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'DRIVER' | 'ADMIN';
  lang: Language;
  onSuccess: (role: 'DRIVER' | 'ADMIN') => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'DRIVER',
  lang,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'DRIVER' | 'ADMIN'>(initialRole);
  const [driverPin, setDriverPin] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialRole);
      setDriverPin('');
      setAdminPass('');
      setErrorMsg(null);
      setSuccess(false);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleKeypadPress = (digit: string) => {
    if (driverPin.length < 4) {
      const nextPin = driverPin + digit;
      setDriverPin(nextPin);
      setErrorMsg(null);

      // Auto-submit if 4 digits entered
      if (nextPin.length === 4) {
        verifyPinDirect(nextPin);
      }
    }
  };

  const handleKeypadDelete = () => {
    setDriverPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verifyPinDirect = (pinToTest: string) => {
    const ok = store.verifyDriverPin(pinToTest);
    if (ok) {
      setSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        onSuccess('DRIVER');
        onClose();
      }, 500);
    } else {
      setErrorMsg(
        lang === 'te'
          ? 'తప్పుడు డ్రైవర్ పిన్. డిఫాల్ట్ పిన్ 1234. దయచేసి మళ్లీ ప్రయత్నించండి.'
          : 'Incorrect PIN. Default PIN is 1234. Please try again.'
      );
      setDriverPin('');
    }
  };

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverPin.length < 4) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి 4-అంకెల పిన్ నమోదు చేయండి.'
          : 'Please enter a 4-digit PIN.'
      );
      return;
    }
    verifyPinDirect(driverPin);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPass.trim()) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి అడ్మిన్ పాస్‌వర్డ్ నమోదు చేయండి.'
          : 'Please enter the admin password.'
      );
      return;
    }

    const ok = store.verifyAdminPassword(adminPass);
    if (ok) {
      setSuccess(true);
      setErrorMsg(null);
      setTimeout(() => {
        onSuccess('ADMIN');
        onClose();
      }, 500);
    } else {
      setErrorMsg(
        lang === 'te'
          ? 'తప్పుడు పాస్‌వర్డ్. డిఫాల్ట్: admin@123 (లేదా స్కూల్ ఫోన్ 9951).'
          : 'Incorrect password. Default: admin@123 (or school phone 9951).'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 border border-[#E2E7FF]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#00236F] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#131B2E]">
                {getTranslation(lang, 'staffPortalTitle')}
              </h3>
              <p className="text-[11px] text-[#757682]">
                {lang === 'te' ? 'రక్షిత సిబ్బంది లాగిన్' : 'Protected Staff Authentication'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center hover:bg-[#DAE2FD] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Driver vs Admin */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F2F3FF] rounded-2xl border border-[#E2E7FF]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('DRIVER');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'DRIVER'
                ? 'bg-[#00236F] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            <SteeringWheel className="w-3.5 h-3.5" />
            <span>{lang === 'te' ? 'డ్రైవర్ పిన్' : 'Driver PIN'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-[#00236F] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>{lang === 'te' ? 'స్కూల్ అడ్మిన్' : 'Admin Pass'}</span>
          </button>
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 font-medium leading-tight">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Success Feedback */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-center gap-2 animate-in zoom-in-95 duration-150">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-xs text-emerald-800 font-bold">
              {getTranslation(lang, 'staffAuthSuccessToast')}
            </span>
          </div>
        )}

        {/* Tab 1: DRIVER PIN LOGIN */}
        {activeTab === 'DRIVER' && !success && (
          <form onSubmit={handleDriverSubmit} className="flex flex-col gap-3">
            <div className="text-center">
              <span className="text-xs font-bold text-[#131B2E] block">
                {lang === 'te' ? '4-అంకెల డ్రైవర్ సెక్యూరిటీ పిన్' : 'Enter 4-Digit Driver Security PIN'}
              </span>
              <span className="text-[11px] text-[#757682]">
                {lang === 'te' ? 'డిఫాల్ట్ పిన్: 1234' : 'Default PIN: 1234'}
              </span>
            </div>

            {/* PIN Indicator Dots / Digits */}
            <div className="flex items-center justify-center gap-3 my-1">
              {[0, 1, 2, 3].map((idx) => {
                const hasValue = driverPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-11 h-12 rounded-xl flex items-center justify-center text-lg font-mono font-black transition-all ${
                      hasValue
                        ? 'bg-[#00236F] text-white border-2 border-[#00236F] shadow-xs'
                        : 'bg-[#F2F3FF] border border-[#C5C5D3] text-[#757682]'
                    }`}
                  >
                    {hasValue ? '•' : ''}
                  </div>
                );
              })}
            </div>

            {/* On-screen Keypad for Rapid Tactile Entry */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-[#DAE2FD] active:scale-95 text-[#131B2E] font-extrabold text-base transition-all border border-[#E2E7FF] shadow-2xs cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDriverPin('');
                  setErrorMsg(null);
                }}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-gray-200 active:scale-95 text-[#757682] text-xs font-bold transition-all border border-[#E2E7FF] cursor-pointer"
              >
                {lang === 'te' ? 'క్లియర్' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-[#DAE2FD] active:scale-95 text-[#131B2E] font-extrabold text-base transition-all border border-[#E2E7FF] shadow-2xs cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleKeypadDelete}
                className="h-11 rounded-xl bg-[#F2F3FF] hover:bg-red-50 hover:text-red-600 active:scale-95 text-[#444651] flex items-center justify-center transition-all border border-[#E2E7FF] cursor-pointer"
                aria-label="Delete"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={driverPin.length < 4}
              className="w-full mt-2 bg-[#00236F] hover:bg-[#001c59] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{getTranslation(lang, 'submitAuth')}</span>
            </button>
          </form>
        )}

        {/* Tab 2: ADMIN PASSWORD LOGIN */}
        {activeTab === 'ADMIN' && !success && (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3">
            <div className="text-center">
              <span className="text-xs font-bold text-[#131B2E] block">
                {lang === 'te' ? 'పాఠశాల అడ్మిన్ పాస్‌వర్డ్ నమోదు చేయండి' : 'Enter Admin Management Password'}
              </span>
              <span className="text-[11px] text-[#757682]">
                {lang === 'te' ? 'డిఫాల్ట్: admin@123 (లేదా స్కూల్ ఫోన్ 9951)' : 'Default: admin@123 (or phone 9951)'}
              </span>
            </div>

            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={adminPass}
                onChange={(e) => {
                  setAdminPass(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="admin@123"
                className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3.5 py-3 text-sm font-mono font-bold focus:outline-[#00236F] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757682] hover:text-[#131B2E] cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 bg-[#00236F] hover:bg-[#001c59] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{getTranslation(lang, 'submitAuth')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs hover:bg-[#DAE2FD] cursor-pointer"
              >
                {getTranslation(lang, 'cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
