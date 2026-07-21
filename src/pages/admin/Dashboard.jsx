import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

const Dashboard = () => {
  const { jobs = [], activities = [] } = useAdminContext();
  const navigate = useNavigate();

  const formatNumber = (n) => {
    return n ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };

  const totalCirculars = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'active').length;
  const draftJobs = jobs.filter(j => j.status === 'draft').length;
  const expiredJobs = jobs.filter(j => j.status === 'expired').length;
  
  const totalVacancies = jobs.reduce((sum, j) => {
    const v = parseInt(j.vacancy, 10);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);

  const catList = ['gov', 'bank', 'ngo', 'private', 'it', 'defense', 'healthcare', 'teaching', 'engineering', 'parttime'];
  const categoryCounts = catList.map(catId => {
    const count = jobs.filter(j => j.category === catId).length;
    const catData = categories.find(c => c.id === catId);
    return {
      id: catId,
      name: catData?.name || catId,
      textColor: catData?.textColor || '#6b7280',
      count
    };
  });
  
  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);

  const activePct = totalCirculars ? (activeJobs / totalCirculars) * 100 : 0;
  const draftPct = totalCirculars ? (draftJobs / totalCirculars) * 100 : 0;
  const expiredPct = totalCirculars ? (expiredJobs / totalCirculars) * 100 : 0;
  const conicString = `conic-gradient(#10b981 0% ${activePct}%, #f59e0b ${activePct}% ${activePct + draftPct}%, #ef4444 ${activePct + draftPct}% 100%)`;

  const recentJobs = jobs.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  const getActivityColor = (type) => {
    if (type === 'add') return '#10b981'; // green
    if (type === 'update') return '#3b82f6'; // blue
    if (type === 'delete') return '#ef4444'; // red
    return '#6b7280';
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back, Admin</p>
      </div>

      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Total Circulars</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.875rem' }}>{formatNumber(totalCirculars)}</h3>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(59,130,246,0.15)', borderRadius: '0.5rem', color: '#3b82f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
          </div>
          <p className="positive" style={{ color: '#10b981', margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>+12 this week</p>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Active Jobs</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.875rem' }}>{formatNumber(activeJobs)}</h3>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16,185,129,0.15)', borderRadius: '0.5rem', color: '#10b981' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Currently publishing</p>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Total Vacancies</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.875rem' }}>{formatNumber(totalVacancies)}</h3>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(168,85,247,0.15)', borderRadius: '0.5rem', color: '#a855f7' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Across all jobs</p>
        </div>

        <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Expired</p>
              <h3 style={{ margin: '0.5rem 0', fontSize: '1.875rem' }}>{formatNumber(expiredJobs)}</h3>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', borderRadius: '0.5rem', color: '#ef4444' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>Require attention</p>
        </div>
      </div>

      <div className="admin-charts-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="admin-chart-card" style={{ background: '#fff', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem' }}>Jobs by Category</h3>
          <div className="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', paddingBottom: '20px', gap: '8px' }}>
            {categoryCounts.map((cat, idx) => (
              <div key={idx} className="bar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>{cat.count}</span>
                <div 
                  className="bar" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '40px',
                    height: `${(cat.count / maxCount) * 180}px`, 
                    background: cat.textColor,
                    borderRadius: '4px 4px 0 0',
                    minHeight: cat.count > 0 ? '4px' : '0'
                  }}
                ></div>
                <span style={{ fontSize: '0.75rem', color: '#374151', marginTop: '8px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {cat.id.substring(0,3).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-chart-card" style={{ background: '#fff', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem' }}>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="donut-container" style={{ position: 'relative', width: '160px', height: '160px' }}>
              <div 
                className="donut-chart" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: conicString,
                  position: 'relative'
                }}
              >
                <div 
                  className="donut-inner" 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '110px',
                    height: '110px',
                    background: '#fff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatNumber(totalCirculars)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total</span>
                </div>
              </div>
            </div>
            
            <div className="donut-legend" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span> Active
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span> Draft
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Expired
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '60% calc(40% - 1.5rem)', gap: '1.5rem' }}>
        <div className="admin-table-wrapper" style={{ background: '#fff', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Circulars</h3>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '0.875rem' }}>
                  <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Title</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Organization</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Category</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '0.75rem 0', fontWeight: 500 }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => {
                  const catData = categories.find(c => c.id === job.category);
                  const statusClass = `status-${job.status}`;
                  
                  // Generate some mock colors for status badges
                  let statusBg = '#f3f4f6';
                  let statusColor = '#374151';
                  if (job.status === 'active') { statusBg = '#d1fae5'; statusColor = '#065f46'; }
                  if (job.status === 'draft') { statusBg = '#fef3c7'; statusColor = '#92400e'; }
                  if (job.status === 'expired') { statusBg = '#fee2e2'; statusColor = '#991b1b'; }

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.875rem' }}>
                      <td style={{ padding: '1rem 0', fontWeight: 500 }}>{job.title}</td>
                      <td style={{ padding: '1rem 0', color: '#4b5563' }}>{job.organization}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span className="status-badge" style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: `${catData?.textColor}20`, color: catData?.textColor }}>
                          {catData?.name || job.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0' }}>
                        <span className={`status-badge ${statusClass}`} style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', background: statusBg, color: statusColor, textTransform: 'capitalize' }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0', color: '#6b7280' }}>{job.deadline}</td>
                    </tr>
                  )
                })}
                {recentJobs.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem 0', textAlign: 'center', color: '#6b7280' }}>No recent circulars</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1.25rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <Link to="/admin/jobs" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>View All Circulars</Link>
          </div>
        </div>

        <div className="admin-chart-card" style={{ background: '#fff', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.125rem' }}>Recent Activity</h3>
          <div className="activity-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} className="activity-item" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div className="activity-dot" style={{ marginTop: '0.375rem', width: '10px', height: '10px', borderRadius: '50%', background: getActivityColor(act.type), flexShrink: 0 }}></div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#374151' }}>{act.text}</p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>No recent activity.</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
