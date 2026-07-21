import React, { useState, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext';

export default function ManageNotifications() {
  const { notifications: ctxNotifications } = useAdminContext() || {};

  // Mock initial data if context doesn't provide it
  const initialNotifications = ctxNotifications || [
    {
      id: 'notif-1',
      title: 'New Job Alert',
      organization: 'Bangladesh Bank',
      message: 'Officer (General) position open for applications.',
      time: '2 hours ago',
      isRead: false,
      type: 'new_job',
      jobId: 'job-11'
    },
    {
      id: 'notif-2',
      title: 'Deadline Approaching',
      organization: 'Sonali Bank',
      message: 'Last day to apply for Senior Officer.',
      time: '1 day ago',
      isRead: true,
      type: 'deadline',
      jobId: 'job-12'
    }
  ];

  const initialItems = [
    {
      id: 'item-1',
      examName: 'Officer (IT) MCQ Exam',
      organization: 'Bangladesh Bank',
      type: 'admit_card',
      status: 'Published',
      date: '2023-11-15',
      downloadLink: '#'
    },
    {
      id: 'item-2',
      examName: 'Senior Officer Written Result',
      organization: 'Agrani Bank',
      type: 'result',
      status: 'Published',
      date: '2023-11-10',
      downloadLink: '#'
    }
  ];

  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [items, setItems] = useState(initialItems);

  const [searchNotif, setSearchNotif] = useState('');
  const [searchItem, setSearchItem] = useState('');

  const [toast, setToast] = useState(null);

  // Modals state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifFormData, setNotifFormData] = useState({
    title: '', organization: '', message: '', type: 'new_job', jobId: '', time: ''
  });
  const [editingNotifId, setEditingNotifId] = useState(null);
  const [deleteNotifId, setDeleteNotifId] = useState(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    examName: '', organization: '', type: 'admit_card', status: '', date: '', downloadLink: ''
  });
  const [editingItemId, setEditingItemId] = useState(null);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ---------------- Notifications Logic ----------------

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n =>
      n.title.toLowerCase().includes(searchNotif.toLowerCase()) ||
      n.organization.toLowerCase().includes(searchNotif.toLowerCase()) ||
      n.message.toLowerCase().includes(searchNotif.toLowerCase())
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
      setNotifications(prev => prev.map(n => n.id === editingNotifId ? { ...n, ...notifFormData } : n));
      showToast('Notification updated successfully');
    } else {
      const newNotif = { ...notifFormData, id: `notif-${Date.now()}`, isRead: false };
      setNotifications(prev => [newNotif, ...prev]);
      showToast('Notification added successfully');
    }
    setIsNotifModalOpen(false);
  };

  const handleDeleteNotif = () => {
    setNotifications(prev => prev.filter(n => n.id !== deleteNotifId));
    setDeleteNotifId(null);
    showToast('Notification deleted successfully');
  };

  const getNotifBadgeColor = (type) => {
    switch (type) {
      case 'new_job': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'deadline': return { bg: '#FFEDD5', text: '#C2410C' };
      case 'admit_card': return { bg: '#D1FAE5', text: '#047857' };
      case 'result': return { bg: '#F3E8FF', text: '#7E22CE' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  // ---------------- Items Logic ----------------

  const filteredItems = useMemo(() => {
    return items.filter(i =>
      i.examName.toLowerCase().includes(searchItem.toLowerCase()) ||
      i.organization.toLowerCase().includes(searchItem.toLowerCase())
    );
  }, [items, searchItem]);

  const handleOpenItemModal = (item = null) => {
    if (item) {
      setItemFormData(item);
      setEditingItemId(item.id);
    } else {
      setItemFormData({ examName: '', organization: '', type: 'admit_card', status: '', date: '', downloadLink: '' });
      setEditingItemId(null);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (editingItemId) {
      setItems(prev => prev.map(i => i.id === editingItemId ? { ...i, ...itemFormData } : i));
      showToast('Item updated successfully');
    } else {
      const newItem = { ...itemFormData, id: `item-${Date.now()}` };
      setItems(prev => [newItem, ...prev]);
      showToast('Item added successfully');
    }
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = () => {
    setItems(prev => prev.filter(i => i.id !== deleteItemId));
    setDeleteItemId(null);
    showToast('Item deleted successfully');
  };

  const getItemBadgeColor = (type) => {
    switch (type) {
      case 'admit_card': return { bg: '#D1FAE5', text: '#047857' };
      case 'result': return { bg: '#F3E8FF', text: '#7E22CE' };
      default: return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  // ---------------- Icons ----------------
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );
  
  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );

  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        Manage Notifications & Updates
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            backgroundColor: activeTab === 'notifications' ? '#2563EB' : 'transparent',
            color: activeTab === 'notifications' ? '#FFFFFF' : '#4B5563',
            transition: 'all 0.2s'
          }}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('admit_results')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            backgroundColor: activeTab === 'admit_results' ? '#2563EB' : 'transparent',
            color: activeTab === 'admit_results' ? '#FFFFFF' : '#4B5563',
            transition: 'all 0.2s'
          }}
        >
          Admit Card & Results
        </button>
      </div>

      {/* Tab Content: Notifications */}
      {activeTab === 'notifications' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchNotif}
                onChange={(e) => setSearchNotif(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={() => handleOpenNotifModal()}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', backgroundColor: '#10B981', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              <PlusIcon /> Add Notification
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Title</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Organization</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Message</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Time</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notif) => {
                  const badge = getNotifBadgeColor(notif.type);
                  const truncatedMsg = notif.message.length > 50 ? notif.message.substring(0, 50) + '...' : notif.message;
                  return (
                    <tr key={notif.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontSize: '14px', fontWeight: '500' }}>{notif.title}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '14px' }}>{notif.organization}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '14px' }} title={notif.message}>{truncatedMsg}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: badge.bg, color: badge.text,
                          padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {notif.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '14px' }}>{notif.time}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenNotifModal(notif)} style={{ padding: '6px', backgroundColor: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }} title="Edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => setDeleteNotifId(notif.id)} style={{ padding: '6px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }} title="Delete">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredNotifications.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No notifications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Admit Card & Results */}
      {activeTab === 'admit_results' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '400px' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', display: 'flex' }}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search exams or organizations..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={() => handleOpenItemModal()}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 16px', backgroundColor: '#10B981', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              <PlusIcon /> Add Item
            </button>
          </div>

          <div style={{ overflowX: 'auto', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Exam Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Organization</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Type</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const badge = getItemBadgeColor(item.type);
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px 16px', color: '#111827', fontSize: '14px', fontWeight: '500' }}>{item.examName}</td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '14px' }}>{item.organization}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: badge.bg, color: badge.text,
                          padding: '4px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {item.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4B5563', fontSize: '14px' }}>{item.status}</td>
                      <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: '14px' }}>{item.date}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleOpenItemModal(item)} style={{ padding: '6px', backgroundColor: '#DBEAFE', color: '#1D4ED8', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }} title="Edit">
                            <EditIcon />
                          </button>
                          <button onClick={() => setDeleteItemId(item.id)} style={{ padding: '6px', backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex' }} title="Delete">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Notification */}
      {isNotifModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{editingNotifId ? 'Edit Notification' : 'Add Notification'}</h2>
              <button onClick={() => setIsNotifModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><XIcon /></button>
            </div>
            <form onSubmit={handleSaveNotif} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Title</label>
                <input required type="text" value={notifFormData.title} onChange={e => setNotifFormData({...notifFormData, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Organization</label>
                <input required type="text" value={notifFormData.organization} onChange={e => setNotifFormData({...notifFormData, organization: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Message</label>
                <textarea required rows="3" value={notifFormData.message} onChange={e => setNotifFormData({...notifFormData, message: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Type</label>
                  <select value={notifFormData.type} onChange={e => setNotifFormData({...notifFormData, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}>
                    <option value="new_job">New Job</option>
                    <option value="deadline">Deadline</option>
                    <option value="admit_card">Admit Card</option>
                    <option value="result">Result</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Time</label>
                  <input required type="text" value={notifFormData.time} onChange={e => setNotifFormData({...notifFormData, time: e.target.value})} placeholder="e.g. 2 hours ago" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Job ID (optional)</label>
                <input type="text" value={notifFormData.jobId} onChange={e => setNotifFormData({...notifFormData, jobId: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsNotifModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: '500' }}>{editingNotifId ? 'Save Changes' : 'Add Notification'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admit/Result Item */}
      {isItemModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{editingItemId ? 'Edit Item' : 'Add Item'}</h2>
              <button onClick={() => setIsItemModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><XIcon /></button>
            </div>
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Exam Name</label>
                <input required type="text" value={itemFormData.examName} onChange={e => setItemFormData({...itemFormData, examName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Organization</label>
                <input required type="text" value={itemFormData.organization} onChange={e => setItemFormData({...itemFormData, organization: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Type</label>
                  <select value={itemFormData.type} onChange={e => setItemFormData({...itemFormData, type: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }}>
                    <option value="admit_card">Admit Card</option>
                    <option value="result">Result</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Status</label>
                  <input required type="text" value={itemFormData.status} onChange={e => setItemFormData({...itemFormData, status: e.target.value})} placeholder="e.g. Published" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Date</label>
                  <input required type="text" value={itemFormData.date} onChange={e => setItemFormData({...itemFormData, date: e.target.value})} placeholder="YYYY-MM-DD" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>Download Link</label>
                  <input type="text" value={itemFormData.downloadLink} onChange={e => setItemFormData({...itemFormData, downloadLink: e.target.value})} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsItemModalOpen(false)} style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#2563EB', color: 'white', cursor: 'pointer', fontWeight: '500' }}>{editingItemId ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal: Notification */}
      {deleteNotifId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 16px', width: '48px', height: '48px', backgroundColor: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <TrashIcon />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>Delete Notification?</h3>
            <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px' }}>Are you sure you want to delete this notification? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteNotifId(null)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleDeleteNotif} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#DC2626', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal: Item */}
      {deleteItemId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ margin: '0 auto 16px', width: '48px', height: '48px', backgroundColor: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <TrashIcon />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>Delete Item?</h3>
            <p style={{ margin: '0 0 24px', color: '#6B7280', fontSize: '14px' }}>Are you sure you want to delete this admit card / result? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteItemId(null)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
              <button onClick={handleDeleteItem} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#DC2626', color: 'white', cursor: 'pointer', fontWeight: '500' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#10B981', color: 'white',
          padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 100, animation: 'fadeIn 0.3s'
        }}>
          <CheckIcon />
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
