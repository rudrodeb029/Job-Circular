import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';

// Note: Replace this with your actual Legacy Server Key from Firebase Console
// Project Settings > Cloud Messaging > Cloud Messaging API (Legacy)
const FCM_LEGACY_SERVER_KEY = 'AAAAz8W-I_g:APA91bFv7yZ8_u9-j9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9';

export const initializePushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  // 1. Add listeners FIRST before registering
  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success, token: ' + token.value);
    localStorage.setItem('fcm_token', token.value);

    try {
      // Always subscribe to topic on registration
      await FCM.subscribeTo({ topic: 'all' });
      console.log('Subscribed to "all" topic');
    } catch (err) {
      console.error('FCM topic subscription failed:', err);
    }
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('Push registration error:', error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received in foreground:', notification);
    triggerLocalNotification(notification.title, notification.body);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('Push action performed:', action);
    if (action.notification.data.jobId) {
      window.location.href = `/job/${action.notification.data.jobId}`;
    }
  });

  // 2. Request permissions and register
  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();

    // 3. Fallback: If already registered, manually subscribe to topic
    // This helps if the 'registration' event doesn't fire (common on some devices/restarts)
    const existingToken = localStorage.getItem('fcm_token');
    if (existingToken) {
      try {
        await FCM.subscribeTo({ topic: 'all' });
        console.log('Topic subscription refreshed (fallback)');
      } catch (err) {
        console.warn('Refresh topic failed:', err);
      }
    }
  }
};

/**
 * Sends a push notification to all users using the FCM Legacy API.
 * This works on the Firebase FREE (Spark) plan.
 */
export const sendPushToAll = async (title, body, data = {}) => {
  console.log('Attempting to send push to all users:', { title, body });

  const serverKey = localStorage.getItem('fcm_server_key') || FCM_LEGACY_SERVER_KEY;

  if (serverKey && serverKey.startsWith('AAAA')) {
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`
        },
        body: JSON.stringify({
          to: '/topics/all',
          notification: {
            title: title,
            body: body,
            sound: 'default',
            icon: 'ic_launcher',
            click_action: 'FCM_PLUGIN_ACTIVITY' // Added to notification block
          },
          data: {
            ...data,
            click_action: 'FCM_PLUGIN_ACTIVITY'
          },
          priority: 'high'
        })
      });

      const result = await response.json();
      console.log('FCM Send Result:', result);
      return result;
    } catch (error) {
      console.error('FCM Send Error:', error);
      throw error;
    }
  } else {
    console.warn('FCM Server Key not configured or invalid. Using Cloud Functions fallback if available.');
  }
};

export const triggerLocalNotification = async (title, body) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 500) }
          }
        ]
      });
    } catch (e) {
      console.error('Local notification failed:', e);
    }
  }
};
