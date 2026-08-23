console.log("✅ admin-api.js loaded");

// ============================
// SESSION
// ============================
function getSession() {
  const raw = localStorage.getItem("smp_session");
  return raw ? JSON.parse(raw) : null;
}

// ✅ Normalize token for ALL admin pages (including iframe pages)
(function normalizeStoredSession() {
  try {
    const raw = localStorage.getItem("smp_session");
    if (!raw) return;

    const s = JSON.parse(raw);
    if (!s || !s.basicToken) return;

    let tok = String(s.basicToken).trim();

    // If saved as "Basic xxx", strip "Basic "
    if (/^basic\s+/i.test(tok)) tok = tok.replace(/^basic\s+/i, "").trim();

    // If token looks like "admin:pass" (not base64) -> convert to base64
    const looksBase64 = /^[A-Za-z0-9+/=]+$/.test(tok) && tok.length >= 12;
    if (!looksBase64 && tok.includes(":")) tok = btoa(tok);

    if (tok !== s.basicToken) {
      s.basicToken = tok;
      localStorage.setItem("smp_session", JSON.stringify(s));
      console.log("✅ smp_session normalized");
    }
  } catch (e) {
    console.warn("Session normalize failed:", e);
  }
})();

function redirectToLogin() {
  // ✅ no alert popup (prevents “Session Required” annoy)
  window.location.href = "/login/admin";
}

function requireAdmin() {
  const s = getSession();

  if (!s || !s.username || !s.basicToken) {
    localStorage.removeItem("smp_session");
    redirectToLogin();
    throw new Error("No session");
  }

  if ((s.role || "").toUpperCase() !== "ADMIN") {
    localStorage.removeItem("smp_session");
    redirectToLogin();
    throw new Error("Not admin");
  }

  return s;
}

function authHeaders() {
  const s = requireAdmin();
  return { Authorization: `Basic ${s.basicToken}` };
}

async function handleAuthError(res) {
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("smp_session");
    redirectToLogin();
    throw new Error(`HTTP ${res.status} - Unauthorized`);
  }
}

async function apiGet(url) {
  const res = await fetch(url, { headers: authHeaders() });
  await handleAuthError(res);

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${t || "Request failed"}`);
  }
  return res.json();
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleAuthError(res);

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${t || "Request failed"}`);
  }

  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

async function apiPut(url, body) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  await handleAuthError(res);

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${t || "Request failed"}`);
  }

  const text = await res.text().catch(() => "");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
}

async function apiDelete(url) {
  const res = await fetch(url, { method: "DELETE", headers: authHeaders() });
  await handleAuthError(res);

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${t || "Request failed"}`);
  }
  return true;
}
