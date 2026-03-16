console.log("✅ student-doubts.js loaded");

// ===== session =====
function getSession() {
  try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
  catch { return {}; }
}
function logout() {
  localStorage.removeItem("smp_session");
  window.location.href = "/login/login.html";
}

const session = getSession();
const studentId = session.username;

if (!studentId) {
  alert("Session expired. Please login again.");
  logout();
}

const IS_EMBEDDED = window.self !== window.top;

// ===== api =====
async function apiFetch(url, opts = {}) {
  const headers = { ...(opts.headers || {}) };

  if (session.basicToken) {
    let tok = String(session.basicToken).trim();
    if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
    headers.Authorization = `Basic ${tok}`;
  }

  if (opts.json !== false) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...opts, headers });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }

  const text = await res.text().catch(() => "");
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

// ===== dom =====
const topbar = document.getElementById("topbar");
const btnBack = document.getElementById("btnBack");
const btnLogout = document.getElementById("btnLogout");

const teacherList = document.getElementById("teacherList");
const myList = document.getElementById("myList");
const statusFilter = document.getElementById("statusFilter");
document.getElementById("btnRefreshTeachers").onclick = loadTeachers;
document.getElementById("btnRefreshMy").onclick = loadMyDoubts;
statusFilter.onchange = loadMyDoubts;

// send modal
const sendModal = document.getElementById("sendModal");
const sendClose = document.getElementById("sendClose");
const sendCancel = document.getElementById("sendCancel");
const sendForm = document.getElementById("sendForm");
const sendErr = document.getElementById("sendErr");
const sendToLine = document.getElementById("sendToLine");
const dTitle = document.getElementById("dTitle");
const dTopic = document.getElementById("dTopic");
const dDesc = document.getElementById("dDesc");

// thread modal
const threadModal = document.getElementById("threadModal");
const threadClose = document.getElementById("threadClose");
const thTitle = document.getElementById("thTitle");
const thMeta = document.getElementById("thMeta");
const msgList = document.getElementById("msgList");
const replyForm = document.getElementById("replyForm");
const replyText = document.getElementById("replyText");
const threadErr = document.getElementById("threadErr");

// topbar actions
if (btnBack) btnBack.onclick = () => window.history.back();
if (btnLogout) btnLogout.onclick = logout;

if (IS_EMBEDDED) {
  document.body.classList.add("embedded");
  if (topbar) topbar.style.display = "none";
}

// state
let assignedTeachers = [];
let currentSend = null;
let currentThread = null;

function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }

function setErr(el,msg){
  if(!msg){ hide(el); el.textContent=""; }
  else { el.textContent=msg; show(el); }
}
function safe(v){ return v==null ? "" : String(v); }

function badge(status){
  if(status==="OPEN") return `<span class="badge open">PENDING</span>`;
  if(status==="ANSWERED") return `<span class="badge answered">ANSWERED</span>`;
  return `<span class="badge closed">CLOSED</span>`;
}
function fmtTime(t){
  if(!t) return "";
  return String(t).replace("T"," ").slice(0,16);
}

function lockScroll(){ document.body.classList.add("modal-open"); }
function unlockScroll(){ document.body.classList.remove("modal-open"); }

function closeSendModal(){
  hide(sendModal);
  currentSend = null;
  setErr(sendErr, "");
  unlockScroll();
}
function closeThread(){
  hide(threadModal);
  currentThread = null;
  setErr(threadErr, "");
  unlockScroll();
}

function openSendModal(t){
  closeThread(); // ensure only one modal
  currentSend = t;
  sendToLine.textContent = `To: ${t.teacherName} • ${t.subjectName} • Class ${t.standard}-${t.section}`;
  dTitle.value = "";
  dTopic.value = "";
  dDesc.value = "";
  setErr(sendErr,"");
  show(sendModal);
  lockScroll();
}

async function openThread(doubtId){
  closeSendModal(); // ensure only one modal
  setErr(threadErr,"");
  msgList.innerHTML = `<div class="muted">Loading...</div>`;
  show(threadModal);
  lockScroll();

  try{
    const data = await apiFetch(
      `/student/api/doubts/${encodeURIComponent(doubtId)}/student/${encodeURIComponent(studentId)}`,
      { method:"GET", json:false }
    );

    currentThread = { id: doubtId };

    thTitle.textContent = data.title || "Doubt";
    thMeta.textContent = `Status: ${data.status} • Teacher Viewed: ${data.teacherViewed ? "YES" : "NO"} • Last: ${fmtTime(data.lastMessageAt)}`;

    renderMsgs(data.messages || []);
    await loadMyDoubts();
  }catch(err){
    setErr(threadErr, err.message || String(err));
  }
}

// close buttons
sendClose.onclick = closeSendModal;
sendCancel.onclick = closeSendModal;
threadClose.onclick = closeThread;

// close when clicking backdrop
sendModal.addEventListener("click", (e) => {
  if (e.target === sendModal) closeSendModal();
});
threadModal.addEventListener("click", (e) => {
  if (e.target === threadModal) closeThread();
});

// ESC closes
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!sendModal.classList.contains("hidden")) closeSendModal();
    if (!threadModal.classList.contains("hidden")) closeThread();
  }
});

// render teachers
function renderTeachers(list){
  teacherList.innerHTML = "";
  if(!list.length){
    teacherList.innerHTML = `<div class="muted">No teachers assigned yet for your class/section.</div>`;
    return;
  }

  list.forEach(t=>{
    const el = document.createElement("div");
    el.className = "teacher";
    el.innerHTML = `
      <img class="avatar" src="${t.profileUrl || "https://ui-avatars.com/api/?name=Teacher&background=5b5ef7&color=fff&size=128"}" alt=""/>
      <div class="tmeta">
        <div class="tname">${safe(t.teacherName)}</div>
        <div class="tsub">Subject: <b>${safe(t.subjectName)}</b> • Class ${safe(t.standard)}-${safe(t.section)}</div>
      </div>
      <div class="pill">Ask Doubt</div>
    `;
    el.onclick = ()=>openSendModal(t);
    teacherList.appendChild(el);
  });
}

// send doubt
sendForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  setErr(sendErr,"");

  try{
    if(!currentSend) throw new Error("Teacher not selected");
    const payload = {
      studentId,
      teacherId: currentSend.teacherId,
      standardSubjectId: Number(currentSend.standardSubjectId),
      section: currentSend.section,
      title: dTitle.value.trim(),
      topic: dTopic.value.trim() || null,
      description: dDesc.value.trim()
    };

    if(!payload.title) throw new Error("Title is required");
    if(!payload.description) throw new Error("Description is required");

    const res = await apiFetch("/student/api/doubts", {
      method:"POST",
      body: JSON.stringify(payload)
    });

    closeSendModal();
    alert(String(res || "Doubt sent."));
    await loadMyDoubts();
  }catch(err){
    setErr(sendErr, err.message || String(err));
  }
});

// render my doubts
function renderMy(list){
  myList.innerHTML = "";
  if(!list.length){
    myList.innerHTML = `<div class="muted">No doubts yet. Select a teacher and ask your first doubt.</div>`;
    return;
  }

  list.forEach(d=>{
    const el = document.createElement("div");
    el.className = "doubt";
    el.innerHTML = `
      <div>
        <div class="dtitle">${safe(d.title)}</div>
        <div class="dmeta">
          ${badge(d.status)}
          • Topic: <b>${safe(d.topic || "—")}</b>
          • Viewed by Teacher: <b>${d.teacherViewed ? "YES ✅" : "NO ⏳"}</b>
          • Last: ${safe(fmtTime(d.lastMessageAt))}
        </div>
      </div>
      <button class="btn" type="button">Open</button>
    `;

    el.querySelector("button").onclick = ()=>openThread(d.id);
    myList.appendChild(el);
  });
}

// thread msgs
function renderMsgs(msgs){
  msgList.innerHTML = "";
  if(!msgs.length){
    msgList.innerHTML = `<div class="muted">No messages yet.</div>`;
    return;
  }

  msgs.forEach(m=>{
    const div = document.createElement("div");
    div.className = "msg " + (m.senderRole === "STUDENT" ? "me" : "");
    div.innerHTML = `
      <div class="who">${m.senderRole === "STUDENT" ? "You" : "Teacher"} • ${safe(m.senderId)}</div>
      <div>${safe(m.message)}</div>
      <div class="time">${fmtTime(m.createdAt)}</div>
    `;
    msgList.appendChild(div);
  });

  msgList.scrollTop = msgList.scrollHeight;
}

replyForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  setErr(threadErr,"");

  try{
    if(!currentThread?.id) throw new Error("Thread not opened");
    const text = replyText.value.trim();
    if(!text) return;

    await apiFetch(`/student/api/doubts/${encodeURIComponent(currentThread.id)}/student/${encodeURIComponent(studentId)}/messages`, {
      method:"POST",
      body: JSON.stringify({ message: text })
    });

    replyText.value = "";
    await openThread(currentThread.id);
  }catch(err){
    setErr(threadErr, err.message || String(err));
  }
});

// loaders
async function loadTeachers(){
  teacherList.innerHTML = `<div class="muted">Loading...</div>`;
  try{
    assignedTeachers = await apiFetch(`/student/api/doubts/assigned-teachers/${encodeURIComponent(studentId)}`, { method:"GET", json:false }) || [];
    renderTeachers(assignedTeachers);
  }catch(err){
    teacherList.innerHTML = `<div class="error">${safe(err.message || err)}</div>`;
  }
}

async function loadMyDoubts(){
  myList.innerHTML = `<div class="muted">Loading...</div>`;
  try{
    const status = statusFilter.value;
    const url = status
      ? `/student/api/doubts/my/${encodeURIComponent(studentId)}?status=${encodeURIComponent(status)}`
      : `/student/api/doubts/my/${encodeURIComponent(studentId)}`;

    const list = await apiFetch(url, { method:"GET", json:false }) || [];
    renderMy(list);
  }catch(err){
    myList.innerHTML = `<div class="error">${safe(err.message || err)}</div>`;
  }
}

// init
loadTeachers();
loadMyDoubts();
