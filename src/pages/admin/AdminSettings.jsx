import React, { useState } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const { state, dispatch } = useAdminContext();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(state?.admin?.name || 'Admin User');
  const [profileEmail, setProfileEmail] = useState(state?.admin?.email || 'admin@example.com');
  
  const [autoPublish, setAutoPublish] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [showExpired, setShowExpired] = useState(false);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state?.jobs || [], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'jobs_export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data?')) {
      localStorage.removeItem('job_circular_admin_state');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset to default data?')) {
      localStorage.removeItem('job_circular_admin_state');
      window.location.reload();
    }
  };

  const handleLogout = () => {
    if (dispatch) {
      dispatch({ type: 'ADMIN_LOGOUT' });
    }
    navigate('/admin/login');
  };

  return (
    <div className="admin-page">
      <h2>Admin Settings</h2>
      
      <div className="admin-chart-card" style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Admin Profile</h3>
        {!isEditingProfile ? (
          <div>
            <p><strong>Name:</strong> {profileName}</p>
            <p><strong>Email:</strong> {profileEmail}</p>
            <p><strong>Role:</strong> Super Admin</p>
            <button onClick={() => setIsEditingProfile(true)} style={{ marginTop: 10, padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              Update Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 300 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 5 }}>Name:</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 5 }}>Email:</label>
              <input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="submit" style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save</button>
              <button type="button" onClick={() => setIsEditingProfile(false)} style={{ padding: '8px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="admin-chart-card" style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>App Configuration</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
          <span>Auto-publish new circulars</span>
          <div 
            onClick={() => setAutoPublish(!autoPublish)}
            style={{ width: 52, height: 28, borderRadius: 14, background: autoPublish ? '#3b82f6' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: autoPublish ? 26 : 2, transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
          <span>Email notifications</span>
          <div 
            onClick={() => setEmailNotifs(!emailNotifs)}
            style={{ width: 52, height: 28, borderRadius: 14, background: emailNotifs ? '#3b82f6' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: emailNotifs ? 26 : 2, transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
          <span>Show expired jobs</span>
          <div 
            onClick={() => setShowExpired(!showExpired)}
            style={{ width: 52, height: 28, borderRadius: 14, background: showExpired ? '#3b82f6' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
          >
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: showExpired ? 26 : 2, transition: 'left 0.3s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      </div>

      <div className="admin-chart-card" style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Data Management</h3>
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginTop: 15 }}>
          <button onClick={handleExportData} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export All Data
          </button>
          
          <button onClick={handleClearData} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            Clear All Data
          </button>
          
          <button onClick={handleResetData} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="admin-chart-card" style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #ef4444' }}>
        <h3 style={{ color: '#ef4444', marginTop: 0 }}>Danger Zone</h3>
        <p style={{ color: '#64748b', marginBottom: 15 }}>Log out from the admin session completely.</p>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
