console.log("✅ leave.js loaded (UI-1 + Backend-2 merged)");

// ---------------------------
// SESSION (Student) - same backend logic
// ---------------------------
function getSession() {
  try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
  catch { return {}; }
}

function normalizeToken(raw) {
  if (!raw) return "";
  let tok = String(raw).trim();
  if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
  if (!looksBase64 && tok.includes(":")) tok = btoa(tok);
  return tok;
}

function requireStudent() {
  const s = getSession();
  if (!s.username || String(s.role || "").toUpperCase() !== "STUDENT") {
    alert("Session expired. Please login again.");
    window.location.href = "/login/login.html";
    throw new Error("No student session");
  }
  return s;
}

const session = requireStudent();
const studentId = session.username;
const basicToken = normalizeToken(session.basicToken); // ✅ keep same backend support

// ---------------------------
// API helper (same behavior)
// ---------------------------
async function apiFetch(url, opts = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  // If backend needs auth, this supports it; if not needed, it won't break.
  if (basicToken) headers.Authorization = `Basic ${basicToken}`;

  const res = await fetch(url, { ...opts, headers });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const txt = await res.text().catch(() => "");
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return txt; }
}

const $ = (id) => document.getElementById(id);

// ---------------------------
// DOM
// ---------------------------
const teacherListEl = $("teacherList");
const leaveListEl = $("leaveList");
const teacherErr = $("teacherErr");
const leaveErr = $("leaveErr");

const teacherSearch = $("teacherSearch");
const btnRefreshTeachers = $("btnRefreshTeachers");
const btnRefreshLeaves = $("btnRefreshLeaves");

// Modal
const modal = $("leaveModal");
const modalTeacher = $("modalTeacher");
const btnCloseModal = $("btnCloseModal");
const btnCancel = $("btnCancel");
const form = $("leaveForm");
const formErr = $("formErr");

function showErr(el, msg) { el.textContent = msg; el.classList.remove("hidden"); }
function clearErr(el) { el.textContent = ""; el.classList.add("hidden"); }

// ---------------------------
// State
// ---------------------------
let teachers = [];
let myLeaves = [];
let selectedTeacher = null;

// ---------------------------
// Modal helpers
// ---------------------------
function setFormErr(msg) {
  if (!msg) {
    formErr.classList.add("hidden");
    formErr.textContent = "";
    return;
  }
  formErr.textContent = msg;
  formErr.classList.remove("hidden");
}

function openModal(t) {
  selectedTeacher = t;

  // Set min date to today (same UI behavior)
  const today = new Date().toISOString().split("T")[0];
  $("fromDate").setAttribute("min", today);
  $("toDate").setAttribute("min", today);

  $("fromDate").value = "";
  $("toDate").value = "";
  $("purpose").value = "";
  $("desc").value = "";
  setFormErr("");

  modalTeacher.textContent = `Applying to: ${t.teacherName || t.teacherId} • Subject: ${t.subjectName || "—"}`;
  modal.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
  selectedTeacher = null;
  setFormErr("");
  form.reset();
}

// Force hide on load
closeModal();
window.addEventListener("load", closeModal);
document.addEventListener("DOMContentLoaded", closeModal);

btnCloseModal.addEventListener("click", closeModal);
btnCancel.addEventListener("click", closeModal);

// Close modal on outside click
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Update "toDate" min when "fromDate" changes
$("fromDate").addEventListener("change", function () {
  $("toDate").setAttribute("min", this.value);
});

// ---------------------------
// UI helpers
// ---------------------------
function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function avatarGradient(seed) {
  const grads = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)"
  ];
  let x = 0;
  for (let i = 0; i < String(seed || "").length; i++) x = (x + seed.charCodeAt(i)) % grads.length;
  return grads[x];
}

function statusClass(s) {
  const up = String(s || "").toUpperCase();
  if (up === "APPROVED") return "approved";
  if (up === "REJECTED") return "rejected";
  return "pending";
}

function statusLabel(s, viewed) {
  const up = String(s || "").toUpperCase();
  if (up === "APPROVED") return `✓ APPROVED • ${viewed ? "👀 Viewed" : "🕒 Not viewed"}`;
  if (up === "REJECTED") return `✗ REJECTED • ${viewed ? "👀 Viewed" : "🕒 Not viewed"}`;
  return `⏳ PENDING • ${viewed ? "👀 Viewed" : "🕒 Not viewed"}`;
}

// ---------------------------
// Load teachers (same backend endpoints)
// ---------------------------
async function loadTeachers() {
  clearErr(teacherErr);
  teacherListEl.innerHTML = `<div class="muted">Loading...</div>`;

  try {
    const list = await apiFetch(`/student/api/leaves/${encodeURIComponent(studentId)}/teachers`);
    teachers = Array.isArray(list) ? list : [];
    renderTeachers(teachers);
  } catch (e) {
    teacherListEl.innerHTML = "";
    showErr(teacherErr, e.message);
  }
}

function renderTeachers(list) {
  if (!list.length) {
    teacherListEl.innerHTML = `<div class="muted">No teachers found for your class/section.</div>`;
    return;
  }

  teacherListEl.innerHTML = list.map(t => {
    const teacherId = String(t.teacherId ?? t.id ?? "");
    const teacherName = String(t.teacherName ?? t.name ?? teacherId ?? "Teacher");
    const subjectName = String(t.subjectName ?? t.subject ?? t.subject_name ?? t.subjectTitle ?? "").trim();

    const ini = initials(teacherName);
    const grad = avatarGradient(teacherName + subjectName);

    return `
      <div class="teacher-card" data-id="${teacherId}">
        <div class="teacher-info">
          <div class="teacher-avatar" style="background:${grad}">${ini}</div>
          <div class="teacher-details">
            <h3>${teacherName}</h3>
            <p>Subject: ${subjectName || "—"}</p>
          </div>
        </div>
        <button class="btn-apply" type="button">Apply</button>
      </div>
    `;
  }).join("");

  // Apply click (open modal)
  teacherListEl.querySelectorAll(".teacher-card").forEach(card => {
    const btn = card.querySelector(".btn-apply");
    btn.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      const found = teachers.find(x => String(x.teacherId ?? x.id ?? "") === String(id));

      const teacherId = String(found?.teacherId ?? found?.id ?? id ?? "").trim();
      const teacherName = String(found?.teacherName ?? found?.name ?? "").trim();
      const subjectName = String(found?.subjectName ?? found?.subject ?? found?.subject_name ?? found?.subjectTitle ?? "").trim();

      if (!teacherId) return showErr(teacherErr, "Teacher id missing. Refresh and try again.");

      // backend needs teacherId + subjectName
      if (!subjectName) {
        // still open modal, but show form error
        openModal({ teacherId, teacherName, subjectName: "" });
        setFormErr("Subject missing for this teacher. Ask admin to map subject or refresh.");
        return;
      }

      openModal({ teacherId, teacherName, subjectName });
    });
  });
}

// Search filter
teacherSearch.addEventListener("input", () => {
  const q = (teacherSearch.value || "").trim().toLowerCase();
  if (!q) return renderTeachers(teachers);

  const filtered = teachers.filter(x => {
    const blob = `${x.teacherName || ""} ${x.teacherId || ""} ${x.subjectName || ""} ${x.subject || ""}`.toLowerCase();
    return blob.includes(q);
  });
  renderTeachers(filtered);
});

// ---------------------------
// Load leaves (same backend endpoints)
// ---------------------------
async function loadLeaves() {
  clearErr(leaveErr);
  leaveListEl.innerHTML = `<div class="muted">Loading...</div>`;

  try {
    const list = await apiFetch(`/student/api/leaves/${encodeURIComponent(studentId)}`);
    myLeaves = Array.isArray(list) ? list : [];
    renderLeaves(myLeaves);
  } catch (e) {
    leaveListEl.innerHTML = "";
    showErr(leaveErr, e.message);
  }
}

function renderLeaves(list) {
  if (!list.length) {
    leaveListEl.innerHTML = `<div class="muted">No leave requests yet.</div>`;
    return;
  }

  leaveListEl.innerHTML = list.map(l => {
    const cls = statusClass(l.status);
    const viewed = !!l.teacherViewed;

    const subject = l.subjectName || l.subject || "—";
    const teacher = l.teacherName || l.teacherId || "—";
    const from = l.fromDate || "—";
    const to = l.toDate || "—";
    const purpose = l.purpose || "—";
    const reason = l.description || l.reason || "—";
    const remark = l.teacherRemark || "";

    return `
      <div class="leave-card ${cls}">
        <span class="leave-status ${cls}">${statusLabel(l.status, viewed)} • ${teacher}</span>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Date:</strong> ${from} to ${to}</p>
        <p><strong>Purpose:</strong> ${purpose}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        ${remark ? `<p><strong>Teacher Remark:</strong> ${remark}</p>` : ``}
      </div>
    `;
  }).join("");
}

// ---------------------------
// Submit leave (same payload + same endpoint)
// ---------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setFormErr("");

  try {
    if (!selectedTeacher?.teacherId) throw new Error("Teacher not selected");
    if (!selectedTeacher?.subjectName) throw new Error("Subject not selected");

    const fromDate = $("fromDate").value;
    const toDate = $("toDate").value;
    const purpose = $("purpose").value.trim();
    const description = $("desc").value.trim();

    if (!fromDate) throw new Error("From date required");
    if (!toDate) throw new Error("To date required");
    if (fromDate > toDate) throw new Error("From date must be <= To date");
    if (!purpose) throw new Error("Purpose required");
    if (!description) throw new Error("Description required");

    const payload = {
      studentId,
      teacherId: selectedTeacher.teacherId,
      subjectName: selectedTeacher.subjectName,
      fromDate,
      toDate,
      purpose,
      description
    };

    await apiFetch("/student/api/leaves", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    closeModal();
    await loadLeaves();
    alert("Leave applied successfully ✅");
  } catch (err) {
    setFormErr(err.message || String(err));
  }
});

// ---------------------------
// Refresh buttons
// ---------------------------
btnRefreshTeachers.addEventListener("click", loadTeachers);
btnRefreshLeaves.addEventListener("click", loadLeaves);

// ---------------------------
// Init
// ---------------------------
loadTeachers();
loadLeaves();
