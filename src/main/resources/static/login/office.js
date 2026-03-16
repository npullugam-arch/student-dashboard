console.log("✅ login/office.js loaded");

const form = document.getElementById("loginForm");
const err = document.getElementById("err");

function showErr(msg){
  err.style.display = "block";
  err.textContent = msg;
}
function hideErr(){
  err.style.display = "none";
  err.textContent = "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideErr();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if(!username || !password) return showErr("Username & Password required");

  // Save session like your teacher/admin style
  const basicToken = btoa(`${username}:${password}`);

  // 🔥 quick auth check (call a protected office api)
  try{
    const res = await fetch("/office/api/fees/overview", {
      headers: { Authorization: `Basic ${basicToken}` }
    });

    if(res.status === 401 || res.status === 403){
      return showErr("Invalid Office credentials");
    }
    if(!res.ok){
      const t = await res.text().catch(()=> "");
      return showErr(t || `Login failed (HTTP ${res.status})`);
    }

    localStorage.setItem("smp_session", JSON.stringify({
      username,
      role: "OFFICE",
      basicToken
    }));

    window.location.href = "/office/office-dashboard.html";
  }catch(ex){
    showErr(ex.message || String(ex));
  }
});
