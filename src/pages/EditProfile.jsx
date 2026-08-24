import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Edit, FileText, MapPin } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { CLOUDINARY_CONFIG } from '../cloudinary';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import BottomNav from '../components/BottomNav';

const PhoneIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

function FormInput({ label, icon, type = 'text', value, onChange, placeholder, required = false, isOptional = false, isEn = false, autoComplete = 'off' }) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px', display: 'block' }}>
        {label}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          color: isFocused ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
          transition: 'color 0.2s',
          zIndex: 2
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
          autoComplete={autoComplete}
          style={{
            width: '100%',
            height: '42px',
            padding: isOptional ? '8px 65px 8px 36px' : '8px 12px 8px 36px',
            fontSize: '13px',
            fontWeight: 600,
            background: isFocused ? 'var(--card-bg, #ffffff)' : 'var(--bg-secondary)',
            border: isFocused ? '1.5px solid var(--primary)' : '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            boxShadow: isFocused ? '0 0 0 3px rgba(26, 86, 219, 0.08)' : 'none',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        />
        {isOptional && (
          <span style={{
            position: 'absolute',
            right: '10px',
            fontSize: '9.5px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-primary, #f1f5f9)',
            padding: '2px 5px',
            borderRadius: '5px',
            border: '1px solid var(--border)',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            {isEn ? 'Optional' : 'ঐচ্ছিক'}
          </span>
        )}
      </div>
    </div>
  );
}

function ModernSelect({ label, icon, value, onChange, options = [], placeholder = '', isOptional = false, isEn = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption
    ? (isEn && selectedOption.labelEn ? selectedOption.labelEn : selectedOption.label)
    : placeholder;

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '5px', display: 'block' }}>
        {label}
      </label>

      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '42px',
          padding: isOptional ? '8px 65px 8px 36px' : '8px 30px 8px 36px',
          background: isOpen ? 'var(--card-bg, #ffffff)' : 'var(--bg-secondary)',
          border: isOpen ? '1.5px solid var(--primary)' : '1px solid var(--border)',
          borderRadius: '12px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 4px 14px rgba(26, 86, 219, 0.1)' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
      >
        <div style={{
          position: 'absolute',
          left: '12px',
          color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {icon}
        </div>

        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1
        }}>
          {displayLabel}
        </span>

        {isOptional && (
          <span style={{
            position: 'absolute',
            right: '28px',
            fontSize: '9.5px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-primary, #f1f5f9)',
            padding: '2px 5px',
            borderRadius: '5px',
            border: '1px solid var(--border)',
            pointerEvents: 'none'
          }}>
            {isEn ? 'Optional' : 'ঐচ্ছিক'}
          </span>
        )}

        <div style={{
          position: 'absolute',
          right: '10px',
          color: isOpen ? 'var(--primary)' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'none'
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* Modern Curved Modal Sheet for Options */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              maxHeight: '70vh',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px 12px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary)'
            }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {label}
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--border)',
                  border: 'none',
                  color: 'var(--text-muted)',
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
                  borderRadius: '14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: value === '' ? 'var(--primary-bg, #eff6ff)' : 'transparent',
                  color: value === '' ? 'var(--primary)' : 'var(--text-muted)',
                  border: value === '' ? '1.5px solid rgba(26, 86, 219, 0.3)' : '1px dashed var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s'
                }}
              >
                <span>{placeholder}</span>
                {value === '' && <span style={{ fontWeight: 800, color: 'var(--primary)' }}>✓</span>}
              </div>

              {options.map((opt) => {
                const isSelected = value === opt.value;
                const itemLabel = isEn && opt.labelEn ? opt.labelEn : opt.label;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '14px',
                      fontSize: '13.5px',
                      fontWeight: isSelected ? 700 : 600,
                      cursor: 'pointer',
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(26, 86, 219, 0.1) 0%, rgba(37, 99, 235, 0.15) 100%)'
                        : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span>{itemLabel}</span>
                    {isSelected && (
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
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
  const isEn = state.language === 'en';

  const [formData, setFormData] = useState({
    name: state.user.name || '',
    phone: state.user.phone || '',
    qualification: state.user.qualification || '',
    location: state.user.location || '',
    avatar: state.user.avatar || null
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const qualificationOptions = [
    { value: 'স্নাতক (Bachelor)', label: 'স্নাতক (Bachelor)', labelEn: 'Bachelor (স্নাতক)' },
    { value: 'স্নাতকোত্তর (Master)', label: 'স্নাতকোত্তর (Master)', labelEn: 'Master (স্নাতকোত্তর)' },
    { value: 'এইচএসসি (HSC)', label: 'এইচএসসি (HSC)', labelEn: 'HSC (এইচএসসি)' },
    { value: 'এসএসসি (SSC)', label: 'এসএসসি (SSC)', labelEn: 'SSC (এসএসসি)' },
    { value: 'ডিপ্লোমা (Diploma)', label: 'ডিপ্লোমা (Diploma)', labelEn: 'Diploma (ডিপ্লোমা)' }
  ];

  const locationOptions = [
    { value: 'ঢাকা', label: 'Dhaka (ঢাকা)', labelEn: 'Dhaka (ঢাকা)' },
    { value: 'চট্টগ্রাম', label: 'Chattogram (চট্টগ্রাম)', labelEn: 'Chattogram (চট্টগ্রাম)' },
    { value: 'রাজশাহী', label: 'Rajshahi (রাজশাহী)', labelEn: 'Rajshahi (রাজশাহী)' },
    { value: 'খুলনা', label: 'Khulna (খুলনা)', labelEn: 'Khulna (খুলনা)' },
    { value: 'সিলেট', label: 'Sylhet (সিলেট)', labelEn: 'Sylhet (সিলেট)' },
    { value: 'বরিশাল', label: 'Barishal (বরিশাল)', labelEn: 'Barishal (বরিশাল)' },
    { value: 'রংপুর', label: 'Rangpur (রংপুর)', labelEn: 'Rangpur (রংপুর)' },
    { value: 'ময়মনসিংহ', label: 'Mymensingh (ময়মনসিংহ)', labelEn: 'Mymensingh (ময়মনসিংহ)' }
  ];

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
        const optimizedUrl = optimizeCloudinaryUrl(fileData.secure_url);
        setFormData(prev => ({ ...prev, avatar: optimizedUrl }));
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
    <div className="page" style={{ background: 'var(--bg)', paddingBottom: '85px' }}>
      {/* Glassmorphism Gradient Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #2563eb 100%)',
        padding: 'calc(var(--safe-area-top) + 10px) 16px 40px 16px',
        color: 'white',
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
        position: 'relative',
        boxShadow: '0 8px 25px -4px rgba(26, 86, 219, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Rings */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }} />

        {/* Top Header Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          position: 'relative',
          zIndex: 2
        }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(8px)',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Integrated Avatar Section */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            position: 'relative',
            width: '74px',
            height: '74px',
            margin: '0 auto'
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
                  border: '3px solid #ffffff',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                  opacity: uploadingImage ? 0.5 : 1
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 800,
                border: '3px solid #ffffff',
                boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
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
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '9px',
                fontWeight: 800
              }}>
                UPLOADING...
              </div>
            )}

            <label htmlFor="avatar-upload" style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 3px 10px rgba(0,0,0,0.22)'
            }}>
              <Edit size={14} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploadingImage}
            />
          </div>
        </div>
      </div>

      <div className="page-content animate-fade-in" style={{ padding: '0 16px 16px 16px', marginTop: '-18px', position: 'relative', zIndex: 3 }}>
        <form onSubmit={handleSubmit}>

          {/* Form Fields Card */}
          <div className="card" style={{ padding: '16px 16px 6px 16px', borderRadius: '18px', boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)', border: '1px solid var(--border)' }}>
            <FormInput
              label={isEn ? 'Full Name' : 'পূর্ণ নাম'}
              icon={<User size={16} />}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isEn ? 'Enter your name' : 'আপনার নাম লিখুন'}
              required
            />

            <FormInput
              label={isEn ? 'Phone Number' : 'মোবাইল নম্বর'}
              icon={<PhoneIcon size={15} />}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={isEn ? 'Enter phone number' : 'মোবাইল নম্বর লিখুন'}
              isOptional
              isEn={isEn}
            />

            <ModernSelect
              label={isEn ? 'Qualification' : 'শিক্ষাগত যোগ্যতা'}
              icon={<FileText size={16} />}
              value={formData.qualification}
              onChange={(val) => handleChange('qualification', val)}
              options={qualificationOptions}
              placeholder={isEn ? 'Select Qualification' : 'শিক্ষাগত যোগ্যতা নির্বাচন করুন'}
              isOptional
              isEn={isEn}
            />

            <ModernSelect
              label={isEn ? 'Location' : 'জেলা / অবস্থান'}
              icon={<MapPin size={16} />}
              value={formData.location}
              onChange={(val) => handleChange('location', val)}
              options={locationOptions}
              placeholder={isEn ? 'Select Location' : 'অবস্থান নির্বাচন করুন'}
              isOptional
              isEn={isEn}
            />
          </div>

          <div style={{ marginTop: '18px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{
                background: savedSuccess ? '#10b981' : 'linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)',
                height: '44px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: savedSuccess ? '0 6px 16px rgba(16,185,129,0.25)' : '0 6px 16px rgba(26,86,219,0.25)'
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
