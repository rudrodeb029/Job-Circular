import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from '../components/Icons';
import BottomNav from '../components/BottomNav';

export default function RateUs() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      navigate('/settings');
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div className="animate-scale-in">
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#e6fffa',
            color: '#319795',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            fontSize: '32px'
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Thank You!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Your feedback helps us grow.</p>
        </div>
      </div>
    );
  }

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
          Rate Us
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '20px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Enjoying the App?</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Tap a star to rate your experience and help others find us.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: s <= (hoverRating || rating) ? '#f59e0b' : 'var(--border)',
                  transition: 'all 0.2s ease',
                  transform: s <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                <Star size={40} fill={s <= (hoverRating || rating) ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
              WRITE A REVIEW (OPTIONAL)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you like or how we can improve..."
              style={{
                width: '100%',
                height: '120px',
                padding: '14px',
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
                background: 'var(--bg-secondary)',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="btn btn-primary btn-block"
            style={{
              marginTop: '24px',
              height: '52px',
              borderRadius: '16px',
              opacity: rating === 0 ? 0.6 : 1
            }}
          >
            Submit Feedback
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
