import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Edit, FileText, MapPin, X } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { CLOUDINARY_CONFIG } from '../cloudinary';
import BottomNav from '../components/BottomNav';

const PhoneIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

function FormInput({ label, icon, type = 'text', value, onChange, placeholder, required = false }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
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
            padding: '12px 14px 12px 42px',
            fontSize: '14px',
            fontWeight: 600,
            background: isFocused ? 'var(--white)' : 'var(--bg-secondary)',
            border: isFocused ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
            borderRadius: '14px',
            color: 'var(--text-primary)',
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
    <div style={{ marginBottom: '18px' }}>
      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' }}>
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
          transition: 'color 0.2s',
          zIndex: 2
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
            padding: '12px 34px 12px 42px',
            fontSize: '14px',
            fontWeight: 600,
            background: isFocused ? 'var(--white)' : 'var(--bg-secondary)',
            border: isFocused ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
            borderRadius: '14px',
            color: 'var(--text-primary)',
            boxShadow: isFocused ? '0 8px 20px rgba(26, 86, 219, 0.08)' : 'none',
            transition: 'all 0.25s ease',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1
          }}
        >
          {children}
        </select>
        <div style={{
          position: 'absolute',
          right: '14px',
          color: isFocused ? 'var(--primary)' : '#94a3b8',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
          transform: isFocused ? 'rotate(180deg)' : 'none',
          zIndex: 2
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const isEn = state.language === 'en';

  const [formData, setFormData] = useState({
    name: state.user.name || '',
    phone: state.user.phone || '01712345678',
    qualification: state.user.qualification || 'স্নাতক (Bachelor)',
    location: state.user.location || 'ঢাকা',
    avatar: state.user.avatar || null
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

    if (!cloudName || !uploadPreset || cloudName === 'dqy39gghx') {
      alert('Cloudinary is not connected yet.');
      return;
    }

    setUploadingImage(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: data
      });
      const fileData = await res.json();
      if (fileData.secure_url) {
        setFormData(prev => ({ ...prev, avatar: fileData.secure_url }));
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: formData });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      navigate('/profile');
    }, 1200);
  };

  return (
    <div className="page" style={{ background: 'var(--bg)', paddingBottom: '90px' }}>
      {/* Modern Sticky Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 style={{ flex: 1 }}>{isEn ? 'Edit Profile' : 'প্রোফাইল পরিবর্তন'}</h1>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              position: 'relative',
              width: '96px',
              height: '96px',
              margin: '0 auto 12px auto'
            }}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--white)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    opacity: uploadingImage ? 0.5 : 1
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
                  fontSize: '34px',
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(26,86,219,0.2)',
                  opacity: uploadingImage ? 0.5 : 1
                }}>
                  {formData.name ? formData.name[0].toUpperCase() : 'U'}
                </div>
              )}

              {uploadingImage && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 800
                }}>
                  UPLOADING...
                </div>
              )}

              <label htmlFor="avatar-upload" style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '3px solid var(--white)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}>
                <Edit size={14} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {isEn ? 'Tap the icon to change photo' : 'ছবি পরিবর্তন করতে আইকনে ট্যাপ করুন'}
            </p>
          </div>

          {/* Form Fields */}
          <div className="card" style={{ padding: '20px', borderRadius: '20px' }}>
            <FormInput
              label={isEn ? 'Full Name' : 'পূর্ণ নাম'}
              icon={<User size={18} />}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isEn ? 'Enter your name' : 'আপনার নাম লিখুন'}
              required
            />

            <FormInput
              label={isEn ? 'Phone Number' : 'মোবাইল নম্বর'}
              icon={<PhoneIcon size={18} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={isEn ? 'Enter phone number' : 'মোবাইল নম্বর লিখুন'}
            />

            <FormSelect
              label={isEn ? 'Qualification' : 'শিক্ষাগত যোগ্যতা'}
              icon={<FileText size={18} />}
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
              label={isEn ? 'Location' : 'জেলা / অবস্থান'}
              icon={<MapPin size={18} />}
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="ঢাকা">Dhaka (ঢাকা)</option>
              <option value="চট্টগ্রাম">Chattogram (চট্টগ্রাম)</option>
              <option value="রাজশাহী">Rajshahi (রাজশাহী)</option>
              <option value="খুলনা">Khulna (খুলনা)</option>
              <option value="সিলেট">Sylhet (সিলেট)</option>
              <option value="বরিশাল">Barishal (বরিশাল)</option>
              <option value="রংপুর">Rangpur (রংপুর)</option>
              <option value="ময়মনসিংহ">Mymensingh (ময়মনসিংহ)</option>
            </FormSelect>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                background: savedSuccess ? '#10b981' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                height: '52px',
                borderRadius: '16px',
                fontSize: '15px',
                fontWeight: 800,
                boxShadow: savedSuccess ? '0 8px 20px rgba(16,185,129,0.3)' : '0 8px 20px rgba(26,86,219,0.3)'
              }}
            >
              {savedSuccess
                ? (isEn ? '✓ Profile Updated!' : '✓ সফলভাবে আপডেট হয়েছে!')
                : (isEn ? 'Save Profile Changes' : 'পরিবর্তন সংরক্ষণ করুন')}
            </button>
          </div>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
