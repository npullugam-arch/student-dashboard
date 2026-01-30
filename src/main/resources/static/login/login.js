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

function getSelectedRole() {
  const checked = document.querySelector('input[name="role"]:checked');
  return checked ? checked.value : "STUDENT";
}

function showError(msg) {
  errorMsg.textContent = msg || "Login failed";
  errorMsg.style.display = "block";
  form.classList.add("wrong-entry");
  setTimeout(() => form.classList.remove("wrong-entry"), 700);
}

function clearError() {
  errorMsg.style.display = "none";
  errorMsg.textContent = "";
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.textContent = isLoading ? "Logging in..." : "Login";
}

// Store session so dashboard can read it
function saveSession({ username, password, role, message }) {
  const session = {
    username,
    role,
    message: message || "Login successful",
    success: true,
    loginTime: new Date().toISOString(),
  };

  // ✅ Keep your existing localStorage session (for your app usage)
  localStorage.setItem("smp_session", JSON.stringify(session));

  // ✅ IMPORTANT: Dashboard code expects sessionStorage keys
  sessionStorage.setItem("auth_username", username);
  sessionStorage.setItem("auth_password", password);
  sessionStorage.setItem("auth_role", role);

  // ✅ Student dashboard uses studentId (we keep same as username like S1001)
  if (role === "STUDENT") {
    sessionStorage.setItem("studentId", username);
  } else {
    sessionStorage.removeItem("studentId");
  }

  console.log("✅ Session saved for dashboard:", { username, role });
}

async function loginToBackend(username, password) {
  const url = "/auth/login";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  // 🔴 INVALID CREDENTIALS (401)
  if (res.status === 401) {
    throw new Error("Invalid Credentials 🐼❌");
  }

  // 🔴 OTHER ERRORS
  if (!res.ok) {
    const rawErr = await res.text().catch(() => "");
    throw new Error(rawErr || "Login failed. Please try again.");
  }

  // ✅ SUCCESS
  const raw = await res.text();

  // If backend returns empty body
  if (!raw) {
    return {
      success: true,
      username,
      // if server doesn't return role, we use selected role
      role: getSelectedRole(),
      message: "Login successful",
    };
  }

  // If backend returns JSON
  try {
    return JSON.parse(raw);
  } catch {
    // If backend returns plain text
    return {
      success: true,
      username,
      role: getSelectedRole(),
      message: raw,
    };
  }
}

function redirectAfterLogin(role) {
  console.log("✅ Redirecting role:", role);

  if (role === "TEACHER") {
    window.location.href = "/teacher/teacher-dashboard.html";
    return;
  }

  if (role === "STUDENT") {
    window.location.href = "/student/student-dashboard.html";
    return;
  }

  // Optional: If you later add admin/office dashboards
  if (role === "ADMIN") {
    window.location.href = "/admin/admin-dashboard.html";
    return;
  }

  if (role === "OFFICE") {
    window.location.href = "/office/office-dashboard.html";
    return;
  }

  // fallback
  window.location.href = "/student/student-dashboard.html";
}

// Submit handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const username = usernameEl.value.trim();
  const pwd = passwordEl.value;
  const selectedRole = getSelectedRole();

  if (!username || !pwd) {
    showError("Please enter username and password.");
    return;
  }

  try {
    setLoading(true);

    const result = await loginToBackend(username, pwd);

    const backendRole = result.role || selectedRole;

    // Role mismatch check (your existing logic)
    if (backendRole !== selectedRole) {
      showError(`You selected ${selectedRole}, but this account is ${backendRole}`);
      return;
    }

    // ✅ Save session for dashboard + keep your local storage session
    saveSession({
      username: result.username || username,
      password: pwd, // needed for Basic Auth calls from dashboard
      role: backendRole,
      message: result.message || "Login successful",
    });

    redirectAfterLogin(backendRole);
  } catch (err) {
    console.error("❌ Login error:", err);
    showError(err instanceof Error ? err.message : "Login failed");
  } finally {
    setLoading(false);
  }
});
