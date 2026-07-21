import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Bookmark, Bell, User } from './Icons';
import { useAppContext } from '../context/AppContext';
import { notifications } from '../data/notifications';

const BottomNav = () => {
  const { state } = useAppContext();
  const unreadCount = notifications.filter(n => !state.readNotifications.includes(n.id)).length;

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/categories" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={22} />
        <span>Categories</span>
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Bookmark size={22} />
        <span>Saved</span>
      </NavLink>
      <NavLink to="/notifications" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative' }}>
          <Bell size={22} />
          {unreadCount > 0 && <span className="bottom-nav-badge"></span>}
        </div>
        <span>Notify</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
