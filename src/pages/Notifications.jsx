import React, { useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell } from '../components/Icons';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { getNotifications } from '../data/notifications';
import { useAdminContext } from '../context/AdminContext';
import PullToRefresh from '../components/PullToRefresh';
import { getFilteredNotifications, getNotificationTimestamp } from '../utils/notificationHelpers';

export default function Notifications() {
  const { state, dispatch } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';

  useEffect(() => {
    refreshData(true);
  }, []);

  const notificationsList = useMemo(() => {
    const raw = adminState.notifications || [];
    const filtered = getFilteredNotifications(raw, state.installTime);
    // Sort by newest first
    return filtered.sort((a, b) => {
      const timeA = getNotificationTimestamp(a);
      const timeB = getNotificationTimestamp(b);
      return timeB - timeA;
    });
  }, [adminState.notifications, state.installTime]);

  const handleMarkAllRead = () => {
    const allIds = notificationsList.map(n => n.id);
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: allIds });
  };

  return (
    <div className="page">
      <div className="page-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Bell size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Notifications' : 'নোটিফিকেশন'}</span>
        </h1>
        {notificationsList.some(n => !state.readNotifications.includes(n.id)) && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            {isEn ? 'Mark all' : 'সব পঠিত'}
          </button>
        )}
      </div>

      <PullToRefresh onRefresh={refreshData}>
        <div className="page-content" style={{ padding: '16px 16px 80px 16px' }}>
          {notificationsList.length > 0 ? (
            <div>
              {notificationsList.map(item => (
                <NotificationItem key={item.id} notification={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Bell}
            />
          )}
        </div>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}
