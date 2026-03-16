console.log("✅ teacher/teacher-leaves.js loaded for DASHBOARD MODULE");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.leave = {
  init: function (ctx) {
    const teacherId = ctx.teacherId;
    const fetchJson = ctx.fetchJson;

    // ---------- DOM ----------
    const reqList = document.getElementById("reqList");
    const err = document.getElementById("err");
    const searchBox = document.getElementById("searchBox");
    const btnRefresh = document.getElementById("btnRefresh");

    const empty = document.getElementById("empty");
    const panel = document.getElementById("panel");
    const panelErr = document.getElementById("panelErr");

    const sName = document.getElementById("sName");
    const sId = document.getElementById("sId");
    const clsLine = document.getElementById("clsLine");
    const statusBadge = document.getElementById("statusBadge");
    const subj = document.getElementById("subj");
    const dates = document.getElementById("dates");
    const purpose = document.getElementById("purpose");
    const desc = document.getElementById("desc");

    const decisionStatus = document.getElementById("decisionStatus");
    const remark = document.getElementById("remark");
    const btnOpen = document.getElementById("btnOpen");
    const btnSubmit = document.getElementById("btnSubmitDecision");

    // ✅ Modal DOM (ONLY for approve/reject)
    const modal = document.getElementById("leaveModal");
    const modalIcon = document.getElementById("modalIcon");
    const modalTitle = document.getElementById("modalTitle");
    const modalMsg = document.getElementById("modalMsg");

    function showErr(el, msg) { el.textContent = msg; el.classList.remove("hidden"); }
    function clearErr(el) { el.textContent = ""; el.classList.add("hidden"); }
    function show(el) { el.classList.remove("hidden"); }
    function hide(el) { el.classList.add("hidden"); }

    let requests = [];
    let selected = null;

    // ✅ Modal helpers
    let modalTimer = null;

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("open");
      setTimeout(() => modal.classList.add("hidden"), 140);
      clearTimeout(modalTimer);
    }

    // ✅ Only call this for APPROVE/REJECT
    function openModal(type, title, message) {
      if (!modal) return;

      clearTimeout(modalTimer);

      const t = String(type || "info");
      modal.classList.remove("ok", "no", "info");
      modal.classList.add(t);

      modalIcon.textContent = t === "ok" ? "✅" : t === "no" ? "❌" : "ℹ️";
      modalTitle.textContent = title || "Updated";
      modalMsg.textContent = message || "";

      modal.classList.remove("hidden");
      requestAnimationFrame(() => modal.classList.add("open"));

      // ✅ 500ms auto-hide as requested
      modalTimer = setTimeout(closeModal, 500);
    }

    function badge(status) {
      const s = String(status || "").toUpperCase();
      if (s === "APPROVED") return `<span class="badge ok">APPROVED</span>`;
      if (s === "REJECTED") return `<span class="badge no">REJECTED</span>`;
      return `<span class="badge pending">PENDING</span>`;
    }

    function setBtnLoading(btn, loading, text) {
      if (!btn) return;
      btn.disabled = !!loading;
      btn.classList.toggle("is-loading", !!loading);
      if (text != null) btn.textContent = text;
    }

    // ---------- LOAD REQUESTS ----------
    async function loadRequests() {
      clearErr(err);
      reqList.innerHTML = `<div class="muted">Loading...</div>`;

      try {
        const list = await fetchJson(`/teacher/api/leaves/${encodeURIComponent(teacherId)}`);
        requests = Array.isArray(list) ? list : [];
        renderList(requests);
      } catch (e) {
        reqList.innerHTML = "";
        showErr(err, e.message || "Failed to load requests");
      }
    }

    function renderList(list) {
      if (!list.length) {
        reqList.innerHTML = `<div class="muted">No leave requests.</div>`;
        return;
      }

      reqList.innerHTML = list.map(r => {
        const viewed = r.teacherViewed ? "👀 viewed" : "🕒 not viewed";
        return `
          <div class="item" data-id="${r.leaveId}">
            <div class="row">
              <div><b>${r.studentName}</b> <span class="muted">(${r.studentId})</span></div>
              <div>${badge(r.status)}</div>
            </div>
            <div class="muted" style="font-size:12px;margin-top:6px">
              ${r.standard}-${r.section} • ${r.subjectName} • ${r.fromDate} → ${r.toDate} • ${viewed}
            </div>
            <div style="margin-top:6px"><b>Purpose:</b> ${r.purpose || ""}</div>
          </div>
        `;
      }).join("");
    }

    // ---------- SELECT REQUEST ----------
    reqList.addEventListener("click", async (e) => {
      const item = e.target.closest(".item");
      if (!item) return;

      const id = Number(item.dataset.id);
      const r = requests.find(x => Number(x.leaveId) === id);
      if (!r) return;

      selected = r;
      hide(empty);
      show(panel);

      sName.textContent = r.studentName || "—";
      sId.textContent = `ID: ${r.studentId || "—"}`;
      clsLine.textContent = `Class: ${r.standard}-${r.section}`;
      statusBadge.innerHTML = badge(r.status);

      subj.textContent = r.subjectName || "—";
      dates.textContent = `${r.fromDate} → ${r.toDate}`;
      purpose.textContent = r.purpose || "—";
      desc.textContent = r.description || "—";

      remark.value = r.teacherRemark || "";
      decisionStatus.value =
        String(r.status || "").toUpperCase() === "REJECTED"
          ? "REJECTED"
          : "APPROVED";

      clearErr(panelErr);
    });

    // ---------- OPEN (MARK VIEWED) - SILENT (NO POPUP) ----------
    btnOpen.addEventListener("click", async () => {
      clearErr(panelErr);
      try {
        if (!selected) throw new Error("Select a request first");

        setBtnLoading(btnOpen, true, "Opening...");

        const d = await fetchJson(
          `/teacher/api/leaves/${encodeURIComponent(teacherId)}/${encodeURIComponent(selected.leaveId)}`
        );

        selected = d;
        statusBadge.innerHTML = badge(d.status);
        remark.value = d.teacherRemark || remark.value;
        desc.textContent = d.description || "—";

        // ✅ silent refresh (NO modal)
        await loadRequests();
      } catch (e) {
        showErr(panelErr, e.message || "Failed");
      } finally {
        setBtnLoading(btnOpen, false, "Open");
      }
    });

    // ---------- SUBMIT DECISION (ONLY HERE SHOW MODAL) ----------
    btnSubmit.addEventListener("click", async () => {
      clearErr(panelErr);

      try {
        if (!selected) throw new Error("Select a request first");

        setBtnLoading(btnSubmit, true, "Submitting...");

        const payload = {
          status: decisionStatus.value,
          remark: remark.value.trim() || null
        };

        await ctx.postJson(
          `/teacher/api/leaves/${encodeURIComponent(teacherId)}/${encodeURIComponent(selected.leaveId)}/decision`,
          payload
        );

        const st = String(payload.status || "").toUpperCase();
        if (st === "APPROVED") openModal("ok", "Leave Approved", "Approved ✅");
        else if (st === "REJECTED") openModal("no", "Leave Rejected", "Rejected ❌");
        else openModal("info", "Updated", "Updated");

        // refresh list + keep panel synced
        await loadRequests();

        const updated = requests.find(x => Number(x.leaveId) === Number(selected.leaveId));
        if (updated) {
          selected = updated;
          statusBadge.innerHTML = badge(updated.status);
          remark.value = updated.teacherRemark || remark.value;
          desc.textContent = updated.description || desc.textContent;
        }

      } catch (e) {
        showErr(panelErr, e.message || "Failed");
      } finally {
        setBtnLoading(btnSubmit, false, "Submit");
      }
    });

    // ---------- REFRESH - SILENT (NO POPUP) ----------
    btnRefresh.addEventListener("click", async () => {
      setBtnLoading(btnRefresh, true, "Refreshing...");
      await loadRequests().catch(() => {});
      setBtnLoading(btnRefresh, false, "Refresh");
    });

    searchBox.addEventListener("input", () => {
      const q = (searchBox.value || "").trim().toLowerCase();
      if (!q) return renderList(requests);

      const filtered = requests.filter(r => {
        const blob = `${r.studentId || ""} ${r.studentName || ""} ${r.status || ""} ${r.subjectName || ""}`.toLowerCase();
        return blob.includes(q);
      });
      renderList(filtered);
    });

    // ---- INIT LOAD ----
    loadRequests();
  }
};