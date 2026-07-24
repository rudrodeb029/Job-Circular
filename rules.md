# Job Circular & Live Exam - Android App Rules

This document outlines the core logic, functionality, and operational rules for the **Job Circular & Live Exam** Android application.

## 📱 1. Architecture Overview
The application is built using a modern web-to-mobile architecture:
- **Core Framework**: React (Vite) + JavaScript.
- **Mobile Wrapper**: [Capacitor](https://capacitorjs.com/) is used to package the web application into a native Android application.
- **Backend & Database**: Firebase (Firestore for real-time database, Firebase Hosting for the web distribution).
- **Styling**: Vanilla CSS with modern aesthetics, glassmorphism, and smooth animations.

## 🚀 2. How the App Works (Core Features)

### A. Live Exams (লাইভ পরীক্ষা)
- Users can participate in real-time or simulated live exams.
- **Timer**: Exams feature a strictly enforced countdown timer. Once the timer ends, the exam is automatically submitted.
- **Scoring**: Scores are calculated instantly upon submission based on the selected answers versus the correct answers stored in the database.
- **Database Storage**: Exam progression and results are saved directly to the Firebase database. Users can review their past results securely from their profile at any time.
- **Dynamic Header**: When entering a live exam room, the header clearly indicates "Questions & Solutions" (প্রশ্ন ও সমাধান) or "Live Exam" (লাইভ পরীক্ষা) to minimize clutter.

### B. Job Circulars (চাকরির খবর)
- Circulars are categorized (e.g., Govt Jobs, Bank Jobs, NGO Jobs) and loaded dynamically from Firebase Firestore.
- Each circular contains key details (deadline, organization, position) and high-quality images.
- Users can save/bookmark jobs, which are stored locally using React Context/localStorage for offline access.

### C. Question Papers & Solutions (প্রশ্ন ও সমাধান)
- **Practice Mode (অনুশীলন মোড)**: Users can interactively select answers and see if they are correct/incorrect immediately.
- **Read Mode (পড়া মোড)**: Correct answers are pre-highlighted in green for quick reading and memorization.

## 🛠 3. CI/CD & Build Rules (GitHub Actions)
The Android APK generation is completely automated to prevent manual build errors and missing local dependencies.

- **Trigger**: Pushing code to the `master` branch triggers the GitHub Action workflow automatically.
- **Process**:
  1. Sets up Node.js and installs dependencies (`npm install`).
  2. Builds the production web assets (`npm run build`).
  3. Uses Capacitor to sync web assets to the Android folder (`npx cap sync android`).
  4. Builds the debug APK using Gradle (`./gradlew assembleDebug`).
- **Artifacts**: Once the workflow finishes, the compiled `app-debug.apk` is available in the **Artifacts** section of the GitHub Actions run.

## 🎨 4. Design Guidelines
- **Responsive Web UI**: Because it's a Capacitor app, the web UI must act strictly like a mobile app. 
- **Bottom Navigation**: Must always be anchored to the bottom.
- **Soft UI**: Colors should be soft, readable, and modern (e.g., using slate grays instead of pitch black, reducing harsh contrasts).
- **Interactive Feedback**: Every button must have a visual click state (active state scaling or ripple effect).

## 📡 5. Synchronization & Deployments
- **Web App**: `firebase deploy --only hosting` deploys the web version immediately to `job-circular-75dbb.web.app`.
- **Android App (Over The Air)**: Since the Android app wraps the web content, any changes that do not require native plugin updates (like UI changes, new pages, logic updates) are immediately available in the web build. However, for native changes (like new app icons, splash screens, or Capacitor plugins), a new APK must be built via GitHub Actions and re-installed by the user.

## 💾 6. State Management
- **AppContext**: Manages global UI states like dark mode, language preference (En/Bn), saved jobs, and applied jobs.
- **AdminContext**: Fetches and caches data (exams, circulars) from Firestore to avoid redundant network requests.
