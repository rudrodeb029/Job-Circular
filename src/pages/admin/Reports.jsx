import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';

const Reports = () => {
  const { state } = useAdminContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  const activities = state?.activities || [];
  
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => 
      (activity.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (activity.target || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.text || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  const totalActivities = activities.length;
  const jobsAdded = activities.filter(a => (a.type === 'add' || (a.action || '').toLowerCase().includes('added'))).length;
  const jobsUpdated = activities.filter(a => (a.type === 'update' || (a.action || '').toLowerCase().includes('updated'))).length;

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const currentItems = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getColor = (type, action = '') => {
    if (type === 'add' || action.toLowerCase().includes('added')) return '#10b981';
    if (type === 'update' || action.toLowerCase().includes('updated')) return '#3b82f6';
    if (type === 'delete' || action.toLowerCase().includes('deleted')) return '#ef4444';
    return '#64748b';
  };

  return (
    <div className="admin-reports-page animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .report-card { background: #fff; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .report-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 11px; padding: 16px; }
        .report-table td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .btn-export { padding: 12px 20px; background: #1a56db; color: white; border: none; borderRadius: 12px; fontWeight: 700; cursor: pointer; display: flex; alignItems: center; gap: 8px; boxShadow: 0 4px 12px rgba(26, 86, 219, 0.15); transition: all 0.2s; }
        .btn-export:hover { transform: translateY(-2px); background: #1e40af; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Activity Reports</h1>
        </div>
        <button className="btn-export" onClick={() => alert('Exporting history...')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Events', val: totalActivities, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'New Circulars', val: jobsAdded, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          { label: 'Modified Posts', val: jobsUpdated, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
        ].map((s, i) => (
          <div key={i} className="report-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</p>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{s.val}</h2>
            </div>
            <div style={{ width: '48px', height: '48px', background: s.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '20px' }}>📊</div>
          </div>
        ))}
      </div>

      <div className="report-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input placeholder="Filter by action or target..." style={{ width: '100%', padding: '12px 12px 12px 48px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', outline: 'none' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>

        <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
              <tr>
                 <th>Event Type</th>
                 <th>Description</th>
                 <th>User</th>
                 <th>Occurrence</th>
              </tr>
           </thead>
           <tbody>
              {currentItems.map((item, idx) => (
                 <tr key={idx}>
                    <td>
                       <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, background: `${getColor(item.type, item.action)}15`, color: getColor(item.type, item.action), textTransform: 'uppercase' }}>
                          {item.type || (item.action?.includes('Added') ? 'add' : 'update')}
                       </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{item.text || `${item.action}: ${item.target}`}</td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>System Admin</td>
                    <td style={{ color: '#94a3b8', fontSize: '13px' }}>{item.time || 'Recently'}</td>
                 </tr>
              ))}
              {currentItems.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No activity records found.</td></tr>
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
