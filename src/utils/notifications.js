import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FCM } from '@capacitor-community/fcm';
import { Capacitor } from '@capacitor/core';

// Note: Replace this with your actual Legacy Server Key from Firebase Console
// Project Settings > Cloud Messaging > Cloud Messaging API (Legacy)
const FCM_LEGACY_SERVER_KEY = 'AAAAz8W-I_g:APA91bFv7yZ8_u9-j9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9';

export const initializePushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive !== 'granted') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive === 'granted') {
    await PushNotifications.register();
  }

  PushNotifications.addListener('registration', async (token) => {
    console.log('Push registration success, token: ' + token.value);
    localStorage.setItem('fcm_token', token.value);

    try {
      await FCM.subscribeTo({ topic: 'all' });
      console.log('Subscribed to "all" topic');
    } catch (err) {
      console.error('FCM topic subscription failed:', err);
    }
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    triggerLocalNotification(notification.title, notification.body);
  });
};

/**
 * Sends a push notification to all users using the FCM Legacy API.
 * This works on the Firebase FREE (Spark) plan.
 */
export const sendPushToAll = async (title, body, data = {}) => {
  console.log('Attempting to send push to all users:', { title, body });

  // Use a hardcoded key or better, one stored in Firestore to avoid rebuilding APK if key changes
  // For now, we use a placeholder. User must update this in Firebase Console.
  const serverKey = localStorage.getItem('fcm_server_key') || FCM_LEGACY_SERVER_KEY;

  if (serverKey.startsWith('AAAA')) {
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
            icon: 'ic_launcher'
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
    console.warn('FCM Server Key not configured correctly in Admin panel.');
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
