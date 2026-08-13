import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, Info } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function ContactUs() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      navigate('/settings');
    }, 2000);
  };

  return (
    <div className="page" style={{ background: 'var(--bg)' }}>
      {/* Modern Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #2563eb 100%)',
        padding: 'calc(var(--safe-area-top) + 14px) 20px 20px 20px',
        color: 'white',
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 8px 24px -4px rgba(26, 86, 219, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(8px)',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
          Contact Us
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '20px' }}>
        {submitted ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <Mail size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Message Sent!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>We'll get back to you within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', color: 'white', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Need Help?</h2>
              <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>
                Have questions or found a bug? Our support team is here to assist you.
              </p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>
                  📧 support@jobcircular.com
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card">
              <div className="input-group" style={{ marginBottom: '18px' }}>
                <label className="input-label">Subject / বিষয়</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <AlertCircle size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bug Report, Question..."
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="input"
                    style={{ paddingLeft: '42px', borderRadius: '14px' }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Message / বার্তা</label>
                <textarea
                  required
                  placeholder="Describe your issue or inquiry in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="input"
                  style={{ height: '140px', padding: '14px', borderRadius: '16px', resize: 'none' }}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ height: '52px', borderRadius: '16px', fontSize: '15px' }}>
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
