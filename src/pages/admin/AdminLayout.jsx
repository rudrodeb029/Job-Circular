import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminContext } from '../../context/AdminContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminContext = useAdminContext() || {};
  
  const notifications = adminContext.notifications || [];
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('/admin/jobs')) return 'Manage Circulars';
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
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        )},
        { name: 'Manage Circulars', path: '/admin/jobs', exact: false, icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
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
            <polyline points="10 9 9 9 8 9"></polyline>
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
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f4ff' }}>
      <aside className="admin-sidebar" style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div className="sidebar-logo" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Job Circular</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav" style={{ padding: '24px 16px', flex: 1, overflowY: 'auto' }}>
          {navItems.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px', letterSpacing: '0.05em', paddingLeft: '8px' }}>
                {group.section}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {group.items.map((item, itemIdx) => {
                  const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
                  return (
                    <div
                      key={itemIdx}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      onClick={() => navigate(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: isActive ? '#2563eb' : '#94a3b8',
                        backgroundColor: isActive ? '#eff6ff' : 'transparent',
                        fontWeight: isActive ? '600' : '400',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {item.icon}
                      <span style={{ fontSize: '14px' }}>{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="admin-topbar" style={{ height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div className="breadcrumb" style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
            {getPageTitle()}
          </div>
          
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div className="notification-bell" style={{ position: 'relative', cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/admin/notifications')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadNotifications > 0 && (
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </div>

            <div className="admin-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', paddingLeft: '24px', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                A
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>Admin</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content" style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
