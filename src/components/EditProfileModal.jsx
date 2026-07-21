import React, { useState } from 'react';
import { X, User, Edit } from './Icons';
import { useAppContext } from '../context/AppContext';

export default function EditProfileModal({ isOpen, onClose }) {
  const { state, dispatch } = useAppContext();

  const [formData, setFormData] = useState({
    name: state.user.name || '',
    email: state.user.email || '',
    phone: state.user.phone || '01712345678',
    qualification: state.user.qualification || 'স্নাতক (Bachelor)',
    category: state.user.category || 'gov',
    location: state.user.location || 'ঢাকা',
    avatar: state.user.avatar || null
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: formData });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 250,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '90vh',
          background: 'var(--white)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.25s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-secondary)'
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Edit Profile
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--white)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Avatar Upload Section */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              position: 'relative',
              width: '90px',
              height: '90px',
              margin: '0 auto 10px auto'
            }}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    boxShadow: '0 4px 14px rgba(26,86,219,0.25)'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '34px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(26,86,219,0.25)'
                }}>
                  {formData.name ? formData.name[0] : 'S'}
                </div>
              )}

              {/* Upload Trigger Camera Badge */}
              <label htmlFor="avatar-upload-input" style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                <Edit size={14} />
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Click pencil icon to upload profile photo
            </p>
          </div>

          {/* Form Input Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="input"
                placeholder="Enter full name"
              />
            </div>

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="input"
                placeholder="Enter email address"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input"
                placeholder="Enter phone number"
              />
            </div>

            {/* Qualification Select */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Education Qualification
              </label>
              <select
                value={formData.qualification}
                onChange={(e) => handleChange('qualification', e.target.value)}
                className="input select"
              >
                <option value="স্নাতক (Bachelor)">স্নাতক (Bachelor)</option>
                <option value="স্নাতকোত্তর (Master)">স্নাতকোত্তর (Master)</option>
                <option value="এইচএসসি (HSC)">এইচএসসি (HSC)</option>
                <option value="এসএসসি (SSC)">এসএসসি (SSC)</option>
                <option value="ডিপ্লোমা (Diploma)">ডিপ্লোমা (Diploma)</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                City / Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input select"
              >
                <option value="ঢাকা">ঢাকা (Dhaka)</option>
                <option value="চট্টগ্রাম">চট্টগ্রাম (Chattogram)</option>
                <option value="রাজশাহী">রাজশাহী (Rajshahi)</option>
                <option value="খুলনা">খুলনা (Khulna)</option>
                <option value="সিলেট">সিলেট (Sylhet)</option>
                <option value="বরিশাল">বরিশাল (Barishal)</option>
                <option value="রংপুর">রংপুর (Rangpur)</option>
                <option value="ময়মনসিংহ">ময়মনসিংহ (Mymensingh)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              style={{
                background: savedSuccess ? '#10b981' : 'var(--primary)',
                boxShadow: savedSuccess ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 14px rgba(26,86,219,0.35)',
                transition: 'all 0.3s ease'
              }}
            >
              {savedSuccess ? '✓ Profile Saved Successfully!' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
