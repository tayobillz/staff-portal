import { auth, db, provider } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const signupBox = document.getElementById('signup-box');
const loginBox = document.getElementById('login-box');
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const googleLoginBtn = document.getElementById("google-login");

if (showSignup && showLogin) {
  showSignup.addEventListener('click', e => {
    e.preventDefault();
    loginBox.classList.add('hidden');
    signupBox.classList.remove('hidden');
  });

  showLogin.addEventListener('click', e => {
    e.preventDefault();
    signupBox.classList.add('hidden');
    loginBox.classList.remove('hidden');
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const role = "staff";
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        role: role,
        createdAt: new Date()
      });
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("Signup failed: " + error.message);
      console.error(error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      let msg = "";
      switch (error.code) {
        case "auth/user-not-found":
          msg = "No account found with this email.";
          break;
        case "auth/wrong-password":
          msg = "Incorrect password.";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format.";
          break;
        default:
          msg = error.message;
      }
      alert("Login failed: " + msg);
      console.error(error);
    }
  });
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "dashboard.html";
    } catch (error) {
      console.warn("Popup failed, trying redirect...", error.message);
      try {
        await signInWithRedirect(auth, provider);
      } catch (err) {
        alert("Google Sign-In failed: " + err.message);
      }
    }
  });
}

getRedirectResult(auth)
  .then(result => {
    if (result && result.user) {
      window.location.href = "dashboard.html";
    }
  })
  .catch(error => {
    console.error("Redirect login error:", error.message);
  });

onAuthStateChanged(auth, (user) => {
  if (user && window.location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }
});
