console.log("✅ admin-hallticket.js loaded");

function getSession(){
  try{ return JSON.parse(localStorage.getItem("smp_session") || "{}"); }catch{ return {}; }
}
function normalizeToken(tok){
  if(!tok) return "";
  tok = String(tok).trim();
  if(/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
  if(tok.includes(":")) tok = btoa(tok);
  return tok;
}
function requireAdmin(){
  const s = getSession();
  if(!s.username || String(s.role||"").toUpperCase() !== "ADMIN"){
    alert("Session expired. Please login again.");
    window.location.href = "/login/admin.html";
    throw new Error("No admin session");
  }
  s.basicToken = normalizeToken(s.basicToken);
  return s;
}

const session = requireAdmin();
const basicToken = session.basicToken;

function authHeaders(){
  return {
    Authorization: `Basic ${basicToken}`,
    "Content-Type":"application/json"
  };
}

async function apiGet(url){
  const res = await fetch(url, { headers: authHeaders() });
  const txt = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/admin.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try{ return txt ? JSON.parse(txt) : null; }catch{ return txt; }
}
async function apiPut(url, body){
  const res = await fetch(url, {
    method:"PUT",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const txt = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/admin.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try{ return txt ? JSON.parse(txt) : null; }catch{ return txt; }
}

const examSelect = document.getElementById("examSelect");
const studentIdInput = document.getElementById("studentIdInput");
const btnPreview = document.getElementById("btnPreview");
const btnPrint = document.getElementById("btnPrint");
const previewArea = document.getElementById("previewArea");
const issueStatus = document.getElementById("issueStatus");
const errEl = document.getElementById("err");

const logoUrl = document.getElementById("logoUrl");
const schoolName = document.getElementById("schoolName");
const address = document.getElementById("address");
const btnSaveConfig = document.getElementById("btnSaveConfig");
const cfgStatus = document.getElementById("cfgStatus");

document.getElementById("btnBack").addEventListener("click", () => window.history.back());
document.getElementById("btnLogout").addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/admin.html";
});

function setCfgStatus(msg, type=""){
  cfgStatus.className = "status";
  if(type==="ok") cfgStatus.classList.add("ok");
  if(type==="err") cfgStatus.classList.add("err");
  cfgStatus.textContent = msg || "";
}
function setIssueStatus(msg, type=""){
  issueStatus.className = "status";
  if(type==="ok") issueStatus.classList.add("ok");
  if(type==="err") issueStatus.classList.add("err");
  issueStatus.textContent = msg || "";
}
function showErr(msg){
  errEl.style.display = "block";
  errEl.textContent = msg || "Something went wrong";
}
function clearErr(){
  errEl.style.display = "none";
  errEl.textContent = "";
}

function safe(v){ return (v==null) ? "" : String(v); }
function classLabel(std){
  const n = Number(std);
  if(n === -2) return "Nursery";
  if(n === -1) return "LKG";
  if(n === 0) return "UKG";
  return `Class ${n}`;
}
function fallbackAvatar(name){
  const n = (name || "Student").trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=667eea&color=fff&size=128`;
}

async function loadExams(){
  const list = await apiGet("/student/api/exams"); // public already
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

async function loadConfig(){
  const cfg = await apiGet("/admin/api/hallticket/config");
  logoUrl.value = cfg?.logoUrl || "";
  schoolName.value = cfg?.schoolName || "";
  address.value = cfg?.address || "";
}

function renderTicket(resp){
  previewArea.style.display = "";
  btnPrint.style.display = "";

  const cfg = resp.config || {};
  const img = resp.profileUrl || fallbackAvatar(resp.fullName);

  const allowedBadge = resp.allowed
    ? `<span class="badge ok">Allowed</span>`
    : `<span class="badge no">Blocked</span>`;

  const ttRows = Array.isArray(resp.timetable) ? resp.timetable : [];
  const ttHtml = ttRows.length
    ? ttRows.map(r => `
        <tr>
          <td>${safe(r.examDate)}</td>
          <td>${safe(r.day)}</td>
          <td>${safe(r.subjectName)}</td>
          <td>${safe(r.startTime)}</td>
          <td>${safe(r.endTime)}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="5" class="muted">No timetable rows found.</td></tr>`;

  previewArea.innerHTML = `
    <div class="ticket" id="printTicket">
      <div class="ticketHead">
        <img class="schoolLogo" src="${safe(cfg.logoUrl)}" onerror="this.style.display='none'"/>
        <div>
          <div class="schoolName">${safe(cfg.schoolName || "School Name")}</div>
          <div class="schoolAddr">${safe(cfg.address || "")}</div>
          <div style="margin-top:6px">${allowedBadge}</div>
        </div>
      </div>

      <div class="ticketMid">
        <img class="stuPhoto" src="${img}" onerror="this.src='${fallbackAvatar(resp.fullName)}'"/>
        <div class="infoGrid">
          <div><div class="k">Roll Number</div><div class="v">${safe(resp.rollNumber)}</div></div>
          <div><div class="k">Name</div><div class="v">${safe(resp.fullName)}</div></div>

          <div><div class="k">Class</div><div class="v">${classLabel(resp.standard)} - ${safe(resp.section)}</div></div>
          <div><div class="k">Father Name</div><div class="v">${safe(resp.fatherName || "-")}</div></div>

          <div><div class="k">Exam</div><div class="v">${safe(resp.examName)} (ID: ${safe(resp.examId)})</div></div>
          <div><div class="k">Message</div><div class="v">${safe(resp.message)}</div></div>
        </div>
      </div>

      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Subject</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>${ttHtml}</tbody>
        </table>
      </div>
    </div>
  `;
}

btnSaveConfig.addEventListener("click", async () => {
  try{
    clearErr();
    setCfgStatus("Saving...");
    const payload = {
      logoUrl: logoUrl.value.trim(),
      schoolName: schoolName.value.trim(),
      address: address.value.trim()
    };
    await apiPut("/admin/api/hallticket/config", payload);
    setCfgStatus("✅ Saved", "ok");
  }catch(e){
    setCfgStatus("❌ Failed", "err");
    showErr(e.message || String(e));
  }
});

btnPreview.addEventListener("click", async () => {
  try{
    clearErr();
    setIssueStatus("");
    previewArea.style.display = "none";
    btnPrint.style.display = "none";

    const examId = examSelect.value;
    const sid = studentIdInput.value.trim();

    if(!examId) return setIssueStatus("Select exam", "err");
    if(!sid) return setIssueStatus("Enter Student ID", "err");

    setIssueStatus("Loading...");
    const resp = await apiGet(`/admin/api/hallticket/issue/${encodeURIComponent(examId)}/student/${encodeURIComponent(sid)}`);
    renderTicket(resp);

    setIssueStatus(resp.allowed ? "✅ Loaded" : "⚠️ Blocked (Office)", resp.allowed ? "ok" : "err");
  }catch(e){
    setIssueStatus("❌ Failed", "err");
    showErr(e.message || String(e));
  }
});

btnPrint.addEventListener("click", () => {
  window.print();
});

// INIT
(async function init(){
  try{
    setCfgStatus("");
    setIssueStatus("Loading...");
    await Promise.all([loadConfig(), loadExams()]);
    setIssueStatus("Select exam + enter studentId");
  }catch(e){
    setIssueStatus("");
    showErr(e.message || String(e));
    examSelect.innerHTML = `<option value="">Failed to load exams</option>`;
  }
})();
