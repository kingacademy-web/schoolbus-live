import React, { useEffect, useState } from 'react';
import { store } from './services/store';
import { Language, UserRole } from './types';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ParentHomeView } from './components/ParentHomeView';
import { LiveMapView } from './components/LiveMapView';
import { DriverPortalView } from './components/DriverPortalView';
import { AdminFleetView } from './components/AdminFleetView';
import { AlertsView } from './components/AlertsView';
import { ProfileSettingsView } from './components/ProfileSettingsView';
import { AlertTriangle, WifiOff, X } from 'lucide-react';

export default function App() {
  const [, setTick] = useState(0);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [acknowledgedEmergency, setAcknowledgedEmergency] = useState(false);

  // Re-render when store updates
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const lang: Language = store.language;
  const role: UserRole = store.role;
  const unreadAlerts = store.notifications.filter((n) => !n.read).length;
  const activeEmergency = !acknowledgedEmergency && store.notifications.find(
    (n) => n.type === 'bus_stopped' || (n.titleEn && (n.titleEn.toLowerCase().includes('emergency') || n.titleEn.toLowerCase().includes('sos')))
  );

  const handleSelectRole = (newRole: UserRole) => {
    store.setRole(newRole);
    if (newRole === 'DRIVER') {
      setCurrentTab('driver_portal');
    } else if (newRole === 'ADMIN') {
      setCurrentTab('admin_fleet');
    } else {
      setCurrentTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        lang={lang}
        role={role}
        onOpenProfile={() => setCurrentTab('profile')}
        onOpenAlerts={() => setCurrentTab('alerts')}
        unreadCount={unreadAlerts}
        gpsMode={store.gpsMode}
      />

      {/* Offline Status Warning Ribbon */}
      {isOffline && (
        <div className="fixed top-18 left-0 right-0 z-40 bg-amber-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <WifiOff className="w-3.5 h-3.5" />
          <span>
            {lang === 'te'
              ? 'ఆఫ్‌లైన్ మోడ్: GPS డేటా IndexedDB లో సేవ్ అవుతుంది, నెట్‌వర్క్ రాగానే సింక్ అవుతుంది.'
              : 'Offline Mode: GPS points queued in IndexedDB. Will auto-sync on reconnect.'}
          </span>
        </div>
      )}

      {/* High-Visibility Emergency SOS Broadcast Ribbon */}
      {activeEmergency && (
        <div className="fixed top-18 left-0 right-0 z-40 bg-[#BA1A1A] text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>
              🚨 <strong>EMERGENCY SOS:</strong> {lang === 'te' ? activeEmergency.messageTe : activeEmergency.messageEn}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAcknowledgedEmergency(true)}
            className="bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider shrink-0"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-18">
        {currentTab === 'home' && (
          <ParentHomeView
            lang={lang}
            onNavigateToLive={() => setCurrentTab('live')}
            onNavigateToDriver={() => {
              store.setRole('DRIVER');
              setCurrentTab('driver_portal');
            }}
          />
        )}

        {currentTab === 'live' && <LiveMapView lang={lang} />}

        {currentTab === 'alerts' && <AlertsView lang={lang} />}

        {currentTab === 'profile' && (
          <ProfileSettingsView
            lang={lang}
            role={role}
            onSelectRole={handleSelectRole}
          />
        )}

        {currentTab === 'driver_portal' && <DriverPortalView lang={lang} />}

        {currentTab === 'admin_fleet' && (
          <AdminFleetView
            lang={lang}
            onTrackBus={(busId) => {
              store.activeBusId = busId;
              setCurrentTab('live');
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'driver_portal' && role !== 'DRIVER') {
            store.setRole('DRIVER');
          } else if (tab === 'admin_fleet' && role !== 'ADMIN') {
            store.setRole('ADMIN');
          } else if ((tab === 'home' || tab === 'live') && role !== 'PARENT') {
            store.setRole('PARENT');
          }
          setCurrentTab(tab);
        }}
        lang={lang}
        role={role}
        unreadAlerts={unreadAlerts}
      />
    </div>
  );
}
