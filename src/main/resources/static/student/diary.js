console.log("✅ student/diary.js loaded");

// -------------------------
// SESSION
// -------------------------
const studentId = sessionStorage.getItem("studentId");
const username  = sessionStorage.getItem("auth_username");
const password  = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

const $ = (id) => document.getElementById(id);
const tbody = $("tbody");
const errEl = $("err");

// -------------------------
// HELPERS
// -------------------------
function showErr(msg){
  errEl.textContent = msg;
  errEl.classList.remove("hidden");
}
function clearErr(){
  errEl.textContent = "";
  errEl.classList.add("hidden");
}

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

function parseDateSafe(v){
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : 0;
}

async function fetchJson(url){
  const token = btoa(`${username}:${password}`);

  const res = await fetch(url,{
    headers:{ Authorization:`Basic ${token}` }
  });

  const txt = await res.text().catch(()=> "");

  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  if(!txt) return null;

  try{ return JSON.parse(txt); }
  catch{ return txt; }
}

// -------------------------
// LOAD COURSES
// -------------------------
async function loadCourses(){
  const data = await fetchJson(
    `/student/${encodeURIComponent(studentId)}/courses`
  );
  return Array.isArray(data) ? data : [];
}

// -------------------------
// BUILD SUBJECT LIST + CLASS META
// -------------------------
function buildSubjects(courses){

  const subjects = [];
  const seen = new Set();

  let studentStandard = null;
  let studentSection  = null;

  for(const c of courses){

    const subjectName = String(
      c.subjectName || c.subject || ""
    ).trim();

    if(!subjectName) continue;

    const key = subjectName.toLowerCase();
    if(seen.has(key)) continue;
    seen.add(key);

    subjects.push({
      subjectName,
      teacherId : c.teacherId || ""
    });

    if(!studentStandard) studentStandard = c.standard ?? c.std ?? null;
    if(!studentSection)  studentSection  = c.section ?? c.sec ?? null;
  }

  return { subjects, standard: studentStandard, section: studentSection };
}

// -------------------------
// LOAD DIARY FOR SUBJECT (backend same)
// -------------------------
async function loadDiary(teacherId, standard, section, subjectName){

  if(!teacherId) return [];

  const url =
    `/teacher/api/diary/${encodeURIComponent(teacherId)}`
    + `?standard=${encodeURIComponent(standard)}`
    + `&section=${encodeURIComponent(section)}`
    + `&subjectName=${encodeURIComponent(subjectName)}`;

  const data = await fetchJson(url);
  return Array.isArray(data) ? data : [];
}

// -------------------------
// PICK LATEST ENTRY
// -------------------------
function pickLatest(list){
  if(!list.length) return null;

  return list.sort(
    (a,b)=> parseDateSafe(b.entryDate) - parseDateSafe(a.entryDate)
  )[0];
}

// -------------------------
// HOMEWORK CELL: title bold + desc below
// -------------------------
function homeworkCell(entry){
  if(!entry) return `<span class="cell-dash">—</span>`;

  const title = entry.topic ? esc(entry.topic) : "";
  const desc  = entry.workToday ? esc(entry.workToday) : "";

  if(title && desc){
    return `<div class="hw">
      <div class="hw-title">${title}</div>
      <div class="hw-desc">${desc}</div>
    </div>`;
  }
  if(title){
    return `<div class="hw">
      <div class="hw-title">${title}</div>
      <div class="hw-desc cell-dash">—</div>
    </div>`;
  }
  if(desc){
    return `<div class="hw">
      <div class="hw-title cell-dash">—</div>
      <div class="hw-desc">${desc}</div>
    </div>`;
  }
  return `<span class="cell-dash">—</span>`;
}

// -------------------------
// RENDER
// -------------------------
function renderLoading(subjects){
  tbody.innerHTML = subjects.map(s=>`
    <tr>
      <td class="subject-cell"><b>${esc(s.subjectName)}</b></td>
      <td class="muted">Loading...</td>
    </tr>
  `).join("");
}

function renderFinal(subjects, rowMap){

  if(!subjects.length){
    tbody.innerHTML = `<tr><td colspan="2" class="muted">No subjects found</td></tr>`;
    return;
  }

  const rows = subjects.map(s=>{
    const entry = rowMap.get(s.subjectName);
    return `
      <tr>
        <td class="subject-cell"><b>${esc(s.subjectName)}</b></td>
        <td>${homeworkCell(entry)}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rows.join("");
}

// -------------------------
// MAIN
// -------------------------
async function loadAll(){

  clearErr();

  try{
    const courses = await loadCourses();
    const meta = buildSubjects(courses);

    const subjects = meta.subjects;
    const standard = meta.standard;
    const section  = meta.section;

    if(!standard || !section){
      showErr("Student class/section not found in courses");
      tbody.innerHTML = `<tr><td colspan="2">No data</td></tr>`;
      return;
    }

    renderLoading(subjects);

    const rowMap = new Map();

    await Promise.all(
      subjects.map(async s=>{
        const list = await loadDiary(s.teacherId, standard, section, s.subjectName);
        rowMap.set(s.subjectName, pickLatest(list));
      })
    );

    renderFinal(subjects, rowMap);

  }catch(e){
    console.error(e);
    showErr(e.message || "Failed to load diary");
    tbody.innerHTML = `<tr><td colspan="2">Failed to load</td></tr>`;
  }
}

// initial load only (no refresh button)
loadAll();