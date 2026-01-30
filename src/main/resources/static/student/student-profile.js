console.log("✅ Student Profile JS Loaded");

const studentId = sessionStorage.getItem("studentId");
const username = sessionStorage.getItem("auth_username");
const password = sessionStorage.getItem("auth_password");

if (!studentId || !username || !password) {
  alert("Session expired. Please login again.");
  window.location.href = "/login/login.html";
}

async function loadProfile() {
  const token = btoa(`${username}:${password}`);

  const res = await fetch(`/student/profile/${studentId}`, {
    headers: {
      Authorization: `Basic ${token}`
    }
  });

  if (!res.ok) {
    alert("Unable to load profile");
    return;
  }

  const data = await res.json();

  document.getElementById("studentName").textContent = data.fullName;
  document.getElementById("studentClass").textContent =
    `Class ${data.standard} - ${data.section}`;

  document.getElementById("studentId").textContent = data.studentId;
  document.getElementById("dob").textContent = data.dateOfBirth;
  document.getElementById("gender").textContent = data.gender;
  document.getElementById("caste").textContent = data.caste;
  document.getElementById("religion").textContent = data.religion;

  document.getElementById("standard").textContent = data.standard;
  document.getElementById("section").textContent = data.section;
  document.getElementById("academicYear").textContent = data.academicYear;

  document.getElementById("phone").textContent = data.phoneNumber;
  document.getElementById("parentPhone").textContent = data.parentPhoneNumber;
  document.getElementById("studentEmail").textContent = data.studentEmailId;
  document.getElementById("parentEmail").textContent = data.parentEmailId;

  if (data.profileUrl) {
    document.getElementById("profilePic").src = data.profileUrl;
  }
}

loadProfile();
