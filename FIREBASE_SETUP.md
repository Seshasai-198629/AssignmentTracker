# Firebase Setup Guide for College Tracker

Follow these steps to set up Firebase for your College Assignment Tracker. This will enable you to access your data from any device!

## Step 1: Create a Firebase Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account (or create one if you don't have it)
3. Click **"Add project"** or **"Create a project"**

## Step 2: Create a New Firebase Project

1. **Project Name**: Enter a name (e.g., "College Tracker" or "Assignment Tracker")
2. **Google Analytics**: You can disable this (not needed for this project)
3. Click **"Create project"**
4. Wait for the project to be created (takes about 30 seconds)
5. Click **"Continue"** when ready

## Step 3: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) to add a web app
2. **App nickname**: Enter a name (e.g., "College Tracker Web")
3. **DO NOT** check "Firebase Hosting" (not needed)
4. Click **"Register app"**

## Step 4: Get Your Firebase Configuration

You'll see a code snippet that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**IMPORTANT**: Copy these values! You'll need them in the next step.

Click **"Continue to console"** when done.

## Step 5: Enable Authentication

1. In the left sidebar, click **"Authentication"** (or **"Build" > "Authentication"**)
2. Click **"Get started"**
3. Click on **"Email/Password"** in the Sign-in method tab
4. **Enable** the first toggle (Email/Password)
5. You can leave "Email link (passwordless sign-in)" disabled
6. Click **"Save"**

## Step 6: Enable Realtime Database

1. In the left sidebar, click **"Realtime Database"** (or **"Build" > "Realtime Database"**)
2. Click **"Create Database"**
3. **Location**: Choose a location closest to you (e.g., United States)
4. Click **"Next"**
5. **Security rules**: Select **"Start in test mode"** for now
6. Click **"Enable"**

### Important: Update Security Rules (After Testing)

For better security, after you've tested everything works, update your database rules:

1. In Realtime Database, go to the **"Rules"** tab
2. Replace the rules with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

3. Click **"Publish"**

This ensures users can only read/write their own data.

## Step 7: Configure Your App

1. Open the file `firebase-config.js` in your project folder
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **Save the file**

## Step 8: Test Your App

1. Open `login.html` in your web browser
2. Create a new account with your email and password
3. Add some test classes and assignments
4. Try logging out and logging back in
5. Open the app on another device or browser - you should see the same data!

## Troubleshooting

### "Firebase configuration error"
- Make sure you copied all the config values correctly in `firebase-config.js`
- Check that there are no typos in the values

### "Permission denied" error
- Make sure you enabled Email/Password authentication
- Check that your Realtime Database rules are set correctly (test mode for now)

### Can't create account / login
- Verify Email/Password is enabled in Firebase Authentication
- Check the browser console (F12) for specific error messages

### Data not syncing across devices
- Make sure you're logged in with the same email on both devices
- Check that the databaseURL in `firebase-config.js` is correct
- Verify Realtime Database is enabled and has test mode rules

## Security Notes

- **Never share your `firebase-config.js` values publicly** (e.g., on GitHub)
- After testing, update your security rules as shown in Step 6
- Use a strong password for your account
- Firebase free tier includes:
  - 50,000 reads/day
  - 20,000 writes/day
  - 1GB stored data
  - More than enough for personal use!

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs/web/setup)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Realtime Database Guide](https://firebase.google.com/docs/database/web/start)

---

## Summary Checklist

✅ Created Firebase project  
✅ Registered web app  
✅ Copied configuration values  
✅ Enabled Email/Password authentication  
✅ Created Realtime Database  
✅ Updated `firebase-config.js` with your values  
✅ Tested creating account and logging in  
✅ Updated security rules (after testing)  

**Congratulations!** Your College Tracker now works across all your devices! 🎉
