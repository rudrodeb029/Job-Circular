import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, FileText, Share2, Star, Mail, Info, ChevronRight, X } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import EditProfileModal from '../components/EditProfileModal';
import Disclaimer from '../components/Disclaimer';

export default function Settings() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);
  
  // Rating Modal state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Contact Modal state
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Share state
  const [copied, setCopied] = useState(false);

  const items = [
    { icon: User, label: 'Account Settings', key: 'account' },
    { icon: Shield, label: 'Privacy Policy', key: 'privacy' },
    { icon: FileText, label: 'Terms & Conditions', key: 'terms' },
    { icon: Share2, label: 'Share App', key: 'share' },
    { icon: Star, label: 'Rate Us', key: 'rate' },
    { icon: Mail, label: 'Contact Us', key: 'contact' },
    { icon: Info, label: 'About App', key: 'about' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://jobcircular.app/download');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingSubmitted(false);
      setRating(0);
      setRatingFeedback('');
      setActiveModal(null);
    }, 2000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactSubject || !contactMessage) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactSubject('');
      setContactMessage('');
      setActiveModal(null);
    }, 2000);
  };

  return (
    <div className="page" style={{ position: 'relative' }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1>Settings</h1>
      </div>

      <div className="page-content">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <div 
              key={i} 
              className="menu-item"
              onClick={() => setActiveModal(item.key)}
              style={{ cursor: 'pointer' }}
            >
              <div className="menu-item-icon">
                <item.icon size={20} />
              </div>
              <span className="menu-item-label">{item.label}</span>
              <ChevronRight size={18} className="menu-item-arrow" />
            </div>
          ))}
        </div>

        <p className="text-center text-muted" style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--text-sm)' }}>
          App Version 1.0.0
        </p>
      </div>

      {/* 1. Account Settings Modal */}
      <EditProfileModal 
        isOpen={activeModal === 'account'} 
        onClose={() => setActiveModal(null)} 
      />

      {/* 2. Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Privacy Policy / গোপনীয়তা নীতি</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>1. Data Collection / তথ্য সংগ্রহ</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                We collect your profile details (name, email, educational qualification, and target job category) locally to personalize your job feed and matching alerts.
                <br />
                আমরা আপনার প্রোফাইলের বিবরণ (নাম, ইমেল, শিক্ষাগত যোগ্যতা এবং লক্ষ্যযুক্ত চাকুরির ক্যাটাগরি) আপনার জন্য উপযুক্ত চাকুরির খবর দেখানোর জন্য সংরক্ষণ করি।
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>2. Permissions / পারমিশন</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                The app requests storage permissions to allow downloading circular images, and notification permissions to alert you about new jobs and upcoming deadlines.
                <br />
                চাকুরির বিজ্ঞপ্তির ছবি ডাউনলোড করার জন্য স্টোরেজ পারমিশন এবং নতুন চাকুরির অ্যালার্ট পাওয়ার জন্য নোটিফিকেশন পারমিশন প্রয়োজন।
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>3. Security / নিরাপত্তা</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                Your data is stored securely in local storage and is never shared with third parties.
                <br />
                আপনার তথ্য সম্পূর্ণ সুরক্ষিত রাখা হয় এবং কোনো তৃতীয় পক্ষের সাথে শেয়ার করা হয় না।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Terms & Conditions / ব্যবহারের শর্তাবলী</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>1. Disclaimer / সাধারণ নিয়মাবলি</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                Job Circular aggregates job posts from government gazettes, corporate sites, and newspapers. Candidates are advised to verify details with official sources before submitting applications.
                <br />
                জব সার্কুলার অ্যাপের তথ্যসমূহ সরকারি গেজেট ও বিভিন্ন বিশ্বস্ত সূত্র থেকে নেওয়া হয়। আবেদনের পূর্বে মূল বিজ্ঞপ্তি ভালোভাবে যাচাই করে নেওয়ার অনুরোধ রইল।
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>2. User Obligations / ব্যবহারকারীর দায়িত্ব</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                You must provide accurate profile details to get relevant notifications. Any misuse of links, templates, or automated query generation is strictly prohibited.
                <br />
                সঠিক নোটিফিকেশন পেতে আপনার প্রোফাইলে সঠিক তথ্য প্রদান করুন। আমাদের চাকুরির লিঙ্ক বা ছবিগুলোর কোনো প্রকার বাণিজ্যিক অপব্যবহার নিষিদ্ধ।
              </p>

              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>3. Limitation of Liability / দায়বদ্ধতার সীমাবদ্ধতা</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                We are not responsible for any issues arising from delayed applications, technical errors on official apply sites, or changes in circular deadlines.
                <br />
                অফিসিয়াল ওয়েবসাইটের কোনো সমস্যা বা চাকুরির ডেডলাইন পরিবর্তনের জন্য জব সার্কুলার অ্যাপ কর্তৃপক্ষ দায়ী থাকবে না।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Share App Modal */}
      {activeModal === 'share' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Share App / অ্যাপ শেয়ার করুন</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ ...modalBodyStyle, textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Help your friends find their dream job by sharing this app!
                <br />
                বন্ধুদের সাথে অ্যাপটি শেয়ার করে তাদের ক্যারিয়ার গঠনে সাহায্য করুন।
              </p>

              {/* Link copy section */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border-light)',
                borderRadius: '12px',
                padding: '8px 12px',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  https://jobcircular.app/download
                </span>
                <button 
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#10b981' : 'var(--primary)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    minWidth: '70px'
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Social sharing icons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={shareIconWrapperStyle}>
                  <div style={{ ...shareIconStyle, background: '#e7f3ff', color: '#1877f2' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <span style={shareLabelStyle}>Facebook</span>
                </div>
                <div style={shareIconWrapperStyle}>
                  <div style={{ ...shareIconStyle, background: '#e8f7ed', color: '#25d366' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <span style={shareLabelStyle}>WhatsApp</span>
                </div>
                <div style={shareIconWrapperStyle}>
                  <div style={{ ...shareIconStyle, background: '#e8f2fe', color: '#1da1f2' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                  </div>
                  <span style={shareLabelStyle}>Twitter</span>
                </div>
                <div style={shareIconWrapperStyle}>
                  <div style={{ ...shareIconStyle, background: '#fef3e7', color: '#ff9900' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <span style={shareLabelStyle}>Email</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Rate Us Modal */}
      {activeModal === 'rate' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Rate Us / রেটিং দিন</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              {ratingSubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#e6fffa',
                    color: '#319795',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '28px'
                  }}>
                    ✓
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Thank you!
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Your feedback helps us make the app better.
                    <br />
                    আপনার মূল্যবান মতামতের জন্য ধন্যবাদ!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRatingSubmit} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    How would you rate your experience with Job Circular?
                    <br />
                    জব সার্কুলার অ্যাপ সম্পর্কে আপনার অভিজ্ঞতা কেমন?
                  </p>
                  
                  {/* Rating Stars */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: star <= (hoverRating || rating) ? '#f59e0b' : '#e2e8f0',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Feedback Textarea */}
                  <div className="input-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                    <label className="input-label">Tell us more (Optional) / বিস্তারিত লিখুন</label>
                    <textarea
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      placeholder="Share your suggestions or details of your experience..."
                      className="input"
                      style={{ height: '80px', resize: 'none', padding: '10px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    disabled={rating === 0}
                    style={{ opacity: rating === 0 ? 0.6 : 1 }}
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Contact Us Modal */}
      {activeModal === 'contact' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>Contact Us / যোগাযোগ করুন</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              {contactSubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#e0f2fe',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    fontSize: '28px'
                  }}>
                    ✓
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Message Sent!
                  </h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Thank you! We will get back to you within 24 hours.
                    <br />
                    আপনার বার্তা পাঠানো হয়েছে! ২৪ ঘণ্টার মধ্যে যোগাযোগ করা হবে।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                    Have any questions, bugs to report, or business inquiries? Write us below or email: <strong>support@jobcircular.com</strong>
                  </p>

                  <div className="input-group" style={{ marginBottom: '14px' }}>
                    <label className="input-label">Subject / বিষয়</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="e.g. Bug Report, Question..."
                      className="input"
                      required
                    />
                  </div>

                  <div className="input-group" style={{ marginBottom: '20px' }}>
                    <label className="input-label">Message / বার্তা</label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message here..."
                      className="input"
                      style={{ height: '100px', resize: 'none' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. About App Modal */}
      {activeModal === 'about' && (
        <div 
          style={modalOverlayStyle} 
          onClick={() => setActiveModal(null)}
        >
          <div 
            style={modalContentStyle} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <h3 style={modalTitleStyle}>About App / অ্যাপ সম্পর্কে</h3>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={modalBodyStyle}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
                  borderRadius: '18px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 8px 16px rgba(26,86,219,0.2)'
                }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Job Circular
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Version 1.0.0 (Build 2026.07)
                </p>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Job Circular</strong> is Bangladesh's premier platform offering up-to-the-minute recruitment notices from the Government, Banks, NGOs, and the Private Sector.
                </p>
                <p style={{ marginBottom: '16px' }}>
                  জব সার্কুলার অ্যাপের মাধ্যমে সকল সরকারি চাকরি, ব্যাংকের চাকরি, প্রাইভেট সেক্টরের নিয়োগ এবং বিভিন্ন গুরুত্বপূর্ণ পরীক্ষার প্রবেশপত্র ও ফলাফল পাবেন সবার আগে, এক জায়গায়।
                </p>
                
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '12px'
                }}>
                  <h5 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Key Features:</h5>
                  <ul style={{ paddingLeft: '16px', listStyleType: 'disc' }}>
                    <li style={{ marginBottom: '4px' }}>Real-time push alerts for new circulars</li>
                    <li style={{ marginBottom: '4px' }}>Download notices offline with 1-click</li>
                    <li style={{ marginBottom: '4px' }}>Interactive sector-wise search filters</li>
                    <li>Built-in candidate profile management</li>
                  </ul>
                </div>
                <Disclaimer />
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// Inline Styles for Modals
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 250,
  background: 'rgba(15, 23, 42, 0.4)',
  backdropFilter: 'blur(6px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '400px',
  maxHeight: '85vh',
  background: 'var(--white)',
  borderRadius: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'scaleIn 0.25s ease'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid var(--border-light)',
  background: 'var(--white)'
};

const modalTitleStyle = {
  fontSize: '15px',
  fontWeight: 800,
  color: 'var(--text-secondary)',
  background: 'rgba(26, 86, 219, 0.04)',
  borderLeft: '4px solid var(--primary)',
  padding: '4px 12px',
  borderRadius: '6px',
  margin: 0
};

const closeBtnStyle = {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  background: 'var(--white)',
  border: '1.5px solid var(--border-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
};

const modalBodyStyle = {
  padding: '20px',
  overflowY: 'auto'
};

const shareIconWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer'
};

const shareIconStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
};

const shareLabelStyle = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary)'
};
