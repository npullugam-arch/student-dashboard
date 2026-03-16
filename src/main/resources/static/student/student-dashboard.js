// ================================
// ✅ UPDATED FULL FILE: student-dashboard.js
// ✅ Only change (SAFE / Frontend-only):
// 0) Added tiny "offline safety" helper at top (does NOT disturb your existing logic)
// ✅ Your existing code untouched otherwise
// ================================

// ✅ OFFLINE SAFETY (extra safe for iframe pages too)
(function () {
  try {
    // save last page continuously when online
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

// ===================================
// CONFIG (Backend + Pages)
// ===================================
const API_BASE = ""; // same origin
const EMBED_PAGES = {
  profile: "/student/student-profile.html",
  courses: "/student/student-courses.html",
  attendance: "/student/student-attendance.html",
  doubts: "/student/student-doubts.html",
  shortNotes: "/student/short-notes.html",
  leave: "/student/leave.html",
  notifications: "/student/notifications.html",
  timetable: "/student/student-timetable.html",

  examTimetable: "/student/student-exam-timetable.html",
  examResults: "/student/student-exam-result.html",
  answerSheets: "/student/student-answer-sheets.html",

  // ✅ Hall Ticket page to load in right-side iframe
  hallTicket: "/student/student-hallticket.html",

  quiz: "/student/quiz.html",
  faqs: "/student/faq.html",

  feeOverview: "/student/student-fee.html",
  feeTransactions: "/student/student-fee-transactions.html",
};

// ===================================
// DEMO AUTH (Basic Auth) - unchanged
// ===================================
function getAuth() {
  const username = sessionStorage.getItem("auth_username");
  const password = sessionStorage.getItem("auth_password");
  const role = sessionStorage.getItem("auth_role");
  const studentId = sessionStorage.getItem("studentId") || username;

  if (!username || !password) {
    alert("Please login first!");
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
    headers: { ...makeAuthHeader(auth.username, auth.password) },
  });

  if (res.status === 401) {
    alert("Unauthorized. Please login again.");
    window.location.href = "/login/login.html";
    return null;
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ===================================
// DOM Elements
// ===================================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarClose = document.getElementById("sidebarClose");
const mobileOverlay = document.getElementById("mobileOverlay");
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

const headerProfileBtn = document.getElementById("headerProfileBtn");
const contentArea = document.getElementById("contentArea");
const topHeader = document.querySelector(".top-header");

const profileFrame = document.getElementById("profileFrame");
const coursesFrame = document.getElementById("coursesFrame");
const attendanceFrame = document.getElementById("attendanceFrame");
const doubtsFrame = document.getElementById("doubtsFrame");
const shortNotesFrame = document.getElementById("shortNotesFrame");
const leaveFrame = document.getElementById("leaveFrame");
const notificationsFrame = document.getElementById("notificationsFrame");
const timetableFrame = document.getElementById("timetableFrame");

const examTimetableFrame = document.getElementById("examTimetableFrame");
const examResultsFrame = document.getElementById("examResultsFrame");
const answerSheetsFrame = document.getElementById("answerSheetsFrame");

const quizFrame = document.getElementById("quizFrame");
const faqsFrame = document.getElementById("faqsFrame");

const feeOverviewFrame = document.getElementById("feeOverviewFrame");
const feeTransactionsFrame = document.getElementById("feeTransactionsFrame");

// ✅ Hall Ticket iframe ref
const hallTicketFrame = document.getElementById("hallTicketFrame");

const notifBtnStudent = document.getElementById("notifBtnStudent");
const notifCountStudent = document.getElementById("notifCountStudent");

const sidebarStudentName = document.getElementById("sidebarStudentName");
const sidebarClassSection = document.getElementById("sidebarClassSection");
const sidebarAvatar = document.getElementById("sidebarAvatar");  // ✅ MUST be student photo
const headerAvatar = document.getElementById("headerAvatar");    // ✅ MUST be student photo (top right)

const welcomeTitle = document.getElementById("welcomeTitle");

// ✅ School branding elements (top-left brand area)
const schoolNameTextEl = document.getElementById("schoolNameText");
const schoolLogoIconEl = document.getElementById("schoolLogoIcon");

// ===================================
// ✅ STANDARD LABEL FIX (Nursery/LKG/UKG)
// ===================================
function formatStandardLabel(std) {
  const n = Number(std);
  if (Number.isNaN(n)) return "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return String(n);
}

function hasValue(v) {
  return v !== null && v !== undefined && String(v).trim() !== "";
}

// ===================================
// FIX HELPERS
// ===================================
function forceOverlayOff() {
  if (!mobileOverlay) return;
  mobileOverlay.classList.remove("active");
  mobileOverlay.style.pointerEvents = "none";
  mobileOverlay.style.opacity = "0";
  document.body.style.overflow = "";
}

function closeSidebar() {
  sidebar?.classList?.remove("active");
  mobileOverlay?.classList?.remove("active");
  document.body.style.overflow = "";
  forceOverlayOff();
}

// ===================================
// ✅ iframe mode + full height sizing
// ===================================
const IFRAME_PAGES = new Set([
  "attendance",
  "courses",
  "profile",
  "doubt-clarification",
  "short-notes",
  "leave-application",
  "notifications",
  "timetable",
  "exam-timetable",
  "exam-results",
  "answer-sheets",
  "hall-ticket",
  "quiz",
  "faqs",
  "fee-overview",
  "transaction-history",
]);

function setIframeMode(on) {
  document.body.classList.toggle("iframe-mode", !!on);
}

function setAllIframeHeights() {
  const headerH = topHeader ? topHeader.offsetHeight : 72;
  document.documentElement.style.setProperty("--topbar-h", `${headerH}px`);

  const h = Math.max(300, (window.innerHeight || 800) - headerH);

  const frames = [
    coursesFrame,
    profileFrame,
    attendanceFrame,
    doubtsFrame,
    shortNotesFrame,
    leaveFrame,
    notificationsFrame,
    timetableFrame,
    examTimetableFrame,
    examResultsFrame,
    answerSheetsFrame,
    hallTicketFrame,
    quizFrame,
    faqsFrame,
    feeOverviewFrame,
    feeTransactionsFrame,
  ].filter(Boolean);

  frames.forEach((fr) => {
    fr.style.height = `${h}px`;
    fr.style.width = "100%";
    fr.style.border = "0";
    fr.style.borderRadius = "0";
    fr.style.display = "block";
    fr.style.background = "transparent";
  });

  if (contentArea && document.body.classList.contains("iframe-mode")) {
    contentArea.style.overflow = "hidden";
  }
}

// ===================================
// Sidebar Toggle (Mobile)
// ===================================
menuToggle?.addEventListener("click", () => {
  sidebar?.classList?.add("active");
  mobileOverlay?.classList?.add("active");
  if (mobileOverlay) {
    mobileOverlay.style.pointerEvents = "auto";
    mobileOverlay.style.opacity = "1";
  }
  document.body.style.overflow = "hidden";
});

sidebarClose?.addEventListener("click", closeSidebar);
mobileOverlay?.addEventListener("click", closeSidebar);

// ===================================
// Navigation & Page Switching
// ===================================
navItems.forEach((item) => {
  if (item.classList.contains("expandable")) {
    const link = item.querySelector(".nav-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        item.classList.toggle("open");
        setAllIframeHeights();
      });
    }

    const subMenuItems = item.querySelectorAll(".sub-menu li");
    subMenuItems.forEach((subItem) => {
      subItem.addEventListener("click", (e) => {
        e.stopPropagation();
        const pageId = subItem.getAttribute("data-page");
        if (pageId) switchPage(pageId, subItem);
      });
    });
  } else {
    item.addEventListener("click", (e) => {
      const pageId = item.getAttribute("data-page");
      if (pageId && pageId !== "logout") {
        e.preventDefault();
        switchPage(pageId, item);
      } else if (pageId === "logout") {
        e.preventDefault();
        handleLogout();
      }
    });
  }
});

function ensureEmbedded(pageId) {
  const map = {
    courses: [coursesFrame, EMBED_PAGES.courses],
    profile: [profileFrame, EMBED_PAGES.profile],
    attendance: [attendanceFrame, EMBED_PAGES.attendance],
    "doubt-clarification": [doubtsFrame, EMBED_PAGES.doubts],
    "short-notes": [shortNotesFrame, EMBED_PAGES.shortNotes],
    "leave-application": [leaveFrame, EMBED_PAGES.leave],
    notifications: [notificationsFrame, EMBED_PAGES.notifications],
    timetable: [timetableFrame, EMBED_PAGES.timetable],
    "exam-timetable": [examTimetableFrame, EMBED_PAGES.examTimetable],
    "exam-results": [examResultsFrame, EMBED_PAGES.examResults],
    "answer-sheets": [answerSheetsFrame, EMBED_PAGES.answerSheets],
    "hall-ticket": [hallTicketFrame, EMBED_PAGES.hallTicket],
    quiz: [quizFrame, EMBED_PAGES.quiz],
    faqs: [faqsFrame, EMBED_PAGES.faqs],
    "fee-overview": [feeOverviewFrame, EMBED_PAGES.feeOverview],
    "transaction-history": [feeTransactionsFrame, EMBED_PAGES.feeTransactions],
  };

  const pair = map[pageId];
  if (pair) {
    const [frame, url] = pair;
    if (frame && (!frame.src || frame.src.includes("about:blank") || !frame.src.endsWith(url))) {
      frame.src = url;
    }
  }

  setAllIframeHeights();
}

function switchPage(pageId, clickedItem) {
  navItems.forEach((item) => item.classList.remove("active"));

  // ✅ Always highlight only the clicked menu item
  clickedItem?.classList?.add("active");

  // ✅ If it's inside a dropdown, keep the parent dropdown open
  const parentExpandable = clickedItem?.closest?.(".expandable");
  if (parentExpandable) parentExpandable.classList.add("open");

  pages.forEach((page) => page.classList.remove("active"));
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add("active");

    setIframeMode(IFRAME_PAGES.has(pageId));
    ensureEmbedded(pageId);

    if (contentArea) contentArea.scrollTop = 0;

    closeSidebar();
    forceOverlayOff();
    setAllIframeHeights();
  }
}

function openPage(pageId) {
  pages.forEach((p) => p.classList.remove("active"));
  const targetPage = document.getElementById(`${pageId}-page`);
  if (targetPage) {
    targetPage.classList.add("active");

    setIframeMode(IFRAME_PAGES.has(pageId));
    ensureEmbedded(pageId);

    if (contentArea) contentArea.scrollTop = 0;
  }
  closeSidebar();
  forceOverlayOff();
  setAllIframeHeights();
}

// ===================================
// Notifications (TOP BELL CLICK)
// ===================================
notifBtnStudent?.addEventListener("click", (e) => {
  e.preventDefault();
  openPage("notifications");
  updateNotifBadgeFromBackend();
});

// ===================================
// ✅ TOP RIGHT avatar click -> open Profile page (NOT open image URL)
// ===================================
if (headerAvatar) {
  headerAvatar.style.cursor = "pointer";
  headerAvatar.title = "Open Profile";
  headerAvatar.addEventListener("click", (e) => {
    e.preventDefault();
    openPage("profile");   // ✅ opens student profile page in right panel
  });
}

// ===================================
// Header Profile Icon Click -> open profile
// ===================================
if (headerProfileBtn) {
  headerProfileBtn.style.cursor = "pointer";
  headerProfileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openPage("profile");
    navItems.forEach((item) => item.classList.remove("active"));
  });
}

function handleLogout() {
  // ✅ Direct logout (no confirm, no alert)
  sessionStorage.removeItem("auth_username");
  sessionStorage.removeItem("auth_password");
  sessionStorage.removeItem("auth_role");
  sessionStorage.removeItem("studentId");

  // also clear notice target keys (safe)
  sessionStorage.removeItem("classId");
  sessionStorage.removeItem("section");

  window.location.href = "/login/login.html";
}

// ===================================
// Backend Data Loader
// ===================================
async function loadStudentHeaderFromBackend() {
  const auth = getAuth();
  if (!auth) return;

  sidebarStudentName.textContent = auth.studentId || "Student";
  sidebarClassSection.textContent = "Class — - Section —";
  if (welcomeTitle) welcomeTitle.textContent = `Welcome Back, ${auth.studentId}! 👋`;

  const profile = await apiGet(`/student/profile/${auth.studentId}`, auth);

  if (profile) {
    const fullName = profile.fullName || profile.name || auth.studentId;
    const standardRaw = profile.standard ?? profile.classNumber ?? profile.class ?? null;
    const section = profile.section ?? null;

    sidebarStudentName.textContent = fullName;
    if (welcomeTitle) welcomeTitle.textContent = `Welcome Back, ${fullName}! 👋`;

    if (hasValue(standardRaw) && hasValue(section)) {
      const stdLabel = formatStandardLabel(standardRaw);
      sidebarClassSection.textContent = `${stdLabel} - Section ${section}`;
    }

    // ✅ Student photo priority:
    // 1) backend profileUrl
    // 2) ui-avatars fallback
    const safeName = encodeURIComponent(fullName);
    const ui80 = `https://ui-avatars.com/api/?name=${safeName}&background=667eea&color=fff&size=80`;
    const ui40 = `https://ui-avatars.com/api/?name=${safeName}&background=667eea&color=fff&size=40`;

    const studentPhoto = String(profile.profileUrl || "").trim();

    // ✅ LEFT SIDEBAR avatar = STUDENT PHOTO (not school logo)
    if (sidebarAvatar) {
      sidebarAvatar.src = studentPhoto || ui80;
      sidebarAvatar.onerror = () => { sidebarAvatar.src = ui80; };
      sidebarAvatar.style.cursor = "pointer";
      sidebarAvatar.title = "Open Profile";
      sidebarAvatar.onclick = (e) => {
        e.preventDefault();
        openPage("profile");
      };
    }

    // ✅ TOP RIGHT avatar = STUDENT PHOTO (not school logo)
    if (headerAvatar) {
      headerAvatar.src = studentPhoto || ui40;
      headerAvatar.onerror = () => { headerAvatar.src = ui40; };
    }

    // ✅ Store class/section for notices filter (frontend only)
    setStudentTargetFromProfile(profile);

    return;
  }

  // fallback: faculties
  try {
    const faculties = await apiGet(`/student/dashboard/${auth.studentId}/faculties`, auth);
    if (Array.isArray(faculties) && faculties.length > 0) {
      const any = faculties[0];
      const standardRaw = any.standard ?? any.classNumber ?? any.class ?? null;
      const section = any.section ?? null;

      if (hasValue(standardRaw) && hasValue(section)) {
        const stdLabel = formatStandardLabel(standardRaw);
        sidebarClassSection.textContent = `${stdLabel} - Section ${section}`;

        // also save target
        sessionStorage.setItem("classId", String(standardRaw));
        sessionStorage.setItem("section", String(section).toUpperCase());
      }
    }
  } catch (err) {
    console.warn("Could not load faculties fallback for class/section:", err);
  }
}

// ===================================
// Badge count from backend (localStorage smp_session)
// ===================================
function getSessionLS() {
  try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
  catch { return {}; }
}

function normalizeTokenLS(raw) {
  if (!raw) return "";
  let tok = String(raw).trim();
  if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
  if (!looksBase64 && tok.includes(":")) tok = btoa(tok);
  return tok;
}

async function updateNotifBadgeFromBackend() {
  try {
    const s = getSessionLS();
    const role = String(s.role || "").toUpperCase();
    const userId = s.username;
    const basicToken = normalizeTokenLS(s.basicToken);

    if (role !== "STUDENT" || !userId || !basicToken) {
      if (notifCountStudent) notifCountStudent.style.display = "none";
      return;
    }

    const res = await fetch(`/api/notifications/STUDENT/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Basic ${basicToken}` }
    });

    if (!res.ok) {
      if (notifCountStudent) notifCountStudent.style.display = "none";
      return;
    }

    const list = await res.json().catch(() => []);
    const unread = Array.isArray(list) ? list.filter(n => !n.read).length : 0;

    if (notifCountStudent) {
      notifCountStudent.textContent = String(unread);
      notifCountStudent.style.display = unread > 0 ? "" : "none";
    }
  } catch {
    // silent
  }
}

// ===================================
// Receive events from notifications iframe
// ===================================
window.addEventListener("message", (event) => {
  if (!event?.data) return;

  if (event.data.type === "NOTIF_BADGE_UPDATE") {
    const unread = Number(event.data.unread ?? 0);
    if (notifCountStudent) {
      notifCountStudent.textContent = String(unread);
      notifCountStudent.style.display = unread > 0 ? "" : "none";
    }
  }

  if (event.data.type === "NAVIGATE_TO_PAGE") {
    const pageId = event.data.pageId;
    if (!pageId) return;
    openPage(pageId);
  }
});

// ===================================
// ✅ Dashboard Notices + Holidays (single message)
// ===================================
function getDashEl(id) {
  return document.getElementById(id);
}

function safeText(s) {
  return String(s ?? "").trim();
}

function setStudentTargetFromProfile(profile) {
  const standardRaw = profile?.standard ?? profile?.classNumber ?? profile?.class ?? null;
  const sectionRaw = profile?.section ?? null;

  if (standardRaw !== null && standardRaw !== undefined && String(standardRaw).trim() !== "") {
    sessionStorage.setItem("classId", String(standardRaw));
  }
  if (sectionRaw !== null && sectionRaw !== undefined && String(sectionRaw).trim() !== "") {
    sessionStorage.setItem("section", String(sectionRaw).trim().toUpperCase());
  }
}

async function apiGetSmart(path, auth) {
  const headers = {};
  if (auth?.username && auth?.password) {
    Object.assign(headers, makeAuthHeader(auth.username, auth.password));
  }

  const res = await fetch(`${API_BASE}${path}`, { method: "GET", headers });

  if (res.status === 401) return null;
  if (res.status === 404) return null;

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `Request failed: ${res.status}`);
  }

  return res.json();
}

function formatNoticeDate(s) {
  if (!s) return "";
  return String(s).replace("T", " ").slice(0, 16);
}

function escapeHtml(s){
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function renderNoticeCard(n) {
  const title = safeText(n?.title) || "Notice";
  const msg = safeText(n?.message) || safeText(n?.description) || "-";
  const publishAt = formatNoticeDate(n?.publishAt || n?.createdAt || n?.date);
  const audience = safeText(n?.audienceType) || "STUDENTS";
  const target =
    (n?.classId && n?.section) ? `${n.classId}-${String(n.section).toUpperCase()}` : "ALL";

  return `
    <div class="notice-card">
      <div class="notice-title">📌 ${escapeHtml(title)}</div>
      <div class="notice-msg">${escapeHtml(msg)}</div>

      <div class="notice-meta">
        <span class="notice-chip">${escapeHtml(audience)}</span>
        <span class="notice-chip">Target: ${escapeHtml(target)}</span>
        ${publishAt ? `<span>🗓️ ${escapeHtml(publishAt)}</span>` : ""}
      </div>
    </div>
  `;
}

async function loadDashboardNotice(auth) {
  const box = document.getElementById("dashNoticeBox");
  if (!box) return;

  box.innerHTML = `<div class="dash-item muted">📌 Loading notices...</div>`;

  try {
    const classId = sessionStorage.getItem("classId");
    const section = sessionStorage.getItem("section");

    const qs = new URLSearchParams();
    if (classId) qs.set("classId", classId);
    if (section) qs.set("section", section);
    qs.set("page", "0");
    qs.set("size", "5");

    const page = await apiGetSmart(`/notices/me?${qs.toString()}`, auth);

    const list = Array.isArray(page?.content) ? page.content : [];
    if (!list.length) {
      box.innerHTML = `<div class="dash-item">📌 No new notices yet</div>`;
      return;
    }

    box.innerHTML = list.map(renderNoticeCard).join("");
  } catch (e) {
    box.innerHTML = `<div class="dash-item">📌 No new notices yet</div>`;
  }
}

function formatHolidayDates(h) {
  const start = safeText(h?.startDate);
  const end = safeText(h?.endDate);
  if (!start && !end) return "";
  return end ? `${start} → ${end}` : start;
}

function renderHolidayCard(h) {
  const name = safeText(h?.name) || "Holiday";
  const desc = safeText(h?.description) || "";
  const dates = formatHolidayDates(h);

  return `
    <div class="holiday-card">
      <div class="holiday-title">🎉 ${escapeHtml(name)}</div>
      ${desc ? `<div class="holiday-desc">${escapeHtml(desc)}</div>` : ""}
      <div class="holiday-meta">
        ${dates ? `<span class="holiday-chip">🗓️ ${escapeHtml(dates)}</span>` : `<span class="holiday-chip">🗓️ Date: -</span>`}
      </div>
    </div>
  `;
}

async function loadDashboardHoliday(auth) {
  const box = document.getElementById("dashHolidayBox");
  if (!box) return;

  box.innerHTML = `<div class="dash-item muted">🎉 Loading holidays...</div>`;

  try {
    const list = await apiGetSmart(`/holidays/upcoming?limit=5`, auth);
    const items = Array.isArray(list) ? list : [];

    if (!items.length) {
      box.innerHTML = `<div class="dash-item">🎉 No holidays loaded</div>`;
      return;
    }

    box.innerHTML = items.map(renderHolidayCard).join("");
  } catch (e) {
    box.innerHTML = `<div class="dash-item">🎉 No holidays loaded</div>`;
  }
}

async function loadDashboardNoticeAndHoliday() {
  const auth = getAuth();
  if (!auth) return;
  await loadDashboardNotice(auth);
  await loadDashboardHoliday(auth);
}

// ===================================
// ✅ School Branding Loader (TOP LEFT ONLY)
// ✅ This will NOT touch student avatars anymore.
// ===================================
function makeUiAvatarUrl(name, size) {
  const nm = encodeURIComponent(String(name || "School"));
  return `https://ui-avatars.com/api/?name=${nm}&background=667eea&color=fff&size=${size || 80}`;
}

function replaceSchoolLogoIconWithImage(logoUrl) {
  const icon = document.getElementById("schoolLogoIcon");
  if (!icon) return;

  // already replaced
  if (document.getElementById("schoolLogoImg")) return;

  const img = document.createElement("img");
  img.id = "schoolLogoImg";
  img.src = logoUrl;
  img.alt = "School Logo";
  img.style.width = "28px";
  img.style.height = "28px";
  img.style.borderRadius = "8px";
  img.style.objectFit = "cover";
  img.style.marginRight = "8px";
  img.style.verticalAlign = "middle";

  img.onerror = () => {
    // If logo fails, keep the icon (revert)
    if (img.parentNode) {
      const i = document.createElement("i");
      i.className = icon.className || "fas fa-graduation-cap";
      i.id = "schoolLogoIcon";
      img.replaceWith(i);
    }
  };

  icon.replaceWith(img);
}

async function loadSchoolBrandingFromBackend() {
  const auth = getAuth();
  if (!auth) return;

  try {
    const b = await apiGetSmart(`/api/branding`, auth);
    if (!b) return;

    const name = String(b.schoolName || "").trim();
    const logoUrl = String(b.logoUrl || "").trim();

    // ✅ TOP LEFT: School name
    if (schoolNameTextEl && name) {
      schoolNameTextEl.textContent = name;
    }

    // ✅ TOP LEFT: School logo icon replaced by image
    if (logoUrl) {
      replaceSchoolLogoIconWithImage(logoUrl);
    }
  } catch (e) {
    console.warn("Branding load failed:", e?.message || e);
  }
}

// ===================================
// Init
// ===================================
document.addEventListener("DOMContentLoaded", async () => {
  await loadStudentHeaderFromBackend();

  forceOverlayOff();
  updateNotifBadgeFromBackend();
  setAllIframeHeights();

  // ✅ load dashboard notices/holidays
  loadDashboardNoticeAndHoliday();

  // ✅ load school branding (TOP LEFT only)
  loadSchoolBrandingFromBackend();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") updateNotifBadgeFromBackend();
});

window.addEventListener("resize", () => {
  setAllIframeHeights();
});

window.addEventListener("load", () => {
  setAllIframeHeights();
});

window.addEventListener("error", (e) => {
  console.error("Error occurred:", e.message);
});

// ✅ Dashboard diary refresh (iframe reload)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("dashDiaryRefresh");
  const fr = document.getElementById("dashDiaryFrame");

  btn?.addEventListener("click", () => {
    if (!fr) return;
    const src = fr.src;
    fr.src = "about:blank";
    setTimeout(() => { fr.src = src; }, 50);
  });
});