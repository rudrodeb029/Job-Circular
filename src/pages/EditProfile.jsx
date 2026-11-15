import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CLOUDINARY_CONFIG } from '../cloudinary';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import { compressImageFile } from '../utils/mediaUtils';

// Precise custom SVG icons matching the reference design style
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

const UserIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const FileTextIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const GraduationCapIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const MapPinIcon = ({ size = 17, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CameraIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// Clean styled form field matching the mockup
function CleanField({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  isDark = false,
  required = false
}) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused ? '#14b8a6' : (isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0');
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
            color: isFocused ? '#14b8a6' : '#64748b',
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
            boxShadow: isFocused ? '0 0 0 3px rgba(20, 184, 166, 0.12)' : 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
          }}
        />
      </div>
    </div>
  );
}

// Clean Dropdown selector styled in the exact same style
function CleanSelect({
  label,
  icon,
  value,
  onChange,
  options = [],
  placeholder = '',
  isDark = false
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Match selected option by value, English label, or partial text
  const selectedOption = options.find(opt => 
    opt.value === value || 
    (value && opt.labelEn && opt.labelEn.toLowerCase() === value.toLowerCase()) ||
    (value && opt.label && (opt.label === value || opt.label.includes(value) || value.includes(opt.label)))
  );

  const displayLabel = selectedOption
    ? (selectedOption.labelEn || selectedOption.label)
    : (value || placeholder);

  const bg = isDark ? 'rgba(30, 41, 59, 0.7)' : '#fcfbfc';
  const borderColor = isOpen ? '#14b8a6' : (isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0');

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

      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '46px',
          paddingLeft: '44px',
          paddingRight: '36px',
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '10px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(20, 184, 166, 0.12)' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          left: '14px',
          color: isOpen ? '#14b8a6' : '#64748b',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {icon}
        </div>

        <span style={{
          fontSize: '14px',
          fontWeight: selectedOption || value ? 500 : 400,
          color: (selectedOption || value) ? (isDark ? '#f8fafc' : '#0f172a') : '#94a3b8',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1
        }}>
          {displayLabel}
        </span>

        <div style={{
          position: 'absolute',
          right: '12px',
          color: isOpen ? '#14b8a6' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'none'
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Modern Curved Modal Sheet for Options */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: '70vh',
              background: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '20px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? '#0f172a' : '#f8fafc'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
                {label}
              </h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                  border: 'none',
                  color: isDark ? '#cbd5e1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '13px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Options List */}
            <div style={{
              padding: '12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '52vh'
            }}>
              {/* Optional Reset Option */}
              <div
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  background: value === '' ? (isDark ? 'rgba(20, 184, 166, 0.15)' : '#ccfbf1') : 'transparent',
                  color: value === '' ? '#0f766e' : (isDark ? '#94a3b8' : '#64748b'),
                  border: value === '' ? '1.5px solid #14b8a6' : (isDark ? '1px dashed rgba(255, 255, 255, 0.1)' : '1px dashed #e2e8f0'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s'
                }}
              >
                <span>None / Clear</span>
                {value === '' && <span style={{ fontWeight: 800, color: '#14b8a6' }}>✓</span>}
              </div>

              {options.map((opt) => {
                const isSelected = value === opt.value || (value && opt.labelEn && opt.labelEn.toLowerCase() === value.toLowerCase());
                const itemLabel = opt.labelEn ? `${opt.labelEn} (${opt.label})` : opt.label;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.labelEn || opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      background: isSelected
                        ? (isDark ? 'rgba(20, 184, 166, 0.2)' : '#f0fdfa')
                        : (isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc'),
                      color: isSelected ? '#14b8a6' : (isDark ? '#f8fafc' : '#0f172a'),
                      border: isSelected ? '1.5px solid #14b8a6' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{itemLabel}</span>
                    {isSelected && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#14b8a6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 800
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const isDark = state.theme === 'dark';

  // Keep ALL original user profile data intact
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    phone: state.user?.phone || '',
    bio: state.user?.bio || '',
    qualification: state.user?.qualification || '',
    location: state.user?.location || '',
    avatar: state.user?.avatar || null,
    coverPhoto: state.user?.coverPhoto || null
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Qualification Options (English primary)
  const qualificationOptions = [
    { value: 'Bachelor (স্নাতক)', label: 'স্নাতক', labelEn: 'Bachelor' },
    { value: 'Master (স্নাতকোত্তর)', label: 'স্নাতকোত্তর', labelEn: 'Master' },
    { value: 'HSC (এইচএসসি)', label: 'এইচএসসি', labelEn: 'HSC' },
    { value: 'SSC (এসএসসি)', label: 'এসএসসি', labelEn: 'SSC' },
    { value: 'Diploma (ডিপ্লোমা)', label: 'ডিপ্লোমা', labelEn: 'Diploma' }
  ];

  // Location / District Options (English primary)
  const locationOptions = [
    { value: 'Dhaka', label: 'ঢাকা', labelEn: 'Dhaka' },
    { value: 'Chattogram', label: 'চট্টগ্রাম', labelEn: 'Chattogram' },
    { value: 'Rajshahi', label: 'রাজশাহী', labelEn: 'Rajshahi' },
    { value: 'Khulna', label: 'খুলনা', labelEn: 'Khulna' },
    { value: 'Sylhet', label: 'সিলেট', labelEn: 'Sylhet' },
    { value: 'Barishal', label: 'বরিশাল', labelEn: 'Barishal' },
    { value: 'Rangpur', label: 'রংপুর', labelEn: 'Rangpur' },
    { value: 'Mymensingh', label: 'ময়মনসিংহ', labelEn: 'Mymensingh' }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      if (e.target) e.target.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const dataUrl = await compressImageFile(file, 960, 0.8);
      setFormData(prev => ({ ...prev, coverPhoto: dataUrl }));
    } catch (err) {
      console.error(err);
      alert('Cover upload failed');
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
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
      {/* Top Header Bar matching the reference mockup */}
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

        {/* Header Title (Always English) */}
        <h1 style={{
          fontSize: '17px',
          fontWeight: 700,
          color: isDark ? '#f8fafc' : '#0f172a',
          margin: 0,
          letterSpacing: '-0.2px'
        }}>
          Edit Profile
        </h1>

        {/* Cover Photo Camera Button */}
        <label
          htmlFor="cover-file-input"
          title="Change Cover Photo"
          style={{
            padding: '6px',
            borderRadius: '50%',
            color: isDark ? '#cbd5e1' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <CameraIcon size={20} />
        </label>
        <input
          id="cover-file-input"
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          disabled={uploadingCover}
          style={{ display: 'none' }}
        />
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px',
        flex: 1
      }}>
        <form id="edit-profile-form" onSubmit={handleSubmit}>

          {/* ═════ Visible Cover Photo Banner ═════ */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: formData.coverPhoto ? '145px' : '90px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginTop: '14px',
            background: formData.coverPhoto
              ? 'transparent'
              : (isDark ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'),
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
            transition: 'height 0.25s ease'
          }}>
            {formData.coverPhoto ? (
              <img
                src={formData.coverPhoto}
                alt="Cover Photo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <label
                htmlFor="cover-file-input"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b'
                }}
              >
                <CameraIcon size={20} />
                <span style={{ fontSize: '11.5px', fontWeight: 600 }}>
                  {uploadingCover ? 'Uploading...' : 'Add Cover Photo'}
                </span>
              </label>
            )}

            {/* Change & Remove Buttons when Cover is Present */}
            {formData.coverPhoto && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 3
              }}>
                <label
                  htmlFor="cover-file-input"
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <CameraIcon size={12} />
                  <span>{uploadingCover ? '...' : 'Change'}</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleFieldChange('coverPhoto', null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '5px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                  title="Remove Cover Photo"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* ═════ Centered Circular Avatar with Teal Border and Floating Badge ═════ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '-58px',
            marginBottom: '26px',
            position: 'relative',
            zIndex: 5
          }}>
            <div style={{
              position: 'relative',
              width: '116px',
              height: '116px'
            }}>
              {/* Avatar Circle */}
              <div
                onClick={() => document.getElementById('avatar-file-input')?.click()}
                style={{
                  width: '116px',
                  height: '116px',
                  borderRadius: '50%',
                  border: isDark ? '3px solid #0f172a' : '3px solid #ffffff',
                  outline: '2.5px solid #14b8a6',
                  overflow: 'hidden',
                  background: isDark ? '#1e293b' : '#f1f5f9',
                  boxShadow: '0 4px 14px rgba(20, 184, 166, 0.18)',
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
                  transition: 'transform 0.15s ease',
                  zIndex: 6
                }}
                title="Change Photo"
              >
                <PencilIcon size={12} color="#ffffff" />
              </label>

              {/* Hidden File Input for Avatar */}
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

          {/* ═════ Form Fields Stack (Always English Labels) ═════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Full Name */}
            <CleanField
              label="Full Name"
              icon={<UserIcon size={17} />}
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder=""
              isDark={isDark}
              required
            />

            {/* 2. Phone Number */}
            <CleanField
              label="Phone Number"
              icon={<PhoneIcon size={17} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder=""
              isDark={isDark}
            />

            {/* 3. Bio / Short Description */}
            <CleanField
              label="Bio / Short Description"
              icon={<FileTextIcon size={17} />}
              type="text"
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              placeholder=""
              isDark={isDark}
            />

            {/* 4. Qualification (Select Dropdown) */}
            <CleanSelect
              label="Educational Qualification"
              icon={<GraduationCapIcon size={17} />}
              value={formData.qualification}
              onChange={(val) => handleFieldChange('qualification', val)}
              options={qualificationOptions}
              placeholder=""
              isDark={isDark}
            />

            {/* 5. Location / District (Select Dropdown) */}
            <CleanSelect
              label="District / Location"
              icon={<MapPinIcon size={17} />}
              value={formData.location}
              onChange={(val) => handleFieldChange('location', val)}
              options={locationOptions}
              placeholder=""
              isDark={isDark}
            />
          </div>

          {/* ═════ Save Button in proper position right below the form fields ═════ */}
          <div style={{
            marginTop: '28px',
            marginBottom: 'calc(var(--safe-area-bottom, 0px) + 36px)'
          }}>
            <button
              type="submit"
              disabled={uploadingImage || uploadingCover}
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
        </form>
      </div>
    </div>
  );
}
