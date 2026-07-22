import React from 'react';

const TabBar = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs" style={{ display: 'flex', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid #eee', scrollbarWidth: 'none' }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          style={{
            padding: '8px 8px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #4CAF50' : '2px solid transparent',
            color: activeTab === tab.id ? '#4CAF50' : '#666',
            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontSize: '12px',
            flex: 1,
            textAlign: 'center'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
