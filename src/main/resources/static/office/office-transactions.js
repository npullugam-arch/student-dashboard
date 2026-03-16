console.log("✅ office-transactions.js loaded");

// =============================
// Session + Auth (same as your office-dashboard.js)
// =============================
function getSession(){
  try{ return JSON.parse(localStorage.getItem("smp_session")||"{}"); }catch{ return {}; }
}
function normalizeToken(tok){
  if(!tok) return "";
  tok = String(tok).trim();
  if(/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i,"").trim();
  if(tok.includes(":")) tok = btoa(tok);
  return tok;
}
function requireOffice(){
  const s = getSession();
  if(!s.username || String(s.role||"").toUpperCase() !== "OFFICE"){
    alert("Session expired. Please login again.");
    window.location.href = "/login/office.html";
    throw new Error("No office session");
  }
  s.basicToken = normalizeToken(s.basicToken);
  return s;
}
const session = requireOffice();
const basicToken = session.basicToken;

function authHeaders(){
  return { Authorization:`Basic ${basicToken}`, "Content-Type":"application/json" };
}
async function fetchJson(url){
  const res = await fetch(url, { headers: authHeaders() });
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok){
    const t = await res.text().catch(()=> "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}
async function postJson(url, body){
  const res = await fetch(url, { method:"POST", headers:authHeaders(), body:JSON.stringify(body||{}) });
  const t = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(t || `HTTP ${res.status}`);
  try{ return t ? JSON.parse(t) : null; }catch{ return t; }
}
async function putJson(url, body){
  const res = await fetch(url, { method:"PUT", headers:authHeaders(), body:JSON.stringify(body||{}) });
  const t = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(t || `HTTP ${res.status}`);
  try{ return t ? JSON.parse(t) : null; }catch{ return t; }
}
async function delJson(url){
  const res = await fetch(url, { method:"DELETE", headers: authHeaders() });
  const t = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(t || `HTTP ${res.status}`);
  return t || "Deleted";
}

/** ✅ fetch student full details (uses your existing admin students endpoint) */
async function fetchStudentDetails(studentId){
  return fetchJson(`/admin/students/${encodeURIComponent(studentId)}`);
}

// =============================
// Helpers
// =============================
function money(n){ return Number(n||0).toLocaleString("en-IN"); }
function safeImgUrl(name){
  const n = (name || "Student").trim();
  return "https://ui-avatars.com/api/?name=" + encodeURIComponent(n) + "&background=667eea&color=fff&size=64";
}
function classLabel(std){
  const n = Number(std);
  if(n === -2) return "Nursery";
  if(n === -1) return "LKG";
  if(n === 0) return "UKG";
  return Number.isFinite(n) ? String(n) : "-";
}
function fmtDate(iso){
  if(!iso) return "-";
  const s = String(iso).slice(0,10);
  const p = s.split("-");
  if(p.length!==3) return s;
  return `${p[2]}-${p[1]}-${p[0]}`;
}
function isoDate(d){
  return d ? String(d).slice(0,10) : "";
}
function safeVal(v){
  return (v === null || v === undefined || String(v).trim()==="") ? "-" : String(v);
}

// ✅ NEW: normalize admin student payload to what this page needs
function getFreshName(stu){
  return stu?.fullName || stu?.studentName || stu?.name || "";
}
function getFreshPhoto(stu){
  return stu?.profileUrl || stu?.photoUrl || "";
}
function getFreshStd(stu){
  return (stu && stu.standard !== undefined) ? stu.standard : null;
}
function getFreshSection(stu){
  return (stu && stu.section !== undefined) ? stu.section : null;
}

// ✅ NEW: apply fresh admin details into left-list student (feeRow object)
function patchStudentInList(studentId, stuFull){
  const idx = allStudents.findIndex(s => String(s.studentId) === String(studentId));
  if(idx === -1) return;

  const name = getFreshName(stuFull);
  const photo = getFreshPhoto(stuFull);
  const std = getFreshStd(stuFull);
  const sec = getFreshSection(stuFull);

  // patch only what is required for UI
  if(name) allStudents[idx].studentName = name;
  if(photo) allStudents[idx].photoUrl = photo;
  if(std !== null) allStudents[idx].standard = std;
  if(sec !== null) allStudents[idx].section = sec;

  // if currently selected is this student, patch selectedStudent reference too
  if(selectedStudent && String(selectedStudent.studentId) === String(studentId)){
    if(name) selectedStudent.studentName = name;
    if(photo) selectedStudent.photoUrl = photo;
    if(std !== null) selectedStudent.standard = std;
    if(sec !== null) selectedStudent.section = sec;
  }
}

// =============================
// UI refs
// =============================
const fClass = document.getElementById("fClass");
const fSection = document.getElementById("fSection");
const q = document.getElementById("q");
const btnClear = document.getElementById("btnClear");
const btnReload = document.getElementById("btnReload");

const studentList = document.getElementById("studentList");
const errStudents = document.getElementById("errStudents");

const selTitle = document.getElementById("selTitle");
const selSub = document.getElementById("selSub");
const btnView = document.getElementById("btnView");
const btnAdd = document.getElementById("btnAdd");
const errRight = document.getElementById("errRight");

// ✅ RIGHT SIDE CONTENT ROOT (must exist in your HTML)
const rightRoot = document.getElementById("rightRoot");

// view modal
const viewModal = document.getElementById("viewModal");
const vmClose = document.getElementById("vmClose");
const vmOk = document.getElementById("vmOk");
const vmReload = document.getElementById("vmReload");
const vmSub = document.getElementById("vmSub");
const vmBody = document.getElementById("vmBody");

// edit modal
const editModal = document.getElementById("editModal");
const emClose = document.getElementById("emClose");
const emCancel = document.getElementById("emCancel");
const emSave = document.getElementById("emSave");
const emDelete = document.getElementById("emDelete");
const emSub = document.getElementById("emSub");
const emPaidDate = document.getElementById("emPaidDate");
const emPaidAmount = document.getElementById("emPaidAmount");
const emNextDue = document.getElementById("emNextDue");
const emRemarks = document.getElementById("emRemarks");
const emErr = document.getElementById("emErr");

// add modal
const addModal = document.getElementById("addModal");
const amClose = document.getElementById("amClose");
const amCancel = document.getElementById("amCancel");
const amSave = document.getElementById("amSave");
const amSub = document.getElementById("amSub");
const amPaidDate = document.getElementById("amPaidDate");
const amPaidAmount = document.getElementById("amPaidAmount");
const amNextDue = document.getElementById("amNextDue");
const amRemarks = document.getElementById("amRemarks");
const amErr = document.getElementById("amErr");

// =============================
// State
// =============================
let allStudents = [];      // from /office/api/fees/students
let selectedStudent = null;
let selectedStudentFull = null; // ✅ full student details
let currentTx = [];        // current tx list for selected student
let editingTx = null;

// =============================
// Class dropdown
// =============================
function fillClassOptions(){
  let html = `<option value="">All Classes</option>`;
  html += `<option value="-2">Nursery</option>`;
  html += `<option value="-1">LKG</option>`;
  html += `<option value="0">UKG</option>`;
  for(let i=1;i<=12;i++) html += `<option value="${i}">${i}</option>`;
  fClass.innerHTML = html;
}
fillClassOptions();

// =============================
// RIGHT PANEL: render profile
// =============================
function renderRightEmpty(){
  if(!rightRoot) return;
  rightRoot.innerHTML = `
    <div class="muted" style="padding:12px">
      Select a student from the left to view profile and manage transactions.
    </div>
  `;
}

function renderRightLoading(){
  if(!rightRoot) return;
  rightRoot.innerHTML = `
    <div class="muted" style="padding:12px">Loading student details...</div>
  `;
}

function renderRightProfile(stu, feeRow){
  if(!rightRoot) return;

  const fullName = getFreshName(stu) || feeRow?.studentName || "Student";
  const img = getFreshPhoto(stu) || feeRow?.photoUrl || safeImgUrl(fullName);

  const feeLine = feeRow
    ? `Total: ₹${money(feeRow.totalFee)} • Paid: ₹${money(feeRow.paidAmount)} • Due: ₹${money(feeRow.dueAmount)} • Next Due: ${feeRow.nextDueDate ? fmtDate(feeRow.nextDueDate) : "-"}`
    : "";

  rightRoot.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center;padding:10px;border:1px solid #eef0ff;border-radius:16px;background:#fff">
      <img src="${img}" onerror="this.src='${safeImgUrl(fullName)}'"
           style="width:64px;height:64px;border-radius:18px;object-fit:cover;border:1px solid #e7e9ff"/>
      <div>
        <div style="font-weight:900;font-size:16px">${safeVal(fullName)}</div>
        <div class="muted">${safeVal(stu.studentId)} • ${classLabel(stu.standard)}-${safeVal(stu.section)} • ${safeVal(stu.academicYear)}</div>
        ${feeLine ? `<div class="muted" style="margin-top:6px">${feeLine}</div>` : ``}
      </div>
    </div>

    <div style="height:10px"></div>

    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Date of Birth</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.dateOfBirth)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Gender</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.gender)}</div>
      </div>

      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Student Phone</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.phoneNumber)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Parent Phone</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.parentPhoneNumber)}</div>
      </div>

      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Father Name</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.fatherName)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Mother Name</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.motherName)}</div>
      </div>

      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Father Occupation</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.fatherOccupation)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Address</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.address)}</div>
      </div>

      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Student Email</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.studentEmailId)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Parent Email</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.parentEmailId)}</div>
      </div>

      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Caste / Religion</div>
        <div style="margin-top:4px;font-weight:800">${safeVal(stu.caste)} / ${safeVal(stu.religion)}</div>
      </div>
      <div style="border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff">
        <div style="font-size:12px;color:#6d7488;font-weight:800">Active</div>
        <div style="margin-top:4px;font-weight:800">${stu.active ? "✅ Active" : "❌ Inactive"}</div>
      </div>
    </div>

    <div style="height:10px"></div>
    <div class="muted" style="padding:10px;border:1px dashed #d8dcff;border-radius:14px;background:#fbfbff">
      Tip: Use <b>View Transactions</b> to edit/delete wrong payments. After edit/delete, totals will auto recalculate.
    </div>
  `;
}

// =============================
// Render students list
// =============================
function renderStudents(list){
  if(!list.length){
    studentList.innerHTML = `<div class="muted">No students found</div>`;
    return;
  }
  studentList.innerHTML = list.map(s => {
    const displayName = s.studentName || "Student";
    const img = s.photoUrl || safeImgUrl(displayName);
    const activeCls = selectedStudent && String(selectedStudent.studentId)===String(s.studentId) ? "active" : "";
    return `
      <div class="item ${activeCls}" data-sid="${s.studentId}">
        <img src="${img}" onerror="this.src='${safeImgUrl(displayName)}'"/>
        <div>
          <b>${displayName}</b>
          <div class="sub">${s.studentId} • ${classLabel(s.standard)}-${s.section}</div>
        </div>
      </div>
    `;
  }).join("");
}

function applyStudentFilters(){
  const cls = fClass.value;
  const sec = fSection.value.trim().toLowerCase();
  const qq = q.value.trim().toLowerCase();

  let list = [...allStudents];

  if(cls !== ""){
    list = list.filter(s => Number(s.standard) === Number(cls));
  }
  if(sec){
    list = list.filter(s => String(s.section||"").toLowerCase() === sec);
  }
  if(qq){
    list = list.filter(s => {
      const hay = `${s.studentId} ${s.studentName}`.toLowerCase();
      return hay.includes(qq);
    });
  }

  renderStudents(list);
}

// =============================
// Transactions view
// =============================
function txRowHtml(t){
  return `
    <tr>
      <td>${t.paidDate ? fmtDate(t.paidDate) : "-"}</td>
      <td><b>₹ ${money(t.paidAmount)}</b></td>
      <td>₹ ${money(t.paidTotalAfter)}</td>
      <td>₹ ${money(t.dueAfter)}</td>
      <td>${t.nextDueDate ? fmtDate(t.nextDueDate) : "-"}</td>
      <td>${t.remarks ? String(t.remarks) : "-"}</td>
      <td>
        <button class="btn" data-edit="${t.id}">Edit</button>
      </td>
    </tr>
  `;
}

async function loadTransactions(){
  if(!selectedStudent) return;
  errRight.style.display = "none";

  const sid = selectedStudent.studentId;
  const list = await fetchJson(`/office/api/transactions/student/${encodeURIComponent(sid)}`);
  currentTx = Array.isArray(list) ? list : [];
  vmBody.innerHTML = currentTx.length
    ? currentTx.map(txRowHtml).join("")
    : `<tr><td colspan="7" class="muted">No transactions found</td></tr>`;

  vmSub.textContent = `${selectedStudent.studentName} (${sid}) • ${classLabel(selectedStudent.standard)}-${selectedStudent.section}`;
}

// =============================
// Modals open/close
// =============================
function openModal(modal){ modal.style.display = "grid"; }
function closeModal(modal){ modal.style.display = "none"; }

[viewModal, editModal, addModal].forEach(m => {
  m.addEventListener("click", (e)=>{ if(e.target===m) closeModal(m); });
});

vmClose.addEventListener("click", ()=> closeModal(viewModal));
vmOk.addEventListener("click", ()=> closeModal(viewModal));
vmReload.addEventListener("click", loadTransactions);

emClose.addEventListener("click", ()=> closeModal(editModal));
emCancel.addEventListener("click", ()=> closeModal(editModal));

amClose.addEventListener("click", ()=> closeModal(addModal));
amCancel.addEventListener("click", ()=> closeModal(addModal));

// =============================
// Select student
// =============================
studentList.addEventListener("click", async (e) => {
  const item = e.target.closest(".item");
  if(!item) return;

  const sid = item.dataset.sid;
  selectedStudent = allStudents.find(s => String(s.studentId) === String(sid)) || null;

  document.querySelectorAll(".item").forEach(x=> x.classList.remove("active"));
  item.classList.add("active");

  selTitle.textContent = `${selectedStudent.studentName} (${selectedStudent.studentId})`;
  selSub.textContent = `${classLabel(selectedStudent.standard)}-${selectedStudent.section}`;

  btnView.disabled = false;
  btnAdd.disabled = false;

  // ✅ NEW: load full profile details and render on right
  // ✅ ALSO: patch LEFT LIST with fresh name/photo and re-render list
  try{
    errRight.style.display = "none";
    renderRightLoading();

    const stu = await fetchStudentDetails(selectedStudent.studentId);
    selectedStudentFull = stu;

    // ✅ Patch left list data from fresh profile
    patchStudentInList(selectedStudent.studentId, selectedStudentFull);

    // ✅ Re-render left list so name/photo updates immediately
    applyStudentFilters();

    // ✅ Update header (selected section)
    selTitle.textContent = `${selectedStudent.studentName} (${selectedStudent.studentId})`;
    selSub.textContent = `${classLabel(selectedStudent.standard)}-${selectedStudent.section}`;

    // ✅ Right side
    renderRightProfile(selectedStudentFull, selectedStudent);

  }catch(ex){
    errRight.style.display = "block";
    errRight.textContent = ex.message || String(ex);
    renderRightEmpty();
  }
});

// =============================
// Buttons
// =============================
btnView.addEventListener("click", async () => {
  try{
    if(!selectedStudent) return;
    vmBody.innerHTML = `<tr><td colspan="7" class="muted">Loading...</td></tr>`;
    openModal(viewModal);
    await loadTransactions();
  }catch(ex){
    errRight.style.display = "block";
    errRight.textContent = ex.message || String(ex);
  }
});

btnAdd.addEventListener("click", () => {
  if(!selectedStudent) return;
  amErr.style.display="none";
  amPaidDate.value = "";
  amPaidAmount.value = "";
  amNextDue.value = "";
  amRemarks.value = "";
  amSub.textContent = `${selectedStudent.studentName} (${selectedStudent.studentId})`;
  openModal(addModal);
});

// =============================
// Add Transaction (POST)
// =============================
amSave.addEventListener("click", async () => {
  try{
    if(!selectedStudent) return;

    const paidDate = amPaidDate.value;
    const paidAmount = Number(amPaidAmount.value || 0);
    const nextDueDate = amNextDue.value || null;
    const remarks = amRemarks.value || null;

    if(!paidDate) throw new Error("Paid date is required");
    if(paidAmount < 0) throw new Error("Paid amount must be >= 0");

    amSave.disabled = true;
    await postJson(`/office/api/transactions/student/${encodeURIComponent(selectedStudent.studentId)}`, {
      paidDate, paidAmount, nextDueDate, remarks
    });

    closeModal(addModal);

    if(viewModal.style.display === "grid") await loadTransactions();

  }catch(ex){
    amErr.style.display="block";
    amErr.textContent = ex.message || String(ex);
  }finally{
    amSave.disabled = false;
  }
});

// =============================
// Edit Transaction (open modal)
// =============================
vmBody.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-edit]");
  if(!b) return;

  const id = Number(b.dataset.edit);
  editingTx = currentTx.find(t => Number(t.id) === id) || null;
  if(!editingTx) return;

  emErr.style.display="none";
  emSub.textContent = `Tx #${editingTx.id} • ${selectedStudent.studentId}`;
  emPaidDate.value = isoDate(editingTx.paidDate);
  emPaidAmount.value = editingTx.paidAmount ?? 0;
  emNextDue.value = isoDate(editingTx.nextDueDate);
  emRemarks.value = editingTx.remarks ?? "";

  openModal(editModal);
});

// =============================
// Save Edit (PUT)
// =============================
emSave.addEventListener("click", async () => {
  try{
    if(!selectedStudent || !editingTx) return;

    const paidDate = emPaidDate.value;
    const paidAmount = Number(emPaidAmount.value || 0);
    const nextDueDate = emNextDue.value || null;
    const remarks = emRemarks.value || null;

    if(!paidDate) throw new Error("Paid date is required");
    if(paidAmount < 0) throw new Error("Paid amount must be >= 0");

    emSave.disabled = true;

    await putJson(`/office/api/transactions/student/${encodeURIComponent(selectedStudent.studentId)}/${editingTx.id}`, {
      paidDate, paidAmount, nextDueDate, remarks
    });

    closeModal(editModal);
    await loadTransactions();

  }catch(ex){
    emErr.style.display="block";
    emErr.textContent = ex.message || String(ex);
  }finally{
    emSave.disabled = false;
  }
});

// =============================
// Delete (DELETE)
// =============================
emDelete.addEventListener("click", async () => {
  try{
    if(!selectedStudent || !editingTx) return;

    const ok = confirm(`Delete transaction #${editingTx.id}?`);
    if(!ok) return;

    emDelete.disabled = true;

    await delJson(`/office/api/transactions/student/${encodeURIComponent(selectedStudent.studentId)}/${editingTx.id}`);

    closeModal(editModal);
    await loadTransactions();

  }catch(ex){
    emErr.style.display="block";
    emErr.textContent = ex.message || String(ex);
  }finally{
    emDelete.disabled = false;
  }
});

// =============================
// Load students from existing fees list
// =============================
async function loadStudents(){
  errStudents.style.display="none";
  try{
    const list = await fetchJson("/office/api/fees/students");
    allStudents = Array.isArray(list) ? list : [];
    applyStudentFilters();
    renderRightEmpty();
  }catch(ex){
    errStudents.style.display="block";
    errStudents.textContent = ex.message || String(ex);
    renderRightEmpty();
  }
}

// =============================
// Filters events
// =============================
[fClass].forEach(el => el.addEventListener("change", applyStudentFilters));
[fSection, q].forEach(el => el.addEventListener("input", () => {
  clearTimeout(window.__flt);
  window.__flt = setTimeout(applyStudentFilters, 120);
}));
btnClear.addEventListener("click", () => {
  fClass.value = "";
  fSection.value = "";
  q.value = "";
  applyStudentFilters();
});
btnReload.addEventListener("click", loadStudents);

// init
loadStudents();