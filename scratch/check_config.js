import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCHc-3zYaRovCja6-Mqq-l1oRIh2JeQkCg",
  authDomain: "job-circular-75dbb.firebaseapp.com",
  databaseURL: "https://job-circular-75dbb-default-rtdb.firebaseio.com",
  projectId: "job-circular-75dbb",
  storageBucket: "job-circular-75dbb.firebasestorage.app",
  messagingSenderId: "67566831458",
  appId: "1:67566831458:web:630e573ea6832eabb10e3b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, 'appConfig', 'onesignal');
  const snap = await getDoc(docRef);
  const data = snap.data();
  
  const authHeader = data.restApiKey.startsWith('os_v2_app_') ? `Key ${data.restApiKey}` : `Basic ${data.restApiKey}`;

  const url = 'https://onesignal.com/api/v1/notifications';
  
  const payload = {
    app_id: data.appId,
    included_segments: ["Total Subscriptions"],
    headings: { en: 'Total Subscriptions Test 🔔' },
    contents: { en: 'Testing Total Subscriptions segment!' }
  };

  console.log('Sending Total Subscriptions push request...');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': authHeader
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json();
  console.log('Status:', res.status);
  console.log('Response:', JSON.stringify(body));
  process.exit(0);
}

check().catch(console.error);
