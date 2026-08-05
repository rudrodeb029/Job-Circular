import { Capacitor } from '@capacitor/core';

/**
 * OneSignal JavaScript Wrapper for Capacitor
 * This uses the onesignal-cordova-plugin which is compatible with Capacitor.
 */
export const initializeOneSignal = () => {
  if (!Capacitor.isNativePlatform()) return;

  // Access the OneSignal plugin from window (since it's a Cordova plugin)
  const OneSignal = window.OneSignal;

  if (OneSignal) {
    try {
      // OneSignal v5 initialization in JS
      // Note: We already initialized in MainActivity.java, so this ensures
      // the JS side is also aware and ready.
      OneSignal.initialize("54decc7c-7653-48d2-bf9d-dc1bc0ff0307");

      // Request permission
      OneSignal.Notifications.requestPermission(true);

      console.log('OneSignal JS side initialized');
    } catch (e) {
      console.error('OneSignal JS initialization failed:', e);
    }
  } else {
    console.warn('OneSignal window object not found. Ensure the plugin is installed.');
  }
};

/**
 * Login the user to OneSignal with an external ID (e.g. phone number or email)
 * This allows targeting this specific user from the OneSignal dashboard.
 */
export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform() || !window.OneSignal) return;

  try {
    window.OneSignal.login(externalId);
    console.log('OneSignal user logged in:', externalId);
  } catch (e) {
    console.error('OneSignal login failed:', e);
  }
};
