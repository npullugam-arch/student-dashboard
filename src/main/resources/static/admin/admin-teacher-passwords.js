console.log("✅ admin-teacher-passwords.js loaded");

// Admin session
const session = JSON.parse(localStorage.getItem("smp_session") || "{}");
if (!session.username || !session.basicToken || session.role !== "ADMIN") {
  alert("Admin session missing. Please login again.");
  window.location.href = "/login/admin.html";
}

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

function toast(msg) {
  const t = document.createElement("div");
  t.className = "tp-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

function avatarUrl(nameOrId) {
  const name = String(nameOrId || "Teacher").trim().replace(/\s+/g, "+");
  return `https://ui-avatars.com/api/?name=${name}&size=160&background=667eea&color=fff&bold=true`;
}

// UI refs
const btnLoad = document.getElementById("btnLoad");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

const list = document.getElementById("list");
const countPill = document.getElementById("countPill");
const infoPill = document.getElementById("infoPill");

const btnBack = document.getElementById("btnBack");
const btnLogout = document.getElementById("btnLogout");

// Modal refs
const rpBackdrop = document.getElementById("rpBackdrop");
const rpClose = document.getElementById("rpClose");
const rpCancel = document.getElementById("rpCancel");
const rpUpdate = document.getElementById("rpUpdate");

const rpSub = document.getElementById("rpSub");
const rpNew = document.getElementById("rpNew");
const rpConfirm = document.getElementById("rpConfirm");
const rpErr = document.getElementById("rpErr");

// State
let allTeachers = [];
let currentQuery = "";
let selectedTeacher = null;

// ✅ CHANGE THIS IF YOUR ENDPOINT IS DIFFERENT
const TEACHERS_API = "/admin/teachers";

function rpShowErr(msg){
  rpErr.textContent = msg;
  rpErr.classList.remove("rp-hidden");
}
function rpHideErr(){
  rpErr.textContent = "";
  rpErr.classList.add("rp-hidden");
}
function openResetModal(t){
  selectedTeacher = t;
  rpHideErr();
  rpNew.value = "";
  rpConfirm.value = "";
  rpSub.textContent = `Teacher: ${t.teacherId || t.id || t.username || "—"} • ${t.fullName || "—"} • ${t.subject || "—"}`;
  rpBackdrop.classList.remove("rp-hidden");
  rpBackdrop.setAttribute("aria-hidden", "false");
  setTimeout(() => rpNew.focus(), 60);
}
function closeResetModal(){
  rpBackdrop.classList.add("rp-hidden");
  rpBackdrop.setAttribute("aria-hidden", "true");
  rpHideErr();
  selectedTeacher = null;
}

function teacherKey(t){
  // prefer teacherId field; fallback to username/id
  return String(t.teacherId || t.username || t.id || "");
}

function matchesQuery(t, qRaw) {
  const q = normalize(qRaw);
  if (!q) return true;
  const hay = [
    teacherKey(t),
    t.fullName,
    t.subject,
    t.emailId,
    t.mobileNumber
  ].map(v => normalize(v)).join(" | ");
  return hay.includes(q);
}

function applyFilter(){
  const filtered = allTeachers.filter(t => matchesQuery(t, currentQuery));
  renderList(filtered);
}

function renderList(items){
  countPill.textContent = String(items.length);

  if (!items.length) {
    list.innerHTML = `<div class="tp-empty">No teachers found.</div>`;
    return;
  }

  list.innerHTML = items.map(t => {
    const key = teacherKey(t);
    const pic = t.profileUrl ? escapeHtml(t.profileUrl) : avatarUrl(t.fullName || key);

    return `
      <div class="tcard">
        <img class="t-ava" src="${pic}" alt="Teacher Photo"/>
        <div class="t-info">
          <p class="t-name">${escapeHtml(t.fullName || "Teacher")}</p>
          <p class="t-sub">
            <span class="t-chip">ID: ${escapeHtml(key)}</span>
            <span class="t-chip">${escapeHtml(t.subject || "Subject: -")}</span>
          </p>
        </div>
        <button class="t-btn" type="button" data-reset="${escapeHtml(key)}">Update Password</button>
      </div>
    `;
  }).join("");
}

async function loadTeachers(){
  list.innerHTML = `<div class="tp-empty">Loading...</div>`;
  countPill.textContent = "0";
  infoPill.textContent = "Loading...";

  try {
    const data = await fetchJson(TEACHERS_API);
    allTeachers = Array.isArray(data) ? data : [];
    currentQuery = "";
    searchInput.value = "";
    infoPill.textContent = `Loaded: ${allTeachers.length}`;
    applyFilter();
  } catch (e) {
    console.error(e);
    infoPill.textContent = "Failed to load";
    list.innerHTML = `<div class="tp-empty">Failed to load teachers.</div>`;
    toast(e.message || "Failed to load teachers");
  }
}

async function resetPassword(){
  try {
    rpHideErr();
    if (!selectedTeacher) return;

    const p1 = (rpNew.value || "").trim();
    const p2 = (rpConfirm.value || "").trim();

    if (!p1 || !p2) return rpShowErr("Please enter password in both fields.");
    if (p1 !== p2) return rpShowErr("Passwords do not match.");
    if (p1.length < 6) return rpShowErr("Password must be at least 6 characters.");

    const teacherId = teacherKey(selectedTeacher);
    if (!teacherId) return rpShowErr("Teacher ID not found.");

    rpUpdate.disabled = true;
    rpUpdate.textContent = "Updating...";

    await fetchJson(`/admin/api/users/teachers/${encodeURIComponent(teacherId)}/reset-password`, {
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
btnLoad.addEventListener("click", loadTeachers);

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

list.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const key = btn.getAttribute("data-reset");
  if (!key) return;

  const t = allTeachers.find(x => teacherKey(x) === key);
  if (!t) return;

  openResetModal(t);
});

rpClose.addEventListener("click", closeResetModal);
rpCancel.addEventListener("click", closeResetModal);
rpUpdate.addEventListener("click", resetPassword);

rpBackdrop.addEventListener("click", (e) => {
  if (e.target && e.target.id === "rpBackdrop") closeResetModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !rpBackdrop.classList.contains("rp-hidden")) closeResetModal();
});

// Back + Logout
btnBack.addEventListener("click", () => {
  window.location.href = "/admin/index.html";
});

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/admin.html";
});

// Init
countPill.textContent = "0";
infoPill.textContent = "Not loaded";