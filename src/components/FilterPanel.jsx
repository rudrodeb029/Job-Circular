import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  resultCount,
  onShowResults,
  onClose,
  jobs = []
}) {
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  // Dynamically extract unique options from actual database jobs
  const dynamicOptions = useMemo(() => {
    const qualificationsSet = new Set(['স্নাতক (Bachelor)', 'স্নাতকোত্তর (Master)', 'এইচএসসি (HSC)', 'এসএসসি (SSC)', 'ডিপ্লোমা (Diploma)']);
    const locationsSet = new Set(['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ']);
    const jobTypesSet = new Set(['সরকারি', 'ব্যাংক', 'এনজিও', 'বেসরকারি']);

    jobs.forEach(job => {
      if (job.qualification) qualificationsSet.add(job.qualification);
      if (job.location) locationsSet.add(job.location);
      if (job.type) jobTypesSet.add(job.type);
      if (job.jobType) jobTypesSet.add(job.jobType);
    });

    return {
      qualifications: Array.from(qualificationsSet).filter(Boolean),
      locations: Array.from(locationsSet).filter(Boolean),
      jobTypes: Array.from(jobTypesSet).filter(Boolean)
    };
  }, [jobs]);

  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
      border: '1px solid var(--border-light)',
      marginBottom: 'var(--space-lg)'
    }}>
      <div className="flex-between mb-md">
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {isEn ? 'Filter Options' : 'ফিল্টার অপশন'}
        </h3>
        <button
          onClick={onReset}
          style={{
            fontSize: '12px',
            color: 'var(--primary)',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {isEn ? 'Reset' : 'রিসেট'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* QUALIFICATION */}
        <div className="input-group">
          <label className="input-label" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'QUALIFICATION' : 'শিক্ষাগত যোগ্যতা'}
          </label>
          <select
            className="input select"
            value={filters.qualification || ''}
            onChange={(e) => onFilterChange({ qualification: e.target.value })}
            style={{ fontWeight: 600, fontSize: '13px' }}
          >
            <option value="">{isEn ? 'Select Qualification' : 'যোগ্যতা নির্বাচন করুন'}</option>
            {dynamicOptions.qualifications.map((q, idx) => (
              <option key={idx} value={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* LOCATION */}
        <div className="input-group">
          <label className="input-label" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'JOB LOCATION' : 'চাকরির স্থান / জেলা'}
          </label>
          <select
            className="input select"
            value={filters.location || ''}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            style={{ fontWeight: 600, fontSize: '13px' }}
          >
            <option value="">{isEn ? 'Select Location' : 'স্থান নির্বাচন করুন'}</option>
            {dynamicOptions.locations.map((loc, idx) => (
              <option key={idx} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* DEADLINE */}
        <div className="input-group">
          <label className="input-label" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'DEADLINE' : 'আবেদনের সময়সীমা'}
          </label>
          <select
            className="input select"
            value={filters.deadline || ''}
            onChange={(e) => onFilterChange({ deadline: e.target.value })}
            style={{ fontWeight: 600, fontSize: '13px' }}
          >
            <option value="">{isEn ? 'Select Deadline' : 'সময়সীমা নির্বাচন করুন'}</option>
            <option value="today">{isEn ? 'Today' : 'আজকে'}</option>
            <option value="3days">{isEn ? 'Next 3 Days' : 'আগামী ৩ দিনে'}</option>
            <option value="week">{isEn ? 'This Week' : 'এই সপ্তাহে'}</option>
            <option value="month">{isEn ? 'This Month' : 'এই মাসে'}</option>
          </select>
        </div>

        {/* JOB TYPE */}
        <div className="input-group">
          <label className="input-label" style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {isEn ? 'JOB TYPE' : 'চাকরির ধরন'}
          </label>
          <select
            className="input select"
            value={filters.jobType || ''}
            onChange={(e) => onFilterChange({ jobType: e.target.value })}
            style={{ fontWeight: 600, fontSize: '13px' }}
          >
            <option value="">{isEn ? 'All Type' : 'সকল ধরন'}</option>
            {dynamicOptions.jobTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* DYNAMIC ACTION BUTTON */}
        <button
          className="btn btn-primary btn-block mt-sm"
          onClick={onShowResults}
          style={{
            height: '46px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
            boxShadow: '0 4px 14px rgba(26, 86, 219, 0.25)',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {isEn ? `Show ${resultCount} Jobs` : `${toBengaliNumber(resultCount)}টি চাকরি দেখুন`}
        </button>
      </div>
    </div>
  );
}
