console.log("✅ admin/teachers.js loaded");

/* -----------------------------
   SESSION (Admin) + Basic Auth
------------------------------ */
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

function requireAdminSessionOrRedirect() {
  const s = getSession();
  const tok = normalizeToken(s.basicToken);
  if (!s.username || !tok || String(s.role || "").toUpperCase() !== "ADMIN") {
    alert("Session expired. Please login again.");
    window.location.href = "/login/admin.html";
    throw new Error("No admin session");
  }
  if (tok !== s.basicToken) {
    s.basicToken = tok;
    localStorage.setItem("smp_session", JSON.stringify(s));
  }
  return { ...s, basicToken: tok };
}

const session = requireAdminSessionOrRedirect();

function authHeaders(json = true) {
  const h = { Authorization: `Basic ${session.basicToken}` };
  if (json) h["Content-Type"] = "application/json";
  return h;
}

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { ...(opts.headers || {}), ...authHeaders(opts.json !== false) }
  });

  if (res.status === 401) {
    localStorage.removeItem("smp_session");
    alert("Session expired. Please login again.");
    window.location.href = "/login/admin.html";
    throw new Error("Unauthorized (401)");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }

  const text = await res.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

/* -----------------------------
   DOM
------------------------------ */
const adminPill = document.getElementById("adminPill");
adminPill.textContent = session.username || "ADMIN";

document.getElementById("btnBack").addEventListener("click", () => window.history.back());

const btnOpenAdd = document.getElementById("btnOpenAdd");
const btnRefresh = document.getElementById("btnRefresh");
const searchBox = document.getElementById("searchBox");
const teachersTbody = document.getElementById("teachersTbody");

const teacherEmpty = document.getElementById("teacherEmpty");
const teacherPanel = document.getElementById("teacherPanel");

const tAvatar = document.getElementById("tAvatar");
const tName = document.getElementById("tName");
const tIdLine = document.getElementById("tIdLine");
const tMobile = document.getElementById("tMobile");
const tEmail = document.getElementById("tEmail");
const tDob = document.getElementById("tDob");
const tExp = document.getElementById("tExp");
const tGender = document.getElementById("tGender");
const tReligion = document.getElementById("tReligion");
const tAddress = document.getElementById("tAddress");
const tAadhaar = document.getElementById("tAadhaar");
const tStatus = document.getElementById("tStatus");

const assignmentsTbody = document.getElementById("assignmentsTbody");
const assignError = document.getElementById("assignError");

const btnEditSelected = document.getElementById("btnEditSelected");
const btnDeleteSelected = document.getElementById("btnDeleteSelected");
const btnOpenAssign = document.getElementById("btnOpenAssign");

/* Modal - Teacher */
const teacherModal = document.getElementById("teacherModal");
const teacherModalTitle = document.getElementById("teacherModalTitle");
const teacherModalSub = document.getElementById("teacherModalSub");
const teacherModalClose = document.getElementById("teacherModalClose");
const btnCancelTeacher = document.getElementById("btnCancelTeacher");
const teacherForm = document.getElementById("teacherForm");
const formError = document.getElementById("formError");
const btnAddRow = document.getElementById("btnAddRow");
const assignRows = document.getElementById("assignRows");

const fTeacherId = document.getElementById("fTeacherId");
const fFullName = document.getElementById("fFullName");
const fMobile = document.getElementById("fMobile");
const fEmail = document.getElementById("fEmail");
const fDob = document.getElementById("fDob");
const fExp = document.getElementById("fExp");
const fAadhaar = document.getElementById("fAadhaar");
const fGender = document.getElementById("fGender");
const fReligion = document.getElementById("fReligion");
const fAddress = document.getElementById("fAddress");
const fProfileUrl = document.getElementById("fProfileUrl");
const fActive = document.getElementById("fActive");

/* Modal - Assign */
const assignModal = document.getElementById("assignModal");
const assignModalClose = document.getElementById("assignModalClose");
const btnCancelAssign = document.getElementById("btnCancelAssign");
const assignForm = document.getElementById("assignForm");
const assignFormError = document.getElementById("assignFormError");
const aStandard = document.getElementById("aStandard");
const aSection = document.getElementById("aSection");
const aStandardSubject = document.getElementById("aStandardSubject");

// ✅ Allow Nursery/LKG/UKG + Classes up to 12
const MIN_STD = -2;
const MAX_STD = 12;

/* -----------------------------
   State
------------------------------ */
let teachers = [];              // TeacherRow list
let selectedTeacher = null;     // TeacherDetails (IMPORTANT)
let editingMode = false;

function show(el) { el.classList.remove("hidden"); }
function hide(el) { el.classList.add("hidden"); }

function setError(el, msg) {
  if (!msg) { hide(el); el.textContent = ""; return; }
  el.textContent = msg;
  show(el);
}

function safe(v) { return (v === null || v === undefined || v === "") ? "—" : String(v); }

function statusBadge(active) {
  return active ? `<span class="badge ok">ACTIVE</span>` : `<span class="badge off">INACTIVE</span>`;
}

function teacherRow(t) {
  return `
    <tr data-id="${t.teacherId}">
      <td><b>${safe(t.teacherId)}</b></td>
      <td>${safe(t.fullName)}</td>
      <td>${safe(t.mobileNumber)}</td>
      <td>${safe(t.emailId)}</td>
      <td>${statusBadge(t.active !== false)}</td>
      <td class="right">
        <button class="btn" data-act="view">View</button>
        <button class="btn" data-act="edit">Edit</button>
        <button class="btn danger" data-act="del">Delete</button>
      </td>
    </tr>
  `;
}

/* -----------------------------
   API calls
------------------------------ */
async function fetchTeachers() {
  return apiFetch("/admin/teachers", { method: "GET", json: false });
}

async function fetchTeacherDetails(teacherId) {
  return apiFetch(`/admin/teachers/${encodeURIComponent(teacherId)}`, { method: "GET", json: false });
}

async function createTeacher(payload) {
  return apiFetch("/admin/teachers", { method: "POST", body: JSON.stringify(payload) });
}

async function updateTeacher(teacherId, payload) {
  return apiFetch(`/admin/teachers/${encodeURIComponent(teacherId)}`, { method: "PUT", body: JSON.stringify(payload) });
}

async function deleteTeacher(teacherId) {
  return apiFetch(`/admin/teachers/${encodeURIComponent(teacherId)}`, { method: "DELETE", json: false });
}

async function fetchAssignmentsForTeacher(teacherId) {
  return apiFetch(`/admin/teachers/${encodeURIComponent(teacherId)}/assignments`, { method: "GET", json: false });
}

async function deleteAssignment(teacherId, assignmentId) {
  return apiFetch(`/admin/teachers/${encodeURIComponent(teacherId)}/assignments/${encodeURIComponent(assignmentId)}`, {
    method: "DELETE",
    json: false
  });
}

async function fetchStandardSubjects(standard) {
  return apiFetch(`/admin/subjects/standard/${standard}`, { method: "GET", json: false });
}

async function assignCourse(teacherId, standardSubjectId, section) {
  const payload = { teacherId, standardSubjectId, section };
  return apiFetch("/admin/teachers/assign-course", { method: "POST", body: JSON.stringify(payload) });
}

/* -----------------------------
   Render helpers
------------------------------ */
function renderTeacherList(list) {
  if (!list || list.length === 0) {
    teachersTbody.innerHTML = `<tr><td colspan="6" class="muted">No teachers found.</td></tr>`;
    return;
  }
  teachersTbody.innerHTML = list.map(teacherRow).join("");
}

function applySearch() {
  const q = (searchBox.value || "").trim().toLowerCase();
  if (!q) return renderTeacherList(teachers);

  const filtered = teachers.filter(t => {
    const blob = `${t.teacherId||""} ${t.fullName||""} ${t.mobileNumber||""} ${t.emailId||""}`.toLowerCase();
    return blob.includes(q);
  });
  renderTeacherList(filtered);
}

/* ✅ IMPORTANT: Always load TeacherDetails when selecting */
async function selectTeacherById(id) {
  try {
    const details = await fetchTeacherDetails(id);
    selectedTeacher = details;

    hide(teacherEmpty);
    show(teacherPanel);

    tAvatar.src = details.profileUrl || "https://ui-avatars.com/api/?name=Teacher&background=5b5ef7&color=fff&size=128";
    tName.textContent = safe(details.fullName);
    tIdLine.textContent = `ID: ${safe(details.teacherId)}`;

    tMobile.textContent = safe(details.mobileNumber);
    tEmail.textContent = safe(details.emailId);
    tDob.textContent = safe(details.dateOfBirth);
    tExp.textContent = safe(details.experience);
    tGender.textContent = safe(details.gender);
    tReligion.textContent = safe(details.religion);
    tAddress.textContent = safe(details.address);
    tAadhaar.textContent = safe(details.aadhaarNumber);
    tStatus.innerHTML = statusBadge(details.active !== false);

    await loadAssignments(details.teacherId);

  } catch (e) {
    alert("Unable to load teacher details: " + (e.message || e));
  }
}

async function loadAssignments(teacherId) {
  setError(assignError, "");
  assignmentsTbody.innerHTML = `<tr><td colspan="4" class="muted">Loading assignments...</td></tr>`;

  try {
    const list = await fetchAssignmentsForTeacher(teacherId);

    if (!list || list.length === 0) {
      assignmentsTbody.innerHTML = `<tr><td colspan="4" class="muted">No assignments found.</td></tr>`;
      return;
    }

    assignmentsTbody.innerHTML = list.map(a => `
      <tr data-assignment-id="${a.assignmentId}">
        <td>${safe(a.standard)}</td>
        <td>${safe(a.section)}</td>
        <td><b>${safe(a.subjectName)}</b></td>
        <td class="right">
          <button class="btn-mini danger" data-act="del-assignment">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (e) {
    assignmentsTbody.innerHTML = `<tr><td colspan="4" class="muted">Unable to load assignments.</td></tr>`;
    setError(assignError, String(e.message || e));
  }
}

/* -----------------------------
   Modal helpers
------------------------------ */
function openTeacherModal(mode, teacherDetails = null) {
  editingMode = (mode === "edit");
  teacherModalTitle.textContent = editingMode ? "Edit Teacher" : "Add Teacher";
  teacherModalSub.textContent = editingMode ? "Update teacher details." : "Create teacher + initial assignments.";
  setError(formError, "");
  assignRows.innerHTML = "";

  if (editingMode && teacherDetails) {
    fTeacherId.value = teacherDetails.teacherId || "";
    fTeacherId.disabled = true;

    fFullName.value = teacherDetails.fullName || "";
    fMobile.value = teacherDetails.mobileNumber || "";
    fEmail.value = teacherDetails.emailId || "";
    fDob.value = teacherDetails.dateOfBirth ? String(teacherDetails.dateOfBirth).slice(0,10) : "";
    fExp.value = teacherDetails.experience ?? "";
    fAadhaar.value = teacherDetails.aadhaarNumber || "";
    fGender.value = teacherDetails.gender || "";
    fReligion.value = teacherDetails.religion || "";
    fAddress.value = teacherDetails.address || "";
    fProfileUrl.value = teacherDetails.profileUrl || "";
    fActive.checked = teacherDetails.active !== false;

  } else {
    teacherForm.reset();
    fTeacherId.disabled = false;
    fActive.checked = true;
    addAssignmentRow();
  }

  show(teacherModal);
}

function closeTeacherModal() { hide(teacherModal); }

function openAssignModal() {
  if (!selectedTeacher) return;
  setError(assignFormError, "");
  aStandard.value = "";
  aSection.value = "";
  aStandardSubject.innerHTML = `<option value="">Select standard first…</option>`;
  show(assignModal);

  // ✅ Make sure browser validation allows -2..12 (if HTML has min/max)
  if (aStandard) {
    aStandard.min = String(MIN_STD);
    aStandard.max = String(MAX_STD);
  }
}
function closeAssignModal() { hide(assignModal); }

teacherModalClose.addEventListener("click", closeTeacherModal);
btnCancelTeacher.addEventListener("click", closeTeacherModal);

assignModalClose.addEventListener("click", closeAssignModal);
btnCancelAssign.addEventListener("click", closeAssignModal);

/* -----------------------------
   Assignment rows (create teacher)
------------------------------ */
function makeRowEl() {
  const row = document.createElement("div");
  row.className = "row";

  // ✅ UPDATED min/max: allow -2..12
  row.innerHTML = `
    <input class="input" type="number" min="${MIN_STD}" max="${MAX_STD}" placeholder="Standard (-2..12)" />
    <input class="input" maxlength="5" placeholder="Section" />
    <select class="input">
      <option value="">Select standard first…</option>
    </select>
    <button type="button" class="remove" title="Remove">✕</button>
  `;

  const [stdEl, secEl, subjEl] = row.querySelectorAll("input, select");
  row.querySelector(".remove").addEventListener("click", () => row.remove());

  stdEl.addEventListener("change", async () => {
    const std = parseInt(stdEl.value, 10);

    // ✅ allow -2, -1, 0, 1..12
    if (Number.isNaN(std) || std < MIN_STD || std > MAX_STD) {
      subjEl.innerHTML = `<option value="">Enter standard -2..12</option>`;
      return;
    }

    subjEl.innerHTML = `<option value="">Loading…</option>`;
    try {
      const list = await fetchStandardSubjects(std);
      subjEl.innerHTML =
        `<option value="">Select subject…</option>` +
        (list || []).map(x => {
          const standardSubjectId = x.standardSubjectId ?? x.id ?? null;
          const label = x.subjectName || "SUBJECT";
          return `<option value="${standardSubjectId || ""}">${label}</option>`;
        }).join("");
    } catch {
      subjEl.innerHTML = `<option value="">Unable to load subjects</option>`;
    }
  });

  return row;
}

function addAssignmentRow() {
  assignRows.appendChild(makeRowEl());
}
btnAddRow.addEventListener("click", addAssignmentRow);

/* -----------------------------
   Events
------------------------------ */
btnOpenAdd.addEventListener("click", () => openTeacherModal("add"));
btnRefresh.addEventListener("click", () => init());
searchBox.addEventListener("input", applySearch);

teachersTbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const tr = e.target.closest("tr");
  const id = tr?.dataset?.id;
  if (!id) return;

  const act = btn.dataset.act;

  if (act === "view") {
    await selectTeacherById(id);
  }

  if (act === "edit") {
    await selectTeacherById(id);
    openTeacherModal("edit", selectedTeacher);
  }

  if (act === "del") {
    if (!confirm(`Delete teacher ${id}?`)) return;
    try {
      await deleteTeacher(id);
      await init();

      if (selectedTeacher?.teacherId === id) {
        selectedTeacher = null;
        hide(teacherPanel);
        show(teacherEmpty);
      }

      alert("Teacher deleted.");
    } catch (err) {
      alert("Delete failed: " + (err.message || err));
    }
  }
});

btnEditSelected.addEventListener("click", () => {
  if (!selectedTeacher) return;
  openTeacherModal("edit", selectedTeacher);
});

btnDeleteSelected.addEventListener("click", async () => {
  if (!selectedTeacher) return;
  const id = selectedTeacher.teacherId;
  if (!confirm(`Delete teacher ${id}?`)) return;

  try {
    await deleteTeacher(id);
    await init();
    selectedTeacher = null;
    hide(teacherPanel);
    show(teacherEmpty);
    alert("Teacher deleted.");
  } catch (err) {
    alert("Delete failed: " + (err.message || err));
  }
});

btnOpenAssign.addEventListener("click", openAssignModal);

assignmentsTbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  if (btn.dataset.act !== "del-assignment") return;

  if (!selectedTeacher) return;

  const tr = e.target.closest("tr");
  const assignmentId = tr?.dataset?.assignmentId;
  if (!assignmentId) return;

  const teacherId = selectedTeacher.teacherId;

  if (!confirm(`Delete this assignment (${assignmentId})?`)) return;

  try {
    btn.disabled = true;
    await deleteAssignment(teacherId, assignmentId);
    await loadAssignments(teacherId);
  } catch (err) {
    alert("Delete assignment failed: " + (err.message || err));
  } finally {
    btn.disabled = false;
  }
});

/* assign modal */
aStandard.addEventListener("change", async () => {
  const std = parseInt(aStandard.value, 10);

  // ✅ allow -2..12
  if (Number.isNaN(std) || std < MIN_STD || std > MAX_STD) {
    aStandardSubject.innerHTML = `<option value="">Enter standard -2..12</option>`;
    return;
  }

  aStandardSubject.innerHTML = `<option value="">Loading…</option>`;
  try {
    const list = await fetchStandardSubjects(std);
    aStandardSubject.innerHTML =
      `<option value="">Select subject…</option>` +
      (list || []).map(x => {
        const standardSubjectId = x.standardSubjectId ?? x.id ?? null;
        const label = x.subjectName || "SUBJECT";
        return `<option value="${standardSubjectId || ""}">${label}</option>`;
      }).join("");
  } catch {
    aStandardSubject.innerHTML = `<option value="">Unable to load subjects</option>`;
  }
});

teacherForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(formError, "");

  const payload = {
    teacherId: fTeacherId.value.trim(),
    fullName: fFullName.value.trim(),
    mobileNumber: fMobile.value.trim() || null,
    emailId: fEmail.value.trim() || null,
    address: fAddress.value.trim() || null,
    profileUrl: fProfileUrl.value.trim() || null,
    dateOfBirth: fDob.value ? fDob.value : null,
    experience: fExp.value ? Number(fExp.value) : null,
    aadhaarNumber: fAadhaar.value.trim() || null,
    gender: fGender.value || null,
    religion: fReligion.value.trim() || null,
    active: !!fActive.checked
  };

  try {
    if (!payload.teacherId) throw new Error("teacherId is required");
    if (!payload.fullName) throw new Error("fullName is required");

    if (!editingMode) {
      const rows = [...assignRows.querySelectorAll(".row")];
      const standards = rows.map(r => {
        const inputs = r.querySelectorAll("input, select");
        const standard = parseInt(inputs[0].value, 10);
        const section = (inputs[1].value || "").trim();
        const standardSubjectId = inputs[2].value ? Number(inputs[2].value) : null;
        return { standard, section, standardSubjectId };
      });

      if (!standards.length) throw new Error("At least one assignment row is required");

      for (const s of standards) {
        if (Number.isNaN(s.standard) || s.standard < MIN_STD || s.standard > MAX_STD) {
          throw new Error("Assignment standard must be between -2 and 12");
        }
        if (!s.section) throw new Error("Assignment section is required");
        if (!s.standardSubjectId) throw new Error("Assignment subject is required");
      }

      payload.standards = standards;

      const res = await createTeacher(payload);
      closeTeacherModal();
      await init();
      alert(String(res || "Teacher created successfully."));
      await selectTeacherById(payload.teacherId);
    } else {
      const res = await updateTeacher(payload.teacherId, payload);
      closeTeacherModal();
      await init();
      alert(String(res || "Teacher updated successfully."));
      await selectTeacherById(payload.teacherId);
    }
  } catch (err) {
    setError(formError, err.message || String(err));
  }
});

assignForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setError(assignFormError, "");

  try {
    if (!selectedTeacher) throw new Error("No teacher selected");

    const teacherId = selectedTeacher.teacherId;
    const std = parseInt(aStandard.value, 10);
    const section = (aSection.value || "").trim();
    const standardSubjectId = aStandardSubject.value ? Number(aStandardSubject.value) : null;

    if (Number.isNaN(std) || std < MIN_STD || std > MAX_STD) throw new Error("Standard must be between -2 and 12");
    if (!section) throw new Error("Section is required");
    if (!standardSubjectId) throw new Error("Subject is required");

    const res = await assignCourse(teacherId, standardSubjectId, section);
    closeAssignModal();
    await loadAssignments(teacherId);
    alert(String(res || "Assigned successfully."));
  } catch (err) {
    setError(assignFormError, err.message || String(err));
  }
});

/* -----------------------------
   Init
------------------------------ */
async function init() {
  teachersTbody.innerHTML = `<tr><td colspan="6" class="muted">Loading...</td></tr>`;
  try {
    const data = await fetchTeachers();
    teachers = Array.isArray(data) ? data : (data ? [data] : []);
    renderTeacherList(teachers);
    applySearch();
  } catch (e) {
    teachersTbody.innerHTML = `
      <tr>
        <td colspan="6" class="muted">
          Unable to load teachers.<br/>
          ${String(e.message || e)}
        </td>
      </tr>
    `;
  }
}
init();
