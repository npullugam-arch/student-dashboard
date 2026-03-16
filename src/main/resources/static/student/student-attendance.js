console.log("✅ student-attendance.js loaded");

// ✅ Read from localStorage (your login.js stores here)
const sessionRaw = localStorage.getItem("smp_session");
const session = sessionRaw ? JSON.parse(sessionRaw) : null;

if (!session || !session.username) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

const studentId = session.username; // ✅ student username is studentId like S1001

const monthSelect = document.getElementById("monthSelect");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const emptyEl = document.getElementById("empty");

const calendarGrid = document.getElementById("calendarGrid");
const calendarMonthTitle = document.getElementById("calendarMonth");

const presentEl = document.getElementById("presentDays");
const absentEl = document.getElementById("absentDays");
const percentEl = document.getElementById("progressPercent");
const circleEl = document.getElementById("progressCircle");
const progressSub = document.getElementById("progressSub");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const CIRCUMFERENCE = 2 * Math.PI * 100; // r = 100

function showError(msg) {
  errorEl.style.display = "block";
  errorEl.textContent = msg || "Error loading attendance";
}
function clearError() {
  errorEl.style.display = "none";
  errorEl.textContent = "";
}

function pad2(n){ return String(n).padStart(2,"0"); }

function monthRange(year, monthIndex0) {
  const from = new Date(year, monthIndex0, 1);
  const to = new Date(year, monthIndex0 + 1, 0);
  return {
    fromStr: `${from.getFullYear()}-${pad2(from.getMonth()+1)}-${pad2(from.getDate())}`,
    toStr: `${to.getFullYear()}-${pad2(to.getMonth()+1)}-${pad2(to.getDate())}`
  };
}

function ymdFromDate(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || "Request failed"}`);
  }
  return res.json();
}

/* ✅ Animations */
function animateValue(element, start, end, duration) {
  start = Number(start) || 0;
  end = Number(end) || 0;
  let startTime = null;

  function step(t) {
    if (!startTime) startTime = t;
    const progress = Math.min((t - startTime) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateProgress(targetPercent) {
  const p = Math.max(0, Math.min(100, Number(targetPercent) || 0));

  // reset
  circleEl.style.transition = "none";
  circleEl.style.strokeDasharray = String(Math.round(CIRCUMFERENCE));
  circleEl.style.strokeDashoffset = String(Math.round(CIRCUMFERENCE));
  percentEl.textContent = "0%";

  // animate number
  let cur = 0;
  const duration = 1600;
  const stepMs = 16;
  const inc = p / (duration / stepMs);

  const timer = setInterval(() => {
    cur += inc;
    if (cur >= p) {
      cur = p;
      clearInterval(timer);
    }
    percentEl.textContent = `${Math.round(cur)}%`;
  }, stepMs);

  // animate circle
  setTimeout(() => {
    circleEl.style.transition = "stroke-dashoffset 1.8s ease";
    const offset = CIRCUMFERENCE - (p / 100) * CIRCUMFERENCE;
    circleEl.style.strokeDashoffset = String(offset);
  }, 80);
}

// ✅ GLOBAL Tooltip (works everywhere)
let tt;

function ensureTooltip() {
  if (tt) return;
  tt = document.createElement("div");
  tt.id = "calTooltip";
  document.body.appendChild(tt);
}

function showTooltip(text, x, y) {
  ensureTooltip();
  tt.textContent = text;
  tt.classList.add("show");

  // position near cursor
  const offset = 14;
  tt.style.left = (x + offset) + "px";
  tt.style.top = (y + offset) + "px";
}

function moveTooltip(x, y) {
  if (!tt) return;
  const offset = 14;
  tt.style.left = (x + offset) + "px";
  tt.style.top = (y + offset) + "px";
}

function hideTooltip() {
  if (!tt) return;
  tt.classList.remove("show");
}


/* ✅ Calendar generator (Sunday only weekend) */
function generateCalendar(year, monthIndex0, statusMap) {
  calendarGrid.innerHTML = "";

  // headers
  dayNames.forEach(d => {
    const h = document.createElement("div");
    h.className = "calendar-day calendar-day-header";
    h.textContent = d;
    calendarGrid.appendChild(h);
  });

  const firstDay = new Date(year, monthIndex0, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();

  // leading empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    empty.textContent = "";
    calendarGrid.appendChild(empty);
  }

  const today = new Date();
  const todayYMD = ymdFromDate(today);

for (let day = 1; day <= daysInMonth; day++) {
  const cell = document.createElement("div");
  cell.className = "calendar-day";
  cell.textContent = day;

  const d = new Date(year, monthIndex0, day);
  const dow = d.getDay();          // 0 Sunday
  const ymd = ymdFromDate(d);

  const status = statusMap[ymd];   // "PRESENT" | "ABSENT" | undefined

  let tipText = "";

  if (status === "PRESENT") {
    cell.classList.add("present");
    tipText = `✅ Present • ${monthNames[monthIndex0]} ${day}, ${year}`;
  } else if (status === "ABSENT") {
    cell.classList.add("absent");
    tipText = `❌ Absent • ${monthNames[monthIndex0]} ${day}, ${year}`;
  } else if (dow === 0) {
    // ✅ Weekend only Sunday
    cell.classList.add("weekend");
    tipText = `🌞 Sunday • Holiday`;
  } else {
    cell.classList.add("future");
    tipText = (ymd > todayYMD) ? `⏳ Future • Not marked yet` : `ℹ️ No Data • Not recorded`;
  }

  // ==========================================
  // ✅ Tooltip delay logic (2 seconds)
  // ==========================================
  let hoverTimer = null;
  let lastX = 0, lastY = 0;
  const TOOLTIP_DELAY_MS = 750; // change to 3000 for 3 seconds

  cell.addEventListener("mouseenter", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;

    // start delay timer
    hoverTimer = setTimeout(() => {
      showTooltip(tipText, lastX, lastY);
    }, TOOLTIP_DELAY_MS);
  });

  cell.addEventListener("mousemove", (e) => {
    lastX = e.clientX;
    lastY = e.clientY;

    // move tooltip only if it's already visible
    moveTooltip(lastX, lastY);
  });

  cell.addEventListener("mouseleave", () => {
    // cancel delay if user leaves before time
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      hoverTimer = null;
    }
    hideTooltip();
  });

  // ✅ optional: if user clicks, show instantly
  // cell.addEventListener("click", (e) => {
  //   if (hoverTimer) clearTimeout(hoverTimer);
  //   showTooltip(tipText, e.clientX, e.clientY);
  // });

  calendarGrid.appendChild(cell);
}


  calendarMonthTitle.textContent = `${monthNames[monthIndex0]} ${year}`;
}

/* ✅ Month dropdown */
function fillMonthDropdown() {
  const now = new Date();
  monthSelect.innerHTML = "";

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const opt = document.createElement("option");
    opt.value = `${d.getFullYear()}-${d.getMonth()}`; // year-monthIndex0
    opt.textContent = d.toLocaleString(undefined, { month: "long", year: "numeric" });
    if (i === 0) opt.selected = true;
    monthSelect.appendChild(opt);
  }
}

/* ✅ Prev/Next controls (change dropdown selection) */
function shiftMonth(delta) {
  const [y, m] = monthSelect.value.split("-").map(Number);
  const d = new Date(y, m, 1);
  d.setMonth(d.getMonth() + delta);

  // find matching option
  const targetValue = `${d.getFullYear()}-${d.getMonth()}`;
  const opt = [...monthSelect.options].find(o => o.value === targetValue);

  if (opt) {
    monthSelect.value = targetValue;
  } else {
    // if not in last 12 months list, rebuild list around new date (still fine)
    const base = new Date(d.getFullYear(), d.getMonth(), 1);
    monthSelect.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const md = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const o = document.createElement("option");
      o.value = `${md.getFullYear()}-${md.getMonth()}`;
      o.textContent = md.toLocaleString(undefined, { month: "long", year: "numeric" });
      if (i === 0) o.selected = true;
      monthSelect.appendChild(o);
    }
  }

  refreshAll();
}

/* ✅ MAIN: fetch + render */
async function refreshAll() {
  loadingEl.style.display = "block";
  emptyEl.style.display = "none";
  clearError();

  try {
    const [year, monthIndex0] = monthSelect.value.split("-").map(Number);
    const { fromStr, toStr } = monthRange(year, monthIndex0);

    progressSub.textContent = `Showing ${monthNames[monthIndex0]} ${year}`;

    // ✅ BACKEND: SUMMARY (unchanged)
    const summary = await fetchJson(`/student/${studentId}/attendance/summary`);

    const presentDays = summary.presentDays ?? 0;
    const absentDays = summary.absentDays ?? 0;
    const percentage = summary.percentage ?? 0;

    animateValue(presentEl, Number(presentEl.textContent) || 0, presentDays, 900);
    animateValue(absentEl, Number(absentEl.textContent) || 0, absentDays, 900);
    animateProgress(percentage);

    // ✅ BACKEND: LIST (unchanged)
    const list = await fetchJson(`/student/${studentId}/attendance?from=${fromStr}&to=${toStr}`);

    // build date->status map for calendar
    const statusMap = {};
    if (Array.isArray(list)) {
      list.forEach(item => {
        const date = (item.date || "").slice(0, 10); // allow "YYYY-MM-DD" or ISO
        const st = (item.status || "").toUpperCase();
        if (!date) return;
        if (st === "P" || st === "PRESENT") statusMap[date] = "PRESENT";
        else if (st === "A" || st === "ABSENT") statusMap[date] = "ABSENT";
      });
    }

    generateCalendar(year, monthIndex0, statusMap);

    if (!list || list.length === 0) {
      emptyEl.style.display = "block";
    }

  } catch (e) {
    console.error("❌ Attendance error:", e);
    showError(e.message);
  } finally {
    loadingEl.style.display = "none";
  }
}

/* ✅ Init */
fillMonthDropdown();
monthSelect.addEventListener("change", refreshAll);

btnPrev.addEventListener("click", () => shiftMonth(-1));
btnNext.addEventListener("click", () => shiftMonth(1));

refreshAll();

