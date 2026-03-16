// ================================
// ✅ UPDATED FULL FILE: admin-dashboard.js
// ✅ Frontend-only change (SAFE):
// 1) Added "Student Passwords" nav item -> loads /admin/admin-passwords.html in iframe
// 2) Added "Teacher Passwords" nav item -> loads /admin/admin-teacher-passwords.html in iframe
// 3) Added restore support for both password pages
// ✅ Backend untouched
// ================================

// ✅ OFFLINE SAFETY (extra safe when navigating iframe pages too)
(function () {
  try {
    function remember() {
      if (navigator.onLine) {
        sessionStorage.setItem(
          "last_online_url",
          location.pathname + location.search + location.hash
        );
      }
    }
    remember();
    window.addEventListener("online", remember);
    window.addEventListener("beforeunload", remember);
  } catch {}
})();

console.log("✅ admin-dashboard.js loaded");

// ============================
// SESSION (unchanged usage)
// ============================
const session = requireAdmin();

// ✅ Normalize token once so iframe pages don’t get 401
(function normalizeStoredSession() {
  try {
    const raw = localStorage.getItem("smp_session");
    if (!raw) return;

    const s = JSON.parse(raw);
    if (!s || !s.basicToken) return;

    let tok = String(s.basicToken).trim();

    if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();

    const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
    if (!looksBase64 && tok.includes(":")) {
      tok = btoa(tok);
    }

    if (tok !== s.basicToken) {
      s.basicToken = tok;
      localStorage.setItem("smp_session", JSON.stringify(s));
      console.log("✅ smp_session normalized");
    }
  } catch (e) {
    console.warn("Session normalize failed:", e);
  }
})();

// ============================
// HEADER DATA
// ============================
document.getElementById("adminName").textContent = "Admin";
document.getElementById("adminId").textContent = `ID: ${session.username}`;

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/admin.html";
});

// ============================
// VIEWS
// ============================
const overviewView = document.getElementById("overviewView");
const embedView = document.getElementById("embedView");
const contentFrame = document.getElementById("contentFrame");
const embedTitle = document.getElementById("embedTitle");
const backToOverviewBtn = document.getElementById("backToOverviewBtn");

// Nav items
const navOverview = document.getElementById("navOverview");
const navSchoolBranding = document.getElementById("navSchoolBranding");
const navStudents = document.getElementById("navStudents");
const navTeachers = document.getElementById("navTeachers");
const navSubjects = document.getElementById("navSubjects");
const navAttendance = document.getElementById("navAttendance");

// ✅ Password pages
const navStudentPasswords = document.getElementById("navStudentPasswords");
const navTeacherPasswords = document.getElementById("navTeacherPasswords");

// ✅ Existing
const navTimetable = document.getElementById("navTimetable");
const navTeacherTimetable = document.getElementById("navTeacherTimetable");
const navExamTimetable = document.getElementById("navExamTimetable");
const navExamTimetableDetail = document.getElementById("navExamTimetableDetail");
const navHallTicket = document.getElementById("navHallTicket");
const navNoticesHolidays = document.getElementById("navNoticesHolidays");

function setActive(activeEl) {
  document
    .querySelectorAll(".nav-item")
    .forEach((a) => a.classList.remove("active"));
  activeEl.classList.add("active");
}

function showOverview() {
  embedView.classList.add("hidden");
  overviewView.classList.remove("hidden");
  contentFrame.src = "";
  setActive(navOverview);
  sessionStorage.setItem("admin_last_view", "overview");
}

function openInRightPanel(title, url, activeEl) {
  overviewView.classList.add("hidden");
  embedView.classList.remove("hidden");
  embedTitle.textContent = title;

  // ✅ absolute paths (prevents wrong loads)
  contentFrame.src = url;

  setActive(activeEl);
  sessionStorage.setItem("admin_last_view", url);
}

// Overview
navOverview.addEventListener("click", (e) => {
  e.preventDefault();
  showOverview();
});

// School Branding
navSchoolBranding.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("School Branding", "/admin/admin-school-branding.html", navSchoolBranding);
});

// Students
navStudents.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Students", "/admin/students.html", navStudents);
});

// Teachers
navTeachers.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Teachers", "/admin/teachers.html", navTeachers);
});

// Subjects
navSubjects.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Subjects", "/admin/subjects.html", navSubjects);
});

// Attendance
navAttendance.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Attendance", "/admin/admin-attendance.html", navAttendance);
});

// ✅ Student Passwords
navStudentPasswords.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Student Passwords", "/admin/admin-passwords.html", navStudentPasswords);
});

// ✅ Teacher Passwords
navTeacherPasswords.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Teacher Passwords", "/admin/admin-teacher-passwords.html", navTeacherPasswords);
});

// Class Timetable
navTimetable.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Class Timetable", "/admin/admin-timetable.html", navTimetable);
});

// Teacher Timetable
navTeacherTimetable.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Teacher Timetable", "/admin/admin-teacher-timetable.html", navTeacherTimetable);
});

// Exam Timetable
navExamTimetable.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Exam Timetable", "/admin/admin-exam-timetable.html", navExamTimetable);
});

// Exam Timetable in Detail
navExamTimetableDetail.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel(
    "Exam Timetable in Detail",
    "/admin/student-exam-timetable-details.html",
    navExamTimetableDetail
  );
});

// Hall Ticket
navHallTicket.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Hall Ticket", "/admin/admin-hallticket.html", navHallTicket);
});

// Notices & Holidays
navNoticesHolidays.addEventListener("click", (e) => {
  e.preventDefault();
  openInRightPanel("Notices & Holidays", "/admin/admin-notices-holidays.html", navNoticesHolidays);
});

// Back
backToOverviewBtn.addEventListener("click", showOverview);

// ✅ Restore last opened panel after refresh
(function restoreLastView() {
  const last = sessionStorage.getItem("admin_last_view");
  if (!last || last === "overview") return;

  if (last.includes("admin-school-branding.html")) {
    return openInRightPanel("School Branding", "/admin/admin-school-branding.html", navSchoolBranding);
  }

  if (last.includes("students.html")) return openInRightPanel("Students", "/admin/students.html", navStudents);
  if (last.includes("teachers.html")) return openInRightPanel("Teachers", "/admin/teachers.html", navTeachers);
  if (last.includes("subjects.html")) return openInRightPanel("Subjects", "/admin/subjects.html", navSubjects);

  if (last.includes("admin-attendance.html")) {
    return openInRightPanel("Attendance", "/admin/admin-attendance.html", navAttendance);
  }

  // ✅ restore: Student Passwords
  if (last.includes("admin-passwords.html")) {
    return openInRightPanel("Student Passwords", "/admin/admin-passwords.html", navStudentPasswords);
  }

  // ✅ restore: Teacher Passwords
  if (last.includes("admin-teacher-passwords.html")) {
    return openInRightPanel("Teacher Passwords", "/admin/admin-teacher-passwords.html", navTeacherPasswords);
  }

  if (last.includes("admin-timetable.html")) return openInRightPanel("Class Timetable", "/admin/admin-timetable.html", navTimetable);

  if (last.includes("admin-teacher-timetable.html")) {
    return openInRightPanel("Teacher Timetable", "/admin/admin-teacher-timetable.html", navTeacherTimetable);
  }

  if (last.includes("admin-exam-timetable.html")) {
    return openInRightPanel("Exam Timetable", "/admin/admin-exam-timetable.html", navExamTimetable);
  }

  if (last.includes("student-exam-timetable-details.html")) {
    return openInRightPanel("Exam Timetable in Detail", "/admin/student-exam-timetable-details.html", navExamTimetableDetail);
  }

  if (last.includes("admin-hallticket.html")) {
    return openInRightPanel("Hall Ticket", "/admin/admin-hallticket.html", navHallTicket);
  }

  if (last.includes("admin-notices-holidays.html")) {
    return openInRightPanel("Notices & Holidays", "/admin/admin-notices-holidays.html", navNoticesHolidays);
  }
})();

// ===================
// COUNTS (FIXED)
// ===================
async function safeCount(url) {
  try {
    const arr = await apiGet(url);
    return Array.isArray(arr) ? arr.length : 0;
  } catch (e) {
    console.warn("Count failed:", url, e.message);
    return null;
  }
}

async function loadCounts() {
  try {
    const studentsCount = await safeCount("/admin/students");
    const teachersCount = await safeCount("/admin/teachers");

    let subjectsTotal = 0;
    let anyOk = false;

    for (let std = 1; std <= 10; std++) {
      const c = await safeCount(`/admin/subjects/standard/${std}`);
      if (c != null) {
        subjectsTotal += c;
        anyOk = true;
      }
    }

    document.getElementById("studentsCount").textContent =
      studentsCount == null ? "--" : String(studentsCount);

    document.getElementById("teachersCount").textContent =
      teachersCount == null ? "--" : String(teachersCount);

    document.getElementById("subjectsCount").textContent =
      anyOk ? String(subjectsTotal) : "--";
  } catch (e) {
    console.error(e);
  }
}
loadCounts();