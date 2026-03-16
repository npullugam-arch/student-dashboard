console.log("✅ notifications.js loaded (Student Notifications Page)");

// --------------------
// Session (same as your working code)
// --------------------
function getSession() {
  try {
    return JSON.parse(localStorage.getItem("smp_session") || "{}");
  } catch {
    return {};
  }
}

function normalizeToken(raw) {
  if (!raw) return "";
  let tok = String(raw).trim();

  if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();

  const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
  if (!looksBase64 && tok.includes(":")) tok = btoa(tok);

  return tok;
}

const session = getSession();
const role = String(session.role || "").toUpperCase();
const userId = session.username;
const basicToken = normalizeToken(session.basicToken);

// --------------------
// DOM (mapped to NEW UI)
// --------------------
const listEl = document.getElementById("list");
const errEl = document.getElementById("err");
const countLineEl = document.getElementById("countLine");
const refreshBtn = document.getElementById("btnRefresh");
const markAllReadBtn = document.getElementById("btnMarkAllRead");
const clearAllBtn = document.getElementById("btnClearAll");
const emptyStateEl = document.getElementById("emptyState");

// --------------------
// Helpers
// --------------------
function showError(msg) {
  if (!errEl) return;
  errEl.textContent = msg || "Something went wrong.";
  errEl.classList.remove("hidden");
}

function hideError() {
  if (!errEl) return;
  errEl.textContent = "";
  errEl.classList.add("hidden");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function apiFetch(url, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (basicToken) headers.Authorization = `Basic ${basicToken}`;

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text().catch(() => "");

  if (!res.ok) throw new Error(text || `HTTP ${res.status} ${res.statusText}`);

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function setLoading() {
  hideError();
  if (listEl) listEl.innerHTML = `<div class="muted">Loading...</div>`;
  if (countLineEl) countLineEl.textContent = "—";
  if (emptyStateEl) emptyStateEl.style.display = "none";
}

// ✅ Tell dashboard to update bell count
function notifyParentBadge(unread) {
  try {
    window.parent?.postMessage?.({ type: "NOTIF_BADGE_UPDATE", unread }, "*");
  } catch {}
}

// ✅ Tell dashboard to open leave page
function navigateToLeave(refId) {
  try {
    window.parent?.postMessage?.(
      { type: "NAVIGATE_TO_PAGE", pageId: "leave-application", refId },
      "*"
    );
  } catch {}
}

// ✅ Tell dashboard to open short notes page
function navigateToShortNotes(refId) {
  try {
    window.parent?.postMessage?.(
      { type: "NAVIGATE_TO_PAGE", pageId: "short-notes", refId },
      "*"
    );
  } catch {}
}

// ✅ NEW: Tell dashboard to open doubts clarification page
function navigateToDoubts(refId) {
  try {
    window.parent?.postMessage?.(
      { type: "NAVIGATE_TO_PAGE", pageId: "doubt-clarification", refId },
      "*"
    );
  } catch {}
}

// --------------------
// Render (UI like your 1st design)
// --------------------
function render(list) {
  const arr = Array.isArray(list) ? list : [];

  const unread = arr.filter((n) => !n.read).length;

  if (countLineEl) {
    countLineEl.innerHTML = `${arr.length} total • <strong>${unread}</strong> unread`;
  }

  // ✅ update dashboard bell
  notifyParentBadge(unread);

  if (!listEl) return;

  if (arr.length === 0) {
    listEl.innerHTML = "";
    if (emptyStateEl) emptyStateEl.style.display = "block";
    return;
  } else {
    if (emptyStateEl) emptyStateEl.style.display = "none";
  }

  listEl.innerHTML = arr
    .map((n) => {
      const isRead = !!n.read;
      const created = (n.createdAt || "").toString().replace("T", " ").slice(0, 19);
      const type = String(n.type || "").toUpperCase();
      const title = String(n.title || "Notification");

      return `
        <div class="notif-item ${isRead ? "" : "unread"}"
             tabindex="0"
             data-id="${Number(n.id)}"
             data-type="${escapeHtml(type)}"
             data-refid="${escapeHtml(n.refId ?? "")}"
             data-title="${escapeHtml(title)}">

          <div class="notif-inner">
            <div style="display:flex; align-items:flex-start; gap:10px;">
              <div class="notif-title">
                <span>${escapeHtml(title)}</span>
                ${isRead ? "" : `<span class="new-chip">NEW</span>`}
              </div>

              <button class="btnClearOne" data-id="${Number(n.id)}" type="button">Clear</button>
            </div>

            <div class="timestamp">${escapeHtml(created)}</div>

            <div class="message">${escapeHtml(n.message || "")}</div>

            <div class="meta">
              Type: ${escapeHtml(n.type || "-")} • Ref: ${escapeHtml(n.refId ?? "-")}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

// --------------------
// Load
// --------------------
async function loadNotifications() {
  if (role !== "STUDENT" || !userId) {
    setLoading();
    showError("Session not found. Please login again.");
    notifyParentBadge(0);
    return [];
  }

  setLoading();

  try {
    const list = await apiFetch(`/api/notifications/STUDENT/${encodeURIComponent(userId)}`);
    hideError();
    render(list);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error("Load notifications failed:", e);
    showError(e.message || "Failed to load notifications.");
    return [];
  }
}

// --------------------
// Mark Read
// --------------------
async function markRead(notifId) {
  if (!notifId) return;
  await apiFetch(
    `/api/notifications/STUDENT/${encodeURIComponent(userId)}/${encodeURIComponent(notifId)}/read`,
    { method: "POST" }
  );
}

async function markAllRead() {
  try {
    const list = await apiFetch(`/api/notifications/STUDENT/${encodeURIComponent(userId)}`);
    const arr = Array.isArray(list) ? list : [];
    const unread = arr.filter((n) => !n.read);

    for (const n of unread) await markRead(n.id);

    await loadNotifications();
  } catch (e) {
    console.error(e);
    showError(e.message || "Mark all read failed.");
  }
}

// --------------------
// DB DELETE APIs
// --------------------
async function deleteOneFromDb(notifId) {
  if (!notifId) return;
  await apiFetch(
    `/api/notifications/STUDENT/${encodeURIComponent(userId)}/${encodeURIComponent(notifId)}`,
    { method: "DELETE" }
  );
}

async function deleteAllFromDb() {
  await apiFetch(`/api/notifications/STUDENT/${encodeURIComponent(userId)}/clear-all`, {
    method: "DELETE",
  });
}

async function clearAll() {
  try {
    await deleteAllFromDb();
    notifyParentBadge(0);
    await loadNotifications();
  } catch (e) {
    console.error(e);
    showError(e.message || "Clear all failed.");
  }
}

// --------------------
// Click handlers
// --------------------
function bindClicks() {
  if (!listEl) return;

  listEl.addEventListener("click", async (e) => {
    // ✅ Clear one (DB delete)
    const clearBtn = e.target.closest(".btnClearOne");
    if (clearBtn) {
      e.stopPropagation();
      const id = Number(clearBtn.dataset.id);

      try {
        await deleteOneFromDb(id);
        await loadNotifications();
      } catch (err) {
        console.error("Delete one failed:", err);
        showError(err.message || "Delete failed.");
      }
      return;
    }

    // ✅ Click notification -> mark read + optional redirect
    const item = e.target.closest(".notif-item");
    if (!item) return;

    const id = Number(item.dataset.id);
    const type = String(item.dataset.type || "").toUpperCase();
    const title = String(item.dataset.title || "").toUpperCase();
    const refId = item.dataset.refid || "";

    // message (safe)
    const msgText = (item.querySelector(".message")?.textContent || "").toUpperCase();

    try {
      await markRead(id);

      // ✅ LEAVE -> redirect
      if (type.includes("LEAVE") || title.includes("LEAVE") || msgText.includes("LEAVE")) {
        navigateToLeave(refId);
      }

      // ✅ NOTES -> redirect
      if (
        type.includes("NOTES") ||
        title.includes("NOTE") ||
        title.includes("SHORT NOTE") ||
        msgText.includes("SHORT NOTE") ||
        msgText.includes("NOTES")
      ) {
        navigateToShortNotes(refId);
      }

      // ✅ DOUBT -> redirect
      if (
        type.includes("DOUBT") ||
        title.includes("DOUBT") ||
        title.includes("DOUBTS") ||
        title.includes("DOUBT CLARIFICATION") ||
        msgText.includes("DOUBT") ||
        msgText.includes("DOUBTS")
      ) {
        navigateToDoubts(refId);
      }

      await loadNotifications();
    } catch (err) {
      console.error("Mark read failed:", err);
      showError(err.message || "Mark read failed.");
    }
  });
}

// --------------------
// Buttons
// --------------------
refreshBtn?.addEventListener("click", () => loadNotifications());
markAllReadBtn?.addEventListener("click", () => markAllRead());
clearAllBtn?.addEventListener("click", () => clearAll());

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") loadNotifications();
});

// --------------------
// Init
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  bindClicks();
  loadNotifications();
});