const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Automatically send a push notification to all users when a new notification
 * is added to the "notifications" collection in Firestore.
 */
exports.sendPushOnNewNotification = functions.firestore
    .document("notifications/{notifId}")
    .onCreate(async (snapshot, context) => {
        const data = snapshot.data();

        const payload = {
            notification: {
                title: data.title || "New Job Circular!",
                body: data.message || "Check out the latest job update.",
                icon: "ic_launcher",
                clickAction: "FCM_PLUGIN_ACTIVITY", // Needed for Capacitor
            },
            data: {
                jobId: data.jobId || "",
                type: data.type || "new_job"
            },
            topic: "all" // Matches the subscription in notifications.js
        };

        try {
            const response = await admin.messaging().send(payload);
            console.log("Successfully sent message:", response);
            return response;
        } catch (error) {
            console.error("Error sending message:", error);
            return null;
        }
    });
