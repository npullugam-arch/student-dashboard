window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.exam_timetable = {
  async init(ctx) {
    const { teacherId, fetchJson } = ctx;

    // ✅ Wait until page HTML is actually present
    const waitForRoot = async (tries = 80) => {
      for (let i = 0; i < tries; i++) {
        const root = document.getElementById("examTimetableRoot");
        if (root) return root;
        await new Promise((r) => setTimeout(r, 25));
      }
      return null;
    };

    const root = await waitForRoot();
    if (!root) {
      console.error("❌ exam_timetable: examTimetableRoot not found. HTML not injected.");
      return;
    }

    // ✅ Query INSIDE root (avoids conflicts with other pages)
    const $ = (id) => root.querySelector(`#${id}`);

    const examSelect = $("ttExamSelect");
    const classSelect = $("ttClassSelect");
    const tbody = $("ttTbody");
    const empty = $("ttEmpty");
    const title = $("ttTitle");
    const status = $("ttStatus");
    const errBox = $("ttError");
    const reloadBtn = $("ttReloadBtn");

    if (!examSelect || !classSelect || !tbody || !empty || !title || !status || !errBox) {
      console.error("❌ exam_timetable: Missing elements inside root. Check ids.");
      return;
    }

    function showErr(msg) {
      errBox.style.display = "block";
      errBox.textContent = msg || "Something went wrong";
    }
    function clearErr() {
      errBox.style.display = "none";
      errBox.textContent = "";
    }
    function clearTable() {
      tbody.innerHTML = "";
      empty.style.display = "none";
    }
    function render(rows) {
      clearTable();
      if (!rows || !rows.length) {
        empty.style.display = "";
        return;
      }
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        const td = (v) => {
          const x = document.createElement("td");
          x.textContent = v ?? "";
          return x;
        };
        tr.appendChild(td(r.examDate));
        tr.appendChild(td(r.day));
        tr.appendChild(td(r.subjectName));
        tr.appendChild(td(r.startTime));
        tr.appendChild(td(r.endTime));
        tbody.appendChild(tr);
      });
    }

    function formatStandardLabel(std) {
      const n = Number(std);
      if (Number.isNaN(n)) return "";
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      return `Class ${n}`;
    }

    async function loadExams() {
      const list = await fetchJson("/student/api/exams");

      examSelect.innerHTML = "";
      const opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = "Select Exam";
      examSelect.appendChild(opt0);

      (list || []).forEach((e) => {
        const opt = document.createElement("option");
        opt.value = e.id;
        opt.textContent = `${e.examName} (ID: ${e.id})`;
        examSelect.appendChild(opt);
      });
    }

    async function loadAssignedClasses() {
      const data = await fetchJson(`/teacher/dashboard/${teacherId}/assignments`);

      classSelect.innerHTML = "";
      const opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = "Select Class";
      classSelect.appendChild(opt0);

      if (!data || !data.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No assignments found";
        classSelect.appendChild(opt);
        return;
      }

      data.forEach((a) => {
        const opt = document.createElement("option");
        opt.value = `${a.standard}|${a.section}`;
        opt.textContent = `${formatStandardLabel(a.standard)} - ${a.section} (Subject: ${a.subject})`;
        classSelect.appendChild(opt);
      });
    }

    async function autoLoadIfReady() {
      clearErr();
      clearTable();

      const examId = examSelect.value;
      const classVal = classSelect.value;

      if (!examId || !classVal) {
        status.textContent = "Select Exam and Assigned Class";
        title.textContent = "Timetable";
        return;
      }

      const [standard, section] = classVal.split("|");
      const examText = examSelect.options[examSelect.selectedIndex]?.textContent || "Timetable";
      title.textContent = examText;
      status.textContent = "Loading...";

      try {
        const rows = await fetchJson(
          `/student/api/exams/${encodeURIComponent(examId)}/timetable?standard=${encodeURIComponent(standard)}&section=${encodeURIComponent(section)}`
        );
        render(rows);
        status.textContent = rows?.length ? `Rows: ${rows.length}` : "No rows";
      } catch (e) {
        console.error("❌ timetable load failed:", e);
        status.textContent = "";
        showErr(e.message || "Failed to load timetable");
      }
    }

    async function initPage() {
      status.textContent = "Loading...";
      clearErr();
      clearTable();

      await Promise.all([loadExams(), loadAssignedClasses()]);
      status.textContent = "Select Exam and Assigned Class";

      // ✅ prevent duplicate listeners if init called multiple times
      examSelect.onchange = autoLoadIfReady;
      classSelect.onchange = autoLoadIfReady;
    }

    // Reload button
    if (reloadBtn) reloadBtn.onclick = initPage;

    // ✅ run
    try {
      await initPage();
    } catch (e) {
      console.error("❌ exam_timetable init failed:", e);
      status.textContent = "";
      showErr(e.message || "Failed to initialize page");
    }
  },
};
