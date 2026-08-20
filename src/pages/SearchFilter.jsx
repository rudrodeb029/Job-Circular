import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminContext } from '../context/AdminContext';
import SearchBar from '../components/SearchBar';
import JobCard from '../components/JobCard';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import { Search } from '../components/Icons';
import { categories } from '../data/categories';
import { useAppContext } from '../context/AppContext';

export default function SearchFilter() {
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialCategory || 'all');

  const typeTabs = useMemo(() => {
    const list = [
      { id: 'all', label: isEn ? 'All' : 'সব' }
    ];
    categories.forEach(cat => {
      let label = isEn ? (cat.nameEn || '') : cat.name;
      if (isEn && label.endsWith(' Jobs')) {
        label = label.replace(' Jobs', '');
      }
      list.push({ id: cat.id, label });
    });
    return list;
  }, [isEn]);

  const handleReset = () => {
    setQuery('');
    setActiveTab('all');
  };

  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs;

  const filteredJobs = useMemo(() => {
    return localJobs.filter(job => {
      // Search Query filter
      if (query) {
        const q = query.toLowerCase();
        const titleMatch = (job.title || '').toLowerCase().includes(q) || (job.titleEn || '').toLowerCase().includes(q);
        const orgMatch = (job.organization || '').toLowerCase().includes(q) || (job.organizationEn || '').toLowerCase().includes(q);
        if (!titleMatch && !orgMatch) return false;
      }

      // Category Tabs filter
      const jobCategory = job.categoryId || job.category;
      if (activeTab !== 'all' && jobCategory !== activeTab) return false;

      return true;
    });
  }, [query, activeTab, localJobs]);

  return (
    <div className="page">
      <div className="page-header" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isEn ? "Search jobs..." : "চাকরি খুঁজুন..."}
          showFilter={false}
        />

        {/* Horizontal Category Tabs */}
        <div className="filter-tabs" style={{ width: '100%' }}>
          {typeTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="page-content animate-fade-in">
        <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {isEn ? `Showing ${filteredJobs.length} results` : `${filteredJobs.length}টি ফলাফল দেখানো হচ্ছে`}
        </div>

        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            actionText={isEn ? "Clear Search" : "সার্চ ক্লিয়ার করুন"}
            onAction={handleReset}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
