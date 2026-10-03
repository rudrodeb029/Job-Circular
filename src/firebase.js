import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCHc-3zYaRovCja6-Mqq-l1oRIh2JeQkCg",
  authDomain: "job-circular-75dbb.firebaseapp.com",
  databaseURL: "https://job-circular-75dbb-default-rtdb.firebaseio.com",
  projectId: "job-circular-75dbb",
  storageBucket: "job-circular-75dbb.firebasestorage.app",
  messagingSenderId: "67566831458",
  appId: "1:67566831458:web:630e573ea6832eabb10e3b"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore instance for OneSignal push notification integration
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firebase Analytics (Asynchronously checked for browser/native support)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('[Firebase Analytics] Successfully initialized');
    }
  }).catch((err) => {
    console.log('[Firebase Analytics] Not supported in current environment:', err);
  });
}

/**
 * Safely log custom Firebase Analytics events
 * @param {string} eventName 
 * @param {object} eventParams 
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (e) {
      console.warn('[Firebase Analytics] Event logging error:', e);
    }
  }
};

export default app;
