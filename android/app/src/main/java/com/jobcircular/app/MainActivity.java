package com.jobcircular.app;

import android.os.Bundle;
import androidx.appcompat.app.AlertDialog;
import com.getcapacitor.BridgeActivity;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;
import com.onesignal.user.subscriptions.IPushSubscriptionObserver;
import com.onesignal.user.subscriptions.PushSubscriptionChangedState;
import java.util.concurrent.atomic.AtomicBoolean;

public class MainActivity extends BridgeActivity {
    private static final String ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";
    private final AtomicBoolean dialogShown = new AtomicBoolean(false);
    private IPushSubscriptionObserver pushSubscriptionObserver = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. OneSignal Initialization
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // 2. Setup Verification Dialog (Required per instructions)
        setupPushSubscriptionObserver();
    }

    private void setupPushSubscriptionObserver() {
        pushSubscriptionObserver = new IPushSubscriptionObserver() {
            @Override
            public void onPushSubscriptionChange(PushSubscriptionChangedState state) {
                String id = state.getCurrent().getId();
                if (isRegistered(id)) {
                    showVerificationDialog();
                }
            }
        };

        OneSignal.getUser().getPushSubscription().addObserver(pushSubscriptionObserver);

        // Check current state immediately in case registration already finished
        if (isRegistered(OneSignal.getUser().getPushSubscription().getId())) {
            showVerificationDialog();
        }
    }

    private boolean isRegistered(String id) {
        return id != null && !id.isEmpty() && !id.startsWith("local-");
    }

    private void showVerificationDialog() {
        if (dialogShown.compareAndSet(false, true)) {
            runOnUiThread(() -> {
                new AlertDialog.Builder(this)
                    .setTitle("Your OneSignal SDK integration is complete!")
                    .setMessage("Tap below to enable push notifications.")
                    .setPositiveButton("Got it", (dialog, which) -> {
                        OneSignal.getNotifications().requestPermission(true, null);
                    })
                    .setCancelable(false)
                    .show();
            });
        }
    }
}
