const functions = require("firebase-functions");
const admin = require("firebase-admin");
const https = require("https");

admin.initializeApp();

// OneSignal Configuration
const ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";
const ONESIGNAL_REST_API_KEY = "os_v2_app_ktpmy7duknemfp453gn4b7yda5equ44365tucju74smqhzhhnzpxexvt6eog4oh1jrjftnk1qu5cr34frt7cdg5zdtq3tn3nskayxcq";

/**
 * Helper: Send push notification via OneSignal REST API
 */
function sendOneSignalNotification(title, body, data = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      headings: { en: title },
      contents: { en: body },
      data: data,
      android_channel_id: "default_channel_id",
      small_icon: "ic_launcher",
      android_accent_color: "FF1a56db"
    });

    const options = {
      hostname: "api.onesignal.com",
      port: 443,
      path: "/notifications",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_REST_API_KEY}`,
        "Content-Length": Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => { responseData += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log("OneSignal response:", parsed);
          resolve(parsed);
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on("error", (error) => {
      console.error("OneSignal request error:", error);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Firestore Trigger: Automatically send a push notification to all users
 * when a new notification document is created in the "notifications" collection.
 */
exports.sendPushOnNewNotification = functions.firestore
    .document("notifications/{notifId}")
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();

        const title = data.title || "নতুন আপডেট! 📢";
        const body = data.message || data.body || "নতুন চাকরির বিজ্ঞপ্তি দেখুন।";
        const pushData = {
            jobId: data.jobId || "",
            type: data.type || "new_job",
            notificationId: context.params.notifId
        };

        try {
            const response = await sendOneSignalNotification(title, body, pushData);
            console.log("Push notification sent successfully:", response);
            return response;
        } catch (error) {
            console.error("Failed to send push notification:", error);
            return null;
        }
    });
