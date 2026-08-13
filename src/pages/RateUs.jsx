import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, CheckCircle, Award, ExternalLink } from '../components/Icons';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { getAppInfoConfig, DEFAULT_APP_INFO } from '../utils/appInfoService';
import { addDocument, COLLECTIONS } from '../services/firestoreService';

export default function RateUs() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [info, setInfo] = useState(DEFAULT_APP_INFO);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const data = await getAppInfoConfig();
        if (data) setInfo(data);
      } catch (err) {
        console.error('Failed to load Rate Us link:', err);
      }
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);

    try {
      // Save rating review to Firestore 'activities' or 'feedback'
      await addDocument(COLLECTIONS.ACTIVITIES, {
        type: 'app_rating_review',
        rating: rating,
        feedback: feedback || '',
        createdAt: new Date().toISOString()
      });

      // If user rated 4 or 5 stars, offer to open Google Play Store
      if (rating >= 4 && info.playStoreUrl) {
        window.open(info.playStoreUrl, '_blank');
      }

      setSubmitted(true);
      setTimeout(() => {
        navigate('/settings');
      }, 2500);
    } catch (err) {
      alert('Failed to submit rating: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPlayStore = () => {
    if (info.playStoreUrl) {
      window.open(info.playStoreUrl, '_blank');
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
          <Star size={18} color="#f59e0b" fill="#f59e0b" />
          <span>{isEn ? 'Rate Job Circular App' : 'অ্যাপ রেটিং দিন'}</span>
        </h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
        
        {/* Soft Pastel Rating Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.15)',
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 8px 20px rgba(245, 158, 11, 0.28)'
          }}>
            <Star size={34} color="#ffffff" fill="#ffffff" />
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {isEn ? 'Enjoying Job Circular BD?' : 'অ্যাপটি আপনার কেমন লাগছে?'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {isEn 
              ? 'Your ratings & reviews help millions of job seekers across Bangladesh find their dream careers.'
              : 'আপনার ১টি পজিটিভ রেটিং অন্য চাকরিপ্রার্থীদের সেরা তথ্য পেতে সাহায্য করে।'}
          </p>
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
              {isEn ? 'Thank You for Your Review!' : 'আপনার মতামতের জন্য ধন্যবাদ!'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              {isEn ? 'Your valuable feedback inspires us to keep growing.' : 'আপনার পজিটিভ রেটিং আমাদের সামনে এগিয়ে যেতে সাহায্য করে।'}
            </p>
          </div>
        ) : (
          <div className="card" style={{ padding: '24px 20px', borderRadius: '20px', textAlign: 'center' }}>
            
            {/* Interactive 5-Star Selection */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
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
                    transform: s <= (hoverRating || rating) ? 'scale(1.15)' : 'scale(1)'
                  }}
                >
                  <Star size={36} fill={s <= (hoverRating || rating) ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            {/* Optional Review Textarea */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                {isEn ? 'WRITE A SHORT REVIEW (OPTIONAL)' : 'আপনার মতামত লিখুন (ঐচ্ছিক)'}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isEn ? 'Tell us what you like or how we can improve...' : 'অ্যাপ সম্পর্কে আপনার পজিটিভ পরামর্শ বা মতামত লিখুন...'}
                style={{
                  width: '100%',
                  height: '100px',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)'
                }}
              >
                {submitting ? (isEn ? 'Submitting...' : 'জমা দেওয়া হচ্ছে...') : (isEn ? 'Submit Review' : 'রিভিউ জমা দিন')}
              </button>

              {info.playStoreUrl && (
                <button
                  onClick={handleOpenPlayStore}
                  type="button"
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '14px',
                    background: 'var(--white)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isEn ? 'Rate directly on Google Play Store' : 'প্লে স্টোরে রেটিং দিন'}</span>
                  <ExternalLink size={16} color="var(--primary)" />
                </button>
              )}
            </div>

          </div>
        )}

      </div>
      <BottomNav />
    </div>
  );
}
