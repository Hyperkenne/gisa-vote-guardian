
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtfVHk5bVP5JmhYujD1-4UpfuD0QrW9D8",
  authDomain: "gisa-elections.firebaseapp.com",
  projectId: "gisa-elections",
  storageBucket: "gisa-elections.firebasestorage.app",
  messagingSenderId: "112214916105",
  appId: "1:112214916105:web:9385726cb3828f915a0cd8",
  measurementId: "G-H7G51B02T4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };
