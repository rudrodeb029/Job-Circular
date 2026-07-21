import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Bookmark } from '../components/Icons';
import JobCard from '../components/JobCard';
import TabBar from '../components/TabBar';
import EmptyState from '../components/EmptyState';
import BottomNav from '../components/BottomNav';
import { jobs } from '../data/jobs';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'applied', label: 'Applied' },
  { id: 'not_applied', label: 'Not Applied' }
];

export default function SavedJobs() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [activeTab, setActiveTab] = useState('all');

  const savedJobList = jobs.filter(j => state.savedJobs.includes(j.id));

  const filteredJobs = savedJobList.filter(job => {
    if (activeTab === 'applied') return state.appliedJobs.includes(job.id);
    if (activeTab === 'not_applied') return !state.appliedJobs.includes(job.id);
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Saved Jobs</h1>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {filteredJobs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No Saved Jobs"
            actionText="Explore Jobs"
            onAction={() => navigate('/search')}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}
