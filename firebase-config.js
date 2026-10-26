// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {getFirestore,doc} from "https://www.gstatic.com";
import { getAnalytics } from "https://www.gstatic.com";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxeJX-rEYYVyqQtvd063L4_gf7Ox67pfc",
  authDomain: "pindropmiles-468a4.firebaseapp.com",
  projectId: "pindropmiles-468a4",
  storageBucket: "pindropmiles-468a4.firebasestorage.app",
  messagingSenderId: "511326807020",
  appId: "1:511326807020:web:64d79634836dea155b56c9",
  measurementId: "G-Z0ECF0784R",
  idleMinutes: 240,
  adminUid: "",
};

// Initialize Firebase
const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Keep this pointing to your pages collection
export const SITE_DOC = doc(db, "pages", "pindropmiles");