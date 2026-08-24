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
        // This ensures the app icon shows on Android 6-11 as well as Android 12+
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);

        // OneSignal Initialization
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // Request push notification permission natively on startup
        OneSignal.getNotifications().requestPermission(true, Continue.none());
    }
}
