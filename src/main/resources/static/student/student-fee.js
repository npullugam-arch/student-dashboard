console.log("✅ student-info.feed.js loaded");

/* ===== SAME BACKEND/AUTH LOGIC (DO NOT DISTURB) ===== */
function getSession() {
  try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
  catch { return {}; }
}

function normalizeToken(tok) {
  if (!tok) return "";
  tok = String(tok).trim();
  if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
  if (tok.includes(":")) tok = btoa(tok);
  return tok;
}

function requireStudent() {
  const s = getSession();
  if (!s.username || String(s.role || "").toUpperCase() !== "STUDENT") {
    alert("Session expired. Please login again.");
    window.location.href = "/login/student.html";
    throw new Error("No student session");
  }
  s.basicToken = normalizeToken(s.basicToken);
  return s;
}

const session = requireStudent();
const basicToken = session.basicToken;

document.getElementById("chipStudent").textContent = `STUDENT • ${session.username}`;
document.getElementById("btnBack").addEventListener("click", () => history.back());

function authHeaders() {
  return { Authorization: `Basic ${basicToken}` };
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("smp_session");
    window.location.href = "/login/student.html";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ===== UI helpers ===== */
function money(n) {
  const v = Number(n || 0);
  return v.toLocaleString("en-IN");
}

function safeImgUrl(name) {
  const n = (name || "Student").trim();
  return "https://ui-avatars.com/api/?name=" + encodeURIComponent(n) + "&background=667eea&color=fff&size=256&bold=true";
}

function initials(name) {
  const parts = String(name || "Student").trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || "S";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase();
}

function fmtDate(iso) {
  if (!iso) return "-";
  const s = String(iso);
  const parts = s.split("-");
  if (parts.length !== 3) return s;
  const [y, m, d] = parts;
  return `${d}-${m}-${y}`;
}

function hallPill(allowed) {
  if (allowed) {
    return `
      <div class="status-pill status-ok">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Hall Ticket Allowed
      </div>
    `;
  }
  return `
    <div class="status-pill status-no">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M6 6l12 12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>
      Hall Ticket Blocked
    </div>
  `;
}

/* ===== Load + Render ===== */
async function load() {

  const root = document.getElementById("root");

  try {

    // show loading text
    root.innerHTML = `<div class="muted">Loading fee overview...</div>`;

    // call backend
    const fee = await fetchJson("/student/api/fees/me");

    // safety check
    if (!fee) {
      root.innerHTML = `<div class="tag no">No fee data available</div>`;
      return;
    }

    const name = fee.studentName || "Student";
    const studId = fee.studentId || "";
    const stdSec = `${fee.standard ?? ""}-${fee.section || ""}`;

    const img = fee.photoUrl ? fee.photoUrl : safeImgUrl(name);
    const init = initials(name);

    // render UI
    root.innerHTML = `
      <div class="profile-row">
        <div class="profile">

          <div class="avatar" title="Student">
            ${
              fee.photoUrl
              ? `<img src="${img}" alt="photo"
                     onerror="this.onerror=null; this.parentElement.innerHTML='${init}'">`
              : init
            }
          </div>

          <div class="who">
            <h2>${name}</h2>
            <div class="sub">${studId} • ${stdSec}</div>
            ${hallPill(!!fee.hallTicketAllowed)}
          </div>

        </div>
      </div>


      <div class="stats">

        <div class="stat c-total">
          <div class="accent"></div>
          <div class="stat-head">
            <div class="label">Total Fee</div>
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 7h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"
                stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
          </div>
          <div class="value">₹ ${money(fee.totalFee)}</div>
        </div>


        <div class="stat c-paid">
          <div class="accent"></div>
          <div class="stat-head">
            <div class="label">Paid</div>
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5"
                stroke="currentColor" stroke-width="2.2"/>
              </svg>
            </div>
          </div>
          <div class="value">₹ ${money(fee.paidAmount)}</div>
        </div>


        <div class="stat c-due">
          <div class="accent"></div>
          <div class="stat-head">
            <div class="label">Due</div>
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4" stroke="currentColor" stroke-width="2.2"/>
              </svg>
            </div>
          </div>
          <div class="value">₹ ${money(fee.dueAmount)}</div>
        </div>


        <div class="stat c-date">
          <div class="accent"></div>
          <div class="stat-head">
            <div class="label">Next Due Date</div>
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 3v3M16 3v3"
                stroke="currentColor" stroke-width="2.2"/>
              </svg>
            </div>
          </div>
          <div class="value">${fmtDate(fee.nextDueDate)}</div>
        </div>

      </div>


      <div class="note">
        If you have already paid and the amount is not updated,
        please contact the Office.
      </div>
    `;

  }
  catch (err) {

    console.error("Fee load error:", err);

    root.innerHTML = `
      <div class="tag no">
        Failed to load fee overview<br>
        ${err.message || "Unknown error"}
      </div>
    `;
  }

}
load().catch(err => {
  console.error(err);
  const root = document.getElementById("root");
  root.innerHTML = `<div class="tag no">${(err.message || "Failed to load")}</div>`;
});