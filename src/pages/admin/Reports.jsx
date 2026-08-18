import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { formatTimeAgo } from '../../utils/timeUtils';

const Reports = () => {
  const { state: adminState } = useAdminContext() || { state: {} };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const rawActivities = adminState?.activities || [];
  const jobs = adminState?.jobs || [];
  const liveExams = adminState?.liveExams || [];
  const questions = adminState?.questions || [];
  const notifications = adminState?.notifications || [];

  // Build comprehensive unified activity history
  const allEvents = useMemo(() => {
    const list = [...rawActivities];

    // If activities log is small or empty, auto-populate from existing collections
    if (list.length < 5) {
      jobs.forEach(j => {
        if (!list.some(a => a.id === `gen-job-${j.id}`)) {
          list.push({
            id: `gen-job-${j.id}`,
            type: 'job',
            action: 'Job Circular Created',
            target: j.title || j.titleEn || 'Circular',
            text: `Published new circular: ${j.title || j.titleEn || 'Job'} (${j.organization || 'Org'})`,
            user: 'System Admin',
            createdAt: j.createdAt || j.updatedAt || new Date().toISOString()
          });
        }
      });

      liveExams.forEach(e => {
        if (!list.some(a => a.id === `gen-exam-${e.id}`)) {
          list.push({
            id: `gen-exam-${e.id}`,
            type: 'exam',
            action: 'Live Exam Created',
            target: e.title || e.titleEn || 'Live Exam',
            text: `Created live exam: ${e.title || e.titleEn || 'Exam'} (${e.duration || 60} mins)`,
            user: 'System Admin',
            createdAt: e.createdAt || e.startTime || new Date().toISOString()
          });
        }
      });

      notifications.forEach(n => {
        if (!list.some(a => a.id === `gen-notif-${n.id}`)) {
          list.push({
            id: `gen-notif-${n.id}`,
            type: 'notification',
            action: 'Push Notification Sent',
            target: n.title || n.titleEn || 'Notification',
            text: n.message || n.messageEn || 'Alert sent to users',
            user: 'System Admin',
            createdAt: n.createdAt || new Date().toISOString()
          });
        }
      });
    }

    // Normalize and sort by date DESCENDING
    return list.map(item => {
      const timeVal = item.createdAt || item.time || item.timestamp || new Date().toISOString();
      const dateObj = new Date(timeVal);
      const isValidDate = !isNaN(dateObj.getTime());
      
      let normType = item.type || 'system';
      if (item.type === 'live_exam_submission' || item.examId) normType = 'submission';
      else if (item.type === 'contact_message') normType = 'message';
      else if ((item.action || '').toLowerCase().includes('job') || (item.target || '').toLowerCase().includes('job')) normType = 'job';
      else if ((item.action || '').toLowerCase().includes('exam') || (item.target || '').toLowerCase().includes('exam')) normType = 'exam';
      else if ((item.action || '').toLowerCase().includes('notif') || (item.target || '').toLowerCase().includes('notif')) normType = 'notification';
      else if ((item.action || '').toLowerCase().includes('question')) normType = 'question';

      const descText = item.text || item.description || (item.action ? `${item.action}: ${item.target || ''}` : 'Activity logged');
      const actor = item.userName || item.user || 'System Admin';

      return {
        id: item.id || `act-${Math.random()}`,
        type: normType,
        action: item.action || (normType === 'submission' ? 'Exam Submission' : 'System Event'),
        text: descText,
        user: actor,
        score: item.score,
        total: item.total,
        timeTaken: item.timeTaken,
        createdAt: isValidDate ? dateObj.toISOString() : new Date().toISOString(),
        formattedDate: isValidDate ? dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [rawActivities, jobs, liveExams, questions, notifications]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      // Type Filter
      if (selectedType !== 'all' && ev.type !== selectedType) {
        return false;
      }

      // Date Range Filter
      if (dateRange !== 'all') {
        const evTime = new Date(ev.createdAt).getTime();
        const now = Date.now();
        if (dateRange === 'today') {
          const oneDay = 24 * 60 * 60 * 1000;
          if (now - evTime > oneDay) return false;
        } else if (dateRange === '7days') {
          const sevenDays = 7 * 24 * 60 * 60 * 1000;
          if (now - evTime > sevenDays) return false;
        } else if (dateRange === '30days') {
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (now - evTime > thirtyDays) return false;
        }
      }

      // Search Term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchText = (ev.text || '').toLowerCase().includes(term);
        const matchAction = (ev.action || '').toLowerCase().includes(term);
        const matchUser = (ev.user || '').toLowerCase().includes(term);
        const matchType = (ev.type || '').toLowerCase().includes(term);
        if (!matchText && !matchAction && !matchUser && !matchType) return false;
      }

      return true;
    });
  }, [allEvents, selectedType, dateRange, searchTerm]);

  // Statistics calculation
  const totalEvents = allEvents.length;
  const totalJobs = allEvents.filter(e => e.type === 'job').length;
  const totalExams = allEvents.filter(e => e.type === 'exam' || e.type === 'submission').length;
  const totalNotifs = allEvents.filter(e => e.type === 'notification').length;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const currentItems = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  // Type Badges Styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'job':
        return { bg: '#eff6ff', color: '#1a56db', label: 'Circular' };
      case 'exam':
        return { bg: '#fef3c7', color: '#d97706', label: 'Live Exam' };
      case 'submission':
        return { bg: '#d1fae5', color: '#059669', label: 'Submission' };
      case 'notification':
        return { bg: '#ede9fe', color: '#7c3aed', label: 'Notification' };
      case 'message':
        return { bg: '#ffedd5', color: '#ea580c', label: 'Support Message' };
      case 'question':
        return { bg: '#e0f2fe', color: '#0284c7', label: 'Question' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', label: 'System' };
    }
  };

  // Real CSV Export Generator
  const handleExportCSV = () => {
    if (filteredEvents.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = ['Event ID', 'Type', 'Action', 'Description', 'User/Actor', 'Score/Result', 'Timestamp'];
    const rows = filteredEvents.map(e => [
      `"${e.id}"`,
      `"${e.type}"`,
      `"${(e.action || '').replace(/"/g, '""')}"`,
      `"${(e.text || '').replace(/"/g, '""')}"`,
      `"${(e.user || '').replace(/"/g, '""')}"`,
      `"${e.score !== undefined ? `${e.score}/${e.total || 100} (${e.timeTaken || ''})` : 'N/A'}"`,
      `"${e.formattedDate}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-reports-page animate-fade-in" style={{ padding: '16px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .report-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
        .report-table th { background: #f8fafc; color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 10px 14px; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .report-table td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; }
        .report-table tbody tr:hover { background: #f8fafc; }
        .btn-export { padding: 8px 14px; background: #1a56db; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; alignItems: center; gap: 6px; box-shadow: 0 2px 6px rgba(26, 86, 219, 0.15); transition: all 0.2s; }
        .btn-export:hover { background: #1e40af; transform: translateY(-1px); }
        .filter-select { padding: 7px 12px; font-size: 11.5px; border-radius: 8px; border: 1px solid #e2e8f0; background: #ffffff; color: #334155; outline: none; font-weight: 600; cursor: pointer; }
        .page-btn { padding: 5px 10px; border-radius: 6px; border: 1px solid #e2e8f0; background: #ffffff; color: #334155; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
        .page-btn.active { background: #1a56db; color: white; border-color: #1a56db; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Activity & Performance Reports</h1>
          <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#64748b' }}>Audit log of circulars, live exams, submissions, and admin actions</p>
        </div>
        <button className="btn-export" onClick={handleExportCSV}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV ({filteredEvents.length})
        </button>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        {[
          { label: 'Total Events', val: totalEvents, color: '#2563eb', bg: '#eff6ff', icon: '⚡' },
          { label: 'Circular Posts', val: totalJobs, color: '#059669', bg: '#ecfdf5', icon: '📄' },
          { label: 'Exams & Submissions', val: totalExams, color: '#d97706', bg: '#fffbeb', icon: '📝' },
          { label: 'Push Notifications', val: totalNotifs, color: '#7c3aed', bg: '#f5f3ff', icon: '🔔' }
        ].map((s, i) => (
          <div key={i} className="report-card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
              <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{s.val}</h2>
            </div>
            <div style={{ width: '36px', height: '36px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="report-card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Filters Header Bar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              placeholder="Search action, description, or user..." 
              style={{ width: '100%', padding: '7px 10px 7px 34px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '11.5px', outline: 'none', color: '#1e293b' }} 
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
            />
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              className="filter-select"
              value={selectedType} 
              onChange={e => { setSelectedType(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Event Types</option>
              <option value="job">Circulars</option>
              <option value="exam">Live Exams</option>
              <option value="submission">Student Submissions</option>
              <option value="message">User Messages</option>
              <option value="notification">Notifications</option>
              <option value="question">Questions</option>
            </select>

            <select 
              className="filter-select"
              value={dateRange} 
              onChange={e => { setDateRange(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>

            <select 
              className="filter-select"
              value={itemsPerPage} 
              onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={10}>10 / page</option>
              <option value={12}>12 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Type</th>
                <th>Action & Description</th>
                <th style={{ width: '150px' }}>Actor / User</th>
                <th style={{ width: '170px' }}>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, idx) => {
                const badge = getTypeBadge(item.type);
                return (
                  <tr key={item.id || idx}>
                    <td>
                      <span style={{ 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        fontSize: '10px', 
                        fontWeight: 800, 
                        background: badge.bg, 
                        color: badge.color, 
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px', fontSize: '12.5px' }}>
                        {item.action}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11.5px', lineHeight: '1.4' }}>
                        {item.text}
                        {item.score !== undefined && (
                          <span style={{ marginLeft: '6px', fontWeight: 700, color: '#059669' }}>
                            (Score: {item.score}/{item.total || 100}{item.timeTaken ? ` in ${item.timeTaken}` : ''})
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '11.5px', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span>👤</span>
                        {item.user}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {item.formattedDate}
                    </td>
                  </tr>
                );
              })}

              {currentItems.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>📋</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b' }}>No activity records found</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Try adjusting your search terms or filters</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Working Pagination Footer */}
        {filteredEvents.length > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
              Showing <strong>{startIndex + 1}</strong> to <strong>{Math.min(startIndex + itemsPerPage, filteredEvents.length)}</strong> of <strong>{filteredEvents.length}</strong> entries
            </div>

            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button 
                className="page-btn" 
                disabled={validCurrentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                ◀ Prev
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && validCurrentPage > 3) {
                  p = validCurrentPage - 3 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                return (
                  <button 
                    key={p} 
                    className={`page-btn ${validCurrentPage === p ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                );
              })}

              <button 
                className="page-btn" 
                disabled={validCurrentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
