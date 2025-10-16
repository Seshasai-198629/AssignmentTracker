// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// Follow the setup instructions in FIREBASE_SETUP.md to get these values

const firebaseConfig = {
  apiKey: "AIzaSyBcYdr75MdttucIMA7smmtr6yQnzPqkYgo",
  authDomain: "classes-tracker-e47d8.firebaseapp.com",
  projectId: "classes-tracker-e47d8",
  storageBucket: "classes-tracker-e47d8.firebasestorage.app",
  messagingSenderId: "512280774633",
  appId: "1:512280774633:web:6e81e57f0dd0d1efbfed78",
  measurementId: "G-EQYNCPL16T"
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
