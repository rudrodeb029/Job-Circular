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

  if (!stats) return <div className="admin-page animate-fade-in" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>No data available to generate statistics.</div>;

  return (
    <div className="admin-statistics-page animate-fade-in" style={{ padding: '16px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
        .stat-card { background: #fff; padding: 14px 16px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .chart-card { background: #fff; padding: 16px 18px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
      `}</style>

      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Statistics & Analytics</h1>
      </div>

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
                <p style={{ margin: 0, fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                <h2 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{s.val}</h2>
              </div>
              <div style={{ fontSize: '18px' }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px', marginBottom: '16px' }}>
        <div className="chart-card">
          <h3 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Jobs by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.categoryStats.filter(c => c.count > 0).map(cat => (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11.5px', fontWeight: 600 }}>
                  <span style={{ color: '#475569' }}>{cat.nameEn || cat.name}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{cat.count} ({cat.percentage}%)</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percentage}%`, height: '100%', background: cat.color || '#3b82f6', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 style={{ margin: '0 0 14px 0', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>Job Types Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             {Object.entries(stats.typeCounts).map(([type, count], idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                   <p style={{ margin: '0 0 4px 0', fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>{type}</p>
                   <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{count}</p>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
