package com.jobcircular.app;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.onesignal.OneSignal;
import com.onesignal.Continue;
import com.onesignal.debug.LogLevel;

public class MainActivity extends BridgeActivity {
    private static final String ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Install SplashScreen compat BEFORE super.onCreate()
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        // OneSignal Initialization
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Request push notification permission when activity window is attached and active across all Android versions
        try {
            OneSignal.getNotifications().requestPermission(true, Continue.none());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
