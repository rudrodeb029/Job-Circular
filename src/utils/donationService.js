import { getDocument, setDocument, addDocument, getCollection, deleteDocument, normalizeDoc, COLLECTIONS } from '../services/supabaseService';
import { supabase } from '../services/supabaseClient';

export const DEFAULT_DONATION_CONFIG = {
  bkashNumber: '01750-123456',
  nagadNumber: '01850-654321',
  bkashActive: true,
  nagadActive: true
};

let _donationConfigCache = null;

/**
 * Fetch dynamic donation gateway numbers (bKash & Nagad) from Supabase/app_config
 */
export const getDonationConfig = async (forceRefresh = false) => {
  if (_donationConfigCache && !forceRefresh) return _donationConfigCache;

  try {
    const doc = await getDocument(COLLECTIONS.APP_CONFIG, 'donationSettings', forceRefresh);
    if (doc) {
      _donationConfigCache = {
        ...DEFAULT_DONATION_CONFIG,
        ...doc
      };
      return _donationConfigCache;
    }
  } catch (err) {
    console.warn('getDonationConfig error, using default:', err.message);
  }

  _donationConfigCache = { ...DEFAULT_DONATION_CONFIG };
  return _donationConfigCache;
};

/**
 * Save dynamic donation gateway numbers from Admin Panel to Supabase
 */
export const saveDonationConfig = async (config) => {
  const payload = {
    ...DEFAULT_DONATION_CONFIG,
    ...config,
    updatedAt: new Date().toISOString()
  };
  await setDocument(COLLECTIONS.APP_CONFIG, 'donationSettings', payload);
  _donationConfigCache = payload;
  return payload;
};

/**
 * Record a donor submission (sender number, TrxID, amount, gateway, donor name)
 * Stores in Supabase 'activities' collection so Admin can see it in real-time
 */
export const recordDonationSubmission = async (donationData) => {
  try {
    const activityPayload = {
      type: 'donation',
      action: 'Donation Received',
      userName: donationData.donorName || (donationData.isAnonymous ? 'Anonymous Donor' : 'Donor'),
      senderPhone: donationData.senderPhone || '',
      trxId: donationData.trxId || '',
      amount: String(donationData.amount || '0'),
      currency: donationData.currency || 'BDT',
      gateway: donationData.gateway || 'bkash',
      isMonthly: Boolean(donationData.isMonthly),
      isAnonymous: Boolean(donationData.isAnonymous),
      description: `Donation of ৳${donationData.amount} via ${(donationData.gateway || 'bkash').toUpperCase()} (TrxID: ${donationData.trxId}, Sender: ${donationData.senderPhone || 'N/A'})`,
      createdAt: new Date().toISOString()
    };

    const saved = await addDocument(COLLECTIONS.ACTIVITIES, activityPayload);
    try {
      window.dispatchEvent(new CustomEvent('donation_received', { detail: saved }));
    } catch (e) {}
    return { success: true, data: saved };
  } catch (err) {
    console.error('recordDonationSubmission error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch all donation submissions from Supabase activities collection
 */
export const getDonations = async (forceServer = false) => {
  try {
    // 1. Direct query with orderBy
    const { data, error } = await supabase
      .from(COLLECTIONS.ACTIVITIES)
      .select('*')
      .order('createdAt', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data
        .map(normalizeDoc)
        .filter(item => item && (item.type === 'donation' || item.trxId || (item.action || '').toLowerCase().includes('donation')))
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    // 2. Fallback via getCollection
    const list = await getCollection(COLLECTIONS.ACTIVITIES, true);
    return (list || [])
      .map(normalizeDoc)
      .filter(item => item && (item.type === 'donation' || item.trxId || (item.action || '').toLowerCase().includes('donation')))
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.error('getDonations error:', err);
    return [];
  }
};

/**
 * Delete a donation submission by ID
 */
export const deleteDonation = async (donationId) => {
  try {
    return await deleteDocument(COLLECTIONS.ACTIVITIES, donationId);
  } catch (err) {
    console.error('deleteDonation error:', err);
    throw err;
  }
};
