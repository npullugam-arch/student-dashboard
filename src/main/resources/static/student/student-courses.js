console.log("✅ Courses JS Loaded");

const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

function createCard(item) {
  const div = document.createElement("div");
  div.className = "course-card";

  const imgUrl = item.profileUrl || "https://via.placeholder.com/80";

  div.innerHTML = `
    <p class="subject">${item.subject}</p>
    <div class="teacher">
      <img src="${imgUrl}" alt="Teacher" />
      <div>
        <div class="name">${item.teacherName}</div>
        <div class="meta">${item.teacherId} • ${item.teacherEmail || ""}</div>
      </div>
    </div>
  `;

  return div;
}

async function loadCourses() {
  const token = btoa(`${username}:${password}`);
  const grid = document.getElementById("coursesGrid");
  const empty = document.getElementById("emptyMsg");

  const res = await fetch(`/student/dashboard/${studentId}/faculties`, {
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
    return;
  }

  data.forEach(item => grid.appendChild(createCard(item)));
}

loadCourses();
