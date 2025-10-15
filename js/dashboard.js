// ===== Firebase Imports =====
import { auth, db } from "./firebase-config.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ===== DOM Elements =====
const welcomeMsg = document.getElementById("welcome-msg");
const userRole = document.getElementById("user-role");
const logoutBtn = document.getElementById("logout-btn");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggle-btn");

const dashboardSection = document.getElementById("dashboard-section");
const recordsSection = document.getElementById("records-section");
const chatSection = document.getElementById("chat-section");
const navDashboard = document.getElementById("nav-dashboard");
const navRecords = document.getElementById("nav-records");
const navChat = document.getElementById("nav-chat");

const totalStaff = document.getElementById("total-staff");
const activeChats = document.getElementById("active-chats");

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");

// ===== Check Auth State =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  let displayName = user.displayName || user.email.split("@")[0];

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      displayName = userSnap.data().name || displayName;
      userRole.textContent = userSnap.data().role || "Staff";
    }
  } catch (err) {
    console.warn("Error fetching profile:", err.message);
  }

  const greeting = getGreeting();
  welcomeMsg.textContent = `${greeting}, ${displayName}`;

  loadStaffStats();
});


function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function showSection(section) {
  [dashboardSection, recordsSection, chatSection].forEach((sec) => {
    sec.classList.add("hidden");
    sec.style.opacity = 0;
  });

  section.classList.remove("hidden");
  setTimeout(() => {
    section.style.opacity = 1;
    section.style.transition = "opacity 0.3s ease-in-out";
  }, 50);
}

function setActiveLink(link) {
  document.querySelectorAll(".nav-links a").forEach((el) => el.classList.remove("active"));
  link.classList.add("active");
}

navDashboard.addEventListener("click", () => { showSection(dashboardSection); setActiveLink(navDashboard); });
navRecords.addEventListener("click", () => { showSection(recordsSection); setActiveLink(navRecords); });
navChat.addEventListener("click", () => { showSection(chatSection); setActiveLink(navChat); });


toggleBtn.addEventListener("click", () => sidebar.classList.toggle("active"));


logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
});

async function loadStaffStats() {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    let staffCount = 0;

    snapshot.forEach(doc => {
      if (doc.data().role === "staff") staffCount++;
    });

    totalStaff.textContent = staffCount;
    activeChats.textContent = 0; 
  } catch (err) {
    console.error("Failed to load staff stats:", err);
  }
}

if (sendChat) {
  sendChat.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    const bubble = document.createElement("div");
    bubble.textContent = msg;
    bubble.classList.add("chat-bubble");
    chatBox.appendChild(bubble);
    chatBox.scrollTop = chatBox.scrollHeight;
    chatInput.value = "";
  });
}
