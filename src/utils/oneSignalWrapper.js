import { Capacitor } from '@capacitor/core';

const ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

/**
 * OneSignal JavaScript Wrapper for Capacitor
 */
export const initializeOneSignal = () => {
  if (!Capacitor.isNativePlatform()) return;

  const performInit = () => {
    // OneSignal is often injected into window.plugins
    const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

    if (OneSignal) {
      try {
        console.log('OneSignal: Initializing with ID:', ONESIGNAL_APP_ID);

        // OneSignal v5 initialization
        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(ONESIGNAL_APP_ID);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(ONESIGNAL_APP_ID);
        }

        // Request permission
        // We use a safe check because the plugin might still be initializing its sub-objects
        const requestPermission = () => {
            const OS = window.OneSignal || (window.plugins && window.plugins.OneSignal);
            if (OS && OS.Notifications && typeof OS.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Prompting for push permission...');
                OS.Notifications.requestPermission(true);
            } else if (OS && typeof OS.promptForPushNotificationsWithUserResponse === 'function') {
                // Fallback for older SDK versions
                OS.promptForPushNotificationsWithUserResponse();
            }
        };

        // Delay the prompt slightly to ensure app UI is loaded and bridge is fully ready
        setTimeout(requestPermission, 5000);

        console.log('OneSignal: JS initialization complete');
      } catch (e) {
        console.error('OneSignal: JS initialization error:', e);
      }
    } else {
      console.warn('OneSignal: Plugin not found. This is normal if called before deviceready.');
    }
  };

  // Ensure we wait for deviceready
  if (window.cordova) {
      document.addEventListener('deviceready', performInit, false);
  } else {
      // Fallback if cordova object is not yet present
      setTimeout(() => {
          if (window.cordova) {
              document.addEventListener('deviceready', performInit, false);
          } else {
              performInit(); // Try anyway
          }
      }, 1000);
  }
};

export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform()) return;
  const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

  if (OneSignal && typeof OneSignal.login === 'function') {
    try {
      OneSignal.login(externalId);
      console.log('OneSignal: Logged in user:', externalId);
    } catch (e) {
      console.error('OneSignal: Login error:', e);
    }
  }
};
