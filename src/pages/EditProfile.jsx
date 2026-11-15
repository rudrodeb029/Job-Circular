import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CLOUDINARY_CONFIG } from '../cloudinary';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import { compressImageFile } from '../utils/mediaUtils';

// Precise custom SVG icons matching the mockup
const ChevronLeftIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const PencilIcon = ({ size = 13, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const MailIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const GlobeIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const PhoneIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const CalendarIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

function CleanField({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  errorText = '',
  isDark = false,
  required = false
}) {
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorText);

  let borderColor = isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0';
  if (hasError) {
    borderColor = '#f87171';
  } else if (isFocused) {
    borderColor = '#14b8a6';
  }

  const bg = isDark ? 'rgba(30, 41, 59, 0.7)' : '#fcfbfc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={{
        fontSize: '13px',
        fontWeight: 600,
        color: isDark ? '#e2e8f0' : '#1e293b',
        marginBottom: '6px'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '14px',
            color: hasError ? '#ef4444' : (isFocused ? '#14b8a6' : '#64748b'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'color 0.2s ease',
            zIndex: 2
          }}>
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            height: '46px',
            paddingLeft: icon ? '44px' : '14px',
            paddingRight: '14px',
            fontSize: '14px',
            fontWeight: 500,
            color: isDark ? '#f8fafc' : '#0f172a',
            background: bg,
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            outline: 'none',
            boxShadow: hasError
              ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
              : (isFocused ? '0 0 0 3px rgba(20, 184, 166, 0.12)' : 'none'),
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        />
      </div>
      {hasError && (
        <span style={{
          fontSize: '11.5px',
          fontWeight: 500,
          color: '#ef4444',
          marginTop: '4px',
          marginLeft: '2px'
        }}>
          {errorText}
        </span>
      )}
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const isDark = state.theme === 'dark';
  const isEn = state.language === 'en';

  const defaultUsername = state.user?.username || (state.user?.name ? `@${state.user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : '@');

  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    username: defaultUsername,
    email: state.user?.email || '',
    website: state.user?.website || '',
    phone: state.user?.phone || '',
    dob: state.user?.dob || '',
    avatar: state.user?.avatar || null,
    // Preserve existing fields for backward compatibility
    coverPhoto: state.user?.coverPhoto || null,
    bio: state.user?.bio || '',
    qualification: state.user?.qualification || '',
    location: state.user?.location || ''
  });

  const [usernameError, setUsernameError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'username') {
      if (value.includes(' ')) {
        setUsernameError(isEn ? 'Username cannot contain spaces' : 'ইউজারনেমে স্পেস থাকতে পারবে না');
      } else {
        setUsernameError('');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const cloudName = CLOUDINARY_CONFIG?.cloudName;
      const uploadPreset = CLOUDINARY_CONFIG?.uploadPreset;

      if (cloudName && uploadPreset && cloudName !== 'dqy39gghx') {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: data
        });
        const fileData = await res.json();
        if (fileData.secure_url) {
          const optimizedUrl = optimizeCloudinaryUrl(fileData.secure_url);
          setFormData(prev => ({ ...prev, avatar: optimizedUrl }));
          return;
        }
      }
      const dataUrl = await compressImageFile(file, 400, 0.85);
      setFormData(prev => ({ ...prev, avatar: dataUrl }));
    } catch (err) {
      console.error(err);
      try {
        const dataUrl = await compressImageFile(file, 400, 0.85);
        setFormData(prev => ({ ...prev, avatar: dataUrl }));
      } catch (fallbackErr) {
        alert('Upload failed: ' + err.message);
      }
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
      navigate(-1);
    }, 700);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark ? '#0f172a' : '#ffffff',
      color: isDark ? '#f8fafc' : '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Top Header Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: isDark ? '#0f172a' : '#ffffff',
        padding: 'calc(var(--safe-area-top, 0px) + 12px) 16px 12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f8fafc'
      }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            background: 'none',
            border: 'none',
            padding: '6px',
            color: isDark ? '#f8fafc' : '#0f172a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
        >
          <ChevronLeftIcon size={24} />
        </button>

        <h1 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: isDark ? '#f8fafc' : '#0f172a',
          margin: 0,
          letterSpacing: '-0.2px'
        }}>
          Edit Profile
        </h1>

        {/* Placeholder to balance back button */}
        <div style={{ width: '36px' }} />
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px 110px 20px',
        flex: 1
      }}>
        <form id="edit-profile-form" onSubmit={handleSubmit}>
          {/* Centered Circular Avatar with Teal Border and Floating Badge */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            marginBottom: '28px'
          }}>
            <div style={{
              position: 'relative',
              width: '116px',
              height: '116px'
            }}>
              {/* Avatar circle */}
              <div
                onClick={() => document.getElementById('avatar-file-input')?.click()}
                style={{
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  border: '2.5px solid #14b8a6',
                  overflow: 'hidden',
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.15)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt="Profile"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: uploadingImage ? 0.4 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0f766e',
                    fontSize: '38px',
                    fontWeight: 700
                  }}>
                    {formData.name ? formData.name[0].toUpperCase() : 'U'}
                  </div>
                )}

                {/* Uploading Spinner Overlay */}
                {uploadingImage && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    ...
                  </div>
                )}
              </div>

              {/* Floating Teal Edit Pencil Badge */}
              <label
                htmlFor="avatar-file-input"
                style={{
                  position: 'absolute',
                  bottom: '3px',
                  right: '3px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#14b8a6',
                  border: isDark ? '2.5px solid #0f172a' : '2.5px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.15s ease'
                }}
                title="Change Photo"
              >
                <PencilIcon size={12} color="#ffffff" />
              </label>

              {/* Hidden File Input */}
              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Form Fields Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Full Name */}
            <CleanField
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Ahmed Marwan"
              isDark={isDark}
              required
            />

            {/* 2. Username */}
            <CleanField
              label="Username"
              value={formData.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              placeholder="@ahhmedd123"
              errorText={usernameError}
              isDark={isDark}
            />

            {/* 3. E-mail */}
            <CleanField
              label="E-mail"
              icon={<MailIcon size={17} />}
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              placeholder="example123@gmail.com"
              isDark={isDark}
            />

            {/* 4. Website */}
            <CleanField
              label="Website"
              icon={<GlobeIcon size={17} />}
              type="text"
              value={formData.website}
              onChange={(e) => handleFieldChange('website', e.target.value)}
              placeholder="www.example123.com"
              isDark={isDark}
            />

            {/* 5. Phone */}
            <CleanField
              label="Phone"
              icon={<PhoneIcon size={17} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder="+20100******"
              isDark={isDark}
            />

            {/* 6. Date of birth */}
            <CleanField
              label="Date of birth"
              icon={<CalendarIcon size={17} />}
              type="text"
              value={formData.dob}
              onChange={(e) => handleFieldChange('dob', e.target.value)}
              placeholder="08/10/2000"
              isDark={isDark}
            />
          </div>
        </form>
      </div>

      {/* Fixed Bottom Save Button Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: isDark ? '#0f172a' : '#ffffff',
        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
        padding: '12px 20px calc(var(--safe-area-bottom, 0px) + 14px) 20px',
        zIndex: 50,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ maxWidth: '460px', margin: '0 auto', width: '100%' }}>
          <button
            type="submit"
            form="edit-profile-form"
            disabled={uploadingImage}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '10px',
              background: savedSuccess ? '#0d9488' : '#136368',
              color: '#ffffff',
              fontSize: '15.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(19, 99, 104, 0.28)',
              transition: 'all 0.2s ease'
            }}
          >
            {savedSuccess ? '✓ Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
