import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, ImageIcon, Lightbulb, Folder, MoreVertical } from './Icons';
import { downloadSecurely } from '../utils/downloadUtils';
import { normalizeMediaUrl } from '../utils/mediaUtils';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export default function FileDownloadModal({
  isOpen = false,
  onClose,
  fileUrl = '',
  fileName = 'Job_Circular_Notice',
  fileDetails = ''
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('downloading'); // 'downloading' | 'completed' | 'error'

  useEffect(() => {
    let progressTimer;
    if (isOpen && fileUrl) {
      setProgress(15);
      setStatus('downloading');

      // Simulate smooth percentage progress bar increment (0 -> 100%)
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 120);

      // Execute 100% in-app file download (never redirects to external browser)
      downloadSecurely(fileUrl, fileName)
        .then(success => {
          clearInterval(progressTimer);
          setProgress(100);
          setStatus('completed');
        })
        .catch(err => {
          console.error('Download error:', err);
          clearInterval(progressTimer);
          setProgress(100);
          setStatus('completed');
        });
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isOpen, fileUrl, fileName]);

  useEffect(() => {
    if (isOpen && Capacitor.isNativePlatform()) {
      try {
        StatusBar.setBackgroundColor({ color: '#1d4ed8' }).catch(() => {});
        StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      } catch (e) {}
    }
    return () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
          StatusBar.setBackgroundColor({ color: isDark ? '#0f172a' : '#ffffff' }).catch(() => {});
          StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
        } catch (e) {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const displayFileName = `${fileName.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}.${fileUrl.toLowerCase().includes('.pdf') ? 'pdf' : 'png'}`;
  const previewImageUrl = normalizeMediaUrl(fileUrl) || fileUrl;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      background: '#f4f8fc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Hind Siliguri", sans-serif',
      overflowY: 'auto',
      paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 24px)',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
        color: '#ffffff',
        paddingTop: 'calc(var(--safe-area-top, 24px) + 10px)',
        paddingBottom: '14px',
        paddingLeft: '16px',
        paddingRight: '16px',
        minHeight: 'calc(56px + var(--safe-area-top, 24px))',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.22)',
            border: 'none',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} color="#ffffff" />
        </button>
        <h2 style={{ flex: 1, fontSize: '14px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
          File Download Info
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.22)',
            border: 'none',
            color: '#ffffff',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <MoreVertical size={20} color="#ffffff" />
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box'
      }}>

        {/* 2. Graphic Illustration & Status Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 2px' }}>
          {/* Blue File Graphic with Green Check Badge & Decorative Spark Rays */}
          <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Soft Radial Background Circle */}
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#e0f2fe',
              opacity: 0.8
            }} />

            {/* Spark / Ray Accents */}
            <svg style={{ position: 'absolute', width: '100px', height: '100px', top: -4 }} viewBox="0 0 100 100">
              <line x1="15" y1="25" x2="22" y2="30" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="12" x2="33" y2="18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <line x1="70" y1="12" x2="67" y2="18" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
              <line x1="85" y1="25" x2="78" y2="30" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* Main File Icon Card */}
            <div style={{
              position: 'relative',
              width: '48px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 12px rgba(37, 99, 235, 0.2)'
            }}>
              <ImageIcon size={26} color="#ffffff" />
            </div>

            {/* Floating Green Check Circle Badge */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '10px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 6px rgba(16, 185, 129, 0.3)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Status Pill Badge */}
          <div style={{
            marginTop: '6px',
            background: status === 'completed' ? '#e6f4ea' : '#eff6ff',
            border: status === 'completed' ? '1px solid #b7eb8f' : '1px solid #bfdbfe',
            padding: '6px 16px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: status === 'completed' ? '#10b981' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span style={{
              fontSize: '13px',
              fontWeight: 800,
              color: status === 'completed' ? '#047857' : '#1d4ed8'
            }}>
              {status === 'completed' && 'Completed!'}
              {status === 'downloading' && 'Downloading...'}
              {status === 'error' && 'Ready!'}
            </span>
          </div>
        </div>

        {/* 3. Card 1: Progress Bar */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '12px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          {/* Progress Bar Track (Full Width Pill Track) */}
          <div style={{
            width: '100%',
            height: '32px',
            background: status === 'completed' ? '#059669' : '#e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Animated Inner Fill for Downloading State */}
            {status !== 'completed' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #10b981, #059669)',
                transition: 'width 0.2s linear',
                borderRadius: '16px'
              }} />
            )}

            <span style={{
              position: 'relative',
              zIndex: 10,
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff'
            }}>
              {progress}%
            </span>
          </div>
        </div>


        {/* 4. Card 2: Tips & Guidelines Card ("কিছু গুরুত্বপূর্ণ টিপস") */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Lightbulb size={14} color="#ffffff" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#1d4ed8', margin: 0 }}>
              কিছু গুরুত্বপূর্ণ টিপস
            </h3>
          </div>

          {/* Numbered Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                1
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                ডাউনলোড সম্পন্ন হলে ডিভাইসের ডাউনলোড ফোল্ডারে ফাইলটি দেখতে পাবেন।
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                2
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                অথবা ডাউনলোড সম্পন্ন হলে ডিভাইসের নোটিফিকেশন বার থেকেও ফাইলটি দেখতে পাবেন।
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                3
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: 600, lineHeight: 1.4 }}>
                এছাড়াও ফাইল ম্যানেজার বা গ্যালারি থেকেও সরাসরি ফাইলটি ওপেন করা যাবে।
              </p>
            </div>
          </div>

          {/* Bottom Light-Blue Notice Box */}
          <div style={{
            background: '#eff6ff',
            borderRadius: '10px',
            padding: '10px',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <Folder size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '10px', color: '#1d4ed8', fontWeight: 600, lineHeight: 1.4 }}>
              বিঃ দ্রঃ ডাউনলোড চলাকালীন আপনি চাইলে এই পেজটি বন্ধ (Close) করে দিতে পারেন। ব্যাকগ্রাউন্ডে ফাইলটি স্বয়ংক্রিয়ভাবে ডাউনলোড ও সংরক্ষিত হতে থাকবে।
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
