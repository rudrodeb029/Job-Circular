import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Calendar, Bell, User } from './Icons';
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
      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>{state.language === 'en' ? 'Home' : 'হোম'}</span>
      </NavLink>

      <NavLink to="/categories" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={22} />
        <span>{state.language === 'en' ? 'Category' : 'ক্যাটাগরি'}</span>
      </NavLink>

      {/* Raised Middle Button (Routine/Exams) */}
      <div className="bottom-nav-middle-wrapper">
        <NavLink to="/live-exams" className={({ isActive }) => `bottom-nav-middle-item ${isActive ? 'active' : ''}`}>
          <div className="middle-icon-circle">
            <Calendar size={24} />
          </div>
          <span className="middle-label">{state.language === 'en' ? 'Routine' : 'রুটিন'}</span>
        </NavLink>
      </div>

      <NavLink to="/notifications" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Bell size={22} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-5px',
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
        <span>{state.language === 'en' ? 'Alerts' : 'বিজ্ঞপ্তি'}</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>{state.language === 'en' ? 'Profile' : 'প্রোফাইল'}</span>
      </NavLink>
    </nav>
  );
};

export default React.memo(BottomNav);
