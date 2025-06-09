// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from build instructions
const firebaseConfig = {
  apiKey: "AIzaSyBf036kJdyNIFuiZSpY9AAiiMdUiPqdgew",
  authDomain: "onyx-outpost-122619.firebaseapp.com",
  databaseURL: "https://onyx-outpost-122619.firebaseio.com",
  projectId: "onyx-outpost-122619",
  storageBucket: "onyx-outpost-122619.appspot.com",
  messagingSenderId: "394028987972",
  appId: "1:394028987972:web:99d83e658e087e48d66e11"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };