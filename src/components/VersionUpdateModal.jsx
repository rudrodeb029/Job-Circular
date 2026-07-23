import React from 'react';
import { Download } from './Icons';

export default function VersionUpdateModal({ isOpen, updateInfo, currentVersion, onClose }) {
  if (!isOpen || !updateInfo) return null;

  const { latestVersion, updateUrl, forceUpdate, releaseNotes } = updateInfo;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(6px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--white)',
        width: '100%',
        maxWidth: '380px',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        padding: '24px',
        textAlign: 'center',
        border: '1px solid var(--border-light)',
        animation: 'scaleIn 0.3s ease'
      }}>
        {/* Animated Rocket or Update Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 20px rgba(26, 86, 219, 0.25)',
          color: '#ffffff',
          fontSize: '32px'
        }}>
          🚀
        </div>

        <h3 style={{
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 6px 0'
        }}>
          New Update Available!
        </h3>
        <p style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#10b981',
          margin: '0 0 16px 0',
          background: 'rgba(16, 185, 129, 0.08)',
          padding: '6px 14px',
          borderRadius: '20px',
          display: 'inline-block'
        }}>
          Version {latestVersion} is here (You have {currentVersion})
        </p>

        {/* Release Notes */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid var(--border-light)',
          borderRadius: '16px',
          padding: '14px',
          textAlign: 'left',
          marginBottom: '20px',
          maxHeight: '140px',
          overflowY: 'auto'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            What's New / নতুন কি আছে:
          </span>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 8px 0', fontWeight: 600 }}>
            • {releaseNotes?.en || "Bug fixes and performance improvements."}
          </p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, fontWeight: 600 }}>
            • {releaseNotes?.bn || "বাগ সংশোধন ও পারফরম্যান্স উন্নত করা হয়েছে।"}
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href={updateUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
              color: '#ffffff',
              padding: '14px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(26, 86, 219, 0.2)',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={18} color="#ffffff" />
            Update Now / আপডেট করুন
          </a>

          {!forceUpdate && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              Later / পরে
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
