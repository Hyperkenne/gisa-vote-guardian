
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtfVHk5bVP5JmhYujD1-4UpfuD0QrW9D8",
  authDomain: "gisa-elections.firebaseapp.com",
  projectId: "gisa-elections",
  storageBucket: "gisa-elections.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "112214916105",
  appId: "1:112214916105:web:9385726cb3828f915a0cd8",
  measurementId: "G-H7G51B02T4"
};

console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
console.log("Firebase app initialized, db reference created");

// Enable offline persistence when possible
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Firebase offline persistence enabled successfully");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Offline persistence could not be enabled due to multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser doesn\'t support offline persistence');
      }
    });
}

// Initialize Analytics (only in browser environment)
let analytics: any = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  console.log("Firebase analytics initialized");
}
export { analytics };
