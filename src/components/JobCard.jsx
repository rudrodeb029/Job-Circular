import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Calendar, Clock } from './Icons';
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
  'আকিক গ্রুপ': '🏭',
  'ওয়াটারএইড বাংলাদেশ': '💧',
  'টেন মিনিট স্কুল': '✍️',
  'প্রাথমিক শিক্ষা অধিদপ্তর': '🏫',
  'ইসলামী ব্যাংক বাংলাদেশ': '🕌',
  'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়': '🏫'
};

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default function JobCard({ job, showBookmark = true }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  const isSaved = state.savedJobs.includes(job.id);
  const isEn = state.language === 'en';

  const displayIcon = job.icon || orgIconsMap[job.organization] || '🏛️';
  const orgName = isEn ? (job.organizationEn || job.organization) : job.organization;
  const titleName = isEn ? (job.titleEn || job.title) : job.title;
  
  const descriptionSentence = isEn
    ? `${titleName} at ${orgName}. Apply now!`
    : `${orgName}-এ "${titleName}" পদে নিয়োগ বিজ্ঞপ্তি।`;

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_SAVE_JOB', payload: job.id });
  };

  return (
    <div
      className="job-card"
      onClick={() => navigate(`/job/${job.id}`)}
      style={{
        padding: '16px',
        background: '#ffffff',
        borderRadius: '18px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px',
        background: '#f8faff', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '20px', flexShrink: 0
      }}>
        {displayIcon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {orgName}
        </h4>
        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {descriptionSentence}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '9px', color: '#1a56db', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={10} />
            {job.deadline}
          </span>
          <span style={{ fontSize: '10.5px', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={10} />
            {formatTimeAgo(job.createdAt, isEn)}
          </span>
        </div>
      </div>

      {showBookmark && (
        <button
          onClick={handleBookmark}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isSaved ? '#eff6ff' : '#f8faff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSaved ? '#1a56db' : '#94a3b8',
            flexShrink: 0,
            transition: '0.2s'
          }}
        >
          {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      )}
    </div>
  );
}
