import React from 'react';
import { Briefcase, Clock, FileText, BookmarkCheck } from './Icons';
import { useAppContext } from '../context/AppContext';

const notifTypeConfig = {
  new_job: {
    bg: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
    shadow: 'rgba(26, 86, 219, 0.25)',
    icon: Briefcase,
    label: 'নতুন সার্কুলার',
    chipBg: '#dbeafe',
    chipColor: '#1d4ed8'
  },
  deadline: {
    bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow: 'rgba(217, 119, 6, 0.25)',
    icon: Clock,
    label: 'ডেডলাইন',
    chipBg: '#fef3c7',
    chipColor: '#b45309'
  },
  admit_card: {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadow: 'rgba(124, 58, 237, 0.25)',
    icon: FileText,
    label: 'অ্যাডমিট কার্ড',
    chipBg: '#f3e8ff',
    chipColor: '#6b21a8'
  },
  result: {
    bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow: 'rgba(5, 150, 105, 0.25)',
    icon: BookmarkCheck,
    label: 'ফলাফল',
    chipBg: '#d1fae5',
    chipColor: '#047857'
  }
};

export default function NotificationItem({ notification }) {
  const { state, dispatch } = useAppContext();
  const isRead = state.readNotifications.includes(notification.id);

  const handleClick = () => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
  };

  const config = notifTypeConfig[notification.type] || notifTypeConfig.new_job;
  const IconComponent = config.icon;

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        padding: '16px',
        marginBottom: '12px',
        borderRadius: '16px',
        background: !isRead
          ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)'
          : 'var(--white)',
        border: !isRead ? '1px solid #dbeafe' : '1px solid var(--border-light)',
        borderLeft: !isRead ? '4px solid var(--primary)' : '4px solid transparent',
        boxShadow: !isRead
          ? '0 4px 18px rgba(26, 86, 219, 0.08)'
          : '0 2px 8px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Icon Badge Tile */}
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: config.bg,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 12px ${config.shadow}`,
        flexShrink: 0,
        position: 'relative'
      }}>
        <IconComponent size={20} color="white" />
        
        {/* Pulsing Dot for Unread Notifications */}
        {!isRead && (
          <span
            className="notification-badge-pulse"
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '9px',
              height: '9px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid white'
            }}
          ></span>
        )}
      </div>

      {/* Notification Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', gap: '8px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: !isRead ? 800 : 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3
          }}>
            {notification.organization}
          </h4>
          <span style={{
            fontSize: '9.5px',
            fontWeight: 700,
            background: config.chipBg,
            color: config.chipColor,
            padding: '2px 8px',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {config.label}
          </span>
        </div>

        <p style={{
          fontSize: '12.5px',
          color: !isRead ? '#334155' : 'var(--text-secondary)',
          fontWeight: !isRead ? 500 : 400,
          lineHeight: 1.55,
          marginBottom: '8px'
        }}>
          {notification.message}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Clock size={11} />
          <span>{notification.time}</span>
        </div>
      </div>
    </div>
  );
}
