import { getDocument, setDocument, addDocument, COLLECTIONS } from '../services/firestoreService';

export const DEFAULT_DONATION_CONFIG = {
  bkashNumber: '01750-123456',
  nagadNumber: '01850-654321',
  bkashActive: true,
  nagadActive: true
};

let _donationConfigCache = null;

/**
 * Fetch dynamic donation gateway numbers (bKash & Nagad) from Firestore/appConfig
 */
export const getDonationConfig = async (forceRefresh = false) => {
  if (_donationConfigCache && !forceRefresh) return _donationConfigCache;

  try {
    const doc = await getDocument(COLLECTIONS.APP_CONFIG, 'donationSettings');
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
 * Save dynamic donation gateway numbers from Admin Panel to Firestore
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
 * Stores in Firestore 'activities' collection so Admin can see it in real-time
 */
export const recordDonationSubmission = async (donationData) => {
  try {
    const activityPayload = {
      type: 'donation',
      action: 'Donation Received',
      userName: donationData.donorName || (donationData.isAnonymous ? 'Anonymous Donor' : 'Donor'),
      senderPhone: donationData.senderPhone || '',
      trxId: donationData.trxId || '',
      amount: donationData.amount || '0',
      currency: donationData.currency || 'BDT',
      gateway: donationData.gateway || 'bkash',
      isMonthly: Boolean(donationData.isMonthly),
      isAnonymous: Boolean(donationData.isAnonymous),
      description: `Donation of ৳${donationData.amount} via ${donationData.gateway.toUpperCase()} (TrxID: ${donationData.trxId}, Sender: ${donationData.senderPhone || 'N/A'})`,
      createdAt: new Date().toISOString()
    };

    const saved = await addDocument(COLLECTIONS.ACTIVITIES, activityPayload);
    return { success: true, data: saved };
  } catch (err) {
    console.error('recordDonationSubmission error:', err);
    return { success: false, error: err.message };
  }
};
