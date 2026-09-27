import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Eye, FileText, CheckCircle } from './Icons';
import { downloadSecurely } from '../utils/downloadUtils';

export default function FileDownloadModal({
  isOpen = false,
  onClose,
  fileUrl = '',
  fileName = 'Job_Circular_Notice',
  fileDetails = ''
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('downloading'); // 'downloading' | 'completed' | 'error'
  const [downloadedBlobUrl, setDownloadedBlobUrl] = useState(null);

  useEffect(() => {
    let progressTimer;
    if (isOpen && fileUrl) {
      setProgress(10);
      setStatus('downloading');
      setDownloadedBlobUrl(null);

      // Simulate smooth percentage progress bar increment (0 -> 100%)
      progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 150);

      // Execute actual file download
      downloadSecurely(fileUrl, fileName)
        .then(success => {
          clearInterval(progressTimer);
          setProgress(100);
          setStatus(success ? 'completed' : 'error');
        })
        .catch(err => {
          console.error('Download error:', err);
          clearInterval(progressTimer);
          setProgress(100);
          setStatus('error');
        });
    }

    return () => {
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isOpen, fileUrl, fileName]);

  if (!isOpen) return null;

  const displayFileName = `${fileName.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}.${fileUrl.toLowerCase().includes('.pdf') ? 'pdf' : 'png'}`;
  const displayDetails = fileDetails || `${displayFileName} (1236×1600)`;

  const handleOpenFile = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999,
      background: 'var(--bg-primary, #f8fafc)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Hind Siliguri", sans-serif',
      overflowY: 'auto'
    }}>
      {/* Header Bar (Compact & Sleek) */}
      <div style={{
        background: 'linear-gradient(90deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
        color: '#ffffff',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.15)'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ flex: 1, fontSize: '15px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
          File Download Info
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#ffffff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Main Page Body Container (Compact Width & Padding) */}
      <div style={{
        flex: 1,
        maxWidth: '440px',
        width: '100%',
        margin: '0 auto',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxSizing: 'border-box'
      }}>
        {/* Main Card Wrapper */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>

          {/* File Dimensions Info Pill Box */}
          <div style={{
            background: '#f3e8ff',
            border: '1px solid #e9d5ff',
            color: '#6b21a8',
            borderRadius: '10px',
            padding: '8px 12px',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 700,
            wordBreak: 'break-all'
          }}>
            {displayDetails}
          </div>

          {/* File Name Header */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', margin: 0, wordBreak: 'break-all', lineHeight: 1.4 }}>
              {displayFileName}
            </h3>
          </div>

          {/* Progress Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: status === 'completed' ? '#059669' : '#2563eb' }}>
              {status === 'downloading' && 'Downloading...'}
              {status === 'completed' && '✓ Download Completed!'}
              {status === 'error' && '⚡ Opening File Directly...'}
            </span>

            {/* Progress Bar Track */}
            <div style={{
              width: '100%',
              height: '32px',
              background: '#e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #cbd5e1'
            }}>
              {/* Animated Inner Fill */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${progress}%`,
                background: status === 'completed'
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #3b82f6, #00d2ff)',
                transition: 'width 0.2s linear',
                borderRadius: '7px'
              }} />

              {/* Percentage Counter Label */}
              <span style={{
                position: 'relative',
                zIndex: 10,
                fontSize: '13px',
                fontWeight: 800,
                color: progress > 50 ? '#ffffff' : '#2563eb',
                textShadow: progress > 50 ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
              }}>
                {progress}%
              </span>
            </div>
          </div>

          {/* Bengali Guidelines Text Box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '11px',
            lineHeight: 1.5,
            color: '#475569',
            fontWeight: 600
          }}>
            <p style={{ margin: 0 }}>
              • ডাউনলোডকৃত ফাইল দেখতে চাইলে সরাসরি এখান থেকে ওপেন করতে পারেন।
            </p>
            <p style={{ margin: 0 }}>
              • কিংবা ডাউনলোড সম্পন্ন হলে নোটিফিকেশন বার থেকেও দেখতে পারবেন।
            </p>
            <p style={{ margin: 0 }}>
              • উল্লেখ্য, এখান থেকে দেখতে চাইলে ফাইলটি সরাসরি ওপেন না হয়ে ডাউনলোডকৃত ফোল্ডার ওপেন হবে।
            </p>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '10px' }}>
              বিঃ দ্রঃ ডাউনলোড চলাকালীন আপনি চাইলে এই পেজ টি বন্ধ / Close করে ও দিতে পারেন। Background এ ডাউনলোড হতে থাকবে।
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            {status === 'completed' && (
              <button
                onClick={handleOpenFile}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Eye size={14} />
                ওপেন ফাইল (Open)
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                flex: status === 'completed' ? 1 : 2,
                padding: '9px 12px',
                borderRadius: '10px',
                background: status === 'completed' ? '#f1f5f9' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: status === 'completed' ? '#475569' : '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: status === 'completed' ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.2)'
              }}
            >
              {status === 'completed' ? '✕ বন্ধ করুন' : '✕ Close (Background Download)'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
