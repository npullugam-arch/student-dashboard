window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.students = {
  async init(ctx) {
    const { teacherId, fetchJson, opts } = ctx;

    // ---------- DOM ----------
    const classSelect = document.getElementById("classSelect");
    const q = document.getElementById("q");
    const btnClear = document.getElementById("btnClear");
    const btnReload = document.getElementById("btnReload");

    const studentsList = document.getElementById("studentsList");
    const loading = document.getElementById("studentsLoading");
    const error = document.getElementById("studentsError");

    // modal
    const profileModal = document.getElementById("profileModal");
    const pClose = document.getElementById("pClose");
    const pOk = document.getElementById("pOk");
    const pSub = document.getElementById("pSub");
    const pBody = document.getElementById("pBody");

    if (!classSelect || !studentsList) {
      console.warn("teacher-students.js: required DOM not found");
      return;
    }

    // ---------- helpers ----------
    function safeVal(v) {
      return (v === null || v === undefined || String(v).trim() === "") ? "-" : String(v);
    }

    // ✅ UPDATED: maps -2/-1/0 to Nursery/LKG/UKG
    function classLabel(std) {
      const n = Number(std);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      if (Number.isFinite(n)) return String(n);
      return "-";
    }

    function fmtDate(iso) {
      if (!iso) return "-";
      const s = String(iso);
      const parts = s.split("-");
      if (parts.length !== 3) return s;
      const [y, m, d] = parts;
      return `${d}-${m}-${y}`;
    }

    function safeImgUrl(name) {
      const n = (name || "Student").trim();
      return "https://ui-avatars.com/api/?name=" + encodeURIComponent(n) + "&background=667eea&color=fff&size=96";
    }

    function showErr(msg) {
      if (!error) return;
      error.style.display = "block";
      error.textContent = msg;
    }

    function clearErr() {
      if (!error) return;
      error.style.display = "none";
      error.textContent = "";
    }

    function showLoading(on) {
      if (!loading) return;
      loading.style.display = on ? "block" : "none";
    }

    function renderInfo(msg) {
      studentsList.innerHTML = `<div class="info">${msg}</div>`;
    }

    // ---------- state ----------
    let allStudents = [];
    let currentAssignment = { standard: null, section: null, subject: "" };

    function readSelectedAssignment() {
      // value format: std|sec|subject
      const val = classSelect.value || "";
      const parts = val.split("|");
      const standard = parts[0] || "";
      const section = parts[1] || "";
      const subject = parts[2] || ""; // might be missing if older saved
      return { standard, section, subject };
    }

    // ---------- render ----------
    function studentCardHtml(s, forcedStd, forcedSec) {
      const name = s.fullName || s.studentName || "Student";
      const first = name.trim().charAt(0).toUpperCase();
      const img = s.profileUrl || s.photoUrl;

      // ✅ StudentId (safe)
      const sid = safeVal(s.studentId);

      // ✅ Force class from selected assignment (fix dashed issue)
      const std = forcedStd ?? s.standard;
      const sec = forcedSec ?? s.section;

      return `
        <div class="studentCard" role="button" tabindex="0" data-sid="${sid}">
          <div class="left">
            <div class="avatar">
              ${img ? `<img src="${img}" alt=""/>` : first}
            </div>
            <div style="min-width:0">
              <div class="name">${safeVal(name)}</div>
              <div class="meta">
                ${sid} • Class ${classLabel(std)}-${safeVal(sec)}
              </div>
            </div>
          </div>
          <div class="badge">View</div>
        </div>
      `;
    }

    function renderStudents(list) {
      if (!list || list.length === 0) {
        renderInfo("No students found in this class.");
        return;
      }

      // ✅ Always show correct class/section using selected assignment
      const forcedStd = currentAssignment.standard;
      const forcedSec = currentAssignment.section;

      studentsList.innerHTML = list.map(s => studentCardHtml(s, forcedStd, forcedSec)).join("");
    }

    function applySearch() {
      const term = (q?.value || "").trim().toLowerCase();
      if (!term) {
        renderStudents(allStudents);
        return;
      }
      const filtered = allStudents.filter((s) => {
        const name = String(s.fullName || s.studentName || "").toLowerCase();
        const sid = String(s.studentId || "").toLowerCase();
        return name.includes(term) || sid.includes(term);
      });
      renderStudents(filtered);
    }

    // ---------- modal ----------
    function closeProfileModal() {
      if (!profileModal) return;
      profileModal.style.display = "none";
      if (pBody) pBody.innerHTML = "";
    }

    function openProfileModal(stu) {
      if (!profileModal) return;

      const name = stu.fullName || stu.studentName || "Student";
      const img = stu.profileUrl || stu.photoUrl || safeImgUrl(name);

      // ✅ Use class/section from selected assignment if backend doesn't send
      const forcedStd = currentAssignment.standard ?? stu.standard;
      const forcedSec = currentAssignment.section ?? stu.section;

      if (pSub) {
        const subjTxt = currentAssignment.subject ? ` • ${currentAssignment.subject}` : "";
        pSub.textContent =
          `${safeVal(name)} (${safeVal(stu.studentId)}) • ${classLabel(forcedStd)}-${safeVal(forcedSec)}${subjTxt}`;
      }

      if (pBody) {
        pBody.innerHTML = `
          <div class="pTop">
            <img src="${img}" onerror="this.src='${safeImgUrl(name)}'" alt="photo"/>
            <div>
              <div style="font-weight:900;font-size:16px">${safeVal(name)}</div>
              <div class="muted">
                ${safeVal(stu.studentId)} • ${classLabel(forcedStd)}-${safeVal(forcedSec)} • ${safeVal(stu.academicYear)}
              </div>
            </div>
          </div>

          <div class="pGrid">
            <div class="pItem"><div class="pKey">Date of Birth</div><div class="pVal">${stu.dateOfBirth ? fmtDate(stu.dateOfBirth) : "-"}</div></div>
            <div class="pItem"><div class="pKey">Gender</div><div class="pVal">${safeVal(stu.gender)}</div></div>

            <div class="pItem"><div class="pKey">Student Phone</div><div class="pVal">${safeVal(stu.phoneNumber)}</div></div>
            <div class="pItem"><div class="pKey">Parent Phone</div><div class="pVal">${safeVal(stu.parentPhoneNumber)}</div></div>

            <div class="pItem"><div class="pKey">Other Number</div><div class="pVal">${safeVal(stu.otherNumber)}</div></div>
            <div class="pItem"><div class="pKey">Address</div><div class="pVal">${safeVal(stu.address)}</div></div>

            <div class="pItem"><div class="pKey">Father Name</div><div class="pVal">${safeVal(stu.fatherName)}</div></div>
            <div class="pItem"><div class="pKey">Mother Name</div><div class="pVal">${safeVal(stu.motherName)}</div></div>

            <div class="pItem"><div class="pKey">Father Occupation</div><div class="pVal">${safeVal(stu.fatherOccupation)}</div></div>
            <div class="pItem"><div class="pKey">Student Email</div><div class="pVal">${safeVal(stu.studentEmailId)}</div></div>

            <div class="pItem"><div class="pKey">Parent Email</div><div class="pVal">${safeVal(stu.parentEmailId)}</div></div>
            <div class="pItem"><div class="pKey">Caste / Religion</div><div class="pVal">${safeVal(stu.caste)} / ${safeVal(stu.religion)}</div></div>

            <div class="pItem"><div class="pKey">Active</div><div class="pVal">${stu.active ? "✅ Active" : "❌ Inactive"}</div></div>
            <div class="pItem"><div class="pKey">Academic Year</div><div class="pVal">${safeVal(stu.academicYear)}</div></div>
          </div>
        `;
      }

      profileModal.style.display = "grid";
    }

    pClose?.addEventListener("click", closeProfileModal);
    pOk?.addEventListener("click", closeProfileModal);
    profileModal?.addEventListener("click", (e) => {
      if (e.target === profileModal) closeProfileModal();
    });

    // ---------- API: student details ----------
    async function fetchStudentDetails(studentId) {
      try {
        return await fetchJson(`/teacher/dashboard/students/${encodeURIComponent(studentId)}`);
      } catch (e) {
        return fetchJson(`/admin/students/${encodeURIComponent(studentId)}`);
      }
    }

    // ---------- load assignments (WITH SUBJECT like short-notes) ----------
    async function loadAssignmentsIntoDropdown(selectedVal) {
      classSelect.innerHTML = "";
      classSelect.disabled = true;

      let list = null;
      try {
        list = await fetchJson(`/teacher/dashboard/${encodeURIComponent(teacherId)}/assignments`);
      } catch (e1) {
        // optional fallback like notes
        list = await fetchJson(`/teacher/api/dashboard/${encodeURIComponent(teacherId)}/assignments`);
      }

      if (!list || list.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "No classes assigned";
        classSelect.appendChild(opt);
        renderInfo("No classes assigned to you.");
        return;
      }

      (list || []).forEach((a) => {
        const std = a.standard ?? a.std ?? a.classNumber ?? a.class;
        const sec = a.section ?? a.sec;
        const subj = a.subject || a.subjectName || "Subject";

        // ✅ label with subject
        const label = `Class ${classLabel(std)}-${safeVal(sec)} (${subj})`;

        // ✅ store subject in value so we can show in modal too
        const opt = document.createElement("option");
        opt.value = `${std}|${sec}|${subj}`;
        opt.textContent = label;
        classSelect.appendChild(opt);
      });

      if (selectedVal) classSelect.value = selectedVal;

      classSelect.disabled = false;
    }

    // ---------- load students ----------
    async function loadStudentsForSelectedClass() {
      clearErr();
      showLoading(true);

      studentsList.innerHTML = "";

      const selected = readSelectedAssignment();
      const standard = selected.standard;
      const section = selected.section;

      currentAssignment = {
        standard,
        section,
        subject: selected.subject || ""
      };

      if (!standard || !section) {
        showLoading(false);
        renderInfo("Select a class to view students.");
        return;
      }

      try {
        const students = await fetchJson(
          `/teacher/dashboard/students?standard=${encodeURIComponent(standard)}&section=${encodeURIComponent(section)}`
        );

        showLoading(false);

        allStudents = Array.isArray(students) ? students : [];

        // ✅ ensure each student has standard/section in case backend doesn't send
        allStudents = allStudents.map(s => ({
          ...s,
          standard: s.standard ?? Number(standard),
          section: s.section ?? section
        }));

        if (q) q.value = "";
        renderStudents(allStudents);
      } catch (ex) {
        showLoading(false);
        allStudents = [];
        showErr(ex.message || "Failed to load students");
        renderStudents([]);
      }
    }

    // ---------- events ----------
    classSelect.addEventListener("change", loadStudentsForSelectedClass);
    q?.addEventListener("input", applySearch);

    btnClear?.addEventListener("click", () => {
      if (q) q.value = "";
      applySearch();
    });

    btnReload?.addEventListener("click", loadStudentsForSelectedClass);

    studentsList.addEventListener("click", async (e) => {
      const card = e.target.closest(".studentCard");
      if (!card) return;

      const sid = card.dataset.sid;
      if (!sid || sid === "-") return;

      try {
        clearErr();
        const stu = await fetchStudentDetails(sid);
        openProfileModal(stu);
      } catch (ex) {
        showErr(ex.message || String(ex));
      }
    });

    studentsList.addEventListener("keydown", async (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".studentCard");
      if (!card) return;
      e.preventDefault();

      const sid = card.dataset.sid;
      try {
        clearErr();
        const stu = await fetchStudentDetails(sid);
        openProfileModal(stu);
      } catch (ex) {
        showErr(ex.message || String(ex));
      }
    });

    // ---------- init ----------
    try {
      renderInfo("Select a class to view students.");
      const selectedFromClasses = opts?.selectedClass; // optional
      await loadAssignmentsIntoDropdown(selectedFromClasses);
      await loadStudentsForSelectedClass();
    } catch (ex) {
      showLoading(false);
      showErr(ex.message || String(ex));
    }
  },
};