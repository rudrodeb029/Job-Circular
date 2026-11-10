import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Bookmark,
  FileText,
  Bell,
  Globe,
  Moon,
  Sun,
  Settings,
  ChevronRight,
  Rss,
  Camera
} from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getFilteredNotifications } from '../utils/notificationHelpers';
import { POINTS_CONFIG } from '../utils/pointsService';
import { getRewardedCooldownRemainingSec } from '../utils/admobUtils';
import { compressImageFile } from '../utils/mediaUtils';

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
  const [cooldownRemaining, setCooldownRemaining] = useState(() => getRewardedCooldownRemainingSec());
  const [pointsToast, setPointsToast] = useState('');

  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const livePoints = state.liveExamPoints ?? state.pointsState?.points ?? POINTS_CONFIG.WELCOME_BONUS;
  const dailyAdCount = state.pointsState?.dailyAdCount ?? 0;

  useEffect(() => {
    const update = () => setCooldownRemaining(getRewardedCooldownRemainingSec());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [state.pointsState]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const dataUrl = await compressImageFile(file, 400, 0.85);
      dispatch({ type: 'UPDATE_USER_PROFILE', payload: { avatar: dataUrl } });
      setPointsToast(isEn ? 'Profile picture updated!' : 'প্রোফাইল ছবি সফলভাবে পরিবর্তিত হয়েছে!');
      setTimeout(() => setPointsToast(''), 3000);
    } catch (err) {
      console.error('Avatar upload failed', err);
      setPointsToast(isEn ? 'Upload failed' : 'আপলোড ব্যর্থ হয়েছে');
      setTimeout(() => setPointsToast(''), 2500);
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleWatchRewardAd = async () => {
    if (watchingAd) return;
    const remaining = getRewardedCooldownRemainingSec();
    if (remaining > 0) {
      setPointsToast(
        isEn
          ? `Please wait ${remaining}s before watching another ad.`
          : `পরবর্তী বিজ্ঞাপন দেখার আগে ${toBengaliNumber(remaining)} সেকেন্ড অপেক্ষা করুন।`
      );
      setTimeout(() => setPointsToast(''), 3000);
      return;
    }

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
      } else if (res.reason === 'cooldown') {
        setPointsToast(
          isEn
            ? `Please wait ${res.remainingSec}s before watching another ad.`
            : `পরবর্তী বিজ্ঞাপন দেখার আগে ${toBengaliNumber(res.remainingSec)} সেকেন্ড অপেক্ষা করুন।`
        );
      } else {
        setPointsToast(
          res.message || (isEn
            ? 'Watch the full ad to earn points.'
            : 'পয়েন্ট পেতে সম্পূর্ণ বিজ্ঞাপনটি দেখুন।')
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

  const clayTileStyle = {
    textAlign: 'center',
    cursor: 'pointer',
    padding: '9px 4px 8px 4px',
    borderRadius: '14px',
    background: isDark
      ? 'linear-gradient(145deg, #243248 0%, #1a2436 100%)'
      : 'linear-gradient(145deg, #ffffff 0%, #f4f7fb 100%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.08)'
      : '1px solid rgba(255, 255, 255, 0.95)',
    boxShadow: isDark
      ? '0 8px 18px -4px rgba(0, 0, 0, 0.5), 0 2px 5px rgba(0, 0, 0, 0.3), inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.1), inset -2.5px -2.5px 5px rgba(0, 0, 0, 0.45)'
      : '0 8px 16px -4px rgba(37, 99, 235, 0.09), 0 3px 6px rgba(15, 23, 42, 0.04), inset 2px 2px 4px #ffffff, inset -2.5px -2.5px 5px rgba(203, 213, 225, 0.6)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Hidden File Input for Profile Picture */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarUpload}
      />

      {/* Top-Right Settings Gear Button (Floats at top right) */}
      <button
        onClick={() => navigate('/settings')}
        title="Settings"
        aria-label="Settings"
        style={{
          position: 'absolute',
          top: 'calc(var(--safe-area-top) + 8px)',
          right: '16px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'transparent',
          color: 'var(--text-primary)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'none',
          zIndex: 10
        }}
      >
        <Settings size={20} />
      </button>

      {/* ═══ 1. Cover Photo Banner (Only rendered if user has uploaded a cover photo) ═══ */}
      {state.user.coverPhoto && (
        <div style={{
          position: 'relative',
          height: '150px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
        }}>
          <img
            src={state.user.coverPhoto}
            alt="Cover"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* ═══ 2. Profile Details Section (Cards Colors Removed - Seamless Look) ═══ */}
      <div style={{
        margin: state.user.coverPhoto ? '0 14px 10px 14px' : '0 14px 6px 14px',
        background: 'transparent',
        borderRadius: '0',
        border: 'none',
        boxShadow: 'none',
        padding: state.user.coverPhoto ? '0 14px 6px 14px' : 'calc(var(--safe-area-top) + 16px) 14px 6px 14px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Centered Avatar */}
        <div style={{
          marginTop: state.user.coverPhoto ? '-46px' : '0',
          width: '88px',
          height: '88px',
          position: 'relative'
        }}>
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: isDark ? '3px solid #334155' : '3px solid #ffffff',
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.12)',
            background: isDark ? '#1e293b' : '#ffffff',
            position: 'relative'
          }}>
            {state.user.avatar ? (
              <img
                src={state.user.avatar}
                alt={state.user.name || 'User'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: uploadingAvatar ? 'brightness(0.6)' : 'none'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(145deg, #ffffff 0%, #dbeafe 100%)',
                color: '#1a56db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 800,
                boxShadow: 'inset 0 2px 4px #ffffff, inset 0 -2px 4px rgba(37, 99, 235, 0.18)'
              }}>
                {state.user.name ? state.user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            {uploadingAvatar && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 800
              }}>
                ...
              </div>
            )}
          </div>

          {/* Avatar Camera Badge (Bottom-Right of Avatar circle) */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            title={isEn ? 'Change Profile Picture' : 'প্রোফাইল ছবি পরিবর্তন'}
            aria-label="Change Profile Picture"
            disabled={uploadingAvatar}
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: isDark ? '2px solid #1e293b' : '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 8px rgba(15, 23, 42, 0.25)',
              zIndex: 3
            }}
          >
            <Camera size={12} color="white" />
          </button>
        </div>

        {/* User Name with Inline Edit Icon (Clickable to Edit Profile) */}
        <div
          onClick={() => navigate('/edit-profile')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            margin: '8px 0 14px 0',
            padding: '2px 6px',
            borderRadius: '8px'
          }}
          title={isEn ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন করুন'}
        >
          <h2 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
            margin: 0
          }}>
            {state.user.name || (isEn ? 'Set Your Name' : 'নাম সেট করুন')}
          </h2>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isDark
              ? 'rgba(37, 99, 235, 0.25)'
              : 'linear-gradient(145deg, #eff6ff, #dbeafe)',
            border: isDark ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid rgba(191, 219, 254, 0.9)',
            color: isDark ? '#60a5fa' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(37, 99, 235, 0.1)',
            flexShrink: 0
          }}>
            <Edit size={10} />
          </div>
        </div>
      </div>

      {/* ═══ 3. Integrated Activity Stats Bar (Claymorphism Style) ═══ */}
      <div style={{
        margin: '0 14px 16px 14px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        background: 'transparent',
        padding: '0',
        borderRadius: '0',
        border: 'none',
        boxShadow: 'none'
      }}>
        <div
          onClick={() => navigate('/saved')}
          style={clayTileStyle}
        >
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', margin: 0, lineHeight: 1.15 }}>
            {state.savedJobs.length}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
            Saved Jobs
          </p>
        </div>
        <div
          onClick={() => navigate('/saved?tab=applied')}
          style={clayTileStyle}
        >
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#059669', margin: 0, lineHeight: 1.15 }}>
            {state.appliedJobs.length}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
            Applied
          </p>
        </div>
        <div
          onClick={() => navigate('/notifications')}
          style={clayTileStyle}
        >
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c', margin: 0, lineHeight: 1.15 }}>
            {unreadNotifCount}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
            Notified
          </p>
        </div>
        <div
          onClick={() => navigate('/live-exams-list')}
          style={clayTileStyle}
          title={isEn ? 'Live Exam Points' : 'লাইভ এক্সাম পয়েন্টস'}
        >
          <p style={{ fontSize: '15px', fontWeight: 800, color: '#7c3aed', margin: 0, lineHeight: 1.15 }}>
            {livePoints}
          </p>
          <p style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700, marginTop: '3px', marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>
            Exam Points
          </p>
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

      <div className="page-content" style={{ padding: '0 14px 80px 14px' }}>
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
            <div style={{ marginBottom: '7px' }}>
              <h3 style={{ margin: 0, fontSize: '10.5px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155', lineHeight: 1.25 }}>
                {isEn ? 'Live Exam Points' : 'লাইভ এক্সাম পয়েন্টস'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '9.5px', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>
                {isEn
                  ? `${POINTS_CONFIG.DEFAULT_EXAM_COST} pts per Live Exam • Today's Ads: ${dailyAdCount}/${POINTS_CONFIG.DAILY_AD_LIMIT}`
                  : `প্রতি লাইভ পরীক্ষায় ${toBengaliNumber(POINTS_CONFIG.DEFAULT_EXAM_COST)} পয়েন্ট • আজকের অ্যাড: ${toBengaliNumber(dailyAdCount)}/${toBengaliNumber(POINTS_CONFIG.DAILY_AD_LIMIT)}`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleWatchRewardAd}
              disabled={watchingAd || dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT || cooldownRemaining > 0}
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '6px',
                border: (dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT || cooldownRemaining > 0)
                  ? (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1')
                  : '1px solid rgba(37, 99, 235, 0.75)',
                background: (dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT || cooldownRemaining > 0)
                  ? (isDark ? '#334155' : '#cbd5e1')
                  : 'linear-gradient(145deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: (dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT || cooldownRemaining > 0) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: (dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT || cooldownRemaining > 0)
                  ? 'none'
                  : '0 4px 10px -2px rgba(37, 99, 235, 0.30), inset 0 1.5px 2px rgba(255, 255, 255, 0.35), inset 0 -1.5px 2px rgba(30, 64, 175, 0.35)'
              }}
            >
              <span>{cooldownRemaining > 0 ? '⏳' : '🎬'}</span>
              <span>
                {watchingAd
                  ? (isEn ? 'Loading Ad...' : 'বিজ্ঞাপন লোড হচ্ছে...')
                  : dailyAdCount >= POINTS_CONFIG.DAILY_AD_LIMIT
                    ? (isEn ? 'Daily Limit Reached' : 'আজকের সীমা শেষ')
                    : cooldownRemaining > 0
                      ? (isEn ? `Wait ${cooldownRemaining}s` : `${toBengaliNumber(cooldownRemaining)}সে: অপেক্ষা করুন`)
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
