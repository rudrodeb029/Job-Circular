import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, Phone, MessageSquare, CheckCircle, Globe } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { getAppInfoConfig, DEFAULT_APP_INFO } from '../utils/appInfoService';
import { addDocument, COLLECTIONS } from '../services/supabaseService';

export default function ContactUs() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [info, setInfo] = useState(DEFAULT_APP_INFO);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getAppInfoConfig();
        if (data) setInfo(data);
      } catch (err) {
        console.error('Failed to load contact info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Write user feedback message to Firestore 'activities' or 'feedback' collection
      await addDocument(COLLECTIONS.ACTIVITIES, {
        type: 'contact_message',
        action: 'Support Message Received',
        userName: formData.name || 'Anonymous User',
        description: `Subject: ${formData.subject}. Message: ${formData.message}`,
        email: formData.email || 'N/A',
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/settings');
      }, 2500);
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page" style={{ paddingBottom: '100px', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1, fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={18} color="var(--primary)" />
          <span>{isEn ? 'Contact & Help Center' : 'যোগাযোগ ও সাপোর্ট'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Dynamic Contact Banner Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {isEn ? 'Need Help or Support?' : 'যেকোনো প্রয়োজনে যোগাযোগ করুন'}
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {isEn 
              ? 'Have questions about job notices, found a issue, or need technical help? Contact our support team below.'
              : 'চাকরির সার্কুলার, পরীক্ষার তারিখ বা কোনো সমস্যায় আমাদের সাপোর্ট টিমের সাথে কথা বলুন।'}
          </p>

          {/* Quick Connect Badges */}
          <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <a 
              href={`mailto:${info.contactEmail}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--white)',
                border: '1px solid var(--border)',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              <Mail size={14} color="var(--primary)" />
              <span>{info.contactEmail}</span>
            </a>
          </div>
        </div>

        {submitted ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <CheckCircle size={36} color="#059669" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isEn ? 'Message Sent Successfully!' : 'বার্তা সফলভাবে পাঠানো হয়েছে!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              {isEn ? 'Thank you! Our support team will review your query shortly.' : 'ধন্যবাদ! আমাদের সাপোর্ট টিম শীঘ্রই আপনার বার্তার উত্তর দেবে।'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card" style={{ borderRadius: '20px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
              {isEn ? 'Send Us a Direct Message' : 'সরাসরি মেসেজ পাঠান'}
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                আপনার নাম
              </label>
              <input
                type="text"
                placeholder={isEn ? 'Enter your name' : 'আপনার পুরো নাম লিখুন'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  fontSize: '13px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                ইমেইল এড্রেস
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  fontSize: '13px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                বিষয় *
              </label>
              <input
                type="text"
                required
                placeholder={isEn ? 'e.g. Bug report, Suggestion, Help...' : 'যেমন: বিষয়, সমস্যা বা মতামত...'}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  fontSize: '13px',
                  outline: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                বার্তা *
              </label>
              <textarea
                required
                placeholder={isEn ? 'Type your detailed message here...' : 'আপনার বার্তা বিস্তারিত লিখুন...'}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  fontSize: '13px',
                  outline: 'none',
                  resize: 'none',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(26, 86, 219, 0.2)'
              }}
            >
              {submitting ? (isEn ? 'Sending...' : 'পাঠানো হচ্ছে...') : (isEn ? 'Send Message' : 'বার্তা পাঠান')}
            </button>
          </form>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
