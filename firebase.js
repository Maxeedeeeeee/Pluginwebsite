// firebase.js
// This script initializes Firebase and handles authentication (login, signup, logout)
// and basic user data storage in Firestore.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCustomToken, // For Canvas environment
  signInAnonymously // For Canvas environment fallback
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase Configuration ---
// These global variables are provided by the Canvas environment.
// DO NOT modify these or add your own API key.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userId = null; // To store the current user's UID or anonymous ID

/**
 * Displays a message on the UI, typically for success or error feedback.
 * @param {string} text - The message text to display.
 * @param {string} type - 'success' or 'error' to determine styling.
 */
function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = text;
        messageElement.className = 'message ' + type;
        // Clear message after a few seconds
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 5000);
    } else {
        console.log(`Message (${type}): ${text}`);
    }
}

/**
 * Handles user registration with email and password.
 * Also stores basic user data in Firestore.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<void>}
 */
async function handleSignup(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        const userRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, user.uid);
        await setDoc(userRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            // You can add more user profile fields here
        });

        showMessage('Signup successful! Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } catch (error) {
        console.error("Signup error:", error);
        showMessage(`Signup failed: ${error.message}`, 'error');
    }
}

/**
 * Handles user login with email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<void>}
 */
async function handleLogin(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        showMessage('Login successful! Redirecting to marketplace...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error("Login error:", error);
        showMessage(`Login failed: ${error.message}`, 'error');
    }
}

/**
 * Handles user logout.
 */
async function handleLogout() {
    try {
        await signOut(auth);
        showMessage('Logged out successfully.', 'success');
        // Redirect to homepage or login page after logout
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout error:", error);
        showMessage(`Logout failed: ${error.message}`, 'error');
    }
}

// --- Authentication State Observer ---
// This function runs whenever the user's login state changes.
onAuthStateChanged(auth, async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userEmailDisplay = document.getElementById('userEmailDisplay');

    if (user) {
        // User is signed in
        userId = user.uid;
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (userEmailDisplay) {
            userEmailDisplay.textContent = `Welcome, ${user.email}`;
            userEmailDisplay.classList.remove('hidden');
        }

        // Fetch user data from Firestore if needed (e.g., to display a custom username)
        // const userRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, user.uid);
        // const userSnap = await getDoc(userRef);
        // if (userSnap.exists()) {
        //     console.log("User profile data:", userSnap.data());
        // }

    } else {
        // User is signed out
        userId = crypto.randomUUID(); // Use a random ID for anonymous users if not authenticated
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (userEmailDisplay) {
            userEmailDisplay.textContent = '';
            userEmailDisplay.classList.add('hidden');
        }
    }
});

// --- Canvas Environment Authentication ---
// This block ensures the app signs in using the provided token or anonymously
// when running in the Canvas environment.
async function authenticateInCanvas() {
    try {
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Signed in with custom token for Canvas environment.");
        } else {
            await signInAnonymously(auth);
            console.log("Signed in anonymously for Canvas environment.");
        }
    } catch (error) {
        console.error("Firebase Canvas authentication error:", error);
    }
}

authenticateInCanvas(); // Call this function on script load.

// --- Attach Event Listeners to Forms ---
// Check if elements exist before attaching listeners to avoid errors on pages
// where these forms are not present.
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm.elements['email'].value;
        const password = signupForm.elements['password'].value;
        const confirmPassword = signupForm.elements['confirmPassword'].value;

        if (password !== confirmPassword) {
            showMessage("Passwords do not match!", 'error');
            return;
        }
        if (password.length < 6) {
             showMessage("Password should be at least 6 characters.", 'error');
             return;
        }

        handleSignup(email, password);
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.elements['email'].value;
        const password = loginForm.elements['password'].value;
        handleLogin(email, password);
    });
}

const logoutButton = document.getElementById('logoutBtn');
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

// Export useful functions/variables if other scripts need them
export { auth, db, userId, appId, showMessage };
