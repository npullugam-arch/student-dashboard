console.log("✅ admin-passwords.js loaded");

// Admin session (same pattern as your students.js)
const session = JSON.parse(localStorage.getItem("smp_session") || "{}");
if (!session.username || !session.basicToken || session.role !== "ADMIN") {
  alert("Admin session missing. Please login again.");
  window.location.href = "/login/admin.html";
}

// Helpers
function authHeaders() {
  return {
    Authorization: `Basic ${session.basicToken}`,
    "Content-Type": "application/json",
  };
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (res.status === 401) {
    localStorage.removeItem("smp_session");
    alert("Session expired. Please login again.");
    window.location.href = "/login/admin.html";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const ct = res.headers.get("content-type") || "";
    let msg = `HTTP ${res.status}`;
    try {
      if (ct.includes("application/json")) {
        const errObj = await res.json();
        msg = errObj.message || errObj.error || msg;
      } else {
        const txt = await res.text().catch(() => "");
        msg = txt || msg;
      }
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

function escapeHtml(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function normalize(s){ return String(s ?? "").toLowerCase().trim(); }

function standardLabel(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return String(v ?? "");
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return `Class ${n}`;
}

function toast(msg) {
  const t = document.createElement("div");
  t.className = "ap-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function avatarUrl(nameOrId) {
  const name = String(nameOrId || "Student").trim().replace(/\s+/g, "+");
  return `https://ui-avatars.com/api/?name=${name}&size=160&background=667eea&color=fff&bold=true`;
}

// UI refs
const stdSel = document.getElementById("standard");
const sectionInp = document.getElementById("section");
const btnLoad = document.getElementById("btnLoad");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const list = document.getElementById("list");
const countPill = document.getElementById("countPill");
const filterPill = document.getElementById("filterPill");

const btnBack = document.getElementById("btnBack");
const btnLogout = document.getElementById("btnLogout");

// Reset modal refs
const rpBackdrop = document.getElementById("rpBackdrop");
const rpClose = document.getElementById("rpClose");
const rpCancel = document.getElementById("rpCancel");
const rpUpdate = document.getElementById("rpUpdate");

const rpSub = document.getElementById("rpSub");
const rpNew = document.getElementById("rpNew");
const rpConfirm = document.getElementById("rpConfirm");
const rpErr = document.getElementById("rpErr");

// State
let allStudents = [];
let currentQuery = "";
let selectedStudent = null;

// Modal helpers
function rpShowErr(msg){
  rpErr.textContent = msg;
  rpErr.classList.remove("rp-hidden");
}
function rpHideErr(){
  rpErr.textContent = "";
  rpErr.classList.add("rp-hidden");
}
function openResetModal(student){
  selectedStudent = student;
  rpHideErr();
  rpNew.value = "";
  rpConfirm.value = "";
  rpSub.textContent = `Student: ${student.studentId} • ${student.fullName || "—"} • ${standardLabel(student.standard)}-${student.section || ""}`;
  rpBackdrop.classList.remove("rp-hidden");
  rpBackdrop.setAttribute("aria-hidden", "false");
  setTimeout(() => rpNew.focus(), 60);
}
function closeResetModal(){
  rpBackdrop.classList.add("rp-hidden");
  rpBackdrop.setAttribute("aria-hidden", "true");
  rpHideErr();
  selectedStudent = null;
}

function matchesQuery(student, qRaw) {
  const q = normalize(qRaw);
  if (!q) return true;
  const hay = [
    student.studentId,
    student.fullName,
    student.section,
    student.standard
  ].map(v => normalize(v)).join(" | ");
  return hay.includes(q);
}

function applyFilter(){
  const filtered = allStudents.filter(s => matchesQuery(s, currentQuery));
  renderList(filtered);
}

function renderList(items){
  countPill.textContent = String(items.length);

  if (!items.length) {
    list.innerHTML = `<div class="ap-empty">No students found.</div>`;
    return;
  }

  list.innerHTML = items.map(s => {
    const pic = s.profileUrl ? escapeHtml(s.profileUrl) : avatarUrl(s.fullName || s.studentId);
    return `
      <div class="stu">
        <img class="stu-ava" src="${pic}" alt="Profile"/>
        <div class="stu-info">
          <p class="stu-name">${escapeHtml(s.fullName || "Student")}</p>
          <p class="stu-sub">
            <span class="stu-chip">ID: ${escapeHtml(s.studentId)}</span>
            <span class="stu-chip">${escapeHtml(standardLabel(s.standard))} - ${escapeHtml(s.section || "")}</span>
          </p>
        </div>
        <button class="stu-btn" type="button" data-reset="${escapeHtml(s.studentId)}">Update Password</button>
      </div>
    `;
  }).join("");
}

async function loadStudents(){
  const standard = stdSel.value;
  const section = (sectionInp.value || "").trim();

  if (standard === "" || section === "") {
    toast("⚠️ Please select Class and enter Section");
    return;
  }

  filterPill.textContent = `Filter: ${standardLabel(standard)} - ${section.toUpperCase()}`;

  list.innerHTML = `<div class="ap-empty">Loading...</div>`;
  countPill.textContent = "0";

  try {
    // ✅ Using your existing endpoint (same as students.js)
    // We'll load all, then filter by standard+section in UI.
    const students = await fetchJson("/admin/students");
    const stdNum = Number(standard);

    allStudents = Array.isArray(students) ? students.filter(s => {
      const sStd = Number(s.standard);
      const sSec = String(s.section || "").trim().toUpperCase();
      return sStd === stdNum && sSec === section.toUpperCase();
    }) : [];

    currentQuery = "";
    searchInput.value = "";
    applyFilter();
  } catch (e) {
    console.error(e);
    list.innerHTML = `<div class="ap-empty">Failed to load students.</div>`;
    toast(e.message || "Failed to load students");
  }
}

async function resetPassword(){
  try {
    rpHideErr();
    if (!selectedStudent) return;

    const p1 = (rpNew.value || "").trim();
    const p2 = (rpConfirm.value || "").trim();

    if (!p1 || !p2) return rpShowErr("Please enter password in both fields.");
    if (p1 !== p2) return rpShowErr("Passwords do not match.");
    if (p1.length < 6) return rpShowErr("Password must be at least 6 characters.");

    rpUpdate.disabled = true;
    rpUpdate.textContent = "Updating...";

    // ✅ Backend endpoint created earlier:
    // POST /admin/api/users/{studentUsername}/reset-password
    // studentUsername = studentId (your User.username)
    await fetchJson(`/admin/api/users/${encodeURIComponent(selectedStudent.studentId)}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword: p1 })
    });

    closeResetModal();
    toast("✅ Password updated successfully!");
  } catch (e) {
    console.error(e);
    rpShowErr(e.message || "Failed to update password.");
  } finally {
    rpUpdate.disabled = false;
    rpUpdate.textContent = "Update Password";
  }
}

// Events
btnLoad.addEventListener("click", loadStudents);

searchInput.addEventListener("input", (e) => {
  currentQuery = e.target.value || "";
  applyFilter();
});
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentQuery = "";
  applyFilter();
  searchInput.focus();
});

// Card button click
list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const sid = btn.getAttribute("data-reset");
  if (!sid) return;

  const student = allStudents.find(s => String(s.studentId) === String(sid));
  if (!student) return;

  openResetModal(student);
});

// Modal controls
rpClose.addEventListener("click", closeResetModal);
rpCancel.addEventListener("click", closeResetModal);
rpUpdate.addEventListener("click", resetPassword);

rpBackdrop.addEventListener("click", (e) => {
  if (e.target && e.target.id === "rpBackdrop") closeResetModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !rpBackdrop.classList.contains("rp-hidden")) closeResetModal();
});

// Back + Logout (safe)
btnBack.addEventListener("click", () => {
  // change this to your admin dashboard page if needed
  window.location.href = "/admin/index.html";
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/admin.html";
});

// Init UI
countPill.textContent = "0";