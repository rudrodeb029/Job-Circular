import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { jobs } from '../data/jobs';
import JobCard from '../components/JobCard';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';

export default function AllCirculars() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 20;

  const toBengaliNumber = (num) => {
    const englishToBengali = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return String(num).split('').map(char => englishToBengali[char] || char).join('');
  };

  // Load all jobs
  const allJobs = useMemo(() => {
    return JSON.parse(localStorage.getItem('admin_jobs')) || jobs;
  }, []);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    setCurrentPage(1); // Reset page to 1 when search query changes
    if (!searchQuery.trim()) return allJobs;
    
    return allJobs.filter(job => {
      const title = (job.title || '').toLowerCase();
      const titleEn = (job.titleEn || '').toLowerCase();
      const org = (job.organization || '').toLowerCase();
      const orgEn = (job.organizationEn || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      return title.includes(query) || titleEn.includes(query) || org.includes(query) || orgEn.includes(query);
    });
  }, [allJobs, searchQuery]);

  // Paginate filtered jobs
  const paginatedJobs = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return filteredJobs.slice(indexOfFirstPost, indexOfLastPost);
  }, [filteredJobs, currentPage]);

  const totalPages = Math.ceil(filteredJobs.length / postsPerPage);

  return (
    <div className="page" style={{ paddingBottom: '100px' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1 }}>{isEn ? 'All Circulars' : 'সব সার্কুলার'}</h1>
      </div>

      <div className="page-content animate-fade-in">
        {/* Polished Modern Search Bar */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? "Search circulars..." : "সার্কুলার খুঁজুন..."}
          />
        </div>

        {/* Jobs List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Briefcase size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600 }}>
                {isEn ? 'No circulars found' : 'কোনো সার্কুলার পাওয়া যায়নি'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            marginBottom: '10px',
            padding: '12px 0',
            borderTop: '1px solid var(--border-light)'
          }}>
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(prev - 1, 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: currentPage === 1 ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                color: currentPage === 1 ? '#94a3b8' : '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ◀ {isEn ? 'Previous' : 'পূর্ববর্তী'}
            </button>

            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {isEn 
                ? `Page ${currentPage} of ${totalPages}` 
                : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(prev + 1, totalPages));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                background: currentPage === totalPages ? '#f1f5f9' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                color: currentPage === totalPages ? '#94a3b8' : '#ffffff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isEn ? 'Next' : 'পরবর্তী'} ▶
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
