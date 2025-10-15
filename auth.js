// Firebase Authentication System
// This file handles login, logout, and session management with Firebase

// Global variable to store current user
let currentUser = null;

// Check authentication on protected pages
function checkAuth() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only check auth on protected pages (not login page)
    if (currentPage !== 'index.html' && currentPage !== '') {
        // Use Firebase auth state observer
        auth.onAuthStateChanged(user => {
            if (!user) {
                // User not authenticated, redirect to login
                window.location.href = 'index.html';
            } else {
                currentUser = user;
                console.log('User authenticated:', user.email);
            }
        });
    }
}

// Initialize auth check on page load (for protected pages)
if (window.location.pathname.split('/').pop() !== 'index.html') {
    checkAuth();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            console.log('User signed out successfully');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        });
    }
}

// Login page specific code
if (window.location.pathname.split('/').pop() === 'index.html' || window.location.pathname.split('/').pop() === '') {
    document.addEventListener('DOMContentLoaded', function() {
        // Check if user is already logged in
        auth.onAuthStateChanged(user => {
            if (user) {
                // User is already logged in, redirect to main page
                window.location.href = 'assignments.html';
            } else {
                // Show only login form by default
                document.getElementById('loginSection').style.display = 'block';
                document.getElementById('setupSection').style.display = 'none';
            }
        });
        
        // Setup form handler (Sign Up)
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            setupForm.addEventListener('submit', handleSignup);
        }
        
        // Login form handler
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        // Toggle between login and signup
        const toggleButtons = document.querySelectorAll('.toggle-form');
        toggleButtons.forEach(button => {
            button.addEventListener('click', toggleForms);
        });
    });
}

// Handle Sign Up (Firebase)
function handleSignup(e) {
    e.preventDefault();
    
    const email = document.getElementById('setupEmail').value;
    const password = document.getElementById('setupPassword').value;
    const confirmPassword = document.getElementById('setupPasswordConfirm').value;
    const errorDiv = document.getElementById('setupError');
    const successDiv = document.getElementById('setupSuccess');
    
    // Clear previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Validate passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match. Please try again.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validate password length
    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Create user with Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successfully created user
            const user = userCredential.user;
            console.log('User created:', user.email);
            
            successDiv.textContent = 'Account created successfully! Redirecting...';
            successDiv.style.display = 'block';
            
            // Redirect to main page
            setTimeout(() => {
                window.location.href = 'assignments.html';
            }, 1500);
        })
        .catch((error) => {
            console.error('Signup error:', error);
            let errorMessage = 'Error creating account. Please try again.';
            
            // Handle specific Firebase errors
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login instead.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Use at least 6 characters.';
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        });
}

// Handle Login (Firebase)
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    // Clear previous error
    errorDiv.style.display = 'none';
    
    // Sign in with Firebase Authentication
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Successfully logged in
            const user = userCredential.user;
            console.log('User logged in:', user.email);
            
            // Redirect to main page
            window.location.href = 'assignments.html';
        })
        .catch((error) => {
            console.error('Login error:', error);
            let errorMessage = 'Error logging in. Please try again.';
            
            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address format.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            }
            
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        });
}

// Toggle between login and signup forms
function toggleForms() {
    const setupSection = document.getElementById('setupSection');
    const loginSection = document.getElementById('loginSection');
    
    if (setupSection.style.display === 'none') {
        setupSection.style.display = 'block';
        loginSection.style.display = 'none';
    } else {
        setupSection.style.display = 'none';
        loginSection.style.display = 'block';
    }
}

// Get current user ID for database operations
function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

// Password reset function
function resetPassword(email) {
    return auth.sendPasswordResetEmail(email)
        .then(() => {
            return { success: true, message: 'Password reset email sent! Check your inbox.' };
        })
        .catch((error) => {
            console.error('Password reset error:', error);
            return { success: false, message: 'Error sending password reset email.' };
        });
}
