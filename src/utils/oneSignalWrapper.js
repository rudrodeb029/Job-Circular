import { Capacitor } from '@capacitor/core';
import { getDocument, setDocument, COLLECTIONS } from '../services/firestoreService';

// ─── Hardcoded Fallback Constants ──────────────────────────────
const DEFAULT_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";
const DEFAULT_REST_API_KEY = "";


// ─── In-memory cache (avoids repeated Firestore reads) ─────────
let _cachedConfig = null;

/**
 * Fetches OneSignal config from Firestore doc `appConfig/onesignal`.
 * Falls back to hardcoded constants if Firestore read fails.
 * Caches in memory for the session lifetime.
 */
export const getOneSignalConfig = async () => {
    if (_cachedConfig) return _cachedConfig;

    try {
        const doc = await getDocument(COLLECTIONS.APP_CONFIG, 'onesignal');
        if (doc && doc.appId && doc.restApiKey) {
            _cachedConfig = {
                appId: doc.appId.trim(),
                restApiKey: doc.restApiKey.trim()
            };
            console.log('OneSignal: Config loaded from Firestore');
            return _cachedConfig;
        }
    } catch (err) {
        console.warn('OneSignal: Firestore config read failed, using fallback:', err.message);
    }

    // Fallback to hardcoded defaults
    _cachedConfig = {
        appId: DEFAULT_APP_ID,
        restApiKey: DEFAULT_REST_API_KEY
    };
    console.log('OneSignal: Using hardcoded fallback config');
    return _cachedConfig;
};

/**
 * Saves OneSignal config to Firestore (called from Admin Settings).
 */
export const saveOneSignalConfig = async (appId, restApiKey) => {
    const data = {
        appId: (appId || DEFAULT_APP_ID).trim(),
        restApiKey: (restApiKey || '').trim(),
        updatedAt: new Date().toISOString()
    };
    await setDocument(COLLECTIONS.APP_CONFIG, 'onesignal', data);
    // Invalidate cache so next broadcastPush reads fresh config
    _cachedConfig = null;
    console.log('OneSignal: Config saved to Firestore');
    return data;
};

/**
 * Returns the configured OneSignal App ID (sync, uses cache or default).
 */
export const getOneSignalAppId = () => {
    return _cachedConfig?.appId || DEFAULT_APP_ID;
};

/**
 * Set up a callback for when a notification is clicked.
 */
export const setupOneSignalClickHandler = (callback) => {
  const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

  if (OneSignal) {
    if (Capacitor.isNativePlatform()) {
      // Native OneSignal Click Handler
      if (OneSignal.Notifications && typeof OneSignal.Notifications.addEventListener === 'function') {
        OneSignal.Notifications.addEventListener('click', (event) => {
          console.log('OneSignal: Notification clicked (Native):', event);
          const data = event.notification.additionalData;
          if (data && typeof callback === 'function') {
            callback(data);
          }
        });
      }
    } else {
      // Web OneSignal Click Handler
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push((OneSignal) => {
        OneSignal.Notifications.addEventListener('click', (event) => {
          console.log('OneSignal: Notification clicked (Web):', event);
          const data = event.notification.data;
          if (data && typeof callback === 'function') {
            callback(data);
          }
        });
      });
    }
  }
};

/**
 * OneSignal JavaScript Wrapper for Capacitor — SDK initialization on-device.
 */
export const initializeOneSignal = () => {
  const appId = getOneSignalAppId();

  if (!Capacitor.isNativePlatform()) {
    // ─── Web Push Initialization ───
    if (window.OneSignalInitialized) return;
    window.OneSignalInitialized = true;

    // Load OneSignal Web SDK dynamically
    const script = document.createElement('script');
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal) => {
        try {
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true, // Enables testing on http://localhost:5173 / localhost:3000
            notifyButton: {
              enable: true, // Display small bell icon at the bottom for easy opt-in and testing
              position: 'bottom-left',
              size: 'medium'
            }
          });
          console.log('OneSignal: Web Push SDK initialized successfully');
        } catch (err) {
          console.warn('OneSignal Web SDK Init failed:', err);
        }
      });
    };
    document.head.appendChild(script);
    return;
  }

  // ─── Native Platform Push Initialization ───
  const performInit = () => {
    const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);

    if (OneSignal) {
      try {
        console.log('OneSignal: Initializing with App ID:', appId);

        if (typeof OneSignal.initialize === 'function') {
            OneSignal.initialize(appId);
        } else if (typeof OneSignal.setAppId === 'function') {
            OneSignal.setAppId(appId);
        }

        // DELAYED PERMISSION PROMPT: Prevents "App Not Responding"
        setTimeout(() => {
            if (OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
                console.log('OneSignal: Requesting push permission...');
                OneSignal.Notifications.requestPermission(true).then((accepted) => {
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
 * Reads credentials from Firestore (with hardcoded fallback).
 */
export const broadcastPush = async (title, message, data = {}, sendAfter = null) => {
    let config;
    try {
        config = await getOneSignalConfig();
    } catch (err) {
        console.error('OneSignal: Failed to get config:', err);
        config = { appId: DEFAULT_APP_ID, restApiKey: DEFAULT_REST_API_KEY };
    }

    const { appId, restApiKey } = config;

    if (!restApiKey) {
        console.error('OneSignal: REST API Key is missing. Cannot send push.');
        return { success: false, error: 'REST API Key is missing. Configure it in Admin Settings.' };
    }

    try {
        const authHeader = restApiKey.startsWith('os_v2_app_') ? `Key ${restApiKey}` : `Basic ${restApiKey}`;

        const payload = {
            app_id: appId,
            included_segments: ["Total Subscriptions", "Subscribed Users"],
            headings: { en: title, bn: title },
            contents: { en: message, bn: message },
            data: data,
            // Android delivery optimization
            android_visibility: 1,
            priority: 10,
            android_accent_color: 'FF1A56DB',
            large_icon: 'https://job-circular-75dbb.web.app/app-icon.png',
            chrome_web_icon: 'https://job-circular-75dbb.web.app/app-icon.png',
            small_icon: 'ic_stat_onesignal_default',
            android_sound: 'notification'
        };

        if (sendAfter) {
            payload.send_after = sendAfter;
        }

        console.log('OneSignal: Sending push →', title, sendAfter ? `(scheduled: ${sendAfter})` : '(immediate)');

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
            console.error('OneSignal: API errors:', result.errors);
            if (Array.isArray(result.errors) && result.errors.includes("All included players are not subscribed")) {
                console.log('OneSignal: Connected successfully but no active subscribers found.');
                return {
                    success: true,
                    recipients: 0,
                    warning: "All included players are not subscribed"
                };
            }
            return { success: false, error: result.errors };
        }

        console.log(`OneSignal: ✅ Push sent successfully → ${result.recipients || 0} recipient(s)`);
        return { success: true, recipients: result.recipients || 0, data: result };
    } catch (error) {
        console.error('OneSignal: Push send failed:', error.message);
        return { success: false, error: error.message };
    }
};

const formatOneSignalDate = (dateObj) => {
    const pad = (num) => String(num).padStart(2, '0');
    const year = dateObj.getUTCFullYear();
    const month = pad(dateObj.getUTCMonth() + 1);
    const day = pad(dateObj.getUTCDate());
    const hours = pad(dateObj.getUTCHours());
    const minutes = pad(dateObj.getUTCMinutes());
    const seconds = pad(dateObj.getUTCSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;
};

/**
 * Send a Live Exam countdown push notification.
 * Builds a human-readable countdown message in Bengali.
 */
export const sendExamCountdownPush = async (exam) => {
    const examStartTime = new Date(exam.startTime);
    const now = new Date();
    const diffMs = examStartTime.getTime() - now.getTime();
    const diffMinutes = Math.round(diffMs / 60000);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const examDateStr = examStartTime.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long' });
    const startTimeStr = examStartTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });

    let timeMessage;
    if (diffMinutes <= 0) {
        timeMessage = 'এখনই শুরু হচ্ছে!';
    } else if (diffMinutes < 60) {
        timeMessage = `${diffMinutes} মিনিটে শুরু হবে!`;
    } else if (examStartTime.toDateString() === today.toDateString()) {
        timeMessage = `আজ ${startTimeStr} টায় শুরু হবে`;
    } else if (examStartTime.toDateString() === tomorrow.toDateString()) {
        timeMessage = `আগামীকাল ${startTimeStr} টায় শুরু হবে`;
    } else {
        timeMessage = `${examDateStr}, ${startTimeStr} টায় শুরু হবে`;
    }

    const title = '📢 নতুন লাইভ পরীক্ষা প্রকাশিত!';
    const message = `${exam.title} — পরীক্ষাটি ${timeMessage} শুরু হবে। অংশ নিতে প্রস্তুত হোন!`;

    // 1. Send immediate push to all users
    const result = await broadcastPush(title, message, {
        examId: exam.id,
        type: 'live_exam',
        startTime: exam.startTime
    });

    // 2. Schedule 5-minute reminder (if start is more than 5 minutes away)
    if (diffMinutes > 6) {
        const sendTime5 = new Date(examStartTime.getTime() - (5 * 60 * 1000));
        await broadcastPush(
            '⏰ পরীক্ষা ৫ মিনিটে শুরু!',
            `${exam.title} — এখনই অ্যাপে ঢুকুন! পরীক্ষা শুরু হতে মাত্র ৫ মিনিট বাকি।`,
            { examId: exam.id, type: 'exam_reminder', startTime: exam.startTime },
            formatOneSignalDate(sendTime5)
        );
        console.log(`OneSignal: Scheduled native 5-min reminder for "${exam.title}" at ${sendTime5}`);
    }

    return result;
};

export const loginOneSignal = (externalId) => {
  if (!Capacitor.isNativePlatform()) return;
  const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
  if (OneSignal && typeof OneSignal.login === 'function') {
    OneSignal.login(externalId);
  }
};
