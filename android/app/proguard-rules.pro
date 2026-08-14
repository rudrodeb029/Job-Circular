# ProGuard & R8 Code Obfuscation Rules for Job Circular
# Aggressive optimization for maximum size reduction

# ============================================================
# Aggressive Optimizations
# ============================================================
-optimizationpasses 5
-allowaccessmodification
-repackageclasses ''
-dontpreverify

# Remove Android logging in release builds
-assumenosideeffects class android.util.Log {
    public static *** v(...);
    public static *** d(...);
    public static *** i(...);
    public static *** w(...);
}

# ============================================================
# Keep Capacitor Bridge & Plugins
# ============================================================
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }

# ============================================================
# Keep Firebase SDKs
# ============================================================
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ============================================================
# Keep OneSignal Plugin
# ============================================================
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**

# ============================================================
# Keep AndroidX & Native Javascript Interfaces
# ============================================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ============================================================
# Remove unused code aggressively
# ============================================================
-dontwarn javax.annotation.**
-dontwarn org.codehaus.mojo.animal_sniffer.**
-dontwarn okio.**
-dontwarn retrofit2.**
