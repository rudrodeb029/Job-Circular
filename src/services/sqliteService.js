import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { supabase } from './supabaseClient';

const isNative = Capacitor.isNativePlatform();
let sqliteConnection = null;
let dbInstance = null;

// Global Mutex Lock to prevent duplicate concurrent network requests
let isDeltaSyncing = false;

// Mock Web Fallback Database (IndexedDB / LocalMemory based)
let mockDatabase = [];

// Helper to load mock database from localStorage on startup
const loadMockData = () => {
  try {
    const saved = localStorage.getItem('sqlite_mock_offline_feed');
    if (saved) {
      mockDatabase = JSON.parse(saved);
    } else {
      // Seed dummy records for first-load offline testing
      mockDatabase = [
        { id: 'mock-1', title: 'বিসিএস প্রস্তুতি গাইড', content: '৪৬তম বিসিএস পরীক্ষার সাধারণ বিজ্ঞান বিষয়ভিত্তিক গুরুত্বপূর্ণ নোটিশ ও প্রশ্ন সমাধান।', updated_at: Date.now() - 3600000 },
        { id: 'mock-2', title: 'প্রাইমারি শিক্ষক নিয়োগ ২০২৬', content: 'প্রাইমারি সহকারী শিক্ষক নিয়োগ পরীক্ষার সময়সূচী ও প্রবেশপত্র ডাউনলোডের আপডেট।', updated_at: Date.now() - 7200000 },
        { id: 'mock-3', title: 'ব্যাংক জব প্রিপারেশন', content: 'রাষ্ট্রায়ত্ত ব্যাংকসমূহের সিনিয়র অফিসার পদের লিখিত পরীক্ষার তারিখ ঘোষণা।', updated_at: Date.now() - 10800000 }
      ];
      localStorage.setItem('sqlite_mock_offline_feed', JSON.stringify(mockDatabase));
    }
  } catch (e) {
    console.warn('Failed to load mock SQLite database:', e);
  }
};

/**
 * Check if a delta sync operation is currently active.
 */
export const isSyncInProgress = () => isDeltaSyncing;

/**
 * Initialize SQLite Database & Tables
 */
export const initDb = async () => {
  if (!isNative) {
    console.log('🔌 Running on Web: Initializing mock SQLite IndexedDB Fallback.');
    loadMockData();
    return true;
  }

  try {
    if (!sqliteConnection) {
      sqliteConnection = new SQLiteConnection(CapacitorSQLite);
    }

    // Create / Open Connection
    dbInstance = await sqliteConnection.createConnection(
      'text_cache_db',
      false, // encrypted
      'no-encryption',
      1, // version
      false // readonly
    );

    await dbInstance.open();
    console.log('💾 Native SQLite Connection Opened Successfully.');

    // 1. Create offline_feed Table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS offline_feed (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `;
    await dbInstance.execute(createTableQuery);

    // 2. Create B-Tree Index on updated_at
    const createIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_offline_feed_updated_at 
      ON offline_feed (updated_at);
    `;
    await dbInstance.execute(createIndexQuery);
    console.log('📈 SQLite Table & updated_at B-Tree Index Verified.');

    return true;
  } catch (err) {
    console.error('❌ Failed to initialize native SQLite database:', err);
    return false;
  }
};

/**
 * Fetch Paginated Records from Local SQLite
 * ORDER BY updated_at DESC LIMIT :limit OFFSET :offset
 */
export const getOfflineFeed = async (limit = 20, offset = 0) => {
  if (!isNative) {
    // Sort mock database by updated_at descending
    const sorted = [...mockDatabase].sort((a, b) => b.updated_at - a.updated_at);
    return sorted.slice(offset, offset + limit);
  }

  try {
    if (!dbInstance) await initDb();
    const queryStr = `
      SELECT * FROM offline_feed 
      ORDER BY updated_at DESC 
      LIMIT ? OFFSET ?;
    `;
    const res = await dbInstance.query(queryStr, [limit, offset]);
    return res?.values || [];
  } catch (err) {
    console.error('❌ SQLite Fetch Error:', err);
    return [];
  }
};

/**
 * Perform Background Delta Sync with Supabase / Cloudflare Worker.
 * Guaranteed strictly SINGLE HTTP request execution using global mutex lock.
 */
export const triggerDeltaSync = async () => {
  // 1. API Call Locking Guard: Reject duplicate requests if a sync is already running
  if (isDeltaSyncing) {
    console.warn('🔒 Sync Lock Active: A delta sync is already running. Skipping redundant request to Cloudflare Worker.');
    return false;
  }

  if (!navigator.onLine) {
    console.log('📡 Offline: Bypassing Supabase background sync.');
    return false;
  }

  // Acquire Lock
  isDeltaSyncing = true;

  try {
    // 2. Get local maximum updated_at timestamp
    let localMaxUpdatedAt = 0;

    if (!isNative) {
      if (mockDatabase.length > 0) {
        localMaxUpdatedAt = Math.max(...mockDatabase.map(d => Number(d.updated_at) || 0));
      }
    } else {
      if (!dbInstance) await initDb();
      const res = await dbInstance.query('SELECT MAX(updated_at) as max_val FROM offline_feed;');
      const maxVal = res?.values?.[0]?.max_val;
      if (maxVal) {
        localMaxUpdatedAt = Number(maxVal);
      }
    }

    console.log(`🔄 Single-Request Delta Sync: Querying Cloudflare Worker for updates after: ${localMaxUpdatedAt}`);

    // 3. Execute EXACTLY 1 HTTP GET request through Cloudflare Worker proxy
    const { data: newRows, error } = await supabase
      .from('offline_feed')
      .select('id, title, content, updated_at')
      .gt('updated_at', localMaxUpdatedAt)
      .order('updated_at', { ascending: true })
      .limit(500);

    if (error) throw error;

    if (!newRows || newRows.length === 0) {
      console.log('✅ Delta Sync: Local SQLite is already up to date. (1 HTTP Request executed)');
      return false;
    }

    console.log(`📥 Delta Sync: Received ${newRows.length} new records. Batch saving into SQLite...`);

    // 4. Batch insert into SQLite using a single transaction
    if (!isNative) {
      newRows.forEach(row => {
        const idx = mockDatabase.findIndex(d => d.id === row.id);
        if (idx !== -1) {
          mockDatabase[idx] = row;
        } else {
          mockDatabase.push(row);
        }
      });
      localStorage.setItem('sqlite_mock_offline_feed', JSON.stringify(mockDatabase));
    } else {
      const statements = newRows.map(row => ({
        statement: 'INSERT OR REPLACE INTO offline_feed (id, title, content, updated_at) VALUES (?, ?, ?, ?);',
        values: [String(row.id), String(row.title || ''), String(row.content || ''), Number(row.updated_at)]
      }));
      
      await dbInstance.executeTransaction(statements);
    }

    console.log('🎉 Delta Sync: SQLite database updated successfully.');

    // 5. Dispatch single event to UI listeners
    window.dispatchEvent(new CustomEvent('offline_feed_synced', { detail: newRows }));
    return true;
  } catch (err) {
    console.error('❌ Delta sync failed:', err);
    return false;
  } finally {
    // Always release lock regardless of success or failure
    isDeltaSyncing = false;
  }
};
