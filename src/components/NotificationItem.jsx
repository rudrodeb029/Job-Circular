import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar } from './Icons';
import { useAppContext } from '../context/AppContext';
import { formatTimeAgo } from '../utils/timeUtils';

const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': '🏛️',
  'সোনালী ব্যাংক লিমিটেড': '🏦',
  'বাংলাদেশ পুলিশ': '👮',
  'ব্র্যাক': '🤝',
  'গ্রামীণফোন': '📱',
  'বাংলাদেশ সেনাবাহিনী': '🛡️',
  'ইসলামী ব্যাংক': '🕌',
  'বাংলাদেশ রেলওয়ে': '🚂',
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': '📡',
  'স্বাস্থ্য অধিদপ্তর': '🏥',
  'বাংলাদেশ ব্যাংক': '🏛️',
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': '🎓',
  'এলজিইডি': '🏗️',
  'বিকাশ লিমিটেড': '💸',
  'আশা': '🌱',
  'জনতা ব্যাংক': '🏦',
  'স্কয়ার হাসপাতাল': '🩺',
  'পাঠাও': '🚀',
  'রাজউক উত্তরা মডেল কলেজ': '🏫',
  'রূপালী ব্যাংক': '🏦',
  'প্রাথমিক শিক্ষা অধিদপ্তর': '🏫',
  'বিসিএস প্রিলিমিনারি': '🏛️',
  'বিসিএস': '🏛️',
  'প্রশ্নব্যাংক': '📚',
  'MCQ Exam': '📝'
};

const notifTypeConfig = {
  new_job: {
    label: 'নতুন সার্কুলার',
    labelEn: 'New Circular',
    chipBg: '#dbeafe',
    chipColor: '#1d4ed8',
    icon: '🏛️'
  },
  deadline: {
    label: 'ডেডলাইন',
    labelEn: 'Deadline',
    chipBg: '#fef3c7',
    chipColor: '#b45309',
    icon: '⏳'
  },
  admit_card: {
    label: 'অ্যাডমিট কার্ড',
    labelEn: 'Admit Card',
    chipBg: '#f3e8ff',
    chipColor: '#6b21a8',
    icon: '📄'
  },
  result: {
    label: 'ফলাফল',
    labelEn: 'Result',
    chipBg: '#d1fae5',
    chipColor: '#047857',
    icon: '🏆'
  }
};

function NotificationItem({ notification }) {
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

  const orgName = isEn 
    ? (notification.organizationEn || notification.organization || notification.titleEn || notification.title) 
    : (notification.organization || notification.title || notification.organizationEn || notification.titleEn);

  const notifMessage = isEn ? (notification.messageEn || notification.message) : notification.message;

  const getNotifIcon = () => {
    if (orgName && orgIconsMap[orgName]) return orgIconsMap[orgName];
    if (notification.organization && orgIconsMap[notification.organization]) return orgIconsMap[notification.organization];
    return config.icon || '🏛️';
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        padding: '14px 16px 14px 20px',
        marginBottom: '12px',
        borderRadius: '16px',
        background: 'var(--white)',
        border: isRead ? '1px solid var(--border-light)' : '1px solid #bfdbfe',
        boxShadow: isRead ? '0 2px 8px rgba(15, 23, 42, 0.03)' : '0 4px 14px rgba(26, 86, 219, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        overflow: 'hidden'
      }}
    >
      {/* Left Blue Accent Bar (Matching Image 1) */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: isRead ? '#cbd5e1' : 'linear-gradient(to bottom, var(--primary), #60a5fa)',
        borderRadius: '4px 0 0 4px'
      }}></div>

      {/* Header Row: Inline Icon + Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Inline Icon directly before Title */}
          {notification.imageUrl ? (
            <img 
              src={notification.imageUrl} 
              alt="" 
              loading="lazy"
              decoding="async"
              style={{ width: '18px', height: '18px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>
              {getNotifIcon()}
            </span>
          )}

          <h4 style={{
            fontSize: '15px',
            fontWeight: isRead ? 700 : 800,
            color: 'var(--text-primary)',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {orgName}
          </h4>
        </div>
      </div>

      {/* Notification Message */}
      <p style={{
        fontSize: '12.5px',
        color: 'var(--text-secondary)',
        lineHeight: 1.5,
        margin: '0 0 10px 0',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {notifMessage}
      </p>

      {/* Footer Info Row: Deadline / Date / Timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {notification.deadline && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '11px',
              fontWeight: 700
            }}>
              <Calendar size={11} />
              <span>{isEn ? 'Deadline:' : 'ডেডলাইন:'} {notification.deadline}</span>
            </span>
          )}

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <Clock size={11} />
            <span>{formatTimeAgo(notification.createdAt, isEn)}</span>
          </span>
        </div>

        {/* Unread Dot */}
        {!isRead && (
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 0 3px rgba(26, 86, 219, 0.2)'
          }}></span>
        )}
      </div>
    </div>
  );
}

export default React.memo(NotificationItem);
