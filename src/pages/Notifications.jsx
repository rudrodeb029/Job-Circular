import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell } from '../components/Icons';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { getNotifications } from '../data/notifications';

export default function Notifications() {
  const { state, dispatch } = useAppContext();
  const isEn = state.language === 'en';

  const notificationsList = useMemo(() => getNotifications(), []);

  const handleMarkAllRead = () => {
    const allIds = notificationsList.map(n => n.id);
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: allIds });
  };

  return (
    <div className="page">
      <div className="page-header flex-between">
        <h1>{isEn ? 'Notifications' : 'নোটিফিকেশন'}</h1>
        {notificationsList.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
              fontWeight: 700,
              background: 'var(--primary-bg)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            {isEn ? 'Mark all as read' : 'সব পঠিত হিসেবে চিহ্নিত করুন'}
          </button>
        )}
      </div>

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
            title={isEn ? "No Notifications" : "কোনো নোটিফিকেশন নেই"}
            description={isEn ? "You don't have any notifications right now." : "আপনার কাছে এই মুহূর্তে কোনো নোটিফিকেশন নেই।"}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
