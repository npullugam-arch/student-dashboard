console.log("✅ teacher-doubts.js loaded (module)");

window.TeacherPages = window.TeacherPages || {};
window.TeacherPages.modules = window.TeacherPages.modules || {};

window.TeacherPages.modules.doubts = {
  async init(ctx) {
    const { teacherId, fetchJson, postJson, go } = ctx;

    // ✅ Wait until HTML is injected
    const waitForRoot = async (tries = 80) => {
      for (let i = 0; i < tries; i++) {
        const root = document.getElementById("tdoubtsRoot");
        if (root) return root;
        await new Promise((r) => setTimeout(r, 25));
      }
      return null;
    };

    const root = await waitForRoot();
    if (!root) {
      console.error("❌ doubts: tdoubtsRoot not found. HTML not injected.");
      return;
    }

    // ✅ Query INSIDE root
    const $ = (id) => root.querySelector(`#${id}`);

    const statusFilter = $("statusFilter");
    const btnRefresh = $("btnRefresh");
    const listEl = $("list");

    const emptyEl = $("empty");
    const threadEl = $("thread");
    const tTitle = $("tTitle");
    const tMeta = $("tMeta");
    const msgsEl = $("msgs");

    const replyForm = $("replyForm");
    const replyText = $("replyText");
    const errEl = $("err");

    const btnMarkAnswered = $("btnMarkAnswered");
    const btnMarkClosed = $("btnMarkClosed");

    const teacherPill = $("teacherPill");
    const btnBack = $("btnBack");
    const btnLogout = $("btnLogout");

    if (!listEl || !msgsEl || !replyForm || !replyText || !errEl) {
      console.error("❌ doubts: Missing elements inside root. Check ids.");
      return;
    }

    // ===== UI helpers =====
    function show(el) {
      if (el) el.classList.remove("hidden");
    }
    function hide(el) {
      if (el) el.classList.add("hidden");
    }
    function setErr(msg) {
      if (!errEl) return;
      if (!msg) {
        hide(errEl);
        errEl.textContent = "";
      } else {
        errEl.textContent = msg;
        show(errEl);
      }
    }
    function safe(v) {
      return v == null ? "" : String(v);
    }
    function fmtTime(t) {
      if (!t) return "";
      return String(t).replace("T", " ").slice(0, 16);
    }

    function badge(status) {
      if (status === "OPEN") return `<span class="td-badge open">PENDING</span>`;
      if (status === "ANSWERED") return `<span class="td-badge answered">ANSWERED</span>`;
      return `<span class="td-badge closed">CLOSED</span>`;
    }

    // ===== state =====
    let current = null; // {id}

    function renderList(list) {
      listEl.innerHTML = "";
      if (!list || !list.length) {
        listEl.innerHTML = `<div class="td-muted">No doubts found.</div>`;
        return;
      }

      list.forEach((d) => {
        const el = document.createElement("div");
        el.className = "td-item";
        el.innerHTML = `
          <div>
            <div class="td-ititle">${safe(d.title)}</div>
            <div class="td-imeta">
              ${badge(d.status)}
              • Student: <b>${safe(d.studentId)}</b>
              • Class ${safe(d.standard)}-${safe(d.section)}
              • Viewed: <b>${d.teacherViewed ? "YES ✅" : "NO ⏳"}</b>
              • Last: ${safe(fmtTime(d.lastMessageAt))}
            </div>
          </div>
          <button class="td-btn" type="button">Open</button>
        `;
        el.querySelector("button").onclick = () => openThread(d.id);
        listEl.appendChild(el);
      });
    }

    function renderMsgs(msgs) {
      msgsEl.innerHTML = "";
      if (!msgs || !msgs.length) {
        msgsEl.innerHTML = `<div class="td-muted">No messages yet.</div>`;
        return;
      }
      msgs.forEach((m) => {
        const div = document.createElement("div");
        div.className = "td-msg " + (m.senderRole === "TEACHER" ? "me" : "");
        div.innerHTML = `
          <div class="who">${m.senderRole === "TEACHER" ? "You" : "Student"} • ${safe(m.senderId)}</div>
          <div>${safe(m.message)}</div>
          <div class="time">${fmtTime(m.createdAt)}</div>
        `;
        msgsEl.appendChild(div);
      });
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    // ===== endpoints: keep EXACT backend contract, just use ctx.fetchJson/postJson =====
    async function loadList() {
      listEl.innerHTML = `<div class="td-muted">Loading...</div>`;
      setErr("");

      try {
        const status = statusFilter?.value || "";

        const url = status
          ? `/teacher/api/doubts/my/${encodeURIComponent(teacherId)}?status=${encodeURIComponent(status)}`
          : `/teacher/api/doubts/my/${encodeURIComponent(teacherId)}`;

        const data = await fetchJson(url);
        const list = Array.isArray(data) ? data : data?.items || [];
        renderList(list);
      } catch (err) {
        listEl.innerHTML = `<div class="td-error">Failed to load doubts.\n${safe(
          err.message || err
        )}</div>`;
      }
    }

    async function openThread(id) {
      setErr("");
      if (emptyEl) hide(emptyEl);
      if (threadEl) show(threadEl);
      msgsEl.innerHTML = `<div class="td-muted">Loading...</div>`;

      try {
        const data = await fetchJson(
          `/teacher/api/doubts/${encodeURIComponent(id)}/teacher/${encodeURIComponent(teacherId)}`
        );

        current = { id };

        if (tTitle) tTitle.textContent = data.title || "Doubt";
        if (tMeta) {
          tMeta.textContent = `Status: ${data.status} • Student: ${data.studentId} • Viewed: ${
            data.teacherViewed ? "YES" : "NO"
          } • Last: ${fmtTime(data.lastMessageAt)}`;
        }

        renderMsgs(data.messages || []);
        await loadList();
      } catch (err) {
        setErr(err.message || String(err));
      }
    }

    async function sendReply(message) {
      return postJson(
        `/teacher/api/doubts/${encodeURIComponent(current.id)}/teacher/${encodeURIComponent(
          teacherId
        )}/messages`,
        { message }
      );
    }

    async function setStatusForCurrent(status) {
      // Some backends use PUT without body; your fetchJson only does GET.
      // So we use fetch directly with ctx headers? But we must NOT disturb backend.
      // Easiest: use fetch with Basic token is inside fetchJson only.
      // Therefore: call fetch directly using ctx.fetchJson? Not possible for PUT.
      // ✅ Use plain fetch with ctx session already in browser? We don't have token here.
      // So: use the same endpoint you already had before? It used apiFetch with PUT.
      // ✅ Best: keep it POST via postJson if your backend supports? Not sure.

      // If your backend already supports PUT and needs Authorization header,
      // the clean way is to add ctx.rawFetch in dashboard. You don't have it.
      // So we use fetch with same headers by reading session from localStorage
      // (this does NOT touch backend, just auth header same as dashboard).
      const s = JSON.parse(localStorage.getItem("smp_session") || "{}");
      const tok = s.basicToken || "";
      const token = /^basic\s+/i.test(tok) ? tok.replace(/^basic\s+/i, "").trim() : tok;

      const res = await fetch(
        `/teacher/api/doubts/${encodeURIComponent(current.id)}/teacher/${encodeURIComponent(
          teacherId
        )}/status?status=${encodeURIComponent(status)}`,
        {
          method: "PUT",
          headers: { Authorization: `Basic ${token}` },
        }
      );

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
    }

    // ===== header buttons =====
    if (teacherPill) teacherPill.textContent = teacherId;

    // ✅ back should go to doubts list page inside dashboard if you want
    if (btnBack) btnBack.onclick = () => go("dashboard");

    if (btnLogout) {
      btnLogout.onclick = () => {
        localStorage.removeItem("smp_session");
        window.location.href = "/login/login.html";
      };
    }

    // ===== bind (overwrite to avoid duplicates on re-open) =====
    if (btnRefresh) btnRefresh.onclick = loadList;
    if (statusFilter) statusFilter.onchange = loadList;

    replyForm.onsubmit = async (e) => {
      e.preventDefault();
      setErr("");

      try {
        if (!current?.id) throw new Error("Select a doubt first");
        const msg = replyText.value.trim();
        if (!msg) return;

        await sendReply(msg);

        replyText.value = "";
        await openThread(current.id);
      } catch (err) {
        setErr(err.message || String(err));
      }
    };

    if (btnMarkAnswered) {
      btnMarkAnswered.onclick = async () => {
        setErr("");
        try {
          if (!current?.id) throw new Error("Select a doubt first");
          await setStatusForCurrent("ANSWERED");
          await openThread(current.id);
        } catch (err) {
          setErr(err.message || String(err));
        }
      };
    }

    if (btnMarkClosed) {
      btnMarkClosed.onclick = async () => {
        setErr("");
        try {
          if (!current?.id) throw new Error("Select a doubt first");
          await setStatusForCurrent("CLOSED");
          await openThread(current.id);
        } catch (err) {
          setErr(err.message || String(err));
        }
      };
    }

    // ===== init =====
    hide(threadEl);
    show(emptyEl);
    await loadList();
  },
};
