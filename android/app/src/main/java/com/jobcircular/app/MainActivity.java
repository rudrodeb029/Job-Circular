package com.jobcircular.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.onesignal.OneSignal;
import com.onesignal.debug.LogLevel;

public class MainActivity extends BridgeActivity {
    private static final String ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize OneSignal
        OneSignal.getDebug().setLogLevel(LogLevel.WARN);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // Request notification permission (Android 13+)
        OneSignal.getNotifications().requestPermission(true, null);
    }
}
