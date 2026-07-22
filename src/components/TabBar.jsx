import React from 'react';

const TabBar = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
