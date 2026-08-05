import { Capacitor } from '@capacitor/core';

/**
 * Push notification utilities for Job Circular app.
 * 
 * Architecture:
 * - OneSignal handles all native push notification delivery (via FCM internally)
 * - This module provides utility functions for sending pushes from admin panel
 * - The Firebase Cloud Function (functions/index.js) handles automatic pushes
 *   when new notifications are added to Firestore
 * 
 * The old FCM direct integration (@capacitor/push-notifications, @capacitor-community/fcm)
 * has been removed to avoid conflicts with OneSignal.
 */

import { broadcastPush } from './oneSignalWrapper';

/**
 * Send a push notification to all subscribed users via OneSignal.
 * This replaces the old FCM Legacy API approach.
 * 
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data (jobId, type, etc.)
 */
export const sendPushToAll = async (title, body, data = {}) => {
  console.log('Sending push to all users via OneSignal:', { title, body });
  return broadcastPush(title, body, data);
};

/**
 * Trigger a local notification (no-op since OneSignal handles foreground display).
 * Kept for backward compatibility with existing code.
 * 
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 */
export const triggerLocalNotification = async (title, body) => {
  // OneSignal displays notifications in foreground automatically.
  // This function is kept as a no-op for backward compatibility.
  console.log('Local notification (handled by OneSignal):', title, body);
};

/**
 * Initialize push notifications.
 * No-op since OneSignal is initialized in oneSignalWrapper.js and MainActivity.java.
 * Kept for backward compatibility.
 */
export const initializePushNotifications = async () => {
  // OneSignal handles all push notification initialization.
  // See oneSignalWrapper.js (JS side) and MainActivity.java (native side).
  console.log('Push notifications: Using OneSignal (initialized elsewhere)');
};
