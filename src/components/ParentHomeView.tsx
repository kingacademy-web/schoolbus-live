import React, { useState } from 'react';
import {
  Navigation,
  Clock,
  Gauge,
  Radio,
  MapPin,
  Sunrise,
  Sunset,
  PhoneCall,
  Check,
  Flag,
  ArrowRight,
  ShieldCheck,
  Car as SteeringWheel,
  Headphones,
  School,
  X,
  Languages,
  Pencil,
  Camera,
  Upload,
  Save,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { store } from '../services/store';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface ParentHomeViewProps {
  lang: Language;
  onNavigateToLive: () => void;
  onNavigateToDriver?: () => void;
  onOpenStaffLogin?: () => void;
}

export const ParentHomeView: React.FC<ParentHomeViewProps> = ({
  lang,
  onNavigateToLive,
  onNavigateToDriver,
  onOpenStaffLogin,
}) => {
  const [relayModalOpen, setRelayModalOpen] = useState(false);
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [editPickupModalOpen, setEditPickupModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const student = store.getStudent();
  const bus = store.getBus();
  const driver = store.getDriver();
  const pickupPoint = store.getPickupPoint();
  const liveLocation = store.liveLocation;

  // Student form state
  const [formStdName, setFormStdName] = useState(student?.name || '');
  const [formStdNameTe, setFormStdNameTe] = useState(student?.nameTe || '');
  const [formStdClass, setFormStdClass] = useState(student?.class || '');
  const [formStdSection, setFormStdSection] = useState(student?.section || '');
  const [formStdRoll, setFormStdRoll] = useState(student?.rollNo || '');
  const [formStdPhone, setFormStdPhone] = useState(student?.parentPhone || '');
  const [formStdPhoto, setFormStdPhoto] = useState(student?.photoUrl || '');
  const [formStdSchool, setFormStdSchool] = useState(student?.schoolName || store.schoolInfo.name);
  const [formStdSchoolTe, setFormStdSchoolTe] = useState(student?.schoolNameTe || store.schoolInfo.nameTe);

  // Pickup form state
  const [formPickupName, setFormPickupName] = useState(pickupPoint?.name || '');
  const [formPickupNameTe, setFormPickupNameTe] = useState(pickupPoint?.nameTe || '');
  const [formLandmark, setFormLandmark] = useState(pickupPoint?.landmark || '');
  const [formLandmarkTe, setFormLandmarkTe] = useState(pickupPoint?.landmarkTe || '');
  const [formMorningTime, setFormMorningTime] = useState(pickupPoint?.morningTime || '07:35 AM');
  const [formAfternoonTime, setFormAfternoonTime] = useState(pickupPoint?.afternoonTime || '04:15 PM');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormStdPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditStudent = () => {
    setFormStdName(student?.name || '');
    setFormStdNameTe(student?.nameTe || '');
    setFormStdClass(student?.class || '');
    setFormStdSection(student?.section || '');
    setFormStdRoll(student?.rollNo || '');
    setFormStdPhone(student?.parentPhone || '');
    setFormStdPhoto(student?.photoUrl || '');
    setFormStdSchool(student?.schoolName || store.schoolInfo.name);
    setFormStdSchoolTe(student?.schoolNameTe || store.schoolInfo.nameTe);
    setEditStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      store.updateStudent(student.id, {
        name: formStdName.trim() || student.name,
        nameTe: formStdNameTe.trim() || student.nameTe,
        class: formStdClass.trim() || student.class,
        section: formStdSection.trim() || student.section,
        rollNo: formStdRoll.trim() || student.rollNo,
        parentPhone: formStdPhone.trim() || student.parentPhone,
        photoUrl: formStdPhoto || student.photoUrl,
        schoolName: formStdSchool.trim() || student.schoolName,
        schoolNameTe: formStdSchoolTe.trim() || student.schoolNameTe,
      });
      if (formStdSchool.trim()) {
        store.updateSchoolInfo({
          name: formStdSchool.trim(),
          nameTe: formStdSchoolTe.trim() || formStdSchool.trim(),
        });
      }
    }
    setEditStudentModalOpen(false);
    showToast(getTranslation(lang, 'dataSavedToast'));
  };

  const handleOpenEditPickup = () => {
    setFormPickupName(pickupPoint?.name || '');
    setFormPickupNameTe(pickupPoint?.nameTe || '');
    setFormLandmark(pickupPoint?.landmark || '');
    setFormLandmarkTe(pickupPoint?.landmarkTe || '');
    setFormMorningTime(pickupPoint?.morningTime || '07:35 AM');
    setFormAfternoonTime(pickupPoint?.afternoonTime || '04:15 PM');
    setEditPickupModalOpen(true);
  };

  const handleSavePickup = (e: React.FormEvent) => {
    e.preventDefault();
    if (pickupPoint) {
      store.updatePickupPoint(pickupPoint.id, {
        name: formPickupName.trim() || pickupPoint.name,
        nameTe: formPickupNameTe.trim() || pickupPoint.nameTe,
        landmark: formLandmark.trim() || pickupPoint.landmark,
        landmarkTe: formLandmarkTe.trim() || pickupPoint.landmarkTe,
        morningTime: formMorningTime.trim() || pickupPoint.morningTime,
        afternoonTime: formAfternoonTime.trim() || pickupPoint.afternoonTime,
      });
    }
    setEditPickupModalOpen(false);
    showToast(getTranslation(lang, 'dataSavedToast'));
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

      {/* Student Profile Card */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0 group">
            <img
              src={student?.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
              alt={student?.name}
              className="w-16 h-16 rounded-2xl object-cover shadow-xs border border-[#E2E7FF]"
            />
            <button
              type="button"
              onClick={handleOpenEditStudent}
              title="Click to edit student photo"
              className="absolute -bottom-1 -right-1 bg-[#00236F] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white hover:scale-110 transition-transform"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h2 className="text-lg font-extrabold text-[#131B2E] truncate">
                {lang === 'te' ? (student?.nameTe || student?.name) : student?.name}
              </h2>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditStudent}
                  className="flex items-center gap-1 bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] px-2.5 py-1 rounded-full text-xs font-bold transition-all border border-[#00236F]/20 active:scale-95"
                >
                  <Pencil className="w-3 h-3 text-[#00236F]" />
                  <span>{lang === 'te' ? 'ఎడిట్' : 'Edit'}</span>
                </button>
                <span className="bg-[#EAEDFF] px-2.5 py-0.5 rounded-full text-xs font-bold text-[#00236F]">
                  {getTranslation(lang, 'rollNo')}{student?.rollNo || '14'}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#444651] mt-0.5 font-medium">
              {student?.class || '1st Class'} • {student?.section ? `Section ${student.section}` : 'Section A'}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#444651] truncate">
              <School className="w-3.5 h-3.5 text-[#00236F] shrink-0" />
              <span className="truncate">
                {lang === 'te' ? (student?.schoolNameTe || store.schoolInfo.nameTe) : (student?.schoolName || store.schoolInfo.name)}
              </span>
            </div>
          </div>
        </div>

        {/* Morning Bus Status Strip inside student card */}
        <div className="mt-3 pt-2.5 border-t border-[#E2E7FF]/70 flex items-center justify-between bg-[#F2F3FF] rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#855300]" />
            <span className="text-xs text-[#131B2E] font-medium">
              {getTranslation(lang, 'transitPassActive')}{' '}
              <strong className="text-[#00236F]">({bus?.busNumber || student?.transitPass || 'Active'})</strong>
            </span>
          </div>
          <span className="text-xs text-[#004A31] font-bold">
            {getTranslation(lang, 'morningPickup')}
          </span>
        </div>
      </div>

      {/* Prominent Live Bus Status Card (Tactile Hero Unit) */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-md gap-3.5 border border-[#E2E7FF]">
        {/* Top Row: Route & Pulsing Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00236F] text-white flex items-center justify-center shadow-xs shrink-0">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-[#131B2E] tracking-tight">
                  {bus?.busNumber || 'BUS-07'}
                </span>
                <span className="text-xs bg-[#EAEDFF] text-[#444651] px-2 py-0.5 rounded font-mono font-bold">
                  {bus?.plateNumber || 'TS 09 UA 4521'}
                </span>
              </div>
              <span className="text-xs text-[#444651]">
                {lang === 'te' ? (bus?.routeNameTe || bus?.routeName) : (bus?.routeName || 'Station Ghanpur Route #07')}
              </span>
            </div>
          </div>

          {/* Live GPS / Trip Status Chip */}
          {bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP' ? (
            <div className="flex items-center gap-1.5 bg-[#004A31]/15 px-3 py-1 rounded-full shrink-0 border border-[#004A31]/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#27C38A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#004A31]" />
              </span>
              <span className="text-xs font-black text-[#004A31] leading-none">
                {lang === 'te' ? 'లైవ్ ట్రిప్' : 'LIVE TRIP'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#EAEDFF] px-3 py-1 rounded-full shrink-0 border border-[#C5C5D3]/40">
              <span className="w-2 h-2 rounded-full bg-[#00236F]" />
              <span className="text-xs font-bold text-[#00236F] leading-none">
                {lang === 'te' ? 'స్కూల్ వద్ద పార్క్' : 'PARKED AT CAMPUS'}
              </span>
            </div>
          )}
        </div>

        {/* Live Status Banner */}
        <div className="flex items-center gap-2 bg-[#EAEDFF]/70 rounded-xl p-2.5 border border-[#C5C5D3]/40">
          <Radio className={`w-4 h-4 shrink-0 ${bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP' ? 'text-[#004A31] animate-pulse' : 'text-[#00236F]'}`} />
          <p className="text-xs text-[#131B2E] leading-tight font-medium">
            {bus?.status === 'MORNING_TRIP' || bus?.status === 'RETURN_TRIP'
              ? (lang === 'te' ? 'బస్సు మార్గంలో ఉంది. లైవ్ జీపీఎస్ లొకేషన్ ప్రసారం అవుతోంది.' : 'Bus is moving on route. Real-time GPS telematics broadcasting.')
              : (lang === 'te' ? 'బస్సు శ్రీ చైతన్య స్కూల్ క్యాంపస్ లో పార్క్ చేయబడింది.' : 'Bus is parked at Sri Chaitanya School Campus, Station Ghanpur.')}
          </p>
        </div>

        {/* Driver Info with Safety Protocol Relay Button */}
        <div className="flex items-center justify-between bg-[#F2F3FF] rounded-xl p-2.5 border border-[#E2E7FF]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={driver?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
                alt={driver?.name}
                className="w-10 h-10 rounded-full object-cover border border-[#C5C5D3]"
              />
              <span className="absolute bottom-0 right-0 bg-[#00236F] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold">
                ✓
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-[#131B2E] truncate">
                  {lang === 'te' ? driver?.nameTe : driver?.name}
                </span>
                <Check className="w-3.5 h-3.5 text-[#00236F]" />
              </div>
              <span className="text-[11px] text-[#444651]">
                {lang === 'te' ? 'సీనియర్ డ్రైవర్ (8 సం. అనుభవం)' : 'Senior Transport Driver (Safe transit)'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRelayModalOpen(true)}
            className="flex items-center gap-1.5 bg-white text-[#00236F] hover:bg-gray-50 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-2xs border border-[#E2E7FF] transition-all shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#BA1A1A]" />
            <span>{getTranslation(lang, 'schoolRelay')}</span>
          </button>
        </div>

        {/* Key Metrics 4-Tile Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Distance */}
          <div className="bg-[#F2F3FF] p-3 rounded-2xl flex flex-col justify-between border border-[#E2E7FF]">
            <div className="flex items-center gap-1 text-[#444651]">
              <Navigation className="w-3.5 h-3.5 text-[#00236F]" />
              <span className="text-xs font-semibold">{getTranslation(lang, 'distance')}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-black text-[#131B2E]">
                {liveLocation.distanceKm}
              </span>{' '}
              <span className="text-xs text-[#444651] font-bold">km</span>
            </div>
            <span className="text-[11px] text-[#004A31] font-medium mt-0.5">
              {lang === 'te' ? 'చేరువవుతోంది' : 'Approaching stop'}
            </span>
          </div>

          {/* ETA */}
          <div className="bg-[#FFDDB8]/50 p-3 rounded-2xl flex flex-col justify-between border border-[#FFDDB8]">
            <div className="flex items-center justify-between text-[#2A1700]">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{getTranslation(lang, 'eta')}</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#855300] animate-pulse" />
            </div>
            <div className="mt-1">
              <span className="text-xl font-black text-[#855300]">
                {liveLocation.etaMinutes}
              </span>{' '}
              <span className="text-xs text-[#855300] font-bold">min</span>
            </div>
            <span className="text-[11px] text-[#855300] font-semibold mt-0.5">
              Est: 7:35 AM
            </span>
          </div>

          {/* Speed */}
          <div className="bg-[#F2F3FF] p-3 rounded-2xl flex flex-col justify-between border border-[#E2E7FF]">
            <div className="flex items-center gap-1 text-[#444651]">
              <Gauge className="w-3.5 h-3.5 text-[#00236F]" />
              <span className="text-xs font-semibold">{getTranslation(lang, 'speed')}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-black text-[#131B2E]">
                {liveLocation.speed}
              </span>{' '}
              <span className="text-xs text-[#444651] font-bold">km/h</span>
            </div>
            <span className="text-[11px] text-[#004A31] font-medium mt-0.5">
              {lang === 'te' ? 'సురక్షిత పరిమితిలో' : 'Safe speed zone (<40)'}
            </span>
          </div>

          {/* GPS Sync */}
          <div className="bg-[#F2F3FF] p-3 rounded-2xl flex flex-col justify-between border border-[#E2E7FF]">
            <div className="flex items-center gap-1 text-[#444651]">
              <Radio className="w-3.5 h-3.5 text-[#004A31]" />
              <span className="text-xs font-semibold">{getTranslation(lang, 'gpsSync')}</span>
            </div>
            <div className="mt-1">
              <span className="text-xl font-black text-[#131B2E]">12</span>{' '}
              <span className="text-xs text-[#444651] font-bold">{getTranslation(lang, 'secondsAgo')}</span>
            </div>
            <span className="text-[11px] text-[#444651] font-medium mt-0.5">
              {lang === 'te' ? '4G సిగ్నల్ బాగుంది' : 'Strong 4G Telematics'}
            </span>
          </div>
        </div>

        {/* Prominent Primary CTA Button */}
        <button
          type="button"
          onClick={onNavigateToLive}
          className="w-full bg-[#00236F] hover:bg-[#1E3A8A] text-white h-13 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all active:scale-[0.99] group mt-1"
        >
          <div className="relative flex items-center justify-center">
            <Navigation className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span className="absolute w-5 h-5 rounded-full bg-[#4059AA] opacity-40 animate-ping" />
          </div>
          <span>{getTranslation(lang, 'viewLiveBusMap')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Designated Pickup Stop Card */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#855300]" />
            <h3 className="text-sm font-bold text-[#131B2E]">
              {getTranslation(lang, 'designatedPickupStop')}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenEditPickup}
              className="flex items-center gap-1 bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] px-2.5 py-1 rounded-full text-xs font-bold transition-all border border-[#00236F]/20 active:scale-95"
            >
              <Pencil className="w-3 h-3 text-[#00236F]" />
              <span>{lang === 'te' ? 'ఎడిట్' : 'Edit'}</span>
            </button>
            <span className="bg-[#EAEDFF] text-[#00236F] px-2.5 py-0.5 rounded-full text-xs font-bold">
              Stop #{pickupPoint?.stopNumber || '03'}
            </span>
          </div>
        </div>

        <div className="p-3 bg-[#F2F3FF] rounded-xl flex flex-col gap-1 border border-[#E2E7FF]">
          <div className="text-base font-black text-[#131B2E]">
            {lang === 'te' ? (pickupPoint?.nameTe || pickupPoint?.name) : pickupPoint?.name}
          </div>
          <span className="text-xs text-[#444651]">
            {lang === 'te' ? (pickupPoint?.landmarkTe || pickupPoint?.landmark) : pickupPoint?.landmark}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="bg-[#F2F3FF] p-2.5 rounded-xl flex items-center gap-2 border border-[#E2E7FF]">
            <Sunrise className="w-5 h-5 text-[#00236F]" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#444651] uppercase font-bold">
                {getTranslation(lang, 'morningPickup')}
              </span>
              <span className="text-sm font-bold text-[#131B2E]">
                {pickupPoint?.morningTime || '07:35 AM'}
              </span>
            </div>
          </div>

          <div className="bg-[#F2F3FF] p-2.5 rounded-xl flex items-center gap-2 border border-[#E2E7FF]">
            <Sunset className="w-5 h-5 text-[#855300]" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-[#444651] uppercase font-bold">
                {getTranslation(lang, 'afternoonDrop')}
              </span>
              <span className="text-sm font-bold text-[#131B2E]">
                {pickupPoint?.afternoonTime || '04:15 PM'}
              </span>
            </div>
          </div>
        </div>

        {/* Active Geofence Alert Strip */}
        <div className="mt-1 flex items-center justify-between bg-[#E2E7FF]/60 p-2.5 rounded-xl border border-[#C5C5D3]/40">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00236F]" />
            <span className="text-xs text-[#131B2E] font-medium">
              {getTranslation(lang, 'geofenceActive')}
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#004A31] animate-pulse" />
        </div>
      </div>

      {/* Morning Route Progress Stepper (Vertical Flow) */}
      <div className="flex flex-col bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#00236F]" />
            <h3 className="text-sm font-bold text-[#131B2E]">
              {getTranslation(lang, 'morningRouteProgress')}
            </h3>
          </div>
          <span className="text-[11px] text-[#004A31] bg-[#004A31]/10 border border-[#004A31]/20 px-2.5 py-0.5 rounded-full font-bold">
            {getTranslation(lang, 'onTime')}
          </span>
        </div>

        {/* Stepper Timeline */}
        <div className="flex flex-col relative pl-2 pt-1">
          {/* Track Line */}
          <div className="absolute left-6 top-3 bottom-5 w-1 bg-[#E2E7FF] rounded-full -translate-x-1/2" />
          <div className="absolute left-6 top-3 h-[52%] w-1 bg-[#00236F] rounded-full -translate-x-1/2" />

          {/* Stop 1: Departed */}
          <div className="flex items-start gap-3 relative pb-4">
            <div className="w-8 h-8 rounded-full bg-[#00236F] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
              <Check className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131B2E]">School Campus (DPS)</span>
                <span className="text-[11px] text-[#444651] font-mono">07:15 AM</span>
              </div>
              <span className="text-[11px] text-[#004A31] font-medium">
                {getTranslation(lang, 'departedSchedule')}
              </span>
            </div>
          </div>

          {/* Stop 2: Passed */}
          <div className="flex items-start gap-3 relative pb-3">
            <div className="w-8 h-8 rounded-full bg-[#00236F] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
              <Check className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#131B2E]">Colony Gate (Stop 2)</span>
                <span className="text-[11px] text-[#444651] font-mono">07:25 AM</span>
              </div>
              <span className="text-[11px] text-[#004A31] font-medium">
                {lang === 'te' ? 'దాటింది • 6 విద్యార్థులు ఎక్కారు' : 'Passed • 6 Students Boarded'}
              </span>
            </div>
          </div>

          {/* CURRENT BUS POSITION INDICATOR */}
          <div className="flex items-center gap-2.5 my-1.5 -ml-1 bg-[#EAEDFF] p-2.5 rounded-xl shadow-xs z-10 border border-[#C5C5D3]/50">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#00236F] text-white shrink-0">
              <Navigation className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FEA619] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FEA619] rounded-full" />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#00236F] uppercase tracking-wider">
                  {getTranslation(lang, 'currentBusPosition')}
                </span>
                <span className="text-[10px] bg-white text-[#00236F] px-1.5 py-0.2 rounded font-bold">
                  Live Radar
                </span>
              </div>
              <p className="text-xs text-[#131B2E] font-semibold truncate">
                {lang === 'te' ? liveLocation.locationNameTe : liveLocation.locationName}
              </p>
            </div>
          </div>

          {/* Stop 3: Target Stop (Sadvik's Stop) */}
          <div className="flex items-start gap-3 relative pt-3 pb-4">
            <div className="w-8 h-8 rounded-full bg-[#FEA619] text-[#684000] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-[#FFDDB8]/70">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#131B2E]">Main Road Bus Stop</span>
                  <span className="bg-[#FFDDB8] text-[#2A1700] px-1.5 py-0.5 rounded text-[10px] font-bold">
                    {getTranslation(lang, 'yourStop')}
                  </span>
                </div>
                <span className="text-xs font-black text-[#855300] font-mono">07:35 AM</span>
              </div>
              <span className="text-xs text-[#855300] font-bold">
                {getTranslation(lang, 'expectedIn')} {liveLocation.etaMinutes} {getTranslation(lang, 'mins')} • {getTranslation(lang, 'standbyAtStop')}
              </span>
            </div>
          </div>

          {/* Stop 4: Terminal */}
          <div className="flex items-start gap-3 relative">
            <div className="w-8 h-8 rounded-full bg-[#E2E7FF] text-[#444651] flex items-center justify-center shrink-0 z-10">
              <Flag className="w-4 h-4" />
            </div>
            <div className="flex flex-col flex-1 pt-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#444651]">Hitech Junction (Terminal)</span>
                <span className="text-[11px] text-[#757682] font-mono">07:48 AM</span>
              </div>
              <span className="text-[11px] text-[#444651]">
                {lang === 'te' ? 'చివరి స్టాప్ • 14 మంది విద్యార్థులు' : 'Final Stop • 14 Students Remaining'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Ops: Driver Mode & School Help */}
      <div className="flex flex-col bg-[#F2F3FF] rounded-2xl p-4 gap-2.5 border border-[#E2E7FF]">
        <span className="text-[11px] font-bold text-[#444651] uppercase tracking-wider">
          {getTranslation(lang, 'quickAccessOps')}
        </span>
        <div className="grid grid-cols-2 gap-2 mt-0.5">
          <button
            type="button"
            onClick={onOpenStaffLogin || onNavigateToDriver}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-xs border border-[#E2E7FF] text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#131B2E] truncate flex items-center gap-1">
                <span>{lang === 'te' ? 'సిబ్బంది పోర్టల్' : 'Staff Portal'}</span>
                <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-1 py-0.2 rounded">PIN</span>
              </span>
              <span className="text-[10px] text-[#444651] truncate">
                {lang === 'te' ? 'డ్రైవర్ / అడ్మిన్ లాగిన్' : 'Driver / Admin PIN'}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRelayModalOpen(true)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-xs border border-[#E2E7FF] text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFDDB8] text-[#855300] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#131B2E] truncate">
                {getTranslation(lang, 'schoolHelpTitle')}
              </span>
              <span className="text-[10px] text-[#444651] truncate">
                {getTranslation(lang, 'helpDesk247')}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Zero-Distraction Safe Relay Modal */}
      {relayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5 text-[#00236F]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#131B2E]">Transit Safety Desk</h4>
                  <p className="text-xs text-[#444651]">Zero-Distraction Protocol</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRelayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#444651] leading-relaxed">
              {getTranslation(lang, 'zeroDistractionNotice')}
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`tel:${store.schoolInfo.phone}`}
                className="w-full h-12 bg-[#00236F] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-xs shadow-md transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'te' ? 'స్కూల్ రవాణా విభాగానికి కాల్ చేయండి' : 'Call School Transport Coordinator'} ({store.schoolInfo.phone})</span>
              </a>
              <button
                type="button"
                onClick={() => setRelayModalOpen(false)}
                className="w-full h-11 bg-[#EAEDFF] text-[#131B2E] rounded-xl flex items-center justify-center font-bold text-xs"
              >
                {getTranslation(lang, 'dismiss')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Details Modal */}
      {editStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    {lang === 'te' ? 'విద్యార్థి వివరాలు ఎడిట్ చేయండి' : 'Edit Student Details'}
                  </h3>
                  <p className="text-xs text-[#757682]">
                    {lang === 'te' ? 'ఫోటో, పేరు, తరగతి, ఫోన్ నంబర్ మార్చండి' : 'Photo, Name, Class & Parent Phone'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="flex flex-col gap-4">
              {/* Photo Upload Section */}
              <div className="bg-[#F2F3FF] p-3.5 rounded-2xl border border-[#E2E7FF] flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={formStdPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200'}
                    alt="Student Preview"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00236F] shadow-sm"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#00236F] text-white p-1 rounded-full text-[10px]">
                    <Camera className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                  <span className="text-xs font-bold text-[#131B2E]">
                    {lang === 'te' ? 'విద్యార్థి ఫోటో (Student Photo)' : 'Student Photo'}
                  </span>
                  <label className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-[#00236F] text-[#00236F] px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer w-fit transition-all shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'te' ? 'గ్యాలరీ నుండి ఎంచుకోండి' : 'Choose from Device'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={formStdPhoto}
                    onChange={(e) => setFormStdPhoto(e.target.value)}
                    placeholder="or paste Image URL here"
                    className="w-full bg-white border border-[#C5C5D3] rounded-lg px-2.5 py-1 text-[11px] font-mono"
                  />
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'విద్యార్థి పేరు (English)' : 'Student Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formStdName}
                    onChange={(e) => setFormStdName(e.target.value)}
                    placeholder="e.g. A. Sadvik"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'విద్యార్థి పేరు (తెలుగు)' : 'Student Name (Telugu)'}
                  </label>
                  <input
                    type="text"
                    value={formStdNameTe}
                    onChange={(e) => setFormStdNameTe(e.target.value)}
                    placeholder="ఉదా: ఆ. సాద్విక్"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
              </div>

              {/* Class, Section, Roll */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'తరగతి' : 'Class'}
                  </label>
                  <input
                    type="text"
                    value={formStdClass}
                    onChange={(e) => setFormStdClass(e.target.value)}
                    placeholder="1st Class"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'సెక్షన్' : 'Section'}
                  </label>
                  <input
                    type="text"
                    value={formStdSection}
                    onChange={(e) => setFormStdSection(e.target.value)}
                    placeholder="A"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'రోల్ నం.' : 'Roll No.'}
                  </label>
                  <input
                    type="text"
                    value={formStdRoll}
                    onChange={(e) => setFormStdRoll(e.target.value)}
                    placeholder="14"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Phone and School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'తల్లిదండ్రుల ఫోన్ నంబర్' : 'Parent Phone Number'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formStdPhone}
                    onChange={(e) => setFormStdPhone(e.target.value)}
                    placeholder="+91 99887 76655"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'పాఠశాల పేరు' : 'School Name'}
                  </label>
                  <input
                    type="text"
                    value={formStdSchool}
                    onChange={(e) => setFormStdSchool(e.target.value)}
                    placeholder="e.g. DPS Hyderabad"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
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
                  onClick={() => setEditStudentModalOpen(false)}
                  className="px-5 py-3 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pickup Stop Details Modal */}
      {editPickupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <h3 className="text-base font-extrabold text-[#131B2E]">
                {lang === 'te' ? 'పికప్ స్టాప్ & చిరునామా ఎడిట్' : 'Edit Pickup Stop & Address'}
              </h3>
              <button
                type="button"
                onClick={() => setEditPickupModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePickup} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'స్టాప్ పేరు (English)' : 'Stop Name (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={formPickupName}
                  onChange={(e) => setFormPickupName(e.target.value)}
                  placeholder="e.g. Main Road Bus Stop"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'ల్యాండ్‌మార్క్ / చిరునామా' : 'Landmark / Address'}
                </label>
                <input
                  type="text"
                  value={formLandmark}
                  onChange={(e) => setFormLandmark(e.target.value)}
                  placeholder="e.g. Opp. Syndicate Bank, Krishna Nagar"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'ఉదయం పికప్' : 'Morning Pickup'}
                  </label>
                  <input
                    type="text"
                    value={formMorningTime}
                    onChange={(e) => setFormMorningTime(e.target.value)}
                    placeholder="07:35 AM"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'సాయంత్రం డ్రాప్' : 'Afternoon Drop'}
                  </label>
                  <input
                    type="text"
                    value={formAfternoonTime}
                    onChange={(e) => setFormAfternoonTime(e.target.value)}
                    placeholder="04:15 PM"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-2.5 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#00236F] hover:bg-[#001c59] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{lang === 'te' ? 'సేవ్ చేయండి' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditPickupModalOpen(false)}
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
