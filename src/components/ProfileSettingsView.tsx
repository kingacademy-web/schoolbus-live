import React, { useState } from 'react';
import {
  Globe,
  User,
  Bell,
  ShieldCheck,
  Headphones,
  LogOut,
  Check,
  ChevronRight,
  School,
  Bus as BusIcon,
  Phone,
  Mail,
  RotateCcw,
  Radio,
  Pencil,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Building,
  MapPin,
  Lock,
  KeyRound,
} from 'lucide-react';
import { store } from '../services/store';
import { Language, UserRole } from '../types';
import { getTranslation } from '../i18n/translations';

interface ProfileSettingsViewProps {
  lang: Language;
  role: UserRole;
  onSelectRole: (newRole: UserRole) => void;
  onOpenStaffAuth?: (initialRole?: 'DRIVER' | 'ADMIN') => void;
  onLogout?: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  lang,
  role,
  onSelectRole,
  onOpenStaffAuth,
  onLogout,
}) => {
  const [prefGeofence, setPrefGeofence] = useState(true);
  const [prefStarted, setPrefStarted] = useState(true);
  const [prefCompleted, setPrefCompleted] = useState(true);
  const [prefBroadcast, setPrefBroadcast] = useState(true);
  const [schoolModalOpen, setSchoolModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // School form states
  const [formSchoolName, setFormSchoolName] = useState(store.schoolInfo.name);
  const [formSchoolNameTe, setFormSchoolNameTe] = useState(store.schoolInfo.nameTe);
  const [formSchoolAddress, setFormSchoolAddress] = useState(store.schoolInfo.address);
  const [formSchoolAddressTe, setFormSchoolAddressTe] = useState(store.schoolInfo.addressTe);
  const [formSchoolPhone, setFormSchoolPhone] = useState(store.schoolInfo.phone);
  const [formSchoolEmergency, setFormSchoolEmergency] = useState(store.schoolInfo.emergencyContact);
  const [formSchoolEmail, setFormSchoolEmail] = useState(store.schoolInfo.email);
  const [formSchoolHead, setFormSchoolHead] = useState(store.schoolInfo.transportHeadName);

  // Admin Credential Management state
  const [editingCredentials, setEditingCredentials] = useState(false);
  const [newDriverPin, setNewDriverPin] = useState(store.driverPin);
  const [newAdminPass, setNewAdminPass] = useState(store.adminPassword);

  const student = store.getStudent();
  const students = store.students;
  const driver = store.getDriver();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleLang = (selectedLang: Language) => {
    store.setLanguage(selectedLang);
  };

  const handleSelectStudent = (studentId: string) => {
    store.setSelectedStudent(studentId);
  };

  const handleOpenEditSchool = () => {
    setFormSchoolName(store.schoolInfo.name);
    setFormSchoolNameTe(store.schoolInfo.nameTe);
    setFormSchoolAddress(store.schoolInfo.address);
    setFormSchoolAddressTe(store.schoolInfo.addressTe);
    setFormSchoolPhone(store.schoolInfo.phone);
    setFormSchoolEmergency(store.schoolInfo.emergencyContact);
    setFormSchoolEmail(store.schoolInfo.email);
    setFormSchoolHead(store.schoolInfo.transportHeadName);
    setSchoolModalOpen(true);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSchoolInfo({
      name: formSchoolName,
      nameTe: formSchoolNameTe,
      address: formSchoolAddress,
      addressTe: formSchoolAddressTe,
      phone: formSchoolPhone,
      emergencyContact: formSchoolEmergency,
      email: formSchoolEmail,
      transportHeadName: formSchoolHead,
    });
    setSchoolModalOpen(false);
    showToast(lang === 'te' ? 'పాఠశాల వివరాలు విజయవంతంగా అప్‌డేట్ చేయబడ్డాయి!' : 'School details successfully updated!');
  };

  const handleResetData = () => {
    const confirmMessage =
      lang === 'te'
        ? 'మీరు నిజంగా అన్ని వివరాలను (విద్యార్థులు, డ్రైవర్లు, బస్సులు, పాఠశాల సమాచారం) మొదటి డెమో స్థితికి రీసెట్ చేయాలనుకుంటున్నారా?'
        : 'Are you sure you want to reset all modified data (students, drivers, buses, school info) back to factory demo defaults?';
    if (window.confirm(confirmMessage)) {
      store.resetAllToDefault();
      showToast(lang === 'te' ? 'అన్ని వివరాలు డెమో స్థితికి రీసెట్ చేయబడ్డాయి!' : 'All data reset to factory demo defaults!');
    }
  };

  // Dynamic user display info
  const headerName =
    role === 'PARENT'
      ? `${student ? (lang === 'te' ? student.nameTe : student.name) : 'Sadvik'} (Parent)`
      : role === 'DRIVER'
      ? `${driver ? (lang === 'te' ? driver.nameTe : driver.name) : 'Ravi Kumar'} (Driver)`
      : `${store.schoolInfo.transportHeadName || 'Transport Incharge'} (Admin)`;

  const headerContact =
    role === 'PARENT'
      ? `${student?.parentPhone || '+91 99887 76655'} • Primary Guardian`
      : role === 'DRIVER'
      ? `${driver?.phone || '+91 98765 43210'} • Commercial Heavy`
      : `${store.schoolInfo.email} • ${store.schoolInfo.phone}`;

  const headerInitials =
    role === 'PARENT'
      ? (student?.name ? student.name.substring(0, 2).toUpperCase() : 'SS')
      : role === 'DRIVER'
      ? (driver?.name ? driver.name.substring(0, 2).toUpperCase() : 'RK')
      : 'AD';

  return (
    <div className="flex flex-col w-full px-4 gap-4 pb-24 pt-2 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#00236F] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-[#4EDEA3]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#00236F] text-white flex items-center justify-center font-black text-xl shadow-xs">
            {headerInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-base font-extrabold text-[#131B2E] truncate">
              {headerName}
            </h2>
            <p className="text-xs text-[#444651] truncate">
              {headerContact}
            </p>
            <span className="text-[11px] text-[#004A31] font-bold mt-0.5">
              Verified School Credentials ✓
            </span>
          </div>
        </div>
      </div>

      {/* Child / Student Switcher (For Parents with multiple children) */}
      {role === 'PARENT' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#131B2E]">
              {getTranslation(lang, 'switchStudent')}
            </span>
            <span className="text-[11px] text-[#757682]">2 Children Enrolled</span>
          </div>

          <div className="flex flex-col gap-2">
            {students.map((std) => (
              <button
                key={std.id}
                type="button"
                onClick={() => handleSelectStudent(std.id)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                  student?.id === std.id
                    ? 'bg-[#EAEDFF] border-[#00236F] text-[#00236F]'
                    : 'bg-[#F2F3FF] border-[#E2E7FF] text-[#131B2E] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={std.photoUrl}
                    alt={std.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#C5C5D3]"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {lang === 'te' ? std.nameTe : std.name}
                    </span>
                    <span className="text-[10px] text-[#444651]">
                      {std.class} • {std.section} • Roll #{std.rollNo}
                    </span>
                  </div>
                </div>

                {student?.id === std.id && (
                  <span className="w-6 h-6 rounded-full bg-[#00236F] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Application Language Toggle Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00236F]" />
          <h3 className="text-xs font-bold text-[#131B2E]">
            {getTranslation(lang, 'switchLanguage')} / భాష
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleLang('en')}
            className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
              lang === 'en'
                ? 'bg-[#00236F] text-white border-[#00236F] shadow-xs'
                : 'bg-[#F2F3FF] text-[#444651] border-[#E2E7FF]'
            }`}
          >
            <span>English</span>
            {lang === 'en' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => handleToggleLang('te')}
            className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
              lang === 'te'
                ? 'bg-[#00236F] text-white border-[#00236F] shadow-xs'
                : 'bg-[#F2F3FF] text-[#444651] border-[#E2E7FF]'
            }`}
          >
            <span>తెలుగు (Telugu)</span>
            {lang === 'te' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Staff & Driver Security Access Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#00236F]" />
            <h3 className="text-xs font-bold text-[#131B2E]">
              {role === 'PARENT'
                ? getTranslation(lang, 'staffSectionTitle')
                : getTranslation(lang, 'activeStaffSession')}
            </h3>
          </div>
          {role !== 'PARENT' && (
            <span className="bg-[#FFDDB8] text-[#2A1700] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {role} SESSION
            </span>
          )}
        </div>

        {role === 'PARENT' ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-[11px] text-[#444651] leading-relaxed">
              {getTranslation(lang, 'staffSectionDesc')}
            </p>

            <button
              type="button"
              onClick={() => onOpenStaffAuth?.('DRIVER')}
              className="p-3 rounded-xl border border-[#E2E7FF] bg-[#F2F3FF] hover:bg-[#EAEDFF] flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center shrink-0">
                  <BusIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5">
                    <span>{getTranslation(lang, 'accessDriverBtn')}</span>
                    <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">PIN 🔒</span>
                  </span>
                  <span className="text-[10px] text-[#757682]">
                    {lang === 'te' ? '4-అంకెల డ్రైవర్ సెక్యూరిటీ పిన్ అవసరం' : 'Requires 4-digit Driver PIN'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#757682]" />
            </button>

            <button
              type="button"
              onClick={() => onOpenStaffAuth?.('ADMIN')}
              className="p-3 rounded-xl border border-[#E2E7FF] bg-[#F2F3FF] hover:bg-[#EAEDFF] flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center shrink-0">
                  <School className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5">
                    <span>{getTranslation(lang, 'accessAdminBtn')}</span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.2 rounded">PASS 🔒</span>
                  </span>
                  <span className="text-[10px] text-[#757682]">
                    {lang === 'te' ? 'అడ్మిన్ నిర్వహణ పాస్‌వర్డ్ అవసరం' : 'Requires Admin Management Password'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#757682]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-[#F2F3FF] border border-[#E2E7FF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#131B2E]">
                    {role === 'DRIVER'
                      ? `${driver?.name || 'Ravi Kumar'} (Driver Console)`
                      : `${store.schoolInfo.transportHeadName || 'Administrator'} (Fleet Admin)`}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-medium">
                    {lang === 'te' ? 'సిబ్బందిగా ధృవీకరించబడ్డారు' : 'Staff Authenticated & Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  store.logoutStaff();
                }
              }}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{getTranslation(lang, 'logoutReturnParent')}</span>
            </button>

            {/* Admin Credential Management (Only for Admin) */}
            {role === 'ADMIN' && (
              <div className="mt-2 pt-3 border-t border-[#E2E7FF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#131B2E] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#00236F]" />
                    <span>{lang === 'te' ? 'పిన్ & పాస్‌వర్డ్ నిర్వహణ' : 'Manage Security Credentials'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingCredentials(!editingCredentials)}
                    className="text-xs text-[#00236F] font-bold hover:underline"
                  >
                    {editingCredentials ? (lang === 'te' ? 'రద్దు' : 'Cancel') : (lang === 'te' ? 'మార్చు' : 'Change')}
                  </button>
                </div>

                {editingCredentials ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newDriverPin.trim().length >= 4) {
                        store.updateDriverPin(newDriverPin.trim());
                      }
                      if (newAdminPass.trim().length >= 4) {
                        store.updateAdminPassword(newAdminPass.trim());
                      }
                      setEditingCredentials(false);
                      showToast(lang === 'te' ? 'పాస్‌వర్డ్‌లు విజయవంతంగా మార్చబడ్డాయి!' : 'Credentials updated successfully!');
                    }}
                    className="flex flex-col gap-2.5 bg-[#F2F3FF] p-3 rounded-xl border border-[#E2E7FF]"
                  >
                    <div>
                      <label className="text-[10px] font-bold text-[#444651] block mb-1">
                        {getTranslation(lang, 'changeDriverPinTitle')} (4 digits)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newDriverPin}
                        onChange={(e) => setNewDriverPin(e.target.value)}
                        placeholder="1234"
                        className="w-full bg-white border border-[#C5C5D3] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#444651] block mb-1">
                        {getTranslation(lang, 'changeAdminPassTitle')}
                      </label>
                      <input
                        type="text"
                        required
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="admin@123"
                        className="w-full bg-white border border-[#C5C5D3] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-[#00236F] text-white py-2 rounded-lg text-xs font-bold mt-1 shadow-xs hover:bg-[#001c59]"
                    >
                      {getTranslation(lang, 'updateCredentialsBtn')}
                    </button>
                  </form>
                ) : (
                  <div className="text-[11px] text-[#757682] space-y-1 bg-[#F2F3FF] p-2.5 rounded-xl">
                    <div className="flex justify-between">
                      <span>Driver PIN:</span>
                      <span className="font-mono font-bold text-[#131B2E]">{store.driverPin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Admin Password:</span>
                      <span className="font-mono font-bold text-[#131B2E]">••••••••</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* GPS Engine Mode (LIVE vs DEMO) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00236F]" />
            <span className="text-xs font-bold text-[#131B2E]">
              {lang === 'te' ? 'జీపీఎస్ ఇంజిన్ మోడ్' : 'GPS Engine Mode'}
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              store.gpsMode === 'LIVE'
                ? 'bg-[#004A31] text-emerald-100'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {store.gpsMode === 'LIVE' ? 'LIVE GPS ACTIVE' : 'DEMO SIMULATION'}
          </span>
        </div>

        <p className="text-[11px] text-[#444651] leading-relaxed">
          {store.gpsMode === 'LIVE'
            ? 'Using real hardware navigator.geolocation.watchPosition with high accuracy, adaptive throttling (3s/5s/10s), and Firebase Realtime Database.'
            : 'Using animated demo simulation along Ghanpur route to Sri Chaitanya School campus for testing without real road movement.'}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => store.setGpsMode('LIVE')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              store.gpsMode === 'LIVE'
                ? 'bg-[#004A31] text-white border-[#004A31] shadow-xs'
                : 'bg-[#F2F3FF] text-[#131B2E] border-[#E2E7FF] hover:bg-gray-100'
            }`}
          >
            <span>🛰️ Live GPS</span>
            {store.gpsMode === 'LIVE' && <Check className="w-3.5 h-3.5 text-[#4EDEA3]" />}
          </button>

          <button
            type="button"
            onClick={() => store.setGpsMode('DEMO')}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              store.gpsMode === 'DEMO'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-[#F2F3FF] text-[#131B2E] border-[#E2E7FF] hover:bg-gray-100'
            }`}
          >
            <span>🎮 Demo Sim</span>
            {store.gpsMode === 'DEMO' && <Check className="w-3.5 h-3.5 text-amber-200" />}
          </button>
        </div>
      </div>

      {/* Proximity Notification Preferences */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E2E7FF] space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00236F]" />
          <h3 className="text-xs font-bold text-[#131B2E]">
            {getTranslation(lang, 'notificationPrefs')}
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <label className="flex items-center justify-between p-2 rounded-xl bg-[#F2F3FF] cursor-pointer">
            <span>{getTranslation(lang, 'alertApproaching500m')}</span>
            <input
              type="checkbox"
              checked={prefGeofence}
              onChange={(e) => setPrefGeofence(e.target.checked)}
              className="w-4 h-4 accent-[#00236F]"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-[#F2F3FF] cursor-pointer">
            <span>{getTranslation(lang, 'alertTripStarted')}</span>
            <input
              type="checkbox"
              checked={prefStarted}
              onChange={(e) => setPrefStarted(e.target.checked)}
              className="w-4 h-4 accent-[#00236F]"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-[#F2F3FF] cursor-pointer">
            <span>{getTranslation(lang, 'alertTripCompleted')}</span>
            <input
              type="checkbox"
              checked={prefCompleted}
              onChange={(e) => setPrefCompleted(e.target.checked)}
              className="w-4 h-4 accent-[#00236F]"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-[#F2F3FF] cursor-pointer">
            <span>{getTranslation(lang, 'alertEmergencyBroadcast')}</span>
            <input
              type="checkbox"
              checked={prefBroadcast}
              onChange={(e) => setPrefBroadcast(e.target.checked)}
              className="w-4 h-4 accent-[#00236F]"
            />
          </label>
        </div>
      </div>

      {/* School Transport Help Contact Info */}
      <div className="bg-[#F2F3FF] rounded-2xl p-4 border border-[#E2E7FF] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#00236F]" />
            <h3 className="text-xs font-bold text-[#131B2E]">
              {getTranslation(lang, 'schoolContactInfo')}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleOpenEditSchool}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-[#00236F] px-2.5 py-1 rounded-full text-xs font-bold transition-all border border-[#00236F]/20 shadow-2xs"
          >
            <Pencil className="w-3 h-3 text-[#00236F]" />
            <span>{lang === 'te' ? 'ఎడిట్' : 'Edit'}</span>
          </button>
        </div>

        {/* School Logo & Brand Banner */}
        <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#E2E7FF]">
          <div className="w-13 h-13 rounded-xl bg-white shrink-0 overflow-hidden border border-[#E2E7FF] p-1 flex items-center justify-center shadow-2xs">
            <img
              src="./school-logo.png"
              alt={store.schoolInfo.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-sm text-[#131B2E] truncate">
              {lang === 'te' ? store.schoolInfo.nameTe : store.schoolInfo.name}
            </span>
            <span className="text-[11px] text-[#444651] line-clamp-2 leading-tight">
              {lang === 'te' ? store.schoolInfo.addressTe : store.schoolInfo.address}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs text-[#444651]">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#00236F] shrink-0" />
            <a href={`tel:${store.schoolInfo.phone}`} className="font-bold text-[#00236F] hover:underline">
              {store.schoolInfo.phone}
            </a>
            <span className="text-[10px] text-[#757682]">({lang === 'te' ? 'ఆఫీస్' : 'Office'})</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <a href={`tel:${store.schoolInfo.emergencyContact}`} className="font-bold text-red-600 hover:underline">
              {store.schoolInfo.emergencyContact}
            </a>
            <span className="text-[10px] text-[#757682]">({lang === 'te' ? 'అత్యవసరం' : 'Emergency'})</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#00236F] shrink-0" />
            <a href={`mailto:${store.schoolInfo.email}`} className="text-[#00236F] hover:underline truncate">
              {store.schoolInfo.email}
            </a>
          </div>
        </div>
      </div>

      {/* Data Management: Reset to Factory Demo */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E7FF] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#757682]" />
            <span className="text-xs font-bold text-[#131B2E]">
              {lang === 'te' ? 'డేటా రీసెట్' : 'Data Management'}
            </span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {lang === 'te' ? 'డివైస్‌లో సేవ్ చేయబడింది' : 'Saved Locally'}
          </span>
        </div>
        <p className="text-[11px] text-[#757682]">
          {lang === 'te'
            ? 'మీరు ఎడిట్ చేసిన వివరాలన్నీ మీ బ్రౌజర్‌లో సురక్షితంగా సేవ్ చేయబడతాయి. మళ్లీ మొదట ఉన్న డెమో డేటా కావాలంటే రీసెట్ చేయవచ్చు.'
            : 'All your customized edits are saved locally. You can restore default demo data at any time.'}
        </p>
        <button
          type="button"
          onClick={handleResetData}
          className="w-full mt-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'te' ? 'డిఫాల్ట్ డెమో డేటాకు రీసెట్ చేయండి' : 'Reset All to Factory Demo Data'}</span>
        </button>
      </div>

      {/* Privacy and Security Guarantee */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E7FF] space-y-1 text-xs">
        <div className="flex items-center gap-2 text-[#004A31] font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>{getTranslation(lang, 'privacySafety')}</span>
        </div>
        <p className="text-[#444651] leading-relaxed text-[11px]">
          {getTranslation(lang, 'privacyText')}
        </p>
      </div>

      {/* MODAL: Edit School Details */}
      {schoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E7FF] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#00236F] text-white flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#131B2E]">
                    {lang === 'te' ? 'పాఠశాల వివరాలు ఎడిట్ చేయండి' : 'Edit School & Transport Details'}
                  </h3>
                  <p className="text-[11px] text-[#444651]">
                    {lang === 'te' ? 'పాఠశాల పేరు, చిరునామా, అత్యవసర నంబర్లు' : 'Update campus details & emergency contacts'}
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

            <form onSubmit={handleSaveSchool} className="flex flex-col gap-3">
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
                  required
                  value={formSchoolNameTe}
                  onChange={(e) => setFormSchoolNameTe(e.target.value)}
                  placeholder="ఉదా: శ్రీ చైతన్య స్కూల్"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444651] block mb-1">
                  {lang === 'te' ? 'పాఠశాల పూర్తి చిరునామా (English)' : 'Campus Full Address (English)'}
                </label>
                <input
                  type="text"
                  value={formSchoolAddress}
                  onChange={(e) => setFormSchoolAddress(e.target.value)}
                  placeholder="Ghanpur (Stn), Jangaon, TG - 506143"
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
                  placeholder="స్టేషన్ ఘన్‌పూర్, జనగాం, తెలంగాణ - 506143"
                  className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'ఆఫీస్ ఫోన్ నంబర్' : 'Office Phone'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formSchoolPhone}
                    onChange={(e) => setFormSchoolPhone(e.target.value)}
                    placeholder="+91 99510 44459"
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
                    placeholder="+91 99510 44469"
                    className="w-full bg-[#F2F3FF] border border-[#C5C5D3] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-[#00236F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#444651] block mb-1">
                    {lang === 'te' ? 'ఈమెయిల్ అడ్రస్' : 'School Email'}
                  </label>
                  <input
                    type="email"
                    value={formSchoolEmail}
                    onChange={(e) => setFormSchoolEmail(e.target.value)}
                    placeholder="transport@school.edu"
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
                  className="flex-1 bg-[#00236F] hover:bg-[#001c59] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
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
    </div>
  );
};
