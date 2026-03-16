console.log("✅ student-answer-sheets.js loaded");

// ----------------------------
// DOM (mapped to NEW UI)
// ----------------------------
const stuExamSelect = document.getElementById("stuExamSelect");
const cardsContainer = document.getElementById("cardsContainer");
const initialState = document.getElementById("initialState");
const pdfCounter = document.getElementById("pdfCounter");
const stuEmpty = document.getElementById("stuEmpty");
const stuErr = document.getElementById("stuErr");

// ----------------------------
// Student session (your pattern)
// ----------------------------
const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
  throw new Error("No student session");
}

// ----------------------------
// Helpers (same as your working code)
// ----------------------------
function showErr(msg){
  stuErr.classList.remove("hidden");
  stuErr.textContent = msg || "Error";
}
function clearErr(){
  stuErr.classList.add("hidden");
  stuErr.textContent = "";
}

function showInitial(){
  initialState.classList.remove("hidden");
  cardsContainer.classList.add("hidden");
  stuEmpty.classList.add("hidden");
}

function showCards(){
  initialState.classList.add("hidden");
  cardsContainer.classList.remove("hidden");
  stuEmpty.classList.add("hidden");
}

function showEmpty(){
  initialState.classList.add("hidden");
  cardsContainer.classList.add("hidden");
  stuEmpty.classList.remove("hidden");
}

function setCount(n){
  pdfCounter.textContent = `PDFs: ${Number(n || 0)}`;
}

async function apiGet(url){
  const token = btoa(`${username}:${password}`);
  const res = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${token}` }
  });
  const txt = await res.text().catch(()=> "");
  if(!res.ok) throw new Error(txt || `HTTP ${res.status}`);
  try { return txt ? JSON.parse(txt) : null; } catch { return txt; }
}

function escHtml(s){
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ NEW: Force download without backend change
async function forceDownload(url, fallbackFileName = "answer-sheet.pdf") {
  try {
    const token = btoa(`${username}:${password}`);
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Basic ${token}` }
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(txt || `HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;

    // try to use filename from header (if present)
    const cd = res.headers.get("content-disposition") || "";
    const m = cd.match(/filename\*?=(?:UTF-8''|")?([^";]+)"?/i);
    const headerName = m ? decodeURIComponent(m[1]) : "";

    a.download = headerName || fallbackFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (e) {
    // fallback: open in new tab if download blocked
    window.open(url, "_blank");
  }
}

// ----------------------------
// Render cards in NEW UI style
// ----------------------------
function buildCardsHtml(items){
  return (items || []).map((x, idx) => {
    const subject = escHtml(x.subjectName);
    const filename = escHtml(x.originalFileName);
    const uploaded = escHtml(x.uploadedAt ?? "");

    const downloadUrl = `/student/api/answer-sheets/${encodeURIComponent(x.id)}/download?studentId=${encodeURIComponent(studentId)}`;

    return `
      <div class="pdf-card" style="animation-delay:${idx * 50}ms">
        <div class="card-header">
          <div>
            <div class="subject">${subject}</div>
            <div class="filename" title="${filename}">${filename}</div>
            <div class="meta">
              <span>📅 Uploaded: ${uploaded}</span>
            </div>
          </div>
          <div class="pdf-badge">PDF</div>
        </div>

        <div class="action-buttons">
          <button class="btn" data-act="view" data-url="${downloadUrl}">View</button>
          <button class="btn primary" data-act="download" data-url="${downloadUrl}" data-fn="${filename}">Download</button>
        </div>
      </div>
    `;
  }).join("");
}

function wireCardButtons(){
  cardsContainer.querySelectorAll("button[data-url]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const url = btn.getAttribute("data-url");
      const act = btn.getAttribute("data-act");

      if (act === "download") {
        const fn = btn.getAttribute("data-fn") || "answer-sheet.pdf";
        await forceDownload(url, fn);
        return;
      }

      // view
      window.open(url, "_blank");
    });
  });
}

// ----------------------------
// Load exams list (UNCHANGED)
// ----------------------------
async function loadExams(){
  stuExamSelect.innerHTML = `<option value="">Loading...</option>`;

  const list = await apiGet("/student/api/exams");

  stuExamSelect.innerHTML = `<option value="">Select Exam</option>`;
  (list || []).forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.examName;   // keep as your working code
    stuExamSelect.appendChild(opt);
  });

  // initial UI state
  showInitial();
  setCount(0);
}

// ----------------------------
// Load sheets (UNCHANGED endpoints)
// ----------------------------
async function loadSheets(){
  clearErr();

  const examId = stuExamSelect.value;
  if(!examId){
    showInitial();
    setCount(0);
    return;
  }

  try{
    // loading state
    initialState.classList.add("hidden");
    cardsContainer.classList.add("hidden");
    stuEmpty.classList.add("hidden");

    const rows = await apiGet(
      `/student/api/answer-sheets?studentId=${encodeURIComponent(studentId)}&examId=${encodeURIComponent(examId)}`
    );

    const items = Array.isArray(rows) ? rows : [];
    setCount(items.length);

    if(!items.length){
      showEmpty();
      return;
    }

    cardsContainer.innerHTML = buildCardsHtml(items);
    showCards();
    wireCardButtons();

  }catch(e){
    setCount(0);
    showInitial();
    showErr(e.message || "Failed to load PDFs");
  }
}

// ----------------------------
// Events
// ----------------------------
stuExamSelect.addEventListener("change", loadSheets);

// ----------------------------
// Init
// ----------------------------
loadExams().catch(e => showErr(e.message || "Failed to load exams"));