import React, { useState } from 'react';
import { useAdminContext } from '../../context/AdminContext';
import { Plus, Trash2, Edit2, PlayCircle, Type, ImageIcon, Heart } from '../../components/Icons';

// Extract YouTube video ID
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function ManageFeed() {
  const { state, dispatch } = useAdminContext();
  const feedPosts = state.feedPosts || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Form state
  const [mediaType, setMediaType] = useState('youtube'); // 'youtube' | 'image' | 'text'
  const [content, setContent] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [shouldNotify, setShouldNotify] = useState(true);

  const openCreateModal = () => {
    setEditingPost(null);
    setMediaType('text');
    setContent('');
    setContentEn('');
    setMediaUrl('');
    setBannerGradient('fire');
    setShouldNotify(true);
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setMediaType(post.mediaType || 'text');
    setContent(post.content || '');
    setContentEn(post.contentEn || '');
    setMediaUrl(post.mediaUrl || '');
    setBannerGradient(post.bannerGradient || '');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) {
      alert('অনুগ্রহ করে কন্টেন্ট বা মিডিয়া ইউআরএল প্রদান করুন');
      return;
    }

    const postData = {
      id: editingPost ? editingPost.id : `feed_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      content: content.trim(),
      contentEn: contentEn.trim(),
      mediaType,
      mediaUrl: mediaUrl.trim(),
      bannerGradient: mediaType === 'text' ? bannerGradient : '',
      likes: editingPost ? editingPost.likes || 0 : 0,
      createdAt: editingPost ? editingPost.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shouldNotify: !editingPost ? shouldNotify : false
    };

    if (editingPost) {
      dispatch({ type: 'UPDATE_FEED_POST', payload: postData });
    } else {
      dispatch({ type: 'ADD_FEED_POST', payload: postData });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (postId) => {
    if (window.confirm('আপনি কি এই পোস্টটি মুছে ফেলতে নিশ্চিত?')) {
      dispatch({ type: 'DELETE_FEED_POST', payload: postId });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button
          onClick={openCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(26, 86, 219, 0.25)'
          }}
        >
          <Plus size={18} />
          নতুন পোস্ট লিখুন
        </button>
      </div>

      {/* Posts List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {feedPosts.map(post => {
          const ytId = post.mediaType === 'youtube' ? getYouTubeId(post.mediaUrl) : null;
          return (
            <div key={post.id} style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Media Preview Header */}
              {post.mediaType === 'youtube' && ytId && (
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt="YouTube Thumbnail"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: '#ff0000',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    YouTube Video
                  </span>
                </div>
              )}

              {post.mediaType === 'image' && post.mediaUrl && (
                <div style={{ width: '100%', height: '180px', overflow: 'hidden', background: '#f8fafc' }}>
                  <img
                    src={post.mediaUrl}
                    alt="Post Image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              {post.mediaType === 'text' && (
                <div style={{
                  padding: '12px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748b'
                }}>
                  📝 Text Post
                </div>
              )}

              {/* Card Body */}
              <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.5,
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {post.content || post.contentEn || 'No text content'}
                </p>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Heart size={14} color="#ef4444" />
                    {post.likes || 0} Likes
                  </span>
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                borderTop: '1px solid #e2e8f0',
                background: '#fafafa'
              }}>
                <button
                  onClick={() => openEditModal(post)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#2563eb',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    borderRight: '1px solid #e2e8f0'
                  }}
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {feedPosts.length === 0 && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px dashed #cbd5e1'
          }}>
            <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>কোনো ফিড পোস্ট পাওয়া যায়নি</p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>উপরের "নতুন পোস্ট লিখুন" বাটনে ক্লিক করে পোস্ট তৈরি করুন</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>
              {editingPost ? 'পোস্ট সম্পাদনা করুন' : 'নতুন ফিড পোস্ট তৈরি করুন'}
            </h3>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Media Type Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  পোস্টের ধরন (Type)
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'youtube', label: 'YouTube Video', icon: PlayCircle },
                    { id: 'image', label: 'Image', icon: ImageIcon },
                    { id: 'text', label: 'Text Only', icon: Type }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMediaType(t.id)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: mediaType === t.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: mediaType === t.id ? '#eff6ff' : '#ffffff',
                        color: mediaType === t.id ? '#1d4ed8' : '#64748b',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <t.icon size={16} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* YouTube or Image URL Input */}
              {mediaType === 'youtube' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    YouTube Link / URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {mediaUrl && getYouTubeId(mediaUrl) && (
                    <div style={{ marginTop: '8px', position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                      <img
                        src={`https://img.youtube.com/vi/${getYouTubeId(mediaUrl)}/hqdefault.jpg`}
                        alt="Preview"
                        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <span style={{ position: 'absolute', top: 8, left: 8, background: '#10b981', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        ✓ Valid YouTube Link
                      </span>
                    </div>
                  )}
                </div>
              )}

              {mediaType === 'image' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Image Direct URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {mediaType === 'text' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Facebook Banner Background (ব্যনার ব্যাকগ্রাউন্ড)
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { id: 'fire', name: '🔥 Fire Red', bg: 'linear-gradient(135deg, #7f1d1d, #991b1b)' },
                      { id: 'ocean', name: '🌊 Ocean Blue', bg: 'linear-gradient(135deg, #0c4a6e, #0284c7)' },
                      { id: 'purple', name: '💜 Purple', bg: 'linear-gradient(135deg, #4c1d95, #7c3aed)' },
                      { id: 'sunset', name: '🌅 Sunset', bg: 'linear-gradient(135deg, #9a3412, #ea580c)' },
                      { id: 'emerald', name: '🌲 Emerald', bg: 'linear-gradient(135deg, #064e3b, #059669)' },
                      { id: 'dark', name: '🖤 Dark Minimal', bg: 'linear-gradient(135deg, #111827, #1f2937)' },
                      { id: '', name: '⚪ Standard Text', bg: '#ffffff', textColor: '#000000' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setBannerGradient(g.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: bannerGradient === g.id ? '2.5px solid #2563eb' : '1px solid #cbd5e1',
                          background: g.bg,
                          color: g.textColor || '#ffffff',
                          fontWeight: 700,
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Text Content (Bengali) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  পোস্ট কন্টেন্ট (বাংলা)
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="আপনার পোস্টের বিস্তারিত বর্ণনা লিখুন..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Text Content (English Optional) */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Post Content (English - Optional)
                </label>
                <textarea
                  rows={3}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="Write post content in English (optional)..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Push Notification Toggle */}
              {!editingPost && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <input
                    type="checkbox"
                    id="shouldNotify"
                    checked={shouldNotify}
                    onChange={(e) => setShouldNotify(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="shouldNotify" style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    🔔 ইউজারদের পুশ নোটিফিকেশন পাঠান (Send Push Notification)
                  </label>
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {editingPost ? 'আপডেট করুন' : 'পাবলিশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
