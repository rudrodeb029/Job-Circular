import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bell, ArrowLeft } from '../components/Icons';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import { getNotifications } from '../data/notifications';
import { useAdminContext } from '../context/AdminContext';
import PullToRefresh from '../components/PullToRefresh';
import { getFilteredNotifications, getNotificationTimestamp } from '../utils/notificationHelpers';

export default function Notifications() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: adminState, refreshData } = useAdminContext();
  const isEn = state.language === 'en';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '18px' }}>
            <Bell size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span>{isEn ? 'Notifications' : 'নোটিফিকেশন'}</span>
          </h1>
        </div>
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
        <div className="page-content animate-fade-in" style={{ padding: '16px 16px 80px 16px' }}>
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

    </div>
  );
}
