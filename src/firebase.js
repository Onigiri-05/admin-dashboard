import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGQxQhqYsF5I622Oa6ywVxvis9nQ7mDmQ",
  authDomain: "pdbl-project-d61da.firebaseapp.com",
  projectId: "pdbl-project-d61da",
  storageBucket: "pdbl-project-d61da.firebasestorage.app",
  messagingSenderId: "1015990778323",
  appId: "1:1015990778323:web:60c66a15bc81bbfeb65726",
  measurementId: "G-W3T4QH2KGF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();