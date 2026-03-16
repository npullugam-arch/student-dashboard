console.log("✅ student-exam-timetable-details.js loaded");

const examSelect = document.getElementById("examSelect");
const standardSelect = document.getElementById("standardSelect");

const tbody = document.getElementById("tbody");
const empty = document.getElementById("empty");
const examTitle = document.getElementById("examTitle");
const statusText = document.getElementById("statusText");

// ✅ NEW: modal refs
const editModal = document.getElementById("editModal");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnCancelEdit = document.getElementById("btnCancelEdit");
const btnSaveEdit = document.getElementById("btnSaveEdit");
const editDate = document.getElementById("editDate");
const editDay = document.getElementById("editDay");
const editSubject = document.getElementById("editSubject");
const editStart = document.getElementById("editStart");
const editEnd = document.getElementById("editEnd");
const editErr = document.getElementById("editErr");

let CURRENT_ROWS = [];
let EDITING_ROW = null;

function showEditErr(msg){
  editErr.textContent = msg;
  editErr.classList.remove("hidden");
}
function clearEditErr(){
  editErr.textContent = "";
  editErr.classList.add("hidden");
}

// ✅ use admin/teacher token if available (so backend delete/edit works)
function getBasicAuthHeader(){
  try{
    const session = JSON.parse(localStorage.getItem("smp_session") || "{}");
    let tok = (session.basicToken || "").trim();
    if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i,"").trim();
    return tok ? { Authorization:`Basic ${tok}` } : {};
  }catch{
    return {};
  }
}

async function apiGet(url){
  const res = await fetch(url, { method:"GET" });
  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

// ✅ NEW: admin calls for delete/edit
async function apiDelete(url){
  const res = await fetch(url, {
    method:"DELETE",
    headers:{
      "Content-Type":"application/json",
      ...getBasicAuthHeader()
    }
  });
  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

async function apiPut(url, body){
  const res = await fetch(url, {
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      ...getBasicAuthHeader()
    },
    body: JSON.stringify(body)
  });
  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

function clearTable(){
  tbody.innerHTML = "";
  empty.style.display = "none";
}

function render(rows){
  CURRENT_ROWS = Array.isArray(rows) ? rows : [];
  clearTable();

  if(!CURRENT_ROWS.length){
    empty.style.display = "";
    return;
  }

  CURRENT_ROWS.forEach((r, idx) => {
    const tr = document.createElement("tr");

    const td = (v) => {
      const x = document.createElement("td");
      x.textContent = v ?? "";
      return x;
    };

    tr.appendChild(td(r.examDate));
    tr.appendChild(td(r.day));
    tr.appendChild(td(r.subjectName));
    tr.appendChild(td(r.startTime));
    tr.appendChild(td(r.endTime));

    // ✅ NEW action column
    const actionTd = document.createElement("td");
    actionTd.style.textAlign = "right";
    actionTd.style.whiteSpace = "nowrap";

    const editBtn = document.createElement("button");
    editBtn.className = "btn ghost";
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.style.marginRight = "8px";
    editBtn.addEventListener("click", () => openEditModal(r));

    const delBtn = document.createElement("button");
    delBtn.className = "btn dark";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteRow(r, idx));

    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);
    tr.appendChild(actionTd);

    tbody.appendChild(tr);
  });
}

async function loadExams(){
  const list = await apiGet("/student/api/exams");
  examSelect.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Select Exam";
  examSelect.appendChild(opt0);

  (list || []).forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.examName} (ID: ${e.id})`;
    examSelect.appendChild(opt);
  });
}

/**
 * ✅ Auto load rule:
 * - When Exam selected AND Class selected -> load timetable automatically.
 * - Section UI removed, but backend expects section -> we send default "A".
 */
async function autoLoadIfReady(){
  try{
    statusText.textContent = "";
    clearTable();

    const examId = examSelect.value;
    const standard = standardSelect.value;

    if(!examId || standard === "") {
      statusText.textContent = "Select Exam and Class";
      return;
    }

    const selectedText = examSelect.options[examSelect.selectedIndex]?.textContent || "Timetable";
    examTitle.textContent = selectedText;

    statusText.textContent = "Loading...";

    const DEFAULT_SECTION = "A";
    const rows = await apiGet(
      `/student/api/exams/${examId}/timetable?standard=${encodeURIComponent(standard)}&section=${encodeURIComponent(DEFAULT_SECTION)}`
    );

    render(rows);
    statusText.textContent = rows?.length ? `Rows: ${rows.length}` : "No rows";
  }catch(err){
    statusText.textContent = "";
    alert("❌ " + (err.message || String(err)));
  }
}

// ===========================
// ✅ Delete row (backend + UI)
// ===========================
async function deleteRow(row, idx){
  // row MUST have id to delete from backend
  if(!row?.id){
    return alert("❌ Cannot delete: schedule id missing from backend response.");
  }

  const ok = confirm(`Delete this schedule?\n\n${row.examDate} • ${row.subjectName} • ${row.startTime}-${row.endTime}`);
  if(!ok) return;

  try{
    // ✅ endpoint assumption (no backend change allowed)
    // If your backend has different endpoint, tell me the exact path.
    await apiDelete(`/admin/api/exams/schedule/${row.id}`);

    // ✅ remove from UI immediately
    CURRENT_ROWS.splice(idx, 1);
    render(CURRENT_ROWS);
    statusText.textContent = CURRENT_ROWS.length ? `Rows: ${CURRENT_ROWS.length}` : "No rows";
  }catch(err){
    alert("❌ Delete failed: " + (err.message || String(err)) + "\n\nIf this says 404, your backend delete endpoint path is different.");
  }
}

// ===========================
// ✅ Edit modal (backend + UI)
// ===========================
function openEditModal(row){
  EDITING_ROW = row;
  clearEditErr();

  editDate.value = row.examDate || "";
  editDay.value = row.day || "";
  editSubject.value = row.subjectName || "";
  editStart.value = row.startTime || "";
  editEnd.value = row.endTime || "";

  editModal.style.display = "block";
}

function closeEditModal(){
  EDITING_ROW = null;
  editModal.style.display = "none";
}

btnCloseModal.addEventListener("click", closeEditModal);
btnCancelEdit.addEventListener("click", closeEditModal);

// Save edit
btnSaveEdit.addEventListener("click", async () => {
  if(!EDITING_ROW?.id){
    return showEditErr("Schedule id missing. Cannot update backend.");
  }

  const payload = {
    examDate: editDate.value,
    day: editDay.value,
    subjectName: editSubject.value.trim(),
    startTime: editStart.value,
    endTime: editEnd.value
  };

  if(!payload.examDate) return showEditErr("Date required");
  if(!payload.day) return showEditErr("Day required");
  if(!payload.subjectName) return showEditErr("Subject required");
  if(!payload.startTime) return showEditErr("Start time required");
  if(!payload.endTime) return showEditErr("End time required");
  if(payload.startTime >= payload.endTime) return showEditErr("Start time must be before End time");

  try{
    // ✅ endpoint assumption (no backend change allowed)
    await apiPut(`/admin/api/exams/schedule/${EDITING_ROW.id}`, payload);

    // ✅ update UI local copy
    const i = CURRENT_ROWS.findIndex(x => String(x.id) === String(EDITING_ROW.id));
    if(i >= 0){
      CURRENT_ROWS[i] = { ...CURRENT_ROWS[i], ...payload };
      render(CURRENT_ROWS);
      statusText.textContent = CURRENT_ROWS.length ? `Rows: ${CURRENT_ROWS.length}` : "No rows";
    }

    closeEditModal();
    alert("✅ Updated");
  }catch(err){
    showEditErr("❌ Update failed: " + (err.message || String(err)) + " (If 404, backend edit endpoint path differs)");
  }
});

// ✅ Auto load on change
examSelect.addEventListener("change", autoLoadIfReady);
standardSelect.addEventListener("change", autoLoadIfReady);

loadExams()
  .then(() => {
    statusText.textContent = "Select Exam and Class";
  })
  .catch(err => {
    console.error(err);
    examSelect.innerHTML = `<option value="">Failed to load exams</option>`;
    statusText.textContent = "";
  });
