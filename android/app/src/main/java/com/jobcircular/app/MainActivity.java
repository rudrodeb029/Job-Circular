package com.jobcircular.app;

import android.app.DownloadManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.widget.Toast;
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

        // Ensure WebView background matches splash background (#e8f3ff) immediately
        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().setBackgroundColor(android.graphics.Color.parseColor("#e8f3ff"));
        }

        // OneSignal Initialization
        OneSignal.getDebug().setLogLevel(LogLevel.VERBOSE);
        OneSignal.initWithContext(this, ONESIGNAL_APP_ID);

        // Set up in-app DownloadListener to handle file downloads via Android DownloadManager without leaving the app
        setupDownloadListener();
    }

    private void setupDownloadListener() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().setDownloadListener(new DownloadListener() {
                    @Override
                    public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                        try {
                            if (url.startsWith("blob:") || url.startsWith("data:")) {
                                return; // Handled in-memory by WebView JavaScript
                            }
                            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                            if (mimeType != null && !mimeType.isEmpty()) {
                                request.setMimeType(mimeType);
                            }
                            String cookies = CookieManager.getInstance().getCookie(url);
                            if (cookies != null) {
                                request.addRequestHeader("cookie", cookies);
                            }
                            if (userAgent != null) {
                                request.addRequestHeader("User-Agent", userAgent);
                            }
                            request.setDescription("Live Circular ফাইল ডাউনলোড হচ্ছে...");
                            String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType);
                            request.setTitle(fileName);
                            request.allowScanningByMediaScanner();
                            request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                            request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                            DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                            if (dm != null) {
                                dm.enqueue(request);
                                Toast.makeText(getApplicationContext(), "ডাউনলোড শুরু হয়েছে", Toast.LENGTH_SHORT).show();
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // Request push notification permission when activity window is attached and active across all Android versions
        try {
            OneSignal.getNotifications().requestPermission(true, Continue.none());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
