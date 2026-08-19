# Live Circular & Live Exam - Android App Rules

This document outlines the core logic, functionality, and operational rules for the **Live Circular & Live Exam** Android application.

## 📱 1. Architecture Overview
The application is built using a modern web-to-mobile architecture:
- **Core Framework**: React (Vite) + JavaScript.
- **Mobile Wrapper**: [Capacitor](https://capacitorjs.com/) is used to package the web application into a native Android application.
- **Backend & Database**: Firebase (Firestore for real-time database, Firebase Hosting for the web distribution).
- **Styling**: Vanilla CSS with modern aesthetics, glassmorphism, and smooth animations.

## 🚀 2. How the App Works (Core Features)

### A. Recent Circular (সাম্প্রতিক সার্কুলার)
- Shows all circular posts submitted and managed through the Admin Panel.
- All active posts appear automatically in this feed.

### B. Admin Panel Post Options (Exam Date & Result)
- When adding or editing a circular, the Admin Panel offers two independent checkbox options:
  1. **Exam Date (পরীক্ষার তারিখ)**: Ticking this lets the admin enter a scheduled exam date.
  2. **Result (পরীক্ষার ফলাফল)**: Ticking this lets the admin link a PDF sheet or website URL for the exam results.
- If either option is checked, the post is automatically displayed in the **Exam Date** or **Result** sections of the app (such as the "Admit Card & Result" page), while simultaneously remaining visible in the **Recent Circular** feed.

### C. Saved Circular Linkage (সংরক্ষিত সার্কুলার আপডেট)
- When a user bookmarks/saves a job circular, it is stored in their **Saved Circular** section.
- If the admin later posts or updates the **Exam Date** or **Result** for that specific circular:
  - The admin can link the update to the existing circular using a dropdown.
  - The system automatically updates the original circular in the Firebase database.
  - The user's saved circular list immediately and automatically displays the new "Exam Date" or "Result Published" badges, keeping the user updated.

### D. Live MCQ Exam & Question Bank (লাইভ এমসিকিউ ও লিডারবোর্ড)
- **Scheduling**: The Admin Panel features separate options to add multiple-choice questions for Live MCQ Exams and set the exact start time and duration.
- **Completed Exams**:
  - Once the exam timer expires, the exam section is closed for active taking.
  - The system automatically opens the exam details tab, displaying correct answers, detailed explanations, and a **Daily Leaderboard** ranking the scores of all participants.
  - Users who did not attend can still review the answers and view the leaderboard.
- **Exam History**: Past completed exams are archived in a separate history section. Users can open and review their past scores and questions at any time.

### E. Question Bank Categories (প্রশ্নব্যাংক ক্যাটাগরি)
- The admin panel provides dedicated sections to create question papers and select/input categories.
- Admin can assign questions to **Existing Categories** (BCS, Bank, Primary, NTRCA, Ministries) or create a **New Category** dynamically by typing a custom category name.
- The user-facing Question Hub automatically registers and displays new categories in the category grid without code changes.

## 📡 3. Firebase Synchronization
- All data—including job circulars, notifications, live exams, question banks, and activity logs—is synchronized and saved in **Firebase Firestore** collections in real-time.
- Local caches (`localStorage`) are only used as fallback states.

## 🛠 4. CI/CD & Build Rules (GitHub Actions)
The Android APK generation is completely automated to prevent manual build errors and missing local dependencies.
- **Trigger**: Pushing code to the `master` branch triggers the GitHub Action workflow automatically.
- **Process**:
  1. Sets up Node.js and installs dependencies (`npm install`).
  2. Builds the production web assets (`npm run build`).
  3. Uses Capacitor to sync web assets to the Android folder (`npx cap sync android`).
  4. Builds the debug APK using Gradle (`./gradlew assembleDebug`).
- **Artifacts**: Once the workflow finishes, the compiled `app-debug.apk` is available in the **Artifacts** section of the GitHub Actions run.

## 🎨 5. Design Guidelines
- **Responsive Web UI**: Because it's a Capacitor app, the web UI must act strictly like a mobile app. 
- **Bottom Navigation**: Must always be anchored to the bottom.
- **Soft UI**: Colors should be soft, readable, and modern (e.g., using slate grays instead of pitch black, reducing harsh contrasts).
- **Interactive Feedback**: Every button must have a visual click state (active state scaling or ripple effect).

## 💾 6. State Management
- **AppContext**: Manages global UI states like dark mode, language preference (En/Bn), saved jobs, and applied jobs.
- **AdminContext**: Fetches and caches data (exams, circulars) from Firestore to avoid redundant network requests.

## ☁️ 7. Cloudinary Image Upload
- The Admin Panel provides a client-side direct upload integration to Cloudinary.
- **Unsigned Upload**: The admin configures their Cloudinary Cloud Name and an Unsigned Upload Preset in the input fields.
- **Dynamic Save**: The uploaded image's secure URL is automatically appended to the Circular Images field and stored in Firestore.
- **App Rendering**: The mobile application loads these secure URLs directly from Cloudinary.

