# Google Play Store Submission Guide for Job Circular

Publishing apps that contain government job circulars to the Google Play Store requires strict adherence to policies, particularly the **Government Apps Policy**, **Privacy Policy**, and **Content Policies**. 

Following the steps in this guide will ensure your app is approved without restrictions or rejections.

---

## 1. Google Play Console Settings & Questionnaire

When setting up your app in the Google Play Console, you will be prompted with several questionnaires. Answer them as follows to ensure smooth approval:

### Government Apps Questionnaire
Google Play asks: **"Does your app represent a government entity or facilitate government services?"**
* **Select:** `No` (This is critical. If you select Yes, Google will require official authorization letters from the government).
* **Explanation:** Your app is an aggregator that gathers publicly available job opportunities for candidates.

### Target Audience & Content
* **Target Age:** Select `18 and over` or `16-17` and `18 and over`. 
* *Why?* If you target ages under 13, your app will be subject to strict Families policies (COPPA) which will require more complex privacy compliance. Targeting job seekers (18+) is the standard and easiest route.

### News Apps Questionnaire
Google asks: **"Is your app a news app?"**
* **Select:** `No` (It is a utility/job matching aggregator app).

---

## 2. Play Store Description Disclaimers (Copy-Paste)

You must paste a clear, prominent government disclaimer at the **very bottom** of your Play Store Short Description and Long Description. This is the single most common cause of rejection for job apps in Bangladesh.

Copy and paste the text below into your store listing description:

```markdown
Disclaimer:
Job Circular is an independent private platform and is NOT affiliated with, authorized by, or endorsed by the Government of Bangladesh or any government ministry or entity. We do not represent any government organization. All government-related job notices, logo badges, or information displayed in this app are aggregated from public government official announcements, official newspapers, and ministry portals. 

For official government announcements, please refer to:
- Bangladesh National Web Portal: https://bangladesh.gov.bd
- Bangladesh Public Service Commission: https://bpsc.gov.bd
- Ministry of Public Administration: https://mopa.gov.bd

সতর্কীকরণ disclaimer:
জব সার্কুলার অ্যাপটি একটি সম্পূর্ণ বেসরকারি ও স্বাধীন প্ল্যাটফর্ম। এটি বাংলাদেশ সরকার বা এর কোনো মন্ত্রণালয়/সংস্থার সাথে কোনোভাবেই সংযুক্ত বা অনুমোদিত নয়। আমরা কোনো সরকারি সেবা বা সংস্থার প্রতিনিধিত্ব করি না। অ্যাপে প্রদর্শিত সকল সরকারি চাকরির বিজ্ঞপ্তি বিভিন্ন দৈনিক পত্রিকা এবং সরকারি ওয়েবসাইট থেকে সংগ্রহ করা হয়েছে। 

প্রার্থীদের আবেদনের পূর্বে তথ্যের সত্যতা অফিশিয়াল সরকারি উৎস থেকে যাচাই করার অনুরোধ রইল:
- বাংলাদেশ জাতীয় তথ্য বাতায়ন: https://bangladesh.gov.bd
- বাংলাদেশ সরকারি কর্ম কমিশন: https://bpsc.gov.bd
- জনপ্রশাসন মন্ত্রণালয়: https://mopa.gov.bd
```

---

## 3. Privacy Policy Hosting

Google Play Console requires a working, public **Privacy Policy URL**. 
1. The policy inside the app is already complete and fully compliant (located in the Settings tab).
2. For the Play Console URL, you can host your privacy policy text for free using:
   - **GitHub Pages** (Highly recommended since your repository is on GitHub).
   - **Google Sites** (Create a simple, free webpage).
   - **Free Privacy Policy Generator** services (which provide a hosted URL).

---

## 4. Capacitor App Icon & Splash Screen Assets

To make the app look fully native and professional on actual Android devices, generate your launch assets:

1. Create a `resources/` folder in the root directory.
2. Put a high-quality icon image named `icon.png` (at least 1024x1024 px) and splash image named `splash.png` (at least 2732x2732 px) in that folder.
3. Run the following command to automatically generate all required Android app icons and splash screen sizes:
   ```bash
   npx @capacitor/assets generate --android
   ```

---

## 5. Syncing App Code to Android Project

Whenever you make updates to the React source code (`src/` files), execute this simple sequence to sync it with your Android app before compiling the APK/Bundle:

```bash
# 1. Build the production web bundle
npm run build

# 2. Copy the web code into the native Android folder
npx cap sync
```

Once synced, you can open the project in **Android Studio** (`npx cap open android`) and compile your production-ready `.aab` (Android App Bundle) for upload.

---

## 6. App Version Control System (Remote Update Checks)

We have integrated a fully functional remote version checking system. On startup, the app calls:
`https://raw.githubusercontent.com/rudrodeb029/Job-Circular/master/version.json`

To release a new update and trigger the update modal for all installed apps:
1. Compile your new APK/Bundle and publish it to the Google Play Store.
2. Edit the **`version.json`** file in the root of your repository:
   - Change `"latestVersion"` to your new app version (e.g. `"1.0.1"`).
   - Update the `"releaseNotes"` inside the English (`en`) and Bengali (`bn`) sections.
   - If the update is critical and mandatory, set `"forceUpdate"` to `true` (this hides the "Later" button and forces the user to update).
3. Commit and push the updated `version.json` file to the `master` branch on GitHub. 

All installed apps will automatically read this file from the GitHub repository and prompt their users to download the update from your Play Store link!

