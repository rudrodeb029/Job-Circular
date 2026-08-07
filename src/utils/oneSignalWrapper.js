import { Capacitor } from '@capacitor/core';

// Hardcoded Default App ID (Matches your dashboard)
const DEFAULT_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

export const getOneSignalAppId = () => {
    return (localStorage.getItem('onesignal_app_id') || DEFAULT_APP_ID).trim();
};

/**
 * OneSignal JavaScript Wrapper for Capacitor
 * This ensures the device is registered for push notifications.
 */
export const initializeOneSignal = () => {
  if (!Capacitor.isNativePlatform()) return;

  const performInit = () => {
    const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
    const appId = getOneSignalAppId();

    if (OneSignal) {
      try {
        console.log('OneSignal: Initializing for device with App ID:', appId);

        // OneSignal v5 initialization
        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(appId);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(appId);
        }

        // Delay the permission prompt to ensure the app is fully loaded and responsive
        // This prevents the "App Not Responding" dialog
        setTimeout(() => {
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Prompting for notification permission...');
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    console.log('OneSignal: User permission choice:', accepted ? 'Allowed' : 'Denied');
                    // Store subscription status locally for UI feedback
                    localStorage.setItem('onesignal_subscribed', accepted ? 'true' : 'false');
                }).catch(err => {
                    console.error('OneSignal: Permission prompt failed:', err);
                });
            }
        }, 8000); // 8 second delay for maximum stability

        console.log('OneSignal: JS Bridge Ready');
      } catch (e) {
        console.error('OneSignal: Error in initialization flow:', e);
      }
    }
  };

  // Wait for Cordova/Capacitor native bridge to be ready
  if (window.cordova) {
      document.addEventListener('deviceready', performInit, false);
  } else {
      // Fallback check
      const checkInterval = setInterval(() => {
          if (window.OneSignal || (window.plugins && window.plugins.OneSignal)) {
              performInit();
              clearInterval(checkInterval);
          }
      }, 1000);
      // Timeout after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
  }
};

/**
 * Broadcast a push notification via OneSignal REST API.
 * targets all users in 'Subscribed Users' and 'Active Users' segments.
 */
export const broadcastPush = async (title, message, data = {}) => {
    const restKey = (localStorage.getItem('onesignal_rest_api_key') || '').trim();
    const appId = getOneSignalAppId();

    if (!restKey) {
        return { success: false, error: 'REST API Key is missing in Admin Settings.' };
    }

    console.log('OneSignal: Sending broadcast to segment...');

    try {
        // We use Basic auth for the Notifications API (most compatible)
        const authHeader = `Basic ${restKey}`;

        const payload = {
            app_id: appId,
            // Targeting standard segments that should exist by default
            included_segments: ["Subscribed Users"],
            headings: { en: title, bn: title },
            contents: { en: message, bn: message },
            data: data,
            android_visibility: 1,
            priority: 10,
            small_icon: 'ic_stat_onesignal_default'
        };

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': authHeader
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.errors) {
            // If the specific segment targeting fails, try a broader target as fallback
            console.warn('OneSignal: Segment targeting failed, trying fallback targeting...', result.errors);

            // Fallback: target by app_id filter (targets everyone who opened the app)
            const fallbackPayload = { ...payload, included_segments: ["All"] };
            const fallbackRes = await fetch('https://onesignal.com/api/v1/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                body: JSON.stringify(fallbackPayload)
            });
            const fallbackResult = await fallbackRes.json();

            if (fallbackResult.errors) {
                return { success: false, error: fallbackResult.errors };
            }
            return { success: true, data: fallbackResult };
        }

        console.log('OneSignal: Broadcast successful!');
        return { success: true, data: result };
    } catch (error) {
        console.error('OneSignal: Fetch error:', error);
        return { success: false, error: error.message };
    }
};
