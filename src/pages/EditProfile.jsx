import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, setDoc } from 'firebase/firestore';
import { CLOUDINARY_CONFIG } from '../cloudinary';
import { optimizeCloudinaryUrl } from '../utils/cloudinaryUtils';
import { compressImageFile } from '../utils/mediaUtils';

// Precise custom SVG icons
const ChevronLeftIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ pointerEvents: 'none', display: 'block' }}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const PencilIcon = ({ size = 12, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const CameraIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

// Helper: Sanitize string to lowercase alphanumeric & underscore
const sanitizeUsername = (val = '') => {
  return String(val)
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 20);
};

// Check if a username is already taken by another user in Firestore
const checkUsernameInFirestore = async (rawUsername, currentUserId) => {
  const clean = sanitizeUsername(rawUsername);
  if (!clean || clean.length < 3) {
    return { available: false, error: 'Username must be at least 3 characters' };
  }

  try {
    const q = query(
      collection(db, 'users'),
      where('username', '==', clean)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return { available: true, clean };
    }

    // Check if the only matched user is the current user themselves
    const matchesOtherUser = snap.docs.some(docSnap => {
      const data = docSnap.data();
      const docId = docSnap.id;
      return docId !== currentUserId && data.id !== currentUserId;
    });

    if (matchesOtherUser) {
      return { available: false, error: 'This user name already exists' };
    }

    return { available: true, clean };
  } catch (err) {
    console.warn('Firestore username check notice:', err);
    // If offline/error, allow validation
    return { available: true, clean };
  }
};

// Generate a permanent unique available username (Deterministic per user so it NEVER auto-changes)
const generateUniqueUsername = async (baseName, currentUserId) => {
  let seed = sanitizeUsername(baseName) || 'user';
  if (seed.length < 3) seed = (seed + 'user').slice(0, 10);

  // Derive stable deterministic suffix from user id
  let hash = 0;
  const idStr = String(currentUserId || 'user');
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash * 31 + idStr.charCodeAt(i)) % 900;
  }
  const baseNum = 10 + (Math.abs(hash) % 90);

  // Try stable candidate
  const primaryCandidate = `${seed}${baseNum}`.slice(0, 20);
  const primaryResult = await checkUsernameInFirestore(primaryCandidate, currentUserId);
  if (primaryResult.available) {
    return `@${primaryCandidate}`;
  }

  // If primary taken, try deterministic sequence
  for (let attempt = 1; attempt <= 10; attempt++) {
    const candidate = `${seed}${(baseNum + attempt * 13) % 900 + 10}`.slice(0, 20);
    const result = await checkUsernameInFirestore(candidate, currentUserId);
    if (result.available) {
      return `@${candidate}`;
    }
  }

  return `@${seed}${baseNum}`;
};

// Clean styled form field with reduced corner curvness
function CleanField({
  label,
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
        fontSize: '11.5px',
        fontWeight: 600,
        color: isDark ? '#cbd5e1' : '#475569',
        marginBottom: '5px'
      }}>
        {label}
      </label>
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
          height: '42px',
          paddingLeft: '14px',
          paddingRight: '14px',
          fontSize: '13px',
          fontWeight: 500,
          color: isDark ? '#f8fafc' : '#0f172a',
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '6px',
          outline: 'none',
          boxShadow: isFocused ? '0 0 0 2.5px rgba(20, 184, 166, 0.12)' : 'none',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
        }}
      />
    </div>
  );
}

// Clean Dropdown selector with reduced corner curvness
function CleanSelect({
  label,
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
        fontSize: '11.5px',
        fontWeight: 600,
        color: isDark ? '#cbd5e1' : '#475569',
        marginBottom: '5px'
      }}>
        {label}
      </label>

      <div
        onClick={() => setIsOpen(true)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '42px',
          paddingLeft: '14px',
          paddingRight: '36px',
          background: bg,
          border: `1px solid ${borderColor}`,
          borderRadius: '6px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 2.5px rgba(20, 184, 166, 0.12)' : 'none',
          transition: 'all 0.2s ease',
          userSelect: 'none'
        }}
      >
        <span style={{
          fontSize: '13px',
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

      {/* Modern Curved Modal Dialog Centered in Middle */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              maxHeight: '62vh',
              background: isDark ? '#1e293b' : '#ffffff',
              borderRadius: '14px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              margin: 'auto'
            }}
          >
            {/* Modal Header (Reduced Height) */}
            <div style={{
              padding: '10px 16px',
              borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isDark ? '#0f172a' : '#f8fafc'
            }}>
              <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
                {label}
              </h4>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
                  border: 'none',
                  color: isDark ? '#cbd5e1' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '11px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Options List (Reduced Text Size, Clean English) */}
            <div style={{
              padding: '10px 12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              maxHeight: '52vh'
            }}>
              {/* Optional Reset Option */}
              <div
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                style={{
                  padding: '9px 14px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
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
                const itemLabel = opt.labelEn || opt.label || opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.labelEn || opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 600 : 500,
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
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#14b8a6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
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

  const currentUserId = state.user?.id || localStorage.getItem('user_id') || 'user_guest';
  const savedUsername = state.user?.username || localStorage.getItem('user_username') || '';

  // Keep ALL user profile data intact with username support
  const [formData, setFormData] = useState({
    name: state.user?.name || '',
    username: savedUsername,
    phone: state.user?.phone || '',
    bio: state.user?.bio || '',
    qualification: state.user?.qualification || '',
    location: state.user?.location || '',
    avatar: state.user?.avatar || null,
    coverPhoto: state.user?.coverPhoto || null
  });

  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(Boolean(savedUsername));
  const usernameCheckTimerRef = useRef(null);
  const coverFileInputRef = useRef(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preserve & load username: Once selected/generated, it NEVER auto-changes
  useEffect(() => {
    // 1. If user already has a saved username in state or localStorage, lock it in place
    const existing = state.user?.username || localStorage.getItem('user_username');
    if (existing) {
      if (!formData.username) {
        setFormData(prev => ({ ...prev, username: existing }));
      }
      setIsUsernameAvailable(true);
      return;
    }

    let isCancelled = false;
    (async () => {
      // 2. Check if Firestore already has a username registered for this user
      try {
        const userDocRef = doc(db, 'users', currentUserId);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists() && userSnap.data()?.username) {
          const fsUser = userSnap.data().username;
          const formatted = fsUser.startsWith('@') ? fsUser : `@${fsUser}`;
          if (!isCancelled) {
            setFormData(prev => ({ ...prev, username: formatted }));
            localStorage.setItem('user_username', formatted);
            setIsUsernameAvailable(true);
          }
          return;
        }
      } catch (err) {
        console.warn('Firestore user fetch notice:', err);
      }

      // 3. Only if user has NO username at all, generate one permanent unique username
      if (!isCancelled && !formData.username) {
        setIsCheckingUsername(true);
        const auto = await generateUniqueUsername(formData.name || state.user?.name || 'user', currentUserId);
        if (!isCancelled) {
          setFormData(prev => ({ ...prev, username: auto }));
          // Immediately save in localStorage so subsequent reloads or visits NEVER change it
          localStorage.setItem('user_username', auto);
          setIsUsernameAvailable(true);
          setUsernameError('');
          setIsCheckingUsername(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [currentUserId]);

  // Qualification Options (English only)
  const qualificationOptions = [
    { value: 'Bachelor', label: 'Bachelor', labelEn: 'Bachelor' },
    { value: 'Master', label: 'Master', labelEn: 'Master' },
    { value: 'HSC', label: 'HSC', labelEn: 'HSC' },
    { value: 'SSC', label: 'SSC', labelEn: 'SSC' },
    { value: 'Diploma', label: 'Diploma', labelEn: 'Diploma' }
  ];

  // Location / District Options (English only)
  const locationOptions = [
    { value: 'Dhaka', label: 'Dhaka', labelEn: 'Dhaka' },
    { value: 'Chattogram', label: 'Chattogram', labelEn: 'Chattogram' },
    { value: 'Rajshahi', label: 'Rajshahi', labelEn: 'Rajshahi' },
    { value: 'Khulna', label: 'Khulna', labelEn: 'Khulna' },
    { value: 'Sylhet', label: 'Sylhet', labelEn: 'Sylhet' },
    { value: 'Barishal', label: 'Barishal', labelEn: 'Barishal' },
    { value: 'Rangpur', label: 'Rangpur', labelEn: 'Rangpur' },
    { value: 'Mymensingh', label: 'Mymensingh', labelEn: 'Mymensingh' }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Username Typing with live uniqueness verification
  const handleUsernameChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('@')) {
      val = '@' + val.replace(/^@+/, '');
    }
    // Only allow lowercase a-z, 0-9, and underscore
    const cleanChars = '@' + val.slice(1).replace(/[^a-z0-9_]/gi, '').toLowerCase();
    setFormData(prev => ({ ...prev, username: cleanChars }));

    // Lock and persist the user-selected username immediately so it never auto-changes
    if (cleanChars.length > 1) {
      localStorage.setItem('user_username', cleanChars);
    }

    const cleanRaw = cleanChars.slice(1);
    if (cleanRaw.length < 3) {
      setIsUsernameAvailable(false);
      setUsernameError('Username must be at least 3 characters');
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError('');

    if (usernameCheckTimerRef.current) {
      clearTimeout(usernameCheckTimerRef.current);
    }

    usernameCheckTimerRef.current = setTimeout(async () => {
      const result = await checkUsernameInFirestore(cleanRaw, currentUserId);
      setIsCheckingUsername(false);
      if (result.available) {
        setIsUsernameAvailable(true);
        setUsernameError('');
      } else {
        setIsUsernameAvailable(false);
        setUsernameError(result.error || 'This user name already exists');
      }
    }, 380);
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
          setFormData(prev => ({ ...prev, coverPhoto: optimizedUrl }));
          return;
        }
      }
      const dataUrl = await compressImageFile(file, 800, 0.8);
      setFormData(prev => ({ ...prev, coverPhoto: dataUrl }));
    } catch (err) {
      console.error('Cover upload error:', err);
      try {
        const dataUrl = await compressImageFile(file, 800, 0.8);
        setFormData(prev => ({ ...prev, coverPhoto: dataUrl }));
      } catch (fallbackErr) {
        alert('Cover upload failed: ' + (err.message || 'Error'));
      }
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameError) {
      alert(usernameError);
      return;
    }

    const cleanUser = sanitizeUsername(formData.username);
    if (!cleanUser || cleanUser.length < 3) {
      alert('Please provide a valid username of at least 3 characters.');
      return;
    }

    // Final check for uniqueness before saving
    setIsCheckingUsername(true);
    const result = await checkUsernameInFirestore(cleanUser, currentUserId);
    setIsCheckingUsername(false);

    if (!result.available) {
      setUsernameError(result.error || 'This user name already exists');
      alert(result.error || 'This user name already exists');
      return;
    }

    const finalProfileData = {
      ...formData,
      username: `@${cleanUser}`
    };

    localStorage.setItem('user_username', `@${cleanUser}`);

    // Update global state & localStorage
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: finalProfileData });

    // Store in Firestore collection 'users' so other users cannot take this username
    try {
      await setDoc(doc(db, 'users', currentUserId), {
        id: currentUserId,
        name: finalProfileData.name,
        username: cleanUser,
        phone: finalProfileData.phone,
        bio: finalProfileData.bio,
        qualification: finalProfileData.qualification,
        location: finalProfileData.location,
        avatar: finalProfileData.avatar,
        coverPhoto: finalProfileData.coverPhoto,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore user doc sync warning:', fsErr);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      handleBack();
    }, 700);
  };

  // Reliable Back Navigation Handler with fallback to /profile
  const handleBack = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (window.history.length > 1 && window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate('/profile');
      }
    } catch {
      navigate('/profile');
    }
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
      {/* Reduced Height Top Header Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: isDark ? '#0f172a' : '#ffffff',
        padding: 'calc(var(--safe-area-top, 0px) + 6px) 14px 6px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #f8fafc'
      }}>
        {/* Back Button with comfortable 40px touch target & visual feedback */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="back-btn"
          style={{
            width: '40px',
            height: '40px',
            minWidth: '40px',
            minHeight: '40px',
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
            border: 'none',
            color: isDark ? '#f8fafc' : '#0f172a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            flexShrink: 0,
            zIndex: 10
          }}
        >
          <ChevronLeftIcon size={22} />
        </button>

        {/* Header Title (Centered, pointerEvents none so buttons receive all taps) */}
        <h1 style={{
          fontSize: '15px',
          fontWeight: 700,
          color: isDark ? '#f8fafc' : '#0f172a',
          margin: 0,
          letterSpacing: '-0.1px',
          textAlign: 'center',
          flex: 1,
          pointerEvents: 'none'
        }}>
          Edit Profile
        </h1>

        {/* Spacer to keep Title centered */}
        <div style={{ width: '40px', height: '40px', flexShrink: 0 }} />
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        padding: '0 20px 120px 20px',
        flex: 1
      }}>
        <form id="edit-profile-form" onSubmit={handleSubmit}>

          {/* Hidden File Input for Cover Photo */}
          <input
            ref={coverFileInputRef}
            id="cover-file-input"
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={uploadingCover}
            style={{ display: 'none' }}
          />

          {/* ═════ Visible Cover Photo Banner (Reduced Corner Curvness: 6px) ═════ */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: formData.coverPhoto ? '140px' : '85px',
            borderRadius: '6px',
            overflow: 'hidden',
            marginTop: '8px',
            background: formData.coverPhoto
              ? 'transparent'
              : (isDark ? 'linear-gradient(135deg, #1e293b, #334155)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'),
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            transition: 'height 0.25s ease'
          }}>
            {formData.coverPhoto && (
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
            )}

            {/* Side Corner Upload Button when Cover is NOT present */}
            {!formData.coverPhoto && (
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                title="Add Cover Photo"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(4px)',
                  color: isDark ? '#cbd5e1' : '#475569',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  zIndex: 5
                }}
              >
                {uploadingCover ? (
                  <span style={{ fontSize: '10px', fontWeight: 700 }}>...</span>
                ) : (
                  <CameraIcon size={16} />
                )}
              </button>
            )}

            {/* Change & Remove Buttons when Cover is Present */}
            {formData.coverPhoto && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 5
              }}>
                <button
                  type="button"
                  onClick={() => coverFileInputRef.current?.click()}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.25)'
                  }}
                >
                  <CameraIcon size={11} />
                  <span>{uploadingCover ? '...' : 'Change'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFieldChange('coverPhoto', null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.85)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 7px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
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
            marginTop: '-56px',
            marginBottom: '22px',
            position: 'relative',
            zIndex: 5
          }}>
            <div style={{
              position: 'relative',
              width: '112px',
              height: '112px'
            }}>
              {/* Avatar Circle */}
              <div
                onClick={() => document.getElementById('avatar-file-input')?.click()}
                style={{
                  width: '112px',
                  height: '112px',
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
                    fontSize: '36px',
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

          {/* ═════ Form Fields Stack (Always English Labels, No Icons, Reduced Text Size) ═════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. Full Name */}
            <CleanField
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder=""
              isDark={isDark}
              required
            />

            {/* 2. Username (Directly under Full Name with Auto-generation & Uniqueness Check) */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: isDark ? '#cbd5e1' : '#475569',
                marginBottom: '5px'
              }}>
                Username
              </label>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={formData.username}
                  onChange={handleUsernameChange}
                  onFocus={() => setIsUsernameFocused(true)}
                  onBlur={() => setIsUsernameFocused(false)}
                  placeholder="@username"
                  style={{
                    width: '100%',
                    height: '42px',
                    paddingLeft: '14px',
                    paddingRight: '36px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: isDark ? '#f8fafc' : '#0f172a',
                    background: isDark ? 'rgba(30, 41, 59, 0.7)' : '#fcfbfc',
                    border: `1px solid ${
                      usernameError
                        ? '#ef4444'
                        : isUsernameFocused
                          ? '#14b8a6'
                          : (isDark ? 'rgba(255, 255, 255, 0.14)' : '#e2e8f0')
                    }`,
                    borderRadius: '6px',
                    outline: 'none',
                    boxShadow: usernameError
                      ? '0 0 0 2.5px rgba(239, 68, 68, 0.12)'
                      : isUsernameFocused
                        ? '0 0 0 2.5px rgba(20, 184, 166, 0.12)'
                        : 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                />

                {/* Status Indicator */}
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}>
                  {isCheckingUsername ? (
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>...</span>
                  ) : usernameError ? (
                    <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 800 }}>✕</span>
                  ) : isUsernameAvailable && formData.username ? (
                    <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 800 }}>✓</span>
                  ) : null}
                </div>
              </div>

              {/* Error Message (Only shown in red when taken or invalid) */}
              {usernameError && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#ef4444',
                  marginTop: '4px',
                  marginLeft: '2px'
                }}>
                  {usernameError}
                </span>
              )}
            </div>

            {/* 3. Phone Number */}
            <CleanField
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              placeholder=""
              isDark={isDark}
            />

            {/* 4. Bio */}
            <CleanField
              label="Bio"
              type="text"
              value={formData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              placeholder=""
              isDark={isDark}
            />

            {/* 5. Qualification */}
            <CleanSelect
              label="Qualification"
              value={formData.qualification}
              onChange={(val) => handleFieldChange('qualification', val)}
              options={qualificationOptions}
              placeholder=""
              isDark={isDark}
            />

            {/* 6. Location */}
            <CleanSelect
              label="Location"
              value={formData.location}
              onChange={(val) => handleFieldChange('location', val)}
              options={locationOptions}
              placeholder=""
              isDark={isDark}
            />
          </div>

          {/* ═════ Save Button (Reduced Corner Curvness: 6px) ═════ */}
          <div style={{
            marginTop: '28px',
            marginBottom: 'calc(var(--admob-bottom-spacing, 70px) + 80px)'
          }}>
            <button
              type="submit"
              disabled={uploadingImage || uploadingCover || isCheckingUsername || Boolean(usernameError)}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '6px',
                background: (isCheckingUsername || Boolean(usernameError))
                  ? '#94a3b8'
                  : (savedSuccess ? '#0d9488' : '#136368'),
                color: '#ffffff',
                fontSize: '14.5px',
                fontWeight: 700,
                border: 'none',
                cursor: (isCheckingUsername || Boolean(usernameError)) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: (isCheckingUsername || Boolean(usernameError)) ? 'none' : '0 3px 10px rgba(19, 99, 104, 0.24)',
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
