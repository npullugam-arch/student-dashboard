console.log("✅ subjects.js loaded");

// ✅ If this page is opened inside iframe, still keep admin auth check
// requireAdmin() is assumed from admin-api.js (your existing file)
const session = requireAdmin();

const listEl = document.getElementById("list");
const errEl = document.getElementById("err");
const addMsg = document.getElementById("addMsg");
const stdSelect = document.getElementById("stdSelect");

// =======================
// UI helpers
// =======================
function showErr(msg) {
  errEl.style.display = "block";
  errEl.textContent = msg || "Error";
}
function clearErr() {
  errEl.style.display = "none";
  errEl.textContent = "";
}
function safeText(v) {
  return v == null ? "" : String(v);
}
function normalizeName(s) {
  return (s || "").trim().toLowerCase();
}

// Nursery(-2), LKG(-1), UKG(0), Class 1..12
function formatStandardLabel(std) {
  const n = Number(std);
  if (Number.isNaN(n)) return "";
  if (n === -2) return "Nursery";
  if (n === -1) return "LKG";
  if (n === 0) return "UKG";
  return `Class ${n}`;
}

// =======================
// Subject cache (LOCAL ONLY)
// =======================
const SUBJECT_CACHE_KEY = "smp_subject_cache_v1";

function getSubjectCache() {
  try {
    return JSON.parse(localStorage.getItem(SUBJECT_CACHE_KEY) || "[]");
  } catch {
    return [];
  }
}
function upsertSubjectCache(subjectEntity) {
  if (!subjectEntity?.id || !subjectEntity?.name) return;

  const cache = getSubjectCache();
  const key = normalizeName(subjectEntity.name);

  const idx = cache.findIndex((x) => normalizeName(x.name) === key);
  if (idx >= 0) cache[idx] = subjectEntity;
  else cache.push(subjectEntity);

  localStorage.setItem(SUBJECT_CACHE_KEY, JSON.stringify(cache));
}
function findCachedSubjectIdByName(name) {
  const key = normalizeName(name);
  return getSubjectCache().find((x) => normalizeName(x.name) === key)?.id || null;
}

// =======================
// ✅ preload ALL subjects once (fix for "added but not showing")
// =======================
async function preloadAllSubjects() {
  try {
    const all = await apiGet("/admin/subjects/all");
    if (Array.isArray(all)) {
      all.forEach(upsertSubjectCache);
      console.log("📦 Subject cache primed:", all.length);
    }
  } catch (e) {
    console.warn("⚠️ Failed to preload subjects:", e.message);
  }
}

// =======================
// Standards dropdown
// =======================
function initStandards() {
  if (!stdSelect) return;
  stdSelect.innerHTML = "";

  const options = [
    { value: -2, label: "Nursery" },
    { value: -1, label: "LKG" },
    { value: 0, label: "UKG" },
  ];

  for (let i = 1; i <= 12; i++) {
    options.push({ value: i, label: `Class ${i}` });
  }

  options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = String(o.value);
    opt.textContent = o.label;
    stdSelect.appendChild(opt);
  });

  stdSelect.value = "7"; // default
  stdSelect.addEventListener("change", loadSubjects);
}

// =======================
// Load assigned subjects
// =======================
async function loadSubjects() {
  clearErr();
  addMsg.textContent = "";
  listEl.innerHTML = `<div class="muted">Loading...</div>`;

  try {
    const standard = Number(stdSelect.value);
    const items = await apiGet(`/admin/subjects/standard/${standard}`);
    renderList(items || []);
  } catch (e) {
    listEl.innerHTML = "";
    showErr(e.message);
  }
}

function renderList(items) {
  listEl.innerHTML = "";

  if (!items.length) {
    listEl.innerHTML = `<div class="muted">No subjects assigned to this class.</div>`;
    return;
  }

  items.forEach((s) => {
    const subjectName = s.subjectName;
    const subjectId = s.subjectId;
    const mappingId = s.standardSubjectId;

    const row = document.createElement("div");
    row.className = "stat";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";

    row.innerHTML = `
      <div>
        <b>${safeText(subjectName)}</b>
        <div class="muted" style="font-size:12px">subjectId: ${safeText(subjectId)}</div>
      </div>
      <button class="btn dark">Remove</button>
    `;

    row.querySelector("button").onclick = async () => {
      const stdLabel = formatStandardLabel(Number(stdSelect.value));
      if (!confirm(`Remove "${subjectName}" from ${stdLabel}?`)) return;

      clearErr();
      try {
        await apiDelete(`/admin/subjects/standard-subject/${mappingId}`);
        await loadSubjects();
      } catch (e) {
        showErr(e.message);
      }
    };

    listEl.appendChild(row);
  });
}

// =======================
// Add Subject
// =======================
async function addSubject() {
  clearErr();
  addMsg.textContent = "";

  const name = document.getElementById("subjectName").value.trim();
  if (!name) return showErr("Subject name required");

  const standard = Number(stdSelect.value);
  const stdLabel = formatStandardLabel(standard);

  try {
    // Try create subject
    const created = await apiPost("/admin/subjects", { name });
    upsertSubjectCache(created);

    // Assign to standard
    await apiPost("/admin/subjects/assign", {
      subjectId: created.id,
      standard,
    });

    addMsg.textContent = `✅ Added & assigned "${name}" to ${stdLabel}`;
  } catch (e) {
    const msg = (e.message || "").toLowerCase();

    // Subject already exists -> assign from cache
    if (msg.includes("already exists")) {
      const id = findCachedSubjectIdByName(name);
      if (!id) return showErr("Subject exists but ID not found (cache issue)");

      await apiPost("/admin/subjects/assign", { subjectId: id, standard });
      addMsg.textContent = `✅ Assigned existing "${name}" to ${stdLabel}`;
    } else {
      showErr(e.message);
      return;
    }
  }

  document.getElementById("subjectName").value = "";
  await loadSubjects();
}

document.getElementById("addBtn").addEventListener("click", addSubject);

// =======================
// INIT
// =======================
(async function init() {
  await preloadAllSubjects(); // ✅ important
  initStandards();
  loadSubjects();
})();