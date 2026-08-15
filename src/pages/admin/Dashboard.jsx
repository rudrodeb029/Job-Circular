import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';
import { formatTimeAgo } from '../../utils/timeUtils';

const Dashboard = () => {
  const { state: adminState } = useAdminContext();
  const jobs = adminState.jobs || [];
  const activities = adminState.activities || [];
  const navigate = useNavigate();

  const formatNumber = (n) => {
    return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };

  const totalCirculars = jobs.length;
  
  const activeJobs = jobs.filter(j => {
    if (!j.deadline) return j.status === 'active';
    const deadlineDate = new Date(`${j.deadline}T23:59:59`);
    return deadlineDate.getTime() >= Date.now();
  }).length;

  const expiredJobs = jobs.filter(j => {
    if (!j.deadline) return j.status === 'expired';
    const deadlineDate = new Date(`${j.deadline}T23:59:59`);
    return deadlineDate.getTime() < Date.now();
  }).length;

  const draftJobs = jobs.filter(j => j.status === 'draft').length;

  const liveExams = adminState.liveExams || [];
  const activeLiveExams = liveExams.filter(exam => {
    const start = new Date(exam.startTime).getTime();
    const end = start + (parseInt(exam.duration, 10) || 0) * 60000;
    return Date.now() <= end;
  }).length;

  const papers = adminState.questions || [];
  const totalMCQs = papers.reduce((sum, p) => {
    if (Array.isArray(p.questions)) {
      return sum + p.questions.length;
    }
    const qCount = parseInt(p.totalQuestions || 0, 10);
    return sum + (isNaN(qCount) ? 0 : qCount);
  }, 0);

  const catList = ['gov', 'bank', 'ngo', 'private', 'it', 'defense', 'healthcare', 'teaching', 'engineering', 'parttime'];
  const categoryCounts = catList.map(catId => {
    const count = jobs.filter(j => (j.categoryId || j.category) === catId).length;
    const catData = categories.find(c => c.id === catId);
    return {
      id: catId,
      name: catData?.name || catId,
      textColor: catData?.textColor || '#64748b',
      count
    };
  });
  
  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);

  const activePct = totalCirculars ? (activeJobs / totalCirculars) * 100 : 0;
  const draftPct = totalCirculars ? (draftJobs / totalCirculars) * 100 : 0;
  const expiredPct = totalCirculars ? (expiredJobs / totalCirculars) * 100 : 0;
  const conicString = `conic-gradient(#10b981 0% ${activePct}%, #f59e0b ${activePct}% ${activePct + draftPct}%, #ef4444 ${activePct + draftPct}% 100%)`;

  const recentJobs = jobs.slice(0, 15);
  const recentActivities = activities.slice(0, 20);

  const getActivityColor = (type) => {
    if (type === 'add') return '#10b981'; // green
    if (type === 'update') return '#3b82f6'; // blue
    if (type === 'delete') return '#ef4444'; // red
    return '#64748b';
  };

  return (
    <div className="admin-dashboard-page animate-fade-in" style={{ padding: '16px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card {
          animation: fadeInUp 0.4s ease forwards;
        }
        .stat-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(0,0,0,0.06) !important;
        }
        .btn-modern:hover {
          background: #1e40af !important;
          transform: scale(1.02);
        }
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 99px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>

      {/* STATS GRID */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Total Circulars', val: totalCirculars },
          { label: 'Active Jobs', val: activeJobs },
          { label: 'Expired', val: expiredJobs },
          { label: 'Active Live Exam', val: activeLiveExams },
          { label: 'Total MCQ', val: totalMCQs }
        ].map((stat, i) => (
          <div
            key={i}
            className="stat-card animate-card stat-card-hover"
            style={{
              padding: '12px 14px',
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              animationDelay: `${i * 60}ms`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              border: '1px solid #e2e8f0'
            }}
          >
            <div>
              <p style={{ color: '#64748b', margin: 0, fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</p>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '20px', color: '#0f172a', fontWeight: 800 }}>{formatNumber(stat.val)}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="admin-charts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* BAR CHART */}
        <div className="admin-chart-card animate-card" style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', animationDelay: '300ms', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Jobs by Category</h3>
            <div style={{ fontSize: '10.5px', padding: '3px 8px', background: '#f8fafc', borderRadius: '12px', color: '#64748b', border: '1px solid #e2e8f0' }}>Last updated: Just now</div>
          </div>
          <div className="bar-chart" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: '160px', gap: '8px' }}>
            {categoryCounts.map((cat, idx) => (
              <div key={idx} className="bar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>{cat.count}</span>
                <div 
                  className="bar" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '24px',
                    height: `${(cat.count / maxCount) * 110}px`,
                    background: `linear-gradient(to top, ${cat.textColor}, ${cat.textColor}dd)`,
                    borderRadius: '5px 5px 2px 2px',
                    minHeight: cat.count > 0 ? '4px' : '2px',
                    boxShadow: cat.count > 0 ? `0 2px 8px ${cat.textColor}30` : 'none',
                    transition: 'all 0.5s ease'
                  }}
                ></div>
                <span style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                  {cat.id.substring(0,3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="admin-chart-card animate-card" style={{ background: '#ffffff', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', animationDelay: '400ms', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="donut-container" style={{ position: 'relative', width: '130px', height: '130px' }}>
              <div 
                className="donut-chart" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: conicString,
                  position: 'relative',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.5s ease'
                }}
              >
                <div 
                  className="donut-inner" 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '82px',
                    height: '82px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{formatNumber(totalCirculars)}</span>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>Total</span>
                </div>
              </div>
            </div>
            
            <div className="donut-legend" style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '14px', width: '100%' }}>
              {[
                { color: '#10b981', label: 'Active' },
                { color: '#f59e0b', label: 'Draft' },
                { color: '#ef4444', label: 'Expired' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: item.color }}></span> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT DATA ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        {/* TABLE CARD */}
        <div className="admin-table-wrapper animate-card" style={{ display: 'flex', flexDirection: 'column', height: '360px', background: '#ffffff', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', animationDelay: '500ms', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Recent Circulars</h3>
            <Link to="/admin/jobs" style={{ color: '#1a56db', textDecoration: 'none', fontSize: '11px', fontWeight: 700, background: '#eff6ff', padding: '4px 10px', borderRadius: '6px' }}>View All</Link>
          </div>
          
          <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', paddingRight: '2px' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 }}>
                <tr style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '4px 8px', fontWeight: 700, background: '#ffffff' }}>Information</th>
                  <th style={{ padding: '4px 8px', fontWeight: 700, background: '#ffffff' }}>Category</th>
                  <th style={{ padding: '4px 8px', fontWeight: 700, background: '#ffffff' }}>Status</th>
                  <th style={{ padding: '4px 8px', fontWeight: 700, background: '#ffffff' }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
                  const catData = categories.find(c => c.id === (job.categoryId || job.category));
                  let statusBg = '#f1f5f9', statusColor = '#475569';
                  if (job.status === 'active') { statusBg = '#d1fae5'; statusColor = '#065f46'; }
                  if (job.status === 'draft') { statusBg = '#fef3c7'; statusColor = '#92400e'; }
                  if (job.status === 'expired') { statusBg = '#fee2e2'; statusColor = '#991b1b'; }

                  return (
                    <tr key={job.id} style={{ cursor: 'pointer' }}>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '8px 0 0 8px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1px', fontSize: '12px' }}>{job.title}</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b' }}>{job.organization}</div>
                      </td>
                      <td style={{ padding: '8px 10px', background: '#f8fafc' }}>
                        <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, background: `${catData?.textColor || '#64748b'}15`, color: catData?.textColor || '#64748b' }}>
                          {catData?.name || job.categoryId || job.category}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', background: '#f8fafc' }}>
                        <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '5px', fontSize: '9.5px', fontWeight: 800, background: statusBg, color: statusColor, textTransform: 'uppercase' }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '0 8px 8px 0', color: '#475569', fontWeight: 600, fontSize: '11px' }}>
                        {job.deadline}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVITY CARD */}
        <div className="admin-chart-card animate-card" style={{ display: 'flex', flexDirection: 'column', height: '360px', background: '#ffffff', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', animationDelay: '600ms', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>Recent Activity</h3>
          <div className="activity-feed custom-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} className="activity-item" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0, padding: '6px 0' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${getActivityColor(act.type)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', flexShrink: 0 }}>
                    {act.type === 'add' ? '✨' : act.type === 'update' ? '🔄' : '🗑️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0', fontSize: '11.5px', color: '#1e293b', fontWeight: 600 }}>{act.text}</p>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>{formatTimeAgo(act.createdAt || act.time, true)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', flexShrink: 0 }}>
                <p style={{ color: '#94a3b8', fontSize: '11.5px', fontWeight: 500 }}>No recent activity to show.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
