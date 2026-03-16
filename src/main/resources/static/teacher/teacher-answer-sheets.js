console.log("✅ teacher-answer-sheets.js loaded (module)");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.answer_sheets = {
  async init(ctx) {
    const { teacherId, fetchJson } = ctx;

    const waitForRoot = async (tries = 100) => {
      for (let i = 0; i < tries; i++) {
        const root = document.getElementById("answerSheetsRoot");
        if (root) return root;
        await new Promise((r) => setTimeout(r, 25));
      }
      return null;
    };

    const root = await waitForRoot();
    if (!root) return;

    const $ = (id) => root.querySelector(`#${id}`);

    const examSelect = $("asExamSelect");
    const classSelect = $("asClassSelect");
    const tbody = $("asTbody");
    const empty = $("asEmpty");
    const hint = $("asHint");
    const errBox = $("asError");
    const reloadBtn = $("asReloadBtn");
    const fileInput = $("asFileInput");

    // ✅ Nursery/LKG/UKG mapping (UI ONLY — backend unchanged)
    function classLabel(std) {
      const n = Number(std);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      if (Number.isFinite(n)) return String(n);
      return "-";
    }

    function showErr(msg) {
      errBox.style.display = "block";
      errBox.textContent = msg || "Something went wrong";
    }
    function clearErr() {
      errBox.style.display = "none";
      errBox.textContent = "";
    }
    function setHint(msg) {
      hint.textContent = msg || "";
    }

    const session = JSON.parse(localStorage.getItem("smp_session") || "{}");
    const basicToken = session.basicToken;

    async function apiFetch(url, opts = {}) {
      const res = await fetch(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(basicToken ? { Authorization: `Basic ${basicToken}` } : {}),
        },
      });
      const txt = await res.text().catch(() => "");
      if (!res.ok) throw new Error(txt || `HTTP ${res.status}`);
      try {
        return txt ? JSON.parse(txt) : null;
      } catch {
        return txt;
      }
    }

    let currentExamId = null;
    let currentStandard = null;
    let currentSection = null;
    let currentSubject = null;
    let pickedStudentDbId = null;

    async function loadExams() {
      const list = await fetchJson("/student/api/exams");
      examSelect.innerHTML = `<option value="">Select Exam</option>`;
      (list || []).forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = e.examName;
        examSelect.appendChild(opt);
      });
    }

    async function loadAssignedClasses() {
      const data = await fetchJson(
        `/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`
      );

      classSelect.innerHTML = `<option value="">Select Class</option>`;

      (data || []).forEach((a) => {
        const std = a.standard ?? a.std ?? a.classNumber ?? a.class;
        const sec = a.section ?? a.sec;
        const subj = a.subject || a.subjectName || "Subject";

        const opt = document.createElement("option");

        // ✅ backend unchanged: value still uses numeric standard
        opt.value = `${std}|${sec}|${subj}`;

        // ✅ UI ONLY: show Nursery/LKG/UKG
        opt.textContent = `Class ${classLabel(std)}-${sec} (${subj})`;

        classSelect.appendChild(opt);
      });

      if (!data || !data.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No assignments found";
        classSelect.appendChild(opt);
      }
    }

    function clearTable() {
      tbody.innerHTML = "";
      empty.style.display = "none";
    }

    function render(rows, existingMap) {
      clearTable();
      if (!rows || !rows.length) {
        empty.style.display = "";
        return;
      }

      rows.forEach((s) => {
        const tr = document.createElement("tr");
        const profile = s.profileUrl || "/images/default-avatar.png";

        const sheet = existingMap.get(String(s.id)); // studentDbId as key
        const has = !!sheet;

        tr.innerHTML = `
          <td><img src="${profile}" class="avatar" /></td>
          <td>
            <div class="name">${s.fullName}</div>
            <div class="meta">ID: ${s.studentId}</div>
          </td>
          <td>
            ${
              has
                ? `<b>${sheet.originalFileName}</b><div class="muted" style="font-size:12px;">Uploaded: ${sheet.uploadedAt}</div>`
                : `<span class="muted">No PDF uploaded</span>`
            }
          </td>
          <td style="text-align:right;">
            <button class="btn ghost" data-act="view" ${has ? "" : "disabled"}>View</button>
            <button class="btn dark" data-act="upload">${has ? "Replace" : "Upload"}</button>
            <button class="btn ghost" data-act="del" ${has ? "" : "disabled"}>Delete</button>
          </td>
        `;

        const viewBtn = tr.querySelector('[data-act="view"]');
        const uploadBtn = tr.querySelector('[data-act="upload"]');
        const delBtn = tr.querySelector('[data-act="del"]');

        viewBtn?.addEventListener("click", () => {
          window.open(`/teacher/api/answer-sheets/${sheet.id}/download`, "_blank");
        });

        uploadBtn.addEventListener("click", () => {
          pickedStudentDbId = s.id;
          fileInput.value = "";
          fileInput.click();
        });

        delBtn?.addEventListener("click", async () => {
          if (!confirm("Delete this PDF from backend?")) return;
          await apiFetch(`/teacher/api/answer-sheets/${sheet.id}`, { method: "DELETE" });
          await loadStudentsAndSheets();
        });

        tbody.appendChild(tr);
      });
    }

    async function loadStudentsAndSheets() {
      try {
        clearErr();
        clearTable();

        const examId = examSelect.value;
        const cls = classSelect.value;

        if (!examId || !cls) {
          setHint("Select exam and class");
          return;
        }

        const [std, sec, subj] = cls.split("|");
        currentExamId = Number(examId);
        currentStandard = Number(std);
        currentSection = sec;
        currentSubject = subj;

        setHint("Loading students...");

        const students = await apiFetch(
          `/teacher/api/students/${currentStandard}/${encodeURIComponent(currentSection)}`
        );

        // sheets list for class (we map by studentDbId)
        const sheets = await apiFetch(
          `/teacher/api/answer-sheets/class?examId=${encodeURIComponent(
            currentExamId
          )}&standard=${encodeURIComponent(currentStandard)}&section=${encodeURIComponent(
            currentSection
          )}`
        );

        const map = new Map();
        (sheets || [])
          .filter(
            (x) =>
              (x.subjectName || "").toLowerCase() === (currentSubject || "").toLowerCase()
          )
          .forEach((x) => map.set(String(x.studentDbId), x));

        render(students || [], map);
        setHint(`Loaded ${students?.length || 0} students`);
      } catch (e) {
        showErr(e.message || "Failed to load");
        setHint("");
      }
    }

    // Upload handler
    fileInput.addEventListener("change", async () => {
      try {
        clearErr();
        const f = fileInput.files?.[0];
        if (!f) return;

        if (!currentExamId || !pickedStudentDbId || !currentSubject) {
          return showErr("Select exam/class and pick a student");
        }

        const fd = new FormData();
        fd.append("examId", String(currentExamId));
        fd.append("studentDbId", String(pickedStudentDbId));
        fd.append("subjectName", String(currentSubject));
        fd.append("teacherId", String(teacherId));
        fd.append("file", f);

        setHint("Uploading PDF...");

        await apiFetch("/teacher/api/answer-sheets/upload", {
          method: "POST",
          body: fd,
        });

        setHint("✅ Uploaded");
        await loadStudentsAndSheets();
      } catch (e) {
        showErr(e.message || "Upload failed");
        setHint("");
      }
    });

    async function initPage() {
      clearErr();
      clearTable();
      setHint("Loading...");
      await Promise.all([loadExams(), loadAssignedClasses()]);
      setHint("Select exam and class");
      examSelect.onchange = loadStudentsAndSheets;
      classSelect.onchange = loadStudentsAndSheets;
    }

    reloadBtn.onclick = initPage;

    try {
      await initPage();
    } catch (e) {
      showErr(e.message || "Failed to initialize");
      setHint("");
    }
  },
};