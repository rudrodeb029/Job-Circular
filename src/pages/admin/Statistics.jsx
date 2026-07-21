import React, { useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { categories } from '../../data/categories';

const Statistics = () => {
  const { jobs } = useAdminContext();

  const stats = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return null;
    }

    const totalJobs = jobs.length;

    // Total Organizations
    const orgs = new Set();
    let totalVacancies = 0;
    
    // Category Counts
    const categoryCounts = {};
    
    // Location Counts
    const locationCounts = {};
    
    // Type Counts
    const typeCounts = {
      'সরকারি': 0,
      'ব্যাংক': 0,
      'এনজিও': 0,
      'বেসরকারি': 0,
    };
    
    // Salary
    let specificSalary = 0;
    let negotiable = 0;
    let hourly = 0;
    
    let jobsThisMonth = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    jobs.forEach(job => {
      if (job.organization) orgs.add(job.organization);
      
      const v = parseInt(job.vacancies);
      if (!isNaN(v)) totalVacancies += v;
      
      if (job.categoryId) {
        categoryCounts[job.categoryId] = (categoryCounts[job.categoryId] || 0) + 1;
      }
      
      if (job.location) {
        locationCounts[job.location] = (locationCounts[job.location] || 0) + 1;
      }
      
      if (job.type) {
        if (typeCounts[job.type] !== undefined) {
          typeCounts[job.type]++;
        } else {
          // fallback
          typeCounts['বেসরকারি'] = (typeCounts['বেসরকারি'] || 0) + 1;
        }
      }
      
      if (job.salary) {
        if (job.salary.includes('আলোচনা সাপেক্ষে') || job.salary.toLowerCase().includes('negotiable')) {
          negotiable++;
        } else if (job.salary.includes('ঘণ্টাভিত্তিক') || job.salary.toLowerCase().includes('hourly')) {
          hourly++;
        } else {
          specificSalary++;
        }
      }
      
      // Rough date check
      const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
      if (jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear) {
        jobsThisMonth++;
      }
    });

    const totalOrganizations = orgs.size;
    const avgVacancies = totalJobs > 0 ? Math.round(totalVacancies / totalJobs) : 0;
    
    let mostActiveCategory = { id: null, count: 0 };
    Object.entries(categoryCounts).forEach(([id, count]) => {
      if (count > mostActiveCategory.count) {
        mostActiveCategory = { id, count };
      }
    });
    
    const activeCatData = categories.find(c => c.id === mostActiveCategory.id);
    const mostActiveCategoryName = activeCatData ? activeCatData.nameEn : 'N/A';

    const categoryStats = categories.map(cat => {
      const count = categoryCounts[cat.id] || 0;
      return {
        ...cat,
        count,
        percentage: totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0
      };
    }).sort((a, b) => b.count - a.count);

    const locationStats = Object.entries(locationCounts).map(([loc, count]) => ({
      location: loc,
      count,
      percentage: totalJobs > 0 ? ((count / totalJobs) * 100).toFixed(1) : 0
    })).sort((a, b) => b.count - a.count);

    return {
      totalOrganizations,
      avgVacancies,
      mostActiveCategoryName,
      mostActiveCategoryCount: mostActiveCategory.count,
      jobsThisMonth,
      categoryStats,
      locationStats,
      typeCounts,
      salary: { specificSalary, negotiable, hourly },
      totalJobs
    };
  }, [jobs]);

  if (!stats) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h2>Statistics & Analytics</h2>
        </div>
        <p style={{ color: '#94a3b8' }}>No data available.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#f8fafc' }}>Statistics & Analytics</h2>
      </div>

      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="admin-stat-card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Total Organizations</div>
          <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 'bold' }}>{stats.totalOrganizations}</div>
        </div>
        <div className="admin-stat-card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Avg Vacancies per Job</div>
          <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 'bold' }}>{stats.avgVacancies}</div>
        </div>
        <div className="admin-stat-card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Most Active Category</div>
          <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.mostActiveCategoryName}</div>
          <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>{stats.mostActiveCategoryCount} jobs</div>
        </div>
        <div className="admin-stat-card" style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>Jobs This Month</div>
          <div style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 'bold' }}>{stats.jobsThisMonth}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        
        {/* Jobs by Category */}
        <div className="admin-chart-card" style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '16px' }}>Jobs by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {stats.categoryStats.filter(c => c.count > 0).map(cat => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ width: '120px', fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.nameEn}</span>
                <div style={{ flex: 1, height: '28px', background: '#0f172a', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${cat.percentage}%`, height: '100%', background: cat.color || '#3b82f6', borderRadius: '6px', transition: 'width 1s ease' }}></div>
                </div>
                <span style={{ width: '40px', fontSize: '13px', fontWeight: '600', color: '#f1f5f9', textAlign: 'right' }}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Type & Salary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Jobs by Type */}
          <div className="admin-chart-card" style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '16px' }}>Jobs by Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.entries(stats.typeCounts).map(([type, count], idx) => {
                const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
                const perc = stats.totalJobs > 0 ? Math.round((count / stats.totalJobs) * 100) : 0;
                return (
                  <div key={type} style={{ background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{type}</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: 'bold' }}>{count}</span>
                      <span style={{ color: colors[idx % colors.length], fontSize: '12px', paddingBottom: '4px' }}>{perc}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${perc}%`, height: '100%', background: colors[idx % colors.length] }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Distribution */}
          <div className="admin-chart-card" style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '16px' }}>Salary Range Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Specific Salary', count: stats.salary.specificSalary, color: '#8b5cf6' },
                { label: 'Negotiable (আলোচনা সাপেক্ষে)', count: stats.salary.negotiable, color: '#ec4899' },
                { label: 'Hourly (ঘণ্টাভিত্তিক)', count: stats.salary.hourly, color: '#14b8a6' },
              ].map(item => {
                const perc = stats.totalJobs > 0 ? Math.round((item.count / stats.totalJobs) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>{item.label}</span>
                      <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>{item.count} ({perc}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${perc}%`, height: '100%', background: item.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Jobs by Location Table */}
      <div className="admin-chart-card" style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155' }}>
        <h3 style={{ color: '#f1f5f9', marginBottom: '20px', fontSize: '16px' }}>Jobs by Location</h3>
        <div className="admin-table-wrapper" style={{ overflowX: 'auto', background: '#0f172a', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e293b', background: '#1e293b' }}>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Location</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Job Count</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>Percentage</th>
                <th style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: '500', width: '250px' }}>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {stats.locationStats.length > 0 ? (
                stats.locationStats.slice(0, 10).map((loc, idx) => (
                  <tr key={loc.location} style={{ borderBottom: idx !== stats.locationStats.length - 1 ? '1px solid #1e293b' : 'none' }}>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: '14px' }}>{loc.location}</td>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: '14px' }}>{loc.count}</td>
                    <td style={{ padding: '12px 16px', color: '#f1f5f9', fontSize: '14px' }}>{loc.percentage}%</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${loc.percentage}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                    No location data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Statistics;
