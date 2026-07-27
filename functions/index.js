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
            },
            android: {
                notification: {
                    icon: "ic_launcher",
                    color: "#1a56db",
                    sound: "default",
                    clickAction: "FCM_PLUGIN_ACTIVITY",
                }
            },
            data: {
                jobId: data.jobId || "",
                type: data.type || "new_job",
                click_action: "FCM_PLUGIN_ACTIVITY"
            },
            topic: "all"
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
