import { Capacitor } from '@capacitor/core';

const ONESIGNAL_APP_ID = '54decc7c-7653-48d2-bf9d-dc1bc0ff0307';
const ONESIGNAL_REST_API_KEY = 'os_v2_app_ktpmy7duknemfp453gn4b7yda5equ44365tucju74smqhzhhnzpxexvt6eog4oh1jrjftnk1qu5cr34frt7cdg5zdtq3tn3nskayxcq';

/**
 * Initialize OneSignal for push notifications.
 * Call once at app startup.
 */
export const initializeOneSignal = async () => {
  if (!Capacitor.isNativePlatform()) {
    console.log('OneSignal: Skipping initialization on web platform');
    return;
  }

  try {
    // OneSignal native SDK is initialized in MainActivity.java
    // The native SDK injects window.OneSignal for JS-side access
    if (window.plugins && window.plugins.OneSignal) {
      window.plugins.OneSignal.initialize(ONESIGNAL_APP_ID);
      window.plugins.OneSignal.Notifications.requestPermission(true);
      console.log('OneSignal initialized via Cordova plugin bridge');
    } else if (window.OneSignal) {
      window.OneSignal.initialize(ONESIGNAL_APP_ID);
      window.OneSignal.Notifications.requestPermission(true);
      console.log('OneSignal initialized via window.OneSignal');
    } else {
      // Native initialization in MainActivity.java handles everything
      console.log('OneSignal: Native initialization active (MainActivity.java)');
    }
  } catch (e) {
    console.log('OneSignal: Using native initialization only -', e.message);
  }
};

/**
 * Login the user to OneSignal with an external ID.
 * Allows targeted push notifications to specific users.
 */
export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform()) return;
  
  try {
    if (window.OneSignal) {
      window.OneSignal.login(externalId);
      console.log('OneSignal: User logged in with ID:', externalId);
    }
  } catch (e) {
    console.error('OneSignal login failed:', e);
  }
};

/**
 * Send a push notification to all subscribed users via OneSignal REST API.
 * This is called from the admin panel to broadcast notifications.
 * 
 * @param {string} title - Notification title
 * @param {string} body - Notification body text 
 * @param {object} data - Additional data payload (jobId, type, etc.)
 */
export const broadcastPush = async (title, body, data = {}) => {
  const apiKey = localStorage.getItem('onesignal_rest_api_key') || ONESIGNAL_REST_API_KEY;
  
  if (!apiKey) {
    console.warn('OneSignal REST API key not configured. Push skipped.');
    return null;
  }

  try {
    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { en: title },
        contents: { en: body },
        data: data,
        android_channel_id: 'default_channel_id',
        small_icon: 'ic_launcher',
        android_accent_color: 'FF1a56db'
      })
    });

    const result = await response.json();
    console.log('OneSignal push sent:', result);
    return result;
  } catch (error) {
    console.error('OneSignal push error:', error);
    throw error;
  }
};
