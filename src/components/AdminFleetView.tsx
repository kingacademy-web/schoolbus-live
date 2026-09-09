import React, { useState } from 'react';
import {
  Megaphone,
  School,
  Bus as BusIcon,
  UserCheck as DriverIcon,
  AlertTriangle,
  MapPin,
  UserPlus,
  BadgeCheck,
  Route as RouteIcon,
  Send,
  Phone,
  Clock,
  CheckCircle,
  Radio,
  X,
  Plus,
  Sliders,
  Sparkles,
  Pencil,
  Save,
  LogOut,
} from 'lucide-react';
import { store } from '../services/store';
import { Bus, Language, Student } from '../types';
import { getTranslation } from '../i18n/translations';

interface AdminFleetViewProps {
  lang: Language;
  onTrackBus: (busId: string) => void;
}

export const AdminFleetView: React.FC<AdminFleetViewProps> = ({ lang, onTrackBus }) => {
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [routesModalOpen, setRoutesModalOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [editBusModalOpen, setEditBusModalOpen] = useState(false);
  const [addBusModalOpen, setAddBusModalOpen] = useState(false);

  // School form states
  const [formSchoolName, setFormSchoolName] = useState(store.schoolInfo.name);
  const [formSchoolNameTe, setFormSchoolNameTe] = useState(store.schoolInfo.nameTe);
  const [formSchoolAddress, setFormSchoolAddress] = useState(store.schoolInfo.address);
  const [formSchoolAddressTe, setFormSchoolAddressTe] = useState(store.schoolInfo.addressTe);
  const [formSchoolPhone, setFormSchoolPhone] = useState(store.schoolInfo.phone);
  const [formSchoolEmergency, setFormSchoolEmergency] = useState(store.schoolInfo.emergencyContact);
  const [formSchoolHead, setFormSchoolHead] = useState(store.schoolInfo.transportHeadName);

  // Bus edit form states
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [formBusNumber, setFormBusNumber] = useState('');
  const [formBusPlate, setFormBusPlate] = useState('');
  const [formBusRoute, setFormBusRoute] = useState('');
  const [formBusRouteTe, setFormBusRouteTe] = useState('');
  const [formBusDriverName, setFormBusDriverName] = useState('');
  const [formBusDriverPhone, setFormBusDriverPhone] = useState('');

  // New Bus form states
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newBusPlate, setNewBusPlate] = useState('');
  const [newBusRoute, setNewBusRoute] = useState('');
  const [newBusRouteTe, setNewBusRouteTe] = useState('');
  const [newBusDriverName, setNewBusDriverName] = useState('');
  const [newBusDriverPhone, setNewBusDriverPhone] = useState('');

  // Form states
  const [geofenceRadius, setGeofenceRadius] = useState(500);
  const [broadcastAudience, setBroadcastAudience] = useState('all');
  const [enMsg, setEnMsg] = useState('Tomorrow school closes early at 3:00 PM for Staff Briefing.');
  const [teMsg, setTeMsg] = useState('రేపు పాఠశాల మధ్యాహ్నం 3:00 గంటలకు ముగుస్తుంది.');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New student form
  const [newStudentName, setNewStudentName] = useState('K. Rithvik');
  const [newStudentClass, setNewStudentClass] = useState('Class 3 - A');
  const [newStudentPhone, setNewStudentPhone] = useState('+91 98490 11223');
  const [newStudentStop, setNewStudentStop] = useState('Miyapur Cross Roads');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleOpenSchoolModal = () => {
    setFormSchoolName(store.schoolInfo.name);
    setFormSchoolNameTe(store.schoolInfo.nameTe);
    setFormSchoolAddress(store.schoolInfo.address);
    setFormSchoolAddressTe(store.schoolInfo.addressTe);
    setFormSchoolPhone(store.schoolInfo.phone);
    setFormSchoolEmergency(store.schoolInfo.emergencyContact);
    setFormSchoolHead(store.schoolInfo.transportHeadName);
    setSchoolModalOpen(true);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSchoolInfo({
      name: formSchoolName.trim() || store.schoolInfo.name,
      nameTe: formSchoolNameTe.trim() || store.schoolInfo.nameTe,
      address: formSchoolAddress.trim() || store.schoolInfo.address,
      addressTe: formSchoolAddressTe.trim() || store.schoolInfo.addressTe,
      phone: formSchoolPhone.trim() || store.schoolInfo.phone,
      emergencyContact: formSchoolEmergency.trim() || store.schoolInfo.emergencyContact,
      transportHeadName: formSchoolHead.trim() || store.schoolInfo.transportHeadName,
    });
    setSchoolModalOpen(false);
    showToast(getTranslation(lang, 'dataSavedToast'));
  };

  const handleOpenEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setFormBusNumber(bus.busNumber);
    setFormBusPlate(bus.plateNumber || '');
    setFormBusRoute(bus.routeName || '');
    setFormBusRouteTe(bus.routeNameTe || '');
    setFormBusDriverName(bus.driverName || '');
    setFormBusDriverPhone(bus.driverPhone || '');
    setEditBusModalOpen(true);
  };

  const handleSaveBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBus) {
      store.updateBus(selectedBus.id, {
        busNumber: formBusNumber.trim() || selectedBus.busNumber,
        plateNumber: formBusPlate.trim() || selectedBus.plateNumber,
        routeName: formBusRoute.trim() || selectedBus.routeName,
        routeNameTe: formBusRouteTe.trim() || selectedBus.routeNameTe,
        driverName: formBusDriverName.trim() || selectedBus.driverName,
        driverPhone: formBusDriverPhone.trim() || selectedBus.driverPhone,
      });
    }
    setEditBusModalOpen(false);
    showToast(getTranslation(lang, 'dataSavedToast'));
  };

  const handleSaveNewBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusNumber.trim()) return;
    store.addBus({
      busNumber: newBusNumber.trim(),
      plateNumber: newBusPlate.trim() || 'TS 09 UA 1234',
      driverId: `drv_${Date.now()}`,
      driverName: newBusDriverName.trim() || 'Assigned Driver',
      driverNameTe: newBusDriverName.trim() || 'కేటాయించిన డ్రైవర్',
      driverPhone: newBusDriverPhone.trim() || '+91 94400 00000',
      routeId: `route_${Date.now()}`,
      routeName: newBusRoute.trim() || 'School Route',
      routeNameTe: newBusRouteTe.trim() || 'పాఠశాల రూట్',
      capacity: 35,
      studentsCount: 0,
      status: 'READY',
      speedKmh: 0,
      trafficLevel: 'Low',
      currentLocationName: 'School Campus',
      currentLocationNameTe: 'పాఠశాల ఆవరణ',
      nextStopName: 'First Stop',
      nextStopNameTe: 'మొదటి స్టాప్',
      nextStopNumber: 1,
      tripName: 'Morning Pickup',
      tripNameTe: 'ఉదయం పికప్',
    });
    setNewBusNumber('');
    setNewBusPlate('');
    setNewBusRoute('');
    setNewBusRouteTe('');
    setNewBusDriverName('');
    setNewBusDriverPhone('');
    setAddBusModalOpen(false);
    showToast(lang === 'te' ? 'కొత్త బస్సు ఫ్లీట్‌లోకి చేర్చబడింది!' : 'New bus added to fleet successfully!');
  };

  const handleSaveStudent = () => {
    store.addStudent({
      name: newStudentName,
      nameTe: newStudentName,
      class: newStudentClass,
      section: 'A',
      rollNo: '28',
      schoolName: store.schoolInfo.name,
      schoolNameTe: store.schoolInfo.nameTe,
      busId: 'bus_07',
      pickupPointId: 'pickup_main_rd',
      parentId: 'parent_new',
      parentPhone: newStudentPhone,
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
      status: 'Awaiting Bus',
      transitPass: 'Active (Route 07-AM)',
    });
    setStudentModalOpen(false);
    showToast(
      lang === 'te'
        ? 'విద్యార్థి వివరాలు విజయవంతంగా సేవ్ అయ్యాయి!'
        : 'Student registered and assigned to BUS-07!'
    );
  };

  const handleApplyGeofence = () => {
    store.updateGeofenceRadius(geofenceRadius);
    setRoutesModalOpen(false);
    showToast(
      lang === 'te'
        ? `జియోఫెన్స్ అలర్ట్ పరిధి ${geofenceRadius}మీ గా సెట్ చేయబడింది!`
        : `Geofence radius updated to ${geofenceRadius}m across all active routes!`
    );
  };

  const handleSendBroadcast = () => {
    if (!enMsg.trim()) return;
    store.sendBroadcast(broadcastAudience, enMsg, teMsg);
    setBroadcastModalOpen(false);
    showToast(
      lang === 'te'
        ? 'ద్విభాషా నోటిఫికేషన్ 420 మంది తల్లిదండ్రులకు పంపబడింది!'
        : 'Broadcast dispatched to 420 parents via Instant Push & SMS!'
    );
  };

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Ephemeral Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#131B2E] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#E2E7FF]/20 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-[#4EDEA3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Broadcast Ticker Banner */}
      <div className="bg-[#FEA619] text-[#684000] px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Megaphone className="w-4 h-4 text-[#684000] shrink-0 animate-bounce" />
          <p className="text-xs font-bold truncate">
            {lang === 'te'
              ? 'తాజా హెచ్చరిక: మెట్రో పనుల వల్ల బస్సు-03 5 నిమిషాలు ఆలస్యం'
              : 'Latest Alert: Bus-03 Delayed 5m due to metro rail construction'}
          </p>
        </div>
        <span className="text-xs font-mono opacity-80 shrink-0 ml-2">08:42 AM</span>
      </div>

      <div className="p-4 space-y-4">
        {/* School Overview Card with Edit Option */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2E7FF] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#00236F] text-white flex items-center justify-center shrink-0 shadow-xs">
              <School className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-base font-extrabold text-[#131B2E] truncate">
                {lang === 'te' ? store.schoolInfo.nameTe : store.schoolInfo.name}
              </h3>
              <p className="text-xs text-[#444651] truncate">
                {lang === 'te' ? store.schoolInfo.addressTe : store.schoolInfo.address}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#757682] mt-0.5 flex-wrap">
                <span>📞 {store.schoolInfo.phone}</span>
                <span>🚨 {store.schoolInfo.emergencyContact}</span>
                <span>👤 {store.schoolInfo.transportHeadName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenSchoolModal}
              className="flex items-center gap-1.5 bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-[#00236F]/20 active:scale-95 shadow-2xs cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#00236F]" />
              <span>{lang === 'te' ? 'ఎడిట్' : 'Edit'}</span>
            </button>
            <button
              type="button"
              onClick={() => store.logoutStaff()}
              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-red-200 active:scale-95 shadow-2xs cursor-pointer"
              title={lang === 'te' ? 'లాగ్ అవుట్' : 'Exit Admin Fleet'}
            >
              <LogOut className="w-3.5 h-3.5 text-red-700" />
              <span>{lang === 'te' ? 'నిష్క్రమించు' : 'Exit'}</span>
            </button>
          </div>
        </div>

        {/* Fleet Command Headline & Quick Language State Indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#131B2E] tracking-tight">
              {getTranslation(lang, 'fleetTelematics')}
            </h2>
            <p className="text-xs text-[#444651]">
              {getTranslation(lang, 'zoneSouth')}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#EAEDFF] border border-[#C5C5D3]/40 px-3 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#004A31] animate-pulse" />
            <span className="text-xs text-[#00236F] font-extrabold uppercase tracking-wider">
              LIVE SYNC
            </span>
          </div>
        </div>

        {/* Metric Stat Chips (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Total Students */}
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#E2E7FF] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#444651] font-semibold">
                {getTranslation(lang, 'totalStudents')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#00236F]">
                <School className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#131B2E]">420</span>
              <span className="text-[10px] text-[#004A31] font-bold">100% Enrolled</span>
            </div>
          </div>

          {/* Active Buses */}
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#E2E7FF] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#444651] font-semibold">
                {getTranslation(lang, 'activeBuses')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#00236F]">
                <BusIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#131B2E]">8</span>
              <span className="text-xs text-[#444651] font-medium">/ 12 Fleet</span>
            </div>
          </div>

          {/* Drivers Online */}
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-[#E2E7FF] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#444651] font-semibold">
                {getTranslation(lang, 'driversOnline')}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#004A31] flex items-center justify-center text-white">
                <DriverIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#131B2E]">8</span>
              <span className="text-[10px] text-[#004A31] font-bold">All Verified</span>
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-[#FFDAD6] text-[#93000A] p-3 rounded-2xl shadow-xs border border-[#BA1A1A]/20 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">{getTranslation(lang, 'activeAlerts')}</span>
              <div className="w-8 h-8 rounded-xl bg-[#BA1A1A] text-white flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#BA1A1A]">1</span>
              <span className="text-[10px] font-bold">Bus-03 (+5m)</span>
            </div>
          </div>
        </div>

        {/* Live Fleet Radar & Mini-Map Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-[#E2E7FF] overflow-hidden flex flex-col">
          <div className="p-3 flex items-center justify-between bg-[#F2F3FF] border-b border-[#E2E7FF]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#00236F]" />
              <span className="text-xs font-bold text-[#131B2E]">
                {getTranslation(lang, 'liveGeospatialRadar')}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAEDFF] text-[#00236F] font-bold">
              Kukatpally - Miyapur Corridor
            </span>
          </div>

          {/* Static / High-Resolution Illustrated Radar Viewport */}
          <div className="relative w-full h-44 bg-[#E2E7FF] overflow-hidden">
            {/* SVG Roads and City Map Layer */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 400 180"
              preserveAspectRatio="xMidYMid slice"
            >
              <rect width="400" height="180" fill="#E8EDF5" />
              {/* Secondary roads */}
              <path
                d="M-20,40 Q100,60 200,30 T420,50"
                stroke="#D1D9E6"
                strokeWidth="12"
                fill="none"
              />
              <path
                d="M50,200 L120,-20 M280,200 L320,-20 M180,200 L160,-20"
                stroke="#D1D9E6"
                strokeWidth="10"
                fill="none"
              />
              {/* Outer Ring Highway */}
              <path
                d="M-20,130 C120,140 180,80 420,110"
                stroke="#B6C4FF"
                strokeWidth="16"
                fill="none"
              />
              <path
                d="M-20,130 C120,140 180,80 420,110"
                stroke="#1E3A8A"
                strokeWidth="6"
                fill="none"
              />
              {/* 500m geofence circles */}
              <circle
                cx="160"
                cy="110"
                r="38"
                fill="#FEA619"
                fillOpacity="0.2"
                stroke="#FEA619"
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              <circle
                cx="290"
                cy="95"
                r="30"
                fill="#4EDEA3"
                fillOpacity="0.2"
                stroke="#004A31"
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />
            </svg>

            {/* Overlays: Fleet Pins */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between bg-gradient-to-t from-black/50 via-transparent to-transparent">
              <div className="flex justify-between items-start">
                <div className="bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-[#E2E7FF]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004A31] animate-pulse" />
                  <span className="text-[11px] font-bold text-[#131B2E]">BUS-01 (Kukatpally)</span>
                </div>

                <div className="bg-[#00236F] text-white px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#FEA619] animate-pulse" />
                  <span className="text-[11px] font-bold">BUS-07: 6m ETA</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-white text-[11px] font-semibold">
                <span>Radius: 500m Auto-Geofence</span>
                <span className="bg-white/90 backdrop-blur-xs text-[#131B2E] px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  GPS Accuracy: ±1.2m
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Quick Actions (4 Buttons) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#444651] uppercase tracking-wider px-1">
            {getTranslation(lang, 'operationalActions')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Quick Action 1: Manage Students */}
            <button
              type="button"
              onClick={() => setStudentModalOpen(true)}
              className="h-14 px-3 bg-white rounded-2xl shadow-xs border border-[#E2E7FF] text-left flex items-center gap-2.5 active:scale-[0.98] transition-transform hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#00236F] shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131B2E] truncate">
                  {getTranslation(lang, 'actionStudents')}
                </p>
                <p className="text-[10px] text-[#444651] truncate">
                  {getTranslation(lang, 'actionStudentsSub')}
                </p>
              </div>
            </button>

            {/* Quick Action 2: Manage Drivers */}
            <button
              type="button"
              onClick={() => setDriverModalOpen(true)}
              className="h-14 px-3 bg-white rounded-2xl shadow-xs border border-[#E2E7FF] text-left flex items-center gap-2.5 active:scale-[0.98] transition-transform hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#00236F] shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131B2E] truncate">
                  {getTranslation(lang, 'actionDrivers')}
                </p>
                <p className="text-[10px] text-[#444651] truncate">
                  {getTranslation(lang, 'actionDriversSub')}
                </p>
              </div>
            </button>

            {/* Quick Action 3: Routes & Geofence */}
            <button
              type="button"
              onClick={() => setRoutesModalOpen(true)}
              className="h-14 px-3 bg-white rounded-2xl shadow-xs border border-[#E2E7FF] text-left flex items-center gap-2.5 active:scale-[0.98] transition-transform hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-xl bg-[#EAEDFF] flex items-center justify-center text-[#00236F] shrink-0">
                <RouteIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#131B2E] truncate">
                  {getTranslation(lang, 'actionRoutes')}
                </p>
                <p className="text-[10px] text-[#444651] truncate">
                  {getTranslation(lang, 'actionRoutesSub')}
                </p>
              </div>
            </button>

            {/* Quick Action 4: Broadcast */}
            <button
              type="button"
              onClick={() => setBroadcastModalOpen(true)}
              className="h-14 px-3 bg-[#00236F] text-white rounded-2xl shadow-sm text-left flex items-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {getTranslation(lang, 'actionBroadcast')}
                </p>
                <p className="text-[10px] text-[#B6C4FF] truncate">
                  {getTranslation(lang, 'actionBroadcastSub')}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Live Fleet Status Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-[#131B2E]">
              {getTranslation(lang, 'liveFleetStatus')}
            </h3>
            <span className="text-[10px] text-[#444651] font-bold">4 Active Focuses</span>
          </div>

          <div className="space-y-2">
            {store.buses.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-3 shadow-xs border border-[#E2E7FF] flex items-start justify-between relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#004A31]" />
                <div className="pl-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-black text-[#131B2E]">{b.busNumber}</span>
                    <span className="text-[11px] bg-[#F2F3FF] text-[#444651] px-2 py-0.5 rounded font-mono font-bold">
                      {b.plateNumber || 'TS 09 UA 1234'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EAEDFF] text-[#004A31] text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004A31] animate-pulse" />
                      <span>{b.status === 'READY' ? 'Ready' : b.status === 'COMPLETED' ? 'Completed' : 'Live • En Route'}</span>
                    </span>
                  </div>
                  <div className="text-xs text-[#444651] space-y-0.5">
                    <p>Driver: {b.driverName} {b.driverPhone ? `(${b.driverPhone})` : ''}</p>
                    <p className="font-semibold text-[#131B2E]">
                      Route: {lang === 'te' ? (b.routeNameTe || b.routeName) : b.routeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBus(b)}
                    className="w-9 h-9 rounded-xl bg-[#EAEDFF] hover:bg-[#DAE2FD] text-[#00236F] flex items-center justify-center active:scale-95 transition-all shadow-2xs border border-[#00236F]/20"
                    title="Edit Bus"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {b.driverPhone && (
                    <a
                      href={`tel:${b.driverPhone}`}
                      className="w-9 h-9 rounded-xl bg-[#F2F3FF] hover:bg-[#E2E7FF] text-[#00236F] flex items-center justify-center active:scale-95 transition-all shadow-2xs border border-[#E2E7FF]"
                      title="Call Driver"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => onTrackBus(b.id)}
                    className="w-9 h-9 rounded-xl bg-[#00236F] hover:bg-[#001c59] text-white flex items-center justify-center active:scale-95 transition-all shadow-xs"
                    title="Track Bus"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setAddBusModalOpen(true)}
              className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#00236F]/30 hover:border-[#00236F] bg-white text-[#00236F] text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'te' ? '+ కొత్త బస్సును ఫ్లీట్‌కు జోడించండి' : '+ Add New Bus to Fleet'}</span>
            </button>
          </div>
        </div>

        {/* Active Broadcast Preview Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#E2E7FF] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#131B2E]">
              {getTranslation(lang, 'schoolBroadcastPreview')}
            </span>
            <span className="text-xs text-[#00236F] font-bold">
              {getTranslation(lang, 'bilingualSmsEnabled')}
            </span>
          </div>

          <div className="bg-[#F2F3FF] p-3 rounded-xl space-y-1 border border-[#E2E7FF]">
            <p className="text-xs font-semibold text-[#131B2E]">
              "{enMsg}"
            </p>
            <p className="text-xs text-[#444651]">
              "{teMsg}"
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#444651]">
              {getTranslation(lang, 'deliveredToParents')}
            </span>
            <button
              type="button"
              onClick={() => setBroadcastModalOpen(true)}
              className="h-9 px-3.5 rounded-full bg-[#EAEDFF] text-[#00236F] font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'composeNew')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Manage Students */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131B2E]">
                    {getTranslation(lang, 'assignStudentRoute')}
                  </h3>
                  <p className="text-xs text-[#444651]">Link student to bus & parent mobile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#131B2E] mb-1">
                    Class & Section
                  </label>
                  <input
                    type="text"
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#131B2E] mb-1">
                    Assigned Bus
                  </label>
                  <select className="w-full h-11 px-3 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]">
                    <option>BUS-07 (Miyapur)</option>
                    <option>BUS-01 (Kukatpally)</option>
                    <option>BUS-04 (Nizampet)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  Primary Parent Phone
                </label>
                <input
                  type="tel"
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  Designated Pickup Stop
                </label>
                <input
                  type="text"
                  value={newStudentStop}
                  onChange={(e) => setNewStudentStop(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStudentModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-[#EAEDFF] text-[#131B2E] font-bold text-xs"
              >
                {getTranslation(lang, 'cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveStudent}
                className="flex-1 h-11 rounded-xl bg-[#00236F] text-white font-bold text-xs shadow-md"
              >
                {getTranslation(lang, 'saveStudent')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Manage Drivers */}
      {driverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131B2E]">
                    {getTranslation(lang, 'driverProfileRoster')}
                  </h3>
                  <p className="text-xs text-[#444651]">Commercial licensing & fleet assignments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDriverModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Driver Card */}
            <div className="bg-[#F2F3FF] p-3.5 rounded-2xl space-y-2.5 border border-[#E2E7FF]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#00236F] text-white font-black text-lg flex items-center justify-center">
                  RK
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#131B2E]">Ravi Kumar</h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#004A31] text-white text-[10px] font-bold">
                      Active On Route
                    </span>
                  </div>
                  <p className="text-xs text-[#444651]">License: DL-09201488219 (Commercial Heavy)</p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between py-1 bg-white px-2.5 rounded-lg border border-[#E2E7FF]">
                  <span className="text-[#444651]">Phone Contact</span>
                  <span className="font-bold text-[#131B2E]">+91 98765 43210</span>
                </div>
                <div className="flex justify-between py-1 bg-white px-2.5 rounded-lg border border-[#E2E7FF]">
                  <span className="text-[#444651]">Assigned Vehicle</span>
                  <span className="font-bold text-[#00236F]">BUS-07 (Miyapur Route)</span>
                </div>
                <div className="flex justify-between py-1 bg-white px-2.5 rounded-lg border border-[#E2E7FF]">
                  <span className="text-[#444651]">Safety Rating</span>
                  <span className="font-bold text-[#004A31]">⭐ 4.9 / 5.0 (12 Yrs Safe)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href="tel:+919876543210"
                className="flex-1 h-11 rounded-xl bg-[#004A31] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-4 h-4" />
                <span>Call Ravi Kumar</span>
              </a>
              <button
                type="button"
                onClick={() => setDriverModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-[#EAEDFF] text-[#131B2E] font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Routes & Geofence Slider */}
      {routesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EAEDFF] text-[#00236F] flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131B2E]">
                    {getTranslation(lang, 'geofenceRadiiTitle')}
                  </h3>
                  <p className="text-xs text-[#444651]">Parent proximity notifications trigger</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoutesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F2F3FF] p-3.5 rounded-2xl space-y-2 border border-[#E2E7FF]">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#131B2E]">
                    {getTranslation(lang, 'approachingNotificationRadius')}
                  </label>
                  <span className="text-base font-black text-[#00236F] bg-white px-2.5 py-0.5 rounded-full border border-[#E2E7FF]">
                    {geofenceRadius}m
                  </span>
                </div>
                <p className="text-[11px] text-[#444651]">
                  Parents automatically receive an SMS & WhatsApp ping when the bus crosses this
                  radial safety perimeter.
                </p>

                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-full accent-[#00236F] cursor-pointer"
                />

                <div className="flex justify-between text-[10px] font-bold text-[#757682]">
                  <span>200m (Dense Urban)</span>
                  <span>500m (Standard)</span>
                  <span>1500m (Highways)</span>
                </div>
              </div>

              {/* Stop sequencing */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#131B2E]">BUS-07 Stop Sequencing</h4>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded-xl bg-[#F2F3FF] flex justify-between">
                    <span>1. Miyapur Cross Roads (6:50 AM)</span>
                    <span className="text-[#004A31] font-bold">Passed</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F2F3FF] flex justify-between">
                    <span>2. Allwyn Colony Center (7:05 AM)</span>
                    <span className="text-[#004A31] font-bold">Passed</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#EAEDFF] flex justify-between border border-[#00236F]">
                    <span className="font-bold text-[#00236F]">3. Main Road Stop (Sadvik)</span>
                    <span className="text-[#855300] font-black animate-pulse">Next Stop</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyGeofence}
              className="w-full h-11 rounded-xl bg-[#00236F] text-white font-bold text-xs shadow-md"
            >
              {getTranslation(lang, 'applyGeofence')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Compose Bilingual Broadcast */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFDDB8] text-[#855300] flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-[#855300]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#131B2E]">
                    {getTranslation(lang, 'composeSchoolAlert')}
                  </h3>
                  <p className="text-xs text-[#444651]">Sends high-priority bilingual mobile alerts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#131B2E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  {getTranslation(lang, 'targetAudience')}
                </label>
                <select
                  value={broadcastAudience}
                  onChange={(e) => setBroadcastAudience(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-semibold focus:outline-none border border-[#E2E7FF]"
                >
                  <option value="all">All 420 Parents & Bus Monitors</option>
                  <option value="bus07">BUS-07 Route Families Only (38)</option>
                  <option value="bus01">BUS-01 Route Families Only (42)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  {getTranslation(lang, 'englishMessage')}
                </label>
                <textarea
                  rows={2}
                  value={enMsg}
                  onChange={(e) => setEnMsg(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-medium focus:outline-none border border-[#E2E7FF] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#131B2E] mb-1">
                  {getTranslation(lang, 'teluguMessage')}
                </label>
                <textarea
                  rows={2}
                  value={teMsg}
                  onChange={(e) => setTeMsg(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#F2F3FF] text-[#131B2E] text-xs font-medium focus:outline-none border border-[#E2E7FF] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-[#EAEDFF] text-[#131B2E] font-bold text-xs"
              >
                {getTranslation(lang, 'cancel')}
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                className="flex-1 h-11 rounded-xl bg-[#00236F] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>{getTranslation(lang, 'sendBroadcast')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Edit School Details */}
      {schoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    {lang === 'te' ? 'పాఠశాల వివరాలు ఎడిట్ చేయండి' : 'Edit School Details'}
                  </h3>
                  <p className="text-xs text-[#757682]">
                    {lang === 'te' ? 'పేరు, చిరునామా, అత్యవసర ఫోన్ నంబర్లు' : 'Name, Campus Address & Emergency Contacts'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSchoolModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchool} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'పాఠశాల పేరు (English)' : 'School Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSchoolName}
                    onChange={(e) => setFormSchoolName(e.target.value)}
                    placeholder="e.g. Sri Chaitanya School"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'పాఠశాల పేరు (తెలుగు)' : 'School Name (Telugu)'}
                  </label>
                  <input
                    type="text"
                    value={formSchoolNameTe}
                    onChange={(e) => setFormSchoolNameTe(e.target.value)}
                    placeholder="ఉదా: శ్రీ చైతన్య స్కూల్"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'పాఠశాల పూర్తి చిరునామా (English)' : 'Campus Full Address (English)'}
                </label>
                <input
                  type="text"
                  required
                  value={formSchoolAddress}
                  onChange={(e) => setFormSchoolAddress(e.target.value)}
                  placeholder="Street, Area, City, Pin"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'పాఠశాల పూర్తి చిరునామా (తెలుగు)' : 'Campus Full Address (Telugu)'}
                </label>
                <input
                  type="text"
                  value={formSchoolAddressTe}
                  onChange={(e) => setFormSchoolAddressTe(e.target.value)}
                  placeholder="వీధి, ప్రాంతం, నగరం, పిన్‌కోడ్"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'ఆఫీస్ ఫోన్ నంబర్' : 'Office Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formSchoolPhone}
                    onChange={(e) => setFormSchoolPhone(e.target.value)}
                    placeholder="+91 40 2988 1234"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'అత్యవసర కాంటాక్ట్' : 'Emergency Contact'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formSchoolEmergency}
                    onChange={(e) => setFormSchoolEmergency(e.target.value)}
                    placeholder="+91 94400 11223"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'రవాణా ఇన్‌ఛార్జ్ పేరు' : 'Transport Head'}
                  </label>
                  <input
                    type="text"
                    value={formSchoolHead}
                    onChange={(e) => setFormSchoolHead(e.target.value)}
                    placeholder="e.g. M. V. Rao"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
              </div>

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
                  onClick={() => setSchoolModalOpen(false)}
                  className="px-5 py-3 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Edit Bus Details */}
      {editBusModalOpen && selectedBus && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#131B2E]">
                  {lang === 'te' ? 'బస్సు వివరాలు ఎడిట్ చేయండి' : `Edit Bus: ${selectedBus.busNumber}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditBusModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBus} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'బస్సు నంబర్' : 'Bus Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formBusNumber}
                    onChange={(e) => setFormBusNumber(e.target.value)}
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'వెహికల్ ప్లేట్ నం.' : 'Plate Number'}
                  </label>
                  <input
                    type="text"
                    value={formBusPlate}
                    onChange={(e) => setFormBusPlate(e.target.value)}
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'రూట్ పేరు (English)' : 'Route Name (English)'}
                </label>
                <input
                  type="text"
                  value={formBusRoute}
                  onChange={(e) => setFormBusRoute(e.target.value)}
                  placeholder="e.g. Miyapur ➔ School"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'రూట్ పేరు (తెలుగు)' : 'Route Name (Telugu)'}
                </label>
                <input
                  type="text"
                  value={formBusRouteTe}
                  onChange={(e) => setFormBusRouteTe(e.target.value)}
                  placeholder="ఉదా: మియాపూర్ ➔ స్కూల్"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'డ్రైవర్ పేరు' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    value={formBusDriverName}
                    onChange={(e) => setFormBusDriverName(e.target.value)}
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'డ్రైవర్ ఫోన్' : 'Driver Phone'}
                  </label>
                  <input
                    type="tel"
                    value={formBusDriverPhone}
                    onChange={(e) => setFormBusDriverPhone(e.target.value)}
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
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
                  onClick={() => setEditBusModalOpen(false)}
                  className="px-4 py-2.5 bg-[#EAEDFF] text-[#131B2E] rounded-xl font-bold text-xs"
                >
                  {lang === 'te' ? 'రద్దు' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: Add New Bus to Fleet */}
      {addBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#004A31] text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#131B2E]">
                  {lang === 'te' ? 'కొత్త బస్సును జోడించండి' : 'Add New Bus to Fleet'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddBusModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EAEDFF] text-[#131B2E] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewBus} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'బస్సు నంబర్' : 'Bus Number'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value)}
                    placeholder="e.g. BUS-09"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'వెహికల్ ప్లేట్ నం.' : 'Plate Number'}
                  </label>
                  <input
                    type="text"
                    value={newBusPlate}
                    onChange={(e) => setNewBusPlate(e.target.value)}
                    placeholder="e.g. TS 09 UA 9988"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'రూట్ పేరు (English)' : 'Route Name (English)'}
                </label>
                <input
                  type="text"
                  value={newBusRoute}
                  onChange={(e) => setNewBusRoute(e.target.value)}
                  placeholder="e.g. Madhapur ➔ Campus"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'రూట్ పేరు (తెలుగు)' : 'Route Name (Telugu)'}
                </label>
                <input
                  type="text"
                  value={newBusRouteTe}
                  onChange={(e) => setNewBusRouteTe(e.target.value)}
                  placeholder="ఉదా: మాదాపూర్ ➔ క్యాంపస్"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'డ్రైవర్ పేరు' : 'Driver Name'}
                  </label>
                  <input
                    type="text"
                    value={newBusDriverName}
                    onChange={(e) => setNewBusDriverName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'డ్రైవర్ ఫోన్' : 'Driver Phone'}
                  </label>
                  <input
                    type="tel"
                    value={newBusDriverPhone}
                    onChange={(e) => setNewBusDriverPhone(e.target.value)}
                    placeholder="+91 98480 12345"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#004A31] hover:bg-[#003825] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'te' ? 'బస్సును చేర్చండి' : 'Add Bus'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddBusModalOpen(false)}
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
