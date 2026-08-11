# LifeLink Production Cloud Deployment & Public Access Guide

This guide details how to make LifeLink publicly available over the internet so any user worldwide can access the web application, register real accounts, and download the mobile APK.

---

## ⚡ Option 1: Instant Local Network / Wi-Fi Access (No Cloud Account Needed)

To open the app on your mobile phone connected to the same Wi-Fi network:

1. Open Command Prompt (`cmd`) and type:
   ```bash
   ipconfig
   ```
2. Find your **IPv4 Address** (e.g., `192.168.1.15`).
3. Open your mobile phone browser and visit:
   ```
   http://192.168.1.15:3000
   ```
4. You can log in, register, and test the app live on your phone!

---

## 🌐 Option 2: 1-Click Free Permanent Cloud Deployment

### 1. Public Frontend Website Deployment (Vercel - 100% Free)
- Pre-configured file: [`client/vercel.json`](file:///c:/organ%20donation%20app/client/vercel.json)
- Steps:
  1. Push code to GitHub repository.
  2. Log in to [Vercel.com](https://vercel.com) and click **"New Project"**.
  3. Select the `client` directory.
  4. Click **Deploy**.
- **Result**: You receive a permanent public link like `https://lifelink-app.vercel.app` accessible to anyone in the world!

---

### 2. Public Backend REST API Deployment (Render.com - 100% Free)
- Pre-configured file: [`server/render.yaml`](file:///c:/organ%20donation%20app/server/render.yaml)
- Steps:
  1. Log in to [Render.com](https://render.com).
  2. Click **"New Web Service"** and select your repository `server` folder.
  3. Select Node.js environment and click **Deploy Service**.
- **Result**: You receive a public API link like `https://lifelink-api.onrender.com`!

---

### 3. Public Android APK Mobile Build (Expo EAS Build - Free)
- Steps to build a downloadable `.apk` file for any Android phone:
  ```bash
  cd "c:\organ donation app\mobile"
  npx eas-cli build -p android --profile preview
  ```
- **Result**: Generates a public link where any mobile user can download and install `LifeLink.apk` directly on their device!
