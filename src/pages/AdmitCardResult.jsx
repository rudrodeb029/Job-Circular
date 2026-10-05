import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText } from '../components/Icons';
import TabBar, { TabContent } from '../components/TabBar';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { formatTimeAgo } from '../utils/timeUtils';
import { stripHtmlTags } from '../utils/textUtils';
import { getJobIconAndStyle } from '../utils/jobIconUtils';

export default function AdmitCardResult() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';
  const [activeTab, setActiveTab] = useState('admit_card');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = useMemo(() => [
    { id: 'admit_card', label: isEn ? 'Exam Date' : 'পরীক্ষার তারিখ' },
    { id: 'result', label: isEn ? 'Result' : 'ফলাফল' }
  ], [isEn]);

  const { state: adminState } = useAdminContext();
  const allAdmitCards = useMemo(() => {
    const localAdmits = adminState.admits || [];

    const getItemTimestamp = (item) => {
      if (item.createdAt) {
        const ms = new Date(item.createdAt).getTime();
        if (!isNaN(ms)) return ms;
      }
      if (item.id) {
        const matches = String(item.id).match(/\d{10,13}/);
        if (matches) return parseInt(matches[0], 10);
      }
      return 0;
    };

    const unique = [];
    const seen = new Set();

    // Sort first so newest unique items are kept
    const sorted = [...localAdmits].sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));

    for (const item of sorted) {
      // Robust key based on job ID (fallback to document ID) and type
      const baseId = item.jobId || String(item.id).replace('admit-', '').replace('result-', '').replace('dynamic-exam-', '').replace('dynamic-result-', '');
      const key = `${baseId}_${item.type}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ ...item, jobId: baseId }); // Ensure jobId is present
      }
    }

    return unique;
  }, [adminState.admits]);

  const searchedItems = useMemo(() => {
    const items = allAdmitCards.filter(item => item.type === activeTab);
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(item => {
      const org = (item.organization || '').toLowerCase();
      const orgEn = (item.organizationEn || '').toLowerCase();
      const exam = (item.examName || '').toLowerCase();
      const examEn = (item.examNameEn || '').toLowerCase();
      return org.includes(query) || orgEn.includes(query) || exam.includes(query) || examEn.includes(query);
    });
  }, [allAdmitCards, activeTab, searchQuery]);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>{isEn ? 'Admit Card & Result' : 'প্রবেশপত্র ও ফলাফল'}</span>
        </h1>
      </div>

      <div className="page-content">
        {/* Modern Search Bar */}
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'admit_card'
                ? (isEn ? 'Search exam dates...' : 'পরীক্ষার তারিখ খুঁজুন...')
                : (isEn ? 'Search results...' : 'ফলাফল খুঁজুন...')
            }
          />
        </div>

        {/* Tab Switcher */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <TabBar 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={(tab) => { 
              setActiveTab(tab); 
              setSearchQuery(''); 
            }} 
          />
        </div>

        <TabContent activeTab={activeTab} tabs={tabs}>
          {searchedItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {searchedItems.map(item => {
              const { icon: displayIcon } = getJobIconAndStyle(item);
              const orgName = stripHtmlTags(isEn ? (item.organizationEn || item.organization) : item.organization);
              const examName = stripHtmlTags(isEn ? (item.examNameEn || item.examName) : item.examName);
              const itemDate = isEn ? (item.dateEn || item.date) : item.date;

              if (activeTab === 'admit_card') {
                const descriptionSentence = isEn
                  ? `Exam notice published for: ${examName}`
                  : `${examName}।`;

                return (
                  <div 
                    key={item.id} 
                    className="job-card animate-fade-in" 
                    onClick={() => navigate(`/exam-details/${item.id}`)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      border: '1px solid rgba(16, 185, 129, 0.12)',
                      boxShadow: '0 4px 18px rgba(16, 185, 129, 0.04)'
                    }}
                  >
                    {/* Professional Accent Border */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '4px',
                      background: 'linear-gradient(to bottom, #10b981, #34d399)',
                      borderRadius: '4px 0 0 4px'
                    }}></div>

                    <div className="job-card-content">
                      <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="job-card-title-icon job-card-title-icon-exam" style={{ fontSize: '15px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', color: '#059669', '--card-icon-color': '#059669', '--card-icon-color-dark': '#34d399' }}>{displayIcon}</span>
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
                          color: 'var(--chip-success-color, #059669)',
                          background: 'var(--chip-success-bg, #d1fae5)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}>
                          <span>📅 {isEn ? 'Exam Date Published' : 'পরীক্ষার তারিখ প্রকাশিত'}</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          • 🕒 {formatTimeAgo(item.createdAt, isEn)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/exam-details/${item.id}`);
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

              // Active tab is Result
              const descriptionSentence = isEn
                ? `Written/Viva exam result published for: ${examName}. View result now!`
                : `${examName} পদের পরীক্ষার ফলাফল প্রকাশিত হয়েছে। এখনই ফলাফল দেখুন!`;

              return (
                <div 
                  key={item.id} 
                  className="job-card animate-fade-in" 
                  onClick={() => navigate(`/result-details/${item.id}`)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(124, 58, 237, 0.12)',
                    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.04)'
                  }}
                >
                  {/* Professional Accent Border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '4px',
                    background: 'linear-gradient(to bottom, #7c3aed, #a78bfa)',
                    borderRadius: '4px 0 0 4px'
                  }}></div>

                  <div className="job-card-content">
                    <h4 className="job-card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="job-card-title-icon job-card-title-icon-result" style={{ fontSize: '15px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', color: '#7c3aed', '--card-icon-color': '#7c3aed', '--card-icon-color-dark': '#c084fc' }}>{displayIcon}</span>
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
                        color: 'var(--chip-purple-color, #7e22ce)',
                        background: 'var(--chip-purple-bg, #f3e8ff)',
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
                        • 🕒 {formatTimeAgo(item.createdAt, isEn)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/result-details/${item.id}`);
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
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
          />
        )}
        </TabContent>
      </div>
    </div>
  );
}
