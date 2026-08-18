import React, { useState } from 'react';
import { Search, SlidersHorizontal } from './Icons';

export default function SearchBar({ value, onChange, placeholder, onFilterClick, showFilter = false, activeFilterCount = 0 }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`search-bar ${isFocused ? 'is-focused' : ''} ${value ? 'has-value' : ''}`} style={{
      border: '1px solid rgba(37, 99, 235, 0.12)',
      boxShadow: '0 4px 18px rgba(37, 99, 235, 0.04)',
      background: 'var(--white)'
    }}>
      <div className="search-bar-icon-box">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder || 'Search jobs...'}
      />
      {showFilter && (
        <button
          className={`search-bar-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={onFilterClick}
          aria-label="Filter"
          title="Filter Jobs"
        >
          <SlidersHorizontal size={16} />
        </button>
      )}
    </div>
  );
}
