import { getDocument, setDocument, COLLECTIONS } from '../services/supabaseService';

export const DEFAULT_APP_INFO = {
  contactEmail: 'support@livecircular.app',
  contactPhone: '+8801700000000',
  whatsappNumber: '+8801700000000',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.jobcircular.app',
  shareAppUrl: 'https://job-circular-75dbb.web.app',
  facebookPageUrl: 'https://facebook.com',
  telegramChannelUrl: 'https://t.me',
  supportHours: 'Sat - Thu: 9:00 AM - 9:00 PM'
};

let _appInfoCache = null;

/**
 * Fetches dynamic Contact Us, Rate Us, and Share App links from Firestore.
 * @param {boolean} forceRefresh - Bypass cache and fetch fresh from Firestore
 */
export const getAppInfoConfig = async (forceRefresh = false) => {
  if (_appInfoCache && !forceRefresh) return _appInfoCache;

  try {
    const doc = await getDocument(COLLECTIONS.APP_CONFIG, 'contactAndInfo');
    if (doc) {
      _appInfoCache = { ...DEFAULT_APP_INFO, ...doc };
      return _appInfoCache;
    }
  } catch (err) {
    console.warn('AppInfo: Firestore fetch failed, using default info:', err.message);
  }

  _appInfoCache = { ...DEFAULT_APP_INFO };
  return _appInfoCache;
};

/**
 * Saves dynamic Contact Us, Rate Us, and Share App configuration to Firestore.
 * @param {Object} config - Config payload from Admin Panel
 */
export const saveAppInfoConfig = async (config) => {
  const updated = {
    ...DEFAULT_APP_INFO,
    ...config,
    updatedAt: new Date().toISOString()
  };
  await setDocument(COLLECTIONS.APP_CONFIG, 'contactAndInfo', updated);
  _appInfoCache = updated;
  return updated;
};
