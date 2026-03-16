window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.classes = {
  async init(ctx) {
    const { teacherId, fetchJson, go, updateHeader } = ctx;

    const loading = document.getElementById("classesLoading");
    const error = document.getElementById("classesError");
    const grid = document.getElementById("classesGrid");

    function standardLabel(standard) {
      const n = Number(standard);
      if (n === -2) return "Nursery";
      if (n === -1) return "LKG";
      if (n === 0) return "UKG";
      return `Class ${standard}`;
    }

    loading.style.display = "block";
    error.style.display = "none";
    grid.innerHTML = "";

    try {
      const data = await fetchJson(`/teacher/dashboard/${teacherId}/assignments`);

      loading.style.display = "none";

      if (!data || data.length === 0) {
        grid.innerHTML = `<div class="info">No assignments found.</div>`;
        return;
      }

      data.forEach((a) => {
        const card = document.createElement("div");
        card.className = "card";

        const stdText = standardLabel(a.standard);
        const titleText = `${stdText}-${a.section}`;

        card.innerHTML = `
          <div class="big">${titleText}</div>
          <div class="muted">Subject: ${a.subject}</div>
          <span class="chip">Assigned</span>
          <button class="btn">Take Attendance</button>
        `;
        grid.appendChild(card);

        const val = `${a.standard}|${a.section}`;
        card.querySelector(".btn").onclick = async () => {
          await go("attendance", { selectedClass: val });
        };
      });

      updateHeader?.();
    } catch (e) {
      loading.style.display = "none";
      error.style.display = "block";
      error.textContent = e.message || "Failed to load assignments";
    }
  },
};