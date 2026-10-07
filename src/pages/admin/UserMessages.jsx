import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { formatTimeAgo } from '../../utils/timeUtils';

export default function UserMessages() {
  const { state, dispatch, refreshData } = useAdminContext();
  const activities = state?.activities || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Extract and normalize all user contact messages from activities
  const allMessages = useMemo(() => {
    return activities
      .filter(item => {
        if (!item) return false;
        return (
          item.type === 'contact_message' ||
          item.type === 'message' ||
          item.type === 'contact' ||
          item.action === 'Support Message Received' ||
          (item.subject && item.message)
        );
      })
      .map(item => {
        const isRead = item.read === true || item.status === 'read';
        const name = item.userName || item.name || item.user || 'Anonymous User';
        const email = item.email || 'N/A';
        const subject = item.subject || 'Support Inquiry';
        const message = item.message || item.description || item.text || '';
        const createdAt = item.createdAt || item.time || new Date().toISOString();

        return {
          id: item.id,
          name,
          email,
          subject,
          message,
          read: isRead,
          createdAt,
          raw: item
        };
      });
  }, [activities]);

  // Summary counts
  const totalCount = allMessages.length;
  const unreadCount = allMessages.filter(m => !m.read).length;
  const readCount = allMessages.filter(m => m.read).length;

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return allMessages.filter(m => {
      try {
        return new Date(m.createdAt).toDateString() === today;
      } catch (e) {
        return false;
      }
    }).length;
  }, [allMessages]);

  // Filtered & Sorted Messages
  const filteredMessages = useMemo(() => {
    return allMessages
      .filter(msg => {
        // Status filter
        if (statusFilter === 'unread' && msg.read) return false;
        if (statusFilter === 'read' && !msg.read) return false;

        // Search term
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = (msg.name || '').toLowerCase().includes(term);
          const matchEmail = (msg.email || '').toLowerCase().includes(term);
          const matchSubject = (msg.subject || '').toLowerCase().includes(term);
          const matchMessage = (msg.message || '').toLowerCase().includes(term);
          if (!matchName && !matchEmail && !matchSubject && !matchMessage) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [allMessages, statusFilter, searchTerm, sortBy]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (typeof refreshData === 'function') {
        await refreshData(true);
      }
      showToast('Messages reloaded successfully');
    } catch (err) {
      console.error('Refresh error:', err);
      showToast('Failed to refresh data', 'error');
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Toggle Read / Unread Status
  const handleToggleRead = (msg, e) => {
    if (e) e.stopPropagation();
    const newReadState = !msg.read;
    const updatedRaw = {
      ...msg.raw,
      read: newReadState,
      status: newReadState ? 'read' : 'unread'
    };

    dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedRaw });

    if (selectedMessage && selectedMessage.id === msg.id) {
      setSelectedMessage(prev => prev ? { ...prev, read: newReadState, raw: updatedRaw } : null);
    }

    showToast(newReadState ? 'Marked as read' : 'Marked as unread');
  };

  // Open Message Detail Modal (auto-mark as read if unread)
  const handleOpenDetail = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      const updatedRaw = {
        ...msg.raw,
        read: true,
        status: 'read'
      };
      dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedRaw });
      setSelectedMessage({ ...msg, read: true, raw: updatedRaw });
    }
  };

  // Delete message confirmation
  const handleDeleteConfirm = () => {
    if (!deleteConfirmMsg) return;
    dispatch({ type: 'DELETE_ACTIVITY', payload: deleteConfirmMsg.id });
    if (selectedMessage && selectedMessage.id === deleteConfirmMsg.id) {
      setSelectedMessage(null);
    }
    setDeleteConfirmMsg(null);
    showToast('Message deleted successfully');
  };

  // Copy to clipboard helper
  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  // Color generator for avatar based on name
  const getAvatarColor = (name = '') => {
    const colors = [
      { bg: '#eff6ff', text: '#2563eb' },
      { bg: '#f5f3ff', text: '#7c3aed' },
      { bg: '#ecfdf5', text: '#059669' },
      { bg: '#fff7ed', text: '#ea580c' },
      { bg: '#fdf2f8', text: '#db2777' },
      { bg: '#e0f2fe', text: '#0284c7' }
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  // Format full date nicely
  const formatFullDate = (iso) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <div className="user-messages-page animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .admin-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .msg-item-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
        }
        .msg-item-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          transform: translateY(-1px);
        }
        .msg-item-card.unread {
          background: #f8faff;
          border-left: 4px solid #2563eb;
        }
        .action-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-icon-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #cbd5e1;
        }
        .action-icon-btn.danger:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fecaca;
        }
        .action-icon-btn.primary:hover {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }
        .filter-chip {
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f1f5f9;
          color: #64748b;
        }
        .filter-chip.active {
          background: #1a56db;
          color: #ffffff;
        }
        .modal-overlay {
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(6px);
          position: fixed;
          inset: 0;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '13.5px',
          fontWeight: 600,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.type === 'error' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"></path></svg>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                User Messages
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Inquiries and support messages sent by users from the Contact & Help Center.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <svg
            className={isRefreshing ? 'spinning' : ''}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Card 1: Total Messages */}
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Messages
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {totalCount}
            </h3>
          </div>
        </div>

        {/* Card 2: Unread */}
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: unreadCount > 0 ? '4px solid #ef4444' : '1px solid #e2e8f0' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#fef2f2',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 2px #ffffff'
              }} />
            )}
          </div>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Unread Messages
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: unreadCount > 0 ? '#ef4444' : '#0f172a' }}>
                {unreadCount}
              </h3>
              {unreadCount > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', background: '#fee2e2', padding: '2px 8px', borderRadius: '999px' }}>
                  Action Needed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Read */}
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Read / Handled
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {readCount}
            </h3>
          </div>
        </div>

        {/* Card 4: Today's Inquiries */}
        <div className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#f8fafc',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Received Today
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              {todayCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '440px' }}>
            <svg
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search by sender, email, subject, message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 36px 10px 40px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '13px',
                outline: 'none',
                color: '#0f172a',
                transition: 'border-color 0.15s'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '14px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills & Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                <span>All</span>
                <span style={{
                  fontSize: '11px',
                  background: statusFilter === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  padding: '1px 6px',
                  borderRadius: '999px'
                }}>
                  {totalCount}
                </span>
              </button>
              <button
                className={`filter-chip ${statusFilter === 'unread' ? 'active' : ''}`}
                onClick={() => setStatusFilter('unread')}
              >
                <span>Unread</span>
                <span style={{
                  fontSize: '11px',
                  background: statusFilter === 'unread' ? 'rgba(255,255,255,0.25)' : (unreadCount > 0 ? '#fee2e2' : '#e2e8f0'),
                  color: statusFilter === 'unread' ? '#ffffff' : (unreadCount > 0 ? '#b91c1c' : '#64748b'),
                  padding: '1px 6px',
                  borderRadius: '999px',
                  fontWeight: 700
                }}>
                  {unreadCount}
                </span>
              </button>
              <button
                className={`filter-chip ${statusFilter === 'read' ? 'active' : ''}`}
                onClick={() => setStatusFilter('read')}
              >
                <span>Read</span>
                <span style={{
                  fontSize: '11px',
                  background: statusFilter === 'read' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  padding: '1px 6px',
                  borderRadius: '999px'
                }}>
                  {readCount}
                </span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Messages List Area */}
      {filteredMessages.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#f1f5f9',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
            {searchTerm || statusFilter !== 'all' ? 'No matching messages found' : 'No user messages yet'}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search terms or filters to find what you are looking for.'
              : 'When users send inquiries from the mobile app Contact & Help Center, they will show up here in real time.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              style={{
                marginTop: '16px',
                padding: '8px 18px',
                borderRadius: '8px',
                background: '#eff6ff',
                color: '#2563eb',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredMessages.map((msg) => {
            const avatarColor = getAvatarColor(msg.name);
            const initial = (msg.name.trim()[0] || 'U').toUpperCase();

            return (
              <div
                key={msg.id}
                className={`msg-item-card ${!msg.read ? 'unread' : ''}`}
                onClick={() => handleOpenDetail(msg)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  
                  {/* Left: Avatar & Sender Info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                    {/* Avatar */}
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: avatarColor.bg,
                      color: avatarColor.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      flexShrink: 0,
                      position: 'relative'
                    }}>
                      {initial}
                      {!msg.read && (
                        <span style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: '#2563eb',
                          boxShadow: '0 0 0 2px #ffffff'
                        }} />
                      )}
                    </div>

                    {/* Sender, Subject & Message Preview */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '3px' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '14px',
                          fontWeight: msg.read ? 600 : 800,
                          color: '#0f172a'
                        }}>
                          {msg.name}
                        </h4>

                        {/* Email pill */}
                        {msg.email && msg.email !== 'N/A' && (
                          <span style={{
                            fontSize: '11.5px',
                            color: '#64748b',
                            background: '#f1f5f9',
                            padding: '1px 8px',
                            borderRadius: '6px'
                          }}>
                            {msg.email}
                          </span>
                        )}

                        {/* Unread badge */}
                        {!msg.read && (
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            color: '#1d4ed8',
                            background: '#dbeafe',
                            padding: '1px 7px',
                            borderRadius: '999px',
                            letterSpacing: '0.04em'
                          }}>
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Subject */}
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: msg.read ? 600 : 700,
                        color: msg.read ? '#334155' : '#0f172a',
                        marginBottom: '4px'
                      }}>
                        {msg.subject}
                      </div>

                      {/* Snippet */}
                      <p style={{
                        margin: 0,
                        fontSize: '12.5px',
                        color: '#64748b',
                        lineHeight: 1.45,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {msg.message || 'No message content provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Timestamp & Action Controls */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '10px',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600, whiteSilkWrapped: 'nowrap' }}>
                      {formatTimeAgo(msg.createdAt)}
                    </span>

                    {/* Toolbar buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      {/* Toggle Read */}
                      <button
                        className="action-icon-btn primary"
                        title={msg.read ? 'Mark as Unread' : 'Mark as Read'}
                        onClick={(e) => handleToggleRead(msg, e)}
                      >
                        {msg.read ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>

                      {/* Quick Reply (mailto) */}
                      {msg.email && msg.email !== 'N/A' && (
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                          className="action-icon-btn"
                          title="Reply via Email"
                          style={{ textDecoration: 'none' }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <polyline points="9 17 4 12 9 7"></polyline>
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                          </svg>
                        </a>
                      )}

                      {/* Delete */}
                      <button
                        className="action-icon-btn danger"
                        title="Delete Message"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmMsg(msg);
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Detailed Message Modal ────────────────────────────── */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div
            className="admin-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '620px',
              padding: '24px 28px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#2563eb',
                  background: '#eff6ff',
                  padding: '3px 9px',
                  borderRadius: '6px'
                }}>
                  User Inquiry
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px 0' }}>
                  {selectedMessage.subject}
                </h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Received on {formatFullDate(selectedMessage.createdAt)} ({formatTimeAgo(selectedMessage.createdAt)})
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedMessage.name}</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedMessage.name, 'Sender name')}
                  style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Copy Name
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.email && selectedMessage.email !== 'N/A' && (
                  <button
                    onClick={() => handleCopy(selectedMessage.email, 'Email address')}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Copy Email
                  </button>
                )}
              </div>
            </div>

            {/* Message Body Container */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Message Content
                </label>
                <button
                  onClick={() => handleCopy(selectedMessage.message, 'Message text')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: '#475569',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  <span>Copy Text</span>
                </button>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                lineHeight: 1.65,
                color: '#1e293b',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {selectedMessage.message || 'No content provided.'}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '16px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Reply by Email */}
                {selectedMessage.email && selectedMessage.email !== 'N/A' && (
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 18px',
                      background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                      color: '#ffffff',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    <span>Reply via Email</span>
                  </a>
                )}

                {/* Toggle Read */}
                <button
                  onClick={(e) => handleToggleRead(selectedMessage, e)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {selectedMessage.read ? 'Mark as Unread' : 'Mark as Read'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {/* Delete */}
                <button
                  onClick={() => setDeleteConfirmMsg(selectedMessage)}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '10px',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ef4444',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>

                {/* Close */}
                <button
                  onClick={() => setSelectedMessage(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────────────────── */}
      {deleteConfirmMsg && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmMsg(null)}>
          <div
            className="admin-card animate-fade-in"
            style={{ width: '100%', maxWidth: '420px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 6px 0' }}>
              Delete Message?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this message from <strong>{deleteConfirmMsg.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmMsg(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
