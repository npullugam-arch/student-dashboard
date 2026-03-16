console.log("✅ student-courses.js loaded");

// Session data (same pattern you used)
const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

// Helper: safely escape html (avoid breaking UI if backend sends special chars)
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// Optional: make avatar seed stable per course/teacher
function makeAvatarUrl(seedText) {
  const seed = encodeURIComponent(seedText || "Teacher");
  // Same vibe as your first UI (dicebear)
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

// Create ONE fancy card (assigned / not assigned)
function createTeacherCard(course, index) {
  const div = document.createElement("div");

  const delay = index * 0.15;
  div.className = `teacher-card card-${(index % 4) + 1}`;
  div.style.setProperty("--delay", `${delay}s`);

  const subject = esc(course.subjectName || "Subject");
  const assigned = course.teacherAssigned === true;

  if (!assigned) {
    div.innerHTML = `
      <div class="teacher-top">
        <div class="avatar">
          <img src="${makeAvatarUrl(subject + "-NA")}" alt="Not Assigned" />
        </div>
        <div>
          <div class="teacher-name">Not Assigned Yet 🕒</div>
          <br>
          <button class="subject-btn" type="button">
            <i class="fas fa-book"></i> ${subject}
          </button>
        </div>
      </div>

      <div class="details">
        <div><i class="fas fa-circle-info"></i>Teacher will be updated by Admin</div>
      </div>
    `;
    return div;
  }

  // Assigned
  const teacherName = esc(course.teacherName || "Teacher");
  const teacherId = esc(course.teacherId || "");
  const teacherEmail = esc(course.teacherEmail || "");
  const teacherMobile = esc(course.teacherMobile || "");
  const imgUrl = course.teacherProfileUrl ? esc(course.teacherProfileUrl) : makeAvatarUrl(teacherName);

  div.innerHTML = `
    <div class="teacher-top">
      <div class="avatar">
        <img src="${imgUrl}" alt="Teacher" />
      </div>
      <div>
        <div class="teacher-name">${teacherName}</div>
        <br>
        <button class="subject-btn" type="button">
          <i class="fas fa-book"></i> ${subject}
        </button>
      </div>
    </div>

    <div class="details">
      <div><i class="fas fa-id-card"></i>${teacherId || "—"}</div>
      <div><i class="fas fa-envelope"></i>${teacherEmail || "—"}</div>
      <div><i class="fas fa-phone"></i>${teacherMobile || "—"}</div>
    </div>
  `;

  return div;
}

// Load courses from backend
async function loadCourses() {
  const token = btoa(`${username}:${password}`);
  const grid = document.getElementById("coursesGrid");
  const empty = document.getElementById("emptyMsg");

  grid.innerHTML = "";
  empty.style.display = "none";

  try {
    const res = await fetch(`/student/${studentId}/courses`, {
      headers: { Authorization: `Basic ${token}` }
    });

    if (!res.ok) {
      empty.style.display = "block";
      empty.textContent = "Unable to load courses.";
      return;
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      empty.style.display = "block";
      empty.textContent = "No courses found.";
      return;
    }

    data.forEach((course, i) => grid.appendChild(createTeacherCard(course, i)));

  } catch (err) {
    console.error("❌ courses load error:", err);
    empty.style.display = "block";
    empty.textContent = "Server error while loading courses.";
  }
}

loadCourses();
