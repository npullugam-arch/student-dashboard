// ================================
// ✅ UPDATED FULL FILE: teacher-dashboard.js
// ✅ Only change (SAFE / Frontend-only):
// 0) Added tiny "offline safety" helper at top (does NOT disturb your existing logic)
// ✅ Everything else unchanged
// ================================

// ✅ OFFLINE SAFETY (extra safe when navigating dynamic pages too)
(function () {
  try {
    function remember() {
      if (navigator.onLine) {
        sessionStorage.setItem("last_online_url", location.pathname + location.search + location.hash);
      }
    }
    remember();
    window.addEventListener("online", remember);
    window.addEventListener("beforeunload", remember);
  } catch {}
})();

console.log("✅ teacher-dashboard.js loaded");

// ============================
// SESSION
// ============================
const session = JSON.parse(localStorage.getItem("smp_session") || "{}");

if (!session.username || !session.basicToken) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

const teacherId = session.username;
const basicToken = session.basicToken;

// ============================
// HELPERS
// ============================
function authHeaders() {
  return {
    Authorization: `Basic ${basicToken}`,
    "Content-Type": "application/json",
  };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: authHeaders() });

  if (res.status === 401) {
    localStorage.removeItem("smp_session");
    alert("Session expired. Please login again.");
    window.location.href = "/login/login.html";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }

  return res.json();
}

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    const msg = (text || "").toLowerCase();
    if (
      res.status === 409 ||
      msg.includes("already") ||
      msg.includes("locked") ||
      msg.includes("exists")
    ) {
      const err = new Error("Attendance is already taken for today ✅");
      err.code = "ALREADY_TAKEN";
      throw err;
    }
    throw new Error(text || `HTTP ${res.status}`);
  }

  return text;
}

function safe(v) {
  return v === null || v === undefined || v === "" ? "-" : v;
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function fmtDateTime(s) {
  if (!s) return "";
  return String(s).replace("T", " ").slice(0, 16);
}

function monthShort(m) {
  const arr = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  return arr[m] || "";
}

function toDayMonth(dateStr) {
  if (!dateStr) return { day: "-", mon: "-" };
  const parts = String(dateStr).split("-");
  if (parts.length < 3) return { day: "-", mon: "-" };
  const y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  if (!y || !m || !d) return { day: "-", mon: "-" };
  return { day: String(d).padStart(2, "0"), mon: monthShort(m - 1) };
}

// ✅ Nursery/LKG/UKG mapping (UI ONLY — backend unchanged)
function classLabel(std) {
  const n = Number(std);
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  if (Number.isFinite(n)) return String(n);
  return "-";
}

// ============================
// ✅ SCHOOL BRANDING (ONLY NEW ADDITION)
// ============================
async function loadSchoolBranding() {
  const nameEl = document.getElementById("brandSchoolName");
  const logoImg = document.getElementById("brandLogoImg");
  const logoFallback = document.getElementById("brandLogoFallback");

  try {
    const b = await fetchJson("/api/branding");

    const schoolName = (b?.schoolName || "").trim();
    const logoUrl = (b?.logoUrl || "").trim();

    // ✅ set name (single color)
    if (nameEl && schoolName) nameEl.textContent = schoolName;

    // ✅ set logo image (fallback to icon if missing/broken)
    if (logoImg) {
      if (!logoUrl) {
        logoImg.style.display = "none";
        if (logoFallback) logoFallback.style.display = "";
        return;
      }

      logoImg.onload = () => {
        logoImg.style.display = "block";
        if (logoFallback) logoFallback.style.display = "none";
      };

      logoImg.onerror = () => {
        logoImg.style.display = "none";
        if (logoFallback) logoFallback.style.display = "";
      };

      logoImg.src = logoUrl;
    }
  } catch (e) {
    // keep default EduConnect + icon if branding fails
    if (logoImg) logoImg.style.display = "none";
    if (logoFallback) logoFallback.style.display = "";
  }
}

// ============================
// UI ELEMENTS
// ============================
const sidebar = document.getElementById("sidebar");
const navItems = document.querySelectorAll(".nav-item[data-page]");
const logoutBtn = document.getElementById("logoutBtn");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");

const dashboardSection = document.getElementById("dashboardSection");
const dynamicSection = document.getElementById("dynamicSection");

const pageRoot = document.getElementById("pageRoot");
const helpPanel = document.getElementById("helpPanel");

const teacherFullNameEl = document.getElementById("teacherFullName");
const teacherRoleTextEl = document.getElementById("teacherRoleText");
const avatarBtn = document.getElementById("avatarBtn");
const avatarLetter = document.getElementById("avatarLetter");
const avatarImg = document.getElementById("avatarImg");

const greetingTitle = document.getElementById("greetingTitle");
const greetingSub = document.getElementById("greetingSub");

// ✅ notifications bell UI
const notifBtnTeacher = document.getElementById("notifBtnTeacher");
const notifDotTeacher = document.getElementById("notifDotTeacher");
const notifCountTeacher = document.getElementById("notifCountTeacher");

// ✅ dashboard containers
const holidayListTeacher = document.getElementById("holidayListTeacher");
const noticeListTeacher = document.getElementById("noticeListTeacher");

// ✅ schedule containers
const todayScheduleGrid = document.getElementById("todayScheduleGrid");
const currentDateEl = document.getElementById("currentDate");

// ============================
// TOP: DATE (for schedule)
// ============================
if (currentDateEl) {
  currentDateEl.textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ============================
// LOGOUT
// ============================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("smp_session");
    window.location.href = "/login/login.html";
  });
}

// ============================
// MOBILE SIDEBAR TOGGLE
// ============================
if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
}

document.addEventListener("click", (e) => {
  if (window.innerWidth <= 576) {
    if (
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !mobileMenuToggle.contains(e.target)
    ) {
      sidebar.classList.remove("active");
    }
  }
});

// ============================
// ✅ PROFILE HEADER + AVATAR PHOTO
// ============================
function setAvatar(fullName, photoUrl) {
  const letter = (fullName || "T").trim().charAt(0).toUpperCase() || "T";

  if (avatarLetter) avatarLetter.textContent = letter;

  const u = (photoUrl || "").trim();
  if (!u) {
    if (avatarImg) avatarImg.style.display = "none";
    if (avatarLetter) avatarLetter.style.display = "block";
    return;
  }

  if (avatarImg) {
    avatarImg.style.display = "block";
    avatarImg.src = u;
    avatarImg.onerror = () => {
      avatarImg.style.display = "none";
      if (avatarLetter) avatarLetter.style.display = "block";
    };
  }
  if (avatarLetter) avatarLetter.style.display = "none";
}

async function loadProfileHeader() {
  try {
    const t = await fetchJson(`/teacher/profile/${teacherId}`);

    const fullName = t.fullName || "Teacher";
    teacherFullNameEl.textContent = fullName;

    teacherRoleTextEl.textContent = t.subject
      ? `${t.subject} Teacher`
      : `ID: ${t.teacherId || teacherId}`;

    if (greetingTitle) greetingTitle.textContent = `Welcome, ${fullName}! 👋`;

    // ✅ subtitle small devices safe (keep it short)
    if (greetingSub) {
      greetingSub.textContent = "Here’s what’s happening with your classes today.";
    }

    // ✅ avatar image from backend profileUrl
    setAvatar(fullName, t.profileUrl);

    // ✅ store class/section from profile if present (frontend only)
    const standard = t.standard ?? t.classNumber ?? t.class ?? null;
    const section = t.section ?? null;
    if (standard !== null && standard !== undefined && String(standard).trim() !== "") {
      sessionStorage.setItem("classId", String(standard));
    }
    if (section !== null && section !== undefined && String(section).trim() !== "") {
      sessionStorage.setItem("section", String(section).trim().toUpperCase());
    }
  } catch (e) {
    teacherFullNameEl.textContent = "Teacher";
    teacherRoleTextEl.textContent = `ID: ${teacherId}`;
    setAvatar("Teacher", "");
    if (greetingTitle) greetingTitle.textContent = "Welcome 👋";
  }
}

// ✅ Avatar click -> open profile page
avatarBtn?.addEventListener("click", () => {
  loadPage("profile");
});

// ============================
// ✅ TODAY SCHEDULE (NEW ADDITION)
// Endpoint: GET /api/teacher/{teacherId}/timetable/today
// ============================
function isNowBetween(startHHmm, endHHmm) {
  try {
    const now = new Date();
    const [sh, sm] = String(startHHmm || "").split(":").map(Number);
    const [eh, em] = String(endHHmm || "").split(":").map(Number);
    if ([sh, sm, eh, em].some(n => Number.isNaN(n))) return false;

    const s = new Date(now); s.setHours(sh, sm, 0, 0);
    const e = new Date(now); e.setHours(eh, em, 0, 0);

    return now >= s && now <= e;
  } catch {
    return false;
  }
}

function renderScheduleCard(x) {
  const current = isNowBetween(x.startTime, x.endTime) ? "current" : "";
  const stdLabel = classLabel(x.standard); // ✅ UI ONLY mapping
  return `
    <div class="schedule-card ${current}">
      <div class="schedule-time">${escapeHtml(x.startTime)} - ${escapeHtml(x.endTime)}</div>
      <div class="schedule-class">Class ${escapeHtml(stdLabel)}-${escapeHtml(x.section)}</div>
      <div class="schedule-subject">${escapeHtml(x.subjectName || "Subject")}</div>
    </div>
  `;
}

async function loadTodaySchedule() {
  if (!todayScheduleGrid) return;

  todayScheduleGrid.innerHTML = `
    <div class="schedule-card">
      <div class="schedule-time">Loading…</div>
      <div class="schedule-class">—</div>
      <div class="schedule-subject">—</div>
    </div>
  `;

  try {
    const data = await fetchJson(`/api/teacher/${encodeURIComponent(teacherId)}/timetable/today`);
    const slots = Array.isArray(data?.slots) ? data.slots : [];

    if (!slots.length) {
      todayScheduleGrid.innerHTML = `
        <div class="schedule-card">
          <div class="schedule-time">No schedule</div>
          <div class="schedule-class">—</div>
          <div class="schedule-subject">You're free today ✅</div>
        </div>
      `;
      return;
    }

    todayScheduleGrid.innerHTML = slots.map(renderScheduleCard).join("");
  } catch (e) {
    todayScheduleGrid.innerHTML = `
      <div class="schedule-card">
        <div class="schedule-time">Failed to load</div>
        <div class="schedule-class">—</div>
        <div class="schedule-subject">${escapeHtml(e.message || "")}</div>
      </div>
    `;
  }
}

// ============================
// ✅ DASHBOARD: HOLIDAYS
// ============================
function renderHolidayItem(h) {
  const dates = h?.endDate ? `${h.startDate} → ${h.endDate}` : (h?.startDate || "");
  const { day, mon } = toDayMonth(h?.startDate);

  return `
    <div class="holiday-item">
      <div class="holiday-date">
        <div class="date-day">${escapeHtml(day)}</div>
        <div class="date-month">${escapeHtml(mon)}</div>
      </div>
      <div class="holiday-details">
        <div class="holiday-name">${escapeHtml(h?.name || "Holiday")}</div>
        <div class="holiday-type">${escapeHtml(h?.description || dates || "Upcoming")}</div>
      </div>
    </div>
  `;
}

async function loadDashboardHolidays() {
  if (!holidayListTeacher) return;

  holidayListTeacher.innerHTML = `
    <div class="holiday-item">
      <div class="holiday-details">
        <div class="holiday-name muted">Loading holidays...</div>
      </div>
    </div>
  `;

  try {
    const list = await fetchJson(`/holidays/upcoming?limit=5`);
    const items = Array.isArray(list) ? list : [];

    if (!items.length) {
      holidayListTeacher.innerHTML = `
        <div class="holiday-item">
          <div class="holiday-details">
            <div class="holiday-name">No upcoming holidays</div>
            <div class="holiday-type muted">—</div>
          </div>
        </div>
      `;
      return;
    }

    holidayListTeacher.innerHTML = items.map(renderHolidayItem).join("");
  } catch (e) {
    holidayListTeacher.innerHTML = `
      <div class="holiday-item">
        <div class="holiday-details">
          <div class="holiday-name">Failed to load holidays</div>
          <div class="holiday-type muted">${escapeHtml(e.message || "")}</div>
        </div>
      </div>
    `;
  }
}

// ============================
// ✅ DASHBOARD: NOTICES
// ============================
function renderNoticeItem(n) {
  const title = n?.title || "Notice";
  const msg = n?.message || n?.description || "";
  const when = fmtDateTime(n?.publishAt || n?.createdAt || n?.date);

  return `
    <div class="notice-item">
      <div class="notice-icon"><i class="fas fa-info-circle"></i></div>
      <div class="notice-content">
        <div class="notice-title">${escapeHtml(title)}</div>
        <div class="notice-desc">${escapeHtml(msg)}</div>
        <div class="notice-time">${escapeHtml(when || "")}</div>
      </div>
    </div>
  `;
}

async function loadDashboardNotices() {
  if (!noticeListTeacher) return;

  noticeListTeacher.innerHTML = `
    <div class="notice-item">
      <div class="notice-icon"><i class="fas fa-info-circle"></i></div>
      <div class="notice-content">
        <div class="notice-title">Loading…</div>
        <div class="notice-desc muted">Fetching latest notices</div>
        <div class="notice-time">...</div>
      </div>
    </div>
  `;

  try {
    const classId = sessionStorage.getItem("classId");
    const section = sessionStorage.getItem("section");

    const qs = new URLSearchParams();
    if (classId) qs.set("classId", String(classId));
    if (section) qs.set("section", String(section));
    qs.set("page", "0");
    qs.set("size", "5");

    const page = await fetchJson(`/notices/me?${qs.toString()}`);
    const list = Array.isArray(page?.content) ? page.content : [];

    if (!list.length) {
      noticeListTeacher.innerHTML = `
        <div class="notice-item">
          <div class="notice-icon"><i class="fas fa-info-circle"></i></div>
          <div class="notice-content">
            <div class="notice-title">No notices</div>
            <div class="notice-desc muted">You're all caught up ✅</div>
            <div class="notice-time"></div>
          </div>
        </div>
      `;
      return;
    }

    noticeListTeacher.innerHTML = list.map(renderNoticeItem).join("");
  } catch (e) {
    noticeListTeacher.innerHTML = `
      <div class="notice-item">
        <div class="notice-icon"><i class="fas fa-info-circle"></i></div>
        <div class="notice-content">
          <div class="notice-title">Failed to load notices</div>
          <div class="notice-desc muted">${escapeHtml(e.message || "")}</div>
          <div class="notice-time"></div>
        </div>
      </div>
    `;
  }
}

// ============================
// DYNAMIC PAGE LOADER
// ============================
const loadedCSS = new Set();
const loadedJS = new Set();

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};
window.TeacherPages.current = "dashboard";

function setActiveNav(page) {
  navItems.forEach((n) => n.classList.toggle("active", n.dataset.page === page));
}

function injectCSSOnce(href) {
  if (!href) return;
  if (loadedCSS.has(href)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  loadedCSS.add(href);
}

function injectJSOnce(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();
    if (loadedJS.has(src)) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.onload = () => {
      loadedJS.add(src);
      resolve();
    };
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(s);
  });
}

function showDashboardHome() {
  dashboardSection.classList.add("active");
  dashboardSection.style.display = "";
  dynamicSection.classList.remove("active");
  dynamicSection.style.display = "none";

  helpPanel.style.display = "none";
  pageRoot.innerHTML = "";

  loadTodaySchedule();      // ✅ NEW
  loadDashboardHolidays();
  loadDashboardNotices();
}

function showDynamicArea() {
  dashboardSection.classList.remove("active");
  dashboardSection.style.display = "none";
  dynamicSection.classList.add("active");
  dynamicSection.style.display = "";
}

async function loadPage(page, opts = {}) {
  window.TeacherPages.current = page;
  setActiveNav(page);

  if (window.innerWidth <= 576) sidebar.classList.remove("active");

  if (page === "dashboard") {
    showDashboardHome();
    return;
  }

  if (page === "help") {
    showDynamicArea();
    pageRoot.innerHTML = "";
    helpPanel.style.display = "block";
    return;
  }

  helpPanel.style.display = "none";
  showDynamicArea();

  const pageMap = {
    classes: {
      html: "teacher-my-classes.html",
      css: "teacher-my-classes.css",
      js: "teacher-my-classes.js",
      initKey: "classes",
    },

    students: {
      html: "teacher-students.html",
      css: "teacher-students.css",
      js: "teacher-students.js",
      initKey: "students",
    },

    attendance: {
      html: "teacher-attendance.html",
      css: "teacher-attendance.css",
      js: "teacher-attendance.js",
      initKey: "attendance",
    },

    profile: {
      html: "teacher-profile.html",
      css: "teacher-profile.css",
      js: "teacher-profile.js",
      initKey: "profile",
    },

    diary: {
      html: "teacher-diary.html",
      css: "teacher-diary.css",
      js: "teacher-diary.js",
      initKey: "diary",
    },

    notes: {
      html: "short-notes.html",
      css: "short-notes.css",
      js: "short-notes.js",
      initKey: "notes",
    },

    leave: {
      html: "teacher-leaves.html",
      css: "teacher-leaves.css",
      js: "teacher-leaves.js",
      initKey: "leave",
    },

    doubts: {
      html: "teacher-doubts.html",
      css: "teacher-doubts.css",
      js: "teacher-doubts.js",
      initKey: "doubts",
    },

    "doubt-clarification": {
      html: "teacher-doubts.html",
      css: "teacher-doubts.css",
      js: "teacher-doubts.js",
      initKey: "doubts",
    },

    notifications: {
      html: "teacher-notifications.html",
      css: "teacher-notifications.css",
      js: "teacher-notifications.js",
      initKey: "notifications",
    },

    "exam-timetable": {
      html: "teacher-exam-timetable.html",
      css: "teacher-exam-timetable.css",
      js: "teacher-exam-timetable.js",
      initKey: "exam_timetable",
    },

    results: {
      html: "teacher-exam-result.html",
      css: "teacher-exam-result.css",
      js: "teacher-exam-result.js",
      initKey: "results",
    },

    sheets: {
      html: "teacher-answer-sheets.html",
      css: "teacher-answer-sheets.css",
      js: "teacher-answer-sheets.js",
      initKey: "answer_sheets",
    },
  };

  if (!pageMap[page]) {
    pageRoot.innerHTML = `
      <div class="info-card-large">
        <div class="info-card-header">
          <h3><i class="fas fa-wand-magic-sparkles"></i> Coming Soon</h3>
        </div>
        <div style="padding:14px;">This page (${escapeHtml(page)}) will be connected next.</div>
      </div>
    `;
    return;
  }

  const cfg = pageMap[page];

  injectCSSOnce(cfg.css);

  pageRoot.innerHTML = `<div class="info-card-large" style="padding:14px;">Loading...</div>`;
  const res = await fetch(cfg.html, { cache: "no-store" });
  const html = await res.text();
  pageRoot.innerHTML = html;

  await injectJSOnce(cfg.js);

  const mod = window.TeacherPages?.modules?.[cfg.initKey];
  if (mod && typeof mod.init === "function") {
    mod.init({
      teacherId,
      fetchJson,
      postJson,
      safe,
      go: (p, o) => loadPage(p, o),
      opts,
      updateHeader: loadProfileHeader,
    });
  }
}

// ✅ expose go
window.TeacherPages.go = (p, o) => loadPage(p, o);

window.TeacherPages.refreshCurrent = () => {
  const cur = window.TeacherPages.current || "dashboard";
  loadPage(cur);
};

// ============================
// NAV CLICKS
// ============================
navItems.forEach((btn) => {
  btn.addEventListener("click", () => loadPage(btn.dataset.page));
});

// ✅ Bell click -> open notifications page
notifBtnTeacher?.addEventListener("click", (e) => {
  e.preventDefault();
  loadPage("notifications");
});

// ============================
// ✅ UNREAD COUNT on bell
// ============================
async function refreshUnreadBadge() {
  try {
    const count = await fetchJson(
      `/api/notifications/TEACHER/${encodeURIComponent(teacherId)}/unread-count`
    );
    const n = Number(count || 0);

    if (notifDotTeacher) notifDotTeacher.style.display = n > 0 ? "" : "none";
    if (notifCountTeacher) {
      notifCountTeacher.textContent = String(n);
      notifCountTeacher.style.display = n > 0 ? "" : "none";
    }
  } catch (e) {
    // ignore
  }
}

setInterval(refreshUnreadBadge, 15000);

// ============================
// INIT
// ============================
loadProfileHeader();
loadPage("dashboard");
refreshUnreadBadge();

loadDashboardHolidays();
loadDashboardNotices();

// ✅ ONLY NEW: load school logo + name from backend branding
loadSchoolBranding();

// ✅ ONLY NEW: today's schedule
loadTodaySchedule();