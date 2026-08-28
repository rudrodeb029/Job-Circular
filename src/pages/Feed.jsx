import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, HeartFilled, Search, X } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import { useAdminContext } from '../context/AdminContext';
import { incrementFeedLike, addFeedComment } from '../services/supabaseService';
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
    const map = new Map();
    (state.feedPosts || []).forEach(p => map.set(p.id, p));
    (adminState.feedPosts || []).forEach(p => map.set(p.id, p));
    let posts = Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase().trim();
    return posts.filter(post => 
      (post.content && post.content.toLowerCase().includes(q)) ||
      (post.contentEn && post.contentEn.toLowerCase().includes(q))
    );
  }, [adminState.feedPosts, state.feedPosts, searchQuery]);

  return (
    <div className="page page-content animate-fade-in" style={{ paddingBottom: '80px', background: 'var(--bg-secondary, #f0f2f5)' }}>
      <AppHeader />

      <PullToRefresh>
        {/* Search Bar Row with App Icon */}
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {/* App Logo Icon */}
          <img
            src="/app-logo.png"
            alt="Live Circular Logo"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1.5px solid var(--primary, #1877f2)',
              boxShadow: '0 2px 8px rgba(24, 119, 242, 0.2)',
              flexShrink: 0
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
          <div style={{ flex: 1 }}>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search feed posts...' : 'ফিড পোস্ট খুঁজুন...'}
            />
          </div>
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

function UserAvatar({ name, avatar, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const initialLetter = (name && name.trim()) ? name.trim()[0].toUpperCase() : 'U';

  if (avatar && !imgError) {
    return (
      <img
        src={avatar}
        alt={name || 'User'}
        onError={() => setImgError(true)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--border-light)'
        }}
      />
    );
  }

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: `${Math.round(size * 0.44)}px`,
      flexShrink: 0,
      boxShadow: '0 2px 6px rgba(26, 86, 219, 0.2)'
    }}>
      {initialLetter}
    </div>
  );
}

const FacebookPostCard = React.memo(function FacebookPostCard({ post, isEn, isLiked, onToggleLike }) {
  const { state: appState } = useAppContext();
  const { state: adminState, dispatch: adminDispatch } = useAdminContext();

  const [expanded, setExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(Array.isArray(post.comments) ? post.comments : []);

  const getActiveUser = () => {
    let name = appState.user?.name;
    if (!name || name.trim() === '') {
      try {
        const saved = JSON.parse(localStorage.getItem('job_user') || '{}');
        if (saved.name) name = saved.name;
      } catch(e) {}
    }
    if (!name || name.trim() === '') {
      if (adminState.adminUser?.name) name = adminState.adminUser.name;
      else {
        try {
          const adminSaved = JSON.parse(localStorage.getItem('admin_user') || '{}');
          if (adminSaved.name) name = adminSaved.name;
        } catch(e) {}
      }
    }
    if (!name || name.trim() === '') {
      name = isEn ? 'Candidate User' : 'ইউজার';
    }

    let avatar = appState.user?.avatar || adminState.adminUser?.photoURL || null;
    if (!avatar) {
      try {
        const saved = JSON.parse(localStorage.getItem('job_user') || '{}');
        if (saved.avatar) avatar = saved.avatar;
      } catch(e) {}
    }

    return { name, avatar };
  };

  const activeUser = getActiveUser();

  const content = isEn ? (post.contentEn || post.content) : post.content;
  const isLong = content && content.length > 220;
  const displayContent = isLong && !expanded ? content.slice(0, 220) + '...' : content;

  const youtubeId = post.mediaType === 'youtube' ? getYouTubeId(post.mediaUrl) : null;
  const thumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;

  const isBannerPost = post.bannerGradient || (post.mediaType === 'text' && content && content.length < 180 && !post.mediaUrl);
  const bannerBg = post.bannerGradient ? (BANNER_GRADIENTS[post.bannerGradient] || post.bannerGradient) : BANNER_GRADIENTS.fire;

  const handleLike = () => {
    setLikeAnimating(true);
    onToggleLike();
    setTimeout(() => setLikeAnimating(false), 600);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;

    // Strict URL & link detection pattern
    const urlPattern = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.(com|net|org|io|dev|app|xyz|site|online|me|info|biz|co|cc|tv|link|tech|store|shop|blog|bd|gov|edu))/i;
    if (urlPattern.test(text)) {
      alert(
        isEn
          ? 'Links and URLs are not allowed in comments.'
          : 'মন্তব্যে কোনো প্রকার লিঙ্ক বা ইউআরএল (URL) পোস্ট করা যাবে না।'
      );
      return;
    }

    const newComment = {
      id: 'c_' + Date.now(),
      userName: activeUser.name,
      userAvatar: activeUser.avatar,
      text: text,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...localComments, newComment];
    setLocalComments(updatedComments);
    setCommentText('');

    const updatedPost = { ...post, comments: updatedComments };
    adminDispatch({ type: 'UPDATE_FEED_POST', payload: updatedPost });

    addFeedComment(post.id, newComment).catch(console.error);
  };

  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = (e) => {
    setIsInputFocused(true);
    const el = e.target;
    setTimeout(() => {
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const likesCount = Number(post.likes) || 0;
  const commentsCount = localComments.length;

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      borderTop: '1px solid var(--border-light)',
      borderBottom: '1px solid var(--border-light)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px 10px 14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/app-logo.png"
            alt="Live Circular Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
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
            color: 'white',
            fontSize: content && content.length < 80 ? '22px' : '18px',
            fontWeight: 800,
            lineHeight: 1.45,
            margin: 0,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
            wordBreak: 'break-word'
          }}>
            {content}
          </p>
        </div>
      ) : (
        content && (
          <div style={{ padding: '4px 14px 10px 14px' }}>
            <p style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              margin: 0,
              whiteSpace: 'pre-line'
            }}>
              {displayContent}
            </p>
            {isLong && (
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: 0,
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              >
                {expanded ? (isEn ? 'See less' : 'কম দেখুন') : (isEn ? 'See more' : 'আরও দেখুন')}
              </button>
            )}
          </div>
        )
      )}

      {post.mediaType === 'youtube' && youtubeId && (
        <div style={{ position: 'relative', width: '100%', background: '#000' }}>
          {!showVideo ? (
            <div
              onClick={() => setShowVideo(true)}
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                cursor: 'pointer',
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255, 0, 0, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(255, 0, 0, 0.5)',
                  transition: 'transform 0.2s'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '3px' }}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
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
          )}
        </div>
      )}

      {post.mediaType === 'image' && post.mediaUrl && (
        <div style={{ width: '100%', overflow: 'hidden', background: '#f8fafc' }}>
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

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 14px',
        background: 'var(--card-bg, #ffffff)',
        borderTop: '1px solid var(--border-light)'
      }}>
        {/* Love Reaction Button & Counter Pill [❤️ 2] */}
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isLiked ? '#fef2f2' : '#f8fafc',
            border: isLiked ? '1px solid #fca5a5' : '1px solid #cbd5e1',
            borderRadius: '20px',
            padding: '4px 12px 4px 6px',
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
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800,
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
          }}>
            ❤️
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {likesCount}
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: showComments ? '#f1f5f9' : '#f8fafc',
            border: showComments ? '1px solid #cbd5e1' : '1px solid #cbd5e1',
            borderRadius: '20px',
            padding: '4px 12px 4px 6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '11px',
            fontWeight: 800
          }}>
            💬
          </div>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {commentsCount}
          </span>
        </button>
      </div>

      {showComments && (
        <div style={{
          background: 'var(--bg-secondary, #f8fafc)',
          borderTop: '1px solid var(--border-light)',
          padding: '12px 14px 14px 14px'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '10px'
          }}>
            {isEn ? `Comments (${commentsCount})` : `মন্তব্যসমূহ (${commentsCount})`}
          </div>

          {localComments.length === 0 ? (
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              marginBottom: '12px',
              padding: '6px 0'
            }}>
              {isEn ? 'Be the first to comment...' : 'প্রথম মন্তব্যটি লিখুন...'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {localComments.map((comment, index) => (
                <div key={comment.id || index} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <UserAvatar name={comment.userName} avatar={comment.userAvatar} size={32} />

                  <div style={{
                    background: 'var(--card-bg, #ffffff)',
                    border: '1px solid var(--border-light)',
                    borderRadius: '14px',
                    padding: '8px 12px',
                    maxWidth: '85%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '2px'
                    }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {comment.userName || (isEn ? 'Candidate User' : 'ইউজার')}
                      </span>
                      {comment.createdAt && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {timeAgo(comment.createdAt, isEn)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Facebook-style Modern Comment Form */}
          <form onSubmit={handleAddComment} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <UserAvatar name={activeUser.name} avatar={activeUser.avatar} size={36} />

            <div style={{
              flex: 1,
              background: '#f0f2f5',
              borderRadius: '18px',
              padding: '8px 12px',
              border: isInputFocused ? '1.5px solid #1877f2' : '1px solid #e4e6eb',
              boxShadow: isInputFocused ? '0 0 0 3px rgba(24, 119, 242, 0.2)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={() => setIsInputFocused(false)}
                placeholder={
                  activeUser.name && activeUser.name !== 'ইউজার' && activeUser.name !== 'Candidate User'
                    ? (isEn ? `Comment as ${activeUser.name}...` : `${activeUser.name} হিসেবে মন্তব্য লিখুন...`)
                    : (isEn ? 'Write a comment...' : 'একটি মন্তব্য লিখুন...')
                }
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: '#050505',
                  padding: '2px 0'
                }}
              />

              {/* Bottom Right Send Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: commentText.trim() ? 'pointer' : 'default',
                    color: commentText.trim() ? '#1877f2' : '#bcc0c4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease'
                  }}
                  title={isEn ? 'Send Comment' : 'মন্তব্য পাঠান'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
});
