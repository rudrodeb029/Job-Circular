import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from '../components/Icons';
import { useAppContext } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import PullToRefresh from '../components/PullToRefresh';
import ModernLoader, { ModernPageSkeleton } from '../components/ModernLoader';
import { getOfflineFeed, triggerDeltaSync } from '../services/sqliteService';

export default function OfflineFeed() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const isEn = state.language === 'en';

  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Pagination reference values
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef();

  // Load a single page from SQLite
  const loadPageFromSqlite = useCallback(async (pageNum, replace = false) => {
    const limit = 20;
    const offset = pageNum * limit;
    
    console.log(`💾 SQLite Query: LIMIT ${limit} OFFSET ${offset}`);
    const results = await getOfflineFeed(limit, offset);
    
    if (replace) {
      setItems(results);
      setHasMore(results.length === limit);
      setPage(1);
    } else {
      if (results.length > 0) {
        setItems(prev => {
          // Avoid duplicate keys
          const existingIds = new Set(prev.map(i => i.id));
          const filtered = results.filter(r => !existingIds.has(r.id));
          return [...prev, ...filtered];
        });
        setHasMore(results.length === limit);
        setPage(pageNum + 1);
      } else {
        setHasMore(false);
      }
    }
  }, []);

  // Initial instant database render
  useEffect(() => {
    const initialLoad = async () => {
      setPageLoading(true);
      await loadPageFromSqlite(0, true);
      setPageLoading(false);
    };

    initialLoad();
  }, [loadPageFromSqlite]);

  // Listen to background sync updates
  useEffect(() => {
    const handleSyncComplete = async () => {
      console.log('🔄 Offline Feed Sync Event: Reloading first page from SQLite.');
      await loadPageFromSqlite(0, true);
    };

    window.addEventListener('offline_feed_synced', handleSyncComplete);
    return () => {
      window.removeEventListener('offline_feed_synced', handleSyncComplete);
    };
  }, [loadPageFromSqlite]);

  // Pull to refresh manual sync trigger
  const handleRefresh = async () => {
    setIsSyncing(true);
    await triggerDeltaSync();
    await loadPageFromSqlite(0, true);
    setIsSyncing(false);
  };

  // Infinite Scroll Trigger intersection callback
  const lastElementRef = useCallback((node) => {
    if (pageLoading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setLoadingMore(true);
        await loadPageFromSqlite(page);
        setLoadingMore(false);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [pageLoading, loadingMore, hasMore, page, loadPageFromSqlite]);

  // Format date helper
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString(isEn ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="page" style={{ paddingBottom: '80px', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="page-header flex-between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ flex: 1, fontSize: '14.5px', fontWeight: 800 }}>
            {isEn ? 'Offline Text Feed' : 'অফলাইন টেক্সট ফিড'}
          </h1>
        </div>
        {isSyncing && (
          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>
            {isEn ? 'Syncing...' : 'সিঙ্ক হচ্ছে...'}
          </span>
        )}
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="page-content animate-fade-in" style={{ padding: '16px' }}>
          
          {/* Info Card */}
          <div style={{
            background: 'var(--white)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              ⚡ {isEn ? 'High-Performance Local Cache' : 'উচ্চ-ক্ষমতাসম্পন্ন লোকাল ক্যাশ'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {isEn 
                ? 'This page retrieves text directly from your device SQLite database for instant rendering, syncing updates silently from Supabase in the background.' 
                : 'এই পেজের তথ্য সরাসরি ফোনের SQLite ডাটাবেজ থেকে লোড করা হয় যা ইন্টারনেট ছাড়া তাৎক্ষণিক দেখা যায় এবং নতুন ডাটা থাকলে ব্যাকগ্রাউন্ডে Supabase থেকে সিঙ্ক হয়।'}
            </p>
          </div>

          {pageLoading ? (
            <ModernPageSkeleton type="feed" icon="⚡" />
          ) : items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item, idx) => {
                const isLast = idx === items.length - 1;
                return (
                  <div
                    key={item.id}
                    ref={isLast ? lastElementRef : null}
                    className="job-card"
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'var(--white)',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <h4 className="job-card-title" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                      {item.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <span>{formatDate(item.updated_at)}</span>
                    </div>
                  </div>
                );
              })}

              {loadingMore && (
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                  <ModernLoader size="sm" />
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '13px' }}>
                {isEn ? 'No cached records found.' : 'কোনো ক্যাশ করা ডাটা পাওয়া যায়নি।'}
              </p>
            </div>
          )}
        </div>
      </PullToRefresh>
      <BottomNav />
    </div>
  );
}
