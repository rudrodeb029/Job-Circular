// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';


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

// Initialize Firestore
export const db = getFirestore(app);

export default app;
