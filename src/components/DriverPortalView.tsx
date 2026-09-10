import React, { useState } from 'react';
import {
  Play,
  Square,
  CornerDownRight,
  Crosshair,
  Wifi,
  Timer,
  Eye,
  ShieldAlert,
  PhoneCall,
  ShieldCheck,
  CheckCircle,
  X,
  Languages,
  UserCheck,
  Radio,
  Pencil,
  Plus,
  Save,
  LogOut,
} from 'lucide-react';
import { store } from '../services/store';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface DriverPortalViewProps {
  lang: Language;
}

export const DriverPortalView: React.FC<DriverPortalViewProps> = ({ lang }) => {
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const bus = store.getBus();
  const driver = store.getDriver();
  const students = store.students;
  const isTripActive = bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP';

  // Driver & Bus Edit form state
  const [formDriverName, setFormDriverName] = useState(driver?.name || '');
  const [formDriverNameTe, setFormDriverNameTe] = useState(driver?.nameTe || '');
  const [formDriverPhone, setFormDriverPhone] = useState(driver?.phone || '');
  const [formDriverLicense, setFormDriverLicense] = useState(driver?.licenseNo || '');
  const [formBusNumber, setFormBusNumber] = useState(bus?.busNumber || '');
  const [formPlateNumber, setFormPlateNumber] = useState(bus?.plateNumber || '');
  const [formRouteName, setFormRouteName] = useState(bus?.routeName || '');
  const [formRouteNameTe, setFormRouteNameTe] = useState(bus?.routeNameTe || '');

  // Add student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNameTe, setNewStudentNameTe] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  const handleOpenEdit = () => {
    setFormDriverName(driver?.name || '');
    setFormDriverNameTe(driver?.nameTe || '');
    setFormDriverPhone(driver?.phone || '');
    setFormDriverLicense(driver?.licenseNo || '');
    setFormBusNumber(bus?.busNumber || '');
    setPlateNumberSafe(bus?.plateNumber || '');
    setFormRouteName(bus?.routeName || '');
    setFormRouteNameTe(bus?.routeNameTe || '');
    setEditModalOpen(true);
  };

  const setPlateNumberSafe = (val: string) => setFormPlateNumber(val);

  const handleSaveDriverBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (driver) {
      store.updateDriver(driver.id, {
        name: formDriverName.trim() || driver.name,
        nameTe: formDriverNameTe.trim() || driver.nameTe,
        phone: formDriverPhone.trim() || driver.phone,
        licenseNo: formDriverLicense.trim() || driver.licenseNo,
      });
    }
    if (bus) {
      store.updateBus(bus.id, {
        busNumber: formBusNumber.trim() || bus.busNumber,
        plateNumber: formPlateNumber.trim() || bus.plateNumber,
        routeName: formRouteName.trim() || bus.routeName,
        routeNameTe: formRouteNameTe.trim() || bus.routeNameTe,
      });
    }
    setEditModalOpen(false);
    showToast(getTranslation(lang, 'dataSavedToast'));
  };

  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    store.addStudent({
      name: newStudentName.trim(),
      nameTe: newStudentNameTe.trim() || newStudentName.trim(),
      class: newStudentClass.trim() || 'Class 1',
      section: 'A',
      rollNo: `${store.students.length + 1}`,
      schoolName: store.schoolInfo.name,
      schoolNameTe: store.schoolInfo.nameTe,
      busId: bus?.id || 'bus_07',
      pickupPointId: 'pickup_main_rd',
      parentId: `parent_${Date.now()}`,
      parentPhone: newStudentPhone.trim() || '+91 99887 76655',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
      status: 'Awaiting Bus',
      transitPass: `Active (${bus?.busNumber || 'BUS-07'})`,
    });
    setNewStudentName('');
    setNewStudentNameTe('');
    setNewStudentClass('');
    setNewStudentPhone('');
    setAddStudentModalOpen(false);
    showToast(lang === 'te' ? 'విద్యార్థి వివరాలు విజయవంతంగా చేర్చబడ్డాయి!' : 'Student added successfully!');
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartTrip = (type: 'morning' | 'return') => {
    store.startTrip(type);
    showToast(
      lang === 'te'
        ? 'లైవ్ జీపీఎస్ ట్రాకింగ్ ప్రారంభమైంది! తల్లిదండ్రులు చూస్తున్నారు.'
        : 'Live GPS Tracking Started! Broadcast is active.'
    );
  };

  const handleStopTrip = () => {
    store.stopTrip();
    showToast(
      lang === 'te'
        ? 'ట్రిప్ ముగిసింది. జీపీఎస్ బ్రాడ్‌కాస్ట్ ఆగిపోయింది.'
        : 'Trip ended successfully. GPS broadcast stopped.'
    );
  };

  const toggleStudentBoarding = (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Boarded' ? 'Awaiting Bus' : 'Boarded';
    store.updateStudentStatus(studentId, newStatus);
    showToast(
      lang === 'te'
        ? `విద్యార్థి స్థితి మార్చబడింది: ${newStatus === 'Boarded' ? 'ఎక్కారు' : 'వేచివున్నారు'}`
        : `Student status updated: ${newStatus}`
    );
  };

  return (
    <div className="flex flex-col w-full px-4 gap-4 pb-24 pt-2">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-22 left-1/2 -translate-x-1/2 z-50 bg-[#131B2E] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#E2E7FF]/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-[#4EDEA3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Driver Top Greeting Card */}
      <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center font-black text-xl shrink-0">
              {(driver?.name || 'RK')
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold text-[#131B2E] truncate">
                {lang === 'te'
                  ? `నమస్కారం, ${driver?.nameTe || driver?.name || 'డ్రైవర్'}`
                  : `Namaste, ${driver?.name || 'Driver'}`}
              </span>
              <span className="text-xs text-[#444651] font-medium truncate">
                ID: {driver?.id?.toUpperCase() || 'DRV-01'} • {driver?.phone || '+91 98765 43210'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border border-[#00236F]/20 active:scale-95 shadow-2xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#00236F]" />
              <span>{lang === 'te' ? 'ఎడిట్' : 'Edit'}</span>
            </button>
            <button
              type="button"
              onClick={() => store.logoutStaff()}
              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all border border-red-200 active:scale-95 shadow-2xs cursor-pointer"
              title={lang === 'te' ? 'లాగ్ అవుట్' : 'Exit Staff Session'}
            >
              <LogOut className="w-3 h-3 text-red-700" />
              <span>{lang === 'te' ? 'నిష్క్రమించు' : 'Exit'}</span>
            </button>
          </div>
        </div>

        {/* Bus and Route ribbon */}
        <div className="bg-[#F2F3FF] rounded-xl p-2.5 flex items-center justify-between border border-[#E2E7FF]">
          <div className="flex items-center gap-2 min-w-0">
            <Radio className="w-4 h-4 text-[#00236F] shrink-0" />
            <span className="text-xs font-bold text-[#00236F] truncate">
              {bus?.busNumber || 'BUS-07'} {bus?.plateNumber ? `• ${bus.plateNumber}` : ''}
            </span>
          </div>
          <span className="text-xs text-[#444651] font-medium truncate">
            {lang === 'te'
              ? (bus?.routeNameTe || bus?.routeName || 'రూట్')
              : (bus?.routeName || 'School Route')}
          </span>
        </div>

        {/* Trip State Banner */}
        <div
          className={`w-full rounded-xl px-3 py-2 flex items-center justify-between transition-colors ${
            isTripActive
              ? 'bg-[#004A31] text-white border border-[#004A31]'
              : 'bg-[#E2E7FF] text-[#131B2E] border border-[#C5C5D3]/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-3 h-3 rounded-full ${
                isTripActive ? 'bg-[#27C38A] animate-ping' : 'bg-[#FEA619]'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-extrabold uppercase tracking-wider">
                {isTripActive
                  ? getTranslation(lang, 'gpsBroadcastActive')
                  : getTranslation(lang, 'statusReady')}
              </span>
              <span className="text-[10px] opacity-80">
                {isTripActive
                  ? getTranslation(lang, 'gpsBroadcastActiveSub')
                  : 'ప్రారంభించడానికి సిద్ధంగా ఉంది'}
              </span>
            </div>
          </div>

          {isTripActive && (
            <span className="bg-[#27C38A]/20 text-[#27C38A] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#27C38A]/30">
              LIVE BROADCAST
            </span>
          )}
        </div>
      </div>

      {/* Giant Driver Primary Touch Controls */}
      <div className="flex flex-col gap-3">
        {!isTripActive ? (
          <>
            {/* State 1: Giant Start Morning Trip */}
            <button
              type="button"
              onClick={() => handleStartTrip('morning')}
              className="w-full bg-[#004A31] active:scale-[0.99] transition-transform rounded-2xl shadow-lg p-4 flex items-center justify-between text-left text-white group border-2 border-[#004A31]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Play className="w-8 h-8 text-[#27C38A] fill-current" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black leading-tight tracking-tight">
                    {getTranslation(lang, 'startMorningTrip')}
                  </span>
                  <span className="text-xs text-[#6FFBBE] font-medium mt-0.5">
                    {lang === 'te'
                      ? (bus?.routeNameTe || 'ఉదయం ట్రిప్ ప్రారంభించండి')
                      : (bus?.routeName ? `${bus.routeName} (06:45 AM)` : 'Morning Route ➔ School Gate')}
                  </span>
                  <span className="text-[11px] text-white/70 mt-0.5">
                    Tap to broadcast live GPS coordinates
                  </span>
                </div>
              </div>
              <span className="text-2xl text-white group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </button>

            {/* State 3: Afternoon Return Trip */}
            <button
              type="button"
              onClick={() => handleStartTrip('return')}
              className="w-full bg-white active:scale-[0.99] transition-transform rounded-2xl shadow-sm p-4 flex items-center justify-between text-left border border-[#E2E7FF] group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#F2F3FF] text-[#00236F] flex items-center justify-center shrink-0">
                  <CornerDownRight className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold text-[#131B2E] leading-tight">
                    {getTranslation(lang, 'startReturnTrip')}
                  </span>
                  <span className="text-xs text-[#444651]">
                    {lang === 'te'
                      ? 'తిరుగు ప్రయాణం ప్రారంభించండి (మధ్యాహ్నం)'
                      : (bus?.routeName ? `${bus.routeName} (03:30 PM)` : 'School Gate ➔ Drop')}
                  </span>
                </div>
              </div>
              <span className="text-xl text-[#757682] group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </button>
          </>
        ) : (
          /* Active Trip Control Panel with Live Timer and Giant Stop Button */
          <div className="flex flex-col gap-3 bg-white rounded-2xl p-4 shadow-lg border-2 border-[#004A31]">
            <div className="flex items-center justify-between bg-[#F2F3FF] rounded-xl p-3 border border-[#E2E7FF]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#004A31] animate-ping" />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#131B2E]">
                    GPS BROADCAST ACTIVE
                  </span>
                  <span className="text-[11px] text-[#444651]">
                    లైవ్ లొకేషన్ తల్లిదండ్రులకు కనిపిస్తోంది
                  </span>
                </div>
              </div>
              <span className="text-lg font-black text-[#00236F] font-mono tracking-wider">
                {formatTimer(store.tripElapsedSeconds)}
              </span>
            </div>

            {/* Giant Stop Trip Button */}
            <button
              type="button"
              onClick={handleStopTrip}
              className="w-full h-20 bg-[#BA1A1A] hover:bg-[#93000A] active:scale-[0.99] transition-transform rounded-xl shadow-md p-4 flex items-center justify-center gap-3.5 text-white"
            >
              <Square className="w-7 h-7 fill-current" />
              <div className="flex flex-col text-left">
                <span className="text-lg font-black leading-tight">
                  {getTranslation(lang, 'endLiveTrip')}
                </span>
                <span className="text-xs text-white/80">
                  {lang === 'te' ? 'ట్రిప్ ముగించండి • GPS ఆఫ్ అవుతుంది' : 'Stop live GPS broadcast'}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Student Boarding Checklist (Driver Quick Tap) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#00236F]" />
            <h3 className="text-sm font-bold text-[#131B2E]">
              {lang === 'te' ? 'విద్యార్థుల బోర్డింగ్ చెక్‌లిస్ట్' : 'Student Boarding Checklist'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#004A31] bg-[#004A31]/10 px-2 py-0.5 rounded-full">
              {students.filter((s) => s.status === 'Boarded').length}/{students.length} Boarded
            </span>
            <button
              type="button"
              onClick={() => setAddStudentModalOpen(true)}
              className="flex items-center gap-1 bg-[#00236F] hover:bg-[#001b57] text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>{lang === 'te' ? '+ విద్యార్థి' : '+ Student'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {students.map((std) => (
            <div
              key={std.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F2F3FF] border border-[#E2E7FF]"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={std.photoUrl}
                  alt={std.name}
                  className="w-9 h-9 rounded-xl object-cover border border-[#C5C5D3]"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#131B2E]">
                    {lang === 'te' ? std.nameTe : std.name}
                  </span>
                  <span className="text-[10px] text-[#444651]">
                    {std.class} • Stop #3 (Main Rd)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => toggleStudentBoarding(std.id, std.status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  std.status === 'Boarded'
                    ? 'bg-[#004A31] text-white shadow-xs'
                    : 'bg-white text-[#444651] border border-[#C5C5D3] hover:bg-gray-50'
                }`}
              >
                {std.status === 'Boarded' ? '✓ Boarded' : '+ Mark Boarded'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Realtime Telemetry Grid: 2-column driver telematics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#444651] font-bold uppercase tracking-wider">
            Console Telematics • టెలిమెట్రిక్స్
          </span>
          <span className="text-[11px] text-[#004A31] bg-[#EAEDFF] px-2 py-0.5 rounded-full font-bold">
            Auto-Sync 5s
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* GPS Status */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#E2E7FF] flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <Crosshair className="w-5 h-5 text-[#004A31]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C38A] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#131B2E]">
                {getTranslation(lang, 'gpsLocked')}
              </span>
              <span className="text-[11px] text-[#757682]">
                {getTranslation(lang, 'highAccuracy')}
              </span>
              <span className="text-[10px] text-[#444651] mt-0.5">ఖచ్చితమైన జీపీఎస్</span>
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#E2E7FF] flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <Wifi className="w-5 h-5 text-[#00236F]" />
              <span className="text-[10px] bg-[#E2E7FF] text-[#00236F] font-bold px-1.5 py-0.5 rounded">
                4G LTE
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#131B2E]">
                {getTranslation(lang, 'connected')}
              </span>
              <span className="text-[11px] text-[#757682]">
                {getTranslation(lang, 'fastSync')}
              </span>
              <span className="text-[10px] text-[#444651] mt-0.5">నెట్‌వర్క్ కనెక్ట్ అయింది</span>
            </div>
          </div>

          {/* Trip Duration */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#E2E7FF] flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <Timer className="w-5 h-5 text-[#855300]" />
              <span className="text-[10px] text-[#444651] font-bold">
                {getTranslation(lang, 'elapsed')}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-[#131B2E] font-mono">
                {formatTimer(store.tripElapsedSeconds)}
              </span>
              <span className="text-[11px] text-[#757682]">
                {getTranslation(lang, 'tripTime')}
              </span>
              <span className="text-[10px] text-[#444651] mt-0.5">ప్రయాణ సమయం</span>
            </div>
          </div>

          {/* Connected Parents Live */}
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[#E2E7FF] flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <Eye className="w-5 h-5 text-[#1E3A8A]" />
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FEA619] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#855300]" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-[#00236F]">28 Parents</span>
              <span className="text-[11px] text-[#757682]">
                {getTranslation(lang, 'parentsWatching')}
              </span>
              <span className="text-[10px] text-[#444651] mt-0.5">తల్లిదండ్రులు చూస్తున్నారు</span>
            </div>
          </div>
        </div>

        {/* Battery & Offline Guard Card */}
        <div className="bg-[#F2F3FF] rounded-2xl p-3 flex items-center justify-between border border-[#E2E7FF]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#004A31]" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#131B2E]">
                {getTranslation(lang, 'offlineGuardReady')}
              </span>
              <span className="text-[10px] text-[#444651]">
                {getTranslation(lang, 'offlineGuardDesc')}
              </span>
            </div>
          </div>
          <CheckCircle className="w-4 h-4 text-[#004A31]" />
        </div>
      </div>

      {/* Driver Safety Protocol Card */}
      <div className="bg-[#FFDDB8]/40 rounded-2xl p-4 flex flex-col gap-2 border border-[#FFDDB8]">
        <div className="flex items-center gap-2 text-[#855300]">
          <ShieldAlert className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">
            {getTranslation(lang, 'driverSafetyProtocol')}
          </span>
        </div>
        <p className="text-xs text-[#2A1700] leading-relaxed">
          {getTranslation(lang, 'driverSafetyBody')}
        </p>
      </div>

      {/* Emergency SOS & Transport Desk */}
      <div className="flex flex-col gap-2 pt-1 pb-4">
        <button
          type="button"
          onClick={() => setSosModalOpen(true)}
          className="w-full h-16 bg-[#BA1A1A] hover:bg-[#93000A] active:scale-[0.99] transition-transform text-white rounded-2xl flex items-center justify-between px-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-base font-black leading-tight">
                {getTranslation(lang, 'sosTransportDesk')}
              </span>
              <span className="text-xs text-white/80 mt-0.5">
                {getTranslation(lang, 'sosSub')}
              </span>
            </div>
          </div>
          <PhoneCall className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* SOS Confirmation Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center mx-auto">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-[#131B2E]">Call Transport Desk?</h3>
              <span className="text-sm font-bold text-[#BA1A1A]">
                రవాణా విభాగానికి కాల్ చేయాలా?
              </span>
              <p className="text-xs text-[#444651] mt-1">
                Direct priority line to School Transportation Supervisor & Emergency Dispatch.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  store.triggerEmergency('Driver pressed Emergency SOS Button');
                  setSosModalOpen(false);
                  showToast(
                    lang === 'te'
                      ? '🚨 అత్యవసర SOS హెచ్చరిక పంపబడింది! రవాణా విభాగానికి సమాచారం అందించబడింది.'
                      : '🚨 Emergency SOS broadcasted! Transport desk alerted.'
                  );
                }}
                className="w-full h-12 bg-[#BA1A1A] hover:bg-[#93000A] text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-md transition-colors gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>BROADCAST EMERGENCY SOS</span>
              </button>
              <a
                href="tel:18004250000"
                className="w-full h-11 bg-[#FFDAD6] text-[#93000A] rounded-xl flex items-center justify-center font-bold text-xs shadow-xs transition-colors"
              >
                CALL POLICE / TRANSPORT DESK • 1800-425-0000
              </a>
              <button
                type="button"
                onClick={() => setSosModalOpen(false)}
                className="w-full h-11 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
              >
                CANCEL / రద్దు చేయండి
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver & Bus Details Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    {lang === 'te' ? 'డ్రైవర్ & బస్సు వివరాలు ఎడిట్ చేయండి' : 'Edit Driver & Bus Details'}
                  </h3>
                  <p className="text-xs text-[#757682]">
                    {lang === 'te' ? 'ఈ మార్పులు మీ బ్రౌజర్‌లో సేవ్ అవుతాయి' : 'Saved permanently in localStorage'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDriverBus} className="flex flex-col gap-4">
              {/* Driver Section */}
              <div className="bg-[#F2F3FF] p-3.5 rounded-2xl border border-[#E2E7FF] flex flex-col gap-2.5">
                <span className="text-xs font-black text-[#00236F] uppercase tracking-wider">
                  👤 {lang === 'te' ? 'డ్రైవర్ ప్రొఫైల్' : 'Driver Profile'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'డ్రైవర్ పేరు (English)' : 'Driver Name (English)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formDriverName}
                      onChange={(e) => setFormDriverName(e.target.value)}
                      placeholder="e.g. Ravi Kumar"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'డ్రైవర్ పేరు (తెలుగు)' : 'Driver Name (Telugu)'}
                    </label>
                    <input
                      type="text"
                      value={formDriverNameTe}
                      onChange={(e) => setFormDriverNameTe(e.target.value)}
                      placeholder="ఉదా: రవి కుమార్"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'మొబైల్ ఫోన్ నంబర్' : 'Mobile Phone'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formDriverPhone}
                      onChange={(e) => setFormDriverPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'డ్రైవింగ్ లైసెన్స్ నం.' : 'Driving License No.'}
                    </label>
                    <input
                      type="text"
                      value={formDriverLicense}
                      onChange={(e) => setFormDriverLicense(e.target.value)}
                      placeholder="DL-09201488219"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                </div>
              </div>

              {/* Bus & Route Section */}
              <div className="bg-[#F2F3FF] p-3.5 rounded-2xl border border-[#E2E7FF] flex flex-col gap-2.5">
                <span className="text-xs font-black text-[#00236F] uppercase tracking-wider">
                  🚌 {lang === 'te' ? 'బస్సు & రూట్ వివరాలు' : 'Bus & Route Telematics'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'బస్సు నంబర్' : 'Bus Number'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formBusNumber}
                      onChange={(e) => setFormBusNumber(e.target.value)}
                      placeholder="e.g. BUS-01"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'వెహికల్ ప్లేట్ నంబర్' : 'Vehicle Plate No.'}
                    </label>
                    <input
                      type="text"
                      value={formPlateNumber}
                      onChange={(e) => setFormPlateNumber(e.target.value)}
                      placeholder="e.g. AP 16 XX 1234"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'రూట్ పేరు (English)' : 'Route Name (English)'}
                    </label>
                    <input
                      type="text"
                      value={formRouteName}
                      onChange={(e) => setFormRouteName(e.target.value)}
                      placeholder="e.g. Station Ghanpur ➔ School Campus"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#444651] block mb-1">
                      {lang === 'te' ? 'రూట్ పేరు (తెలుగు)' : 'Route Name (Telugu)'}
                    </label>
                    <input
                      type="text"
                      value={formRouteNameTe}
                      onChange={(e) => setFormRouteNameTe(e.target.value)}
                      placeholder="ఉదా: మియాపూర్ ➔ స్కూల్ గేట్"
                      className="w-full bg-white border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#00236F] hover:bg-[#001c59] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'te' ? 'సేవ్ చేయండి' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-5 py-3 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Student Modal */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <h3 className="text-base font-extrabold text-[#131B2E]">
                {lang === 'te' ? 'కొత్త విద్యార్థిని చేర్చండి' : 'Add Student to Bus'}
              </h3>
              <button
                type="button"
                onClick={() => setAddStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddStudent} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'విద్యార్థి పేరు (English)' : 'Student Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Sadvik"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'విద్యార్థి పేరు (తెలుగు)' : 'Student Name (Telugu)'}
                </label>
                <input
                  type="text"
                  value={newStudentNameTe}
                  onChange={(e) => setNewStudentNameTe(e.target.value)}
                  placeholder="ఉదా: సాద్విక్"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'తరగతి' : 'Class'}
                  </label>
                  <input
                    type="text"
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    placeholder="Class 3 - A"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'తల్లిదండ్రుల ఫోన్' : 'Parent Phone'}
                  </label>
                  <input
                    type="tel"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    placeholder="+91 99887 76655"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#004A31] hover:bg-[#003825] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'te' ? 'చేర్చండి' : 'Add Student'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-4 py-2.5 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
