package com.livecircular.bdjobs;

import android.app.DownloadManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.annotation.Keep;
import androidx.annotation.NonNull;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.onesignal.OneSignal;
import com.onesignal.Continue;
import com.onesignal.debug.LogLevel;

// ═══ AdMob, Meta Mediation & Firebase Remote Config Imports ═══
import com.google.firebase.remoteconfig.ConfigUpdate;
import com.google.firebase.remoteconfig.ConfigUpdateListener;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigException;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.facebook.ads.AdSettings;

import java.util.Collections;
import java.util.Locale;
import java.util.Objects;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "AdMobMetaMediation";
    private static final String ONESIGNAL_APP_ID = "54decc7c-7653-48d2-bf9d-dc1bc0ff0307";

    // ═══ Remote Config Parameter Keys ═══
    private static final String REMOTE_CONFIG_KEY_SHOW_ADS = "show_ads";
    private static final String REMOTE_CONFIG_KEY_SHOW_BANNER = "show_banner_ads";
    private static final String REMOTE_CONFIG_KEY_SHOW_INTERSTITIAL = "show_interstitial_ads";
    private static final String REMOTE_CONFIG_KEY_COOLDOWN_SEC = "interstitial_cooldown_sec";
    private static final String REMOTE_CONFIG_KEY_BANNER_ID = "admob_banner_id";
    private static final String REMOTE_CONFIG_KEY_INTERSTITIAL_ID = "admob_interstitial_id";

    // ═══ Default Official Test Ad Unit IDs ═══
    private static final String DEFAULT_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
    private static final String DEFAULT_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";

    // ═══ Ad State & Remote Config Configured Values ═══
    private FirebaseRemoteConfig remoteConfig;
    private boolean isAdsEnabled = true;
    private boolean isBannerAdsEnabled = true;
    private boolean isInterstitialAdsEnabled = true;
    private long interstitialCooldownSec = 50;
    private String bannerAdUnitId = DEFAULT_BANNER_AD_UNIT_ID;
    private String interstitialAdUnitId = DEFAULT_INTERSTITIAL_AD_UNIT_ID;
    private boolean isMobileAdsInitialized = false;

    private FrameLayout bannerContainer;
    private View bannerTopDivider;
    private AdView bannerAdView;
    private boolean isBannerRequestedVisible = false;
    private boolean isCurrentThemeDark = false;
    private InterstitialAd interstitialAd;
    private boolean isInterstitialLoading = false;

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

        // Set up JavaScript interface for React app to trigger ads
        setupAdJavascriptInterface();

        // Initialize Mobile Ads and Meta test engine early
        initializeMobileAdsAndMediation();

        // Initialize Firebase Remote Config to determine ad display
        setupRemoteConfig();
    }

    // ══════════════════════════════════════════════════════════════════
    // 1. Firebase Remote Config Setup & Real-Time Listener
    // ══════════════════════════════════════════════════════════════════
    private void setupRemoteConfig() {
        remoteConfig = FirebaseRemoteConfig.getInstance();

        FirebaseRemoteConfigSettings configSettings = new FirebaseRemoteConfigSettings.Builder()
            // 0s fetch interval for immediate dev/test synchronization
            .setMinimumFetchIntervalInSeconds(0L)
            .build();
        remoteConfig.setConfigSettingsAsync(configSettings);

        // Set XML Defaults (includes show_ads=false, toggles, cooldown, test IDs)
        remoteConfig.setDefaultsAsync(R.xml.remote_config_defaults);

        // Initial fetch and activate
        remoteConfig.fetchAndActivate().addOnCompleteListener(this, task -> {
            if (task.isSuccessful()) {
                Log.d(TAG, "Remote Config fetch and activate succeeded.");
            } else {
                Log.w(TAG, "Remote Config fetch failed. Falling back to defaults/cache.");
            }
            applyRemoteConfigParameters();
        });

        // Real-time Remote Config updates listener (Firebase BoM 33+)
        remoteConfig.addOnConfigUpdateListener(new ConfigUpdateListener() {
            @Override
            public void onUpdate(@NonNull ConfigUpdate configUpdate) {
                Log.d(TAG, "Remote Config real-time update received: " + configUpdate.getUpdatedKeys());
                remoteConfig.activate().addOnCompleteListener(MainActivity.this, task -> {
                    if (task.isSuccessful()) {
                        Log.d(TAG, "Remote Config activated after real-time update.");
                        applyRemoteConfigParameters();
                    }
                });
            }

            @Override
            public void onError(@NonNull FirebaseRemoteConfigException error) {
                Log.e(TAG, "Remote Config real-time update error: " + error.getMessage(), error);
            }
        });
    }

    private void applyRemoteConfigParameters() {
        isAdsEnabled = remoteConfig.getBoolean(REMOTE_CONFIG_KEY_SHOW_ADS);
        isBannerAdsEnabled = remoteConfig.getBoolean(REMOTE_CONFIG_KEY_SHOW_BANNER);
        isInterstitialAdsEnabled = remoteConfig.getBoolean(REMOTE_CONFIG_KEY_SHOW_INTERSTITIAL);
        interstitialCooldownSec = remoteConfig.getLong(REMOTE_CONFIG_KEY_COOLDOWN_SEC);
        if (interstitialCooldownSec <= 0) {
            interstitialCooldownSec = 50;
        }

        String bId = remoteConfig.getString(REMOTE_CONFIG_KEY_BANNER_ID);
        if (!bId.trim().isEmpty()) {
            bannerAdUnitId = bId.trim();
        } else {
            bannerAdUnitId = DEFAULT_BANNER_AD_UNIT_ID;
        }

        String iId = remoteConfig.getString(REMOTE_CONFIG_KEY_INTERSTITIAL_ID);
        if (!iId.trim().isEmpty()) {
            interstitialAdUnitId = iId.trim();
        } else {
            interstitialAdUnitId = DEFAULT_INTERSTITIAL_AD_UNIT_ID;
        }

        Log.d(TAG, String.format(
            Locale.US,
            "Remote Config Applied -> show_ads: %b, banner: %b, interstitial: %b, cooldown: %ds, bannerId: %s, interstitialId: %s",
            isAdsEnabled, isBannerAdsEnabled, isInterstitialAdsEnabled, interstitialCooldownSec, bannerAdUnitId, interstitialAdUnitId
        ));

        runOnUiThread(() -> {
            if (isAdsEnabled) {
                initializeMobileAdsAndMediation();
                if (isBannerAdsEnabled && isBannerRequestedVisible) {
                    if (bannerAdView != null) {
                        bannerContainer.setVisibility(View.VISIBLE);
                    } else {
                        loadBannerAd();
                    }
                } else if (bannerContainer != null) {
                    bannerContainer.setVisibility(View.GONE);
                }
            } else {
                Log.d(TAG, "Ads are disabled via Remote Config master switch.");
                if (bannerContainer != null) {
                    bannerContainer.setVisibility(View.GONE);
                }
                interstitialAd = null;
            }

            // Notify web frontend of the updated remote config parameters
            notifyWebviewConfigUpdated();
        });
    }

    private void notifyWebviewConfigUpdated() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                String js = String.format(
                    Locale.US,
                    "window.dispatchEvent(new CustomEvent('remote_config_ads_updated', { detail: { " +
                    "show_ads: %b, show_banner_ads: %b, show_interstitial_ads: %b, " +
                    "interstitial_cooldown_sec: %d, admob_banner_id: '%s', admob_interstitial_id: '%s' } }));",
                    isAdsEnabled, isBannerAdsEnabled, isInterstitialAdsEnabled,
                    interstitialCooldownSec, bannerAdUnitId, interstitialAdUnitId
                );
                this.bridge.getWebView().evaluateJavascript(js, null);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error notifying WebView about Remote Config update: " + e.getMessage());
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // 2. Google Mobile Ads & Meta Mediation Initialization
    // ══════════════════════════════════════════════════════════════════
    private void initializeMobileAdsAndMediation() {
        try {
            if (isMobileAdsInitialized) {
                if (isBannerAdsEnabled && isBannerRequestedVisible && bannerAdView == null) {
                    loadBannerAd();
                }
                if (isInterstitialAdsEnabled && interstitialAd == null && !isInterstitialLoading) {
                    loadInterstitialAd();
                }
                return;
            }

            // Meta Audience Network Test Mode
            try {
                AdSettings.setTestMode(true);
            } catch (Throwable t) {
                Log.w(TAG, "Meta AdSettings setTestMode warning: " + t.getMessage());
            }

            // AdMob Test Device configuration
            try {
                RequestConfiguration requestConfiguration = new RequestConfiguration.Builder()
                    .setTestDeviceIds(Collections.singletonList(AdRequest.DEVICE_ID_EMULATOR))
                    .build();
                MobileAds.setRequestConfiguration(requestConfiguration);
            } catch (Throwable t) {
                Log.w(TAG, "MobileAds setRequestConfiguration warning: " + t.getMessage());
            }

            MobileAds.initialize(this, initializationStatus -> {
                isMobileAdsInitialized = true;
                Log.d(TAG, "Mobile Ads Initialized: " + initializationStatus);
                runOnUiThread(() -> {
                    if (isBannerAdsEnabled && isBannerRequestedVisible) {
                        loadBannerAd();
                    }
                    if (isInterstitialAdsEnabled) {
                        loadInterstitialAd();
                    }
                });
            });
        } catch (Throwable e) {
            Log.e(TAG, "Error initializing MobileAds safely: " + e.getMessage(), e);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // 3. Banner Ad (Pinned Bottom of Screen - Controlled Per Route)
    // ══════════════════════════════════════════════════════════════════
    private AdSize getAdaptiveAdSize() {
        android.util.DisplayMetrics displayMetrics = getResources().getDisplayMetrics();
        int widthPixels = displayMetrics.widthPixels;
        float density = displayMetrics.density;
        int adWidth = (int) (widthPixels / density);
        return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, adWidth);
    }

    private void updateBannerColors(boolean isDark) {
        if (bannerContainer != null) {
            bannerContainer.setBackgroundColor(isDark ? Color.parseColor("#0b0f19") : Color.WHITE);
        }
        if (bannerTopDivider != null) {
            bannerTopDivider.setBackgroundColor(isDark ? Color.parseColor("#1e293b") : Color.parseColor("#e2e8f0"));
        }
    }

    private void loadBannerAd() {
        if (!isAdsEnabled || !isBannerAdsEnabled) {
            if (bannerContainer != null) {
                bannerContainer.setVisibility(View.GONE);
            }
            return;
        }

        runOnUiThread(() -> {
            ViewGroup rootView = findViewById(android.R.id.content);
            if (rootView == null) return;
            try {
                if (bannerContainer == null) {
                    bannerContainer = new FrameLayout(this);
                    FrameLayout.LayoutParams containerParams = new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        Gravity.BOTTOM
                    );
                    bannerContainer.setLayoutParams(containerParams);
                    bannerContainer.setElevation(16f);
                    bannerContainer.setVisibility(isBannerRequestedVisible ? View.VISIBLE : View.GONE);

                    // Top divider line matching bottom navbar border-top
                    bannerTopDivider = new View(this);
                    float density = getResources().getDisplayMetrics().density;
                    FrameLayout.LayoutParams dividerParams = new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        Math.max(1, (int) (1 * density))
                    );
                    dividerParams.gravity = Gravity.TOP;
                    bannerTopDivider.setLayoutParams(dividerParams);
                    bannerContainer.addView(bannerTopDivider);

                    updateBannerColors(isCurrentThemeDark);
                    rootView.addView(bannerContainer);
                }

                // If bannerAdView exists but adUnitId differs, recreate AdView
                if (bannerAdView != null && !Objects.equals(bannerAdUnitId, bannerAdView.getAdUnitId())) {
                    bannerContainer.removeView(bannerAdView);
                    bannerAdView.destroy();
                    bannerAdView = null;
                }

                if (bannerAdView == null) {
                    bannerAdView = new AdView(this);
                    bannerAdView.setAdSize(getAdaptiveAdSize());
                    bannerAdUnitId = (bannerAdUnitId != null && !bannerAdUnitId.trim().isEmpty()) ? bannerAdUnitId.trim() : DEFAULT_BANNER_AD_UNIT_ID;
                    bannerAdView.setAdUnitId(bannerAdUnitId);

                    FrameLayout.LayoutParams adParams = new FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.WRAP_CONTENT,
                        Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM
                    );
                    bannerContainer.addView(bannerAdView, adParams);

                    bannerAdView.setAdListener(new AdListener() {
                        @Override
                        public void onAdLoaded() {
                            super.onAdLoaded();
                            Log.d(TAG, "Adaptive Banner Ad loaded successfully (" + bannerAdUnitId + ").");
                            if (isAdsEnabled && isBannerAdsEnabled && isBannerRequestedVisible && bannerContainer != null) {
                                bannerContainer.setVisibility(View.VISIBLE);
                            } else if (bannerContainer != null) {
                                bannerContainer.setVisibility(View.GONE);
                            }
                        }

                        @Override
                        public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                            super.onAdFailedToLoad(loadAdError);
                            Log.e(TAG, "Banner Ad failed to load: " + loadAdError.getMessage());
                            if (bannerContainer != null) {
                                bannerContainer.setVisibility(View.GONE);
                            }
                        }
                    });
                }

                AdRequest adRequest = new AdRequest.Builder().build();
                bannerAdView.loadAd(adRequest);
            } catch (Throwable t) {
                Log.e(TAG, "Error in loadBannerAd: " + t.getMessage(), t);
            }
        });
    }

    /**
     * Controls banner ad visibility based on the active page route.
     * Hidden on Home, Feed, Saved, Notifications, Profile so it doesn't cover the BottomNav.
     * Shown at the bottom on all other pages with full edge-to-edge navbar style.
     */
    public void setBannerVisibility(boolean visible, boolean isDark) {
        this.isBannerRequestedVisible = visible;
        this.isCurrentThemeDark = isDark;
        runOnUiThread(() -> {
            try {
                if (bannerContainer != null) {
                    if (visible && isAdsEnabled && isBannerAdsEnabled && bannerAdView != null) {
                        updateBannerColors(isDark);
                        bannerContainer.setVisibility(View.VISIBLE);
                    } else {
                        bannerContainer.setVisibility(View.GONE);
                    }
                } else if (visible && isAdsEnabled && isBannerAdsEnabled) {
                    loadBannerAd();
                }
            } catch (Throwable t) {
                Log.e(TAG, "Error in setBannerVisibility: " + t.getMessage(), t);
            }
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // 4. Interstitial Ad (Strict Single-Show & Immediate Dismissal)
    // ══════════════════════════════════════════════════════════════════
    private void loadInterstitialAd() {
        if (!isAdsEnabled || !isInterstitialAdsEnabled || isInterstitialLoading || interstitialAd != null) {
            return;
        }
        try {
            isInterstitialLoading = true;
            AdRequest adRequest = new AdRequest.Builder().build();

            InterstitialAd.load(this, interstitialAdUnitId, adRequest,
                new InterstitialAdLoadCallback() {
                    @Override
                    public void onAdLoaded(@NonNull InterstitialAd ad) {
                        interstitialAd = ad;
                        isInterstitialLoading = false;
                        Log.d(TAG, "Interstitial Ad successfully loaded into memory cache (" + interstitialAdUnitId + ").");

                        ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                            @Override
                            public void onAdDismissedFullScreenContent() {
                                super.onAdDismissedFullScreenContent();
                                Log.d(TAG, "Interstitial ad dismissed by user.");
                                MainActivity.this.runOnUiThread(() -> {
                                    if (MainActivity.this.bridge != null && MainActivity.this.bridge.getWebView() != null) {
                                        String script = "try { if (typeof window.onNativeInterstitialDismissed === 'function') { window.onNativeInterstitialDismissed(); } window.dispatchEvent(new CustomEvent('native_interstitial_dismissed')); } catch(e){}";
                                        MainActivity.this.bridge.getWebView().evaluateJavascript(script, null);
                                    }
                                });
                                interstitialAd = null;
                                if (isAdsEnabled && isInterstitialAdsEnabled) {
                                    loadInterstitialAd();
                                }
                            }

                            @Override
                            public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                                super.onAdFailedToShowFullScreenContent(adError);
                                Log.e(TAG, "Interstitial ad failed to show: " + adError.getMessage());
                                MainActivity.this.runOnUiThread(() -> {
                                    if (MainActivity.this.bridge != null && MainActivity.this.bridge.getWebView() != null) {
                                        String script = "try { if (typeof window.onNativeInterstitialFailed === 'function') { window.onNativeInterstitialFailed(); } window.dispatchEvent(new CustomEvent('native_interstitial_failed')); } catch(e){}";
                                        MainActivity.this.bridge.getWebView().evaluateJavascript(script, null);
                                    }
                                });
                                interstitialAd = null;
                                if (isAdsEnabled && isInterstitialAdsEnabled) {
                                    loadInterstitialAd();
                                }
                            }

                            @Override
                            public void onAdShowedFullScreenContent() {
                                super.onAdShowedFullScreenContent();
                                Log.d(TAG, "Interstitial ad displayed on screen.");
                            }

                            @Override
                            public void onAdImpression() {
                                super.onAdImpression();
                                Log.d(TAG, "Interstitial ad impression recorded.");
                            }

                            @Override
                            public void onAdClicked() {
                                super.onAdClicked();
                                Log.d(TAG, "Interstitial ad clicked by user.");
                            }
                        });
                    }

                    @Override
                    public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                        interstitialAd = null;
                        isInterstitialLoading = false;
                        Log.e(TAG, "Interstitial Ad failed to load: " + loadAdError.getMessage());
                    }
                }
            );
        } catch (Throwable t) {
            Log.e(TAG, "Error in loadInterstitialAd: " + t.getMessage(), t);
            interstitialAd = null;
            isInterstitialLoading = false;
        }
    }

    /**
     * Triggered from Java or JavaScript when user completes an action.
     */
    public void showInterstitialAd() {
        if (isAdsEnabled && isInterstitialAdsEnabled && interstitialAd != null) {
            Log.d(TAG, "Showing Interstitial Ad...");
            interstitialAd.show(this);
        } else {
            Log.d(TAG, "Interstitial ad not ready or ads disabled. Proceeding without ad.");
            if (isAdsEnabled && isInterstitialAdsEnabled && interstitialAd == null && !isInterstitialLoading) {
                loadInterstitialAd();
            }
            runOnUiThread(() -> {
                if (MainActivity.this.bridge != null && MainActivity.this.bridge.getWebView() != null) {
                    String script = "try { if (typeof window.onNativeInterstitialFailed === 'function') { window.onNativeInterstitialFailed(); } window.dispatchEvent(new CustomEvent('native_interstitial_failed')); } catch(e){}";
                    MainActivity.this.bridge.getWebView().evaluateJavascript(script, null);
                }
            });
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // 5. JavaScript Interface for React Frontend
    // ══════════════════════════════════════════════════════════════════
    private void setupAdJavascriptInterface() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().addJavascriptInterface(new Object() {
                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public void showInterstitial() {
                        runOnUiThread(MainActivity.this::showInterstitialAd);
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public boolean isInterstitialReady() {
                        return isAdsEnabled && isInterstitialAdsEnabled && interstitialAd != null;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public void showBanner() {
                        runOnUiThread(() -> MainActivity.this.setBannerVisibility(true, false));
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public void showBannerWithTheme(boolean isDark) {
                        runOnUiThread(() -> MainActivity.this.setBannerVisibility(true, isDark));
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public void hideBanner() {
                        runOnUiThread(() -> MainActivity.this.setBannerVisibility(false, false));
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public void setBannerVisibility(boolean visible) {
                        runOnUiThread(() -> MainActivity.this.setBannerVisibility(visible, false));
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public boolean isAdsEnabled() {
                        return isAdsEnabled;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public boolean isBannerAdsEnabled() {
                        return isAdsEnabled && isBannerAdsEnabled;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public boolean isInterstitialAdsEnabled() {
                        return isAdsEnabled && isInterstitialAdsEnabled;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public long getInterstitialCooldownSec() {
                        return interstitialCooldownSec;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public String getBannerAdUnitId() {
                        return bannerAdUnitId;
                    }

                    @JavascriptInterface
                    @Keep
                    @SuppressWarnings("unused")
                    public String getInterstitialAdUnitId() {
                        return interstitialAdUnitId;
                    }
                }, "AndroidAds");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting up JavaScript interface", e);
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // 6. In-App Download Listener (Existing Core Functionality)
    // ══════════════════════════════════════════════════════════════════
    private void setupDownloadListener() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                this.bridge.getWebView().setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
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
                        if (fileName == null || Objects.equals(fileName, "downloadfile.bin") || !fileName.contains(".")) {
                            String ext = "png";
                            if (mimeType != null && mimeType.contains("pdf")) ext = "pdf";
                            else if (mimeType != null && (mimeType.contains("jpeg") || mimeType.contains("jpg"))) ext = "jpg";
                            else if (url.toLowerCase(Locale.ROOT).contains(".pdf")) ext = "pdf";
                            else if (url.toLowerCase(Locale.ROOT).contains(".jpg") || url.toLowerCase(Locale.ROOT).contains(".jpeg")) ext = "jpg";
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
                        Log.e(TAG, "Error processing download", e);
                    }
                });
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting up download listener", e);
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
                    if (!downloadDir.exists() && !downloadDir.mkdirs()) {
                        Log.w(TAG, "Could not create directory for download");
                    }
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

                runOnUiThread(() -> Toast.makeText(getApplicationContext(), "ফাইলটি ডাউনলোড ফোল্ডারে সংরক্ষিত হয়েছে", Toast.LENGTH_LONG).show());
            } catch (Exception e) {
                Log.e(TAG, "Error saving base64 to downloads", e);
            }
        }).start();
    }

    // ══════════════════════════════════════════════════════════════════
    // 7. Activity Lifecycle Management
    // ══════════════════════════════════════════════════════════════════
    @Override
    public void onStart() {
        super.onStart();
        // Request push notification permission when activity window is attached and active
        try {
            OneSignal.getNotifications().requestPermission(true, Continue.none());
        } catch (Exception e) {
            Log.e(TAG, "Error requesting notification permission", e);
        }
    }

    @Override
    public void onPause() {
        if (bannerAdView != null) {
            bannerAdView.pause();
        }
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (bannerAdView != null) {
            bannerAdView.resume();
        }
    }

    @Override
    public void onDestroy() {
        if (bannerAdView != null) {
            bannerAdView.destroy();
            bannerAdView = null;
        }
        if (bannerContainer != null) {
            bannerContainer.removeAllViews();
            bannerContainer = null;
            bannerTopDivider = null;
        }
        super.onDestroy();
    }
}

