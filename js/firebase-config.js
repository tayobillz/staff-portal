
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDI4ehbpvN1kJmWjSjtMwlriv64a2ccw9c",
  authDomain: "csc392-portal.firebaseapp.com",
  projectId: "csc392-portal",
  storageBucket: "csc392-portal.appspot.com",
  messagingSenderId: "253642731333",
  appId: "1:253642731333:web:d625a9ec69bff58d36982c",
  measurementId: "G-9GZFXF7ZP4"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, provider, db };


