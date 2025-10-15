import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const toggleAddFormBtn = document.getElementById("toggleAddForm");
const addForm = document.getElementById("add-staff-form");
const tableBody = document.getElementById("staff-table-body");
const seedBtn = document.getElementById("seedStaffBtn");
const clearBtn = document.getElementById("clearStaffBtn");
const searchInput = document.getElementById("searchStaff");
const filterRole = document.getElementById("filterRole");

const staffCollection = collection(db, "staffs");

toggleAddFormBtn.addEventListener("click", () => addForm.classList.toggle("hidden"));

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("staff-name").value.trim();
  const email = document.getElementById("staff-email").value.trim();
  const role = document.getElementById("staff-role").value.trim();
  if (!name || !email || !role) return alertPopup("Please fill in all fields.", "warning");
  try {
    toggleAddFormBtn.disabled = true;
    toggleAddFormBtn.innerHTML = loadingSvg("Saving...");
    await addDoc(staffCollection, { name, email, role, createdAt: serverTimestamp() });
    alertPopup("Staff added successfully!", "success");
    addForm.reset();
    addForm.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alertPopup("Failed to add staff.", "error");
  } finally {
    toggleAddFormBtn.disabled = false;
    toggleAddFormBtn.textContent = "+ Add Staff";
  }
});

async function seedStaffRecords() {
  if (!confirm("Seed 30 random staff records?")) return;
  const nigerianNames = [
    "Oluwaseun Adebayo", "Ngozi Okafor", "Emeka Nwosu", "Tosin Alabi",
    "Kehinde Balogun", "Aisha Lawal", "Ifeanyi Eze", "Bose Ogunleye",
    "Gbenga Ajayi", "Funke Ojo", "Chinedu Umeh", "Amaka Udeh",
    "Segun Olatunji", "Fatima Bello", "Tola Akande", "Opeyemi Shittu",
    "David Iroko", "Blessing Udo", "Sade Kareem", "Bayo Afolabi",
    "Halima Musa", "Kunle Oke", "Rita Anozie", "John Oladipo",
    "Chioma Nnamdi", "Abdulrahman Tijani", "Seyi Ogunyemi",
    "Mary Akpan", "Tunde Bankole", "Grace Ekanem", "Olayinka Fuwad"
  ];
  const roles = ["Admin", "HR", "Finance", "IT"];
  try {
    seedBtn.disabled = true;
    seedBtn.innerHTML = loadingSvg("Seeding...");
    const existingDocs = await getDocs(staffCollection);
    const existingEmails = existingDocs.docs.map(d => d.data().email.toLowerCase());
    const promises = nigerianNames.map(name => {
      const email = name.toLowerCase().replace(/\s+/g, ".") + "@company.com";
      if (existingEmails.includes(email)) return null;
      const role = roles[Math.floor(Math.random() * roles.length)];
      return addDoc(staffCollection, { name, email, role, createdAt: serverTimestamp() });
    }).filter(Boolean);
    if (promises.length === 0) return alertPopup("All staff already exist.", "info");
    await Promise.all(promises);
    alertPopup("Staff records seeded successfully!", "success");
  } catch (err) {
    console.error(err);
    alertPopup("Failed to seed staff records.", "error");
  } finally {
    seedBtn.disabled = false;
    seedBtn.textContent = "Seed Staff";
  }
}
if (seedBtn) seedBtn.addEventListener("click", seedStaffRecords);

async function clearAllStaff() {
  if (!confirm("Are you sure you want to delete all staff records?")) return;
  try {
    const existing = await getDocs(staffCollection);
    if (existing.empty) return alertPopup("No staff records to clear.", "info");
    for (const d of existing.docs) await deleteDoc(doc(db, "staffs", d.id));
    alertPopup("All staff records cleared.", "success");
  } catch (err) {
    console.error(err);
    alertPopup("Failed to clear staff records.", "error");
  }
}
if (clearBtn) clearBtn.addEventListener("click", clearAllStaff);

function alertPopup(message, type = "info") {
  const colors = { success: "#22c55e", error: "#ef4444", warning: "#f59e0b", info: "#3b82f6" };
  const existing = document.querySelector(".alert-popup");
  if (existing) existing.remove();
  const popup = document.createElement("div");
  popup.className = `alert-popup ${type}`;
  popup.style.background = colors[type];
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => popup.classList.add("show"), 50);
  setTimeout(() => popup.classList.remove("show"), 2500);
  setTimeout(() => popup.remove(), 3000);
}

function loadingSvg(text) {
  return `<span class="spin">⏳</span> ${text}`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
}

let staffData = [];

function applyFilters() {
  tableBody.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const selectedRole = filterRole.value;
  let filtered = staffData;
  if (searchTerm) {
    filtered = filtered.filter(staff =>
      staff.name.toLowerCase().includes(searchTerm) ||
      staff.email.toLowerCase().includes(searchTerm)
    );
  }
  if (selectedRole) {
    filtered = filtered.filter(staff => staff.role === selectedRole);
  }
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#666;">No staff records found</td></tr>`;
    return;
  }
  filtered.forEach(staff => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(staff.name || "—")}</td>
      <td>${escapeHtml(staff.email || "—")}</td>
      <td>${escapeHtml(staff.role || "—")}</td>
    `;
    tableBody.appendChild(row);
  });
}

onSnapshot(query(staffCollection, orderBy("name")), snapshot => {
  staffData = snapshot.docs.map(doc => doc.data());
  applyFilters();
}, error => {
  console.error(error);
  tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#c00;">Error loading staff records</td></tr>`;
});

searchInput.addEventListener("input", applyFilters);
filterRole.addEventListener("change", applyFilters);
