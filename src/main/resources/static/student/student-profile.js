console.log("✅ Student Profile JS Loaded");

// session values
const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

const el = (id) => document.getElementById(id);

function showError(msg) {
  const box = el("errBox");
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("hidden");
}

function hideError() {
  const box = el("errBox");
  if (!box) return;
  box.classList.add("hidden");
  box.textContent = "";
}

// ✅ Convert -2/-1/0 to Nursery/LKG/UKG for display
function formatStandardLabel(std) {
  const n = Number(std);
  if (Number.isNaN(n)) return "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return `Class ${n}`;
}

// safe set text
function setText(id, value, fallback = "—") {
  const node = el(id);
  if (!node) return;
  node.textContent = (value === null || value === undefined || value === "") ? fallback : value;
}

// avatar fallback
function setAvatarFromName(fullName) {
  const name = (fullName || "Student").trim().replace(/\s+/g, "+");
  const url = `https://ui-avatars.com/api/?name=${name}&size=150&background=667eea&color=fff&bold=true`;
  const pic = el("profilePic");
  if (pic) pic.src = url;
}

function basicToken(u, p) {
  return btoa(`${u}:${p}`);
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "cp-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* =========================
   ✅ Change Password UI
========================= */
function cpShowErr(msg) {
  const box = el("cpErr");
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("cp-hidden");
}
function cpHideErr() {
  const box = el("cpErr");
  if (!box) return;
  box.textContent = "";
  box.classList.add("cp-hidden");
}
function openCpModal() {
  cpHideErr();
  el("cpNew").value = "";
  el("cpConfirm").value = "";
  el("cpBackdrop").classList.remove("cp-hidden");
  el("cpBackdrop").setAttribute("aria-hidden", "false");
  setTimeout(() => el("cpNew")?.focus(), 50);
}
function closeCpModal() {
  el("cpBackdrop").classList.add("cp-hidden");
  el("cpBackdrop").setAttribute("aria-hidden", "true");
  cpHideErr();
}

function hideChangePasswordButton() {
  const btn = el("btnChangePwd");
  if (btn) btn.style.display = "none";
}
function showChangePasswordButton() {
  const btn = el("btnChangePwd");
  if (btn) btn.style.display = "";
}

/* =========================
   ✅ Backend calls for password
========================= */
async function loadPasswordStatus() {
  // button should be visible only if backend says canChangePassword=true
  try {
    const token = basicToken(username, sessionStorage.getItem("auth_password"));

    const res = await fetch(`/student/api/password/status`, {
      headers: { Authorization: `Basic ${token}` }
    });

    if (!res.ok) {
      // if status fails, better hide button to avoid confusion
      hideChangePasswordButton();
      return;
    }

    const data = await res.json(); // { canChangePassword: true/false }

    if (data && data.canChangePassword) {
      showChangePasswordButton();
    } else {
      hideChangePasswordButton();
    }
  } catch (e) {
    console.error(e);
    hideChangePasswordButton();
  }
}

async function updatePasswordOnce() {
  try {
    cpHideErr();

    const newPwd = (el("cpNew").value || "").trim();
    const confirmPwd = (el("cpConfirm").value || "").trim();

    if (!newPwd || !confirmPwd) {
      cpShowErr("Please enter password in both fields.");
      return;
    }
    if (newPwd !== confirmPwd) {
      cpShowErr("Passwords do not match.");
      return;
    }
    if (newPwd.length < 6) {
      cpShowErr("Password must be at least 6 characters.");
      return;
    }

    const currentPwd = sessionStorage.getItem("auth_password");
    const token = basicToken(username, currentPwd);

    const res = await fetch(`/student/api/password/change-once`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${token}`
      },
      body: JSON.stringify({ newPassword: newPwd, confirmPassword: confirmPwd })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      // backend returns RuntimeException message
      cpShowErr(txt ? txt.replace(/["{}]/g, "") : `Unable to update password (HTTP ${res.status})`);
      return;
    }

    // ✅ IMPORTANT: update stored password in sessionStorage
    sessionStorage.setItem("auth_password", newPwd);

    // ✅ hide button forever (UI)
    hideChangePasswordButton();
    closeCpModal();
    toast("✅ Password updated successfully!");

  } catch (err) {
    console.error(err);
    cpShowErr("Something went wrong while updating password.");
  }
}

/* =========================
   ✅ Profile loader (existing)
========================= */
async function loadProfile() {
  try {
    hideError();

    if (!studentId || !username || !password) {
      alert("Session expired. Please login again.");
      window.location.href = "/login/login.html";
      return;
    }

    const token = basicToken(username, password);

    const res = await fetch(`/student/profile/${studentId}`, {
      headers: { Authorization: `Basic ${token}` }
    });

    if (!res.ok) {
      showError(`Unable to load profile (HTTP ${res.status})`);
      return;
    }

    const data = await res.json();

    // ===== TOP CARD =====
    setText("studentName", data.fullName || "Student");

    const stdLabel = formatStandardLabel(data.standard);
    setText("studentClass", `${stdLabel} - ${data.section}`);

    // profile image
    if (data.profileUrl) {
      el("profilePic").src = data.profileUrl;
    } else {
      setAvatarFromName(data.fullName);
    }

    // ===== PERSONAL =====
    setText("studentId", data.studentId);
    setText("dob", data.dateOfBirth);
    setText("gender", data.gender);
    setText("caste", data.caste);
    setText("religion", data.religion);

    // ===== ACADEMIC =====
    setText("standard", formatStandardLabel(data.standard).replace("Class ", ""));
    setText("section", data.section);
    setText("academicYear", data.academicYear);

    // ===== CONTACT =====
    setText("phone", data.phoneNumber);
    setText("parentPhone", data.parentPhoneNumber);
    setText("studentEmail", data.studentEmailId);
    setText("parentEmail", data.parentEmailId);

    // activity time
    const t = new Date();
    const hh = t.getHours().toString().padStart(2, "0");
    const mm = t.getMinutes().toString().padStart(2, "0");
    const feedTime = el("feedTime");
    if (feedTime) feedTime.textContent = `${hh}:${mm}`;

  } catch (err) {
    console.error(err);
    showError("Something went wrong while loading profile.");
  }
}

// confetti easter egg (kept)
let clickCount = 0;
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "profilePic") {
    clickCount++;
    if (clickCount === 5) {
      createConfetti();
      clickCount = 0;
    }
  }
});

function createConfetti() {
  const colors = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#ffd700", "#ff6b6b"];
  for (let i = 0; i < 40; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "8px";
    confetti.style.height = "8px";
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = "-10px";
    confetti.style.borderRadius = "50%";
    confetti.style.zIndex = "9999";
    confetti.style.pointerEvents = "none";
    document.body.appendChild(confetti);

    confetti.animate(
      [
        { transform: "translateY(0) rotate(0deg)", opacity: 1 },
        { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ],
      { duration: 1800 + Math.random() * 1000, easing: "ease-out" }
    ).onfinish = () => confetti.remove();
  }
}

// print shortcut
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "p") {
    e.preventDefault();
    window.print();
  }
});

/* =========================
   ✅ Hook up modal events
========================= */
document.addEventListener("DOMContentLoaded", () => {
  // button click
  const btn = el("btnChangePwd");
  if (btn) {
    btn.addEventListener("click", openCpModal);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openCpModal();
    });
  }

  // modal actions
  el("cpClose")?.addEventListener("click", closeCpModal);
  el("cpCancel")?.addEventListener("click", closeCpModal);
  el("cpUpdate")?.addEventListener("click", updatePasswordOnce);

  // click outside closes modal
  el("cpBackdrop")?.addEventListener("click", (e) => {
    if (e.target && e.target.id === "cpBackdrop") closeCpModal();
  });

  // hide initially until status loads
  hideChangePasswordButton();

  // load profile + password status
  loadProfile();
  loadPasswordStatus();
});