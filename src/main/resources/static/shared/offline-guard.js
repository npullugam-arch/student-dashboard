// Registers SW + redirects to offline page in real-time

(function () {
  // Save last online URL so offline page can come back
  function rememberUrl() {
    if (navigator.onLine) {
      sessionStorage.setItem("last_online_url", location.pathname + location.search);
    }
  }
  rememberUrl();

  window.addEventListener("online", rememberUrl);
  window.addEventListener("beforeunload", rememberUrl);

  // Real-time redirect when connection drops (nice UX)
  window.addEventListener("offline", () => {
    sessionStorage.setItem("last_online_url", location.pathname + location.search);
    location.href = "/offline.html";
  });

  // Service worker (offline fallback on refresh)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
})();