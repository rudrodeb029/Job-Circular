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
                            if (url == null || url.isEmpty()) return;

                            // 1. Handle in-app base64 data URLs directly by saving to Android Downloads
                            if (url.startsWith("data:")) {
                                saveBase64ToDownloads(url, mimeType);
                                return;
                            }

                            if (url.startsWith("blob:")) {
                                return;
                            }

                            // 2. Handle HTTP/HTTPS URLs via Android DownloadManager
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
                            if (fileName == null || fileName.equals("downloadfile.bin") || !fileName.contains(".")) {
                                String ext = "png";
                                if (mimeType != null && mimeType.contains("pdf")) ext = "pdf";
                                else if (mimeType != null && (mimeType.contains("jpeg") || mimeType.contains("jpg"))) ext = "jpg";
                                else if (url.toLowerCase().contains(".pdf")) ext = "pdf";
                                else if (url.toLowerCase().contains(".jpg") || url.toLowerCase().contains(".jpeg")) ext = "jpg";
                                fileName = "Notice_" + System.currentTimeMillis() + "." + ext;
                            }

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

    private void saveBase64ToDownloads(String dataUrl, String defaultMimeType) {
        new Thread(() -> {
            try {
                int commaIndex = dataUrl.indexOf(",");
                if (commaIndex == -1) return;
                String header = dataUrl.substring(0, commaIndex);
                String base64Data = dataUrl.substring(commaIndex + 1);
                byte[] decodedBytes = android.util.Base64.decode(base64Data, android.util.Base64.DEFAULT);

                String ext = "png";
                String mime = "image/png";
                if (header.contains("pdf") || (defaultMimeType != null && defaultMimeType.contains("pdf"))) {
                    ext = "pdf";
                    mime = "application/pdf";
                } else if (header.contains("jpeg") || header.contains("jpg")) {
                    ext = "jpg";
                    mime = "image/jpeg";
                } else if (header.contains("webp")) {
                    ext = "webp";
                    mime = "image/webp";
                }

                String fileName = "Circular_Notice_" + System.currentTimeMillis() + "." + ext;

                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    android.content.ContentValues values = new android.content.ContentValues();
                    values.put(android.provider.MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                    values.put(android.provider.MediaStore.MediaColumns.MIME_TYPE, mime);
                    values.put(android.provider.MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                    android.net.Uri uri = getContentResolver().insert(android.provider.MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (java.io.OutputStream os = getContentResolver().openOutputStream(uri)) {
                            if (os != null) {
                                os.write(decodedBytes);
                                os.flush();
                            }
                        }
                    }
                } else {
                    java.io.File downloadDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadDir.exists()) downloadDir.mkdirs();
                    java.io.File outFile = new java.io.File(downloadDir, fileName);
                    try (java.io.FileOutputStream fos = new java.io.FileOutputStream(outFile)) {
                        fos.write(decodedBytes);
                        fos.flush();
                    }
                    android.media.MediaScannerConnection.scanFile(
                        getApplicationContext(),
                        new String[]{outFile.getAbsolutePath()},
                        new String[]{mime},
                        null
                    );
                }

                runOnUiThread(() -> {
                    Toast.makeText(getApplicationContext(), "ফাইলটি ডাউনলোড ফোল্ডারে সংরক্ষিত হয়েছে", Toast.LENGTH_LONG).show();
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();
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
