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

        // Foreground notification behavior
        if (typeof OneSignal.setNotificationWillShowInForegroundHandler === 'function') {
            OneSignal.setNotificationWillShowInForegroundHandler((event) => {
                console.log('OneSignal: Foreground notification received');
                event.complete(event.getNotification());
            });
        }

        // DELAYED PERMISSION PROMPT
        setTimeout(() => {
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Requesting push permission...');
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
                    localStorage.setItem('onesignal_subscribed', accepted ? 'true' : 'false');
                    console.log('OneSignal: Permission result:', accepted);
                });
            }
        }, 8000);

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
 */
export const broadcastPush = async (title, message, data = {}) => {
    const restKey = (localStorage.getItem('onesignal_rest_api_key') || '').trim();
    const appId = getOneSignalAppId();

    if (!restKey) {
        return { success: false, error: 'REST API Key is missing.' };
    }

    try {
        const authHeader = restKey.startsWith('os_v2_app_') ? `Key ${restKey}` : `Basic ${restKey}`;

        const payload = {
            app_id: appId,
            // Targeting "All" to ensure widest possible reach
            included_segments: ["All"],
            headings: { en: title, bn: title },
            contents: { en: message, bn: message },
            data: data,
            // Essential Android settings
            android_visibility: 1,
            priority: 10,
            android_accent_color: 'FF1A56DB',
            small_icon: 'ic_stat_onesignal_default',
            // Explicitly enable platforms
            isAndroid: true,
            isIos: true
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
            return { success: false, error: result.errors };
        }

        // Return recipients count so we can verify targeting
        return { success: true, recipients: result.recipients, data: result };
    } catch (error) {
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
