console.log("✅ student-exam-timetable.js loaded");

// --------------------
// Session (same as your working code)
// --------------------
const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

// --------------------
// Helpers (same endpoints style)
// --------------------
function tokenHeader() {
  const token = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${token}` };
}

async function apiGet(url, auth = false) {
  const res = await fetch(url, {
    method: "GET",
    headers: auth ? tokenHeader() : {}
  });
  const txt = await res.text().catch(() => "");
  if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

function formatStandardLabel(std) {
  const n = Number(std);
  if (Number.isNaN(n)) return "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return `Class ${n}`;
}

function to12Hour(time24) {
  if (!time24) return "";
  const [hStr, mStr] = String(time24).split(":");
  let h = parseInt(hStr, 10);
  const m = (mStr ?? "00").padStart(2, "0");
  const suf = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return `${h}:${m} ${suf}`;
}

function formatFriendlyDate(dateString) {
  // keep stable for backend "YYYY-MM-DD"
  const d = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(dateString || "");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function showErr(msg) {
  const box = document.getElementById("errBox");
  if (!box) return;
  box.textContent = msg || "Something went wrong";
  box.classList.remove("hidden");
}
function clearErr() {
  const box = document.getElementById("errBox");
  if (!box) return;
  box.textContent = "";
  box.classList.add("hidden");
}

// --------------------
// DOM
// --------------------
const examSelect = document.getElementById("examSelect");
const container = document.getElementById("timetableContent");

// --------------------
// State
// --------------------
let PROFILE = null; // {standard, section}

// --------------------
// UI builders (keeps your first UI look)
// --------------------
function renderEmpty(message, sub) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📅</div>
      <p>${message || "Please select an exam"}</p>
      <small>${sub || "Use the dropdown above"}</small>
    </div>
  `;
}

function renderTimetable(examNameText, roomText, rows) {
  const safeRows = Array.isArray(rows) ? rows : [];

  const tbodyHtml = safeRows.map(r => {
    const timeRange = `${to12Hour(r.startTime)} — ${to12Hour(r.endTime)}`.trim();
    return `
      <tr>
        <td class="date-cell">${formatFriendlyDate(r.examDate)}</td>
        <td class="day-cell">${r.day ?? ""}</td>
        <td class="subject-cell">${r.subjectName ?? ""}</td>
        <td><span class="time-range-cell">${timeRange}</span></td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="timetable-section">
      <div class="section-header">
        <h2>${examNameText || "Timetable"}</h2>
        <span class="room-badge">${roomText || ""}</span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Subject</th>
              <th>Start — End</th>
            </tr>
          </thead>
          <tbody>
            ${tbodyHtml || ""}
          </tbody>
        </table>
      </div>

      ${safeRows.length ? "" : `
        <div class="empty-state" style="margin-top:16px;">
          <div class="empty-state-icon">📭</div>
          <p>No timetable rows found</p>
          <small>Ask admin/teacher to publish timetable for this exam</small>
        </div>
      `}
    </div>
  `;
}

// --------------------
// Load profile -> standard & section
// --------------------
async function loadProfile() {
  const data = await apiGet(`/student/profile/${encodeURIComponent(studentId)}`, true);
  PROFILE = { standard: data.standard, section: data.section };
}

// --------------------
// Load exams list
// --------------------
async function loadExams() {
  const list = await apiGet("/student/api/exams");
  examSelect.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "— Select Exam —";
  examSelect.appendChild(opt0);

  (list || []).forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.examName} (ID: ${e.id})`;
    examSelect.appendChild(opt);
  });
}

// --------------------
// Auto load timetable when exam changes (same backend endpoint)
// --------------------
async function loadTimetable() {
  clearErr();

  const examId = examSelect.value;
  if (!examId) {
    renderEmpty("Please select an exam", "Prefinal / Final / Midterm");
    return;
  }

  if (!PROFILE) {
    renderEmpty("Loading class...", "Please wait");
    return;
  }

  try {
    const examNameText = examSelect.options[examSelect.selectedIndex]?.textContent || "Timetable";
    const roomText = `${formatStandardLabel(PROFILE.standard)} - ${PROFILE.section}`;

    // ✅ SAME backend endpoint as your working code
    const rows = await apiGet(
      `/student/api/exams/${encodeURIComponent(examId)}/timetable?standard=${encodeURIComponent(PROFILE.standard)}&section=${encodeURIComponent(PROFILE.section)}`
    );

    renderTimetable(examNameText, roomText, rows);
  } catch (err) {
    console.error(err);
    showErr(err.message || String(err));
    renderEmpty("Failed to load timetable", "Please try again");
  }
}

// --------------------
// INIT
// --------------------
(async function init() {
  try {
    clearErr();
    renderEmpty("Loading...", "Fetching exams");

    await loadProfile();
    await loadExams();

    renderEmpty("Please select an exam", "Prefinal / Final / Midterm");
    examSelect.addEventListener("change", loadTimetable);
  } catch (err) {
    console.error(err);
    showErr(err.message || "Failed to initialize");
    examSelect.innerHTML = `<option value="">Failed to load</option>`;
    renderEmpty("Initialization failed", "Login again and retry");
  }
})();