console.log("✅ teacher/teacher-diary.js loaded");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.diary = {
  init: function (ctx) {
    const { teacherId, fetchJson, postJson } = ctx;

    const classSelect = document.getElementById("classSelect");
    const dateInp = document.getElementById("dateInp");
    const topicInp = document.getElementById("topicInp");
    const workInp = document.getElementById("workInp");
    const btnSave = document.getElementById("btnSave");
    const btnRefresh = document.getElementById("btnRefresh");
    const listEl = document.getElementById("list");
    const errEl = document.getElementById("err");
    const saveMsg = document.getElementById("saveMsg");
    const subPill = document.getElementById("subPill");

    // ---- state for edit mode ----
    let editingId = null;           // diary id being edited
    let existingForSelectedDate = null;

    function showErr(msg) { errEl.textContent = msg; errEl.classList.remove("hidden"); }
    function clearErr() { errEl.textContent = ""; errEl.classList.add("hidden"); }
    function setMsg(m) { saveMsg.textContent = m || ""; }

    function today() {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${mm}-${dd}`;
    }

    function escapeHtml(s) {
      return String(s ?? "")
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    // ✅ Nursery/LKG/UKG mapping
    function classLabel(std) {
      const n = Number(std);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      if (Number.isFinite(n)) return String(n);
      return "-";
    }

    // ✅ Parse dropdown value: "standard|section|subjectName"
    function getSelected() {
      const raw = String(classSelect.value || "");
      const parts = raw.split("|");
      const standard = Number(parts[0] || 0);
      const section = (parts[1] || "").trim();
      const subjectName = (parts[2] || "").trim();
      return { standard, section, subjectName };
    }

    function updateSubPill() {
      if (!subPill) return;
      const sel = getSelected();
      if (sel.standard && sel.section && sel.subjectName) {
        subPill.innerHTML =
          `Selected: <b>Class ${escapeHtml(classLabel(sel.standard))}-${escapeHtml(sel.section)}</b> • ` +
          `<b>${escapeHtml(sel.subjectName)}</b>`;
      } else {
        subPill.textContent = "";
      }
    }

    function setModeCreate() {
      editingId = null;
      existingForSelectedDate = null;
      btnSave.textContent = "Save";
      setMsg("");
    }

    function setModeEdit(entry) {
      editingId = entry?.id ?? null;
      existingForSelectedDate = entry || null;
      btnSave.textContent = "Update";
      setMsg("✅ Diary exists for selected date. You can update or delete it.");
      // fill inputs
      if (topicInp) topicInp.value = entry?.topic || "";
      if (workInp) workInp.value = entry?.workToday || "";
    }

    // ✅ Load teacher assignments and show subject-wise options
    async function loadClasses() {
      clearErr();

      let list = null;
      try {
        list = await fetchJson(`/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`);
      } catch (e1) {
        try {
          list = await fetchJson(`/teacher/api/dashboard/${encodeURIComponent(teacherId)}/assignments`);
        } catch (e2) {
          try {
            list = await fetchJson(`/teacher/api/diary/${encodeURIComponent(teacherId)}/classes`);
          } catch (e3) {
            classSelect.innerHTML = `<option value="">No assignments found</option>`;
            throw new Error(
              "Failed to load teacher assignments.\n" +
              "Tried:\n" +
              "1) /teacher/dashboard/{teacherId}/assignments\n" +
              "2) /teacher/api/dashboard/{teacherId}/assignments\n" +
              "3) /teacher/api/diary/{teacherId}/classes\n\n" +
              "Server says:\n" + (e3?.message || e2?.message || e1?.message || "Unknown error")
            );
          }
        }
      }

      const arr = Array.isArray(list) ? list : [];
      if (!arr.length) {
        classSelect.innerHTML = `<option value="">No assignments found</option>`;
        updateSubPill();
        return;
      }

      const normalized = arr.map(a => {
        const standard = a.standard ?? a.std ?? a.classNumber ?? a.class;
        const section = a.section ?? a.sec;
        const subjectName = a.subject || a.subjectName || a.subject_name || "";
        return {
          standard: Number(standard || 0),
          section: String(section || "").trim().toUpperCase(),
          subjectName: String(subjectName || "").trim()
        };
      }).filter(x => x.standard && x.section && x.subjectName);

      if (!normalized.length) {
        classSelect.innerHTML = `<option value="">Subjects missing in assignments</option>`;
        updateSubPill();
        showErr("Assignments loaded, but subjectName not found. Your assignments API must return subject/subjectName.");
        return;
      }

      normalized.sort((a, b) =>
        (a.standard - b.standard) ||
        a.section.localeCompare(b.section) ||
        a.subjectName.localeCompare(b.subjectName)
      );

      classSelect.innerHTML = normalized.map(x => {
        // ✅ IMPORTANT: keep raw subject in value (not HTML-escaped)
        const v = `${x.standard}|${x.section}|${x.subjectName}`;
        const label = `Class ${classLabel(x.standard)}-${x.section} (${x.subjectName})`;
        return `<option value="${escapeHtml(v)}">${escapeHtml(label)}</option>`;
      }).join("");

      updateSubPill();
    }

    // ✅ Fetch list for selected class-section-subject
    async function fetchEntriesForSelection() {
      const sel = getSelected();
      if (!sel.standard || !sel.section || !sel.subjectName) return [];

      const url =
        `/teacher/api/diary/${encodeURIComponent(teacherId)}` +
        `?standard=${encodeURIComponent(sel.standard)}` +
        `&section=${encodeURIComponent(sel.section)}` +
        `&subjectName=${encodeURIComponent(sel.subjectName)}`;

      const list = await fetchJson(url);
      return Array.isArray(list) ? list : [];
    }

    // ✅ One-diary rule: find entry for selected date from list
    function findEntryForDate(entries, date) {
      return (entries || []).find(e => String(e.entryDate || "") === String(date || ""));
    }

    function renderList(entries) {
      const arr = Array.isArray(entries) ? entries : [];
      if (!arr.length) {
        listEl.innerHTML = `<div class="muted">No diary entries yet.</div>`;
        return;
      }

      listEl.innerHTML = arr.map(d => `
        <div class="item" data-id="${escapeHtml(d.id)}">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div style="font-weight:800">${escapeHtml(d.topic || "—")}</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-sm btn-edit" data-id="${escapeHtml(d.id)}">Edit</button>
              <button class="btn btn-sm btn-del" data-id="${escapeHtml(d.id)}">Delete</button>
            </div>
          </div>

          <div class="muted" style="font-size:12px;margin-top:4px">
            📅 ${escapeHtml(d.entryDate || "")}
            ${d.subjectName ? ` • 🧾 ${escapeHtml(d.subjectName)}` : ""}
          </div>

          <div style="white-space:pre-wrap;margin-top:8px;line-height:1.45">${escapeHtml(d.workToday || "")}</div>
        </div>
      `).join("");
    }

    async function loadMyEntries() {
      clearErr();
      setMsg("");
      updateSubPill();

      listEl.innerHTML = `<div class="muted">Loading...</div>`;

      try {
        const sel = getSelected();
        if (!sel.standard || !sel.section || !sel.subjectName) {
          listEl.innerHTML = `<div class="muted">Select class + section + subject.</div>`;
          setModeCreate();
          return;
        }

        const entries = await fetchEntriesForSelection();
        renderList(entries);

        // ✅ One diary per day rule (UI mode switch)
        const pickedDate = dateInp.value || today();
        const entryForDate = findEntryForDate(entries, pickedDate);

        if (entryForDate) setModeEdit(entryForDate);
        else setModeCreate();

      } catch (e) {
        listEl.innerHTML = "";
        setModeCreate();
        showErr(e.message || "Failed to load diary entries");
      }
    }

    // ✅ Save (Create or Update)
    btnSave.addEventListener("click", async () => {
      clearErr();
      setMsg("");

      try {
        const sel = getSelected();
        if (!sel.standard || !sel.section || !sel.subjectName) throw new Error("Select class + section + subject");

        const entryDate = dateInp.value || today();
        const payload = {
          standard: sel.standard,
          section: sel.section,
          subjectName: sel.subjectName,
          entryDate,
          topic: (topicInp.value || "").trim(),
          workToday: (workInp.value || "").trim()
        };

        if (!payload.topic) throw new Error("Topic required");
        if (!payload.workToday) throw new Error("Work today required");

        // ✅ If editingId exists => UPDATE
        if (editingId) {
          const res = await postJson(
            `/teacher/api/diary/${encodeURIComponent(teacherId)}/${encodeURIComponent(editingId)}`,
            payload
          );
          setMsg(String(res || "Updated ✅"));
        } else {
          // ✅ CREATE (one diary rule enforced by backend)
          const res = await postJson(`/teacher/api/diary/${encodeURIComponent(teacherId)}`, payload);
          setMsg(String(res || "Saved ✅"));
        }

        await loadMyEntries();

      } catch (e) {
        // If backend returns 409 "DIARY_ALREADY_EXISTS", show friendly message
        const msg = e?.message || "Failed";
        if (String(msg).includes("DIARY_ALREADY_EXISTS") || String(msg).includes("already exists")) {
          showErr("❌ Diary already exists for this date. Please edit/update it (or delete) instead of creating new.");
          // reload to switch mode automatically
          await loadMyEntries();
          return;
        }
        showErr(msg);
      }
    });

    // ✅ When date changes: re-check one diary rule
    dateInp.addEventListener("change", loadMyEntries);

    btnRefresh.addEventListener("click", loadMyEntries);

    // ✅ When class/subject changes: reload
    classSelect.addEventListener("change", async () => {
      setModeCreate();
      await loadMyEntries();
    });

    // ✅ Handle edit/delete clicks from list (event delegation)
    listEl.addEventListener("click", async (e) => {
      const btnEdit = e.target.closest(".btn-edit");
      const btnDel = e.target.closest(".btn-del");

      if (!btnEdit && !btnDel) return;

      const id = (btnEdit || btnDel)?.dataset?.id;
      if (!id) return;

      try {
        clearErr();
        setMsg("");

        const entries = await fetchEntriesForSelection();
        const entry = (entries || []).find(x => String(x.id) === String(id));
        if (!entry) throw new Error("Diary not found in list. Please refresh.");

        if (btnEdit) {
          // ✅ set date to that entry date and switch to edit mode
          dateInp.value = entry.entryDate || today();
          setModeEdit(entry);
          return;
        }

        if (btnDel) {
          const ok = confirm("Delete this diary entry?");
          if (!ok) return;

          const res = await postJson(
            `/teacher/api/diary/${encodeURIComponent(teacherId)}/${encodeURIComponent(id)}/delete`,
            {}
          );
          setMsg(String(res || "Deleted ✅"));

          // after delete, clear form if we were editing same id
          if (String(editingId) === String(id)) {
            topicInp.value = "";
            workInp.value = "";
            setModeCreate();
          }

          await loadMyEntries();
        }
      } catch (err) {
        showErr(err?.message || String(err));
      }
    });

    (async function init() {
      dateInp.value = today();
      await loadClasses();
      await loadMyEntries();
    })();
  }
};