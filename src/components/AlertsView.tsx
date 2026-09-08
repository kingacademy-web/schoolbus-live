import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  Megaphone,
  Radio,
  Clock,
  AlertTriangle,
  Inbox,
  CheckCheck,
} from 'lucide-react';
import { store } from '../services/store';
import { Language, NotificationItem } from '../types';
import { getTranslation } from '../i18n/translations';

interface AlertsViewProps {
  lang: Language;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ lang }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'approaching' | 'announcements'>('all');
  const notifications = store.notifications;

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'approaching') {
      return item.type === 'bus_approaching';
    }
    if (activeFilter === 'announcements') {
      return item.type === 'school_announcement';
    }
    return true;
  });

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead();
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'bus_approaching':
        return <Radio className="w-5 h-5 text-[#855300]" />;
      case 'bus_started':
        return <CheckCircle className="w-5 h-5 text-[#004A31]" />;
      case 'school_announcement':
        return <Megaphone className="w-5 h-5 text-[#00236F]" />;
      case 'bus_delayed':
      case 'bus_stopped':
        return <AlertTriangle className="w-5 h-5 text-[#BA1A1A]" />;
      default:
        return <Bell className="w-5 h-5 text-[#4059AA]" />;
    }
  };

  return (
    <div className="flex flex-col w-full px-4 gap-4 pb-24 pt-2">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-[#131B2E]">
            {getTranslation(lang, 'alertsTitle')}
          </h2>
          <p className="text-xs text-[#444651]">Realtime updates & transit safety alerts</p>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="flex items-center gap-1 text-xs font-bold text-[#00236F] hover:underline bg-[#EAEDFF] px-2.5 py-1 rounded-full"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{getTranslation(lang, 'markAllRead')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-[#00236F] text-white shadow-xs'
              : 'bg-white text-[#444651] border border-[#E2E7FF]'
          }`}
        >
          {getTranslation(lang, 'filterAll')} ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('approaching')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'approaching'
              ? 'bg-[#00236F] text-white shadow-xs'
              : 'bg-white text-[#444651] border border-[#E2E7FF]'
          }`}
        >
          {getTranslation(lang, 'filterApproaching')}
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('announcements')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'announcements'
              ? 'bg-[#00236F] text-white shadow-xs'
              : 'bg-white text-[#444651] border border-[#E2E7FF]'
          }`}
        >
          {getTranslation(lang, 'filterAnnouncements')}
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E2E7FF] text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#F2F3FF] text-[#757682] flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-[#131B2E]">
                {getTranslation(lang, 'noAlertsTitle')}
              </span>
              <span className="text-xs text-[#444651]">
                {getTranslation(lang, 'noAlertsSub')}
              </span>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-3.5 shadow-xs border transition-all flex items-start gap-3 relative overflow-hidden ${
                item.read ? 'border-[#E2E7FF] opacity-90' : 'border-[#C5C5D3] ring-1 ring-[#EAEDFF]'
              }`}
            >
              {/* Unread Accent bar */}
              {!item.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FEA619]" />
              )}

              <div className="w-10 h-10 rounded-xl bg-[#F2F3FF] flex items-center justify-center shrink-0 mt-0.5 border border-[#E2E7FF]">
                {getIconForType(item.type)}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-extrabold text-[#131B2E] truncate">
                    {lang === 'te' ? item.titleTe : item.titleEn}
                  </span>
                  <span className="text-[10px] text-[#757682] font-mono shrink-0">
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-[#444651] mt-1 leading-relaxed">
                  {lang === 'te' ? item.messageTe : item.messageEn}
                </p>

                {item.busId && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] bg-[#EAEDFF] text-[#00236F] font-bold px-2 py-0.5 rounded">
                      BUS-07
                    </span>
                    {item.highPriority && (
                      <span className="text-[10px] bg-[#FFDDB8] text-[#855300] font-bold px-2 py-0.5 rounded">
                        500m Perimeter
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
