import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendChat = document.getElementById("send-chat");
const logoutBtn = document.getElementById("logout-btn");
const clientsUl = document.getElementById("clients-ul");
const clientInfoPanel = document.getElementById("client-info");

let currentClientId = null;


function createBubble(text, type, timestamp = new Date()) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("bubble-wrapper", type);

  const bubble = document.createElement("div");
  bubble.classList.add(
    "bubble",
    type === "sent" ? "sent" : type === "received" ? "received" : "system"
  );
  bubble.textContent = text;

  const time = document.createElement("span");
  time.classList.add("timestamp");
  time.textContent = timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.appendChild(document.createElement("br"));
  bubble.appendChild(time);
  wrapper.appendChild(bubble);

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}


function showTypingIndicator(sender = "received") {
  const typingWrapper = document.createElement("div");
  typingWrapper.classList.add("bubble-wrapper", sender);

  const typingBubble = document.createElement("div");
  typingBubble.classList.add("bubble", sender, "typing-bubble");
  typingBubble.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;

  typingWrapper.appendChild(typingBubble);
  chatBox.appendChild(typingWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typingWrapper;
}

function removeTypingIndicator(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}


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


function loadClients() {
  clientsUl.innerHTML = "";
  demoClients.forEach((client) => {
    const li = document.createElement("li");
    li.textContent = client.name;
    li.addEventListener("click", () => {
      currentClientId = client.id;
      loadMessages(client.id);
      updateClientInfo(client);
    });
    clientsUl.appendChild(li);
  });
}


function updateClientInfo(client) {
  clientInfoPanel.innerHTML = `
    <h3>${client.name}</h3>
    <p>Email: hidden</p>
    <p>Status: Active</p>
  `;
}


async function loadMessages(clientId) {
  chatBox.innerHTML = ""; 
  const messages = demoMessages[clientId] || [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    
    if (msg.sender === "system" || msg.sender === "received") {
      const typingEl = showTypingIndicator(msg.sender);
      await new Promise((res) => setTimeout(res, 1200 + Math.random() * 1000));
      removeTypingIndicator(typingEl);
    }

    await typeMessage(msg.text, msg.sender);
  }
}


async function typeMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `bubble-wrapper ${sender}`;
  const inner = document.createElement("div");
  inner.className = `bubble ${sender}`;
  bubble.appendChild(inner);
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;

  for (let i = 0; i < text.length; i++) {
    inner.textContent += text[i];
    await new Promise((res) => setTimeout(res, 15 + Math.random() * 20));
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}


function sendMessage() {
  if (!currentClientId) return alert("Please select a client first!");
  const msg = chatInput.value.trim();
  if (!msg) return;

  createBubble(msg, "sent");
  chatInput.value = "";

  
  const typingEl = showTypingIndicator("received");
  setTimeout(() => {
    removeTypingIndicator(typingEl);
    createBubble("Thank you for your message. Our support representative will review it shortly.", "received");
  }, 1800 + Math.random() * 1000);
}


sendChat.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});


onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
  else loadClients();
});
