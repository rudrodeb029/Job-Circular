import React, { useState } from 'react';
import { X, User, Edit, Mail, FileText, Globe, MapPin } from './Icons';
import { useAppContext } from '../context/AppContext';

const PhoneIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

function FormInput({ label, icon, type = 'text', value, onChange, placeholder, required = false }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          left: '14px',
          color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'color 0.2s'
        }}>
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 14px 12px 40px',
            fontSize: '13px',
            fontWeight: 600,
            background: isFocused ? 'var(--white)' : '#f8fafc',
            border: isFocused ? '1.5px solid var(--primary)' : '1.5px solid #e2e8f0',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            boxShadow: isFocused ? '0 0 0 4px rgba(26, 86, 219, 0.08)' : 'none',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}

function FormSelect({ label, icon, value, onChange, children }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          left: '14px',
          color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'color 0.2s'
        }}>
          {icon}
        </div>
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '12px 34px 12px 40px',
            fontSize: '13px',
            fontWeight: 600,
            background: isFocused ? 'var(--white)' : '#f8fafc',
            border: isFocused ? '1.5px solid var(--primary)' : '1.5px solid #e2e8f0',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            boxShadow: isFocused ? '0 0 0 4px rgba(26, 86, 219, 0.08)' : 'none',
            transition: 'all 0.2s',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            backgroundSize: '14px'
          }}
        >
          {children}
        </select>
      </div>
    </div>
  );
}

export default function EditProfileModal({ isOpen, onClose }) {
  const { state, dispatch } = useAppContext();
  const isEn = state.language === 'en';

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
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          maxHeight: '90vh',
          background: 'var(--white)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--white)'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            background: 'rgba(26, 86, 219, 0.04)',
            borderLeft: '4px solid var(--primary)',
            padding: '4px 12px',
            borderRadius: '6px',
            margin: 0
          }}>
            {isEn ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
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
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content / Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Avatar Upload Section */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{
              position: 'relative',
              width: '84px',
              height: '84px',
              margin: '0 auto 8px auto'
            }}>
              {/* Outer Decorative Ring */}
              <div style={{
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                borderRadius: '50%',
                border: '2px dashed var(--primary)',
                opacity: 0.35
              }}></div>

              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile Avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--white)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(26,86,219,0.2)'
                }}>
                  {formData.name ? formData.name[0] : 'S'}
                </div>
              )}

              {/* Upload Trigger Camera Badge */}
              <label htmlFor="avatar-upload-input" style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px solid var(--white)',
                boxShadow: '0 2px 8px rgba(26,86,219,0.35)'
              }}>
                <Edit size={12} />
              </label>
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 700, margin: 0 }}>
              {isEn ? 'Click pencil icon to upload profile photo' : 'পেন্সিল আইকন ক্লিক করে ছবি পরিবর্তন করুন'}
            </p>
          </div>

          {/* Form Input Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <FormInput
              label={isEn ? 'Full Name' : 'পূর্ণ নাম'}
              icon={<User size={16} />}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isEn ? 'Enter full name' : 'আপনার নাম লিখুন'}
              required
            />

            <FormInput
              label={isEn ? 'Email Address' : 'ইমেইল ঠিকানা'}
              icon={<Mail size={16} />}
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={isEn ? 'Enter email address' : 'ইমেইল ঠিকানা লিখুন'}
              required
            />

            <FormInput
              label={isEn ? 'Phone Number' : 'মোবাইল নম্বর'}
              icon={<PhoneIcon size={16} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={isEn ? 'Enter phone number' : 'মোবাইল নম্বর লিখুন'}
            />

            <FormSelect
              label={isEn ? 'Education Qualification' : 'শিক্ষাগত যোগ্যতা'}
              icon={<FileText size={16} />}
              value={formData.qualification}
              onChange={(e) => handleChange('qualification', e.target.value)}
            >
              <option value="স্নাতক (Bachelor)">{isEn ? 'Bachelor (স্নাতক)' : 'স্নাতক (Bachelor)'}</option>
              <option value="স্নাতকোত্তর (Master)">{isEn ? 'Master (স্নাতকোত্তর)' : 'স্নাতকোত্তর (Master)'}</option>
              <option value="এইচএসসি (HSC)">{isEn ? 'HSC (এইচএসসি)' : 'এইচএসসি (HSC)'}</option>
              <option value="এসএসসি (SSC)">{isEn ? 'SSC (এসএসসি)' : 'এসএসসি (SSC)'}</option>
              <option value="ডিপ্লোমা (Diploma)">{isEn ? 'Diploma (ডিপ্লোমা)' : 'ডিপ্লোমা (Diploma)'}</option>
            </FormSelect>

            <FormSelect
              label={isEn ? 'City / Location' : 'জেলা / অবস্থান'}
              icon={<MapPin size={16} />}
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="ঢাকা">{isEn ? 'Dhaka (ঢাকা)' : 'ঢাকা (Dhaka)'}</option>
              <option value="চট্টগ্রাম">{isEn ? 'Chattogram (চট্টগ্রাম)' : 'চট্টগ্রাম (Chattogram)'}</option>
              <option value="রাজশাহী">{isEn ? 'Rajshahi (রাজশাহী)' : 'রাজশাহী (Rajshahi)'}</option>
              <option value="খুলনা">{isEn ? 'Khulna (খুলনা)' : 'খুলনা (Khulna)'}</option>
              <option value="সিলেট">{isEn ? 'Sylhet (সিলেট)' : 'সিলেট (Sylhet)'}</option>
              <option value="বরিশাল">{isEn ? 'Barishal (বরিশাল)' : 'বরিশাল (Barishal)'}</option>
              <option value="রংপুর">{isEn ? 'Rangpur (রংপুর)' : 'রংপুর (Rangpur)'}</option>
              <option value="ময়মনসিংহ">{isEn ? 'Mymensingh (ময়মনসিংহ)' : 'ময়মনসিংহ (Mymensingh)'}</option>
            </FormSelect>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                background: savedSuccess ? '#10b981' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                boxShadow: savedSuccess ? '0 4px 14px rgba(16,185,129,0.3)' : '0 4px 14px rgba(26,86,219,0.2)',
                transition: 'all 0.3s ease'
              }}
            >
              {savedSuccess 
                ? (isEn ? '✓ Profile Saved!' : '✓ সফলভাবে সংরক্ষণ করা হয়েছে!') 
                : (isEn ? 'Save Profile Changes' : 'পরিবর্তন সংরক্ষণ করুন')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
