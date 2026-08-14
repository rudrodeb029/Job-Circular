import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: adminState } = useAdminContext() || { state: {} };
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const notifications = adminState.notifications || [];
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/jobs')) return 'Manage Circulars';
    if (path.includes('/admin/ai-manager')) return 'AI Manager';
    if (path.includes('/admin/live-exams')) return 'Manage Live Exams';
    if (path.includes('/admin/questions')) return 'Manage Questions';
    if (path.includes('/admin/notifications')) return 'Notifications';
    if (path.includes('/admin/stats')) return 'Statistics';
    if (path.includes('/admin/reports')) return 'Reports';
    if (path.includes('/admin/settings')) return 'Settings';
    return 'Admin Panel';
  };

  const navItems = [
    {
      section: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/admin', exact: true, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
          </svg>
        )},
        { name: 'Manage Circulars', path: '/admin/jobs', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        )},
        { name: 'AI Manager', path: '/admin/ai-manager', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
            <path d="M12 6a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z"></path>
          </svg>
        )},
        { name: 'Manage Live Exams', path: '/admin/live-exams', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <circle cx="12" cy="14" r="2"></circle>
          </svg>
        )},
        { name: 'Manage Questions', path: '/admin/questions', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        )},
        { name: 'Notifications', path: '/admin/notifications', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        )}
      ]
    },
    {
      section: 'ANALYTICS',
      items: [
        { name: 'Statistics', path: '/admin/stats', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        )},
        { name: 'Reports', path: '/admin/reports', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        )}
      ]
    },
    {
      section: 'SETTINGS',
      items: [
        { name: 'Settings', path: '/admin/settings', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        )},
        { name: 'Back to App', path: '/home', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        )}
      ]
    }
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style>{`
        .sidebar-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .sidebar-link:hover {
          background-color: #f1f5f9 !important;
          transform: translateX(4px);
        }
        .sidebar-link.active {
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }
        .sidebar-link.active::before {
          content: '';
          position: absolute;
          left: -16px;
          top: 10%;
          bottom: 10%;
          width: 4px;
          background: #2563eb;
          border-radius: 0 4px 4px 0;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .admin-sidebar {
          transition: transform 0.3s ease;
        }
        @media (max-width: 1024px) {
           .admin-sidebar {
              position: fixed;
              z-index: 1000;
              transform: translateX(-100%);
           }
           .admin-sidebar.open {
              transform: translateX(0);
           }
        }
      `}</style>

      {/* Overlay for mobile */}
      {drawerOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 999, backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside className={`admin-sidebar ${drawerOpen ? 'open' : ''}`} style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', height: '100vh', sticky: 'top' }}>
        <div className="sidebar-logo" style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Job Circular</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Control</p>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 16px 32px 16px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', letterSpacing: '0.1em', paddingLeft: '12px' }}>
                {group.section}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.items.map((item, itemIdx) => {
                  const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                  return (
                    <div
                      key={itemIdx}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        navigate(item.path);
                        setDrawerOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        color: isActive ? '#1a56db' : '#64748b',
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        fontWeight: isActive ? '700' : '500',
                      }}
                    >
                      <span style={{ color: isActive ? '#2563eb' : '#94a3b8' }}>{item.icon}</span>
                      <span style={{ fontSize: '14.5px' }}>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="admin-topbar" style={{ minHeight: '80px', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'calc(var(--safe-area-top) + 8px) 32px 12px 32px', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
               onClick={() => setDrawerOpen(true)}
               style={{ display: 'none', background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '8px', color: '#64748b' }}
               className="mobile-toggle"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="breadcrumb" style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
              {getPageTitle()}
            </div>
          </div>
          
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              className="notification-bell"
              style={{ position: 'relative', cursor: 'pointer', color: '#64748b', padding: '10px', background: '#f8fafc', borderRadius: '12px', transition: 'all 0.2s' }}
              onClick={() => navigate('/admin/notifications')}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadNotifications > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', fontSize: '9px', fontWeight: '900', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ffffff', boxShadow: '0 4px 8px rgba(239, 68, 68, 0.2)' }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>

            <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 12px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '16px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.15)' }}>
                A
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>Admin</span>
                  <span style={{ fontSize: '10px', fontWeight: '600', color: '#94a3b8' }}>Super User</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
