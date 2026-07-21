import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import JobCard from '../components/JobCard';
import SearchBar from '../components/SearchBar';
import { HomeSkeleton } from '../components/SkeletonLoader';
import { jobs } from '../data/jobs';
import { categories } from '../data/categories';

export default function Home() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="page">
        <HomeSkeleton />
        <BottomNav />
      </div>
    );
  }

  const displayCategories = categories.slice(0, 3);
  const latestJobs = jobs.slice(0, 5);

  return (
    <div className="page">
      <div className="page-content">
        {/* BBC News Inspired Polished Top App Header */}
        <AppHeader />

        {/* Advanced Modern Search Bar */}
        <div className="mb-lg" onClick={() => navigate('/search')} style={{ cursor: 'pointer' }}>
          <SearchBar
            value=""
            onChange={() => {}}
            placeholder="Search jobs..."
          />
        </div>

        {/* Stats Card */}
        <div className="stats-card mb-lg">
          <div className="stats-card-row">
            <div>
              <p className="stats-label">Total Active Circulars</p>
              <p className="stats-number">12,450+</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="stats-badge">This Week</span>
              <p style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginTop: '4px' }}>+320</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-lg">
          <div className="section-header">
            <h3 className="section-title">Categories</h3>
            <Link to="/categories" className="section-link">See All</Link>
          </div>
          <div className="category-grid">
            {displayCategories.map(cat => (
              <div
                key={cat.id}
                className="category-grid-item"
                onClick={() => navigate(`/search?category=${cat.id}`)}
              >
                <div className="category-grid-icon" style={{ background: cat.color }}>
                  {cat.icon}
                </div>
                <span className="category-grid-label">{cat.name}</span>
              </div>
            ))}
            <div
              className="category-grid-item"
              onClick={() => navigate('/categories')}
            >
              <div className="category-grid-icon" style={{ background: 'var(--bg-secondary)' }}>
                <LayoutGrid size={24} color="var(--text-secondary)" />
              </div>
              <span className="category-grid-label">More</span>
            </div>
          </div>
        </div>

        {/* Latest Jobs */}
        <div>
          <div className="section-header">
            <h3 className="section-title">Latest Job Circulars</h3>
            <Link to="/search" className="section-link">See All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {latestJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
