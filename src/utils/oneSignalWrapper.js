import { Capacitor } from '@capacitor/core';

// Hardcoded Default App ID (Matches your dashboard)
const DEFAULT_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

/**
 * Returns the configured OneSignal App ID, trimmed of any whitespace.
 */
export const getOneSignalAppId = () => {
    const storedId = localStorage.getItem('onesignal_app_id');
    return (storedId && storedId.trim()) ? storedId.trim() : DEFAULT_APP_ID;
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
        console.log('OneSignal: Initializing with App ID:', appId);

        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(appId);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(appId);
        }

        // DELAYED PERMISSION PROMPT: Prevents "App Not Responding" by letting UI load first
        setTimeout(() => {
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Requesting push permission...');
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    localStorage.setItem('onesignal_subscribed', accepted ? 'true' : 'false');
                    console.log('OneSignal: Permission result:', accepted);
                });
            }
        }, 8000); // 8 second delay for boot stability

        console.log('OneSignal: SDK Initialized');
      } catch (e) {
        console.error('OneSignal: Init error:', e);
      }
    }
  };

  if (window.cordova) {
      document.addEventListener('deviceready', performInit, false);
  } else {
      setTimeout(performInit, 2000);
  }
};

/**
 * Broadcast a push notification via OneSignal REST API.
 * targets everyone in the 'Subscribed Users' segment.
 */
export const broadcastPush = async (title, message, data = {}) => {
    const restKey = (localStorage.getItem('onesignal_rest_api_key') || '').trim();
    const appId = getOneSignalAppId();

    if (!restKey) {
        console.error('OneSignal: REST Key missing.');
        return { success: false, error: 'REST API Key is missing in Admin Settings.' };
    }

    console.log('OneSignal: Sending broadcast to App ID:', appId);

    try {
        // v2 Keys (os_v2_app_...) use "Key", others use "Basic"
        const authHeader = restKey.startsWith('os_v2_app_') ? `Key ${restKey}` : `Basic ${restKey}`;

        const payload = {
            app_id: appId,
            // "Subscribed Users" is the standard segment for all opted-in users
            included_segments: ["Subscribed Users"],
            headings: { en: title, bn: title },
            contents: { en: message, bn: message },
            data: data,
            android_visibility: 1,
            priority: 10
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
            console.error('OneSignal Error Response:', result.errors);
            // If segment targeting fails, try to target by specific platform as fallback
            if (result.errors.includes("All included players are not subscribed")) {
                console.log('OneSignal: Retrying with platform targeting...');
                const retryPayload = { ...payload, included_segments: ["Active Users", "All"] };
                const retryRes = await fetch('https://onesignal.com/api/v1/notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(retryPayload)
                });
                return { success: true, data: await retryRes.json() };
            }
            return { success: false, error: result.errors };
        }

        console.log('OneSignal: Notification queued successfully');
        return { success: true, data: result };
    } catch (error) {
        console.error('OneSignal: Fetch error:', error);
        return { success: false, error: error.message };
    }
};

export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform()) return;
  const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
  if (OneSignal && typeof OneSignal.login === 'function') {
    OneSignal.login(externalId);
  }
};
