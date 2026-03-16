console.log("✅ teacher-exam-result.js loaded (module)");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.results = {
  async init(ctx) {
    const { teacherId, fetchJson, postJson } = ctx;

    // ✅ Wait until page HTML is actually present
    const waitForRoot = async (tries = 80) => {
      for (let i = 0; i < tries; i++) {
        const root = document.getElementById("examResultRoot");
        if (root) return root;
        await new Promise((r) => setTimeout(r, 25));
      }
      return null;
    };

    const root = await waitForRoot();
    if (!root) {
      console.error("❌ results: examResultRoot not found. HTML not injected.");
      return;
    }

    // ✅ Query INSIDE root (no conflicts with other pages)
    const $ = (id) => root.querySelector(`#${id}`);

    const examSelect = $("examSelect");
    const classSelect = $("classSelect");
    const studentsBody = $("studentsBody");
    const totalMarksInput = $("totalMarks");
    const saveBtn = $("saveBtn");
    const statusText = $("statusText");
    const emptyText = $("emptyText");
    const tableHint = $("tableHint");
    const sessionChip = $("sessionChip");

    if (!examSelect || !classSelect || !studentsBody || !totalMarksInput || !saveBtn) {
      console.error("❌ results: Missing elements inside root. Check ids.");
      return;
    }

    // ============================
    // UI HELPERS
    // ============================
    // ✅ Nursery/LKG/UKG mapping (UI ONLY — backend unchanged)
    function classLabel(std) {
      const n = Number(std);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      if (Number.isFinite(n)) return String(n);
      return "-";
    }

    function setStatus(msg, type = "") {
      if (!statusText) return;
      statusText.className = "status";
      if (type === "ok") statusText.classList.add("ok");
      if (type === "err") statusText.classList.add("err");
      statusText.textContent = msg || "";
    }

    function setHint(msg) {
      if (tableHint) tableHint.textContent = msg || "";
    }

    function clearTable(msg = "Select exam and class to load students") {
      studentsBody.innerHTML = "";
      if (emptyText) {
        emptyText.style.display = "block";
        emptyText.textContent = msg;
      }
    }

    function renderStudents(students, markMap) {
      studentsBody.innerHTML = "";

      if (!students || students.length === 0) {
        clearTable("No students found");
        return;
      }

      if (emptyText) emptyText.style.display = "none";

      students.forEach((student) => {
        const profile = student.profileUrl || "/images/default-avatar.png";

        // markMap keyed by student.id (as per your student input dataset)
        const mark = markMap?.[student.id] ?? "";

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><img src="${profile}" class="avatar" alt="photo"></td>
          <td>
            <div class="name">${student.fullName}</div>
            <div class="meta">ID: ${student.studentId}</div>
          </td>
          <td>
            <input
              type="number"
              class="markInput"
              data-id="${student.id}"
              value="${mark}"
              placeholder="0"
              min="0"
            />
          </td>
        `;
        studentsBody.appendChild(tr);
      });
    }

    // ============================
    // STATE (reset every init)
    // ============================
    let currentSubject = null;
    let currentExamId = null;
    let currentStandard = null;
    let currentSection = null;

    // ============================
    // LOAD EXAMS
    // ============================
    async function loadExams() {
      const exams = await fetchJson("/student/api/exams");

      examSelect.innerHTML = "";
      const opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = "Select Exam";
      examSelect.appendChild(opt0);

      (exams || []).forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = e.examName;
        examSelect.appendChild(opt);
      });
    }

    // ============================
    // LOAD CLASSES (teacher assignments)
    // ============================
    async function loadClasses() {
      const classes = await fetchJson(
        `/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`
      );

      classSelect.innerHTML = "";
      const opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = "Select Class";
      classSelect.appendChild(opt0);

      if (!classes || !classes.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No assignments found";
        classSelect.appendChild(opt);
        return;
      }

      (classes || []).forEach((c) => {
        const std = c.standard ?? c.std ?? c.classNumber ?? c.class;
        const sec = c.section ?? c.sec;
        const subj = c.subject || c.subjectName || "Subject";

        const opt = document.createElement("option");

        // ✅ backend unchanged: value still uses original numeric standard
        opt.value = `${std}|${sec}|${subj}`;

        // ✅ UI ONLY: show Nursery/LKG/UKG
        opt.textContent = `Class ${classLabel(std)}-${sec} (${subj})`;

        classSelect.appendChild(opt);
      });
    }

    // ============================
    // LOAD STUDENTS + EXISTING MARKS
    // ============================
    async function loadStudents(silent = false) {
      const examId = examSelect.value;
      const classVal = classSelect.value;

      if (!examId || !classVal) {
        clearTable();
        setHint("Select exam and class to load students");
        if (!silent) setStatus("");
        return;
      }

      const parts = classVal.split("|");
      currentExamId = Number(examId);
      currentStandard = Number(parts[0]); // numeric standard stays same
      currentSection = parts[1];
      currentSubject = parts[2];

      if (!silent) setStatus("Loading students...");
      setHint("Loading students...");

      // students list
      const students = await fetchJson(
        `/teacher/api/students/${currentStandard}/${encodeURIComponent(currentSection)}`
      );

      // existing marks
      let existingMarks = [];
      try {
        existingMarks = await fetchJson(
          `/teacher/api/exam-results/${currentExamId}/${currentStandard}/${encodeURIComponent(
            currentSection
          )}/${encodeURIComponent(currentSubject)}`
        );
      } catch {
        existingMarks = [];
      }

      const markMap = {};
      if (Array.isArray(existingMarks)) {
        existingMarks.forEach((m) => {
          // ✅ Your table input uses data-id = student.id
          // Your existing results API seems to return m.studentId that matches student.id
          markMap[m.studentId] = m.marksObtained;
          if (m.totalMarks != null) totalMarksInput.value = m.totalMarks;
        });
      }

      renderStudents(students, markMap);

      setHint(`Loaded ${students?.length || 0} students`);
      if (!silent) setStatus("");
    }

    // ============================
    // SAVE RESULTS
    // ============================
    async function saveResults() {
      try {
        if (!currentExamId) return setStatus("Select exam", "err");
        if (!currentStandard && currentStandard !== 0) return setStatus("Select class", "err");

        const totalMarks = Number(totalMarksInput.value);
        if (!totalMarks) return setStatus("Enter total marks", "err");

        const marks = [];
        root.querySelectorAll(".markInput").forEach((input) => {
          marks.push({
            studentId: Number(input.dataset.id),
            marksObtained: Number(input.value || 0),
          });
        });

        setStatus("Saving results...");
        setHint("Saving results...");

        await postJson("/teacher/api/exam-results", {
          examId: currentExamId,
          standard: currentStandard, // numeric standard stays same (backend unchanged)
          section: currentSection,
          subjectName: currentSubject,
          totalMarks,
          marks,
        });

        setStatus("✅ Saved successfully", "ok");
        setHint("Saved successfully");

        await loadStudents(true);
      } catch (e) {
        setStatus(e.message || "Save failed", "err");
      }
    }

    // ============================
    // INIT PAGE (like timetable)
    // ============================
    async function initPage() {
      clearTable();
      setStatus("");
      setHint("Loading...");

      if (sessionChip) sessionChip.textContent = `Teacher: ${teacherId}`;

      await Promise.all([loadExams(), loadClasses()]);

      setHint("Select exam and class to load students");
      setStatus("");

      // ✅ prevent duplicates (overwrite handlers)
      examSelect.onchange = () => loadStudents(false);
      classSelect.onchange = () => loadStudents(false);
      saveBtn.onclick = saveResults;
    }

    // ✅ Run
    try {
      await initPage();
    } catch (e) {
      console.error("❌ results init failed:", e);
      setStatus(e.message || "Failed to initialize page", "err");
      setHint("");
      examSelect.innerHTML = `<option value="">Failed to load exams</option>`;
      classSelect.innerHTML = `<option value="">Failed to load classes</option>`;
    }
  },
};