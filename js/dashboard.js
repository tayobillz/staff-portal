import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDI4ehbpvN1kJmWjSjtMwlriv64a2ccw9c",
  authDomain: "csc392-portal.firebaseapp.com",
  projectId: "csc392-portal",
  storageBucket: "csc392-portal.appspot.com",
  messagingSenderId: "253642731333",
  appId: "1:253642731333:web:d625a9ec69bff58d36982c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");
const sidebar = document.getElementById("sidebar");
const toggleBtnMobile = document.getElementById("toggle-btn-mobile");
const totalStaff = document.getElementById("total-staff");
const activeChats = document.getElementById("active-chats");


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  const name = user.displayName || user.email.split("@")[0];
  welcomeMsg.textContent = `Welcome, ${name}!`;
  loadStaffStats();
});

toggleBtnMobile.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});


logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});


async function loadStaffStats() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);
  let count = 0;
  snapshot.forEach(doc => {
    if (doc.data().role === "staff") count++;
  });
  totalStaff.textContent = count;
  activeChats.textContent = 0;
}
