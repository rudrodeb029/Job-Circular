import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, CheckCircle, ExternalLink } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { getAppInfoConfig, DEFAULT_APP_INFO } from '../utils/appInfoService';

export default function ShareApp() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [info, setInfo] = useState(DEFAULT_APP_INFO);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getAppInfoConfig();
        if (data) setInfo(data);
      } catch (err) {
        console.error('Failed to load Share App link:', err);
      }
    };
    fetchInfo();
  }, []);

  const shareUrl = info.shareAppUrl || 'https://job-circular-75dbb.web.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Live Circular',
          text: isEn 
            ? 'Download Live Circular app for latest government, bank, and private job notices & live MCQ preparation!'
            : 'বাংলাদেশের সকল চাকরির সার্কুলার, পরীক্ষার প্রবেশপত্র ও প্রস্তুতির জন্য Live Circular অ্যাপটি ডাউনলোড করুন!',
          url: shareUrl
        });
      } catch (err) {
        console.log('Share dismissed or failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    { 
      name: 'WhatsApp', 
      color: '#25d366', 
      bg: 'rgba(37, 211, 102, 0.12)', 
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent((isEn ? 'Download Live Circular App: ' : 'সকল চাকরির খবর একসাথে পেতে Live Circular অ্যাপটি ডাউনলোড করুন: ') + shareUrl)}`
    },
    { 
      name: 'Facebook', 
      color: '#1877f2', 
      bg: 'rgba(24, 119, 242, 0.12)', 
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    { 
      name: 'Telegram', 
      color: '#0088cc', 
      bg: 'rgba(0, 136, 204, 0.12)', 
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(isEn ? 'Live Circular App' : 'Live Circular অ্যাপ')}`
    },
    { 
      name: 'Email', 
      color: '#ea4335', 
      bg: 'rgba(234, 67, 53, 0.12)', 
      url: `mailto:?subject=${encodeURIComponent(isEn ? 'Download Live Circular App' : 'Live Circular অ্যাপ লিঙ্ক')}&body=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={18} color="#7c3aed" />
          <span>{isEn ? 'Share App with Friends' : 'বন্ধুদের সাথে শেয়ার করুন'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Soft Pastel Hero Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(109, 40, 217, 0.03) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: '24px',
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 20px rgba(124, 58, 237, 0.28)',
            transform: 'rotate(-3deg)'
          }}>
            <Share2 size={32} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {isEn ? 'Spread the Word!' : 'চাকরিপ্রার্থী বন্ধুদের শেয়ার করুন'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {isEn 
              ? 'Help your friends, family, and colleagues find their dream jobs by sharing Live Circular.'
              : 'আপনার ১টি শেয়ার আপনার বন্ধুকে স্বপ্নের ক্যারিয়ার গঠনে সাহায্য করতে পারে।'}
          </p>
        </div>

        {/* Share Link Copy Card */}
        <div className="card" style={{ padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
            {isEn ? 'APP DOWNLOAD LINK' : 'অ্যাপ ডাউনলোড লিঙ্ক'}
          </label>

          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '8px 12px',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <span style={{ flex: 1, fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-all' }}>
              {shareUrl}
            </span>
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? '#10b981' : 'var(--primary)',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {copied ? (isEn ? 'Copied!' : 'কপি হয়েছে!') : (isEn ? 'Copy Link' : 'লিঙ্ক কপি')}
            </button>
          </div>

          {/* Native Web Share Button */}
          <button
            onClick={handleNativeShare}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)'
            }}
          >
            <Share2 size={18} color="#ffffff" />
            <span>{isEn ? 'Share via Any App' : 'সরাসরি অ্যাপের মাধ্যমে শেয়ার করুন'}</span>
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="card" style={{ padding: '20px', borderRadius: '20px' }}>
          <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            {isEn ? 'Share Directly on Social Media' : 'সোশ্যাল মিডিয়ায় শেয়ার করুন'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {shareChannels.map((channel, idx) => (
              <a
                key={idx}
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '14px',
                  background: channel.bg,
                  textDecoration: 'none',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  minHeight: '48px',
                  boxSizing: 'border-box'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: channel.color }}>
                  {channel.name}
                </span>
              </a>
            ))}
          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
