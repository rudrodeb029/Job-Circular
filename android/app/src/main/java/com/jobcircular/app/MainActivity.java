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

        // OneSignal Initialization (Silent)
        // JS side will handle the permission prompt with a delay for better stability
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);
    }
}
