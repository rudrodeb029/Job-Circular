import { Capacitor } from '@capacitor/core';

/**
 * OneSignal Centralized Wrapper
 * This module isolates all OneSignal SDK interactions.
 */

const ONESIGNAL_APP_ID = '54decc7c-7653-48d2-bf9d-dc1bc0ff0307';

export const initializeOneSignal = () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('OneSignal: Skipping initialization on web platform');
    return;
  }

  const OneSignal = window.plugins?.OneSignal;

  if (!OneSignal) {
    console.error('OneSignal: window.plugins.OneSignal not found. Ensure the plugin is installed and synced.');
    return;
  }

  // 1. Set Debugging (Optional, remove in production)
  // OneSignal.setLogLevel(6, 0);

  // 2. Initialize
  OneSignal.setAppId(ONESIGNAL_APP_ID);

  // 3. Set Notification Handlers
  OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
    console.log('OneSignal: Notification received in foreground', notificationReceivedEvent);
    const notification = notificationReceivedEvent.getNotification();
    // Complete with the notification to display it
    notificationReceivedEvent.complete(notification);
  });

  OneSignal.setNotificationOpenedHandler((openedEvent) => {
    console.log('OneSignal: Notification opened', openedEvent);
    const data = openedEvent.notification.additionalData;
    if (data && data.jobId) {
      window.location.href = `/job/${data.jobId}`;
    }
  });

  // 4. Prompt for Push Permissions
  OneSignal.promptForPushNotificationsWithUserResponse((accepted) => {
    console.log('OneSignal: User accepted notifications:', accepted);
  });

  console.log('OneSignal: Initialized with App ID:', ONESIGNAL_APP_ID);
};

export const setOneSignalUser = (user) => {
  if (Capacitor.getPlatform() === 'web' || !window.plugins?.OneSignal) return;

  if (user && user.id) {
    window.plugins.OneSignal.setExternalUserId(user.id);
  }
};

export const removeOneSignalUser = () => {
  if (Capacitor.getPlatform() === 'web' || !window.plugins?.OneSignal) return;
  window.plugins.OneSignal.removeExternalUserId();
};

/**
 * REST API broadcast using OneSignal (Spark/Free plan compatible)
 */
export const broadcastPush = async (title, message, data = {}) => {
  const restApiKey = localStorage.getItem('onesignal_rest_api_key');

  if (!restApiKey) {
    console.warn('OneSignal: REST API Key missing. Broadcast skipped.');
    return null;
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${restApiKey}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        data: data,
        small_icon: 'ic_stat_onesignal_default',
        large_icon: 'ic_launcher'
      })
    });

    const result = await response.json();
    console.log('OneSignal: Broadcast result', result);
    return result;
  } catch (error) {
    console.error('OneSignal: Broadcast error', error);
    throw error;
  }
};
