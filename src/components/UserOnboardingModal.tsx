import React, { useState } from 'react';
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle,
  AlertCircle,
  Car as SteeringWheel,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { store } from '../services/store';
import { Language } from '../types';

interface UserOnboardingModalProps {
  isOpen: boolean;
  lang: Language;
  onSuccess: (role: 'STUDENT' | 'DRIVER') => void;
}

export const UserOnboardingModal: React.FC<UserOnboardingModalProps> = ({
  isOpen,
  lang,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'REGISTER' | 'QUICK_LOGIN'>('REGISTER');
  const [role, setRole] = useState<'STUDENT' | 'DRIVER'>('STUDENT');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [areaVillage, setAreaVillage] = useState('స్టేషన్ ఘన్‌పూర్');
  const [loginMobile, setLoginMobile] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanMobile = mobile.replace(/\D/g, '');

    // Mandatory fields validation
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి (కనీసం 2 అక్షరాలు).'
          : 'Please enter your full name (minimum 2 characters).'
      );
      return;
    }

    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      store.registerUserProfile({
        role,
        name: cleanName,
        nameTe: cleanName,
        mobile: cleanMobile,
        dob: dob || undefined,
        idNumber: idNumber.trim() || undefined,
        areaVillage: areaVillage.trim() || undefined,
        registeredAt: Date.now(),
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(role);
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'రిజిస్ట్రేషన్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.');
    }
  };

  const handleQuickLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanMobile = loginMobile.replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg(
        lang === 'te'
          ? 'దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = store.loginWithMobile(cleanMobile);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess(result.isDriver ? 'DRIVER' : 'STUDENT');
    } else {
      setErrorMsg(
        result.message ||
          (lang === 'te'
            ? 'ఈ మొబైల్ నంబర్‌తో రికార్డు కనుగొనబడలేదు. దయచేసి రిజిస్టర్ అవ్వండి.'
            : 'No record found with this mobile number. Please register.')
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-[#E2E7FF] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* School Branding Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#00236F] to-[#00174A] text-white text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white p-1 shadow-md mb-2 flex items-center justify-center">
            <img
              src="./school-logo.png"
              alt="Sri Chaitanya School"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
            {lang === 'te' ? 'శ్రీ చైతన్య స్కూల్' : 'Sri Chaitanya School'}
          </h2>
          <p className="text-[11px] text-[#C5C5D3] font-medium">
            {lang === 'te'
              ? 'స్టేషన్ ఘన్‌పూర్, జనగాం • లైవ్ రవాణా పోర్టల్'
              : 'Station Ghanpur, Jangaon • Live Transport Portal'}
          </p>

          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-bold mt-2">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>
              {mode === 'REGISTER'
                ? lang === 'te'
                  ? 'మొదటి సారి ఒకే ఒక్క నమోదు (One-Time Setup)'
                  : 'One-Time Device Setup'
                : lang === 'te'
                ? 'మొబైల్ నంబర్ లాగిన్ (Quick Login)'
                : 'Mobile Number Login'}
            </span>
          </div>
        </div>

        {/* Tab Switcher: Register vs Quick Login */}
        <div className="grid grid-cols-2 p-1.5 bg-[#FAF8FF] border-b border-[#E2E7FF]">
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'REGISTER'
                ? 'bg-[#00236F] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            {lang === 'te' ? '1st Time నమోదు' : 'New Registration'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('QUICK_LOGIN');
              setErrorMsg(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              mode === 'QUICK_LOGIN'
                ? 'bg-[#00236F] text-white shadow-xs'
                : 'text-[#444651] hover:text-[#131B2E]'
            }`}
          >
            {lang === 'te' ? 'మొబైల్ లాగిన్' : 'Mobile Login'}
          </button>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mx-4 mt-3 bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span className="leading-tight font-medium">{errorMsg}</span>
          </div>
        )}

        {/* MODE 1: REGISTRATION FORM */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="p-4 sm:p-5 space-y-3.5">
            {/* 1. Role Selection Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {lang === 'te' ? 'మీరు ఎవరు? (Student / Driver) *' : 'Select Your Role *'}
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'STUDENT' | 'DRIVER')}
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#131B2E] focus:outline-[#00236F] appearance-none"
                >
                  <option value="STUDENT">
                    🎓 {lang === 'te' ? 'విద్యార్థి / తల్లిదండ్రులు (Student / Parent)' : 'Student / Parent'}
                  </option>
                  <option value="DRIVER">
                    🚍 {lang === 'te' ? 'స్కూల్ బస్సు డ్రైవర్ (School Bus Driver)' : 'School Bus Driver'}
                  </option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#444651]">
                  ▼
                </div>
              </div>
            </div>

            {/* 2. Full Name (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {role === 'STUDENT'
                  ? lang === 'te'
                    ? 'విద్యార్థి పూర్తి పేరు (Student Name) *'
                    : 'Student Full Name *'
                  : lang === 'te'
                  ? 'డ్రైవర్ పూర్తి పేరు (Driver Name) *'
                  : 'Driver Full Name *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    role === 'STUDENT'
                      ? lang === 'te'
                        ? 'ఉదా: ఎ. సాద్విక్ / అక్షయ'
                        : 'e.g. A. Sadvik'
                      : lang === 'te'
                      ? 'ఉదా: రవి కుమార్ / శ్రీనివాస్'
                      : 'e.g. Ravi Kumar'
                  }
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-[#131B2E] focus:outline-[#00236F]"
                />
                <User className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 3. Mobile Number (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {role === 'STUDENT'
                  ? lang === 'te'
                    ? 'తల్లిదండ్రుల మొబైల్ నంబర్ (Mobile) *'
                    : 'Parent Mobile Number *'
                  : lang === 'te'
                  ? 'డ్రైవర్ మొబైల్ నంబర్ (Mobile) *'
                  : 'Driver Mobile Number *'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 అంకెల మొబైల్ నంబర్ (e.g. 9951044459)"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono font-bold text-[#131B2E] focus:outline-[#00236F]"
                />
                <Phone className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[10px] text-[#757682] mt-0.5 block">
                {lang === 'te'
                  ? 'ఈ నంబర్‌తోనే భవిష్యత్తులో యాప్ నేరుగా ఓపెన్ అవుతుంది'
                  : 'Use this number to log in quickly without password in future'}
              </span>
            </div>

            {/* 4. Date of Birth (DOB) */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {lang === 'te' ? 'పుట్టిన తేదీ (Date of Birth / DOB)' : 'Date of Birth (DOB)'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#131B2E] focus:outline-[#00236F]"
                />
                <Calendar className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 5. Roll Number or ID Card Number */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {role === 'STUDENT'
                  ? lang === 'te'
                    ? 'రోల్ నంబర్ / స్టూడెంట్ ఐడీ (Roll / ID No)'
                    : 'Roll Number / Student ID'
                  : lang === 'te'
                  ? 'డ్రైవింగ్ లైసెన్స్ / ఐడీ నంబర్ (License / ID No)'
                  : 'Driving License / Staff ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder={
                    role === 'STUDENT'
                      ? lang === 'te'
                        ? 'ఉదా: Roll No. 24 / SC-882'
                        : 'e.g. Roll #24'
                      : 'e.g. DL-TG09201488219'
                  }
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#131B2E] focus:outline-[#00236F]"
                />
                <CreditCard className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 6. Area / Village Mention */}
            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {lang === 'te' ? 'ప్రాంతం లేదా గ్రామం (Area / Village)' : 'Area or Village'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={areaVillage}
                  onChange={(e) => setAreaVillage(e.target.value)}
                  placeholder="ఉదా: స్టేషన్ ఘన్‌పూర్, చిల్పూర్, రఘునాథపల్లి..."
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#131B2E] focus:outline-[#00236F]"
                />
                <MapPin className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-[#00236F] hover:bg-[#00174A] active:scale-[0.98] disabled:bg-gray-400 text-white font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {isSubmitting
                  ? lang === 'te'
                    ? 'భద్రపరుస్తోంది...'
                    : 'Saving...'
                  : lang === 'te'
                  ? 'వివరాలు భద్రపరచి యాప్ ప్రారంభించండి'
                  : 'Save Details & Launch App'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[10px] text-center text-[#757682] leading-tight">
              {lang === 'te'
                ? '🔒 మీ సమాచారం మీ ఫోన్‌లో భద్రపరచబడుతుంది. మళ్లీ ఎంటర్ చేయాల్సిన పనిలేదు.'
                : '🔒 Data saved locally on your phone. You will never need to enter it again.'}
            </p>
          </form>
        )}

        {/* MODE 2: QUICK MOBILE LOGIN FORM */}
        {mode === 'QUICK_LOGIN' && (
          <form onSubmit={handleQuickLoginSubmit} className="p-4 sm:p-5 space-y-4">
            <div className="bg-[#FAF8FF] p-3 rounded-2xl border border-[#E2E7FF] text-center">
              <span className="text-xs font-bold text-[#131B2E] block">
                {lang === 'te'
                  ? 'రిజిస్టర్ చేసుకున్న మొబైల్ నంబర్ నమోదు చేయండి'
                  : 'Enter Your Registered Mobile Number'}
              </span>
              <span className="text-[11px] text-[#757682] mt-0.5 block">
                {lang === 'te'
                  ? 'పాస్‌వర్డ్ అవసరం లేదు • తక్షణమే పోర్టల్ ఓపెన్ అవుతుంది'
                  : 'No password required • Opens your portal instantly'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131B2E] mb-1">
                {lang === 'te' ? 'మొబైల్ నంబర్ (10 Digits) *' : 'Mobile Number (10 Digits) *'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={loginMobile}
                  onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="ఉదా: 9951044459 లేదా 9951044469"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl pl-9 pr-3 py-3 text-sm font-mono font-bold text-[#131B2E] focus:outline-[#00236F]"
                />
                <Phone className="w-4 h-4 text-[#757682] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00236F] hover:bg-[#00174A] active:scale-[0.98] disabled:bg-gray-400 text-white font-extrabold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? lang === 'te'
                    ? 'ధృవీకరిస్తోంది...'
                    : 'Logging in...'
                  : lang === 'te'
                  ? 'యాప్‌లోకి లాగిన్ అవ్వండి'
                  : 'Log In with Mobile Number'}
              </span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMsg(null);
                }}
                className="text-xs text-[#00236F] font-bold hover:underline"
              >
                {lang === 'te'
                  ? 'ఇంకా నమోదు చేయలేదా? ఇక్కడ కొత్త ప్రొఫైల్ క్రియేట్ చేయండి'
                  : 'Not registered yet? Register new profile here'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
