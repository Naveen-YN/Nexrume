# 🚀 Nexrume — Autonomous Personal Career Command Center & OS

Nexrume is a high-performance, unified career operating system designed to centralize, track, and automate your software engineering job search across **Web, Windows Desktop, and Android Mobile**. 

Featuring clean dark-mode aesthetics, real-time AI email scanning, deep LeetCode profiling, and resilient cross-device database syncing using Google Sheets as a backend.

---

## ✨ Core Features

### 📦 Multi-Platform Native Wrappers
* **Web Portal (Next.js)**: Live-hosted at [nexrume.vercel.app](https://nexrume.vercel.app) for instant access.
* **Windows Portable (`.exe`)**: Desktop Electron shell with borderless window configuration and auto-hidden menu bars.
* **Android Mobile (`.apk`)**: Capacitor-wrapped native package optimized for mobile viewports, featuring adaptive vertical layouts.

### 🔑 Secure Device Pairing & OAuth Webview Bypass
* Bypasses Google OAuth's strict mobile/desktop webview limitations (`403 Disallowed User-Agent`) via secure **Device Pairing Tokens**.
* Generate a secure pairing token on a logged-in browser session, paste it into the mobile or desktop app wrapper, and authenticate instantly via shared secure cookie injectors.

### 🔄 Two-Way Google Sheets Synchronization
* Syncs a comprehensive **17-column dataset** including job application IDs, notes, stage timelines (JSON logs), JDs, resume files, and modification timestamps.
* Implements a **two-way merge algorithm** resolving conflicts using `updatedAt` metadata timestamps. Changes made on mobile, desktop, or directly inside the Google Sheet are synchronized automatically rather than overwriting each other.

### 📊 Deep LeetCode Profile Dashboard
* Parses solve counts by difficulty (**Easy, Medium, Hard**), acceptance rates, global ranks, and contest ratings dynamically.
* Dynamically adapts grid layouts to hide empty metrics cleanly (e.g. if the user has not attended contests) to ensure zero broken placeholders.

### 📝 AI Resume customizer & PDF Compiler
* FlowCV-style customize panel allowing real-time accent color adjustment, Google Fonts injection, font sizing, and section reordering.
* Interactive **Resume Deletion** featuring safe-focus redirect fallback, public toggle configuration, and instant local base64 photo uploaders.

---

## 🛠️ Technology Stack

* **Core Framework**: Next.js 16 (React 19, App Router, TypeScript)
* **Styling**: Tailwind CSS 4 (Custom animations, glassmorphism card templates)
* **State Management**: Zustand 5 + LocalStorage Persistence Middleware
* **API Handlers**: Next.js API Routes (JSON Web Tokens, googleapis, jwt, oauth2Client)
* **Mobile Wrapper**: @capacitor/core & @capacitor/android
* **Desktop Wrapper**: Electron 31 & electron-builder

---

## 📂 Codebase Directory Structure

```
├── android/                 # Capacitor Native Android Studio Project
├── desktop/                 # Standalone Electron Desktop Project
│   ├── main.js              # Electron window configuration
│   └── package.json         # Desktop dependencies & packaging scripts
├── public/                  # Static assets & brand graphics
├── src/
│   ├── app/                 # Next.js App Router (Layouts & API endpoints)
│   │   ├── api/             # Sheets sync, Gmail sync, LeetCode sync, Auth pairing
│   │   └── page.tsx         # Main interactive dashboard container
│   ├── components/          # Reusable UI components (header, sidebars, copilot)
│   ├── context/
│   │   └── store.ts         # Zustand global state (actions, state cleanups, merges)
│   └── db/
│       └── mockData.ts      # Profile schemas & mock data fallbacks (isolated for alex.dev@gmail.com)
├── capacitor.config.json    # Capacitor webview routing & properties
└── package.json             # Root commands, Next.js build, and dev scripts
```

---

## 🚀 Getting Started

### 1. Prerequisite Environments
Create a `.env` file in the root folder containing:
```env
JWT_SECRET=your-secure-jwt-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_APP_URL=https://nexrume.vercel.app # Or http://localhost:3005 for local dev
```

### 2. Run the Development Server
Install root dependencies and start Next.js:
```bash
npm install
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) to view the application.

### 3. Build & Package Windows Desktop (Electron)
To package the Electron desktop application into a portable Windows build:
```bash
npm run desktop:build
```
This will restore desktop packages and run `electron-builder --win` compiling the client to `desktop/dist/win-unpacked`.

### 4. Build & Package Android Mobile (Capacitor)
To synchronize front-end updates with Android Studio:
```bash
npx cap sync
```
Open the `/android` directory inside **Android Studio** to compile the release or debug `.apk` package.
