import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';
import { runDatabaseMigration } from '../../utils/dbMigration';

const Dashboard = () => {
  const { state: adminState } = useAdminContext();
  const jobs = adminState.jobs || [];
  const activities = adminState.activities || [];
  const navigate = useNavigate();
  const [migrating, setMigrating] = useState(false);

  const handleMigration = async () => {
    if (window.confirm('This will update all old posts with a creation time to fix the "Just now" display. Proceed?')) {
      setMigrating(true);
      try {
        await runDatabaseMigration();
        alert('Database migration successful! All old posts now have timestamps.');
      } catch (err) {
        alert('Migration failed: ' + err.message);
      } finally {
        setMigrating(false);
      }
    }
  };

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
    const count = jobs.filter(j => j.category === catId).length;
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

  const recentJobs = jobs.slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  const getActivityColor = (type) => {
    if (type === 'add') return '#10b981'; // green
    if (type === 'update') return '#3b82f6'; // blue
    if (type === 'delete') return '#ef4444'; // red
    return '#64748b';
  };

  return (
    <div className="admin-dashboard-page animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card {
          animation: fadeInUp 0.5s ease forwards;
        }
        .stat-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
        }
        .btn-modern:hover {
          background: #1e40af !important;
          transform: scale(1.02);
        }
      `}</style>

      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ color: '#0f172a', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0 }}>Dashboard</h1>
        </div>
        <button
          onClick={handleMigration}
          disabled={migrating}
          className="btn-modern"
          style={{
            padding: '12px 20px',
            background: migrating ? '#94a3b8' : 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: migrating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 4px 14px rgba(26, 86, 219, 0.25)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {migrating ? '🔄 Updating...' : '🧹 Fix Old Post Times'}
        </button>
      </div>

      {/* STATS GRID */}
      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
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
              padding: '1.25rem 1.5rem',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.01)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animationDelay: `${i * 80}ms`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '100px',
              border: '1px solid rgba(241, 245, 249, 0.8)'
            }}
          >
            <div>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.825rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</p>
              <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', color: '#1e293b', fontWeight: 800 }}>{formatNumber(stat.val)}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS GRID */}
      <div className="admin-charts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* BAR CHART */}
        <div className="admin-chart-card animate-card" style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animationDelay: '400ms', border: '1px solid rgba(241, 245, 249, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Jobs by Category</h3>
            <div style={{ fontSize: '12px', padding: '4px 12px', background: '#f8fafc', borderRadius: '20px', color: '#64748b', border: '1px solid #e2e8f0' }}>Last updated: Just now</div>
          </div>
          <div className="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', paddingBottom: '20px', gap: '12px' }}>
            {categoryCounts.map((cat, idx) => (
              <div key={idx} className="bar-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>{cat.count}</span>
                <div 
                  className="bar" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '32px',
                    height: `${(cat.count / maxCount) * 160}px`,
                    background: `linear-gradient(to top, ${cat.textColor}, ${cat.textColor}dd)`,
                    borderRadius: '8px 8px 4px 4px',
                    minHeight: cat.count > 0 ? '6px' : '2px',
                    boxShadow: cat.count > 0 ? `0 4px 12px ${cat.textColor}40` : 'none',
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                ></div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '12px', fontWeight: 700, textAlign: 'center', textTransform: 'uppercase' }}>
                  {cat.id.substring(0,3)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DONUT CHART */}
        <div className="admin-chart-card animate-card" style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animationDelay: '500ms', border: '1px solid rgba(241, 245, 249, 0.8)' }}>
          <h3 style={{ margin: '0 0 2rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Status Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="donut-container" style={{ position: 'relative', width: '180px', height: '180px' }}>
              <div 
                className="donut-chart" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: conicString,
                  position: 'relative',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.05)',
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
                    width: '120px',
                    height: '120px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                  }}
                >
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{formatNumber(totalCirculars)}</span>
                  <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600, marginTop: '4px' }}>Total</span>
                </div>
              </div>
            </div>
            
            <div className="donut-legend" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', width: '100%' }}>
              {[
                { color: '#10b981', label: 'Active' },
                { color: '#f59e0b', label: 'Draft' },
                { color: '#ef4444', label: 'Expired' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: item.color, boxShadow: `0 2px 6px ${item.color}40` }}></span> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT DATA ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* TABLE CARD */}
        <div className="admin-table-wrapper animate-card" style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animationDelay: '600ms', border: '1px solid rgba(241, 245, 249, 0.8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Recent Circulars</h3>
            <Link to="/admin/jobs" style={{ color: '#1a56db', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, background: 'rgba(26, 86, 219, 0.05)', padding: '6px 16px', borderRadius: '10px', transition: 'all 0.2s' }}>View All</Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0 1rem', fontWeight: 700 }}>Information</th>
                  <th style={{ padding: '0 1rem', fontWeight: 700 }}>Category</th>
                  <th style={{ padding: '0 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0 1rem', fontWeight: 700 }}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job, i) => {
                  const catData = categories.find(c => c.id === job.category);
                  let statusBg = '#f1f5f9', statusColor = '#475569';
                  if (job.status === 'active') { statusBg = '#d1fae5'; statusColor = '#065f46'; }
                  if (job.status === 'draft') { statusBg = '#fef3c7'; statusColor = '#92400e'; }
                  if (job.status === 'expired') { statusBg = '#fee2e2'; statusColor = '#991b1b'; }

                  return (
                    <tr key={job.id} style={{ transition: 'transform 0.2s', cursor: 'pointer' }}>
                      <td style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px 0 0 12px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>{job.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{job.organization}</div>
                      </td>
                      <td style={{ padding: '1rem', background: '#f8fafc' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, background: `${catData?.textColor}15`, color: catData?.textColor }}>
                          {catData?.name || job.category}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', background: '#f8fafc' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, background: statusBg, color: statusColor, textTransform: 'uppercase' }}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0 12px 12px 0', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
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
        <div className="admin-chart-card animate-card" style={{ background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animationDelay: '700ms', border: '1px solid rgba(241, 245, 249, 0.8)' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Recent Activity</h3>
          <div className="activity-feed" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentActivities.length > 0 ? (
              recentActivities.map((act, idx) => (
                <div key={idx} className="activity-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${getActivityColor(act.type)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {act.type === 'add' ? '✨' : act.type === 'update' ? '🔄' : '🗑️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0', fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{act.text}</p>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{act.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>No recent activity to show.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
