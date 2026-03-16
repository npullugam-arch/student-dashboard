console.log("✅ login.js loaded");

// =============================
// Panda UI effects
// =============================
const passwordEl = document.getElementById("password");
const form = document.getElementById("loginForm");

passwordEl.addEventListener("focus", () => form.classList.add("up"));
passwordEl.addEventListener("blur", () => form.classList.remove("up"));

document.addEventListener("mousemove", (event) => {
  const dw = document.documentElement.clientWidth / 15;
  const dh = document.documentElement.clientHeight / 15;
  const x = event.pageX / dw;
  const y = event.pageY / dh;

  document.querySelectorAll(".eye-ball").forEach((ball) => {
    const sizeX = Math.min(10, Math.max(2, x));
    const sizeY = Math.min(10, Math.max(2, y));
    ball.style.width = sizeX + "px";
    ball.style.height = sizeY + "px";
  });
});

// =============================
// Login Logic
// =============================
const usernameEl = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");
const rightBubble = document.getElementById("pandaRightBubble");

function getSelectedRole() {
  const checked = document.querySelector('input[name="role"]:checked');
  return checked ? checked.value : "STUDENT";
}

function triggerWrongEntry() {
  form.classList.remove("wrong-entry");
  void form.offsetWidth; // restart animation
  form.classList.add("wrong-entry");
  setTimeout(() => form.classList.remove("wrong-entry"), 900);
}

function showRightBubble(msg) {
  // keep old alert hidden
  if (errorMsg) errorMsg.style.display = "none";

  if (rightBubble) {
    rightBubble.textContent = msg || "Login failed";
    rightBubble.style.display = "block";

    rightBubble.classList.remove("bubble-pop");
    void rightBubble.offsetWidth;
    rightBubble.classList.add("bubble-pop");
  }

  triggerWrongEntry();
}

function clearError() {
  if (errorMsg) {
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
  }
  if (rightBubble) {
    rightBubble.style.display = "none";
    rightBubble.textContent = "";
  }
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Logging in..." : "Login";
}

// =============================
// Session Storage (UNCHANGED)
// =============================
function saveSession({ username, password, role, message }) {
  const basicToken = btoa(`${username}:${password}`);

  const session = {
    username,
    role,
    message: message || "Login successful",
    success: true,
    loginTime: new Date().toISOString(),
    basicToken
  };

  localStorage.setItem("smp_session", JSON.stringify(session));

  sessionStorage.setItem("auth_username", username);
  sessionStorage.setItem("auth_password", password);
  sessionStorage.setItem("auth_role", role);

  if (role === "STUDENT") {
    sessionStorage.setItem("studentId", username);
  } else {
    sessionStorage.removeItem("studentId");
  }

  console.log("✅ Session saved:", { username, role });
}

// =============================
// ✅ POPUP FIX: send Authorization header
// =============================
async function loginToBackend(username, password) {
  const url = "/auth/login";

  // ✅ prevents browser Basic-Auth popup when backend sends 401 + WWW-Authenticate
  const authHeader = `Basic ${btoa(`${username}:${password}`)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": authHeader,     // ✅ IMPORTANT
      "X-Requested-With": "fetch"      // ✅ helps some setups avoid auth dialog
    },
    credentials: "omit",
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) {
    throw new Error("Invalid Username or Password ❌");
  }

  if (!res.ok) {
    const rawErr = await res.text().catch(() => "");
    throw new Error(rawErr || "Login failed. Please try again.");
  }

  const raw = await res.text();

  if (!raw) {
    return {
      success: true,
      username,
      role: getSelectedRole(),
      message: "Login successful",
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      success: true,
      username,
      role: getSelectedRole(),
      message: raw,
    };
  }
}

function redirectAfterLogin(role) {
  if (role === "TEACHER") return (window.location.href = "/teacher/teacher-dashboard.html");
  if (role === "STUDENT") return (window.location.href = "/student/student-dashboard.html");
  if (role === "ADMIN") return (window.location.href = "/admin/admin-dashboard.html");
  if (role === "OFFICE") return (window.location.href = "/office/office-dashboard.html");
  window.location.href = "/student/student-dashboard.html";
}

// =============================
// Submit Handler
// =============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const username = usernameEl.value.trim();
  const pwd = passwordEl.value;
  const selectedRole = getSelectedRole();

  if (!username || !pwd) {
    showRightBubble("Please enter username and password.");
    return;
  }

  try {
    setLoading(true);

    const result = await loginToBackend(username, pwd);
    const backendRole = result.role || selectedRole;

    if (backendRole !== selectedRole) {
      showRightBubble(`You selected ${selectedRole}, but this account is ${backendRole}.`);
      return;
    }

    saveSession({
      username: result.username || username,
      password: pwd,
      role: backendRole,
      message: result.message || "Login successful",
    });

    redirectAfterLogin(backendRole);

  } catch (err) {
    console.error("❌ Login error:", err);
    showRightBubble(err instanceof Error ? err.message : "Login failed");
  } finally {
    setLoading(false);
  }
});