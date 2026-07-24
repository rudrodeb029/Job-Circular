import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Calendar, Download, FileText } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { jobs } from '../data/jobs';
import { admitCardsAndResults } from '../data/notifications';
import JobCard from '../components/JobCard';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';

const orgIconsMap = {
  'শিক্ষা মন্ত্রণালয়': '🏛️',
  'সোনালী ব্যাংক লিমিটেড': '🏦',
  'বাংলাদেশ পুলিশ': '👮',
  'ব্র্যাক': '🤝',
  'গ্রামীণফোন': '📱',
  'বাংলাদেশ সেনাবাহিনী': '🛡️',
  'ইসলামী ব্যাংক': '🕌',
  'বাংলাদেশ রেলওয়ে': '🚂',
  'ডাক ও টেলিযোগাযোগ মন্ত্রণালয়': '📡',
  'স্বাস্থ্য অধিদপ্তর': '🏥',
  'বাংলাদেশ ব্যাংক': '🏛️',
  'ভিকারুননিসা নূন স্কুল এন্ড কলেজ': '🎓',
  'এলজিইডি': '🏗️',
  'বিকাশ লিমিটেড': '💸',
  'আশা': '🌱',
  'জনতা ব্যাংক': '🏦',
  'স্কয়ার হাসপাতাল': '🩺',
  'পাঠাও': '🚀',
  'রাজউক উত্তরা মডেল কলেজ': '🏫',
  'রূপালী ব্যাংক': '🏦',
  'আকিক গ্রুপ': '🏭',
  'ওয়াটারএইড বাংলাদেশ': '💧',
  'টেন মিনিট স্কুল': '✍️',
  'প্রাথমিক শিক্ষা অধিদপ্তর': '🏫',
  'ইসলামী ব্যাংক বাংলাদেশ': '🕌',
  'প্রাথমিক ও গণশিক্ষা মন্ত্রণালয়': '🏫'
};

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

  // Combine all circulars, exam dates, and results
  const { state: adminState } = useAdminContext();
  const allFeedItems = useMemo(() => {
    const localJobs = adminState.jobs;

    const jobItems = localJobs.map(job => ({
      ...job,
      feedType: 'job'
    }));

    // Exam Date jobs from localJobs
    const examJobs = localJobs.filter(job => job.examDate).map(job => ({
      id: `exam_${job.id}`,
      originalId: job.id,
      organization: job.organization,
      organizationEn: job.organizationEn,
      postTitle: job.title,
      postTitleEn: job.titleEn,
      examDate: job.examDate,
      examDateEn: job.examDateEn || job.examDate,
      downloadLink: job.downloadLink || 'https://example.com/admit.pdf',
      category: job.category,
      postedDate: job.postedDate || job.examDate || '১ দিন আগে',
      postedDateEn: job.postedDateEn || job.examDateEn || job.examDate || '1 day ago',
      feedType: 'exam_date'
    }));

    // Result jobs from localJobs
    const resultJobs = localJobs.filter(job => job.examResult).map(job => ({
      id: `result_${job.id}`,
      originalId: job.id,
      organization: job.organization,
      organizationEn: job.organizationEn,
      postTitle: job.title,
      postTitleEn: job.titleEn,
      examResult: job.examResult,
      category: job.category,
      postedDate: job.postedDate || '১ দিন আগে',
      postedDateEn: job.postedDateEn || '1 day ago',
      feedType: 'result'
    }));

    // Notifications admit card items
    const notifExamItems = admitCardsAndResults.filter(item => item.type === 'admit_card').map(item => ({
      id: item.id,
      originalId: item.id.replace('admit-', 'job-'),
      organization: item.organization,
      organizationEn: item.organizationEn,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examDate: item.date,
      examDateEn: item.dateEn,
      downloadLink: item.downloadLink,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'exam_date'
    }));

    // Notifications result items
    const notifResultItems = admitCardsAndResults.filter(item => item.type === 'result').map(item => ({
      id: item.id,
      originalId: item.id.replace('result-', 'job-'),
      organization: item.organization,
      organizationEn: item.organizationEn,
      postTitle: item.examName,
      postTitleEn: item.examNameEn,
      examResult: item.downloadLink,
      postedDate: item.date || '১ দিন আগে',
      postedDateEn: item.dateEn || item.date || '1 day ago',
      feedType: 'result'
    }));

    return [...jobItems, ...examJobs, ...resultJobs, ...notifExamItems, ...notifResultItems];
  }, []);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    setCurrentPage(1); // Reset page to 1 when search query changes
    if (!searchQuery.trim()) return allFeedItems;
    
    return allFeedItems.filter(item => {
      const title = (item.title || item.postTitle || '').toLowerCase();
      const titleEn = (item.titleEn || item.postTitleEn || '').toLowerCase();
      const org = (item.organization || '').toLowerCase();
      const orgEn = (item.organizationEn || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      return title.includes(query) || titleEn.includes(query) || org.includes(query) || orgEn.includes(query);
    });
  }, [allFeedItems, searchQuery]);

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
        <h1 style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'All Circulars' : 'সব সার্কুলার'}</span>
        </h1>
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
            paginatedJobs.map(item => {
              if (item.feedType === 'job') {
                return <JobCard key={item.id} job={item} />;
              }

              const displayIcon = item.icon || orgIconsMap[item.organization] || '🏛️';
              const orgName = isEn ? (item.organizationEn || item.organization) : item.organization;
              const postTitle = isEn ? (item.postTitleEn || item.postTitle) : item.postTitle;

              if (item.feedType === 'exam_date') {
                const descriptionSentence = isEn
                  ? `Exam date published for the post of ${postTitle}.`
                  : `${postTitle} পদের পরীক্ষার তারিখ প্রকাশিত হয়েছে।`;

                return (
                  <div 
                    key={item.id} 
                    className="job-card animate-fade-in" 
                    onClick={() => navigate(`/exam-details/${item.originalId || item.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="job-card-content">
                      <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>{displayIcon}</span>
                        <span>{orgName}</span>
                      </h4>
                      <p className="job-card-org" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'normal',
                        lineHeight: '1.4',
                        marginBottom: '4px',
                        fontWeight: 400
                      }}>
                        {descriptionSentence}
                      </p>
                      <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '8.5px',
                          color: '#059669',
                          background: '#d1fae5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          <Calendar size={10} />
                          <span>{isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          • 🕒 {isEn ? (item.postedDateEn || item.postedDate || item.examDateEn || item.examDate || '1 day ago') : (item.postedDate || item.examDate || '১ দিন আগে')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exam-details/${item.originalId || item.id}`);
                        }}
                        title="View Exam Details"
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <Download size={14} color="#ffffff" />
                      </div>
                    </div>
                  </div>
                );
              }

              // feedType === 'result'
              const descriptionSentence = isEn
                ? `Written/Viva exam result published for the post of ${postTitle}. View result now!`
                : `${postTitle} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;

              return (
                <div 
                  key={item.id} 
                  className="job-card animate-fade-in" 
                  onClick={() => navigate(`/result-details/${item.originalId || item.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="job-card-content">
                    <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', flexShrink: 0 }}>{displayIcon}</span>
                      <span>{orgName}</span>
                    </h4>
                    <p className="job-card-org" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      lineHeight: '1.4',
                      marginBottom: '4px',
                      fontWeight: 400
                    }}>
                      {descriptionSentence}
                    </p>
                    <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', overflow: 'hidden' }}>
                      <span style={{
                        fontSize: '8.5px',
                        color: '#7e22ce',
                        background: '#f3e8ff',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        whiteSpace: 'nowrap'
                      }}>
                        🏆 <span>{isEn ? 'Result Published' : 'ফলাফল প্রকাশিত'}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        • 🕒 {isEn ? (item.postedDateEn || item.postedDate || item.examDateEn || item.examDate || '1 day ago') : (item.postedDate || item.examDate || '১ দিন আগে')}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/result-details/${item.originalId || item.id}`);
                      }}
                      title="View Result Details"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <FileText size={14} color="#ffffff" />
                    </div>
                  </div>
                </div>
              );
            })
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
