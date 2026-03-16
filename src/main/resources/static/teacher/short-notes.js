// short-notes.js (DYNAMIC MODULE)
console.log("✅ short-notes.js loaded");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.notes = {
  init(ctx) {
    const {
      teacherId,
      fetchJson,
      // postJson not used here because we need FormData for upload
      safe,
      go
    } = ctx;

    // ----- DOM -----
    const pill = document.getElementById("tnTeacherPill");
    const btnBack = document.getElementById("tnBtnBack");
    const btnLogout = document.getElementById("tnBtnLogout");

    const classSection = document.getElementById("tnClassSection");
    const titleEl = document.getElementById("tnTitle");
    const topicEl = document.getElementById("tnTopic");
    const pdfEl = document.getElementById("tnPdf");

    const btnUpload = document.getElementById("tnBtnUpload");
    const btnRefresh = document.getElementById("tnBtnRefresh");

    const msgEl = document.getElementById("tnMsg");
    const errEl = document.getElementById("tnErr");
    const listEl = document.getElementById("tnList");

    // ----- helpers -----
    function showErr(m) {
      errEl.classList.remove("tn-hidden");
      errEl.textContent = m;
    }
    function clearErr() {
      errEl.classList.add("tn-hidden");
      errEl.textContent = "";
    }
    function setMsg(m) {
      msgEl.textContent = m || "";
    }
    function escapeHtml(s) {
      return String(s ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      }[ch]));
    }

    // ✅ Nursery/LKG/UKG mapping (UI ONLY)
    function classLabel(std) {
      const n = Number(std);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      if (Number.isFinite(n)) return String(n);
      return "-";
    }

    if (pill) pill.textContent = teacherId || "TEACHER";

    // Back should return to dashboard home (best UX inside dashboard)
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        if (typeof go === "function") go("dashboard");
        else window.history.back();
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        localStorage.removeItem("smp_session");
        window.location.href = "/login/login.html";
      });
    }

    // We need Basic token for FormData upload (dashboard fetchJson already uses it internally)
    // We read from smp_session (same as your other code)
    function getBasicToken() {
      try {
        const s = JSON.parse(localStorage.getItem("smp_session") || "{}");
        let tok = String(s.basicToken || "").trim();
        if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();
        // convert admin:pass to base64 if ever saved wrongly
        const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
        if (!looksBase64 && tok.includes(":")) tok = btoa(tok);
        return tok;
      } catch {
        return "";
      }
    }

    // ----- API -----
    async function loadMyAssignments() {
      // try both (as your old code), but using fetchJson (already handles 401)
      let list = null;

      try {
        list = await fetchJson(`/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`);
      } catch (e1) {
        try {
          list = await fetchJson(`/teacher/api/dashboard/${encodeURIComponent(teacherId)}/assignments`);
        } catch (e2) {
          // show clear error + keep dropdown safe
          classSection.innerHTML = `<option value="">No assignments found</option>`;
          throw new Error(
            "Assignments endpoint failed.\n" +
            "Tried:\n" +
            "1) /teacher/dashboard/{teacherId}/assignments\n" +
            "2) /teacher/api/dashboard/{teacherId}/assignments\n\n" +
            "Server says:\n" + (e2?.message || e1?.message || "Unknown error")
          );
        }
      }

      classSection.innerHTML = "";
      (list || []).forEach(a => {
        const std = a.standard ?? a.std ?? a.classNumber ?? a.class;
        const sec = a.section ?? a.sec;
        const subj = a.subject || a.subjectName || "Subject";

        // ✅ UI FIX: show Nursery/LKG/UKG in dropdown label
        const label = `Class ${classLabel(std)}-${sec} (${subj})`;

        const opt = document.createElement("option");

        // ✅ Keep backend same: value remains std|sec (NO backend disturbance)
        opt.value = `${std}|${sec}`;

        opt.textContent = label;
        classSection.appendChild(opt);
      });

      if (!classSection.children.length) {
        classSection.innerHTML = `<option value="">No assignments found</option>`;
      }
    }

    async function loadMyNotes() {
      clearErr();
      setMsg("");
      listEl.innerHTML = `<div class="tn-muted">Loading...</div>`;

      try {
        const notes = await fetchJson(`/teacher/api/notes/my/${encodeURIComponent(teacherId)}`);

        if (!notes || !notes.length) {
          listEl.innerHTML = `<div class="tn-muted">No notes uploaded yet.</div>`;
          return;
        }

        listEl.innerHTML = notes.map(n => `
          <div class="tn-item">
            <div>
              <b>${escapeHtml(n.title || "")}</b>
              <div class="tn-meta">
                Class ${escapeHtml(classLabel(n.standard))}-${escapeHtml(n.section)} • ${escapeHtml(n.topic || "—")} • ${escapeHtml(n.createdAt || "")}
              </div>
              <div class="tn-meta">
                <a href="${escapeHtml(n.fileUrl)}" target="_blank" rel="noreferrer">View</a>
                &nbsp;•&nbsp;
                <a href="${escapeHtml(n.fileUrl)}" download>Download</a>
              </div>
            </div>
            <div class="tn-actions">
              <button class="tn-btn tn-danger" data-del="${escapeHtml(n.id)}" type="button">Delete</button>
            </div>
          </div>
        `).join("");

        listEl.querySelectorAll("[data-del]").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-del");
            if (!confirm("Delete this note?")) return;
            try {
              await fetch(`/teacher/api/notes/my/${encodeURIComponent(teacherId)}/${encodeURIComponent(id)}`, {
                method: "DELETE",
                headers: { Authorization: `Basic ${getBasicToken()}` }
              });
              await loadMyNotes();
            } catch (e) {
              showErr(e.message || "Delete failed");
            }
          });
        });
      } catch (e) {
        listEl.innerHTML = "";
        showErr(e.message || "Failed to load notes");
      }
    }

    async function uploadNote() {
      clearErr();
      setMsg("");

      const cs = classSection.value || "";
      const parts = cs.split("|");
      const standardStr = parts[0] || "";
      const section = parts[1] || "";

      const standard = Number(standardStr);
      const title = (titleEl.value || "").trim();
      const topic = (topicEl.value || "").trim();
      const file = pdfEl.files?.[0];

      if (!standardStr || !section) return showErr("Select class & section");
      if (!title) return showErr("Title is required");
      if (!file) return showErr("PDF file is required");

      const fd = new FormData();
      fd.append("teacherId", teacherId);
      fd.append("standard", String(standard));
      fd.append("section", section);
      fd.append("title", title);
      fd.append("topic", topic);
      fd.append("pdf", file);

      const token = getBasicToken();
      if (!token) return showErr("Session token missing. Please login again.");

      const res = await fetch("/teacher/api/notes/upload", {
        method: "POST",
        headers: { Authorization: `Basic ${token}` }, // ✅ no Content-Type for FormData
        body: fd
      });

      if (res.status === 401) {
        localStorage.removeItem("smp_session");
        alert("Session expired. Please login again.");
        window.location.href = "/login/login.html";
        return;
      }

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `Upload failed: HTTP ${res.status}`);
      }

      // success
      titleEl.value = "";
      topicEl.value = "";
      pdfEl.value = "";
      setMsg("✅ Uploaded successfully");
      await loadMyNotes();
    }

    // ----- events -----
    btnUpload?.addEventListener("click", async () => {
      try { await uploadNote(); }
      catch (e) { showErr(e.message); }
    });

    btnRefresh?.addEventListener("click", loadMyNotes);

    // ----- init -----
    (async () => {
      try {
        await loadMyAssignments();
        await loadMyNotes();
      } catch (e) {
        showErr(e.message);
      }
    })();
  }
};