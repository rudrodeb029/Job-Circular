import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdminContext } from '../context/AdminContext';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import JobCard from '../components/JobCard';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import { Search } from '../components/Icons';
import { jobs } from '../data/jobs';
import { categories } from '../data/categories';
import { useAppContext } from '../context/AppContext';

export default function SearchFilter() {
  const { state } = useAppContext();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialCategory || 'all');

  const typeTabs = useMemo(() => {
    const isEn = state.language === 'en';
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
  }, [state.language]);
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    qualification: '',
    location: '',
    deadline: '',
    jobType: '',
    category: initialCategory
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleReset = () => {
    setFilters({
      qualification: '',
      location: '',
      deadline: '',
      jobType: '',
      category: ''
    });
    setQuery('');
    setActiveTab('all');
  };

  const { state: adminState } = useAdminContext();
  const localJobs = adminState.jobs;

  const filteredJobs = useMemo(() => {
    return localJobs.filter(job => {
      // Query filter
      if (query) {
        const q = query.toLowerCase();
        const titleMatch = (job.title || '').toLowerCase().includes(q) || (job.titleEn || '').toLowerCase().includes(q);
        const orgMatch = (job.organization || '').toLowerCase().includes(q) || (job.organizationEn || '').toLowerCase().includes(q);
        if (!titleMatch && !orgMatch) return false;
      }

      // Category filter from URL & Tabs
      const jobCategory = job.categoryId || job.category;

      if (filters.category && jobCategory !== filters.category) return false;

      // Type tabs filter
      if (activeTab !== 'all' && jobCategory !== activeTab) return false;

      // Filter panel options
      // 1. Qualification filter
      if (filters.qualification) {
        const reqStr = Array.isArray(job.requirements) ? job.requirements.join(' ') : (job.requirements || '');
        const matchQual = (job.qualification && job.qualification.includes(filters.qualification)) ||
                          (job.education && job.education.includes(filters.qualification)) ||
                          reqStr.includes(filters.qualification);
        if (!matchQual) return false;
      }

      // 2. Location filter
      if (filters.location) {
        const matchLoc = (job.location && job.location.includes(filters.location)) ||
                         (job.description && job.description.includes(filters.location));
        if (!matchLoc) return false;
      }

      // 3. Job Type filter
      if (filters.jobType) {
        const matchType = job.type === filters.jobType ||
                          job.jobType === filters.jobType ||
                          job.category === filters.jobType;
        if (!matchType) return false;
      }

      // 4. Deadline filter
      if (filters.deadline && job.deadline) {
        const deadlineDate = new Date(job.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          const now = new Date();
          const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
          if (filters.deadline === 'today' && diffDays > 1) return false;
          if (filters.deadline === '3days' && diffDays > 3) return false;
          if (filters.deadline === 'week' && diffDays > 7) return false;
          if (filters.deadline === 'month' && diffDays > 30) return false;
        }
      }

      return true;
    });
  }, [query, activeTab, filters, localJobs]);

  return (
    <div className="page">
      <div className="page-header" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs..."
          showFilter={true}
          onFilterClick={() => setShowFilter(!showFilter)}
        />

        {/* Horizontal Type Filter Tabs */}
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
        {showFilter && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            resultCount={filteredJobs.length}
            onShowResults={() => setShowFilter(false)}
            onClose={() => setShowFilter(false)}
            jobs={localJobs}
          />
        )}

        <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          Showing {filteredJobs.length} results
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
            title="No Jobs Found"
            description="Try adjusting your search query or filter options."
            actionText="Reset Filters"
            onAction={handleReset}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
