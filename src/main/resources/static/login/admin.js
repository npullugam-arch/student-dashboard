console.log("✅ admin login.js loaded");

const form = document.getElementById("form");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const errorEl = document.getElementById("error");
const loginBtn = document.getElementById("loginBtn");

function showError(msg) {
  errorEl.style.display = "block";
  errorEl.textContent = msg || "Login failed";
}

function clearError() {
  errorEl.style.display = "none";
  errorEl.textContent = "";
}

function setLoading(on) {
  loginBtn.disabled = on;
  loginBtn.textContent = on ? "Logging in..." : "Login";
}

async function login(username, password) {
  // 🔐 Backend auth check (NO popup because fetch)
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401) {
    throw new Error("Invalid admin credentials");
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Login failed (HTTP ${res.status})`);
  }

  // We do NOT trust backend response shape fully
  // We only use it as a validation step
  await res.text().catch(() => "");

  // ✅ Always create our own clean Basic token
  // NO "Basic " prefix, only base64
  const basicToken = btoa(`${username}:${password}`);

  // ✅ Force ADMIN role (this page is admin-only)
  const session = {
    username,
    role: "ADMIN",
    type: "ADMIN",
    basicToken,
    loginTime: new Date().toISOString(),
  };

  // ✅ Overwrite completely (prevents stale sessions)
  localStorage.setItem("smp_session", JSON.stringify(session));

  console.log("✅ Admin session stored", session);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const username = usernameEl.value.trim();
  const password = passwordEl.value;

  if (!username || !password) {
    return showError("Enter admin id and password");
  }

  try {
    setLoading(true);
    await login(username, password);

    // ✅ Hard redirect (clean load, iframe-safe)
    window.location.replace("/admin/admin-dashboard.html");
  } catch (err) {
    console.error("❌ Admin login failed:", err);
    showError(err?.message || "Login failed");
  } finally {
    setLoading(false);
  }
});