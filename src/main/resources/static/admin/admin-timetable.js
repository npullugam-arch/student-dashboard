console.log("✅ admin-timetable.js loaded");

// ---- AUTH (reuse your smp_session) ----
function getSession(){
  try { return JSON.parse(localStorage.getItem("smp_session") || "null"); } catch { return null; }
}
function normalizeToken(raw){
  if(!raw) return "";
  let tok = String(raw).trim();
  if(/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i,"").trim();
  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
  if(!looksBase64 && tok.includes(":")) tok = btoa(tok);
  return tok;
}

const sess = getSession();
if(!sess || (String(sess.role||"").toUpperCase()!=="ADMIN")){
  alert("Admin session required");
  window.location.href = "/login/admin.html";
}

const basicToken = normalizeToken(sess?.basicToken);

async function api(url, opts={}){
  const headers = { "Content-Type":"application/json", ...(opts.headers||{}) };
  if(basicToken) headers.Authorization = "Basic " + basicToken;

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text().catch(()=> "");

  if(!res.ok) throw new Error(text || ("HTTP "+res.status));
  if(!text) return null;

  try { return JSON.parse(text); } catch { return text; }
}

const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];

const $ = (id)=>document.getElementById(id);
const ttBody = $("ttBody");
const err = $("err");
const ok = $("ok");

function showErr(msg){ err.style.display="block"; err.textContent=msg; ok.style.display="none"; }
function showOk(msg){ ok.style.display="block"; ok.textContent=msg; err.style.display="none"; }
function clearMsg(){ err.style.display="none"; ok.style.display="none"; err.textContent=""; ok.textContent=""; }

let model = { standard:10, section:"", slots:[] };

function escapeHtml(str){
  return String(str||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;");
}

function render(){
  if(!model.slots.length){
    ttBody.innerHTML = `<tr><td colspan="7" class="muted">No slots. Click “Add Time Slot”.</td></tr>`;
    return;
  }

  model.slots.sort((a,b)=>(a.slotOrder||0)-(b.slotOrder||0));

  ttBody.innerHTML = model.slots.map((s, idx)=>{
    const time = `
      <div style="display:flex;gap:8px;align-items:center">
        <input class="cellInp" style="max-width:92px" value="${escapeHtml(s.startTime||"")}" placeholder="09:00"
               data-k="startTime" data-i="${idx}">
        <span class="muted">→</span>
        <input class="cellInp" style="max-width:92px" value="${escapeHtml(s.endTime||"")}" placeholder="09:45"
               data-k="endTime" data-i="${idx}">
      </div>
      <div style="margin-top:8px;display:flex;gap:8px">
        <button class="btn" type="button" data-act="up" data-i="${idx}">↑</button>
        <button class="btn" type="button" data-act="down" data-i="${idx}">↓</button>
        <button class="btn" type="button" data-act="del" data-i="${idx}">Delete</button>
      </div>
    `;

    const tds = DAYS.map(d=>{
      const val = (s.subjectsByDay && s.subjectsByDay[d] != null) ? s.subjectsByDay[d] : "—";
      return `<td>
        <input class="cellInp" value="${escapeHtml(val)}" data-day="${d}" data-i="${idx}" placeholder="Subject"/>
      </td>`;
    }).join("");

    return `<tr>
      <td class="time">${time}</td>
      ${tds}
    </tr>`;
  }).join("");
}

function addSlot(){
  const nextOrder = model.slots.length ? Math.max(...model.slots.map(x=>x.slotOrder||0))+1 : 1;
  const subjects = {};
  DAYS.forEach(d=>subjects[d]="—");
  model.slots.push({ slotOrder: nextOrder, startTime:"", endTime:"", subjectsByDay: subjects });
  render();
}

function getStandard(){
  return Number($("standard").value);
}

function getSection(){
  return String($("section").value || "").trim().toUpperCase();
}

async function load(){
  clearMsg();

  const standard = getStandard();
  const section = getSection();

  if(!section) throw new Error("Please enter Section (e.g., A)");

  model.standard = standard;
  model.section = section;

  const data = await api(`/admin/api/timetable/${standard}/${encodeURIComponent(section)}`);

  const slots = (data?.rows || []).map(r=>({
    slotOrder: r.slotOrder,
    startTime: r.startTime,
    endTime: r.endTime,
    subjectsByDay: r.subjectsByDay || {}
  }));

  model.slots = slots;
  render();
  showOk("Loaded ✅");
}

async function save(){
  clearMsg();

  const standard = getStandard();
  const section = getSection();

  if(!section) throw new Error("Please enter Section (e.g., A)");

  // validate
  for(const s of model.slots){
    if(!s.startTime || !s.endTime) throw new Error("Every slot must have start & end time");
  }

  const payload = {
    standard,
    section,
    slots: model.slots.map((s, idx)=>({
      slotOrder: idx+1, // normalize order by UI order
      startTime: s.startTime,
      endTime: s.endTime,
      subjectsByDay: s.subjectsByDay || {}
    }))
  };

  const res = await api("/admin/api/timetable", { method:"POST", body: JSON.stringify(payload) });
  showOk(String(res || "Saved ✅"));
  await load();
}

// Table interactions
ttBody.addEventListener("input", (e)=>{
  const i = Number(e.target.dataset.i);
  if(Number.isNaN(i) || !model.slots[i]) return;

  if(e.target.dataset.k === "startTime") model.slots[i].startTime = e.target.value;
  if(e.target.dataset.k === "endTime") model.slots[i].endTime = e.target.value;

  const day = e.target.dataset.day;
  if(day){
    model.slots[i].subjectsByDay = model.slots[i].subjectsByDay || {};
    model.slots[i].subjectsByDay[day] = e.target.value;
  }
});

ttBody.addEventListener("click", (e)=>{
  const act = e.target.dataset.act;
  const i = Number(e.target.dataset.i);
  if(!act || Number.isNaN(i) || !model.slots[i]) return;

  if(act==="del"){
    model.slots.splice(i,1);
    render();
    return;
  }
  if(act==="up" && i>0){
    const tmp = model.slots[i-1];
    model.slots[i-1]=model.slots[i];
    model.slots[i]=tmp;
    render();
    return;
  }
  if(act==="down" && i<model.slots.length-1){
    const tmp = model.slots[i+1];
    model.slots[i+1]=model.slots[i];
    model.slots[i]=tmp;
    render();
    return;
  }
});

$("btnAddSlot").addEventListener("click", ()=>{ clearMsg(); addSlot(); });
$("btnLoad").addEventListener("click", ()=>load().catch(e=>showErr(e.message)));
$("btnSave").addEventListener("click", ()=>save().catch(e=>showErr(e.message)));

// initial
render();
