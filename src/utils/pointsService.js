import { getDocument, setDocument, COLLECTIONS } from '../services/supabaseService';
import { SUPABASE_CONFIG } from '../services/supabaseClient';

export const POINTS_CONFIG = {
  POINTS_PER_AD: 10,
  DEFAULT_EXAM_COST: 20,
  DAILY_AD_LIMIT: 10,
  WELCOME_BONUS: 10,
  STORAGE_KEY: 'live_exam_points_state_v1'
};

const getTodayStr = () => new Date().toISOString().slice(0, 10);

const getDefaultPointsState = () => {
  const nowIso = new Date().toISOString();
  return {
    points: POINTS_CONFIG.WELCOME_BONUS,
    unlockedExams: [],
    dailyAdDate: getTodayStr(),
    dailyAdCount: 0,
    history: [
      {
        id: 'welcome_bonus',
        type: 'bonus',
        amount: POINTS_CONFIG.WELCOME_BONUS,
        titleBn: 'স্বাগতম বোনাস পয়েন্ট',
        titleEn: 'Welcome Bonus Points',
        createdAt: nowIso
      }
    ],
    updatedAt: nowIso
  };
};

/**
 * Reads the current points state from localStorage (with daily counter reset if date changed).
 */
export const loadLocalPointsState = () => {
  try {
    const raw = localStorage.getItem(POINTS_CONFIG.STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultPointsState();
      localStorage.setItem(POINTS_CONFIG.STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const today = getTodayStr();
    const dailyAdCount = parsed.dailyAdDate === today ? (Number(parsed.dailyAdCount) || 0) : 0;

    return {
      points: typeof parsed.points === 'number' && !isNaN(parsed.points) ? Math.max(0, parsed.points) : POINTS_CONFIG.WELCOME_BONUS,
      unlockedExams: Array.isArray(parsed.unlockedExams) ? parsed.unlockedExams.map(String) : [],
      dailyAdDate: today,
      dailyAdCount,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 25) : [],
      updatedAt: parsed.updatedAt || new Date().toISOString()
    };
  } catch (e) {
    const fallback = getDefaultPointsState();
    return fallback;
  }
};

/**
 * Saves points state to localStorage and dispatches a global event for instant UI sync.
 */
export const saveLocalPointsState = (nextState) => {
  try {
    const cleanState = {
      ...nextState,
      points: Math.max(0, Number(nextState.points) || 0),
      unlockedExams: Array.from(new Set((nextState.unlockedExams || []).map(String))),
      history: (nextState.history || []).slice(0, 25),
      updatedAt: nextState.updatedAt || new Date().toISOString()
    };
    localStorage.setItem(POINTS_CONFIG.STORAGE_KEY, JSON.stringify(cleanState));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('live_exam_points_updated', { detail: cleanState }));
    }
    return cleanState;
  } catch (e) {
    console.warn('Failed to save local points state:', e);
    return nextState;
  }
};

/**
 * Pushes the user's current Live Exam Points state to Supabase `users` table
 * and Cloudflare Worker D1 queue.
 */
export const pushPointsToSupabase = async (userId, pointsState, userContext = {}) => {
  if (!userId) return false;
  try {
    const savedUser = JSON.parse(localStorage.getItem('job_user') || '{}');
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');

    const payload = {
      id: userId,
      name: userContext.name ?? savedUser.name ?? '',
      phone: userContext.phone ?? savedUser.phone ?? '',
      qualification: userContext.qualification ?? savedUser.qualification ?? '',
      category: userContext.category ?? savedUser.category ?? 'gov',
      location: userContext.location ?? savedUser.location ?? '',
      avatar: userContext.avatar ?? savedUser.avatar ?? null,
      savedJobs,
      appliedJobs,
      liveExamPoints: Number(pointsState.points) || 0,
      unlockedExams: Array.isArray(pointsState.unlockedExams) ? pointsState.unlockedExams : [],
      dailyAdDate: pointsState.dailyAdDate || getTodayStr(),
      dailyAdCount: Number(pointsState.dailyAdCount) || 0,
      pointsHistory: Array.isArray(pointsState.history) ? pointsState.history.slice(0, 20) : [],
      pointsUpdatedAt: pointsState.updatedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Direct Supabase `users` table upsert (stores in `raw_data` JSONB + columns)
    await setDocument(COLLECTIONS.USERS, userId, payload);

    // 2. Also notify Cloudflare Worker /user/update queue
    const proxyUrl = SUPABASE_CONFIG.cloudflareProxyUrl || 'https://job-circular-proxy.rudrodeb029.workers.dev';
    fetch(`${proxyUrl}/user/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userData: payload
      })
    }).catch(() => {});

    return true;
  } catch (err) {
    console.warn('Supabase points sync warning (will retry on next action):', err?.message || err);
    return false;
  }
};

/**
 * Fetches the user's points record from Supabase `users` table on app startup
 * and reconciles it with local state.
 */
export const syncPointsFromSupabase = async (userId) => {
  const local = loadLocalPointsState();
  if (!userId || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return local;
  }

  try {
    const remoteUser = await getDocument(COLLECTIONS.USERS, userId, true);
    if (!remoteUser) {
      // First time user in Supabase — seed their initial points record
      await pushPointsToSupabase(userId, local);
      return local;
    }

    const hasRemotePoints = typeof remoteUser.liveExamPoints === 'number' && !isNaN(remoteUser.liveExamPoints);
    if (!hasRemotePoints) {
      // User exists in Supabase but didn't have points field yet — push local points
      await pushPointsToSupabase(userId, local, remoteUser);
      return local;
    }

    const remoteTime = new Date(remoteUser.pointsUpdatedAt || remoteUser.updatedAt || 0).getTime();
    const localTime = new Date(local.updatedAt || 0).getTime();
    const today = getTodayStr();

    // Merge unlocked exams from both local and Supabase so user never loses an unlocked exam
    const mergedUnlocked = Array.from(
      new Set([
        ...(Array.isArray(local.unlockedExams) ? local.unlockedExams : []),
        ...(Array.isArray(remoteUser.unlockedExams) ? remoteUser.unlockedExams : [])
      ].map(String))
    );

    let mergedState;
    if (remoteTime > localTime) {
      mergedState = {
        points: Math.max(0, Number(remoteUser.liveExamPoints) || 0),
        unlockedExams: mergedUnlocked,
        dailyAdDate: today,
        dailyAdCount: remoteUser.dailyAdDate === today ? (Number(remoteUser.dailyAdCount) || 0) : 0,
        history: Array.isArray(remoteUser.pointsHistory) && remoteUser.pointsHistory.length > 0
          ? remoteUser.pointsHistory
          : local.history,
        updatedAt: remoteUser.pointsUpdatedAt || remoteUser.updatedAt || new Date().toISOString()
      };
    } else {
      mergedState = {
        ...local,
        unlockedExams: mergedUnlocked
      };
      // If local is newer, make sure Supabase has latest
      if (localTime > remoteTime) {
        pushPointsToSupabase(userId, mergedState, remoteUser);
      }
    }

    return saveLocalPointsState(mergedState);
  } catch (err) {
    console.warn('Error syncing points from Supabase:', err?.message || err);
    return local;
  }
};

/**
 * Returns the point cost required for a given Live Exam.
 */
export const getExamPointCost = (exam) => {
  if (!exam) return POINTS_CONFIG.DEFAULT_EXAM_COST;
  const rawCost = exam.pointCost ?? exam.points ?? exam.entryPoints;
  if (rawCost !== undefined && rawCost !== null && rawCost !== '') {
    const parsed = Number(rawCost);
    if (!isNaN(parsed) && parsed >= 0) return parsed;
  }
  return POINTS_CONFIG.DEFAULT_EXAM_COST;
};

/**
 * Checks whether an exam is already unlocked or free.
 */
export const isExamUnlockedForUser = (exam, pointsState) => {
  if (!exam) return false;
  const cost = getExamPointCost(exam);
  if (cost <= 0) return true;
  const state = pointsState || loadLocalPointsState();
  const examIdStr = String(exam.id);
  if (Array.isArray(state.unlockedExams) && state.unlockedExams.includes(examIdStr)) {
    return true;
  }
  // Also check if user already submitted this exam
  try {
    const results = JSON.parse(localStorage.getItem('live_exam_results') || '{}');
    if (results[examIdStr] && !results[examIdStr].didNotAttend) {
      return true;
    }
  } catch (e) {}
  return false;
};
