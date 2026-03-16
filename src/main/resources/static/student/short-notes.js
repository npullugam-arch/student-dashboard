console.log("✅ short-notes.js loaded (Dynamic Subject Filters from Courses)");

// ==============================
// Session (backend rule same)
// ==============================
function getSession() {
  try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
  catch { return {}; }
}

const session = getSession();
const studentId = session.username;

if (!studentId) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

// ==============================
// Elements (UI rule same)
// ==============================
const searchInput = document.getElementById("searchInput");
const notesGrid = document.getElementById("notesGrid");
const emptyState = document.getElementById("emptyState");
const refreshBtn = document.getElementById("refreshBtn");

// ✅ dynamic filter container (HTML must have this id)
const filterButtonsWrap = document.getElementById("filterButtons");

// ==============================
// Helpers
// ==============================
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function normalizeSubject(s) {
  const x = String(s || "").trim();
  return x || "—";
}

function headerClassForSubject(subj) {
  const s = String(subj || "").toLowerCase();
  if (s.includes("math")) return "math-header";
  if (s.includes("sci")) return "science-header";
  if (s.includes("eng")) return "english-header";
  if (s.includes("social")) return "social-header";
  if (s.includes("comp")) return "computer-header";
  return "math-header";
}

function iconForSubject(subj) {
  const s = String(subj || "").toLowerCase();
  if (s.includes("math")) return "fa-calculator";
  if (s.includes("sci")) return "fa-flask";
  if (s.includes("eng")) return "fa-book-reader";
  if (s.includes("social")) return "fa-globe";
  if (s.includes("comp")) return "fa-laptop-code";
  return "fa-book";
}

function formatDateMaybe(isoOrText) {
  if (!isoOrText) return "—";
  const t = Date.parse(isoOrText);
  if (!Number.isFinite(t)) return String(isoOrText);
  return new Date(t).toLocaleString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function fileNameFromUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    const p = u.pathname.split("/").filter(Boolean);
    return p[p.length - 1] || "note.pdf";
  } catch {
    const parts = String(url || "").split("/").filter(Boolean);
    return parts[parts.length - 1] || "note.pdf";
  }
}

function formatSizeMaybe(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return "";
  const mb = num / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = num / 1024;
  return `${kb.toFixed(0)} KB`;
}

// ==============================
// Notification (same UI js)
// ==============================
function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle"
  };
  return icons[type] || "info-circle";
}

function getNotificationColor(type) {
  const colors = {
    success: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    error: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    warning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    info: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  };
  return colors[type] || colors.info;
}

function ensureNotificationKeyframes() {
  if (document.querySelector("#notificationStyles")) return;
  const style = document.createElement("style");
  style.id = "notificationStyles";
  style.textContent = `
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(100px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
      from { opacity: 1; transform: translateX(0); }
      to   { opacity: 0; transform: translateX(100px); }
    }
  `;
  document.head.appendChild(style);
}

function showNotification(message, type = "info") {
  const existing = document.querySelector(".notification");
  if (existing) existing.remove();

  ensureNotificationKeyframes();

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas fa-${getNotificationIcon(type)}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: getNotificationColor(type),
    color: "white",
    padding: "15px 25px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "15px",
    fontWeight: "500",
    zIndex: "10000",
    animation: "slideInRight 0.4s ease-out",
    maxWidth: "400px",
    fontFamily: "'Poppins', sans-serif"
  });

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.4s ease-out";
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ==============================
// Backend data + subject mapping
// ==============================
let allNotes = [];
let currentSubject = "all";

const teacherSubjectMap = Object.create(null);

// NEW badge logic
const LAST_SEEN_KEY = `smp_notes_last_seen_${studentId}`;
function getLastSeen() {
  const v = localStorage.getItem(LAST_SEEN_KEY);
  return v ? Number(v) : 0;
}
function setLastSeenNow() {
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

// ==============================
// Load faculties => teacherId -> subject map (same as before)
// ==============================
async function loadTeacherSubjects() {
  const urlsToTry = [
    `/student/dashboard/${encodeURIComponent(studentId)}/faculties`,
    `/student/api/dashboard/${encodeURIComponent(studentId)}/faculties`,
    `/student/dashboard/${encodeURIComponent(studentId)}/teachers`,
    `/student/api/teachers/${encodeURIComponent(studentId)}`
  ];

  for (const url of urlsToTry) {
    try {
      const data = await fetchJson(url);
      const list = Array.isArray(data) ? data : (data?.faculties || data?.teachers || []);
      if (!Array.isArray(list) || !list.length) continue;

      list.forEach(f => {
        const tid = f.teacherId ?? f.teacher_id ?? f.id ?? f.username;
        const subj = f.subject ?? f.subjectName ?? f.subject_name ?? f.course ?? f.courseName;
        if (tid && subj) teacherSubjectMap[String(tid)] = normalizeSubject(String(subj));
      });
      return;
    } catch (e) {
      // try next
    }
  }
}

function getSubject(n) {
  return normalizeSubject(
    n.subject ??
    n.subjectName ??
    n.teacherSubject ??
    n.sub ??
    n.course ??
    n.courseName ??
    n.subject_title ??
    teacherSubjectMap[String(n.teacherId || "")] ??
    "—"
  );
}

// ==============================
// ✅ CRITICAL FIX: Load ALL subjects from "My Courses" backend
// ==============================
async function loadSubjectsFromCoursesBackend() {
  // This endpoint is from your student-courses.js
  const url = `/student/${encodeURIComponent(studentId)}/courses`;

  // Try without auth first (some backends allow it)
  try {
    const data = await fetchJson(url);
    if (Array.isArray(data)) return data;
  } catch (e) {
    // continue to auth try
  }

  // Try with sessionStorage auth (same pattern as student-courses.js)
  const sid = sessionStorage.getItem("studentId");
  const username = sessionStorage.getItem("auth_username");
  const password = sessionStorage.getItem("auth_password");

  if (sid && username && password) {
    const token = btoa(`${username}:${password}`);
    try {
      const data = await fetchJson(`/student/${encodeURIComponent(sid)}/courses`, {
        headers: { Authorization: `Basic ${token}` }
      });
      if (Array.isArray(data)) return data;
    } catch (e) {
      // ignore, fallback later
    }
  }

  return []; // fallback
}

// ==============================
// ✅ Dynamic Filter Buttons (NO icons, NO missing subjects)
// ==============================
async function buildFilterButtonsDynamic() {
  // 1) best source: courses backend => subjectName list (all class subjects)
  const courses = await loadSubjectsFromCoursesBackend();

  const set = new Set();

  // from courses => subjectName (this should give all 6 subjects)
  if (Array.isArray(courses) && courses.length) {
    courses.forEach(c => {
      const s = normalizeSubject(c.subjectName ?? c.subject ?? c.courseName ?? c.course);
      if (s && s !== "—") set.add(s);
    });
  }

  // 2) fallback add teacherSubjectMap
  Object.values(teacherSubjectMap).forEach(s => {
    const sub = normalizeSubject(s);
    if (sub && sub !== "—") set.add(sub);
  });

  // 3) fallback add subjects from notes
  allNotes.forEach(n => {
    const sub = getSubject(n);
    if (sub && sub !== "—") set.add(sub);
  });

  const subjects = Array.from(set).sort((a, b) => a.localeCompare(b));

  // Build buttons (NO icons ✅)
  filterButtonsWrap.innerHTML = `
    <button class="filter-btn active" data-subject="all">All Subjects</button>
    ${subjects.map(s => `<button class="filter-btn" data-subject="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
  `;

  // bind click events
  const btns = filterButtonsWrap.querySelectorAll(".filter-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentSubject = btn.getAttribute("data-subject");
      currentSubject = currentSubject === "all" ? "all" : normalizeSubject(currentSubject);

      render();

      btn.style.transform = "scale(0.95)";
      setTimeout(() => (btn.style.transform = ""), 120);
    });
  });
}

// ==============================
// Render UI cards (same UI structure)
// ==============================
function buildCard(note) {
  const subject = getSubject(note);
  const headerCls = headerClassForSubject(subject);
  const iconCls = iconForSubject(subject);

  const title = escapeHtml(note.title || "Untitled Note");
  const topic = escapeHtml(note.topic || "—");
  const teacher = escapeHtml(note.teacherId || "—");
  const uploaded = escapeHtml(formatDateMaybe(note.createdAt || "—"));

  const fileUrl = note.fileUrl || note.url || note.downloadUrl || "";
  const safeFileUrl = escapeHtml(fileUrl);
  const filename = escapeHtml(note.fileName || fileNameFromUrl(fileUrl) || "note.pdf");

  const sizeLabel = formatSizeMaybe(note.fileSize || note.sizeBytes || note.size);
  const formatLabel = `PDF Document${sizeLabel ? " (" + sizeLabel + ")" : ""}`;

  const lastSeen = getLastSeen();
  const ts = Date.parse(note.createdAt || "") || 0;
  const isNew = ts && ts > lastSeen;

  return `
    <div class="note-card" data-subject="${escapeHtml(subject)}">
      <div class="card-header ${headerCls}">
        <div class="subject-badge">
          <i class="fas ${iconCls}"></i>
          <span>${escapeHtml(subject)}</span>
        </div>
        ${isNew ? `<span class="new-badge">NEW</span>` : ``}
      </div>

      <div class="card-body">
        <h3 class="note-title">${title}</h3>

        <div class="note-details">
          <div class="detail-item">
            <i class="fas fa-bookmark"></i>
            <span><strong>Topic:</strong> ${topic}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-chalkboard-teacher"></i>
            <span><strong>Teacher:</strong> ${teacher}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span><strong>Date:</strong> ${uploaded}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-file-pdf"></i>
            <span><strong>Format:</strong> ${escapeHtml(formatLabel)}</span>
          </div>
        </div>

        <div class="note-description">
          <p>✨ ${escapeHtml(note.description || "Short note uploaded by your teacher for quick revision.")}</p>
        </div>
      </div>

      <div class="card-footer">
        <button class="btn-primary" type="button" onclick="downloadNote('${safeFileUrl}', '${filename}')">
          <i class="fas fa-download"></i> Download
        </button>
        <button class="btn-secondary" type="button" onclick="viewNote('${safeFileUrl}')">
          <i class="fas fa-eye"></i> View
        </button>
      </div>
    </div>
  `;
}

function render() {
  const term = (searchInput.value || "").trim().toLowerCase();

  const filtered = allNotes.filter(n => {
    const subject = getSubject(n);
    const matchesSubject = (currentSubject === "all") || (subject === currentSubject);

    const blob = `${subject} ${n.title || ""} ${n.topic || ""} ${n.teacherId || ""}`.toLowerCase();
    const matchesSearch = !term || blob.includes(term);

    return matchesSubject && matchesSearch;
  });

  if (!filtered.length) {
    notesGrid.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector("h3").textContent = "No notes found";
    return;
  }

  emptyState.style.display = "none";
  notesGrid.style.display = "grid";
  notesGrid.innerHTML = filtered.map(buildCard).join("");
}

// ==============================
// Load notes (backend same)
// ==============================
async function loadNotes() {
  notesGrid.innerHTML = `
    <div class="note-card">
      <div class="card-body">
        <h3 class="note-title">Loading...</h3>
        <div class="note-description"><p>Please wait</p></div>
      </div>
    </div>
  `;
  notesGrid.style.display = "grid";
  emptyState.style.display = "none";

  try {
    // load mapping first (optional)
    await loadTeacherSubjects().catch(() => {});

    // load notes
    const res = await fetch(`/student/api/notes/my/${encodeURIComponent(studentId)}`);
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || `HTTP ${res.status}`);
    }

    const notes = await res.json();
    allNotes = Array.isArray(notes) ? notes : [];

    // ✅ build subjects from courses backend (fix)
    await buildFilterButtonsDynamic();

    // NEW badge check
    const lastSeen = getLastSeen();
    const hasNew = allNotes.some(n => {
      const ts = Date.parse(n.createdAt || "") || 0;
      return ts && ts > lastSeen;
    });

    render();
    setLastSeenNow();

    showNotification(hasNew ? "New notes found! ✅" : "Notes loaded successfully! 🎉", "success");

  } catch (e) {
    console.error("❌ loadNotes error:", e);
    allNotes = [];

    notesGrid.style.display = "none";
    emptyState.style.display = "block";
    emptyState.querySelector("h3").textContent = "Unable to load notes";
    emptyState.querySelector("p").textContent = e.message || "Server error";

    // fallback filters
    if (filterButtonsWrap) {
      filterButtonsWrap.innerHTML = `<button class="filter-btn active" data-subject="all">All Subjects</button>`;
    }

    showNotification("Unable to load notes ❌", "error");
  }
}

// ==============================
// Actions: view / download
// ==============================
window.viewNote = function (fileUrl) {
  if (!fileUrl) return showNotification("File URL not found.", "warning");
  showNotification("Opening note... 👀", "info");
  window.open(fileUrl, "_blank", "noopener,noreferrer");
};

window.downloadNote = function (fileUrl, filename) {
  if (!fileUrl) return showNotification("File URL not found.", "warning");
  showNotification("Downloading... 📥", "info");

  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename || "note.pdf";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// ==============================
// Search (debounced)
// ==============================
function debounce(fn, wait) {
  let t;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, wait);
  };
}
const debouncedSearch = debounce(() => render(), 250);
searchInput.addEventListener("input", debouncedSearch);

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === "Escape" && document.activeElement === searchInput) {
    searchInput.value = "";
    searchInput.blur();
    render();
  }
});

// ==============================
// Refresh button
// ==============================
refreshBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentSubject = "all";
  loadNotes();
});

// ==============================
// Init
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => showNotification("Welcome to Short Notes! 🎓", "success"), 500);
  loadNotes();
});
