import React, { useState, useEffect, useMemo } from 'react';
import getCategoryIconComponent from './CategoryIcons';
import { Calendar, Clock, Award, Briefcase } from './Icons';

// Bengali numerals map
const bengaliDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
const toBengaliNumber = (num, minDigits = 2) => {
  if (num === undefined || num === null) return minDigits === 2 ? '০০' : '০';
  const padded = String(num).padStart(minDigits, '0');
  return padded.split('').map(d => bengaliDigits[d] || d).join('');
};

const bengaliToEnglishDigits = (str) => {
  const map = { '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9' };
  return String(str).replace(/[০-৯]/g, d => map[d] || d);
};

const bengaliMonths = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Formats a date string (e.g. '2026-09-25' or '25 September 2026') into localized format
 * e.g. '২৫ সেপ্টেম্বর ২০২৬'
 */
const formatLocalizedDate = (dateStr, isEn = false) => {
  if (!dateStr) return isEn ? 'Not specified' : 'উল্লেখ নেই';
  const clean = bengaliToEnglishDigits(dateStr).trim();

  // Try YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    if (isEn) {
      return `${d} ${englishMonths[m] || ''} ${y}`;
    } else {
      return `${toBengaliNumber(d, 1)} ${bengaliMonths[m] || ''} ${toBengaliNumber(y, 4)}`;
    }
  }

  // Already formatted string
  if (isEn) {
    return clean;
  }
  // Convert any digits to Bengali
  return dateStr.split('').map(char => bengaliDigits[char] || char).join('');
};

/**
 * Formats a time string (e.g. '23:59' or '11:59 PM') into localized format
 * e.g. 'রাত ১১:৫৯'
 */
const formatLocalizedTime = (timeStr, isEn = false) => {
  if (!timeStr) return isEn ? '11:59 PM' : 'রাত ১১:৫৯';
  const clean = bengaliToEnglishDigits(timeStr).trim();

  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    let periodBn = 'রাত';
    let periodEn = 'PM';

    if (hours < 6) periodBn = 'রাত';
    else if (hours < 12) { periodBn = 'সকাল'; periodEn = 'AM'; }
    else if (hours < 15) periodBn = 'দুপুর';
    else if (hours < 18) periodBn = 'বিকাল';
    else if (hours < 20) periodBn = 'সন্ধ্যা';
    else periodBn = 'রাত';

    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    if (isEn) {
      return `${hours}:${mins} ${periodEn}`;
    } else {
      return `${periodBn} ${toBengaliNumber(hours, 1)}:${toBengaliNumber(mins, 2)}`;
    }
  }

  return isEn ? clean : timeStr.split('').map(char => bengaliDigits[char] || char).join('');
};

/**
 * Parse any date + time into unix timestamp ms
 */
const parseTargetTimestamp = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const clean = bengaliToEnglishDigits(dateStr).trim();

  let targetDate = null;
  const isoMatch = clean.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    targetDate = new Date(y, m, d);
  } else {
    // Check for month names in string
    for (let i = 0; i < bengaliMonths.length; i++) {
      if (dateStr.includes(bengaliMonths[i])) {
        const parts = clean.split(/\s+/).filter(p => !isNaN(p));
        if (parts.length >= 2) {
          const d = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10) || new Date().getFullYear();
          targetDate = new Date(y, i, d);
          break;
        }
      }
    }
    if (!targetDate) {
      const parsed = Date.parse(clean);
      if (!isNaN(parsed)) targetDate = new Date(parsed);
    }
  }

  if (!targetDate || isNaN(targetDate.getTime())) return null;

  // Set time
  let hours = 23;
  let mins = 59;
  let secs = 59;

  if (timeStr) {
    const cleanTime = bengaliToEnglishDigits(timeStr);
    const match = cleanTime.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      hours = parseInt(match[1], 10);
      mins = parseInt(match[2], 10);
      if (/pm|রাত|বিকাল|সন্ধ্যা/i.test(timeStr) && hours < 12) hours += 12;
      if (/am|সকাল|ভোর/i.test(timeStr) && hours === 12) hours = 0;
    }
  }

  targetDate.setHours(hours, mins, secs, 999);
  return targetDate.getTime();
};

export default function DetailsHeaderCard({
  title = '',
  categoryId = '',
  type = 'job', // 'job' | 'exam' | 'result'
  date = '',
  time = '',
  dateLabel = '',
  timeLabel = '',
  bannerText = '',
  extraStats = null,
  isEn = false
}) {
  const targetTimestamp = useMemo(() => {
    return parseTargetTimestamp(date, time);
  }, [date, time]);

  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetTimestamp) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    const diff = targetTimestamp - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      isExpired: false
    };
  });

  useEffect(() => {
    if (!targetTimestamp) return;

    const tick = () => {
      const diff = targetTimestamp - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
          isExpired: false
        });
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  // Resolve default labels
  const resolvedDateLabel = dateLabel || (
    type === 'job' 
      ? (isEn ? 'Deadline Date:' : 'শেষ তারিখ:') 
      : (type === 'exam' 
        ? (isEn ? 'Exam Date:' : 'পরীক্ষার তারিখ:') 
        : (isEn ? 'Result Published:' : 'ফলাফল প্রকাশের তারিখ:'))
  );

  const resolvedTimeLabel = timeLabel || (
    type === 'job' 
      ? (isEn ? 'Deadline Time:' : 'শেষ সময়:') 
      : (type === 'exam' 
        ? (isEn ? 'Exam Time:' : 'পরীক্ষার সময়:') 
        : (isEn ? 'Status:' : 'ফলাফল স্ট্যাটাস:'))
  );

  const formattedDateVal = formatLocalizedDate(date, isEn);
  const formattedTimeVal = time ? formatLocalizedTime(time, isEn) : (
    type === 'result' ? (isEn ? 'Published' : 'প্রকাশিত') : (isEn ? '11:59 PM' : 'রাত ১১:৫৯')
  );

  // Resolved Banner pill text
  let resolvedBanner = bannerText;
  if (!resolvedBanner) {
    if (type === 'job') {
      resolvedBanner = timeLeft.isExpired 
        ? (isEn ? 'Application Deadline Over' : 'আবেদনের সময় শেষ') 
        : (isEn ? 'Time Left to Apply' : 'আবেদনের বাকি সময়');
    } else if (type === 'exam') {
      resolvedBanner = timeLeft.isExpired 
        ? (isEn ? 'Exam Completed' : 'পরীক্ষা সম্পন্ন') 
        : (isEn ? 'Exam Countdown' : 'পরীক্ষার বাকি সময়');
    } else {
      resolvedBanner = isEn ? 'Result Summary' : 'ফলাফল সারসংক্ষেপ';
    }
  }

  // Category Icon Component
  const iconComponent = getCategoryIconComponent(categoryId, { size: 24, color: '#ffffff' });

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid rgba(219, 234, 254, 0.8)',
        boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.08), 0 2px 6px -2px rgba(15, 23, 42, 0.04)',
        padding: '22px 14px 18px 14px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 'var(--space-lg)'
      }}
    >
      {/* Top-Left Fluid Curved Graphic Backdrop */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '125px', height: '100px', pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 140 110"
        fill="none"
      >
        <path
          d="M0 0 C45 8 95 24 100 65 C104 88 78 102 0 105 Z"
          fill="url(#headerWaveTL)"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="headerWaveTL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Right Fluid Curved Graphic Backdrop */}
      <svg
        style={{ position: 'absolute', bottom: 0, right: 0, width: '125px', height: '100px', pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 140 110"
        fill="none"
      >
        <path
          d="M140 110 C95 102 45 86 40 45 C36 22 62 8 140 5 Z"
          fill="url(#headerWaveBR)"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="headerWaveBR" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
        </defs>
      </svg>

      {/* Card Content (Relative zIndex 2 to sit above background waves) */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Floating Top Category Icon Badge */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '13px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
            boxShadow: '0 6px 14px rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '10px'
          }}
        >
          {type === 'result' ? (
            <Award size={24} color="#ffffff" />
          ) : type === 'exam' ? (
            <Calendar size={22} color="#ffffff" />
          ) : (
            iconComponent
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '15.5px',
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'center',
            lineHeight: 1.35,
            margin: '0 0 12px 0',
            fontFamily: '"Hind Siliguri", "Noto Sans Bengali", sans-serif',
            maxWidth: '96%'
          }}
        >
          {title}
        </h2>

        {/* Two-Column Meta Section (Date & Time) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '14px',
            width: '100%',
            maxWidth: '340px'
          }}
        >
          {/* Left Column: Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Calendar size={18} color="#2563eb" />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', lineHeight: 1.2 }}>
                {resolvedDateLabel}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {formattedDateVal}
              </span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: '24px', background: '#cbd5e1', flexShrink: 0 }} />

          {/* Right Column: Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Clock size={18} color="#2563eb" />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
              <span style={{ fontSize: '9px', fontWeight: 600, color: '#64748b', lineHeight: 1.2 }}>
                {resolvedTimeLabel}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {formattedTimeVal}
              </span>
            </div>
          </div>
        </div>

        {/* Centered Blue Banner Pill */}
        <div
          style={{
            background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            borderRadius: '20px',
            fontSize: '10.5px',
            fontWeight: 800,
            padding: '3.5px 16px',
            display: 'inline-block',
            marginBottom: '8px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            letterSpacing: '0.2px'
          }}
        >
          {resolvedBanner}
        </div>

        {/* 4-Box Grid: Countdown or Result Overview Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            width: '100%',
            maxWidth: '350px'
          }}
        >
          {extraStats ? (
            // Custom 4-Box Stats (e.g. for Result Details)
            extraStats.map((stat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(180deg, #f0f7ff 0%, #e0effe 100%)',
                  border: '1px solid rgba(191, 219, 254, 0.8)',
                  borderRadius: '10px',
                  padding: '6px 2px 7px 2px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.04)'
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#1d4ed8', lineHeight: 1.15 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', marginTop: '3px' }}>
                  {stat.label}
                </div>
              </div>
            ))
          ) : (
            // Default 4-Box Countdown Timer
            [
              { val: isEn ? String(timeLeft.days).padStart(2, '0') : toBengaliNumber(timeLeft.days, 2), label: isEn ? 'Days' : 'দিন' },
              { val: isEn ? String(timeLeft.hours).padStart(2, '0') : toBengaliNumber(timeLeft.hours, 2), label: isEn ? 'Hours' : 'ঘণ্টা' },
              { val: isEn ? String(timeLeft.minutes).padStart(2, '0') : toBengaliNumber(timeLeft.minutes, 2), label: isEn ? 'Mins' : 'মিনিট' },
              { val: isEn ? String(timeLeft.seconds).padStart(2, '0') : toBengaliNumber(timeLeft.seconds, 2), label: isEn ? 'Secs' : 'সেকেন্ড' }
            ].map((box, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(180deg, #f0f7ff 0%, #e0effe 100%)',
                  border: '1px solid rgba(191, 219, 254, 0.8)',
                  borderRadius: '10px',
                  padding: '6px 2px 7px 2px',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(37, 99, 235, 0.04)'
                }}
              >
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#1d4ed8', lineHeight: 1.15, fontFamily: '"Poppins", sans-serif' }}>
                  {box.val}
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#475569', marginTop: '3px' }}>
                  {box.label}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

