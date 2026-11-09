import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Bookmark, Briefcase, FileText, Bell, Globe, Moon, Sun, Settings, ChevronRight, Rss } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getFilteredNotifications } from '../utils/notificationHelpers';
import { POINTS_CONFIG } from '../utils/pointsService';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default function Profile() {
  const navigate = useNavigate();
  const { state, dispatch, earnPointsFromAd } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';
  const [watchingAd, setWatchingAd] = useState(false);
  const [pointsToast, setPointsToast] = useState('');

  const livePoints = state.liveExamPoints ?? state.pointsState?.points ?? POINTS_CONFIG.WELCOME_BONUS;
  const dailyAdCount = state.pointsState?.dailyAdCount ?? 0;

  const handleWatchRewardAd = async () => {
    if (watchingAd) return;
    setWatchingAd(true);
    try {
      const res = await earnPointsFromAd();
      if (res.ok) {
        setPointsToast(
          isEn
            ? `+${res.added} Live Exam Points earned! Total: ${res.newBalance}`
            : `অভিনন্দন! +${toBengaliNumber(res.added)} পয়েন্ট যোগ হয়েছে (মোট: ${toBengaliNumber(res.newBalance)})`
        );
      } else if (res.reason === 'daily_limit') {
        setPointsToast(
          isEn
            ? `Daily limit reached (${POINTS_CONFIG.DAILY_AD_LIMIT}/${POINTS_CONFIG.DAILY_AD_LIMIT} ads today)`
            : `আজকের বিজ্ঞাপনের সীমা শেষ (${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)}/${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)})`
        );
      } else {
        setPointsToast(
          isEn
            ? 'Watch the full ad to earn points.'
            : 'পয়েন্ট পেতে সম্পূর্ণ বিজ্ঞাপনটি দেখুন।'
        );
      }
      setTimeout(() => setPointsToast(''), 3200);
    } finally {
      setWatchingAd(false);
    }
  };

  const rawNotifs = adminState.notifications || [];
  const filteredNotifs = getFilteredNotifications(rawNotifs, state.installTime);
  const unreadNotifCount = filteredNotifs.filter(n => !state.readNotifications.includes(n.id)).length;

  const toggleLanguage = () => {
    const nextLang = state.language === 'bn' ? 'en' : 'bn';
    dispatch({ type: 'SET_LANGUAGE', payload: nextLang });
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Claymorphism Gradient Header */}
      <div style={{
        background: 'linear-gradient(145deg, #1e3a8a 0%, #1a56db 52%, #2563eb 100%)',
        padding: 'calc(var(--safe-area-top) + 16px) 16px 18px 16px',
        color: 'white',
        textAlign: 'center',
        borderRadius: '0 0 12px 12px',
        position: 'relative',
        borderBottom: '1px solid rgba(147, 197, 253, 0.35)',
        boxShadow: '0 10px 24px -6px rgba(26, 86, 219, 0.32), inset 0 2px 4px rgba(255, 255, 255, 0.22), inset 0 -3px 6px rgba(15, 23, 42, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Rings */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }}></div>

        {/* Top Right Settings Gear Button (Claymorphism) */}
        <button
          onClick={() => navigate('/settings')}
          title="Settings"
          aria-label="Settings"
          style={{
            position: 'absolute',
            top: 'calc(var(--safe-area-top) + 4px)',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.12))',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.18), inset 0 1.5px 2px rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px rgba(15, 23, 42, 0.2)'
          }}
        >
          <Settings size={18} />
        </button>

        {/* Avatar with Claymorphism Ring & Edit Camera Trigger Badge */}
        <div style={{
          position: 'relative',
          width: '54px',
          height: '54px',
          margin: '0 auto 10px auto'
        }}>
          {state.user.avatar ? (
            <img
              src={state.user.avatar}
              alt={state.user.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 18px rgba(15, 23, 42, 0.25), inset 0 2px 3px rgba(255, 255, 255, 0.6)'
              }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #ffffff 0%, #dbeafe 100%)',
              color: '#1a56db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 800,
              boxShadow: '0 8px 18px rgba(15, 23, 42, 0.25), inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(37, 99, 235, 0.18)',
              border: '2px solid rgba(255, 255, 255, 0.95)'
            }}>
              {state.user.name ? state.user.name[0].toUpperCase() : 'U'}
            </div>
          )}

          {/* Edit Camera Badge */}
          <div
            onClick={() => navigate('/edit-profile')}
            title="Edit Profile & Picture"
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1.8px solid white',
              boxShadow: '0 3px 6px rgba(15, 23, 42, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.45)'
            }}
          >
            <Edit size={10} />
          </div>
        </div>
        {/* User Info */}
        <h2 style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.2px', marginBottom: '2px' }}>
          {state.user.name || (isEn ? 'Set Your Name' : 'নাম সেট করুন')}
        </h2>
        {(state.user.qualification || state.user.location) && (
          <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500, margin: '2px 0 6px 0' }}>
            {state.user.qualification} {state.user.qualification && state.user.location && '•'} {state.user.location}
          </p>
        )}
        {localStorage.getItem('onesignal_subscribed') === 'true' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }}></div>
                {isEn ? 'Notifications Active' : 'নোটিফিকেশন সক্রিয়'}
            </div>
        )}

        {/* Integrated Activity Stats Bar (Tactile Claymorphism Card) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          background: isDark
            ? 'linear-gradient(145deg, #1e293b 0%, #172033 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f1f6ff 100%)',
          padding: '7px 8px',
          borderRadius: '8px',
          border: isDark
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: isDark
            ? '0 10px 22px -6px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.08), inset 0 -2px 4px rgba(0, 0, 0, 0.35)'
            : '0 8px 18px -4px rgba(15, 23, 42, 0.18), inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(219, 234, 254, 0.75)',
          marginTop: '12px'
        }}>
          <div
            onClick={() => navigate('/saved')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '5px 2px',
              borderRadius: '6px',
              background: isDark
                ? 'linear-gradient(145deg, #243247 0%, #1b2638 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: isDark
                ? '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
                : '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px #ffffff'
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)', margin: 0, lineHeight: 1.15 }}>
              {state.savedJobs.length}
            </p>
            <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
              Saved Jobs
            </p>
          </div>
          <div
            onClick={() => navigate('/saved?tab=applied')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '5px 2px',
              borderRadius: '6px',
              background: isDark
                ? 'linear-gradient(145deg, #243247 0%, #1b2638 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: isDark
                ? '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
                : '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px #ffffff'
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#059669', margin: 0, lineHeight: 1.15 }}>
              {state.appliedJobs.length}
            </p>
            <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
              Applied
            </p>
          </div>
          <div
            onClick={() => navigate('/notifications')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '5px 2px',
              borderRadius: '6px',
              background: isDark
                ? 'linear-gradient(145deg, #243247 0%, #1b2638 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: isDark
                ? '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
                : '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px #ffffff'
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#ea580c', margin: 0, lineHeight: 1.15 }}>
              {unreadNotifCount}
            </p>
            <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
              Notified
            </p>
          </div>
          <div
            onClick={() => navigate('/live-exams-list')}
            style={{
              textAlign: 'center',
              cursor: 'pointer',
              padding: '5px 2px',
              borderRadius: '6px',
              background: isDark
                ? 'linear-gradient(145deg, #243247 0%, #1b2638 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: isDark
                ? '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)'
                : '0 2px 5px rgba(15, 23, 42, 0.04), inset 0 1.5px 2px #ffffff'
            }}
            title={isEn ? 'Live Exam Points' : 'লাইভ এক্সাম পয়েন্টস'}
          >
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#7c3aed', margin: 0, lineHeight: 1.15 }}>
              {livePoints}
            </p>
            <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
              Exam Points
            </p>
          </div>
        </div>
      </div>

      {/* Points Toast Notification */}
      {pointsToast && (
        <div style={{
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isDark ? 'rgba(30, 41, 59, 0.96)' : 'rgba(255, 255, 255, 0.98)',
          borderRadius: '8px',
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(226,232,240,0.9)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.16)',
          padding: '7px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          color: isDark ? '#f8fafc' : '#0f172a',
          fontSize: '11.5px',
          fontWeight: 700,
          zIndex: 9999,
          whiteSpace: 'nowrap'
        }}>
          <span>⭐</span>
          <span>{pointsToast}</span>
        </div>
      )}

      <div className="page-content" style={{ padding: '16px 16px 80px 16px' }}>
        {/* Live Exam Points Wallet Section (Compact Claymorphism Style) */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            background: isDark
              ? 'linear-gradient(145deg, #1e293b 0%, #172033 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f5f9ff 100%)',
            borderRadius: '8px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(219, 234, 254, 0.95)',
            boxShadow: isDark
              ? '0 10px 22px -6px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.35)'
              : '0 8px 18px -6px rgba(37, 99, 235, 0.10), 0 2px 6px -1px rgba(15, 23, 42, 0.04), inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(219, 234, 254, 0.65)',
            padding: '11px 12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', lineHeight: 1.25 }}>
                {isEn ? 'Live Exam Points' : 'লাইভ এক্সাম পয়েন্টস'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.4 }}>
                {isEn
                  ? `${POINTS_CONFIG.DEFAULT_EXAM_COST} pts per Live Exam • Today's Ads: ${dailyAdCount}/${POINTS_CONFIG.DAILY_AD_LIMIT}`
                  : `প্রতি লাইভ পরীক্ষায় ${toBengaliNumber(POINTS_CONFIG.DEFAULT_EXAM_COST)} পয়েন্ট • আজকের অ্যাড: ${toBengaliNumber(dailyAdCount)}/${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)}`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleWatchRewardAd}
              disabled={watchingAd || dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT}
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '6px',
                border: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                  ? (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1')
                  : '1px solid rgba(37, 99, 235, 0.75)',
                background: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                  ? (isDark ? '#334155' : '#cbd5e1')
                  : 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                  ? 'none'
                  : '0 4px 10px -2px rgba(37, 99, 235, 0.30), inset 0 1.5px 2px rgba(255, 255, 255, 0.35), inset 0 -1.5px 2px rgba(30, 64, 175, 0.35)'
              }}
            >
              <span>🎬</span>
              <span>
                {watchingAd
                  ? (isEn ? 'Loading Ad...' : 'বিজ্ঞাপন লোড হচ্ছে...')
                  : dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                    ? (isEn ? 'Daily Limit Reached' : 'আজকের সীমা শেষ')
                    : (isEn ? `Watch Ad (+${POINTS_CONFIG.POINTS_PER_AD} Pts)` : `বিজ্ঞাপন দেখুন (+${toBengaliNumber(POINTS_CONFIG.POINTS_PER_AD)} পয়েন্ট)`)}
              </span>
            </button>
          </div>
        </div>
        {/* Section 1: Account & Activity (Tactile Claymorphism Card) */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            background: isDark
              ? 'linear-gradient(145deg, #1e293b 0%, #172033 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f5f9ff 100%)',
            borderRadius: '8px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(219, 234, 254, 0.95)',
            boxShadow: isDark
              ? '0 10px 22px -6px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.35)'
              : '0 8px 18px -6px rgba(37, 99, 235, 0.10), 0 2px 6px -1px rgba(15, 23, 42, 0.04), inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(219, 234, 254, 0.65)',
            overflow: 'hidden'
          }}>
            {/* Edit Profile Action */}
            <div
              className="menu-item"
              onClick={() => navigate('/edit-profile')}
            >
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #2563eb, #1d4ed8)', color: 'white' }}>
                <Edit size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* Feed Action */}
            <div
              className="menu-item"
              onClick={() => navigate('/feed')}
            >
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #ec4899, #e11d48)', color: 'white' }}>
                <Rss size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'Updates Feed' : 'আপডেট ফিড'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* Saved Jobs */}
            <div className="menu-item" onClick={() => navigate('/saved')}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #f59e0b, #d97706)', color: 'white' }}>
                <Bookmark size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'Saved Jobs' : 'সংরক্ষিত সার্কুলার'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* MCQ Exam & Question Bank */}
            <div className="menu-item" onClick={() => navigate('/questions-hub')}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #2563eb, #1e40af)', color: 'white' }}>
                <FileText size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'MCQ Exam & Question Bank' : 'MCQ Exam ও প্রশ্নব্যাংক'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* Admit Card & Result */}
            <div className="menu-item" onClick={() => navigate('/admit-card')}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #8b5cf6, #6d28d9)', color: 'white' }}>
                <FileText size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'Admit Card & Result' : 'প্রবেশপত্র ও ফলাফল'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>
          </div>
        </div>

        {/* Section 2: Preferences & System (Tactile Claymorphism Card) */}
        <div>
          <div style={{
            background: isDark
              ? 'linear-gradient(145deg, #1e293b 0%, #172033 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f5f9ff 100%)',
            borderRadius: '8px',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(219, 234, 254, 0.95)',
            boxShadow: isDark
              ? '0 10px 22px -6px rgba(0, 0, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.35)'
              : '0 8px 18px -6px rgba(37, 99, 235, 0.10), 0 2px 6px -1px rgba(15, 23, 42, 0.04), inset 0 2px 3px #ffffff, inset 0 -2px 4px rgba(219, 234, 254, 0.65)',
            overflow: 'hidden'
          }}>
            {/* Notification Settings */}
            <div className="menu-item" onClick={() => navigate('/notifications')}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #06b6d4, #0284c7)', color: 'white' }}>
                <Bell size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'Notification Settings' : 'নোটিফিকেশন সেটিংস'}</span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* Language Switcher */}
            <div className="menu-item" onClick={toggleLanguage}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #ec4899, #db2777)', color: 'white' }}>
                <Globe size={13} />
              </div>
              <span className="menu-item-label">{isEn ? 'App Language' : 'অ্যাপের ভাষা'}</span>
              <span style={{
                fontSize: '9.5px',
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(145deg, #243247, #1b2638)'
                  : 'linear-gradient(145deg, #eff6ff, #dbeafe)',
                color: isDark ? '#93c5fd' : 'var(--primary)',
                border: isDark ? '1px solid rgba(96, 165, 250, 0.25)' : '1px solid rgba(191, 219, 254, 0.9)',
                boxShadow: isDark
                  ? '0 2px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.06)'
                  : '0 2px 5px rgba(37, 99, 235, 0.08), inset 0 1px 1.5px #ffffff',
                padding: '2.5px 8px',
                borderRadius: '6px',
                marginRight: '6px'
              }}>
                {state.language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
              </span>
              <ChevronRight size={15} className="menu-item-arrow" />
            </div>

            {/* Dark Mode Toggle */}
            <div className="menu-item" onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>
              <div className="menu-item-icon" style={{ background: 'linear-gradient(145deg, #6366f1, #4f46e5)', color: 'white' }}>
                {state.theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </div>
              <span className="menu-item-label">{isEn ? 'Dark Mode' : 'ডার্ক মোড'}</span>
              <div className={`toggle ${state.theme === 'dark' ? 'active' : ''}`}></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
