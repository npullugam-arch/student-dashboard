console.log("✅ student-hallticket.js loaded");

// --------------------
// Session (same as your working code)
// --------------------
const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
  throw new Error("No session");
}

// --------------------
// DOM (NEW UI ids)
// --------------------
const examSelect = document.getElementById("examSelect");
const btnLoad = document.getElementById("btnLoad");
const btnPrint = document.getElementById("btnPrint");
const statusText = document.getElementById("statusText");
const errEl = document.getElementById("err");
const classPill = document.getElementById("classPill");

const hallTicketSection = document.getElementById("hallTicketSection");

const schoolLogo = document.getElementById("schoolLogo");
const schoolName = document.getElementById("schoolName");
const schoolAddr = document.getElementById("schoolAddr");
const examNameDisplay = document.getElementById("examNameDisplay");

const stuPhoto = document.getElementById("stuPhoto");
const rollNo = document.getElementById("rollNo");
const stuName = document.getElementById("stuName");
const stuClass = document.getElementById("stuClass");
const fatherName = document.getElementById("fatherName");

const ttBody = document.getElementById("ttBody");
const ttEmpty = document.getElementById("ttEmpty");

// header buttons
document.getElementById("btnBack").addEventListener("click", () => window.history.back());
document.getElementById("btnLogout").addEventListener("click", () => {
  sessionStorage.clear();
  window.location.href = "/login/login.html";
});

// --------------------
// Helpers (same idea as your working code)
// --------------------
function tokenHeader(){
  const token = btoa(`${username}:${password}`);
  return { Authorization: `Basic ${token}` };
}
async function apiGet(url, auth=false){
  const res = await fetch(url, {
    method:"GET",
    headers: auth ? tokenHeader() : {}
  });
  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try{ return txt ? JSON.parse(txt) : null; }catch{ return txt; }
}

function showErr(msg){
  errEl.style.display = "block";
  errEl.textContent = msg || "Something went wrong";
}
function clearErr(){
  errEl.style.display = "none";
  errEl.textContent = "";
}
function setStatus(msg){
  statusText.textContent = msg || "";
}

function safeImg(url, fallbackText){
  if(url && String(url).trim()) return url;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackText||"Student")}&background=667eea&color=fff&size=256`;
}

function formatStandardLabel(std) {
  const n = Number(std);
  if (Number.isNaN(n)) return "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return `Class ${n}`;
}

function clearTicket(){
  hallTicketSection.style.display = "none";
  btnPrint.style.display = "none";
  btnPrint.disabled = true;
  ttBody.innerHTML = "";
  ttEmpty.style.display = "none";
}

// --------------------
// Load student profile to show class pill (UNCHANGED endpoint)
// --------------------
let PROFILE = null;
async function loadProfile(){
  const data = await apiGet(`/student/profile/${encodeURIComponent(studentId)}`, true);
  PROFILE = data;
  classPill.textContent = `${formatStandardLabel(data.standard)} - ${data.section}`;
}

// --------------------
// Load exams list (UNCHANGED endpoint)
// --------------------
async function loadExams(){
  const list = await apiGet("/student/api/exams");
  examSelect.innerHTML = "";

  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "Select Exam";
  examSelect.appendChild(opt0);

  (list||[]).forEach(e=>{
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.examName} (ID: ${e.id})`;
    examSelect.appendChild(opt);
  });
}

// --------------------
// Render hall ticket (mapped to UI layout)
// --------------------
function renderHallTicket(resp){
  const cfg = resp.config || {};

  schoolLogo.src = safeImg(cfg.logoUrl, "School");
  schoolName.textContent = cfg.schoolName || "School Name";
  schoolAddr.textContent = cfg.address || "";

  examNameDisplay.textContent = `${resp.examName || "Exam"} (ID: ${resp.examId})`;

  stuPhoto.src = safeImg(resp.profileUrl, resp.fullName);
  rollNo.textContent = resp.rollNumber || "-";
  stuName.textContent = resp.fullName || "-";
  stuClass.textContent = `${formatStandardLabel(resp.standard)} - ${resp.section || "-"}`;
  fatherName.textContent = resp.fatherName || "-";

  // timetable + signature column (UI requires it)
  ttBody.innerHTML = "";
  const rows = resp.timetable || [];

  if(!rows.length){
    ttEmpty.style.display = "";
  }else{
    ttEmpty.style.display = "none";
    rows.forEach((r, idx)=>{
      const tr = document.createElement("tr");
      const time = `${r.startTime || ""} - ${r.endTime || ""}`.trim();
      tr.innerHTML = `
        <td>${idx+1}</td>
        <td>${r.subjectName ?? ""}</td>
        <td>${r.examDate ?? ""}</td>
        <td>${r.day ?? ""}</td>
        <td>${time}</td>
        <td style="font-style:italic;color:#6B7280;">___________</td>
      `;
      ttBody.appendChild(tr);
    });
  }

  hallTicketSection.style.display = "block";
  btnPrint.style.display = "inline-flex";
  btnPrint.disabled = false;

  // smooth scroll like UI demo
  setTimeout(() => {
    hallTicketSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

// --------------------
// Load hall ticket (UNCHANGED endpoint)
// --------------------
async function loadHallTicket(){
  try{
    clearErr();
    clearTicket();

    const examId = examSelect.value;
    if(!examId){
      setStatus("Select Exam");
      return;
    }

    setStatus("Loading hall ticket...");

    const resp = await apiGet(
      `/student/api/hallticket/${encodeURIComponent(examId)}/student/${encodeURIComponent(studentId)}`
    );

    if(!resp.allowed){
      setStatus("Hall Ticket Blocked");
      showErr(resp.message || "Hall ticket blocked by office.");
      return;
    }

    setStatus("Hall Ticket Ready ✅");
    renderHallTicket(resp);

  }catch(e){
    setStatus("");
    showErr(e.message || String(e));
  }
}

// --------------------
// Print
// --------------------
btnPrint.addEventListener("click", () => window.print());

// --------------------
// Init
// --------------------
(async function init(){
  try{
    clearErr();
    clearTicket();
    setStatus("Loading...");

    await loadProfile();
    await loadExams();

    setStatus("Select Exam");
    btnLoad.disabled = true;

    btnLoad.addEventListener("click", loadHallTicket);

    examSelect.addEventListener("change", () => {
      clearTicket();
      clearErr();
      if(examSelect.value){
        setStatus("Click Load Hall Ticket");
        btnLoad.disabled = false;
      }else{
        setStatus("Select Exam");
        btnLoad.disabled = true;
      }
    });

  }catch(e){
    setStatus("");
    showErr(e.message || "Failed to initialize");
    examSelect.innerHTML = `<option value="">Failed to load</option>`;
    btnLoad.disabled = true;
  }
})();