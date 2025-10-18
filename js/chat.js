import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const logoutBtn = document.getElementById("logout-btn");
const sendBtn = document.getElementById("send-chat");
const chatInput = document.getElementById("chat-input");
const chatBox = document.getElementById("chat-box");
const clientsList = document.getElementById("clients-ul");
const clientInfo = document.getElementById("client-info");
const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".clients-sidebar");

let currentClient = null;
let unsubscribeMessages = null;

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "index.html";
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

const demoClients = [
  { id: "demoClient001", name: "Chinedu Okafor" },
  { id: "demoClient002", name: "Amaka Nwosu" },
  { id: "demoClient003", name: "Olumide Adeyemi" },
  { id: "demoClient004", name: "Ifeoma Eze" },
  { id: "demoClient005", name: "Emeka Obi" },
  { id: "demoClient006", name: "Aisha Bello" },
  { id: "demoClient007", name: "Tunde Adebayo" },
  { id: "demoClient008", name: "Funke Ogunleye" },
  { id: "demoClient009", name: "Segun Balogun" },
  { id: "demoClient010", name: "Nkechi Umeh" },
];

const demoMessages = {
  demoClient001: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Good morning, I recently placed an order and would like to confirm its delivery status." },
    { sender: "sent", text: "Good morning! Could you please provide your order ID so I can check the status for you?" },
  ],
  demoClient002: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hello, I am unable to access my account; it seems to be locked." },
    { sender: "sent", text: "Thank you for reaching out. I’ll assist in unlocking your account right away." },
  ],
  demoClient003: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hi, I forgot my password and need guidance on how to reset it." },
    { sender: "sent", text: "No problem! You can reset your password by navigating to Settings → Reset Password." },
  ],
  demoClient004: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Good afternoon, I have a question regarding my latest billing statement." },
    { sender: "sent", text: "Good afternoon! Could you please specify the issue so I can assist with your billing inquiry?" },
  ],
  demoClient005: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hello, I would like to upgrade my subscription plan. Could you guide me through the process?" },
    { sender: "sent", text: "Absolutely! I’ll walk you through the upgrade process step by step." },
  ],
  demoClient006: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hi, I need a copy of my receipt for last month’s payment." },
    { sender: "sent", text: "Certainly! I’ll send the receipt to your registered email shortly." },
  ],
  demoClient007: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hello, I noticed my subscription was cancelled unexpectedly." },
    { sender: "sent", text: "Thank you for notifying us. I’ll assist you in restoring your subscription immediately." },
  ],
  demoClient008: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Good day, I’m experiencing difficulties logging into my account." },
    { sender: "sent", text: "I understand. Please try resetting your password first and let me know if the issue persists." },
  ],
  demoClient009: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hi, I require assistance in updating my payment method." },
    { sender: "sent", text: "Of course! I’ll guide you through the steps to update your payment information." },
  ],
  demoClient010: [
    { sender: "system", text: "Hello! Welcome to Omoolaex Support. Our service team will assist you shortly." },
    { sender: "received", text: "Hello, I’d like to update my profile information. Could you advise me on how to do this?" },
    { sender: "sent", text: "Certainly! You can update your details in Profile Settings by editing the necessary fields." },
  ],
};

async function loadClients() {
  clientsList.innerHTML = "";
  const q = query(collection(db, "clients"));
  onSnapshot(q, (snapshot) => {
    clientsList.innerHTML = "";
    if (snapshot.empty) {
      demoClients.forEach((client) => {
        const li = document.createElement("li");
        li.textContent = client.name;
        li.onclick = () => selectDemoClient(client.id, client);
        clientsList.appendChild(li);
      });
    } else {
      snapshot.forEach((doc) => {
        const li = document.createElement("li");
        li.textContent = doc.data().name || "Unnamed Client";
        li.onclick = () => selectClient(doc.id, doc.data());
        clientsList.appendChild(li);
      });
    }
  });
}

function selectClient(id, data) {
  currentClient = id;
  clientInfo.innerHTML = `<h3>${data.name || "Client"}</h3><p>${data.email || "No email"}</p>`;
  if (window.innerWidth <= 768) sidebar.classList.remove("active");
  loadMessages(id);
}

function selectDemoClient(id, data) {
  currentClient = id;
  clientInfo.innerHTML = `<h3>${data.name}</h3><p>Email: hidden</p><p>Status: Active</p>`;
  if (window.innerWidth <= 768) sidebar.classList.remove("active");
  loadDemoMessages(id);
}

function loadMessages(clientId) {
  if (unsubscribeMessages) unsubscribeMessages();
  chatBox.innerHTML = "";
  const q = query(collection(db, "clients", clientId, "messages"), orderBy("timestamp"));
  unsubscribeMessages = onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = "";
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("bubble-wrapper", msg.sender === "admin" ? "sent" : "received");
      msgDiv.innerHTML = `
        <div class="bubble ${msg.sender === "admin" ? "sent" : "received"}">${msg.text}</div>
        <span class="timestamp">${
          msg.timestamp
            ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""
        }</span>`;
      chatBox.appendChild(msgDiv);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

function loadDemoMessages(clientId) {
  chatBox.innerHTML = "";
  const messages = demoMessages[clientId] || [];
  let i = 0;
  function typeNext() {
    if (i >= messages.length) return;
    const msg = messages[i];
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("bubble-wrapper", msg.sender === "sent" ? "sent" : "received");
    const bubble = document.createElement("div");
    bubble.classList.add("bubble", msg.sender);
    msgDiv.appendChild(bubble);
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    let j = 0;
    const interval = setInterval(() => {
      bubble.textContent = msg.text.slice(0, j++);
      if (j > msg.text.length) {
        clearInterval(interval);
        const timestamp = document.createElement("span");
        timestamp.classList.add("timestamp");
        timestamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        msgDiv.appendChild(timestamp);
        i++;
        setTimeout(typeNext, 700);
      }
    }, 35);
  }
  typeNext();
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || !currentClient) return;
  if (currentClient.startsWith("demoClient")) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("bubble-wrapper", "sent");
    msgDiv.innerHTML = `<div class="bubble sent">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatInput.value = "";
    setTimeout(() => {
      const reply = document.createElement("div");
      reply.classList.add("bubble-wrapper", "received");
      reply.innerHTML = `<div class="bubble received">Thank you for your message. Our support representative will review it shortly.</div>`;
      chatBox.appendChild(reply);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1500);
    return;
  }
  await addDoc(collection(db, "clients", currentClient, "messages"), {
    text,
    sender: "admin",
    timestamp: serverTimestamp(),
  });
  chatInput.value = "";
}

loadClients();
