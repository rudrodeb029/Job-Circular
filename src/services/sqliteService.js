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
 * Reads all cached offline sync data from local storage / SQLite instantly.
 * Guaranteed 0 Network Requests, Sub-5ms execution time.
 */
export const getLocalSyncData = () => {
  const getItem = (key) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : [];
    } catch (e) {
      return [];
    }
  };

  return {
    jobs: getItem('cache_data_jobs'),
    notifications: getItem('cache_data_notifications'),
    admits: getItem('cache_data_admits'),
    questions: getItem('cache_data_questions') || getItem('questions_data'),
    liveExams: getItem('cache_data_live_exams'),
    feedPosts: getItem('cache_data_feed_posts'),
    appConfig: getItem('cache_data_app_config'),
    lastSyncTimestamp: Number(localStorage.getItem('last_sync_timestamp') || 0)
  };
};

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

    // 3. Live Exam Tables (অফলাইন পরীক্ষা সাপোর্ট)
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS local_exams (
        id TEXT PRIMARY KEY,
        title TEXT, title_en TEXT,
        duration INTEGER, total_questions INTEGER,
        questions TEXT,
        status TEXT, scheduled_at TEXT, created_at TEXT
      );
    `);
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS local_answers (
        exam_id TEXT NOT NULL,
        question_index INTEGER NOT NULL,
        selected_option INTEGER NOT NULL,
        answered_at TEXT NOT NULL,
        PRIMARY KEY (exam_id, question_index)
      );
    `);
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS exam_results (
        exam_id TEXT PRIMARY KEY,
        score INTEGER, total INTEGER, scaled_score REAL,
        rank INTEGER, time_taken TEXT, submitted_at TEXT
      );
    `);
    await dbInstance.execute(`
      CREATE TABLE IF NOT EXISTS leaderboard_cache (
        exam_id TEXT NOT NULL, rank INTEGER NOT NULL,
        user_name TEXT, user_photo TEXT,
        score INTEGER, total INTEGER, scaled_score REAL, time_taken_sec INTEGER,
        PRIMARY KEY (exam_id, rank)
      );
    `);
    console.log('🏆 Live Exam SQLite Tables Verified.');

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

// ══════════════════════════════════════
// Live Exam SQLite Functions
// ══════════════════════════════════════

/**
 * Save exam data to SQLite for offline access (correctIndex already stripped by server).
 */
export const saveExamToSQLite = async (exam) => {
  if (!exam?.id) return;
  if (!isNative) {
    try {
      const key = `sqlite_exam_${exam.id}`;
      localStorage.setItem(key, JSON.stringify(exam));
    } catch (e) { console.warn('Mock saveExam:', e); }
    return;
  }
  try {
    if (!dbInstance) await initDb();
    await dbInstance.run(
      `INSERT OR REPLACE INTO local_exams (id, title, title_en, duration, total_questions, questions, status, scheduled_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [String(exam.id), exam.title || '', exam.titleEn || '', exam.duration || 0,
       exam.totalQuestions || exam.questions?.length || 0,
       JSON.stringify(exam.questions || []), exam.status || '',
       exam.scheduledAt || '', exam.createdAt || '']
    );
  } catch (e) { console.error('saveExamToSQLite error:', e); }
};

/**
 * Get exam from SQLite (offline).
 */
export const getExamFromSQLite = async (examId) => {
  if (!isNative) {
    try {
      const data = localStorage.getItem(`sqlite_exam_${examId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }
  try {
    if (!dbInstance) await initDb();
    const res = await dbInstance.query('SELECT * FROM local_exams WHERE id = ?', [String(examId)]);
    const row = res?.values?.[0];
    if (!row) return null;
    return { ...row, questions: JSON.parse(row.questions || '[]') };
  } catch (e) { console.error('getExamFromSQLite error:', e); return null; }
};

/**
 * Save a single answer to SQLite in real-time (as student selects MCQ).
 */
export const saveLocalAnswer = async (examId, questionIndex, selectedOption) => {
  if (!isNative) {
    try {
      const key = `sqlite_answers_${examId}`;
      const answers = JSON.parse(localStorage.getItem(key) || '{}');
      answers[questionIndex] = selectedOption;
      localStorage.setItem(key, JSON.stringify(answers));
    } catch (e) { console.warn('Mock saveAnswer:', e); }
    return;
  }
  try {
    if (!dbInstance) await initDb();
    await dbInstance.run(
      `INSERT OR REPLACE INTO local_answers (exam_id, question_index, selected_option, answered_at)
       VALUES (?, ?, ?, ?)`,
      [String(examId), questionIndex, selectedOption, new Date().toISOString()]
    );
  } catch (e) { console.error('saveLocalAnswer error:', e); }
};

/**
 * Get all saved answers for an exam from SQLite.
 */
export const getAllLocalAnswers = async (examId) => {
  if (!isNative) {
    try {
      return JSON.parse(localStorage.getItem(`sqlite_answers_${examId}`) || '{}');
    } catch (e) { return {}; }
  }
  try {
    if (!dbInstance) await initDb();
    const res = await dbInstance.query(
      'SELECT question_index, selected_option FROM local_answers WHERE exam_id = ?',
      [String(examId)]
    );
    const answers = {};
    (res?.values || []).forEach(r => { answers[r.question_index] = r.selected_option; });
    return answers;
  } catch (e) { console.error('getAllLocalAnswers error:', e); return {}; }
};

/**
 * Clear local answers after successful submission.
 */
export const clearLocalAnswers = async (examId) => {
  if (!isNative) {
    localStorage.removeItem(`sqlite_answers_${examId}`);
    return;
  }
  try {
    if (!dbInstance) await initDb();
    await dbInstance.run('DELETE FROM local_answers WHERE exam_id = ?', [String(examId)]);
  } catch (e) { console.error('clearLocalAnswers error:', e); }
};

/**
 * Save exam result from server (score, rank, etc.).
 */
export const saveExamResult = async (examId, result) => {
  if (!isNative) {
    try {
      localStorage.setItem(`sqlite_result_${examId}`, JSON.stringify(result));
    } catch (e) { console.warn('Mock saveResult:', e); }
    return;
  }
  try {
    if (!dbInstance) await initDb();
    await dbInstance.run(
      `INSERT OR REPLACE INTO exam_results (exam_id, score, total, scaled_score, rank, time_taken, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [String(examId), result.score || 0, result.total || 0, result.scaledScore || 0,
       result.rank || 0, result.timeTaken || '', new Date().toISOString()]
    );
  } catch (e) { console.error('saveExamResult error:', e); }
};

/**
 * Get exam result from SQLite (offline).
 */
export const getExamResult = async (examId) => {
  if (!isNative) {
    try {
      const data = localStorage.getItem(`sqlite_result_${examId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }
  try {
    if (!dbInstance) await initDb();
    const res = await dbInstance.query('SELECT * FROM exam_results WHERE exam_id = ?', [String(examId)]);
    return res?.values?.[0] || null;
  } catch (e) { console.error('getExamResult error:', e); return null; }
};

/**
 * Save full leaderboard to SQLite (download once, offline forever).
 */
export const saveLeaderboard = async (examId, leaderboard) => {
  if (!Array.isArray(leaderboard) || !leaderboard.length) return;
  if (!isNative) {
    try {
      localStorage.setItem(`sqlite_lb_${examId}`, JSON.stringify(leaderboard));
    } catch (e) { console.warn('Mock saveLeaderboard:', e); }
    return;
  }
  try {
    if (!dbInstance) await initDb();
    // Clear old leaderboard for this exam
    await dbInstance.run('DELETE FROM leaderboard_cache WHERE exam_id = ?', [String(examId)]);
    // Insert all entries
    const statements = leaderboard.map((entry, i) => ({
      statement: `INSERT OR REPLACE INTO leaderboard_cache
        (exam_id, rank, user_name, user_photo, score, total, scaled_score, time_taken_sec)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      values: [String(examId), entry.rank || i + 1, entry.userName || entry.user_name || '',
               entry.userPhoto || entry.user_photo || '', entry.score || 0, entry.total || 0,
               entry.scaledScore || entry.scaled_score || 0, entry.timeTakenSec || entry.time_taken_sec || 0]
    }));
    await dbInstance.executeTransaction(statements);
  } catch (e) { console.error('saveLeaderboard error:', e); }
};

/**
 * Get leaderboard from SQLite (offline — zero server requests!).
 */
export const getLeaderboard = async (examId) => {
  if (!isNative) {
    try {
      const data = localStorage.getItem(`sqlite_lb_${examId}`);
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  }
  try {
    if (!dbInstance) await initDb();
    const res = await dbInstance.query(
      'SELECT * FROM leaderboard_cache WHERE exam_id = ? ORDER BY rank ASC',
      [String(examId)]
    );
    return res?.values?.length ? res.values : null;
  } catch (e) { console.error('getLeaderboard error:', e); return null; }
};
