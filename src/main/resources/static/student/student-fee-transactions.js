console.log("✅ student_fee_transactions.js loaded");

// =============================
// Session + Auth (same pattern)
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

function requireStudent(){
  const s = getSession();
  if(!s.username || String(s.role||"").toUpperCase() !== "STUDENT"){
    alert("Session expired. Please login again.");
    window.location.href = "/login/student.html";
    throw new Error("No student session");
  }
  s.basicToken = normalizeToken(s.basicToken);
  return s;
}

const session = requireStudent();
const studentId = session.username;         // ex: S1001
const basicToken = session.basicToken;

function authHeaders(){
  return {
    Authorization: `Basic ${basicToken}`,
    "Content-Type":"application/json"
  };
}

// =============================
// Robust fetch helpers
// =============================
async function fetchJsonStrict(url){
  const res = await fetch(url, { headers: authHeaders() });

  if(res.status === 401 || res.status === 403){
    localStorage.removeItem("smp_session");
    window.location.href = "/login/student.html";
    throw new Error("Unauthorized");
  }

  if(!res.ok){
    const txt = await res.text().catch(()=> "");
    const msg = txt || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.httpStatus = res.status;
    err.url = url;
    throw err;
  }

  return res.json();
}

/**
 * ✅ Try multiple endpoints until one works.
 * Returns { data, url } or throws final error with triedUrls.
 */
async function fetchFirstOk(urls){
  const tried = [];
  let lastErr = null;

  for(const url of urls){
    tried.push(url);
    try{
      const data = await fetchJsonStrict(url);
      return { data, url };
    }catch(e){
      lastErr = e;

      // If it's not 404, stop early (ex: 500/400) because endpoint exists but error is real.
      if(e && e.httpStatus && e.httpStatus !== 404){
        e.triedUrls = tried;
        throw e;
      }
      // else continue trying next url
    }
  }

  const finalErr = lastErr || new Error("API not found");
  finalErr.triedUrls = tried;
  throw finalErr;
}

// =============================
// UI Refs (NEW UI ids)
// =============================
const studentChip = document.getElementById("studentChip");

const summaryGrid = document.getElementById("summaryGrid");
const tbody = document.getElementById("tbody");
const errBox = document.getElementById("err");

const sortBy = document.getElementById("sortBy");
const q = document.getElementById("q");
const btnClear = document.getElementById("btnClear");
const btnReload = document.getElementById("btnReload");

studentChip.textContent = `STUDENT • ${studentId}`;

function showErr(msg){
  errBox.style.display = "block";
  errBox.textContent = msg;
}
function clearErr(){
  errBox.style.display = "none";
  errBox.textContent = "";
}

function money(n){
  const v = Number(n||0);
  return v.toLocaleString("en-IN");
}
function fmtDate(iso){
  if(!iso) return "-";
  const s = String(iso);
  const parts = s.split("-");
  if(parts.length !== 3) return s;
  const [y,m,d] = parts;
  return `${d}-${m}-${y}`;
}

// =============================
// Data state
// =============================
let allTx = [];

// =============================
// Summary render (UI of first code + icons added)
// =============================
function renderSummary(raw){
  const s = raw || {};

  const totalFee = s.totalFee ?? s.total_amount ?? s.feeTotal ?? 0;
  const paidAmount = s.paidAmount ?? s.paid_amount ?? s.totalPaid ?? 0;
  const dueAmount = s.dueAmount ?? s.due_amount ?? s.totalDue ?? 0;
  const nextDueDate = s.nextDueDate ?? s.next_due_date ?? s.dueDate ?? null;
  const hallTicketAllowed = s.hallTicketAllowed ?? s.hall_ticket_allowed ?? s.hallTicket ?? true;

  summaryGrid.innerHTML = `
    <div class="sum-card a-total">
      <div class="sum-accent"></div>
      <div class="sum-head">
        <div class="sum-label">Total Fee</div>
        <div class="sum-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M7 7h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" />
            <path d="M7 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </div>
      <div class="sum-value">₹ ${money(totalFee)}</div>
    </div>

    <div class="sum-card a-paid">
      <div class="sum-accent"></div>
      <div class="sum-head">
        <div class="sum-label">Paid</div>
        <div class="sum-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </div>
      <div class="sum-value">₹ ${money(paidAmount)}</div>
    </div>

    <div class="sum-card a-due">
      <div class="sum-accent"></div>
      <div class="sum-head">
        <div class="sum-label">Due</div>
        <div class="sum-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path d="M12 17h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
            <path d="M10.3 4.7h3.4L21 18.5A2 2 0 0 1 19.3 21H4.7A2 2 0 0 1 3 18.5L10.3 4.7Z" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
      </div>
      <div class="sum-value">₹ ${money(dueAmount)}</div>
    </div>

    <div class="sum-card a-date">
      <div class="sum-accent"></div>
      <div class="sum-head">
        <div class="sum-label">Next Due Date</div>
        <div class="sum-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M8 3v3M16 3v3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path d="M4.5 8.5h15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <path d="M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="2" />
          </svg>
        </div>
      </div>
      <div class="sum-value">${nextDueDate ? fmtDate(String(nextDueDate).slice(0,10)) : "-"}</div>
      <div class="sum-sub">
        <span class="pill-success">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          ${hallTicketAllowed ? "Hall Ticket Allowed" : "Hall Ticket Blocked"}
        </span>
      </div>
    </div>
  `;
}

// =============================
// Transactions rendering (same logic)
// =============================
function normalizeTx(t){
  return {
    paidDate: t.paidDate ?? t.date ?? t.txDate ?? t.paymentDate ?? t.createdAt ?? null,
    paidAmount: t.paidAmount ?? t.amountPaid ?? t.amount ?? t.paid ?? 0,
    paidTotalAfter: t.paidTotalAfter ?? t.paidTotal ?? t.totalPaidAfter ?? t.paid_after ?? 0,
    dueAfter: t.dueAfter ?? t.due ?? t.dueAmountAfter ?? t.due_after ?? 0,
    nextDueDate: t.nextDueDate ?? t.next_due_date ?? t.nextDue ?? null,
    remarks: t.remarks ?? t.note ?? t.description ?? "-"
  };
}

function rowHtml(t0){
  const t = normalizeTx(t0);
  return `
    <tr>
      <td>${t.paidDate ? fmtDate(String(t.paidDate).slice(0,10)) : "-"}</td>
      <td class="num"><b>₹ ${money(t.paidAmount)}</b></td>
      <td class="num muted">₹ ${money(t.paidTotalAfter)}</td>
      <td class="num muted">₹ ${money(t.dueAfter)}</td>
      <td class="muted">${t.nextDueDate ? fmtDate(String(t.nextDueDate).slice(0,10)) : "-"}</td>
      <td class="muted">${(t.remarks && String(t.remarks).trim()) ? String(t.remarks) : "-"}</td>
    </tr>
  `;
}

function matchesSearch(tx0, query){
  const t = normalizeTx(tx0);
  const qq = String(query||"").trim().toLowerCase();
  if(!qq) return true;

  const date = t.paidDate ? fmtDate(String(t.paidDate).slice(0,10)) : "";
  const hay = [
    date,
    t.remarks,
    t.paidAmount,
    t.paidTotalAfter,
    t.dueAfter,
    t.nextDueDate ? fmtDate(String(t.nextDueDate).slice(0,10)) : ""
  ].map(x => String(x||"").toLowerCase()).join(" | ");

  return hay.includes(qq);
}

function sortTx(list, mode){
  const arr = [...list].map(normalizeTx);

  const byDate = (a,b) => String(a.paidDate||"").localeCompare(String(b.paidDate||""));
  const byAmt = (a,b) => Number(a.paidAmount||0) - Number(b.paidAmount||0);

  if(mode === "date_asc") arr.sort(byDate);
  else if(mode === "date_desc") arr.sort((a,b)=> byDate(b,a));
  else if(mode === "amount_asc") arr.sort(byAmt);
  else if(mode === "amount_desc") arr.sort((a,b)=> byAmt(b,a));

  return arr;
}

function renderTable(){
  const filtered = allTx.filter(t => matchesSearch(t, q.value));
  const sorted = sortTx(filtered, sortBy.value);

  if(!sorted.length){
    tbody.innerHTML = `<tr><td colspan="6" class="muted">No transactions found</td></tr>`;
    return;
  }

  tbody.innerHTML = sorted.map(rowHtml).join("");
}

// =============================
// ✅ Endpoint lists (UNCHANGED)
// =============================
function summaryUrls(){
  return [
    `/student/api/fees/me`,
    `/student/api/fees/summary`,
    `/student/api/fees/account`,
    `/student/api/fees`,
    `/student/api/fee/me`,
    `/student/api/fee/summary`,
    `/student/api/fees/${encodeURIComponent(studentId)}`,
    `/student/api/fee/${encodeURIComponent(studentId)}`,
    `/student/api/fees/student/${encodeURIComponent(studentId)}`,
    `/student/api/fees?studentId=${encodeURIComponent(studentId)}`,
    `/student/api/fees/summary?studentId=${encodeURIComponent(studentId)}`
  ];
}

function txUrls(){
  return [
    `/student/api/fees/me/transactions`,
    `/student/api/fees/transactions`,
    `/student/api/fee/transactions`,
    `/student/api/fees/history`,
    `/student/api/fee/history`,
    `/student/api/fees/${encodeURIComponent(studentId)}/transactions`,
    `/student/api/fee/${encodeURIComponent(studentId)}/transactions`,
    `/student/api/fees/student/${encodeURIComponent(studentId)}/transactions`,
    `/student/api/fees/${encodeURIComponent(studentId)}/history`,
    `/student/api/fees/transactions?studentId=${encodeURIComponent(studentId)}`,
    `/student/api/fees/history?studentId=${encodeURIComponent(studentId)}`
  ];
}

// =============================
// Load data
// =============================
async function loadAll(){
  clearErr();

  summaryGrid.innerHTML = `
    <div class="sum-card skel" style="height:92px"></div>
    <div class="sum-card skel" style="height:92px"></div>
    <div class="sum-card skel" style="height:92px"></div>
    <div class="sum-card skel" style="height:92px"></div>
  `;
  tbody.innerHTML = `<tr><td colspan="6" class="muted">Loading...</td></tr>`;

  try{
    const sumResp = await fetchFirstOk(summaryUrls());
    const txResp  = await fetchFirstOk(txUrls());

    renderSummary(sumResp.data);

    const list = Array.isArray(txResp.data) ? txResp.data : (txResp.data?.items || txResp.data?.data || []);
    allTx = Array.isArray(list) ? list : [];
    renderTable();

    console.log("✅ Summary endpoint used:", sumResp.url);
    console.log("✅ Tx endpoint used:", txResp.url);

  }catch(ex){
    console.error(ex);

    if(ex && ex.triedUrls && String(ex.httpStatus || "404") === "404"){
      showErr(
        "API not found (404). I tried these URLs:\n\n" +
        ex.triedUrls.join("\n") +
        "\n\n✅ Fix: Your backend must provide ONE of the above endpoints under /student/api/**.\n" +
        "If you tell me which exact student-fee controller URL you created, I will lock it here."
      );
      return;
    }

    showErr(ex.message || String(ex));
  }
}

// =============================
// Events
// =============================
sortBy.addEventListener("change", renderTable);

q.addEventListener("input", () => {
  clearTimeout(window.__txDeb);
  window.__txDeb = setTimeout(renderTable, 120);
});

btnClear.addEventListener("click", () => {
  q.value = "";
  sortBy.value = "date_desc";
  renderTable();
});

btnReload.addEventListener("click", loadAll);

// init
loadAll();