import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, FileText, BookmarkCheck } from './Icons';
import { useAppContext } from '../context/AppContext';

const notifTypeConfig = {
  new_job: {
    bg: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
    shadow: 'rgba(26, 86, 219, 0.25)',
    icon: Briefcase,
    label: 'নতুন সার্কুলার',
    labelEn: 'New Circular',
    chipBg: '#dbeafe',
    chipColor: '#1d4ed8'
  },
  deadline: {
    bg: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    shadow: 'rgba(217, 119, 6, 0.25)',
    icon: Clock,
    label: 'ডেডলাইন',
    labelEn: 'Deadline',
    chipBg: '#fef3c7',
    chipColor: '#b45309'
  },
  admit_card: {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
    shadow: 'rgba(124, 58, 237, 0.25)',
    icon: FileText,
    label: 'অ্যাডমিট কার্ড',
    labelEn: 'Admit Card',
    chipBg: '#f3e8ff',
    chipColor: '#6b21a8'
  },
  result: {
    bg: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    shadow: 'rgba(5, 150, 105, 0.25)',
    icon: BookmarkCheck,
    label: 'ফলাফল',
    labelEn: 'Result',
    chipBg: '#d1fae5',
    chipColor: '#047857'
  }
};

export default function NotificationItem({ notification }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const isEn = state.language === 'en';
  const isRead = state.readNotifications.includes(notification.id);

  const handleClick = () => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
    if (notification.type === 'admit_card' && notification.jobId) {
      navigate(`/exam-details/${notification.jobId}`);
    } else if (notification.type === 'result' && notification.jobId) {
      navigate(`/result-details/${notification.jobId}`);
    } else if (notification.jobId) {
      navigate(`/job/${notification.jobId}`);
    } else {
      navigate('/all-circulars');
    }
  };

  const config = notifTypeConfig[notification.type] || notifTypeConfig.new_job;
  const IconComponent = config.icon;

  const orgName = isEn ? (notification.organizationEn || notification.organization) : notification.organization;
  const notifMessage = isEn ? (notification.messageEn || notification.message) : notification.message;
  const notifTime = isEn ? (notification.timeEn || notification.time) : notification.time;

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
        background: 'var(--white)',
        border: isRead ? '1px solid var(--border-light)' : '1px solid #bfdbfe',
        boxShadow: isRead ? '0 2px 8px rgba(15, 23, 42, 0.04)' : '0 4px 14px rgba(26, 86, 219, 0.1)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* Left Active Border Accent Bar for Unread Notifications */}
      {!isRead && (
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: 'var(--primary)'
        }}></div>
      )}

      {/* 3D Gradient Icon Tile */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: config.bg,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 2px 8px ${config.shadow}`
      }}>
        <IconComponent size={16} />
      </div>

      {/* Notification Text Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '8px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: isRead ? 700 : 800,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {orgName}
          </h4>

          {/* Category Chip Badge */}
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '10px',
            background: config.chipBg,
            color: config.chipColor,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {isEn ? config.labelEn : config.label}
          </span>
        </div>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {notifMessage}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
          <Clock size={12} />
          <span>{notifTime}</span>
        </div>
      </div>

      {/* Pulsing Unread Indicator Dot */}
      {!isRead && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--primary)',
          boxShadow: '0 0 0 3px rgba(26, 86, 219, 0.2)'
        }}></div>
      )}
    </div>
  );
}
