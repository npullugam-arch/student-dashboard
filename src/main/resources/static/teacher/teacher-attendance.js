window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.attendance = {
  async init(ctx) {
    const { teacherId, fetchJson, postJson, opts } = ctx;

    const classSelect = document.getElementById("classSelect");
    const dateSelect = document.getElementById("dateSelect");
    const submitBtn = document.getElementById("submitAttendanceBtn");
    const studentsList = document.getElementById("studentsList");
    const loading = document.getElementById("studentsLoading");
    const error = document.getElementById("studentsError");

    // ---------- helpers ----------
    function todayStr() {
      return new Date().toISOString().slice(0, 10);
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

    function showLoading(on) {
      if (!loading) return;
      loading.style.display = on ? "block" : "none";
    }

    function showError(msg) {
      if (!error) return;
      error.style.display = "block";
      error.textContent = msg || "Something went wrong";
    }

    function clearError() {
      if (!error) return;
      error.style.display = "none";
      error.textContent = "";
    }

    function enforceTodayDate() {
      const t = todayStr();
      if (dateSelect) {
        dateSelect.value = t;
        dateSelect.min = t;
        dateSelect.max = t;
        dateSelect.setAttribute("title", "Attendance can be taken only for today");
      }
    }

    // ---------- dropdown ----------
    // ✅ show subject + Nursery/LKG/UKG in dropdown text (NO backend change)
    async function loadAssignmentsIntoDropdown(selectedVal) {
      classSelect.innerHTML = "";
      classSelect.disabled = true;

      let data = [];
      try {
        data = await fetchJson(`/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`);
      } catch (e) {
        // optional fallback (if you have it in your project)
        try {
          data = await fetchJson(`/teacher/api/dashboard/${encodeURIComponent(teacherId)}/assignments`);
        } catch {
          data = [];
        }
      }

      (data || []).forEach((a) => {
        const std = a.standard ?? a.std ?? a.classNumber ?? a.class;
        const sec = a.section ?? a.sec;
        const subj = a.subject || a.subjectName || "Subject";

        // ✅ keep value as std|sec so existing logic stays same
        const opt = document.createElement("option");
        opt.value = `${std}|${sec}`;
        opt.textContent = `Class ${classLabel(std)}-${sec} (${subj})`; // ✅ UI FIX
        classSelect.appendChild(opt);
      });

      if (!classSelect.children.length) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No assignments found";
        classSelect.appendChild(opt);
      }

      if (selectedVal) classSelect.value = selectedVal;

      classSelect.disabled = false;
    }

    // ---------- API ----------
    async function checkStatusTaken(standard, section, date) {
      return fetchJson(
        `/teacher/attendance/daily/status?standard=${encodeURIComponent(standard)}&section=${encodeURIComponent(section)}&date=${encodeURIComponent(date)}`
      );
    }

    // ---------- renders ----------
    function renderLocked(standard, section, date) {
      studentsList.innerHTML = `
        <div class="info">
          ✅ Attendance is already taken for today (${date}) for Class ${classLabel(standard)}-${section}.
        </div>
      `;
      submitBtn.disabled = true;
    }

    function renderNoStudents() {
      studentsList.innerHTML = `<div class="info">No students found in this class.</div>`;
      submitBtn.disabled = true;
    }

    function renderSelectInfo() {
      studentsList.innerHTML = `<div class="info">Select a class to take attendance.</div>`;
      submitBtn.disabled = true;
    }

    function renderStudents(students) {
      studentsList.innerHTML = "";

      (students || []).forEach((s) => {
        const safeName = s.fullName || "Student";
        const firstLetter = safeName.trim().charAt(0).toUpperCase();

        const row = document.createElement("div");
        row.className = "student-row";
        row.innerHTML = `
          <div class="student-left">
            <div class="s-avatar">
              ${s.profileUrl ? `<img src="${s.profileUrl}" alt="">` : firstLetter}
            </div>
            <div>
              <div class="s-name">${safeName}</div>
              <div class="s-meta">${s.studentId}</div>
            </div>
          </div>
          <label class="toggle">
            Present
            <input type="checkbox" data-id="${s.studentId}" checked />
          </label>
        `;
        studentsList.appendChild(row);
      });

      submitBtn.disabled = false;
    }

    // ---------- main flow ----------
    async function onClassChangedAuto() {
      studentsList.innerHTML = "";
      clearError();
      submitBtn.disabled = true;

      const val = classSelect.value;
      if (!val) {
        renderSelectInfo();
        return;
      }

      enforceTodayDate();

      const [standard, section] = val.split("|");
      const date = todayStr();

      showLoading(true);

      try {
        // 1) check lock
        const status = await checkStatusTaken(standard, section, date);
        if (status && status.taken) {
          showLoading(false);
          renderLocked(standard, section, date);
          return;
        }

        // 2) load students
        const students = await fetchJson(
          `/teacher/dashboard/students?standard=${encodeURIComponent(standard)}&section=${encodeURIComponent(section)}`
        );

        showLoading(false);

        if (!students || students.length === 0) {
          renderNoStudents();
          return;
        }

        renderStudents(students);
      } catch (e) {
        showLoading(false);
        showError(e?.message || "Failed to load students");
        submitBtn.disabled = true;
      }
    }

    // ---------- date lock ----------
    enforceTodayDate();
    dateSelect?.addEventListener("change", () => {
      const t = todayStr();
      if (dateSelect.value !== t) {
        alert("❌ You can take attendance only for TODAY.\nPast/Future dates are locked.");
        dateSelect.value = t;
      }
    });

    // ---------- init ----------
    const selectedFromClasses = opts?.selectedClass;
    await loadAssignmentsIntoDropdown(selectedFromClasses);

    classSelect.addEventListener("change", onClassChangedAuto);
    await onClassChangedAuto();

    // ---------- submit ----------
    submitBtn.onclick = async () => {
      enforceTodayDate();

      const val = classSelect.value || "";
      const [standardStr, section] = val.split("|");
      const standard = Number(standardStr);
      const date = todayStr();

      const attendance = {};
      document.querySelectorAll("input[data-id]").forEach((cb) => {
        attendance[cb.dataset.id] = cb.checked;
      });

      try {
        submitBtn.disabled = true;
        clearError();

        await postJson("/teacher/attendance/daily/mark", {
          teacherId,
          standard,
          section,
          date,
          attendance,
        });

        studentsList.innerHTML = `
          <div class="info">
            ✅ Attendance locked for today (${date}) for Class ${classLabel(standard)}-${section}.
          </div>
        `;
        submitBtn.disabled = true;
      } catch (e) {
        if (e && e.code === "ALREADY_TAKEN") {
          renderLocked(standard, section, todayStr());
          alert("✅ Attendance is already taken for today.");
          return;
        }
        alert("❌ " + (e?.message || "Failed to submit attendance"));
        submitBtn.disabled = false;
      }
    };
  },
};