# Push Notifications Implementation Guide

To send instant push notifications to your users' mobile screens when a new job circular is published, the best, free, and industry-standard solution is **Firebase Cloud Messaging (FCM)** integrated via **Capacitor**.

Here is the step-by-step implementation guide:

---

## 1. Setup Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g., "Job Circular").
3. Add an **Android App** to the Firebase project:
   - Use the exact package name from `capacitor.config.json`: `com.jobcircular.app`.
4. Download the **`google-services.json`** file.
5. Move `google-services.json` into your local project directory at:
   `android/app/google-services.json`

---

## 2. Install Capacitor Push Plugins
Run the following commands in the root of your project to install the official Capacitor push notification plugins:

```bash
# Install the Push Notifications plugin
npm install @capacitor/push-notifications

# Sync the changes to your Android project
npx cap sync
```

---

## 3. Register Push Services in React (`src/main.jsx` or startup)

Add the following listener code in your React app (e.g., inside `src/App.jsx` or a dedicated hook) to register the device token and handle incoming notifications when the app is open or in the background:

```javascript
import { PushNotifications } from '@capacitor/push-notifications';

const setupPushNotifications = async () => {
  // 1. Request permission from the user
  let permStatus = await PushNotifications.checkPermissions();
  
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  
  if (permStatus.receive !== 'granted') {
    console.warn("User denied push notification permissions.");
    return;
  }

  // 2. Register the app with Firebase/APNS
  await PushNotifications.register();

  // 3. Get the device token (Save this to your database to send alerts later)
  PushNotifications.addListener('registration', (token) => {
    console.log('FCM Token generated:', token.value);
    // Send token.value to your server database (e.g. Node.js/PHP backend)
  });

  // 4. Handle registration errors
  PushNotifications.addListener('registrationError', (err) => {
    console.error('Error during registration: ', err);
  });

  // 5. Handle notification received while app is active
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground: ', notification);
  });

  // 6. Handle notification click action
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push action performed: ', action);
    // Example: Navigate to specific circular details
    // window.location.href = `/job/${action.notification.data.jobId}`;
  });
};
```

You can call `setupPushNotifications()` inside a `useEffect` hook in `App.jsx` when the app loads.

---

## 4. Enable Background Push Notifications in Android Manifest
Open your `android/app/src/main/AndroidManifest.xml` and ensure the permissions and receivers are registered (Capacitor usually handles this automatically, but double check):

```xml
<!-- Inside <manifest> -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<!-- For Android 13+ push permission prompts -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

---

## 5. How to Send Notifications when a New Circular is Added
Whenever a new circular is posted, you need a mechanism to tell Firebase to send notifications.

### Option A: Firebase Cloud Functions / Admin Panel Server (Node.js Example)
If you have a backend server (Node.js / Express / Firebase Functions), you can send notifications using the `firebase-admin` SDK:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

const sendNewCircularNotification = async (titleEn, titleBn, jobId) => {
  const message = {
    notification: {
      title: 'নতুন চাকুরির বিজ্ঞপ্তি! 🚀',
      body: `${titleBn} - নিয়োগ বিজ্ঞপ্তিটি বিস্তারিত দেখুন।`
    },
    data: {
      jobId: jobId // Pass the ID so clicking the push navigates to the details
    },
    topic: 'all_users' // Sends to all users subscribed to the 'all_users' topic
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent push notification:', response);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};
```

### Option B: Using a wrapper service like OneSignal
If setting up a Firebase backend server is too complex, you can use **OneSignal**.
1. Create a OneSignal account.
2. Install `@onesignal/onesignal-cordova-plugin` (fully compatible with Capacitor).
3. Use their dashboard to send notifications manually, or trigger their API with a single HTTP POST request whenever you publish a circular.
