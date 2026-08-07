import { Capacitor } from '@capacitor/core';

const ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

/**
 * OneSignal JavaScript Wrapper for Capacitor
 */
export const initializeOneSignal = () => {
  if (!Capacitor.isNativePlatform()) return;

  const performInit = () => {
    const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

    if (OneSignal) {
      try {
        console.log('OneSignal: Initializing with ID:', ONESIGNAL_APP_ID);

        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(ONESIGNAL_APP_ID);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(ONESIGNAL_APP_ID);
        }

        const requestPermission = () => {
            const OS = window.OneSignal || (window.plugins && window.plugins.OneSignal);
            if (OS && OS.Notifications && typeof OS.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Prompting for push permission...');
                OS.Notifications.requestPermission(true);
            } else if (OS && typeof OS.promptForPushNotificationsWithUserResponse === 'function') {
                OS.promptForPushNotificationsWithUserResponse();
            }
        };

        setTimeout(requestPermission, 5000);
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
 * HEADS UP: This requires the OneSignal REST API Key to be set in Admin Settings.
 */
export const broadcastPush = async (title, message, data = {}) => {
    const restKey = localStorage.getItem('onesignal_rest_api_key');

    if (!restKey) {
        console.error('OneSignal: REST API Key missing. Please set it in Admin Settings.');
        return { success: false, error: 'REST API Key missing' };
    }

    try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${restKey}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                included_segments: ['Subscribed Users'],
                headings: { en: title, bn: title },
                contents: { en: message, bn: message },
                data: data,
                android_accent_color: 'FF1A56DB',
                // Professional icon settings
                small_icon: 'ic_stat_onesignal_default',
                large_icon: 'ic_launcher',
                priority: 10 // High priority
            })
        });

        const result = await response.json();
        console.log('OneSignal: Broadcast result:', result);
        return { success: !result.errors, data: result };
    } catch (error) {
        console.error('OneSignal: Broadcast error:', error);
        return { success: false, error: error.message };
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
