# Job Circular - Rules & Instructions

Welcome to the **Job Circular** application. This document outlines the core instructions and features of the platform, detailing how everything works.

## 1. Job Circulars & Browsing
- **Categories**: Jobs are divided into specific categories such as Government (সরকারি), Bank (ব্যাংক), Private (প্রাইভেট), NGO (এনজিও), IT (আইটি), Defense (প্রতিরক্ষা), Health (স্বাস্থ্য সেবা), etc.
- **Home Feed**: The homepage provides quick access to recent job circulars, upcoming exams, and major categories.
- **Job Details**: Users can click on a job circular to view full details including organization name, deadlines, vacancy count, and the official circular image.
- **Save & Apply**: Users can bookmark (Save) jobs for later reading and mark jobs they have applied for. These are accessible in the "Saved Jobs" or "Profile" sections.

## 2. Questions Hub & Live Exams
- **Live Exams (লাইভ পরীক্ষা)**:
  - Users can participate in scheduled live exams.
  - A countdown timer tracks the remaining time. 
  - Once the time expires or the user submits, the exam ends, and results are instantly calculated.
- **Model Tests & Past Questions**:
  - **Practice Mode (অনুশীলন মোড)**: Users can take the exam as a mock test. Answers are hidden until selected.
  - **Read Mode (পড়া মোড)**: Users can directly read the questions along with the correct answers highlighted.
- **Results tracking**: Exam scores and participation are tracked locally so users can monitor their preparation progress.

## 3. General Navigation
- **Bottom Navigation Bar**: Provides quick access to Home, Categories, Saved Jobs, Notifications, and Profile.
- **Language Switcher**: The app supports bilingual interfaces (English and Bengali). The language can be toggled from the Settings/Profile menu.
- **Notifications**: Alerts users about new jobs, exam results, and upcoming deadlines.

## 4. Admin Features (If Applicable)
- **Data Source**: Content such as Jobs, Exams, and Questions are managed and loaded via Firebase Firestore.
- **Updates**: Admin can add new circulars and exams dynamically through the connected database, which will automatically reflect on the user's end.

## 5. Technical Stack & Deployment
- **Frontend**: React + Vite (Web), Capacitor (Android APK).
- **Backend & Database**: Firebase Firestore for dynamic data.
- **Hosting**: Deployed on Firebase Hosting (`job-circular-75dbb.web.app`).
- **CI/CD**: GitHub Actions automatically builds the Android APK upon pushing to the `master` branch.
