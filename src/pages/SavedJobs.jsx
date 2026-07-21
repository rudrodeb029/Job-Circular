import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bookmark, Globe, Search } from '../components/Icons';
import JobCard from '../components/JobCard';
import TabBar from '../components/TabBar';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { jobs } from '../data/jobs';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'applied', label: 'Applied' },
  { id: 'exam_date', label: 'Exam Date' }
];

export default function SavedJobs() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load jobs from localStorage if present (to reflect admin updates), fallback to static jobs data
  const localJobs = JSON.parse(localStorage.getItem('admin_jobs')) || jobs;

  const savedJobList = localJobs.filter(j => state.savedJobs.includes(j.id));

  const filteredJobs = savedJobList.filter(job => {
    const isApplied = state.appliedJobs.includes(job.id);
    const matchesTab = activeTab === 'applied' ? isApplied :
                       activeTab === 'exam_date' ? isApplied : true;
    
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    return (
      (job.title && job.title.toLowerCase().includes(q)) ||
      (job.titleEn && job.titleEn.toLowerCase().includes(q)) ||
      (job.organization && job.organization.toLowerCase().includes(q)) ||
      (job.organizationEn && job.organizationEn.toLowerCase().includes(q)) ||
      (job.location && job.location.toLowerCase().includes(q)) ||
      (job.type && job.type.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Saved Jobs</h1>
      </div>

      <div className="page-content">
        {/* Search Bar for Saved Jobs */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in saved jobs..."
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Job List or Empty State */}
        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredJobs.map(job => {
              if (activeTab === 'exam_date') {
                return (
                  <div 
                    key={job.id} 
                    className="card animate-fade-in" 
                    style={{ 
                      padding: 'var(--space-md)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    {/* Job Header */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 800
                      }}>
                        {job.organization ? job.organization[0] : 'J'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {job.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          {job.organization}
                        </p>
                      </div>
                    </div>

                    {/* Exam details section */}
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      {job.examDate ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            📅 Exam Date: {job.examDate}
                          </span>
                          {(job.examLink || job.applyLink) && (
                            <a 
                              href={job.examLink || job.applyLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ 
                                fontSize: '11px', 
                                color: '#ffffff', 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                boxShadow: '0 3px 10px rgba(26, 86, 219, 0.3)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Globe size={13} color="#ffffff" />
                              <span>Visit Website</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 700, 
                            color: '#d97706', 
                            background: '#fef3c7', 
                            padding: '4px 10px', 
                            borderRadius: '20px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            ⏳ Exam Date: Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return <JobCard key={job.id} job={job} />;
            })}
          </div>
        ) : (
          <EmptyState
            icon={searchQuery ? Search : Bookmark}
            title={
              searchQuery 
                ? "No Matching Jobs Found" 
                : activeTab === 'exam_date' 
                  ? "No Exam Dates Available" 
                  : "No Saved Jobs"
            }
            description={searchQuery ? `No saved jobs match "${searchQuery}"` : undefined}
            actionText={searchQuery ? "Clear Search" : "Explore Jobs"}
            onAction={searchQuery ? () => setSearchQuery('') : () => navigate('/search')}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
