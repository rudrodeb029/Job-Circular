import React from 'react';
import { Search, SlidersHorizontal } from './Icons';

export default function SearchBar({ value, onChange, placeholder, onFilterClick, showFilter = false, activeFilterCount = 0 }) {
  return (
    <div className="search-bar">
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
