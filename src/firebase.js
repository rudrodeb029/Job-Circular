// Firebase configuration and initialization (Local Dependency Version)
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCHc-3zYaRovCja6-Mqq-l1oRIh2JeQkCg",
  authDomain: "job-circular-75dbb.firebaseapp.com",
  databaseURL: "https://job-circular-75dbb-default-rtdb.firebaseio.com",
  projectId: "job-circular-75dbb",
  storageBucket: "job-circular-75dbb.firebasestorage.app",
  messagingSenderId: "67566831458",
  appId: "1:67566831458:web:630e573ea6832eabb10e3b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
export const db = getFirestore(app);

try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence unsupported by browser');
    }
  });
} catch (e) {
  console.warn('Firestore persistence setup warning:', e);
}

export default app;
