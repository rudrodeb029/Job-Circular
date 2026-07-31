import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Bell } from '../components/Icons';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { getNotifications } from '../data/notifications';
import { useAdminContext } from '../context/AdminContext';

export default function Notifications() {
  const { state, dispatch } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';

  const notificationsList = useMemo(() => {
    const raw = adminState.notifications || [];
    // Only show notifications created after the user installed the app
    return raw.filter(n => {
      const created = n.createdAt ? new Date(n.createdAt).getTime() : 0;
      const installed = state.installTime ? new Date(state.installTime).getTime() : 0;
      return created >= installed;
    });
  }, [adminState.notifications, state.installTime]);

  const handleMarkAllRead = () => {
    const allIds = notificationsList.map(n => n.id);
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ', payload: allIds });
  };

  return (
    <div className="page">
      <div className="page-header flex-between">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Notifications' : 'নোটিফিকেশন'}</span>
        </h1>
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
