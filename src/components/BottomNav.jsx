import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Bookmark, Bell, User } from './Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { getFilteredNotifications } from '../utils/notificationHelpers';

const BottomNav = () => {
  const { state } = useAppContext();
  const { state: adminState } = useAdminContext();
  const location = useLocation();

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const threshold = 8; // minimum px scroll before toggling

  // Reset to visible whenever the page/route changes
  useEffect(() => {
    setIsVisible(true);
    lastScrollY.current = window.scrollY || document.documentElement.scrollTop || 0;
  }, [location.pathname]);

  // Handle scroll to hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
          const diff = currentScrollY - lastScrollY.current;

          // Always show when near the top of the page
          if (currentScrollY <= 25) {
            setIsVisible(true);
          } else if (Math.abs(diff) >= threshold) {
            if (diff > 0 && currentScrollY > 45) {
              // Scrolling down -> hide navbar
              setIsVisible(false);
            } else if (diff < 0) {
              // Scrolling up -> show navbar
              setIsVisible(true);
            }
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const notificationsList = getFilteredNotifications(adminState.notifications || [], state.installTime);
  const unreadCount = notificationsList.filter(n => !state.readNotifications.includes(n.id)).length;

  return (
    <nav className={`bottom-nav ${isVisible ? 'nav-visible' : 'nav-hidden'}`}>
      <div className="bottom-nav-background">
        <svg width="100%" height="60" viewBox="0 0 100 60" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
          <path
            d="M 0,10 L 36,10 C 42,10 42,48 50,48 C 58,48 58,10 64,10 L 100,10 L 100,60 L 0,60 Z"
            fill="var(--white)"
          />
        </svg>
      </div>

      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={24} />
      </NavLink>

      <NavLink to="/categories" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={24} />
      </NavLink>

      {/* Raised Middle Button (Saved Circulars) sits exactly in the cutout */}
      <div className="bottom-nav-middle-wrapper">
        <NavLink to="/saved" className={({ isActive }) => `bottom-nav-middle-item ${isActive ? 'active' : ''}`}>
          <div className="middle-icon-circle">
            <Bookmark size={26} />
          </div>
        </NavLink>
      </div>

      <NavLink to="/notifications" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bell size={24} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                borderRadius: '50%',
                fontSize: '7.5px',
                fontWeight: '800',
                width: '12px',
                height: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--white)',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                lineHeight: 1
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={24} />
      </NavLink>
    </nav>
  );
};

export default React.memo(BottomNav);
