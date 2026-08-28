import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Search, Globe, Bell, User, X, Home, LayoutGrid, Bookmark, FileText, Settings, Moon, Sun, ChevronRight, Briefcase, Calendar, Rss } from './Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getQuestionsData } from '../data/questionsData';
import { getFilteredNotifications } from '../utils/notificationHelpers';

const AppHeader = React.memo(function AppHeader() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: adminState } = useAdminContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [questionsMenuOpen, setQuestionsMenuOpen] = useState(true); // Default open for better discoverability
  const [expandedCategory, setExpandedCategory] = useState(null);

  const notificationsList = getFilteredNotifications(adminState.notifications || [], state.installTime);
  const unreadCount = notificationsList.filter(n => !state.readNotifications.includes(n.id)).length;

  const handleOpenDrawer = () => {
    setIsClosing(false);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = (callback) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setIsClosing(false);
      if (typeof callback === 'function') {
        callback();
      }
    }, 300);
  };

  return (
    <>
      {/* Top Header Bar (BBC News Inspired Header Design) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        minHeight: 'calc(52px + var(--safe-area-top))',
        padding: 'calc(var(--safe-area-top) + 4px) 14px 6px 14px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        marginBottom: '10px',
        boxSizing: 'border-box'
      }}>
        {/* Left: Hamburger Menu Icon Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={handleOpenDrawer}
            aria-label="Open Menu"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
              border: '1.5px solid var(--border)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary-lightest)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center: Polished Brand Logo Badge */}
        <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
            color: 'white',
            padding: '3px 7px',
            borderRadius: '6px',
            fontWeight: 900,
            fontSize: '13px',
            letterSpacing: '0.8px',
            boxShadow: '0 4px 10px rgba(26, 86, 219, 0.25)'
          }}>
            LIVE
          </div>
          <span style={{
            fontWeight: 900,
            fontSize: '16px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            CIRCULAR
          </span>
        </Link>

        {/* Right: Action Buttons (Notifications Icon & User Profile Icon) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {/* Notifications Icon Button */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1a56db',
              background: 'rgba(26, 86, 219, 0.05)',
              border: 'none',
              position: 'relative'
            }}
          >
            <Bell size={20} className="bell-animated" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '9px',
                  fontWeight: '900',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)',
                  lineHeight: 1
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar Icon */}
          <div
            onClick={() => navigate('/profile')}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
              padding: '2px',
              boxShadow: '0 4px 12px rgba(26,86,219,0.2)',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            {state.user.avatar ? (
              <img
                src={state.user.avatar}
                alt={state.user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px'
              }}>
                {state.user.name ? state.user.name[0].toUpperCase() : 'U'}
              </div>
            )}

            {/* Active Status Dot */}
            <span style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '9px',
              height: '9px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid white'
            }}></span>
          </div>
        </div>
      </header>

      {/* Side Navigation Drawer Overlay */}
      {drawerOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          display: 'flex',
          animation: isClosing ? 'drawerOverlayFadeOut 0.3s ease forwards' : 'drawerOverlayFade 0.35s ease forwards'
        }} onClick={() => handleCloseDrawer()}>
          <div
            style={{
              width: '280px',
              maxWidth: '85vw',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '0 24px 24px 0',
              overflow: 'hidden',
              boxShadow: '10px 0 35px rgba(0,0,0,0.25)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'calc(var(--safe-area-top) + 20px) 16px 20px 16px',
              height: '100dvh',
              animation: isClosing ? 'drawerSlideOutLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'drawerSlideInLeft 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              willChange: 'transform, opacity'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header (Clickable User Profile) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div 
                onClick={() => {
                  handleCloseDrawer(() => navigate('/profile'));
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              >
                {state.user.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '17px'
                  }}>
                    {state.user.name ? state.user.name[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {state.user.name || (state.language === 'en' ? 'Set Your Name' : 'নাম সেট করুন')}
                  </h4>
                </div>
              </div>
              <button onClick={() => handleCloseDrawer()} style={{ padding: '6px', color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Drawer Menu Links */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              overscrollBehavior: 'contain'
            }}>
              <Link to="/home" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Home size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Home' : 'হোম'}</span>
              </Link>

              <Link to="/feed" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Rss size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Feed' : 'ফিড'}</span>
              </Link>

              <Link to="/all-circulars" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Briefcase size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'All Circulars' : 'সকল সার্কুলার'}</span>
              </Link>

              <Link to="/categories" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><LayoutGrid size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Categories' : 'ক্যাটাগরি'}</span>
              </Link>

              <Link to="/saved" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Bookmark size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Saved Jobs' : 'সংরক্ষিত সার্কুলার'}</span>
              </Link>

              {/* Collapsible Question Paper & Answer Section */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div 
                  onClick={() => setQuestionsMenuOpen(!questionsMenuOpen)}
                  className="menu-item" 
                  style={{ 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderBottom: questionsMenuOpen ? 'none' : '1px solid var(--border-light)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="menu-item-icon"><FileText size={20} /></div>
                    <span className="menu-item-label" style={{ fontWeight: 700 }}>
                      {state.language === 'en' ? 'Questions & Answers' : 'প্রশ্নপত্র এবং উত্তর'}
                    </span>
                  </div>
                </div>

                {questionsMenuOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                    {[
                      { id: 'bcs', label: 'বিসিএস', labelEn: 'BCS', icon: '🎓' },
                      { id: 'bank', label: 'ব্যাংক', labelEn: 'Bank', icon: '🏦' },
                      { id: 'ntrca', label: 'NTRCA', labelEn: 'NTRCA', icon: '📜' },
                      { id: 'primary', label: 'প্রাইমারি', labelEn: 'Primary', icon: '🏫' },
                      { id: 'ministry', label: 'বিভিন্ন মন্ত্রনালয়', labelEn: 'Ministries', icon: '🏛️' },
                      { id: 'recent', label: 'রিসেন্ট প্রশ্ন', labelEn: 'Recent Questions', icon: '⏱️' },
                      { id: 'subjectwise', label: 'বিষয়ভিত্তিক', labelEn: 'Subjectwise Questions', icon: '🗂️' }
                    ].map(cat => {
                      const isExpanded = expandedCategory === cat.id;
                      const papers = getQuestionsData().filter(p => p.category === cat.id);

                      return (
                        <div key={cat.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              borderRadius: '8px',
                              padding: '8px 10px 8px 16px',
                              cursor: 'pointer',
                              background: isExpanded ? 'var(--primary-bg)' : 'transparent'
                            }}
                            className="menu-item-sub"
                            onClick={() => {
                              handleCloseDrawer(() => navigate(`/questions/${cat.id}`));
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{cat.icon}</span>
                              <span>{state.language === 'en' ? cat.labelEn : cat.label}</span>
                            </span>

                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCategory(isExpanded ? null : cat.id);
                              }}
                              style={{
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                background: isExpanded ? 'rgba(26, 86, 219, 0.12)' : 'rgba(15, 23, 42, 0.05)',
                                color: isExpanded ? 'var(--primary)' : 'var(--text-muted)',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                transform: isExpanded ? 'rotate(90deg)' : 'none'
                              }}
                            >
                              <ChevronRight size={14} />
                            </div>
                          </div>

                          {isExpanded && (
                            <div style={{ 
                              display: 'flex', 
                              flexDirection: 'column', 
                              paddingLeft: '12px',
                              borderLeft: '1.5px solid var(--border-light)',
                              marginLeft: '26px',
                              gap: '6px',
                              marginTop: '6px',
                              marginBottom: '8px'
                            }}>
                              {papers.map(paper => {
                                const getYear = (dateStr) => {
                                  if (!dateStr) return '';
                                  const match = dateStr.match(/\d{4}/);
                                  return match ? match[0] : '';
                                };
                                const year = getYear(state.language === 'en' ? paper.dateEn : paper.date);
                                const rawTitle = state.language === 'en' ? paper.titleEn : paper.title;
                                
                                // Clean and shorten title professionally
                                const cleanTitle = rawTitle
                                  .replace(' Preliminary Question & Solution', '')
                                  .replace(' প্রিলিমিনারি প্রশ্ন ও সমাধান', '')
                                  .replace(' Question & Solution', '')
                                  .replace(' Solution', '')
                                  .replace(' সমাধান', '')
                                  .replace(' পরীক্ষা', '')
                                  .replace(' সহকারী শিক্ষক নিয়োগ', '');

                                return (
                                  <Link
                                    key={paper.id}
                                    to={`/question-details/${paper.id}`}
                                    onClick={() => handleCloseDrawer()}
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      color: 'var(--text-secondary)',
                                      textDecoration: 'none',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      background: 'var(--bg-secondary)',
                                      border: '1px solid var(--border-light)',
                                      transition: 'all 0.2s',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden'
                                    }}
                                    className="menu-sub-paper"
                                  >
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      color: 'var(--primary)',
                                      background: 'rgba(26, 86, 219, 0.08)',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      flexShrink: 0
                                    }}>
                                      {state.language === 'en' ? year : toBengaliNumber(year)}
                                    </span>
                                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {cleanTitle}
                                    </span>
                                  </Link>
                                );
                              })}
                              {papers.length === 0 && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '6px 8px' }}>
                                  {state.language === 'en' ? 'No papers yet' : 'কোনো প্রশ্নপত্র নেই'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Live Exam link */}
                    <Link
                      to="/live-exams"
                      onClick={() => handleCloseDrawer()}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderRadius: '8px',
                        padding: '8px 10px 8px 16px',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                      className="menu-item-sub"
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔴</span>
                        <span>Live MCQ Exam</span>
                      </span>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/admit-card" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Calendar size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Admit Card & Result' : 'প্রবেশপত্র ও ফলাফল'}</span>
              </Link>

              <Link to="/notifications" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Bell size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Notifications' : 'বিজ্ঞপ্তি'}</span>
              </Link>

              <Link to="/settings" onClick={() => handleCloseDrawer()} className="menu-item" style={{ borderRadius: '10px' }}>
                <div className="menu-item-icon"><Settings size={20} /></div>
                <span className="menu-item-label">{state.language === 'en' ? 'Settings' : 'সেটিংস'}</span>
              </Link>
            </div>

            {/* Dark Mode Quick Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              marginTop: 'auto'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {state.language === 'en' ? 'Dark Mode' : 'ডার্ক মোড'}
              </span>
              <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })} style={{ color: 'var(--primary)', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                {state.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

const toBengaliNumber = (num) => {
  if (num === undefined || num === null) return '';
  const engNum = String(num);
  const bengaliDigits = {'0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'};
  return engNum.split('').map(digit => bengaliDigits[digit] || digit).join('');
};

export default AppHeader;
