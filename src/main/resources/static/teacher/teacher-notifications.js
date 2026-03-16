// teacher-notifications.js
// Loaded dynamically by teacher-dashboard.js page loader

(function () {
  // ============================
  // Helpers: session + auth
  // ============================
  function getSession() {
    try { return JSON.parse(localStorage.getItem("smp_session") || "{}"); }
    catch { return {}; }
  }

  function normalizeToken(raw) {
    if (!raw) return "";
    let tok = String(raw).trim();
    if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
    const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
    if (!looksBase64 && tok.includes(":")) tok = btoa(tok);
    return tok;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ✅ Nursery/LKG/UKG mapping (UI ONLY — backend unchanged)
  function classLabel(std) {
    const n = Number(std);
    if (n === -2) return "Nursery";
    if (n === -1) return "LKG";
    if (n === 0) return "UKG";
    if (Number.isFinite(n)) return String(n);
    return "-";
  }

  async function apiFetch(url, opts = {}) {
    const session = getSession();
    const token = normalizeToken(session.basicToken);

    const headers = { ...(opts.headers || {}) };
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Basic ${token}`;

    const res = await fetch(url, { ...opts, headers });
    const text = await res.text().catch(() => "");

    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  }

  // ============================
  // Small safe extract helpers
  // ============================
  function pickFirst(obj, paths = []) {
    for (const p of paths) {
      const val = getPath(obj, p);
      if (val !== undefined && val !== null && val !== "") return val;
    }
    return null;
  }

  function getPath(obj, path) {
    try {
      return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
    } catch {
      return undefined;
    }
  }

  // ============================
  // Module Init
  // ============================
  window.TeacherPages = window.TeacherPages || {};
  window.TeacherPages.modules = window.TeacherPages.modules || {};

  window.TeacherPages.modules.notifications = {
    init: function ({ teacherId, go }) {
      const listEl = document.getElementById("tnList");
      const errEl = document.getElementById("tnErr");
      const countLineEl = document.getElementById("tnCountLine");

      const refreshBtn = document.getElementById("tnRefreshBtn");
      const markAllBtn = document.getElementById("tnMarkAllReadBtn");
      const clearAllBtn = document.getElementById("tnClearAllBtn");

      function showError(msg) {
        if (!errEl) return;
        errEl.textContent = msg || "Something went wrong.";
        errEl.style.display = "";
      }

      function hideError() {
        if (!errEl) return;
        errEl.textContent = "";
        errEl.style.display = "none";
      }

      function setLoading() {
        hideError();
        if (listEl) listEl.innerHTML = `<div class="tn-muted">Loading...</div>`;
        if (countLineEl) countLineEl.textContent = "—";
      }

      // ----------------------------
      // Data helpers
      // ----------------------------
      async function fetchNotifications() {
        return apiFetch(`/api/notifications/TEACHER/${encodeURIComponent(teacherId)}`);
      }

      async function unreadCount() {
        const c = await apiFetch(`/api/notifications/TEACHER/${encodeURIComponent(teacherId)}/unread-count`);
        return Number(c || 0);
      }

      async function markRead(notifId) {
        await apiFetch(
          `/api/notifications/TEACHER/${encodeURIComponent(teacherId)}/${encodeURIComponent(notifId)}/read`,
          { method: "POST" }
        );
      }

      async function deleteOne(notifId) {
        await apiFetch(
          `/api/notifications/TEACHER/${encodeURIComponent(teacherId)}/${encodeURIComponent(notifId)}`,
          { method: "DELETE" }
        );
      }

      async function deleteAll() {
        await apiFetch(
          `/api/notifications/TEACHER/${encodeURIComponent(teacherId)}/clear-all`,
          { method: "DELETE" }
        );
      }

      // ✅ LEAVE: get leave details -> studentId -> profile
      async function getLeaveRow(leaveId) {
        return apiFetch(`/teacher/api/leaves/${encodeURIComponent(teacherId)}/${encodeURIComponent(leaveId)}`);
      }

      // ✅ DOUBT: THIS IS THE CORRECT ENDPOINT from your controller
      async function getDoubtThread(doubtId) {
        // Controller: GET /teacher/api/doubts/{doubtId}/teacher/{teacherId}
        return apiFetch(`/teacher/api/doubts/${encodeURIComponent(doubtId)}/teacher/${encodeURIComponent(teacherId)}`);
      }

      async function getStudentProfile(studentId) {
        return apiFetch(`/student/profile/${encodeURIComponent(studentId)}`);
      }

      // ----------------------------
      // Render
      // ----------------------------
      async function render(list) {
        const arr = Array.isArray(list) ? list : [];
        const unread = arr.filter(n => !n.read).length;

        if (countLineEl) countLineEl.textContent = `${arr.length} total • ${unread} unread`;

        if (!listEl) return;

        if (arr.length === 0) {
          listEl.innerHTML = `<div class="tn-muted">No notifications</div>`;
          return;
        }

        // Render skeleton first
        listEl.innerHTML = arr.map(n => {
          const created = (n.createdAt || "").toString().replace("T", " ").slice(0, 19);
          const isUnread = !n.read;

          return `
            <div class="tn-item ${isUnread ? "unread" : ""}"
                 data-id="${Number(n.id)}"
                 data-type="${escapeHtml(String(n.type || "").toUpperCase())}"
                 data-refid="${escapeHtml(n.refId ?? "")}">
              <div class="tn-row">
                <div class="tn-left">
                  <img class="tn-avatar" data-avatar-for="${Number(n.id)}"
                       src="https://ui-avatars.com/api/?name=Student&background=667eea&color=fff&size=80"
                       alt="Student"/>
                  <div class="tn-meta">
                    <div class="tn-title2">${escapeHtml(n.title || "Notification")}</div>
                    <div class="tn-small">${escapeHtml(created)}</div>

                    <div class="tn-msg">${escapeHtml(n.message || "")}</div>

                    <div class="tn-chips">
                      <span class="tn-chip">Type: ${escapeHtml(n.type || "-")}</span>
                      <span class="tn-chip">Ref: ${escapeHtml(n.refId ?? "-")}</span>
                      <span class="tn-chip" data-stu-for="${Number(n.id)}">Student: —</span>
                      <span class="tn-chip" data-cls-for="${Number(n.id)}">Class: —</span>
                    </div>
                  </div>
                </div>

                <div class="tn-right">
                  <button class="tn-mini primary" data-action="open" data-id="${Number(n.id)}">Open</button>
                  <button class="tn-mini" data-action="read" data-id="${Number(n.id)}">Mark read</button>
                  <button class="tn-mini danger" data-action="clear" data-id="${Number(n.id)}">Clear</button>
                </div>
              </div>
            </div>
          `;
        }).join("");

        // ======================================================
        // ✅ ENRICH LEAVE + DOUBT with real student profile
        // ======================================================
        for (const n of arr) {
          const type = String(n.type || "").toUpperCase();
          if (!n.refId) continue;

          // common dom refs
          const chipStu = document.querySelector(`[data-stu-for="${Number(n.id)}"]`);
          const chipCls = document.querySelector(`[data-cls-for="${Number(n.id)}"]`);
          const avatar = document.querySelector(`[data-avatar-for="${Number(n.id)}"]`);

          try {
            let studentId = null;
            let studentName = null;
            let std = null;
            let sec = null;

            // ---------- LEAVE ----------
            if (type === "LEAVE") {
              const leave = await getLeaveRow(n.refId);

              studentId = pickFirst(leave, [
                "studentId",
                "student_id",
                "student.studentId",
                "student.id"
              ]);

              studentName = pickFirst(leave, [
                "studentName",
                "student_name",
                "student.fullName",
                "student.name"
              ]);

              std = pickFirst(leave, ["standard", "classNumber", "class"]);
              sec = pickFirst(leave, ["section"]);
            }

            // ---------- DOUBT ----------
            if (type === "DOUBT") {
              const thread = await getDoubtThread(n.refId);

              // DoubtThreadResponse can be shaped differently.
              // We try many safe paths.
              studentId = pickFirst(thread, [
                "studentId",
                "doubt.studentId",
                "doubt.student.studentId",
                "thread.studentId",
                "data.studentId"
              ]);

              studentName = pickFirst(thread, [
                "studentName",
                "doubt.studentName",
                "doubt.student.fullName",
                "doubt.student.name",
                "student.fullName"
              ]);

              std = pickFirst(thread, [
                "standard",
                "doubt.standard",
                "doubt.student.standard",
                "student.standard"
              ]);

              sec = pickFirst(thread, [
                "section",
                "doubt.section",
                "doubt.student.section",
                "student.section"
              ]);
            }

            // fetch full student profile (photo + class/section)
            let profile = null;
            if (studentId) {
              profile = await getStudentProfile(studentId);
            }

            const finalName = profile?.fullName || studentName || studentId || "Student";
            const finalStdRaw = (profile?.standard ?? std ?? "-");
            const finalSec = (profile?.section ?? sec ?? "-");

            // ✅ UI ONLY: map -2/-1/0 -> Nursery/LKG/UKG
            const finalStdLabel = classLabel(finalStdRaw);

            const photo = profile?.profileUrl || "";

            if (chipStu) chipStu.textContent = `Student: ${finalName}`;
            if (chipCls) chipCls.textContent = `Class: ${finalStdLabel} - ${finalSec}`;

            if (avatar) {
              if (photo) {
                avatar.src = photo;
              } else {
                const safeName = encodeURIComponent(finalName);
                avatar.src = `https://ui-avatars.com/api/?name=${safeName}&background=667eea&color=fff&size=80`;
              }
            }
          } catch (err) {
            // keep UI working even if enrich fails
            // console.warn("Enrich failed:", err);
          }
        }
      }

      // ----------------------------
      // Load
      // ----------------------------
      async function load() {
        setLoading();
        try {
          const list = await fetchNotifications();
          hideError();
          await render(list);

          try {
            const c = await unreadCount();
            const dot = document.getElementById("notifDotTeacher");
            if (dot) dot.style.display = c > 0 ? "" : "none";
          } catch {}
        } catch (e) {
          console.error(e);
          showError(e.message || "Failed to load notifications.");
          if (listEl) listEl.innerHTML = `<div class="tn-muted">—</div>`;
        }
      }

      // ----------------------------
      // Click handlers
      // ----------------------------
      listEl?.addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        const item = e.target.closest(".tn-item");
        if (!item) return;

        const notifId = Number(item.dataset.id);
        const type = String(item.dataset.type || "").toUpperCase();
        const refId = item.dataset.refid ? Number(item.dataset.refid) : null;

        if (btn) {
          const action = btn.dataset.action;

          if (action === "clear") {
            try {
              await deleteOne(notifId);
              await load();
            } catch (err) {
              showError(err.message || "Clear failed.");
            }
            return;
          }

          if (action === "read") {
            try {
              await markRead(notifId);
              await load();
            } catch (err) {
              showError(err.message || "Mark read failed.");
            }
            return;
          }

          if (action === "open") {
            try {
              await markRead(notifId);

              // ✅ LEAVE -> open teacher leave page
              if (type === "LEAVE" && refId) {
                go("leave", { leaveId: refId });
              }

              // ✅ DOUBT -> open teacher doubts page (teacher-doubts.html)
              if (type === "DOUBT" && refId) {
                go("doubts", { doubtId: refId });
              }

              await load();
            } catch (err) {
              showError(err.message || "Open failed.");
            }
            return;
          }
        }

        // Click anywhere on item -> same as Open
        try {
          await markRead(notifId);

          if (type === "LEAVE" && refId) {
            go("leave", { leaveId: refId });
          }

          if (type === "DOUBT" && refId) {
            go("doubts", { doubtId: refId });
          }

          await load();
        } catch (err) {
          showError(err.message || "Open failed.");
        }
      });

      // Buttons
      refreshBtn?.addEventListener("click", () => load());

      markAllBtn?.addEventListener("click", async () => {
        try {
          const list = await fetchNotifications();
          const arr = Array.isArray(list) ? list : [];
          const unread = arr.filter(n => !n.read);

          for (const n of unread) {
            await markRead(n.id);
          }

          await load();
        } catch (e) {
          showError(e.message || "Mark all read failed.");
        }
      });

      clearAllBtn?.addEventListener("click", async () => {
        const ok = confirm("Clear ALL notifications permanently?");
        if (!ok) return;

        try {
          await deleteAll();
          await load();
        } catch (e) {
          showError(e.message || "Clear all failed.");
        }
      });

      // Init load
      load();
    },
  };
})();