import { Capacitor } from '@capacitor/core';

// Hardcoded Default App ID (can be overridden in settings)
const DEFAULT_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

export const getOneSignalAppId = () => {
    return localStorage.getItem('onesignal_app_id') || DEFAULT_APP_ID;
};

/**
 * OneSignal JavaScript Wrapper for Capacitor
 */
export const initializeOneSignal = () => {
  if (!Capacitor.isNativePlatform()) return;

  const performInit = () => {
    const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
    const appId = getOneSignalAppId();

    if (OneSignal) {
      try {
        console.log('OneSignal: Initializing with ID:', appId);

        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(appId);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(appId);
        }

        // Request permission - critical for "Subscribed" status
        if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
            // Delay slightly to ensure app UI is stable
            setTimeout(() => {
                console.log('OneSignal: Requesting push permission...');
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    console.log('OneSignal: Permission accepted:', accepted);
                });
            }, 3000);
        }

        console.log('OneSignal: JS initialization complete');
      } catch (e) {
        console.error('OneSignal: JS initialization error:', e);
      }
    }
  };

  if (window.cordova) {
      document.addEventListener('deviceready', performInit, false);
  } else {
      setTimeout(() => {
          if (window.cordova) {
              document.addEventListener('deviceready', performInit, false);
          } else {
              performInit();
          }
      }, 1000);
  }
};

/**
 * Broadcast a push notification via OneSignal REST API.
 */
export const broadcastPush = async (title, message, data = {}) => {
    const restKey = localStorage.getItem('onesignal_rest_api_key');
    const appId = getOneSignalAppId();

    if (!restKey) {
        console.error('OneSignal: REST API Key missing. Check Admin Settings.');
        return { success: false, error: 'REST API Key missing' };
    }

    console.log('OneSignal: Initiating broadcast fetch...', { title, appId });

    try {
        // OneSignal v2 keys (App JSON Web Tokens) use "Authorization: Key <app_jwt>"
        const authHeader = restKey.startsWith('os_v2_app_') ? `Key ${restKey}` : `Basic ${restKey}`;

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                app_id: appId,
                // Target multiple standard segments to ensure we reach everyone
                included_segments: ['Subscribed Users', 'Active Users'],
                headings: { en: title, bn: title },
                contents: { en: message, bn: message },
                data: data,
                // Ensure notification shows even if app is in foreground
                android_visibility: 1,
                priority: 10,
                // Optional: Force platforms
                isAndroid: true,
                isIos: true
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.error('OneSignal API Error:', result.errors);
            // Result.errors is often an array, e.g. ["All included players are not subscribed"]
            return { success: false, error: result.errors };
        }

        console.log('OneSignal: Push sent successfully:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('OneSignal Fetch Error:', error.message);
        return { success: false, error: error.message };
    }
};

export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform()) return;
  const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

  if (OneSignal && typeof OneSignal.login === 'function') {
    try {
      OneSignal.login(externalId);
    } catch (e) {
      console.error('OneSignal: Login error:', e);
    }
  }
};
