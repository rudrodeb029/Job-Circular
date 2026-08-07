import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Note: Replace this with your actual Legacy Server Key from Firebase Console
// Project Settings > Cloud Messaging > Cloud Messaging API (Legacy)
const FCM_LEGACY_SERVER_KEY = 'AAAAz8W-I_g:APA91bFv7yZ8_u9-j9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9_9';

export const initializePushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') return;

  // 1. Create Notification Channel (Required for Android 8+)
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.createChannel({
        id: 'default_channel_id',
        name: 'Default',
        description: 'General Notifications',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#1a56db'
      });
      console.log('Notification channel created via LocalNotifications');
    }
  } catch (err) {
    console.error('Channel creation failed:', err);
  }
};

/**
 * Sends a push notification to all users using the FCM Legacy API.
 * This works on the Firebase FREE (Spark) plan.
 */
export const sendPushToAll = async (title, body, data = {}) => {
  console.log('Attempting to send push to all users:', { title, body });

  const serverKey = localStorage.getItem('fcm_server_key') || FCM_LEGACY_SERVER_KEY;

  if (serverKey && serverKey.length > 50 && (serverKey.startsWith('AAAA') || serverKey.startsWith('AIza'))) {
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
            android_channel_id: 'default_channel_id',
            click_action: 'FCM_PLUGIN_ACTIVITY'
          },
          data: {
            ...data,
            android_channel_id: 'default_channel_id',
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
    console.warn('Valid FCM Server Key missing. Push skipped.');
    return null;
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
            schedule: { at: new Date(Date.now() + 500) },
            channelId: 'default_channel_id',
            smallIcon: 'ic_launcher',
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (e) {
      console.error('Local notification failed:', e);
    }
  }
};
