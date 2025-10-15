// Firebase Configuration EXAMPLE
// IMPORTANT: This is a template file. DO NOT use these values!
// Copy this file to 'firebase-config.js' and replace with your own Firebase project credentials
// Follow the setup instructions in FIREBASE_SETUP.md to get these values

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!");
} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("Firebase configuration error. Please check your firebase-config.js file and ensure you've added your Firebase credentials.");
}

// Get Firebase services
const auth = firebase.auth();
const database = firebase.database();
