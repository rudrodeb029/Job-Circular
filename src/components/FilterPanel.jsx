import React from 'react';
import { X } from './Icons';

export default function FilterPanel({ filters, onFilterChange, onReset, resultCount, onShowResults, onClose }) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--border-light)',
      marginBottom: 'var(--space-lg)'
    }}>
      <div className="flex-between mb-md">
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>Filter Options</h3>
        <button onClick={onReset} style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600 }}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="input-group">
          <label className="input-label">Qualification</label>
          <select
            className="input select"
            value={filters.qualification}
            onChange={(e) => onFilterChange({ qualification: e.target.value })}
          >
            <option value="">Select Qualification</option>
            <option value="এসএসসি">এসএসসি</option>
            <option value="এইচএসসি">এইচএসসি</option>
            <option value="স্নাতক">স্নাতক</option>
            <option value="স্নাতকোত্তর">স্নাতকোত্তর</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Job Location</label>
          <select
            className="input select"
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
          >
            <option value="">Select Location</option>
            <option value="ঢাকা">ঢাকা</option>
            <option value="চট্টগ্রাম">চট্টগ্রাম</option>
            <option value="রাজশাহী">রাজশাহী</option>
            <option value="খুলনা">খুলনা</option>
            <option value="সিলেট">সিলেট</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Deadline</label>
          <select
            className="input select"
            value={filters.deadline}
            onChange={(e) => onFilterChange({ deadline: e.target.value })}
          >
            <option value="">Select Deadline</option>
            <option value="আজকে">আজকে</option>
            <option value="এই সপ্তাহে">এই সপ্তাহে</option>
            <option value="এই মাসে">এই মাসে</option>
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Job Type</label>
          <select
            className="input select"
            value={filters.jobType}
            onChange={(e) => onFilterChange({ jobType: e.target.value })}
          >
            <option value="">All Type</option>
            <option value="সরকারি">সরকারি</option>
            <option value="ব্যাংক">ব্যাংক</option>
            <option value="এনজিও">এনজিও</option>
            <option value="বেসরকারি">বেসরকারি</option>
          </select>
        </div>

        <button
          className="btn btn-primary btn-block mt-sm"
          onClick={onShowResults}
        >
          Show {resultCount} Jobs
        </button>
      </div>
    </div>
  );
}
