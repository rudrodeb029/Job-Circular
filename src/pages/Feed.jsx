import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, HeartFilled } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { incrementFeedLike } from '../services/supabaseService';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import PullToRefresh from '../components/PullToRefresh';

// Extract YouTube video ID from various URL formats
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

// Format relative time
function timeAgo(dateStr, isEn) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffMin < 1) return isEn ? 'Just now' : 'এইমাত্র';
  if (diffMin < 60) return isEn ? `${diffMin}m ago` : `${diffMin} মিনিট আগে`;
  if (diffHr < 24) return isEn ? `${diffHr}h ago` : `${diffHr} ঘণ্টা আগে`;
  if (diffDay < 7) return isEn ? `${diffDay}d ago` : `${diffDay} দিন আগে`;
  if (diffWeek < 5) return isEn ? `${diffWeek}w ago` : `${diffWeek} সপ্তাহ আগে`;
  return isEn ? `${diffMonth}mo ago` : `${diffMonth} মাস আগে`;
}

export default function Feed() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: adminState } = useAdminContext();
  const isEn = state.language === 'en';

  const feedPosts = useMemo(() => {
    const posts = adminState.feedPosts || state.feedPosts || [];
    return [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [adminState.feedPosts, state.feedPosts]);

  return (
    <div className="page" style={{ paddingBottom: '80px' }}>
      <AppHeader />

      <PullToRefresh>
        {/* Page Title */}
        <div style={{ padding: '0 16px 12px 16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isEn ? '📰 Feed' : '📰 ফিড'}
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0', fontWeight: 500 }}>
            {isEn ? 'Latest updates, tips & videos' : 'সর্বশেষ আপডেট, টিপস ও ভিডিও'}
          </p>
        </div>

        {/* Feed Posts */}
        {feedPosts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            textAlign: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '48px' }}>📭</div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)', margin: 0 }}>
              {isEn ? 'No Posts Yet' : 'এখনো কোনো পোস্ট নেই'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '260px' }}>
              {isEn ? 'Stay tuned! New updates, tips, and videos will appear here.' : 'অপেক্ষা করুন! নতুন আপডেট, টিপস ও ভিডিও এখানে দেখা যাবে।'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 12px' }}>
            {feedPosts.map(post => (
              <FeedPostCard
                key={post.id}
                post={post}
                isEn={isEn}
                isLiked={state.likedPosts?.includes(post.id)}
                onToggleLike={() => {
                  const isCurrentlyLiked = state.likedPosts?.includes(post.id);
                  dispatch({ type: 'TOGGLE_LIKE_POST', payload: post.id });
                  incrementFeedLike(post.id, isCurrentlyLiked ? -1 : 1).catch(console.error);
                }}
              />
            ))}
          </div>
        )}
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}

function FeedPostCard({ post, isEn, isLiked, onToggleLike }) {
  const [expanded, setExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const content = isEn ? (post.contentEn || post.content) : post.content;
  const isLong = content && content.length > 200;
  const displayContent = isLong && !expanded ? content.slice(0, 200) + '...' : content;

  const youtubeId = post.mediaType === 'youtube' ? getYouTubeId(post.mediaUrl) : null;
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  const handleLike = () => {
    setLikeAnimating(true);
    onToggleLike();
    setTimeout(() => setLikeAnimating(false), 600);
  };

  return (
    <div className="card" style={{
      padding: 0,
      overflow: 'hidden',
      borderRadius: '16px'
    }}>
      {/* Post Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px 8px 14px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '15px',
          fontWeight: 800,
          flexShrink: 0
        }}>
          LC
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Live Circular
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: '#1d9bf0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: 'white',
              fontWeight: 900,
              flexShrink: 0
            }}>✓</span>
          </h4>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
            {timeAgo(post.createdAt, isEn)}
          </span>
        </div>
      </div>

      {/* Post Content Text */}
      {content && (
        <div style={{ padding: '0 14px 10px 14px' }}>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: 0,
            fontWeight: 500,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}>
            {displayContent}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary)',
                background: 'none',
                border: 'none',
                padding: '4px 0 0 0',
                cursor: 'pointer'
              }}
            >
              {expanded ? (isEn ? 'Show Less' : 'কম দেখুন') : (isEn ? 'Read More' : 'আরও পড়ুন')}
            </button>
          )}
        </div>
      )}

      {/* YouTube Video Embed */}
      {post.mediaType === 'youtube' && youtubeId && (
        <div style={{ position: 'relative', width: '100%', background: '#000' }}>
          {showVideo ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                title="YouTube Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
              />
            </div>
          ) : (
            <div
              onClick={() => setShowVideo(true)}
              style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <img
                src={thumbnailUrl}
                alt="Video Thumbnail"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Play Button Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(255, 0, 0, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{
                  width: 0,
                  height: 0,
                  borderLeft: '18px solid white',
                  borderTop: '11px solid transparent',
                  borderBottom: '11px solid transparent',
                  marginLeft: '4px'
                }} />
              </div>
              {/* YouTube Label */}
              <div style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '9px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)'
              }}>
                ▶ YouTube
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Post */}
      {post.mediaType === 'image' && post.mediaUrl && (
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <img
            src={post.mediaUrl}
            alt="Post"
            style={{
              width: '100%',
              display: 'block',
              maxHeight: '400px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post Footer — Like & Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px 12px 14px',
        borderTop: '1px solid var(--border-light)'
      }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '20px',
            transition: 'all 0.2s ease',
            transform: likeAnimating ? 'scale(1.2)' : 'scale(1)',
            background: isLiked ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
          }}
        >
          {isLiked ? (
            <HeartFilled size={20} color="#ef4444" />
          ) : (
            <Heart size={20} color="var(--text-muted)" />
          )}
          <span style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: isLiked ? '#ef4444' : 'var(--text-muted)'
          }}>
            {isEn ? 'Love' : 'ভালোবাসা'}
          </span>
        </button>

        {(post.likes > 0 || isLiked) && (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ color: '#ef4444', fontSize: '12px' }}>❤️</span>
            {(post.likes || 0) + (isLiked && !(post.likes > 0) ? 1 : 0)}
          </span>
        )}
      </div>
    </div>
  );
}
