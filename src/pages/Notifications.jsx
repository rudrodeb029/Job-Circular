import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell } from '../components/Icons';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { notifications } from '../data/notifications';

export default function Notifications() {
  const { state, dispatch } = useAppContext();

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: allIds });
  };

  return (
    <div className="page">
      <div className="page-header flex-between">
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--primary)',
              fontWeight: 700,
              background: 'var(--primary-bg)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '20px'
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="page-content" style={{ padding: '16px 16px 80px 16px' }}>
        {notifications.length > 0 ? (
          <div>
            {notifications.map(item => (
              <NotificationItem key={item.id} notification={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="No Notifications"
            description="You don't have any notifications right now."
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
