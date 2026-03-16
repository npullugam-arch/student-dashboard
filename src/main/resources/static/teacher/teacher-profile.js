window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.profile = {
  async init(ctx) {
    const { teacherId, fetchJson, safe, updateHeader } = ctx;

    const loading = document.getElementById("profileLoading");
    const error = document.getElementById("profileError");
    const grid = document.getElementById("profileGrid");

    const photoImg = document.getElementById("p_photo");
    const photoFallback = document.getElementById("p_photoFallback");

    const statusPill = document.getElementById("p_statusPill");
    const profileLink = document.getElementById("p_profileLink");
    const profileUrlText = document.getElementById("p_profileUrlText");

    // ✅ Password UI refs
    const tpChangeWrap = document.getElementById("tpChangeWrap");
    const tpBtnOpen = document.getElementById("tpBtnOpen");

    const tpBackdrop = document.getElementById("tpBackdrop");
    const tpClose = document.getElementById("tpClose");
    const tpCancel = document.getElementById("tpCancel");
    const tpUpdate = document.getElementById("tpUpdate");

    const tpNew = document.getElementById("tpNew");
    const tpConfirm = document.getElementById("tpConfirm");
    const tpErr = document.getElementById("tpErr");

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    const setStatus = (active) => {
      const isActive = !!active;
      const txt = isActive ? "ACTIVE ✅" : "INACTIVE ❌";

      setTxt("p_status", txt);

      if (statusPill) {
        statusPill.textContent = txt;
        statusPill.classList.remove("active", "inactive");
        statusPill.classList.add(isActive ? "active" : "inactive");
      }
    };

    const setPhoto = (url, fullName) => {
      const u = (url || "").trim();
      const letter = (fullName || "?").trim().charAt(0).toUpperCase() || "?";

      if (photoFallback) photoFallback.textContent = letter;

      // default: fallback
      if (!u) {
        if (photoImg) photoImg.style.display = "none";
        if (photoFallback) photoFallback.style.display = "flex";
        if (profileLink) {
          profileLink.href = "#";
          profileLink.style.pointerEvents = "none";
          profileLink.style.opacity = "0.6";
        }
        return;
      }

      // try loading image
      if (photoImg) {
        photoImg.style.display = "block";
        photoImg.src = u;
        photoImg.onerror = () => {
          photoImg.style.display = "none";
          if (photoFallback) photoFallback.style.display = "flex";
        };
      }

      if (photoFallback) photoFallback.style.display = "none";

      if (profileLink) {
        profileLink.href = u;
        profileLink.style.pointerEvents = "auto";
        profileLink.style.opacity = "1";
      }

      if (profileUrlText) {
        profileUrlText.style.display = "none";
        profileUrlText.textContent = u;
      }
    };

    // =========================
    // ✅ Password helpers (Teacher)
    // =========================
    const tpToast = (msg) => {
      const t = document.createElement("div");
      t.className = "tp-toast";
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2400);
    };

    const tpShowErr = (msg) => {
      if (!tpErr) return;
      tpErr.style.display = "block";
      tpErr.textContent = msg;
    };

    const tpHideErr = () => {
      if (!tpErr) return;
      tpErr.style.display = "none";
      tpErr.textContent = "";
    };

    const tpOpen = () => {
      tpHideErr();
      if (tpNew) tpNew.value = "";
      if (tpConfirm) tpConfirm.value = "";
      if (tpBackdrop) tpBackdrop.style.display = "flex";
      setTimeout(() => tpNew?.focus(), 60);
    };

    const tpCloseModal = () => {
      if (tpBackdrop) tpBackdrop.style.display = "none";
      tpHideErr();
    };

    const hideChangePasswordUI = () => {
      if (tpChangeWrap) tpChangeWrap.style.display = "none";
    };

    const showChangePasswordUI = () => {
      if (tpChangeWrap) tpChangeWrap.style.display = "block";
    };

    // ✅ get Basic auth from localStorage session (teacher-dashboard.js uses this)
    const getTeacherSession = () => {
      try {
        return JSON.parse(localStorage.getItem("smp_session") || "{}");
      } catch {
        return {};
      }
    };

    const fetchWithAuth = async (url, options = {}) => {
      const s = getTeacherSession();
      if (!s.basicToken) throw new Error("Session expired. Please login again.");

      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Basic ${s.basicToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("smp_session");
        throw new Error("Session expired. Please login again.");
      }

      if (!res.ok) {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || err.error || `HTTP ${res.status}`);
        }
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }

      const ct = res.headers.get("content-type") || "";
      return ct.includes("application/json") ? res.json() : res.text();
    };

    const loadPasswordStatus = async () => {
      try {
        // hide first to avoid flicker
        hideChangePasswordUI();
        const data = await fetchWithAuth("/teacher/api/password/status", { method: "GET" });
        if (data && data.canChangePassword) showChangePasswordUI();
        else hideChangePasswordUI();
      } catch (e) {
        // if any error, hide it (safe)
        hideChangePasswordUI();
      }
    };

    const updatePasswordOnce = async () => {
      try {
        tpHideErr();

        const p1 = (tpNew?.value || "").trim();
        const p2 = (tpConfirm?.value || "").trim();

        if (!p1 || !p2) return tpShowErr("Please enter password in both fields.");
        if (p1 !== p2) return tpShowErr("Passwords do not match.");
        if (p1.length < 6) return tpShowErr("Password must be at least 6 characters.");

        tpUpdate.disabled = true;
        tpUpdate.textContent = "Updating...";

        await fetchWithAuth("/teacher/api/password/change-once", {
          method: "POST",
          body: JSON.stringify({ newPassword: p1, confirmPassword: p2 }),
        });

        // ✅ IMPORTANT: update basicToken inside localStorage session (so teacher stays logged in)
        const s = getTeacherSession();
        const u = s.username; // teacherId
        if (u) {
          const newBasicToken = btoa(`${u}:${p1}`);
          s.basicToken = newBasicToken;
          localStorage.setItem("smp_session", JSON.stringify(s));
        }

        tpCloseModal();
        hideChangePasswordUI();
        tpToast("✅ Password updated successfully!");

      } catch (e) {
        tpShowErr(e?.message || "Failed to update password.");
      } finally {
        tpUpdate.disabled = false;
        tpUpdate.textContent = "Update Password";
      }
    };

    // Hook modal events safely
    tpBtnOpen?.addEventListener("click", tpOpen);
    tpClose?.addEventListener("click", tpCloseModal);
    tpCancel?.addEventListener("click", tpCloseModal);
    tpUpdate?.addEventListener("click", updatePasswordOnce);

    tpBackdrop?.addEventListener("click", (e) => {
      if (e.target && e.target.id === "tpBackdrop") tpCloseModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && tpBackdrop && tpBackdrop.style.display === "flex") tpCloseModal();
    });

    // =========================
    // Existing profile load
    // =========================
    loading.style.display = "block";
    error.style.display = "none";
    grid.style.display = "none";

    try {
      const t = await fetchJson(`/teacher/profile/${teacherId}`);

      const fullName = safe(t.fullName);
      setTxt("p_fullName", fullName);
      setTxt("p_teacherId", safe(t.teacherId || teacherId));

      setTxt("p_subject", safe(t.subject));
      setTxt("p_mobile", safe(t.mobileNumber));
      setTxt("p_email", safe(t.emailId));
      setTxt("p_address", safe(t.address));

      setTxt("p_dob", safe(t.dateOfBirth));
      setTxt("p_gender", safe(t.gender));
      setTxt("p_religion", safe(t.religion));
      setTxt("p_aadhaar", safe(t.aadhaarNumber));

      const exp = safe(t.experience);
      setTxt("p_experience", exp ? `Experience: ${exp}` : "Experience: -");
      setTxt("p_experience2", exp);

      setStatus(t.active);

      const photoUrl = t.profileUrl;
      setPhoto(photoUrl, fullName);

      loading.style.display = "none";
      grid.style.display = "grid";

      updateHeader?.();

      // ✅ load password status after profile is visible
      loadPasswordStatus();

    } catch (e) {
      loading.style.display = "none";
      error.style.display = "block";
      error.textContent = e?.message || "Failed to load profile";
    }
  },
};