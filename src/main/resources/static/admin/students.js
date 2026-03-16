console.log("✅ students.js loaded");

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

// UI refs
const studentsBody = document.getElementById("studentsBody");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");

// ✅ new filters
const classFilter = document.getElementById("classFilter");
const sectionFilter = document.getElementById("sectionFilter");

const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const openAddBtn = document.getElementById("openAddBtn");

const form = document.getElementById("studentForm");
const formError = document.getElementById("formError");
const saveBtn = document.getElementById("saveBtn");

const fields = [
  "studentId","fullName","dateOfBirth","phoneNumber","parentPhoneNumber","otherNumber",
  "address","standard","section","academicYear","fatherName","motherName","fatherOccupation",
  "studentEmailId","parentEmailId","profileUrl","gender","caste","religion"
];

const el = Object.fromEntries(fields.map(id => [id, document.getElementById(id)]));
const activeEl = document.getElementById("active");

let mode = "add";
let editStudentId = "";

// full list + filters
let allStudents = [];
let currentQuery = "";
let currentClassFilter = "";
let currentSectionFilter = "";

// ----------------------
// Standard label helper
// ----------------------
function standardLabel(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return String(n);
}

// ----------------------
// Modal
// ----------------------
function openModal(type, student) {
  mode = type;
  formError.hidden = true;

  if (type === "add") {
    modalTitle.textContent = "Add Student";
    saveBtn.textContent = "Create";
    editStudentId = "";
    fields.forEach(k => el[k].value = "");
    activeEl.checked = true;
    el.studentId.disabled = false;
  } else {
    modalTitle.textContent = `Edit Student (${student.studentId})`;
    saveBtn.textContent = "Update";
    editStudentId = student.studentId;

    el.studentId.value = student.studentId || "";
    el.fullName.value = student.fullName || "";
    el.dateOfBirth.value = student.dateOfBirth || "";
    el.phoneNumber.value = student.phoneNumber || "";
    el.parentPhoneNumber.value = student.parentPhoneNumber || "";
    el.otherNumber.value = student.otherNumber || "";
    el.address.value = student.address || "";
    el.standard.value = student.standard ?? "";
    el.section.value = student.section || "";
    el.academicYear.value = student.academicYear || "";
    el.fatherName.value = student.fatherName || "";
    el.motherName.value = student.motherName || "";
    el.fatherOccupation.value = student.fatherOccupation || "";
    el.studentEmailId.value = student.studentEmailId || "";
    el.parentEmailId.value = student.parentEmailId || "";
    el.profileUrl.value = student.profileUrl || "";
    el.gender.value = student.gender || "";
    el.caste.value = student.caste || "";
    el.religion.value = student.religion || "";
    activeEl.checked = !!student.active;

    el.studentId.disabled = true;
  }

  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

// ----------------------
// Helpers
// ----------------------
function escapeHtml(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cleanStr(v) {
  const t = String(v ?? "").trim();
  return t === "" ? null : t;
}

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function extractStdNumber(q) {
  const m = String(q ?? "").match(/-?\d+/);
  return m ? Number(m[0]) : null;
}

function getInitials(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function profilePhotoHtml(student) {
  const url = String(student.profileUrl ?? "").trim();
  if (url) {
    return `
      <div class="student-photo">
        <img
          src="${escapeHtml(url)}"
          alt="${escapeHtml(student.fullName || "Student Photo")}"
          onerror="this.closest('.student-photo').innerHTML='${escapeHtml(getInitials(student.fullName || "S"))}' ; this.closest('.student-photo').classList.add('fallback');"
        />
      </div>
    `;
  }

  return `
    <div class="student-photo fallback">
      ${escapeHtml(getInitials(student.fullName || "S"))}
    </div>
  `;
}

function matchesSearch(student, qRaw) {
  const q = normalize(qRaw);
  if (!q) return true;

  const stdNum = extractStdNumber(q);
  if (stdNum !== null && Number(student.standard) === stdNum) {
    return true;
  }

  const hay = [
    student.studentId,
    student.fullName
  ].map(v => normalize(v)).join(" | ");

  return hay.includes(q);
}

function matchesClassFilter(student, classValue) {
  if (classValue === "" || classValue == null) return true;
  return Number(student.standard) === Number(classValue);
}

function matchesSectionFilter(student, sectionValue) {
  const q = normalize(sectionValue);
  if (!q) return true;
  return normalize(student.section).includes(q);
}

function renderStudents(list) {
  if (!Array.isArray(list) || list.length === 0) {
    studentsBody.innerHTML = `<tr><td colspan="5" class="muted">No students found</td></tr>`;
    return;
  }

  studentsBody.innerHTML = list.map(s => `
    <tr>
      <td>
        <div class="student-cell">
          ${profilePhotoHtml(s)}
          <div class="student-meta">
            <div class="student-id">${escapeHtml(s.studentId)}</div>
            <div class="student-name">${escapeHtml(s.fullName || "")}</div>
          </div>
        </div>
      </td>

      <td>
        <span class="class-pill">${escapeHtml(standardLabel(s.standard))}</span>
      </td>

      <td>
        <span class="section-pill">${escapeHtml(s.section || "")}</span>
      </td>

      <td>
        <span class="status-pill ${s.active ? "active" : "inactive"}">
          ${s.active ? "Active" : "Inactive"}
        </span>
      </td>

      <td>
        <div class="actions-cell">
          <button class="btn small" data-edit="${escapeHtml(s.studentId)}" type="button">Edit</button>
          <button class="btn small danger" data-del="${escapeHtml(s.studentId)}" type="button">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function applyFilter() {
  const filtered = allStudents.filter(student =>
    matchesClassFilter(student, currentClassFilter) &&
    matchesSectionFilter(student, currentSectionFilter) &&
    matchesSearch(student, currentQuery)
  );

  renderStudents(filtered);
}

// small debounce
let tmr = null;
function setSearchDebounced(v) {
  clearTimeout(tmr);
  tmr = setTimeout(() => {
    currentQuery = v;
    applyFilter();
  }, 180);
}

// ----------------------
// Data
// ----------------------
async function loadStudents() {
  studentsBody.innerHTML = `<tr><td colspan="5" class="muted">Loading...</td></tr>`;
  try {
    const list = await fetchJson("/admin/students");
    allStudents = Array.isArray(list) ? list : [];
    applyFilter();
  } catch (e) {
    console.error(e);
    studentsBody.innerHTML = `<tr><td colspan="5" class="muted">Failed to load students</td></tr>`;
    alert(e.message || "Failed to load students");
  }
}

// ----------------------
// Events
// ----------------------
refreshBtn.addEventListener("click", loadStudents);

searchInput.addEventListener("input", (e) => {
  setSearchDebounced(e.target.value);
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentQuery = "";
  applyFilter();
  searchInput.focus();
});

// ✅ class dropdown auto filter
if (classFilter) {
  classFilter.addEventListener("change", (e) => {
    currentClassFilter = e.target.value;
    applyFilter();
  });
}

// ✅ section input auto filter
if (sectionFilter) {
  sectionFilter.addEventListener("input", (e) => {
    currentSectionFilter = e.target.value;
    applyFilter();
  });
}

openAddBtn.addEventListener("click", () => openModal("add", null));

closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

// click outside modal closes it
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// ESC closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

// table actions
studentsBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const sidEdit = btn.getAttribute("data-edit");
  const sidDel = btn.getAttribute("data-del");

  if (sidEdit) {
    try {
      const student = await fetchJson(`/admin/students/${sidEdit}`);
      openModal("edit", student);
    } catch (err) {
      alert(err.message || "Failed to load student");
    }
    return;
  }

  if (sidDel) {
    if (!confirm(`Delete student ${sidDel}?`)) return;
    try {
      const msg = await fetchJson(`/admin/students/${sidDel}`, { method: "DELETE" });
      alert(typeof msg === "string" ? msg : "Deleted");
      loadStudents();
    } catch (err) {
      alert(err.message || "Delete failed");
    }
  }
});

// form submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const payload = {
    studentId: cleanStr(el.studentId.value),
    fullName: cleanStr(el.fullName.value),
    dateOfBirth: cleanStr(el.dateOfBirth.value),
    phoneNumber: cleanStr(el.phoneNumber.value),
    parentPhoneNumber: cleanStr(el.parentPhoneNumber.value),
    otherNumber: cleanStr(el.otherNumber.value),

    address: cleanStr(el.address.value),
    standard: el.standard.value !== "" ? Number(el.standard.value) : null,
    section: cleanStr(el.section.value),
    academicYear: cleanStr(el.academicYear.value),

    fatherName: cleanStr(el.fatherName.value),
    motherName: cleanStr(el.motherName.value),
    fatherOccupation: cleanStr(el.fatherOccupation.value),

    studentEmailId: cleanStr(el.studentEmailId.value),
    parentEmailId: cleanStr(el.parentEmailId.value),

    profileUrl: cleanStr(el.profileUrl.value),

    gender: cleanStr(el.gender.value),
    caste: cleanStr(el.caste.value),
    religion: cleanStr(el.religion.value),
    active: activeEl.checked
  };

  if (!payload.fullName) return showFormError("Full Name is required");
  if (mode === "add" && !payload.studentId) return showFormError("Student ID is required");

  if (payload.standard === null || Number.isNaN(payload.standard)) {
    return showFormError("Standard is required");
  }

  if (payload.standard < -2 || payload.standard > 12) {
    return showFormError("Standard must be between -2 and 12 (-2=Nursery, -1=LKG, 0=UKG)");
  }

  if (!payload.section) return showFormError("Section is required");

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = mode === "add" ? "Creating..." : "Updating...";

    if (mode === "add") {
      const msg = await fetchJson("/admin/students", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      alert(typeof msg === "string" ? msg : "Student created");
    } else {
      const msg = await fetchJson(`/admin/students/${editStudentId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      alert(typeof msg === "string" ? msg : "Student updated");
    }

    closeModal();
    loadStudents();
  } catch (err) {
    console.error(err);
    showFormError(err.message || "Save failed");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = mode === "add" ? "Create" : "Update";
  }
});

// init
closeModal();
loadStudents();