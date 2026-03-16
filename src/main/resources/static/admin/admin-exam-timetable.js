console.log("✅ admin-exam-timetable.js loaded");

// ---------- simple session logout/back ----------
document.getElementById("btnBack").addEventListener("click", () => window.history.back());
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/admin.html";
});

function showErr(el, msg){ el.textContent = msg; el.classList.remove("hidden"); }
function clearErr(el){ el.textContent = ""; el.classList.add("hidden"); }

function getBasicAuthHeader(){
  const session = JSON.parse(localStorage.getItem("smp_session") || "{}");
  let tok = (session.basicToken || "").trim();
  if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i,"").trim();
  return tok ? { Authorization:`Basic ${tok}` } : {};
}

async function apiPost(url, body){
  const res = await fetch(url, {
    method:"POST",
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

async function apiGet(url){
  const res = await fetch(url, {
    method:"GET",
    headers:{
      "Content-Type":"application/json",
      ...getBasicAuthHeader()
    }
  });

  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

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

// ======================================================
// ✅ Created Exams Table (NOW FROM DATABASE)
// Requires backend:
// GET  /admin/api/exams            -> list [{id, examName, createdAt}]
// DELETE /admin/api/exams/{id}     -> delete exam (+ schedules)
// ======================================================
const createdExamsTbody = document.getElementById("createdExamsTbody");
const noCreatedExams = document.getElementById("noCreatedExams");
const btnRefreshExamList = document.getElementById("btnRefreshExamList");

function formatWhen(ts) {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

async function fetchExamsFromDb() {
  // ✅ you can change this URL if your backend is different
  const list = await apiGet("/admin/api/exams");
  return Array.isArray(list) ? list : [];
}

function renderCreatedExamsTable(list) {
  createdExamsTbody.innerHTML = "";

  if (!list.length) {
    noCreatedExams.style.display = "";
    return;
  }
  noCreatedExams.style.display = "none";

  list.forEach((ex) => {
    const id = ex.id ?? ex.examId ?? "—";
    const name = ex.examName ?? ex.name ?? "—";
    const createdAt = ex.createdAt ?? ex.createdOn ?? ex.createdDate ?? null;

    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.style.padding = "10px";
    tdId.style.borderBottom = "1px solid rgba(0,0,0,.06)";
    tdId.textContent = String(id);

    const tdName = document.createElement("td");
    tdName.style.padding = "10px";
    tdName.style.borderBottom = "1px solid rgba(0,0,0,.06)";
    tdName.textContent = String(name);

    const tdWhen = document.createElement("td");
    tdWhen.style.padding = "10px";
    tdWhen.style.borderBottom = "1px solid rgba(0,0,0,.06)";
    tdWhen.textContent = createdAt ? formatWhen(createdAt) : "—";

    const tdAction = document.createElement("td");
    tdAction.style.padding = "10px";
    tdAction.style.borderBottom = "1px solid rgba(0,0,0,.06)";
    tdAction.style.textAlign = "right";

    const useBtn = document.createElement("button");
    useBtn.type = "button";
    useBtn.className = "btn ghost";
    useBtn.textContent = "Use";
    useBtn.style.marginRight = "8px";
    useBtn.addEventListener("click", () => {
      const examIdInput = document.getElementById("examId");
      if (examIdInput) examIdInput.value = id;
      alert("✅ Exam ID filled into Schedule form");
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn dark";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      const ok = confirm(
        `Delete exam from BACKEND?\n\nID: ${id}\nName: ${name}\n\nThis will delete schedules also.`
      );
      if (!ok) return;

      try {
        const resp = await apiDelete(`/admin/api/exams/${id}`);
        alert(String(resp || "✅ Deleted from backend"));
        await refreshExamsTable();
      } catch (err) {
        alert("❌ Delete failed: " + (err.message || String(err)));
      }
    });

    tdAction.appendChild(useBtn);
    tdAction.appendChild(delBtn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdWhen);
    tr.appendChild(tdAction);

    createdExamsTbody.appendChild(tr);
  });
}

async function refreshExamsTable() {
  try {
    const list = await fetchExamsFromDb();
    renderCreatedExamsTable(list);
  } catch (e) {
    // show as empty but warn
    console.warn("❌ Failed to load exams:", e.message);
    renderCreatedExamsTable([]);
    noCreatedExams.style.display = "";
    noCreatedExams.textContent = "Unable to load exams from database.";
  }
}

btnRefreshExamList?.addEventListener("click", refreshExamsTable);

// ======================================================
// ✅ Subjects dropdown
// Uses your existing endpoint:
// GET /admin/subjects/standard/{standard}
// ======================================================
const standardEl = document.getElementById("standard");
const subjectEl = document.getElementById("subjectName");

function setSubjectOptionsFromAssigned(items){
  subjectEl.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = (items && items.length) ? "Select Subject" : "No subjects found";
  subjectEl.appendChild(opt0);

  (items || []).forEach((row) => {
    const name = row?.subjectName;
    if(!name) return;

    const opt = document.createElement("option");
    opt.value = name;   // backend expects subjectName string
    opt.textContent = name;
    subjectEl.appendChild(opt);
  });
}

async function loadSubjectsForStandard(){
  const standard = Number(standardEl.value);

  if (standardEl.value === "" || Number.isNaN(standard)) {
    subjectEl.innerHTML = `<option value="">Select class first</option>`;
    return;
  }

  subjectEl.innerHTML = `<option value="">Loading…</option>`;

  try {
    const items = await apiGet(`/admin/subjects/standard/${standard}`);
    setSubjectOptionsFromAssigned(Array.isArray(items) ? items : []);
  } catch (e) {
    subjectEl.innerHTML = `<option value="">Unable to load subjects</option>`;
  }
}

standardEl?.addEventListener("change", loadSubjectsForStandard);

// ---------- Create Exam ----------
const examForm = document.getElementById("examForm");
const examErr = document.getElementById("examErr");
const examCreatedBox = document.getElementById("examCreatedBox");
const createdExamId = document.getElementById("createdExamId");

examForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  clearErr(examErr);

  try{
    const examName = document.getElementById("examName").value.trim();
    if(!examName) throw new Error("Exam name required");

    // backend returns created id (your existing behavior)
    const id = await apiPost("/admin/api/exams", { examName });

    createdExamId.textContent = String(id);
    examCreatedBox.style.display = "block";

    document.getElementById("examId").value = id;

    alert("✅ Exam created successfully");

    // ✅ refresh DB list so newly created exam appears immediately
    await refreshExamsTable();
  }catch(err){
    showErr(examErr, err.message || String(err));
  }
});

// ---------- Add Schedule ----------
const scheduleForm = document.getElementById("scheduleForm");
const schErr = document.getElementById("schErr");

// ✅ fixed default section since UI removed it
const DEFAULT_SECTION = "A";

scheduleForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  clearErr(schErr);

  try{
    const payload = {
      examId: Number(document.getElementById("examId").value),
      standard: Number(document.getElementById("standard").value),
      section: DEFAULT_SECTION,
      subjectName: document.getElementById("subjectName").value.trim(),
      examDate: document.getElementById("examDate").value,
      day: document.getElementById("day").value,
      startTime: document.getElementById("startTime").value,
      endTime: document.getElementById("endTime").value,
    };

    if(!payload.examId) throw new Error("Exam ID required");
    if(document.getElementById("standard").value === "" || Number.isNaN(payload.standard)) throw new Error("Class (standard) required");
    if(!payload.subjectName) throw new Error("Subject required");
    if(!payload.examDate) throw new Error("Exam date required");
    if(!payload.day) throw new Error("Day required");
    if(!payload.startTime) throw new Error("Start time required");
    if(!payload.endTime) throw new Error("End time required");
    if(payload.startTime >= payload.endTime) throw new Error("Start time must be before End time");

    const res = await apiPost("/admin/api/exams/schedule", payload);
    alert(String(res || "✅ Schedule row added"));

    document.getElementById("examDate").value = "";
    document.getElementById("day").value = "";
    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
  }catch(err){
    showErr(schErr, err.message || String(err));
  }
});

// ======================================================
// INIT
// ======================================================
(async function init(){
  await refreshExamsTable();
  await loadSubjectsForStandard(); // set initial subjects UI state
})();