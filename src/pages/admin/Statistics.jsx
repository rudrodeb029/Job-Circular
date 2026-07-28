import React, { useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

const Statistics = () => {
  const { state: adminState } = useAdminContext();
  const jobs = adminState.jobs || [];

  const stats = useMemo(() => {
    if (!jobs || jobs.length === 0) return null;
    const totalJobs = jobs.length;
    const orgs = new Set();
    let totalVacancies = 0;
    const categoryCounts = {};
    const locationCounts = {};
    const typeCounts = { 'সরকারি': 0, 'ব্যাংক': 0, 'এনজিও': 0, 'বেসরকারি': 0 };
    let specificSalary = 0, negotiable = 0, hourly = 0, jobsThisMonth = 0;
    const now = new Date();
    const currentMonth = now.getMonth(), currentYear = now.getFullYear();

    jobs.forEach(job => {
      if (job.organization) orgs.add(job.organization);
      const v = parseInt(job.vacancy);
      if (!isNaN(v)) totalVacancies += v;
      if (job.categoryId) categoryCounts[job.categoryId] = (categoryCounts[job.categoryId] || 0) + 1;
      if (job.location) locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
      if (job.jobType && typeCounts[job.jobType] !== undefined) typeCounts[job.jobType]++;
      else typeCounts['বেসরকারি']++;
      
      if (job.salary) {
        if (job.salary.includes('আলোচনা সাপেক্ষে') || job.salary.toLowerCase().includes('negotiable')) negotiable++;
        else if (job.salary.includes('ঘণ্টাভিত্তিক') || job.salary.toLowerCase().includes('hourly')) hourly++;
        else specificSalary++;
      }
      const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
      if (jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear) jobsThisMonth++;
    });

    const categoryStats = categories.map(cat => ({
      ...cat, count: categoryCounts[cat.id] || 0,
      percentage: totalJobs > 0 ? Math.round(((categoryCounts[cat.id] || 0) / totalJobs) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    const locationStats = Object.entries(locationCounts).map(([loc, count]) => ({
      location: loc, count, percentage: totalJobs > 0 ? ((count / totalJobs) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      totalOrganizations: orgs.size,
      avgVacancies: Math.round(totalVacancies / totalJobs),
      jobsThisMonth, categoryStats, locationStats, typeCounts,
      salary: { specificSalary, negotiable, hourly }, totalJobs
    };
  }, [jobs]);

  if (!stats) return <div className="admin-page animate-fade-in" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No data available to generate statistics.</div>;

  return (
    <div className="admin-statistics-page animate-fade-in" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 2.5rem; }
        .stat-card { background: #fff; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
        .chart-card { background: #fff; padding: 32px; border-radius: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
      `}</style>

      <div style={{ marginBottom: '2.5rem' }}><h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Statistics & Analytics</h1></div>

      <div className="stat-grid">
        {[
          { label: 'Total Organizations', val: stats.totalOrganizations, color: '#3b82f6', icon: '🏛️' },
          { label: 'Avg Vacancies / Job', val: stats.avgVacancies, color: '#8b5cf6', icon: '👥' },
          { label: 'Jobs This Month', val: stats.jobsThisMonth, color: '#10b981', icon: '📅' },
          { label: 'Active Locations', val: stats.locationStats.length, color: '#f59e0b', icon: '📍' }
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</p>
                <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{s.val}</h2>
              </div>
              <div style={{ fontSize: '24px' }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="chart-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 800 }}>Jobs by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.categoryStats.filter(c => c.count > 0).map(cat => (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                  <span style={{ color: '#475569' }}>{cat.nameEn}</span>
                  <span style={{ color: '#1e293b' }}>{cat.count} ({cat.percentage}%)</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percentage}%`, height: '100%', background: cat.color || '#3b82f6', borderRadius: '4px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: 800 }}>Job Types Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
             {Object.entries(stats.typeCounts).map(([type, count], idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                   <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, color: '#64748b' }}>{type}</p>
                   <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{count}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
