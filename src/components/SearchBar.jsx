import React from 'react';
import { Search, SlidersHorizontal } from './Icons';

export default function SearchBar({ value, onChange, placeholder, onFilterClick, showFilter = false, activeFilterCount = 0 }) {
  return (
    <div className="search-bar" style={{
      border: '1px solid rgba(37, 99, 235, 0.12)',
      boxShadow: '0 4px 18px rgba(37, 99, 235, 0.04)',
      background: 'var(--white)'
    }}>
      <div className="search-bar-icon-box">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Search jobs...'}
      />
      {showFilter && (
        <button
          className={`search-bar-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={onFilterClick}
          aria-label="Filter"
          title="Filter Jobs"
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
}
