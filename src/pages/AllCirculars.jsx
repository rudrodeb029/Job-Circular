import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Briefcase } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { jobs } from '../data/jobs';
import JobCard from '../components/JobCard';
import BottomNav from '../components/BottomNav';

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
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: 'var(--space-md)'
        }}>
          <input
            type="text"
            placeholder={isEn ? "Search circulars..." : "সার্কুলার খুঁজুন..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-light)',
              background: 'var(--white)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
          />
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }} />
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-light)',
                background: currentPage === 1 ? 'var(--bg-secondary)' : 'var(--white)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.6 : 1,
                boxShadow: currentPage === 1 ? 'none' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ‹ {isEn ? 'Previous' : 'পূর্ববর্তী'}
            </button>

            <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {isEn 
                ? `Page ${currentPage} of ${totalPages}` 
                : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages)}`}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-light)',
                background: currentPage === totalPages ? 'var(--bg-secondary)' : 'var(--white)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.6 : 1,
                boxShadow: currentPage === totalPages ? 'none' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {isEn ? 'Next' : 'পরবর্তী'} ›
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
