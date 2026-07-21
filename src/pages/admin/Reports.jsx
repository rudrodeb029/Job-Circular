import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';

const Reports = () => {
  const { state } = useAdminContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const activities = state?.activities || [];
  
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => 
      (activity.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (activity.target || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  const totalActivities = activities.length;
  const jobsAdded = activities.filter(a => (a.action || '').toLowerCase().includes('added')).length;
  const jobsUpdated = activities.filter(a => (a.action || '').toLowerCase().includes('updated')).length;

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentItems = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    if (activities.length === 0) return;
    const header = ['Action', 'Target', 'Timestamp'];
    const rows = activities.map(a => [
      `"${a.action || ''}"`,
      `"${a.target || ''}"`,
      `"${a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}"`
    ]);
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'activity_log.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getColor = (action = '') => {
    const lower = action.toLowerCase();
    if (lower.includes('added')) return '#22c55e';
    if (lower.includes('updated')) return '#3b82f6';
    if (lower.includes('deleted')) return '#ef4444';
    return '#64748b';
  };

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Reports & Activity Log</h2>
        <button onClick={exportCSV} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Activity Log
        </button>
      </div>

      <div className="stats-row" style={{ display: 'flex', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: 14, textTransform: 'uppercase' }}>Total Activities</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 'bold' }}>{totalActivities}</p>
        </div>
        <div style={{ flex: 1, minWidth: 200, padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: 14, textTransform: 'uppercase' }}>Jobs Added</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 'bold', color: '#22c55e' }}>{jobsAdded}</p>
        </div>
        <div style={{ flex: 1, minWidth: 200, padding: 20, background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ margin: 0, color: '#64748b', fontSize: 14, textTransform: 'uppercase' }}>Jobs Updated</h4>
          <p style={{ margin: '10px 0 0 0', fontSize: 28, fontWeight: 'bold', color: '#3b82f6' }}>{jobsUpdated}</p>
        </div>
      </div>

      <div className="admin-chart-card" style={{ background: 'white', padding: 20, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '8px 12px', borderRadius: 4, border: '1px solid #e2e8f0', width: 'fit-content' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search activities..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: 250, fontSize: 14 }}
          />
        </div>

        <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>#</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Target</th>
                <th style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: '12px 16px', color: getColor(item.action), fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: getColor(item.action) }}></span>
                      {item.action}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#334155' }}>{item.target}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                    No activities found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 5 }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: 'white', borderRadius: 4, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : '#334155' }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{ 
                  padding: '6px 12px', 
                  border: '1px solid #cbd5e1', 
                  background: currentPage === i + 1 ? '#3b82f6' : 'white', 
                  color: currentPage === i + 1 ? 'white' : '#334155',
                  borderRadius: 4, 
                  cursor: 'pointer' 
                }}
              >
                {i + 1}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: 'white', borderRadius: 4, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#94a3b8' : '#334155' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
