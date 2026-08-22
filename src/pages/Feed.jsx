import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, HeartFilled, Search, X } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { incrementFeedLike } from '../services/supabaseService';
import BottomNav from '../components/BottomNav';
import AppHeader from '../components/AppHeader';
import PullToRefresh from '../components/PullToRefresh';
import SearchBar from '../components/SearchBar';

// Background presets for Facebook-style banner text posts
export const BANNER_GRADIENTS = {
  fire: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #450a0a 100%)',
  ocean: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0369a1 100%)',
  purple: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #5b21b6 100%)',
  sunset: 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #c2410c 100%)',
  emerald: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #047857 100%)',
  dark: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #0f172a 100%)'
};

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

// Format relative time
function timeAgo(dateStr, isEn) {
  if (!dateStr) return '26m';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return isEn ? 'Just now' : 'এইমাত্র';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return `${Math.floor(diffDay / 7)}w`;
}

export default function Feed() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { state: adminState, dispatch: adminDispatch } = useAdminContext();
  const isEn = state.language === 'en';
  const [searchQuery, setSearchQuery] = useState('');

  const feedPosts = useMemo(() => {
    let posts = adminState.feedPosts || state.feedPosts || [];
    posts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(post => 
      (post.content && post.content.toLowerCase().includes(q)) ||
      (post.contentEn && post.contentEn.toLowerCase().includes(q))
    );
  }, [adminState.feedPosts, state.feedPosts, searchQuery]);

  return (
    <div className="page" style={{ paddingBottom: '80px', background: 'var(--bg-secondary, #f0f2f5)' }}>
      <AppHeader />

      <PullToRefresh>
        {/* Standard App Search Bar for Feed Searching */}
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isEn ? 'Search feed posts...' : 'ফিড পোস্ট খুঁজুন...'}
          />
        </div>

        {/* Feed Posts */}
        {feedPosts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 24px',
            textAlign: 'center',
            background: 'var(--card-bg, #ffffff)',
            borderRadius: '12px',
            margin: '0 8px'
          }}>
            <div style={{ fontSize: '48px' }}>📭</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {feedPosts.map(post => (
              <FacebookPostCard
                key={post.id}
                post={post}
                isEn={isEn}
                isLiked={state.likedPosts?.includes(post.id)}
                onToggleLike={() => {
                  const isCurrentlyLiked = state.likedPosts?.includes(post.id);
                  const delta = isCurrentlyLiked ? -1 : 1;
                  dispatch({ type: 'TOGGLE_LIKE_POST', payload: post.id });
                  
                  // Update post object in state so like count updates immediately
                  const newLikes = Math.max(0, (Number(post.likes) || 0) + delta);
                  const updatedPost = { ...post, likes: newLikes };
                  adminDispatch({ type: 'UPDATE_FEED_POST', payload: updatedPost });

                  incrementFeedLike(post.id, delta).catch(console.error);
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

function FacebookPostCard({ post, isEn, isLiked, onToggleLike }) {
  const [expanded, setExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const content = isEn ? (post.contentEn || post.content) : post.content;
  const isLong = content && content.length > 220;
  const displayContent = isLong && !expanded ? content.slice(0, 220) + '...' : content;

  const youtubeId = post.mediaType === 'youtube' ? getYouTubeId(post.mediaUrl) : null;
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  // Check if this post should render as a Facebook Colorful Banner Text Post
  const isBannerPost = post.bannerGradient || (post.mediaType === 'text' && content && content.length < 180 && !post.mediaUrl);
  const bannerBg = post.bannerGradient ? (BANNER_GRADIENTS[post.bannerGradient] || post.bannerGradient) : BANNER_GRADIENTS.fire;

  const handleLike = () => {
    setLikeAnimating(true);
    onToggleLike();
    setTimeout(() => setLikeAnimating(false), 600);
  };

  const likesCount = Number(post.likes) || 0;

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)',
      overflow: 'hidden'
    }}>
      {/* Post Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px 10px 14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Official Live Circular App Logo */}
          <img
            src="/app-logo.png"
            alt="Live Circular Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--primary)',
              flexShrink: 0
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />

          <div>
            <h4 style={{
              fontSize: '14px',
              fontWeight: 700,
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
                fontWeight: 900
              }}>✓</span>
            </h4>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px'
            }}>
              <span>{timeAgo(post.createdAt, isEn)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Text Post (Colorful Background text like in user screenshot) */}
      {isBannerPost ? (
        <div style={{
          background: bannerBg,
          minHeight: '260px',
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative'
        }}>
          <p style={{
            color: '#ffffff',
            fontSize: content && content.length > 80 ? '18px' : '22px',
            fontWeight: 800,
            lineHeight: 1.5,
            margin: 0,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {content}
          </p>
        </div>
      ) : (
        /* Standard Text Content */
        content && (
          <div style={{ padding: '0 14px 10px 14px' }}>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: 0,
              fontWeight: 400,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}>
              {displayContent}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  padding: '4px 0 0 0',
                  cursor: 'pointer'
                }}
              >
                {expanded ? (isEn ? 'See Less' : 'কম দেখুন') : (isEn ? 'See More' : 'আরও দেখুন')}
              </button>
            )}
          </div>
        )
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
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
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
              maxHeight: '420px',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Reaction Footer Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'var(--card-bg, #ffffff)',
        borderTop: '1px solid var(--border-light)'
      }}>
        {/* Like Button & Counter Pill [👍 2] */}
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isLiked ? '#eff6ff' : '#f8fafc',
            border: isLiked ? '1px solid #93c5fd' : '1px solid #cbd5e1',
            borderRadius: '20px',
            padding: '3px 10px 3px 4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            transform: likeAnimating ? 'scale(1.15)' : 'scale(1)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#1877f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800
          }}>
            👍
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {likesCount}
          </span>
        </button>
      </div>
    </div>
  );
}
