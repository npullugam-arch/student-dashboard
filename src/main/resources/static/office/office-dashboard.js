// ================================
// ✅ UPDATED FULL FILE: office-dashboard.js
// ✅ Frontend-only change (SAFE):
// 0) Added tiny "offline safety" helper at top (stores last_online_url when online)
// ✅ Everything else unchanged
// ================================

// ✅ OFFLINE SAFETY (extra safe when navigating iframe pages too)
(function () {
  try {
    function remember() {
      if (navigator.onLine) {
        sessionStorage.setItem("last_online_url", location.pathname + location.search + location.hash);
      }
    }
    remember();
    window.addEventListener("online", remember);
    window.addEventListener("beforeunload", remember);
  } catch {}
})();

console.log("✅ office/office-dashboard.js loaded");

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
const officeId = session.username;
const basicToken = session.basicToken;

function authHeaders(){
  return {
    Authorization: `Basic ${basicToken}`,
    "Content-Type":"application/json"
  };
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

async function putJson(url, body){
  const res = await fetch(url, {
    method:"PUT",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const txt = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try{ return txt ? JSON.parse(txt) : null; }catch{ return txt; }
}

async function postJson(url, body){
  const res = await fetch(url, {
    method:"POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : null
  });
  const txt = await res.text().catch(()=> "");
  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/office.html";
    throw new Error("Unauthorized");
  }
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try{ return txt ? JSON.parse(txt) : null; }catch{ return txt; }
}

/**
 * ✅ Student full details
 * Preferred: /office/api/students/{studentId}
 * Fallback: /admin/students/{studentId} (ONLY if your backend allows OFFICE)
 */
async function fetchStudentDetails(studentId){
  try{
    return await fetchJson(`/office/api/students/${encodeURIComponent(studentId)}`);
  }catch(e){
    return fetchJson(`/admin/students/${encodeURIComponent(studentId)}`);
  }
}

/* ========= DOM ========= */
const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const logoutBtn = document.getElementById("logoutBtn");
const pageRoot = document.getElementById("pageRoot");
const iframeRoot = document.getElementById("iframeRoot");
const contentFrame = document.getElementById("contentFrame");

const pageTitle = document.getElementById("pageTitle");
const pageSub = document.getElementById("pageSub");
const navBtns = document.querySelectorAll(".nav-item[data-page]");

document.getElementById("officePill").textContent = `OFFICE • ${officeId}`;

menuBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
document.addEventListener("click", (e) => {
  if(window.innerWidth <= 900){
    if(sidebar.classList.contains("active") && !sidebar.contains(e.target) && !menuBtn.contains(e.target)){
      sidebar.classList.remove("active");
    }
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/office.html";
});

function setActive(page){
  navBtns.forEach(b => b.classList.toggle("active", b.dataset.page === page));
}

function showFeesArea(){
  iframeRoot.style.display = "none";
  pageRoot.style.display = "";
  // optional: stop old iframe page
  contentFrame.src = "";
}

function showIframe(url){
  pageRoot.style.display = "none";
  iframeRoot.style.display = "";
  if(contentFrame.src !== url) contentFrame.src = url;
}

/* ================================
   FEES PAGE (unchanged)
================================ */
function money(n){
  const v = Number(n||0);
  return v.toLocaleString("en-IN");
}
function safeImgUrl(name){
  const n = (name || "Student").trim();
  return "https://ui-avatars.com/api/?name=" + encodeURIComponent(n) + "&background=667eea&color=fff&size=64";
}
function classLabel(std){
  const n = Number(std);
  if(n === -2) return "Nursery";
  if(n === -1) return "LKG";
  if(n === 0) return "UKG";
  if(Number.isFinite(n)) return String(n);
  return "-";
}
function fmtDate(iso){
  if(!iso) return "-";
  const s = String(iso);
  const parts = s.split("-");
  if(parts.length !== 3) return s;
  const [y,m,d] = parts;
  return `${d}-${m}-${y}`;
}
function classOptionsHtml(){
  let html = `<option value="">All Classes</option>`;
  html += `<option value="-2">Nursery</option>`;
  html += `<option value="-1">LKG</option>`;
  html += `<option value="0">UKG</option>`;
  for(let i=1;i<=12;i++) html += `<option value="${i}">${i}</option>`;
  return html;
}
function safeVal(v){
  return (v === null || v === undefined || String(v).trim()==="") ? "-" : String(v);
}

/** shared: create/attach local css ONCE */
let __officeStyleInjected = false;
function ensureOfficeStyle(){
  if(__officeStyleInjected) return;
  __officeStyleInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    .grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
    .card{background:#fff;border:1px solid #e7e9ff;border-radius:18px;padding:12px;box-shadow:0 16px 50px rgba(20,22,60,.06)}
    .k{color:#6d7488;font-size:12px;font-weight:700}
    .v{font-size:18px;font-weight:900;margin-top:4px}
    .panel{margin-top:12px;background:#fff;border:1px solid #e7e9ff;border-radius:18px;padding:12px;box-shadow:0 16px 50px rgba(20,22,60,.06)}
    .panel-head{display:flex;flex-direction:column;gap:10px}
    .tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
    .inp{padding:10px 12px;border:1px solid #e7e9ff;border-radius:12px;outline:none}
    .btn{border:1px solid #e7e9ff;background:#f3f4ff;border-radius:12px;padding:10px 12px;cursor:pointer;font-weight:800}
    .btn.dark{background:#5b5ef7;color:#fff;border-color:#5b5ef7}
    .tableWrap{overflow:auto;margin-top:10px}
    .tbl{width:100%;border-collapse:separate;border-spacing:0}
    .tbl th,.tbl td{padding:10px;border-bottom:1px solid #eef0ff;text-align:left;font-size:13px;vertical-align:middle}
    .tag{padding:6px 10px;border-radius:999px;font-weight:800;font-size:12px;display:inline-block}
    .ok{background:#e9fff2;border:1px solid #9dffc0;color:#0d7a34}
    .no{background:#ffecec;border:1px solid #ffb3b3;color:#a40000}
    .err{margin-top:10px;padding:10px;border-radius:12px;background:#ffecec;border:1px solid #ffb3b3;color:#a40000;font-size:13px}
    .modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:grid;place-items:center;z-index:99;padding:18px}
    .modalCard{width:min(420px,100%);background:#fff;border-radius:18px;border:1px solid #e7e9ff;box-shadow:0 16px 50px rgba(20,22,60,.18);padding:12px}
    .mHead{display:flex;align-items:center;justify-content:space-between}
    .mBody{display:grid;gap:10px;margin-top:10px}
    .field span{display:block;color:#6d7488;font-size:12px;margin-bottom:6px}
    .mActions{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
    @media(max-width:1100px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    .filters{
      display:grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap:10px;
      padding:10px;
      border:1px solid #eef0ff;
      border-radius:16px;
      background: linear-gradient(135deg, #ffffff, #f7f8ff);
    }
    .fgrp{display:flex;flex-direction:column;gap:6px}
    .flbl{font-size:12px;color:#6d7488;font-weight:800}
    .frow{display:flex;gap:8px}
    @media(max-width:1100px){ .filters{grid-template-columns: repeat(2, minmax(0, 1fr))} }
    .pGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .pItem{border:1px solid #eef0ff;border-radius:14px;padding:10px;background:#fff}
    .pKey{font-size:12px;color:#6d7488;font-weight:800}
    .pVal{margin-top:4px;font-weight:800;word-break:break-word}
    @media(max-width:900px){.pGrid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function profileModalHtml(){
  return `
    <div class="modal" id="profileModal" style="display:none">
      <div class="modalCard" style="width:min(760px,100%)">
        <div class="mHead">
          <div>
            <div style="font-weight:900">Student Profile</div>
            <div class="muted" id="pSub">—</div>
          </div>
          <button class="iconbtn" id="pClose" type="button">✕</button>
        </div>

        <div class="mBody" id="pBody" style="display:grid;gap:10px"></div>

        <div class="mActions">
          <button class="btn dark" id="pOk" type="button">Close</button>
        </div>
      </div>
    </div>
  `;
}

function wireProfileModal(currentRowsRef){
  const profileModal = document.getElementById("profileModal");
  const pClose = document.getElementById("pClose");
  const pOk = document.getElementById("pOk");
  const pSub = document.getElementById("pSub");
  const pBody = document.getElementById("pBody");

  function closeProfileModal(){
    profileModal.style.display = "none";
    pBody.innerHTML = "";
  }

  function openProfileModal(stu){
    const img = stu.profileUrl ? stu.profileUrl : safeImgUrl(stu.fullName);
    pSub.textContent = `${safeVal(stu.fullName)} (${safeVal(stu.studentId)}) • ${classLabel(stu.standard)}-${safeVal(stu.section)}`;

    const feeRow = (currentRowsRef?.list || []).find(r => String(r.studentId) === String(stu.studentId));
    const feeLine = feeRow
      ? `Total: ₹${money(feeRow.totalFee)} • Paid: ₹${money(feeRow.paidAmount)} • Due: ₹${money(feeRow.dueAmount)} • Next Due: ${feeRow.nextDueDate ? fmtDate(feeRow.nextDueDate) : "-"}`
      : "";

    pBody.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <img src="${img}" onerror="this.src='${safeImgUrl(stu.fullName)}'"
          style="width:64px;height:64px;border-radius:18px;object-fit:cover;border:1px solid #e7e9ff" />
        <div>
          <div style="font-weight:900;font-size:16px">${safeVal(stu.fullName)}</div>
          <div class="muted">${safeVal(stu.studentId)} • ${classLabel(stu.standard)}-${safeVal(stu.section)} • ${safeVal(stu.academicYear)}</div>
          ${feeLine ? `<div class="muted" style="margin-top:6px">${feeLine}</div>` : ``}
        </div>
      </div>

      <div class="pGrid">
        <div class="pItem"><div class="pKey">Date of Birth</div><div class="pVal">${stu.dateOfBirth ? fmtDate(stu.dateOfBirth) : "-"}</div></div>
        <div class="pItem"><div class="pKey">Gender</div><div class="pVal">${safeVal(stu.gender)}</div></div>

        <div class="pItem"><div class="pKey">Student Phone</div><div class="pVal">${safeVal(stu.phoneNumber)}</div></div>
        <div class="pItem"><div class="pKey">Parent Phone</div><div class="pVal">${safeVal(stu.parentPhoneNumber)}</div></div>

        <div class="pItem"><div class="pKey">Other Number</div><div class="pVal">${safeVal(stu.otherNumber)}</div></div>
        <div class="pItem"><div class="pKey">Address</div><div class="pVal">${safeVal(stu.address)}</div></div>

        <div class="pItem"><div class="pKey">Father Name</div><div class="pVal">${safeVal(stu.fatherName)}</div></div>
        <div class="pItem"><div class="pKey">Mother Name</div><div class="pVal">${safeVal(stu.motherName)}</div></div>

        <div class="pItem"><div class="pKey">Father Occupation</div><div class="pVal">${safeVal(stu.fatherOccupation)}</div></div>
        <div class="pItem"><div class="pKey">Student Email</div><div class="pVal">${safeVal(stu.studentEmailId)}</div></div>

        <div class="pItem"><div class="pKey">Parent Email</div><div class="pVal">${safeVal(stu.parentEmailId)}</div></div>
        <div class="pItem"><div class="pKey">Caste / Religion</div><div class="pVal">${safeVal(stu.caste)} / ${safeVal(stu.religion)}</div></div>

        <div class="pItem"><div class="pKey">Active</div><div class="pVal">${stu.active ? "✅ Active" : "❌ Inactive"}</div></div>
        <div class="pItem"><div class="pKey">Academic Year</div><div class="pVal">${safeVal(stu.academicYear)}</div></div>
      </div>
    `;

    profileModal.style.display = "grid";
  }

  pClose.addEventListener("click", closeProfileModal);
  pOk.addEventListener("click", closeProfileModal);
  profileModal.addEventListener("click", (e)=>{ if(e.target === profileModal) closeProfileModal(); });

  return { openProfileModal, closeProfileModal };
}

/* ================================
   FEES PAGE LOADER
================================ */
async function loadFeesPage(){
  showFeesArea();

  pageTitle.textContent = "Fees Overview";
  pageSub.textContent = "Manage fees and dues";

  pageRoot.innerHTML = `
    <div class="card" style="background:#fff;border:1px solid #e7e9ff;border-radius:18px;padding:14px">
      <div class="muted">Loading...</div>
    </div>
  `;

  const overview = await fetchJson("/office/api/fees/overview");
  const students = await fetchJson("/office/api/fees/students");
  renderFees(overview, students);
}

/* ================================
   FEES PAGE RENDER (your same logic)
================================ */
function renderFees(ov, rows){
  ensureOfficeStyle();

  pageRoot.innerHTML = `
    <div class="grid">
      <div class="card">
        <div class="k">Students</div>
        <div class="v">${money(ov.totalStudents)}</div>
      </div>
      <div class="card">
        <div class="k">Total Fee</div>
        <div class="v">₹ ${money(ov.totalFee)}</div>
      </div>
      <div class="card">
        <div class="k">Paid</div>
        <div class="v">₹ ${money(ov.totalPaid)}</div>
      </div>
      <div class="card">
        <div class="k">Due</div>
        <div class="v">₹ ${money(ov.totalDue)}</div>
      </div>
      <div class="card">
        <div class="k">Hall Ticket Blocked</div>
        <div class="v">${money(ov.hallTicketBlocked)}</div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-head">
        <div>
          <div style="font-weight:900;font-size:16px">Student Fee Accounts</div>
          <div class="muted">Use filters below. Click “Edit” to update fees and hall ticket status. Click student to view profile.</div>
        </div>

        <div class="tools">
          <input id="q" class="inp" placeholder="Search studentId / name..." />
          <button class="btn" id="btnSearch" type="button">Search</button>
          <button class="btn" id="btnBootstrap" type="button">Initialize Fee Accounts</button>
          <button class="btn dark" id="btnReload" type="button">Reload</button>
        </div>

        <div class="filters">
          <div class="fgrp">
            <div class="flbl">Class</div>
            <select id="fClass" class="inp">${classOptionsHtml()}</select>
          </div>

          <div class="fgrp">
            <div class="flbl">Section</div>
            <input id="fSection" class="inp" placeholder="A / B / C..." />
          </div>

          <div class="fgrp">
            <div class="flbl">Due</div>
            <div class="frow">
              <select id="fDueOp" class="inp">
                <option value="">Any</option>
                <option value="gte">Above / Equal</option>
                <option value="lte">Below / Equal</option>
              </select>
              <input id="fDueAmt" class="inp" type="number" min="0" placeholder="Amount" />
            </div>
          </div>

          <div class="fgrp">
            <div class="flbl">Next Due Date</div>
            <input id="fDueDate" class="inp" type="date" />
          </div>

          <div class="fgrp">
            <div class="flbl">Hall Ticket</div>
            <select id="fHall" class="inp">
              <option value="">All</option>
              <option value="allowed">Allowed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div class="fgrp">
            <div class="flbl">Sort By</div>
            <select id="fSort" class="inp">
              <option value="class">Class</option>
              <option value="hall_blocked_first">Hall Ticket (Blocked first)</option>
              <option value="hall_allowed_first">Hall Ticket (Allowed first)</option>
            </select>
          </div>

          <div class="fgrp">
            <div class="flbl">Quick</div>
            <button class="btn" id="btnClearFilters" type="button">Clear Filters</button>
          </div>
        </div>
      </div>

      <div class="tableWrap">
        <table class="tbl">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Next Due</th>
              <th>Hall Ticket</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>

      <div id="err" class="err" style="display:none"></div>
    </div>

    <div class="modal" id="modal" style="display:none">
      <div class="modalCard">
        <div class="mHead">
          <div>
            <div style="font-weight:900">Edit Fee</div>
            <div class="muted" id="mSub">—</div>
          </div>
          <button class="iconbtn" id="mClose" type="button">✕</button>
        </div>

        <div class="mBody">
          <label class="field">
            <span>Total Fee</span>
            <input class="inp" id="mTotal" type="number" min="0"/>
          </label>

          <label class="field">
            <span>Paid Amount</span>
            <input class="inp" id="mPaid" type="number" min="0"/>
          </label>

          <label class="field">
            <span>Next Due Date</span>
            <input class="inp" id="mNext" type="date"/>
          </label>

          <label class="field">
            <span>Hall Ticket Allowed</span>
            <select class="inp" id="mHall">
              <option value="true">Allowed</option>
              <option value="false">Blocked</option>
            </select>
          </label>

          <div id="mErr" class="err" style="display:none"></div>
        </div>

        <div class="mActions">
          <button class="btn" id="mCancel" type="button">Cancel</button>
          <button class="btn dark" id="mSave" type="button">Save</button>
        </div>
      </div>
    </div>

    ${profileModalHtml()}
  `;

  const tbody = document.getElementById("tbody");
  const err = document.getElementById("err");

  function showErr(msg){ err.style.display = "block"; err.textContent = msg; }
  function clearErr(){ err.style.display = "none"; err.textContent = ""; }

  function rowHtml(r){
    const hall = r.hallTicketAllowed ? `<span class="tag ok">Allowed</span>` : `<span class="tag no">Blocked</span>`;
    const img = r.photoUrl ? r.photoUrl : safeImgUrl(r.studentName);

    return `
      <tr>
        <td>
          <button class="profileBtn" data-sid="${r.studentId}" type="button"
            style="all:unset;cursor:pointer;display:flex;gap:10px;align-items:center">
            <img src="${img}" onerror="this.src='${safeImgUrl(r.studentName)}'"
              style="width:36px;height:36px;border-radius:12px;object-fit:cover;border:1px solid #e7e9ff"
              alt="photo"/>
            <div>
              <b>${r.studentName}</b>
              <div class="muted">${r.studentId}</div>
            </div>
          </button>
        </td>
        <td>${classLabel(r.standard)}-${r.section || "-"}</td>
        <td>₹ ${money(r.totalFee)}</td>
        <td>₹ ${money(r.paidAmount)}</td>
        <td><b>₹ ${money(r.dueAmount)}</b></td>
        <td>${r.nextDueDate ? fmtDate(r.nextDueDate) : "-"}</td>
        <td>${hall}</td>
        <td><button class="btn dark editBtn" data-id="${r.studentId}" type="button">Edit</button></td>
      </tr>
    `;
  }

  const allRows = Array.isArray(rows) ? rows : [];
  let currentRows = [...allRows];

  function renderTable(list){
    tbody.innerHTML = (list && list.length) ? list.map(rowHtml).join("")
      : `<tr><td colspan="8" class="muted">No students found</td></tr>`;
  }

  function applyFilters(){
    const fClass = document.getElementById("fClass").value;
    const fSection = document.getElementById("fSection").value.trim();
    const fDueOp = document.getElementById("fDueOp").value;
    const fDueAmt = Number(document.getElementById("fDueAmt").value || 0);
    const fDueDate = document.getElementById("fDueDate").value;
    const fHall = document.getElementById("fHall").value;
    const fSort = document.getElementById("fSort").value;

    let list = [...currentRows];

    if(fClass !== ""){
      const cls = Number(fClass);
      list = list.filter(r => Number(r.standard) === cls);
    }
    if(fSection){
      const sec = fSection.toLowerCase();
      list = list.filter(r => String(r.section || "").toLowerCase() === sec);
    }
    if(fDueOp && Number.isFinite(fDueAmt) && fDueAmt >= 0){
      if(fDueOp === "gte") list = list.filter(r => Number(r.dueAmount || 0) >= fDueAmt);
      if(fDueOp === "lte") list = list.filter(r => Number(r.dueAmount || 0) <= fDueAmt);
    }
    if(fDueDate){
      list = list.filter(r => String(r.nextDueDate || "") === fDueDate);
    }
    if(fHall === "allowed") list = list.filter(r => !!r.hallTicketAllowed);
    if(fHall === "blocked") list = list.filter(r => !r.hallTicketAllowed);

    if(fSort === "hall_blocked_first"){
      list.sort((a,b) => Number(!!a.hallTicketAllowed) - Number(!!b.hallTicketAllowed));
    }else if(fSort === "hall_allowed_first"){
      list.sort((a,b) => Number(!!b.hallTicketAllowed) - Number(!!a.hallTicketAllowed));
    }else{
      list.sort((a,b) => {
        const sa = Number(a.standard ?? 0), sb = Number(b.standard ?? 0);
        if(sa !== sb) return sa - sb;
        const sec = String(a.section||"").localeCompare(String(b.section||""));
        if(sec !== 0) return sec;
        return String(a.studentName||"").localeCompare(String(b.studentName||""));
      });
    }

    renderTable(list);
  }

  renderTable(currentRows);

  // Fee Edit Modal
  const modal = document.getElementById("modal");
  const mClose = document.getElementById("mClose");
  const mCancel = document.getElementById("mCancel");
  const mSave = document.getElementById("mSave");
  const mSub = document.getElementById("mSub");
  const mTotal = document.getElementById("mTotal");
  const mPaid = document.getElementById("mPaid");
  const mNext = document.getElementById("mNext");
  const mHall = document.getElementById("mHall");
  const mErr = document.getElementById("mErr");

  let selected = null;

  function openModal(r){
    selected = r;
    mSub.textContent = `${r.studentName} (${r.studentId}) • ${classLabel(r.standard)}-${r.section}`;
    mTotal.value = r.totalFee ?? 0;
    mPaid.value = r.paidAmount ?? 0;
    mNext.value = r.nextDueDate || "";
    mHall.value = String(!!r.hallTicketAllowed);
    mErr.style.display = "none";
    mErr.textContent = "";
    modal.style.display = "grid";
  }
  function closeModal(){ modal.style.display = "none"; selected = null; }

  mClose.addEventListener("click", closeModal);
  mCancel.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if(e.target === modal) closeModal(); });

  // Profile modal wiring
  const profileRef = { list: currentRows };
  const { openProfileModal } = wireProfileModal(profileRef);

  // Table clicks
  tbody.addEventListener("click", async (e) => {
    const pBtn = e.target.closest(".profileBtn");
    if(pBtn){
      try{
        clearErr();
        const sid = pBtn.dataset.sid;
        const stu = await fetchStudentDetails(sid);
        openProfileModal(stu);
      }catch(ex){
        showErr(ex.message || String(ex));
      }
      return;
    }

    const b = e.target.closest(".editBtn");
    if(!b) return;
    const id = b.dataset.id;
    const r = currentRows.find(x => String(x.studentId) === String(id));
    if(r) openModal(r);
  });

  // Save fee changes
  mSave.addEventListener("click", async () => {
    try{
      if(!selected) return;

      const total = Number(mTotal.value || 0);
      const paid = Number(mPaid.value || 0);
      if(total < 0 || paid < 0) throw new Error("Amounts must be >= 0");
      if(paid > total) throw new Error("Paid cannot be greater than Total");

      const body = {
        totalFee: total,
        paidAmount: paid,
        nextDueDate: mNext.value || null,
        hallTicketAllowed: (mHall.value === "true")
      };

      const updated = await putJson(`/office/api/fees/students/${encodeURIComponent(selected.studentId)}`, body);

      for(let i=0;i<allRows.length;i++){
        if(allRows[i].studentId === updated.studentId) allRows[i] = updated;
      }
      currentRows = [...allRows];
      profileRef.list = currentRows;

      closeModal();

      const newOv = await fetchJson("/office/api/fees/overview");
      renderFees(newOv, currentRows);
    }catch(ex){
      mErr.style.display = "block";
      mErr.textContent = ex.message || String(ex);
    }
  });

  // search
  document.getElementById("btnSearch").addEventListener("click", async () => {
    try{
      clearErr();
      const q = document.getElementById("q").value.trim();
      const list = await fetchJson(`/office/api/fees/students?q=${encodeURIComponent(q)}`);
      currentRows = Array.isArray(list) ? list : [];
      profileRef.list = currentRows;
      renderTable(currentRows);
      applyFilters();
    }catch(ex){ showErr(ex.message || String(ex)); }
  });

  // bootstrap
  document.getElementById("btnBootstrap").addEventListener("click", async () => {
    try{
      clearErr();
      const ok = confirm("This will create fee accounts for all ACTIVE students who don't have one yet. Continue?");
      if(!ok) return;

      const resp = await postJson("/office/api/fees/bootstrap");

      alert(
        `Fee Accounts Initialized ✅\n\n` +
        `Active Students: ${resp.totalActiveStudents}\n` +
        `Created: ${resp.created}\n` +
        `Already Exists: ${resp.skippedAlreadyExists}`
      );

      await loadFeesPage();
    }catch(ex){
      showErr(ex.message || String(ex));
    }
  });

  // reload
  document.getElementById("btnReload").addEventListener("click", async () => {
    try{
      clearErr();
      const newOv = await fetchJson("/office/api/fees/overview");
      const list = await fetchJson("/office/api/fees/students");
      renderFees(newOv, list);
    }catch(ex){ showErr(ex.message || String(ex)); }
  });

  // filters listeners
  const fClassEl = document.getElementById("fClass");
  const fSectionEl = document.getElementById("fSection");
  const fDueOpEl = document.getElementById("fDueOp");
  const fDueAmtEl = document.getElementById("fDueAmt");
  const fDueDateEl = document.getElementById("fDueDate");
  const fHallEl = document.getElementById("fHall");
  const fSortEl = document.getElementById("fSort");

  [fClassEl, fDueOpEl, fDueDateEl, fHallEl, fSortEl].forEach(el => el.addEventListener("change", applyFilters));
  [fSectionEl, fDueAmtEl].forEach(el => el.addEventListener("input", applyFilters));

  document.getElementById("btnClearFilters").addEventListener("click", () => {
    fClassEl.value = "";
    fSectionEl.value = "";
    fDueOpEl.value = "";
    fDueAmtEl.value = "";
    fDueDateEl.value = "";
    fHallEl.value = "";
    fSortEl.value = "class";
    applyFilters();
  });

  applyFilters();
}

/* ================================
   ROUTER (fees + iframe transactions)
================================ */
async function loadPage(page){
  setActive(page);
  if(window.innerWidth <= 900) sidebar.classList.remove("active");

  if(page === "fees"){
    return loadFeesPage();
  }

  if(page === "transactions"){
    pageTitle.textContent = "Transactions";
    pageSub.textContent = "Add and view student fee transactions";

    // ✅ Load your separate page inside iframe
    // Put correct path here:
    showIframe("/office/office-transactions.html");
    return;
  }

  pageTitle.textContent = "Coming Soon";
  pageSub.textContent = `Module: ${page}`;
  showFeesArea();
  pageRoot.innerHTML = `
    <div style="background:#fff;border:1px solid #e7e9ff;border-radius:18px;padding:14px">
      <div style="font-weight:900">Coming Soon</div>
      <div class="muted" style="margin-top:6px">We will build this next feature-by-feature.</div>
    </div>
  `;
}

navBtns.forEach(b => b.addEventListener("click", ()=> loadPage(b.dataset.page)));

// init
loadPage("fees");