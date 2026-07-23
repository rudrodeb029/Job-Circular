# Job Circular Mobile Application 🚀

Welcome to the **Job Circular Mobile App** repository. This is a premium, feature-rich React-based hybrid mobile application designed to deliver real-time government and private job notices in Bangladesh, along with a comprehensive **Live MCQ Exam** system, interactive **Question Banks**, and an administrative control panel.

---

## 🌟 Key Features

### 1. Dynamic Job Feeds & Categorization
*   **Job Category Feeds**: Clean category filters (বিসিএস, ব্যাংক, NTRCA, প্রাইমারি, বিভিন্ন মন্ত্রনালয়).
*   **Dynamic Notice Badges**: Automatic type tagging (`REGULAR`, `EXAM DATE`, `RESULT`) next to English titles.
*   **Multi-Image Gallery Viewer**: Zoom and swipe features for official circular image attachments.

### 2. Live MCQ Exam Engine (Live MCQ Exam)
*   **Scheduled countdowns**: Ticking real-time countdown clocks (`⏱️`) for upcoming tests.
*   **Automatic Registration**: Registration state persists in local storage with double-confirmation toast alerts.
*   **Dynamic Leaderboard**: Features profiles with avatar photos, ranks, and live rank cards.

### 3. Questions & Answers Hub
*   **Central Q&A Destination**: Grid dashboard on home page for quick navigation.
*   **Categorized Papers**: Access question sets by subjects (গণিত, বিজ্ঞান, বাংলা, ইংরেজি) with clean badges.

### 4. Admin Panel Workspace
*   **Circular Management**: Add, edit, or delete circular postings.
*   **Dynamic Question Bank Editor**: Modal tools to add question sheets, modify questions/explanations, and set answers.

### 5. Settings & Play Store Compliance
*   **Delete Account & Data**: Compliance option to clear profiles and reset onboarding.
*   **Version Update Prompts**: Automated alerts triggered by release versioning checks.

---

## 🛠️ Technology Stack

*   **Frontend Library**: React (v18+)
*   **Build Tool**: Vite
*   **Router**: React Router DOM (v6)
*   **Mobile Wrapper**: Capacitor
*   **Local Cache**: LocalStorage Sync APIs
*   **Styling**: Vanilla CSS (CSS variables, glassmorphism, responsive grid layouts)

---

## ⚙️ Local Development Setup

To run the project on your local machine, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Clone the Repository
```bash
git clone https://github.com/rudrodeb029/Job-Circular.git
cd Job-Circular
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
The application will start running at `http://localhost:3000` (or the port indicated in your console).

### 5. Build for Production
To build the static assets for production deployment or mobile packaging:
```bash
npm run build
```

---

## 📂 Project Structure

```
Job-Circular/
├── android/                   # Native Android Android Studio Project wrapper
├── public/                    # Static assets
└── src/
    ├── components/            # Reusable UI elements (AppHeader, BottomNav, Modals, etc.)
    ├── context/               # React Context providers (AppContext, AdminContext)
    ├── data/                  # Static mock datasets (jobs, categories, questions)
    ├── pages/                 # Routing page views (Home, JobDetails, LiveExams, Settings)
    │   └── admin/             # Admin portal pages (AdminDashboard, ManageQuestions)
    ├── styles/                # CSS styling systems (globals.css, components.css, admin.css)
    ├── utils/                 # General helpers (notifications, helpers)
    ├── App.jsx                # Main App entry point and router setup
    └── main.jsx               # React DOM bootstrapping root
```

---

## 📄 Guides & Documentation

For details on push notifications integration or Google Play Store submission steps, refer to:
*   [Play Store Submission Guide](file:///c:/Users/Suvro/Desktop/Job%20Circular/PLAY_STORE_SUBMISSION_GUIDE.md)
*   [Push Notifications Guide](file:///c:/Users/Suvro/Desktop/Job%20Circular/PUSH_NOTIFICATIONS_GUIDE.md)
