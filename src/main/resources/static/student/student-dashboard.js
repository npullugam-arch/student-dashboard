// ====== CONFIG ======
const API_BASE = ""; // same origin (Spring Boot serves this page)
const toast = document.getElementById("toast");

// Tabs
const navItems = document.querySelectorAll(".nav-item");
const tabs = {
  faculties: document.getElementById("tab-faculties"),
  attendance: document.getElementById("tab-attendance"),
  profile: document.getElementById("tab-profile"),
  help: document.getElementById("tab-help"),
};
const pageTitle = document.getElementById("pageTitle");
const pageDesc = document.getElementById("pageDesc");
const refreshBtn = document.getElementById("refreshBtn");

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");

// UI targets
const facGrid = document.getElementById("facGrid");
const facEmpty = document.getElementById("facEmpty");
const facCount = document.getElementById("facCount");

const attTbody = document.getElementById("attTbody");
const attEmpty = document.getElementById("attEmpty");
const attCount = document.getElementById("attCount");
const subjectFilter = document.getElementById("subjectFilter");

const studentChip = document.getElementById("studentChip");
const studentName = document.getElementById("studentName");
const classMeta = document.getElementById("classMeta");

const pStudentId = document.getElementById("pStudentId");
const pClass = document.getElementById("pClass");
const pSection = document.getElementById("pSection");
const pEmail = document.getElementById("pEmail");
const pParentPhone = document.getElementById("pParentPhone");
const pStatus = document.getElementById("pStatus");

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("auth_username");
  sessionStorage.removeItem("auth_password");
  sessionStorage.removeItem("auth_role");
  sessionStorage.removeItem("studentId");
  window.location.href = "/login/login.html";
});

// ====== DEMO AUTH (Basic Auth) ======
// We store credentials in sessionStorage for DEMO only.
// Later we can move to session/JWT.
function getAuth() {
  const username = sessionStorage.getItem("auth_username");
  const password = sessionStorage.getItem("auth_password");
  const role = sessionStorage.getItem("auth_role");
  const studentId = sessionStorage.getItem("studentId") || username;

  if (!username || !password) {
    showToast("Please login first!");
    window.location.href = "/login/login.html";
    return null;
  }

  return { username, password, role, studentId };
}

function makeAuthHeader(username, password) {
  const token = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${token}` };
}

async function apiGet(path, auth) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      ...makeAuthHeader(auth.username, auth.password),
    },
  });

  if (res.status === 401) {
    showToast("Unauthorized. Please login again.");
    window.location.href = "/login/login.html";
    return null;
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ====== UI ======
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
}

function setTab(tabKey) {
  Object.values(tabs).forEach((t) => t.classList.remove("show"));
  tabs[tabKey].classList.add("show");

  navItems.forEach((btn) => btn.classList.remove("active"));
  document.querySelector(`.nav-item[data-tab="${tabKey}"]`).classList.add("active");

  const map = {
    faculties: ["My Faculties", "Your teachers for your class & section."],
    attendance: ["Attendance", "Your attendance updates, latest first."],
    profile: ["Profile", "Your details (we’ll connect profile API next)."],
    help: ["Help", "Quick tips & support."],
  };

  pageTitle.textContent = map[tabKey][0];
  pageDesc.textContent = map[tabKey][1];

  // close sidebar on mobile
  sidebar.classList.remove("open");
}

navItems.forEach((btn) => {
    
  btn.addEventListener("click", () => setTab(btn.dataset.tab));
});

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

// ====== DATA RENDER ======
function renderFaculties(list) {
  facGrid.innerHTML = "";
  facCount.textContent = String(list.length);

  if (!list.length) {
    facEmpty.style.display = "block";
    return;
  }
  facEmpty.style.display = "none";

  list.forEach((f, idx) => {
    const card = document.createElement("div");
    card.className = "fac-card";
    card.style.animation = `pop .22s ease ${idx * 0.03}s both`;

    card.innerHTML = `
      <div class="fac-top">
        <div class="badge">${f.subject}</div>
        <div class="badge">⭐</div>
      </div>

      <div class="fac-name">${escapeHtml(f.teacherName)}</div>

      <div class="fac-meta">
        <div><b>ID:</b> ${escapeHtml(f.teacherId)}</div>
        <div><b>Mobile:</b> ${escapeHtml(f.teacherMobile || "-")}</div>
        <div><b>Email:</b> ${escapeHtml(f.teacherEmail || "-")}</div>
      </div>

      <div class="fac-actions">
        <button class="smallbtn" data-action="copy" data-text="${escapeAttr(f.teacherMobile || "")}">
          Copy Mobile 📞
        </button>
        <button class="smallbtn" data-action="mail" data-text="${escapeAttr(f.teacherEmail || "")}">
          Email ✉️
        </button>
      </div>
    `;

    card.addEventListener("click", (e) => {
      const action = e.target?.dataset?.action;
      const text = e.target?.dataset?.text || "";
      if (!action) return;

      if (action === "copy") {
        if (!text) return showToast("No mobile number available");
        navigator.clipboard.writeText(text);
        showToast("Copied!");
      }

      if (action === "mail") {
        if (!text) return showToast("No email available");
        window.location.href = `mailto:${text}`;
      }
    });

    facGrid.appendChild(card);
  });
}

function renderAttendance(rows) {
  attTbody.innerHTML = "";
  attCount.textContent = String(rows.length);

  if (!rows.length) {
    attEmpty.style.display = "block";
    return;
  }
  attEmpty.style.display = "none";

  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const cls = r.present ? "present" : "absent";
    const label = r.present ? "Present ✅" : "Absent ❌";
    tr.innerHTML = `
      <td>${escapeHtml(r.date)}</td>
      <td>${escapeHtml(r.subject)}</td>
      <td><span class="status ${cls}">${label}</span></td>
      <td>${escapeHtml(r.teacherId || "-")}</td>
    `;
    attTbody.appendChild(tr);
  });
}

function fillSubjectFilter(rows) {
  const subjects = Array.from(new Set(rows.map((r) => r.subject))).sort();
  subjectFilter.innerHTML = `<option value="">All Subjects</option>` + subjects
    .map((s) => `<option value="${escapeAttr(s)}">${escapeHtml(s)}</option>`)
    .join("");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(str) {
  return escapeHtml(str).replaceAll("`", "");
}

// tiny pop animation injection
const style = document.createElement("style");
style.textContent = `
@keyframes pop { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;
document.head.appendChild(style);

// ====== LOAD DATA ======
let allAttendance = [];

async function loadDashboard() {
  const auth = getAuth();
  if (!auth) return;

  // Header chips
  studentChip.textContent = `ID: ${auth.studentId}`;
  studentName.textContent = auth.studentId; // real name comes from profile API later
  classMeta.textContent = "Class: (Profile API next)";

  // Profile placeholders
  pStudentId.textContent = auth.studentId;
  pClass.textContent = "—";
  pSection.textContent = "—";
  pEmail.textContent = "—";
  pParentPhone.textContent = "—";
  pStatus.textContent = "ACTIVE";

  try {
    showToast("Loading your dashboard…");

    // Faculties
    const faculties = await apiGet(`/student/dashboard/${auth.studentId}/faculties`, auth);
    if (faculties) renderFaculties(faculties);

    // Attendance
    const attendance = await apiGet(`/student/attendance/${auth.studentId}`, auth);
    allAttendance = attendance || [];
    renderAttendance(allAttendance);
    fillSubjectFilter(allAttendance);

    showToast("Ready ✨");
  } catch (e) {
    console.error(e);
    showToast("Something went wrong. Check console.");
  }
}

subjectFilter.addEventListener("change", () => {
  const val = subjectFilter.value;
  if (!val) return renderAttendance(allAttendance);
  renderAttendance(allAttendance.filter((r) => r.subject === val));
});

refreshBtn.addEventListener("click", loadDashboard);

// Start
setTab("faculties");
loadDashboard();
