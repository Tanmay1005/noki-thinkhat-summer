import { FIREBASE_CONFIG } from "config";
import { initializeApp } from "firebase/app";
import {
	PhoneAuthProvider,
	PhoneMultiFactorGenerator,
	RecaptchaVerifier,
	getAuth,
	getMultiFactorResolver,
	onAuthStateChanged,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";

import { getDatabase, ref } from "firebase/database"; // ✅ Added for Realtime DB
import { getFunctions } from "firebase/functions";

// Initialize Firebase App
const firebaseApp = initializeApp(FIREBASE_CONFIG);

// Firebase Auth
const auth = getAuth(firebaseApp);

// Firebase Functions (specify region if needed)
const functionsInstance = getFunctions(firebaseApp, "us-east4");

// ✅ Realtime Database Instance
const realtimeDb = getDatabase(
	firebaseApp,
	"https://formd-notifications-dev.firebaseio.com",
);

// ✅ Helper: Get a reference to any path in the database
const dbRef = (path) => ref(realtimeDb, path);

export {
	auth,
	functionsInstance,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	signOut,
	sendEmailVerification,
	PhoneAuthProvider,
	RecaptchaVerifier,
	getMultiFactorResolver,
	PhoneMultiFactorGenerator,
	sendPasswordResetEmail,
	realtimeDb, // ✅ Exported
	dbRef, // ✅ Exported helper to get a path ref easily
};
