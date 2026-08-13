# ProGuard & R8 Code Obfuscation Rules for Job Circular

# Keep Capacitor Bridge & Plugins
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin { *; }

# Keep Firebase SDKs
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep OneSignal Plugin
-keep class com.onesignal.** { *; }
-dontwarn com.onesignal.**

# Keep AndroidX & Native Javascript Interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
