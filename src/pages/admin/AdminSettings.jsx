import React, { useState, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';
import { getDocument, COLLECTIONS } from '../../services/firestoreService';
import { saveOneSignalConfig, broadcastPush } from '../../utils/oneSignalWrapper';
import { getAppInfoConfig, saveAppInfoConfig, DEFAULT_APP_INFO } from '../../utils/appInfoService';

const AdminSettings = () => {
  const { state, dispatch } = useAdminContext();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(state?.admin?.name || 'Admin User');
  const [profileEmail, setProfileEmail] = useState(state?.admin?.email || 'admin@example.com');
  
  const [autoPublish, setAutoPublish] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [showExpired, setShowExpired] = useState(false);
  const [fcmServerKey, setFcmServerKey] = useState('');
  const [onesignalAppId, setOnesignalAppId] = useState('54decc7c-7653-48d2-bf9d-dc1bc0ff0307');
  const [onesignalRestKey, setOnesignalRestKey] = useState('');
  const [configLoading, setConfigLoading] = useState(true);

  // Dynamic Contact Us, Rate Us, Share App Config State
  const [appInfo, setAppInfo] = useState(DEFAULT_APP_INFO);
  const [appInfoSaving, setAppInfoSaving] = useState(false);

  // Load Configs from Firestore on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const doc = await getDocument(COLLECTIONS.APP_CONFIG, 'onesignal');
        if (doc) {
          if (doc.appId) setOnesignalAppId(doc.appId);
          if (doc.restApiKey) setOnesignalRestKey(doc.restApiKey);
        }

        // Load App Info (Contact Us, Rate Us, Share App)
        const info = await getAppInfoConfig(true);
        if (info) setAppInfo(info);
      } catch (err) {
        console.error('Failed to load Configs from Firestore:', err);
      } finally {
        setConfigLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
  };

  const handleSaveFcmKey = (e) => {
    e.preventDefault();
    if (fcmServerKey && !fcmServerKey.startsWith('AAAA') && !fcmServerKey.startsWith('AIza')) {
      alert('Invalid Key Format! FCM Keys usually start with "AAAA..." or "AIza..."');
      return;
    }
    alert('FCM Server Key noted! (FCM is legacy — OneSignal is the primary push system)');
  };

  const handleSaveOnesignalConfig = async (e) => {
    e.preventDefault();
    try {
      await saveOneSignalConfig(onesignalAppId, onesignalRestKey);
      alert('✅ OneSignal configuration saved to Firebase successfully!');
    } catch (err) {
      alert('❌ Failed to save OneSignal config: ' + err.message);
    }
  };

  const handleSaveAppInfo = async (e) => {
    e.preventDefault();
    setAppInfoSaving(true);
    try {
      await saveAppInfoConfig(appInfo);
      alert('✅ Contact Us, Rate Us & Share App info saved to Firestore successfully!');
    } catch (err) {
      alert('❌ Failed to save App Info: ' + err.message);
    } finally {
      setAppInfoSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!onesignalRestKey) {
      alert('Please save your OneSignal REST API Key first!');
      return;
    }
    try {
        // Save config first to make sure Firestore has the latest keys
        await saveOneSignalConfig(onesignalAppId, onesignalRestKey);
        const result = await broadcastPush('Test Notification 🔔', 'If you see this, OneSignal setup is working correctly!', { type: 'test' });

        if (result.success) {
            if (result.warning) {
                alert(`ℹ️ OneSignal Connection Verified successfully!\n\nHowever, 0 active subscribers were found in your OneSignal dashboard.\n\nTo see push notifications, please install your Android app on a phone and tap 'Allow Notifications'.`);
            } else {
                alert(`✅ Success! OneSignal has queued the notification successfully. Check your device/browser now! 🔔`);
            }
        } else {
            alert('OneSignal Error: ' + JSON.stringify(result.error));
        }
    } catch (err) {
      alert('System Failed: ' + err.message);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(state?.jobs || [], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'jobs_backup.json');
    linkElement.click();
  };

  const handleLogout = async () => {
    try {
      const { auth } = await import('../../firebase');
      await auth.signOut();
    } catch (e) {
      console.error('Error signing out from Firebase:', e);
    }
    if (dispatch) dispatch({ type: 'ADMIN_LOGOUT' });
    navigate('/admin/login');
  };

  return (
    <div className="admin-settings-page animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        .settings-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }
        .settings-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          color: #0f172a;
        }
        .section-header h3 {
          margin: 0;
          font-size: 18px;
          fontWeight: 800;
        }
        .toggle-switch {
          width: 52px; height: 28px; border-radius: 14px; position: relative; cursor: pointer; transition: all 0.3s;
        }
        .toggle-knob {
          width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 3px; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .modern-input {
          width: 100%; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 12px; outline: none; transition: border-color 0.2s; background: #f8fafc;
        }
        .modern-input:focus { border-color: #2563eb; background: #fff; }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .settings-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>Admin Settings</h1>
      </div>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h3>Admin Profile</h3>
          </div>

          {!isEditingProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{profileName}</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>{profileEmail}</p>
              </div>
              <button onClick={() => setIsEditingProfile(true)} style={{ marginTop: '8px', padding: '14px', background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit Profile Info
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="modern-input" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Full Name" />
              <input className="modern-input" type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} placeholder="Email Address" />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
                <button type="button" onClick={() => setIsEditingProfile(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          )}
        </div>

        {/* Config Card */}
        <div className="settings-card">
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3>App Configuration</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Auto-publish new circulars', val: autoPublish, set: setAutoPublish },
              { label: 'Push notification alerts', val: emailNotifs, set: setEmailNotifs },
              { label: 'Show expired jobs in feed', val: showExpired, set: setShowExpired }
            ].map((item, i) => (
              <div key={i} onClick={() => item.set(!item.val)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: '#f8fafc', cursor: 'pointer', border: '1.5px solid transparent', transition: 'all 0.2s' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{item.label}</span>
                <div className="toggle-switch" style={{ background: item.val ? '#10b981' : '#cbd5e1' }}>
                  <div className="toggle-knob" style={{ left: item.val ? '27px' : '3px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FCM Card */}
        <div className="settings-card">
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <h3>Push Notification (FCM)</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>Configure your Firebase Cloud Messaging server key to enable instant alerts.</p>
          <form onSubmit={handleSaveFcmKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" className="modern-input" placeholder="Legacy Server Key (AAAA...)" value={fcmServerKey} onChange={e => setFcmServerKey(e.target.value)} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ flex: 1, padding: '14px', background: '#1a56db', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26, 86, 219, 0.15)' }}>Save Key</button>
              <button type="button" onClick={handleTestNotification} style={{ padding: '14px 20px', background: '#f8fafc', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Test
              </button>
            </div>
          </form>
        </div>

        {/* OneSignal Card */}
        <div className="settings-card">
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <h3>OneSignal Settings</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>Configure your OneSignal App ID and REST API Key to enable push notifications.</p>
          <form onSubmit={handleSaveOnesignalConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>ONE SIGNAL APP ID</label>
                <input className="modern-input" placeholder="App ID (e.g. 54de...)" value={onesignalAppId} onChange={e => setOnesignalAppId(e.target.value)} />
            </div>
            <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', display: 'block' }}>REST API KEY (SECRET)</label>
                <input type="password" className="modern-input" placeholder="REST API Key (starts with os_v2...)" value={onesignalRestKey} onChange={e => setOnesignalRestKey(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ flex: 1, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' }}>Save Config</button>
              <button type="button" onClick={handleTestNotification} style={{ padding: '14px 20px', background: '#f8fafc', color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Test
              </button>
            </div>
          </form>
        </div>

        {/* Data Card */}
        <div className="settings-card">
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#f5f3ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </div>
            <h3>Data Management</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>Backup and maintenance options for your application database records.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button onClick={handleExportData} style={{ padding: '14px', background: '#f5f3ff', color: '#7c3aed', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export
            </button>
            <button onClick={() => alert('Feature coming soon!')} style={{ padding: '14px', background: '#fff7ed', color: '#d97706', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
              Reset
            </button>
          </div>
        </div>

        {/* Contact Us, Rate Us & Share App Admin Configuration Card */}
        <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <div style={{ width: '36px', height: '36px', background: '#e0e7ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338ca' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <h3>Contact Us, Rate Us & Share App Configuration</h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
            Manage support email, WhatsApp number, Play Store rating link, and Share App URLs displayed across all user devices.
          </p>

          <form onSubmit={handleSaveAppInfo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>SUPPORT EMAIL ADDRESS</label>
              <input className="modern-input" type="email" placeholder="e.g. support@jobcircularbd.app" value={appInfo.contactEmail || ''} onChange={e => setAppInfo({ ...appInfo, contactEmail: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>WHATSAPP / SUPPORT PHONE</label>
              <input className="modern-input" type="text" placeholder="e.g. +8801700000000" value={appInfo.whatsappNumber || ''} onChange={e => setAppInfo({ ...appInfo, whatsappNumber: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>PLAY STORE RATE US LINK</label>
              <input className="modern-input" type="url" placeholder="https://play.google.com/store/apps/details?id=..." value={appInfo.playStoreUrl || ''} onChange={e => setAppInfo({ ...appInfo, playStoreUrl: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>SHARE APP DOWNLOAD URL</label>
              <input className="modern-input" type="url" placeholder="https://job-circular-75dbb.web.app" value={appInfo.shareAppUrl || ''} onChange={e => setAppInfo({ ...appInfo, shareAppUrl: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>FACEBOOK PAGE URL</label>
              <input className="modern-input" type="url" placeholder="https://facebook.com/..." value={appInfo.facebookPageUrl || ''} onChange={e => setAppInfo({ ...appInfo, facebookPageUrl: e.target.value })} />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>TELEGRAM CHANNEL URL</label>
              <input className="modern-input" type="url" placeholder="https://t.me/..." value={appInfo.telegramChannelUrl || ''} onChange={e => setAppInfo({ ...appInfo, telegramChannelUrl: e.target.value })} />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '8px', display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={appInfoSaving} style={{ padding: '14px 28px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(67, 56, 202, 0.2)' }}>
                {appInfoSaving ? 'Saving Info...' : '💾 Save Contact, Rate & Share Config'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-card" style={{ background: '#fef2f2', border: '1.5px solid #fee2e2', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#991b1b', fontSize: '18px', fontWeight: 800 }}>Danger Zone</h3>
            <p style={{ margin: '4px 0 0 0', color: '#b91c1c', fontSize: '14px', fontWeight: 500 }}>Log out from your secure administrative session</p>
          </div>
          <button onClick={handleLogout} style={{ padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout Securely
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
