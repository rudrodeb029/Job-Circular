import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { formatTimeAgo } from '../../utils/timeUtils';

export default function ManageNotifications() {
  const { state, dispatch } = useAdminContext();
  const notifications = state.notifications || [];

  const [searchNotif, setSearchNotif] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifFormData, setNotifFormData] = useState({
    title: '', organization: '', message: '', type: 'new_job', jobId: '', time: ''
  });
  const [editingNotifId, setEditingNotifId] = useState(null);
  const [deleteNotifId, setDeleteNotifId] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n =>
      (n.title || '').toLowerCase().includes(searchNotif.toLowerCase()) ||
      (n.organization || '').toLowerCase().includes(searchNotif.toLowerCase()) ||
      (n.message || '').toLowerCase().includes(searchNotif.toLowerCase())
    );
  }, [notifications, searchNotif]);

  const handleOpenNotifModal = (notif = null) => {
    if (notif) {
      setNotifFormData(notif);
      setEditingNotifId(notif.id);
    } else {
      setNotifFormData({ title: '', organization: '', message: '', type: 'new_job', jobId: '', time: '' });
      setEditingNotifId(null);
    }
    setIsNotifModalOpen(true);
  };

  const handleSaveNotif = (e) => {
    e.preventDefault();
    if (editingNotifId) {
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { ...notifFormData, id: editingNotifId } });
      showToast('Notification updated successfully');
    } else {
      const newNotif = { ...notifFormData, id: `notif-${Date.now()}`, isRead: false, createdAt: new Date().toISOString() };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotif });
      showToast('Notification added successfully');
    }
    setIsNotifModalOpen(false);
  };

  const handleDeleteNotif = () => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: deleteNotifId });
    setDeleteNotifId(null);
    showToast('Notification deleted successfully');
  };

  const getNotifBadgeColor = (type) => {
    switch (type) {
      case 'new_job': return { bg: '#eff6ff', text: '#1e40af', icon: '✨' };
      case 'deadline': return { bg: '#fff7ed', text: '#9a3412', icon: '⏰' };
      case 'admit_card': return { bg: '#ecfdf5', text: '#065f46', icon: '🎫' };
      case 'result': return { bg: '#f5f3ff', text: '#5b21b6', icon: '🏆' };
      default: return { bg: '#f8fafc', text: '#475569', icon: '🔔' };
    }
  };

  return (
    <div className="manage-notifications-page animate-fade-in">
      <style>{`
        .admin-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .notif-table th {
          background: #f8fafc;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
          padding: 16px;
        }
        .notif-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
        }
        .action-btn {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; alignItems: center; justifyContent: center;
          transition: all 0.2s; border: none; cursor: pointer;
        }
        .action-btn:hover { transform: translateY(-2px); }
        .modal-overlay { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 2000; display: flex; alignItems: center; justifyContent: center; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Notifications</h1>
        </div>
        <button
          onClick={() => handleOpenNotifModal()}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 24px', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Notification
        </button>
      </div>

      <div className="admin-card" style={{ padding: '24px', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search broadcast history..."
            style={{ width: '100%', padding: '14px 14px 14px 48px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
            value={searchNotif}
            onChange={(e) => setSearchNotif(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card" style={{ overflow: 'hidden' }}>
        <table className="notif-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th>Event Info</th>
              <th>Message Content</th>
              <th>Type</th>
              <th>Posted Time</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notif) => {
              const badge = getNotifBadgeColor(notif.type);
              return (
                <tr key={notif.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{notif.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{notif.organization}</div>
                  </td>
                  <td style={{ color: '#475569', maxWidth: '300px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.message}</div>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: badge.bg, color: badge.text }}>
                      <span>{badge.icon}</span>
                      <span style={{ textTransform: 'uppercase' }}>{(notif.type || '').replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    {notif.createdAt ? formatTimeAgo(notif.createdAt, true) : 'Recently'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="action-btn" style={{ background: '#eff6ff', color: '#1a56db' }} onClick={() => handleOpenNotifModal(notif)} title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button className="action-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={() => setDeleteNotifId(notif.id)} title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredNotifications.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>No broadcast records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isNotifModalOpen && (
        <div className="modal-overlay">
          <div className="admin-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{editingNotifId ? 'Edit Notification' : 'Broadcast Message'}</h2>
              <button onClick={() => setIsNotifModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleSaveNotif} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Alert Title</label>
                <input required value={notifFormData.title} onChange={e => setNotifFormData({...notifFormData, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="e.g. New Circular Published" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Organization</label>
                <input required value={notifFormData.organization} onChange={e => setNotifFormData({...notifFormData, organization: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="e.g. Bangladesh Bank" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Message Body</label>
                <textarea required rows="3" value={notifFormData.message} onChange={e => setNotifFormData({...notifFormData, message: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none', resize: 'none' }} placeholder="Enter the content of your notification..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Category Type</label>
                  <select value={notifFormData.type} onChange={e => setNotifFormData({...notifFormData, type: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }}>
                    <option value="new_job">New Job</option>
                    <option value="deadline">Deadline</option>
                    <option value="admit_card">Admit Card</option>
                    <option value="result">Result</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>Job Reference ID</label>
                  <input value={notifFormData.jobId} onChange={e => setNotifFormData({...notifFormData, jobId: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', outline: 'none' }} placeholder="e.g. job_123" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsNotifModalOpen(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Send Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteNotifId && (
        <div className="modal-overlay">
          <div className="admin-card animate-fade-in" style={{ padding: '32px', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', background: '#fee2e2', color: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>🗑️</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Delete Broadcast?</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>This notification will be removed from all user feeds. Continue?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
               <button onClick={() => setDeleteNotifId(null)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}>Keep it</button>
               <button onClick={handleDeleteNotif} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', right: '32px', background: '#10b981', color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: 700, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.2)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '10px', animation: 'slideInRight 0.3s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
