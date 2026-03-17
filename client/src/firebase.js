// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-6949a.firebaseapp.com",
  projectId: "mern-estate-6949a",
  storageBucket: "mern-estate-6949a.firebasestorage.app",
  messagingSenderId: "649597116822",
  appId: "1:649597116822:web:b3ed9305dfb18fdc597db7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);