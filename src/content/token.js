(function () {
  const APP_VERSION = "1.2.0";
  console.log("Mentari Assistant Token script loaded.");

  const FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
  ];

  const Config = {
    STORAGE_KEYS: {
      AUTH_TOKEN: "mentari_auth_token",
      USER_INFO: "mentari_user_info",
      COURSE_DATA: "mentari_course_data",
      LAST_UPDATE: "mentari_last_update",
      LECTURER_NOTIFS: "mentari_lecturer_notifs",
      GEMINI_ENABLED: "gemini_enabled",
      AUTO_FINISH_QUIZ: "mentari_auto_finish_quiz",
      GEMINI_MODEL: "gemini_model",
      GEMINI_QUOTA: "gemini_quota",
      GEMINI_API_KEY: "geminiApiKey",
      GEMINI_MODEL_STATS: "gemini_model_stats",
      THEME_MODE: "mentari_panel_theme",
    },
    API: {
      BASE_URL: "https://mentari.unpam.ac.id/api",
      GITHUB_API:
        "https://api.github.com/repos/EdgePrompt/mentari-assistant/releases/latest",
    },
  };

  const State = {
    authToken: null,
    userInfo: null,
    courseDataList: [],
    lecturerNotifications: [],
    isFetching: false,
    currentTab: "forum-tab",
    isGuideOpen: false,
    forumSearch: "",
    forumTypeFilter: "all",
    mhsCourseFilter: "all",
    mhsSearch: "",
  };

  const ico = (name, size = 16, extraClass = "") =>
    window.MentariPanelUI?.icon?.(name, size, extraClass) || "";

  const cleanCourseTitle = (rawName) => {
    const cleaned = String(rawName || "")
      .split("#")[0]
      .replace(/^\[\d+\]\s*/, "")
      .replace(/\([^)]+\)/g, "")
      .replace(/\[[^\]]+\]/g, "")
      .trim();
    return cleaned || String(rawName || "");
  };

  const getEventActionTarget = (event, selector = "[data-action]") => {
    const raw = event?.target;
    const el = raw?.nodeType === 1 ? raw : raw?.parentElement;
    return el?.closest?.(selector) || null;
  };

  const getEventElement = (event) => {
    const raw = event?.target;
    return raw?.nodeType === 1 ? raw : raw?.parentElement || null;
  };

  const Utils = {
    save(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
    },
    get(key) {
      try {
        const d = localStorage.getItem(key);
        return d ? JSON.parse(d) : null;
      } catch (e) {
        return null;
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
    escapeHtml(str) {
      return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    },
    safeUrl(url) {
      const val = String(url || "").trim();
      if (!val || val === "#") return "#";
      if (/^(https?:\/\/|\/(?!\/))/i.test(val)) return val;
      return "#";
    },
    extractJwt(raw) {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.token && this.decodeToken(item.token))
              return item.token;
          }
        }
        if (typeof parsed === "object" && parsed !== null) {
          const val = parsed.token || parsed.access || parsed.jwt;
          if (val && this.decodeToken(val)) return val;
        }
        if (typeof parsed === "string") {
          const cleaned = parsed.replace(/^Bearer\s+/i, "");
          if (this.decodeToken(cleaned)) return cleaned;
        }
      } catch (_) {
        const cleaned = raw.replace(/^"|"$/g, "").replace(/^Bearer\s+/i, "");
        if (this.decodeToken(cleaned)) return cleaned;
      }
      return null;
    },
    findTokenFromStorage() {
      try {
        for (const key of ["access", "token"]) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const jwt = this.extractJwt(raw);
            if (jwt) return jwt;
          }
        }
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || k.startsWith("mentari_")) continue;
          const v = localStorage.getItem(k);
          if (
            v &&
            (k.toLowerCase().includes("token") ||
              k.toLowerCase().includes("access") ||
              v.includes("eyJ"))
          ) {
            const jwt = this.extractJwt(v);
            if (jwt) return jwt;
          }
        }
      } catch (e) {}
      return null;
    },
    decodeToken(token) {
      try {
        if (!token) return null;
        const parts = token.split(".");
        if (parts.length < 2) return null;
        const payload = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        return {
          token,
          payload,
          userId: payload.id || payload.username,
          username: payload.username || payload.name,
          fullname: payload.fullname || payload.name,
          role: payload.role || "Student",
        };
      } catch (e) {
        return null;
      }
    },
    copy(text, msg) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => this.toast(msg))
          .catch(() => {});
      }
    },
    toast(msg) {
      window.MentariPanelUI?.toast(msg, "info");
    },
    progressToast(msg) {
      window.MentariPanelUI?.progressToast(msg);
    },
    closeProgressToast() {
      window.MentariPanelUI?.closeProgressToast();
    },
    successToast(msg) {
      window.MentariPanelUI?.toast(msg, "success");
    },
    getThemeMode() {
      try {
        const raw = localStorage.getItem(Config.STORAGE_KEYS.THEME_MODE);
        const cleaned = raw ? raw.replace(/^["']+|["']+$/g, "").trim() : "auto";
        return cleaned === "dark" || cleaned === "light" ? cleaned : "auto";
      } catch (e) {
        return "auto";
      }
    },
    applyTheme() {
      const host = document.getElementById("token-runner-popup");
      if (!host) return;
      const mode = this.getThemeMode();
      window.MentariPanelUI?.applyTheme(host, mode);
    },
    updateQuota(headers) {
      try {
        const quota = {
          rpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-requests")),
            limit: parseInt(headers.get("x-ratelimit-limit-requests")),
          },
          tpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-tokens")),
            limit: parseInt(headers.get("x-ratelimit-limit-tokens")),
          },
          updated: Date.now(),
        };
        if (!isNaN(quota.rpm.limit)) {
          this.save(Config.STORAGE_KEYS.GEMINI_QUOTA, quota);
          window.dispatchEvent(
            new CustomEvent("gemini-quota-updated", { detail: quota }),
          );
        }
      } catch (e) {}
    },
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num;
    },
  };

  const ApiService = {
    async fetch(url, options = {}) {
      if (!State.authToken) throw new Error("No token");
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${State.authToken}`,
        "Content-Type": "application/json",
      };
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
          const errorBody = await res.json();
          message = errorBody.message || errorBody.error || message;
        } catch (error) {}
        throw new Error(`${res.status}: ${message}`);
      }
      return res.json();
    },
    async fetchCourses() {
      return this.fetch(`${Config.API.BASE_URL}/user-course?page=1&limit=50`);
    },
    async fetchCourseDetails(code) {
      return this.fetch(`${Config.API.BASE_URL}/user-course/${code}`);
    },
    getGeminiApiKey() {
      const rawKey = localStorage.getItem(Config.STORAGE_KEYS.GEMINI_API_KEY);
      if (!rawKey) throw new Error("API Key Gemini belum diset");
      try {
        return atob(rawKey);
      } catch (error) {
        return rawKey;
      }
    },
    async fetchQuizParticipant(quizId) {
      return this.fetch(`${Config.API.BASE_URL}/quiz/peserta/${quizId}`, {
        method: "GET",
        cache: "no-store",
      });
    },
    async fetchForumTopics(id) {
      return this.fetch(`${Config.API.BASE_URL}/forum/topic/${id}`);
    },
    async fetchForumReplies(id) {
      return this.fetch(`${Config.API.BASE_URL}/forum/reply/${id}`);
    },
    async submitForumReply(payload) {
      return this.fetch(`${Config.API.BASE_URL}/forum/reply`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async fetchKuesioner(courseCode, sectionCode) {
      return this.fetch(
        `${Config.API.BASE_URL}/kuesioner/${courseCode}/${sectionCode}`,
      );
    },
    async submitKuesioner(courseCode, sectionCode, questions) {
      return this.fetch(`${Config.API.BASE_URL}/kuesioner/submit`, {
        method: "POST",
        body: JSON.stringify({
          kode_section: sectionCode,
          kode_course: courseCode,
          kuesioner: questions.map((question) => ({
            id_kuesioner: question.id,
            jawaban: 1,
          })),
        }),
      });
    },
    async checkUpdate() {
      try {
        const r = await fetch(Config.API.GITHUB_API);
        return r.ok ? await r.json() : null;
      } catch (e) {
        return null;
      }
    },
    async fetchGeminiModels(apiKey) {
      try {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        if (!r.ok) return null;
        return r.json();
      } catch (e) {
        return null;
      }
    },
  };

  const UIRenderer = {
    getHost() {
      return document.getElementById("token-runner-popup");
    },
    getRoot() {
      return this.getHost()?.shadowRoot || null;
    },
    byId(id) {
      return this.getRoot()?.getElementById(id) || null;
    },
    qs(sel) {
      return this.getRoot()?.querySelector(sel) || null;
    },
    qsa(sel) {
      return this.getRoot()?.querySelectorAll(sel) || [];
    },
    injectStyles() {
      this.createPopup();
    },
    renderGuideView() {
      const guideView = this.byId("panel-guide-view");
      if (
        guideView &&
        !guideView.dataset.rendered &&
        typeof window.MentariGuide?.render === "function"
      ) {
        window.MentariGuide.render(guideView, {
          version: APP_VERSION,
          onBack: () => this.setGuideOpen(false),
        });
        guideView.dataset.rendered = "true";
      }
    },
    setGuideOpen(open) {
      State.isGuideOpen = Boolean(open);
      const host = this.getHost();
      window.MentariPanelUI?.setGuideOpen(host, State.isGuideOpen);
      if (State.isGuideOpen) {
        this.renderGuideView();
      }
    },
    createPopup() {
      if (this.getHost()?.shadowRoot) return;
      if (!window.MentariPanelUI) return;

      window.MentariPanelUI.createHost({
        appVersion: APP_VERSION,
        onRefresh: () => App.refreshData(true),
        onClose: () => window.toggleTokenPopup?.(),
        onToggleGuide: () => this.setGuideOpen(!State.isGuideOpen),
        onTabChange: (tabId) => {
          State.isGuideOpen = false;
          State.currentTab = tabId;
          if (tabId === "notif-tab") {
            App.syncLecturerNotifications(State.courseDataList);
          }
        },
      });
      Utils.applyTheme();
      this.renderGuideView();
    },
    setLoading(active) {
      window.MentariPanelUI?.setLoading(this.getHost(), active);
    },
    updatePosition() {},
  };

  const ForumRenderer = {
    render(data) {
      const el = UIRenderer.byId("forum-tab-tab");
      if (!el) return;

      const list = Array.isArray(data) ? data : [];
      let coursesHtml = "";

      if (list.length) {
        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        const getDay = (name) => {
          const m = String(name || "").match(/\(([^)]+)\)/);
          const idx = m ? days.indexOf(m[1]) : -1;
          return idx === -1 ? 7 : idx;
        };
        const sortedData = [...list].sort(
          (a, b) =>
            getDay(a.coursename || a.nama_mata_kuliah) -
            getDay(b.coursename || b.nama_mata_kuliah),
        );
        coursesHtml = sortedData.map((course) => this.renderCourse(course)).join("");
      }

      const hasCourses = Boolean(coursesHtml.trim());

      let html = `
        <div class="summary-bar">
          <div class="summary-status">
            ${ico("tasks", 15)}
            <span id="forum-summary-text">${list.length ? "Memuat status..." : "Belum ada data mata kuliah"}</span>
          </div>
          <a href="https://my.unpam.ac.id/presensi/" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-success">
            ${ico("presensi", 13)}<span>Presensi</span>${ico("external", 12)}
          </a>
        </div>
      `;

      if (!list.length) {
        html += `
          <div class="empty-state">
            <div class="empty-icon">${ico("refresh", 28)}</div>
            <div class="empty-title">Data Kosong</div>
            <div class="empty-desc">Pilih mata kuliah di Mentari agar data forum muncul di sini.</div>
          </div>
        `;
      } else if (!hasCourses) {
        html += `
          <div class="empty-state">
            <div class="empty-icon" style="color:var(--success-text);background:var(--success-soft);">${ico("check", 28)}</div>
            <div class="empty-title">Semua Beres!</div>
            <div class="empty-desc">Tidak ada forum diskusi atau kuis yang menunggu dikerjakan saat ini.</div>
          </div>
        `;
      } else {
        const filters = [
          { key: "all", label: "Semua" },
          { key: "forum", label: "Forum" },
          { key: "quiz", label: "Kuis" },
          { key: "kuesioner", label: "Kuesioner" },
        ];
        html += `
          <div class="toolbar-stack">
            <div class="search-box">
              <span class="search-ico">${ico("search", 14)}</span>
              <input type="text" id="forum-search-input" class="search-input" placeholder="Cari matkul atau pertemuan..." value="${Utils.escapeHtml(State.forumSearch)}" autocomplete="off" />
              <button type="button" id="forum-search-clear" class="search-clear${State.forumSearch ? " visible" : ""}" data-action="clear-forum-search" aria-label="Hapus pencarian" title="Hapus pencarian">${ico("close", 13)}</button>
            </div>
            <div class="filter-chips" role="group" aria-label="Filter tipe tugas">
              ${filters
                .map((f) => {
                  const active = State.forumTypeFilter === f.key;
                  return `<button type="button" class="chip-btn${active ? " active" : ""}" data-action="filter-forum-type" data-filter="${f.key}" aria-pressed="${active ? "true" : "false"}">${f.label}</button>`;
                })
                .join("")}
            </div>
          </div>
          ${coursesHtml}
          <div id="forum-empty-filter" class="empty-state" hidden>
            <div class="empty-icon">${ico("search", 26)}</div>
            <div class="empty-title">Tidak Ada Hasil Cocok</div>
            <div class="empty-desc">Coba ubah kata kunci pencarian atau pilih filter lain.</div>
          </div>
        `;
      }

      el.innerHTML = html;
      this.initInteractions(list);
      this.updateForumBadge();
      if (hasCourses) {
        this.applyFilters();
      }
    },

    updateForumBadge() {
      const badge = UIRenderer.byId("forum-tab-badge");
      const forum = UIRenderer.byId("forum-tab-tab");
      const summaryText = UIRenderer.byId("forum-summary-text");
      if (!forum) return;

      const incompleteMeetings = Array.from(
        forum.querySelectorAll(".section-card"),
      ).filter((section) => section.querySelector(".status-todo"));

      const count = incompleteMeetings.length;
      if (badge) {
        badge.textContent = count ? String(count) : "";
        badge.style.display = count ? "inline-flex" : "none";
      }
      if (summaryText) {
        summaryText.textContent = !State.courseDataList.length
          ? "Belum ada data mata kuliah"
          : count > 0
            ? `${count} pertemuan menunggu`
            : "Semua tugas beres";
      }
    },

    renderCourse(c) {
      const allSections = c.data || [];
      let lastCompletedSort = 0;
      let maxSort = 0;

      allSections.forEach((s, idx) => {
        const sortVal = typeof s.sort === "number" ? s.sort : idx + 1;
        if (sortVal > maxSort) maxSort = sortVal;

        const hasCompletedKuisioner = (s.sub_section || []).some(
          (i) =>
            (i.kode_template === "KUESIONER" || i.tipe === "QUESIONER") &&
            i.completion === true,
        );
        if (hasCompletedKuisioner && sortVal > lastCompletedSort) {
          lastCompletedSort = sortVal;
        }
      });

      const totalSorts = maxSort || allSections.length || 0;
      const progressPercent =
        totalSorts > 0 ? Math.round((lastCompletedSort / totalSorts) * 100) : 0;

      const sections = allSections.filter((s) => {
        if (!s.sub_section) return false;
        const forum = s.sub_section.find(
          (i) => i.kode_template === "FORUM_DISKUSI" && i.id,
        );
        const kuesioner = s.sub_section.find(
          (i) => i.kode_template === "KUESIONER" || i.tipe === "QUESIONER",
        );
        if (!forum && !kuesioner) return false;
        if (kuesioner?.completion === true) return false;
        if (forum?.warningAlert?.includes("Soal forum diskusi belum tersedia"))
          return false;
        const postTest = s.sub_section.find(
          (i) => i.kode_template === "POST_TEST",
        );
        if (
          forum &&
          forum.completion === true &&
          !kuesioner &&
          (!postTest || postTest.completion === true || !postTest.id)
        )
          return false;
        return true;
      });

      const rawName = c.coursename || c.nama_mata_kuliah || c.kode_course || "";
      const sksMatch = rawName.match(/^\[(\d+)\]/);
      const sks = sksMatch ? sksMatch[1] : null;

      const hariMatch = rawName.match(/\(([^)]+)\)/);
      const hari = hariMatch ? hariMatch[1] : null;

      const kelasMatch = rawName.match(/#\s*([^\s(]+)/);
      const kelas = kelasMatch ? kelasMatch[1] : null;

      const courseTitle = cleanCourseTitle(rawName);

      const validSectionsHtml = sections
        .map((s, idx) => this.renderSection(s, c, idx))
        .filter((html) => html && html.trim() !== "")
        .join("");

      if (!validSectionsHtml.trim()) return "";

      const courseSearch = [
        courseTitle,
        c.coursename,
        c.nama_mata_kuliah,
        c.kode_course,
        kelas,
        hari,
      ]
        .filter(Boolean)
        .join(" ");

      return `
        <div class="course-card" data-search="${Utils.escapeHtml(courseSearch)}">
          <div class="course-card-header">
            <div class="course-header-top">
              <div style="flex:1; min-width:0;">
                <h2 class="course-title">${Utils.escapeHtml(courseTitle)}</h2>
                <div class="course-meta-chips">
                  ${sks ? `<span class="course-chip course-chip-sks">${ico("book", 11)} ${Utils.escapeHtml(sks)} SKS</span>` : ""}
                  ${hari ? `<span class="course-chip course-chip-day">${ico("presensi", 11)} ${Utils.escapeHtml(hari)}</span>` : ""}
                  ${kelas ? `<span class="course-chip course-chip-class">${ico("groups", 11)} Kelas ${Utils.escapeHtml(kelas)}</span>` : ""}
                </div>
                <span class="course-code">Kode Course: ${Utils.escapeHtml(c.kode_course)}</span>
              </div>
              <div class="course-progress-box">
                <span class="course-progress-value">${progressPercent}%</span>
                <span class="course-progress-label">Pertemuan ${lastCompletedSort} / ${totalSorts}</span>
              </div>
            </div>
            <div class="course-progress-track">
              <div class="course-progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
          </div>
          <div class="course-card-body">
            ${validSectionsHtml}
          </div>
        </div>
      `;
    },

    renderSection(s, c, idx) {
      const itemsHtml = (s.sub_section || [])
        .map((item) => this.renderItem(item, s, c))
        .filter((html) => html && html.trim() !== "")
        .join("");

      if (!itemsHtml.trim()) return "";

      const sectionId = `sect-${c.kode_course}-${idx}`;
      const sectionUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}?accord_pertemuan=${s.kode_section}`;
      const sectionSearch = [s.nama_section, s.kode_section]
        .filter(Boolean)
        .join(" ");

      return `
        <div class="section-card" data-search="${Utils.escapeHtml(sectionSearch)}">
          <button type="button" class="section-header" data-action="toggle-section" data-target="${Utils.escapeHtml(sectionId)}" aria-expanded="false">
            <div class="section-header-left">
              <span class="section-header-icon">${ico("book", 13)}</span>
              <span class="section-header-title">${Utils.escapeHtml(s.nama_section)}</span>
            </div>
            <span class="section-toggle">${ico("chevronDown", 14)}</span>
          </button>
          <div class="section-content" id="${Utils.escapeHtml(sectionId)}">
            <a href="${Utils.escapeHtml(sectionUrl)}" class="item-row">
              <div class="item-main">
                <div class="item-icon icon-forum">${ico("folder", 14)}</div>
                <div class="item-info">
                  <div class="item-title" style="color:var(--accent);">Buka Pertemuan</div>
                  <div class="item-meta"><span>Buka langsung di Mentari UNPAM</span></div>
                </div>
                <div class="item-actions" style="color:var(--accent);">${ico("chevronRight", 14)}</div>
              </div>
            </a>
            ${itemsHtml}
          </div>
        </div>
      `;
    },

    renderItem(i, s, c) {
      const isQuiz = ["PRE_TEST", "POST_TEST"].includes(i.kode_template);
      const isForum = i.kode_template === "FORUM_DISKUSI";
      const isMaterial = [
        "BUKU_ISBN",
        "VIDEO_AJAR",
        "POWER_POINT",
        "ARTIKEL_RISET",
        "MATERI_LAINNYA",
      ].includes(i.kode_template);
      const isKuesioner =
        i.kode_template === "KUESIONER" || i.tipe === "QUESIONER";
      const isTugas = i.kode_template === "PENUGASAN_TERSTRUKTUR";

      if (isMaterial && !i.link && !i.file) return "";
      if (isTugas && !i.link && !i.file) return "";
      if (!isQuiz && !isForum && !isMaterial && !isKuesioner && !isTugas)
        return "";

      let cardUrl = "#";
      let actionUrl = "#";
      let iconClass = "icon-material";
      let iconName = "doc";
      let actionLabel = "Buka";
      let actionIcon = "external";

      if (isQuiz) {
        cardUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/quiz/${i.id}`
          : "#";
        actionUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/exam/${i.id}`
          : "#";
        iconClass = "icon-quiz";
        iconName = "quiz";
        actionLabel = "Mulai Quiz";
        actionIcon = "play";
      } else if (isForum) {
        cardUrl = i.id
          ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/forum/${i.id}`
          : "#";
        actionUrl = cardUrl;
        iconClass = "icon-forum";
        iconName = "forum";
        actionLabel = "Buka Forum";
        actionIcon = "external";
      } else if (isMaterial) {
        cardUrl = `https://mentari.unpam.ac.id/u-courses/${c.kode_course}`;
        if (i.link) {
          actionUrl = Utils.safeUrl(i.link);
          actionLabel = "Buka Link";
          actionIcon = "external";
        } else if (i.file) {
          actionUrl = `https://mentari.unpam.ac.id/api/file/${encodeURIComponent(i.file)}`;
          actionLabel = "Download";
          actionIcon = "download";
        }
        iconName = this.getMaterialIcon(i.kode_template);
      } else if (isKuesioner) {
        cardUrl =
          c.kode_course && s.kode_section
            ? `https://mentari.unpam.ac.id/u-courses/${c.kode_course}/kuesioner/${s.kode_section}`
            : "#";
        actionUrl = cardUrl;
        iconClass = "icon-quiz";
        iconName = "kuesioner";
        actionLabel = "Isi Kuesioner Otomatis";
        actionIcon = "bolt";
      } else if (isTugas) {
        iconClass = "icon-material";
        iconName = "doc";
        actionLabel = "Lihat Tugas";
        if (i.link) actionUrl = Utils.safeUrl(i.link);
        else if (i.file)
          actionUrl = `https://mentari.unpam.ac.id/api/file/${encodeURIComponent(i.file)}`;
      }

      const itemType = isForum
        ? "forum"
        : isQuiz
          ? "quiz"
          : isKuesioner
            ? "kuesioner"
            : isTugas
              ? "tugas"
              : "material";

      const isFinished = i.completion === true;
      const statusClass = isFinished ? "status-done" : "status-todo";
      const statusText = isFinished ? "Selesai" : "Belum";

      const btnIcon = isFinished ? "lock" : actionIcon;
      const btnTitle = isFinished ? "Sudah Selesai" : actionLabel;

      let rightActionHtml = "";
      if (isKuesioner) {
        rightActionHtml = `<button type="button" class="btn btn-icon-sq ${isFinished ? "" : "btn-primary"} kuesioner-submit-btn" title="${Utils.escapeHtml(btnTitle)}" ${isFinished ? "disabled" : ""} data-action="submit-kuesioner" data-course-code="${Utils.escapeHtml(c.kode_course)}" data-section-code="${Utils.escapeHtml(s.kode_section)}">${ico(btnIcon, 14)}</button>`;
      } else if (actionUrl !== "#") {
        if (isFinished) {
          rightActionHtml = `<button type="button" class="btn btn-icon-sq" title="${Utils.escapeHtml(btnTitle)}" disabled>${ico("lock", 14)}</button>`;
        } else {
          const variantClass =
            actionLabel === "Download" ? "btn-success" : "btn-primary";
          rightActionHtml = `<a href="${Utils.escapeHtml(actionUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-icon-sq ${variantClass}" title="${Utils.escapeHtml(btnTitle)}">${ico(btnIcon, 14)}</a>`;
        }
      }

      const forumKonten = isForum && i.konten ? i.konten.trim() : "";
      const forumKontenId = `fk-${i.id}`;
      const itemSearch = [i.judul, itemType].filter(Boolean).join(" ");

      return `
        <div class="item-row${isFinished ? " completed-item" : ""}"
          data-item="true"
          data-type="${itemType}"
          data-name="${Utils.escapeHtml(i.judul)}"
          data-search="${Utils.escapeHtml(itemSearch)}"
          ${cardUrl !== "#" ? `data-action="open-url" data-url="${Utils.escapeHtml(cardUrl)}"` : ""}>
          <div class="item-main">
            <div class="item-icon ${iconClass}">${ico(iconName, 15)}</div>
            <div class="item-info">
              <div class="item-title">${Utils.escapeHtml(i.judul)}</div>
              <div class="item-meta">
                <span class="item-status ${statusClass}">${ico(isFinished ? "check" : "clock", 10)} ${statusText}</span>
                ${i.setting_quiz?.duration ? `<span>${ico("clock", 11)} ${Utils.escapeHtml(i.setting_quiz.duration)} min</span>` : ""}
                ${isQuiz ? `<span class="quiz-participant-status" data-quiz-id="${Utils.escapeHtml(i.id)}">Memuat hasil...</span>` : ""}
              </div>
            </div>
            <div class="item-actions">
              ${
                forumKonten
                  ? `<button type="button" class="btn btn-sm" title="Lihat Konten Forum" data-action="toggle-forum-content" data-target="${Utils.escapeHtml(forumKontenId)}">${ico("book", 13)}<span>Konten</span></button>`
                  : ""
              }
              ${
                isForum && i.id
                  ? `<button type="button" class="btn btn-sm btn-success forum-reply-btn" title="Balas Forum" data-action="open-forum-reply" data-forum-id="${Utils.escapeHtml(i.id)}">${ico("reply", 13)}<span>Balas</span></button>`
                  : ""
              }
              ${rightActionHtml}
            </div>
          </div>
          ${
            forumKonten
              ? `<div id="${Utils.escapeHtml(forumKontenId)}" class="forum-html-preview" hidden>${this.sanitizeForumHtml(forumKonten)}</div>`
              : ""
          }
          ${
            isForum && i.id
              ? `
            <div style="display:flex; justify-content:flex-end; padding:0 10px 4px;">
              <span class="forum-reply-count" data-forum-id="${Utils.escapeHtml(i.id)}" style="font-size:10.5px; font-weight:600; color:var(--accent); display:inline-flex; align-items:center; gap:3px;">${ico("reply", 12)} Reply Kamu: -</span>
            </div>
            <div class="topics-container" data-forum-id="${Utils.escapeHtml(i.id)}" data-course-code="${Utils.escapeHtml(c.kode_course)}"></div>`
              : ""
          }
        </div>
      `;
    },

    getMaterialIcon(type) {
      const map = {
        BUKU_ISBN: "book",
        VIDEO_AJAR: "video",
        POWER_POINT: "doc",
        ARTIKEL_RISET: "doc",
        MATERI_LAINNYA: "folder",
      };
      return map[type] || "doc";
    },

    bindDelegatedEvents(el) {
      if (!el || el.dataset.delegated === "true") return;
      el.dataset.delegated = "true";

      el.addEventListener("input", (e) => {
        const target = getEventElement(e);
        if (target?.id === "forum-search-input") {
          State.forumSearch = target.value || "";
          UIRenderer.byId("forum-search-clear")?.classList.toggle(
            "visible",
            Boolean(State.forumSearch),
          );
          this.applyFilters();
        }
      });

      el.addEventListener("click", (e) => {
        const actionEl = getEventActionTarget(e, "[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action;

        if (action === "clear-forum-search") {
          e.stopPropagation();
          State.forumSearch = "";
          const input = UIRenderer.byId("forum-search-input");
          if (input) {
            input.value = "";
            input.focus?.();
          }
          UIRenderer.byId("forum-search-clear")?.classList.remove("visible");
          this.applyFilters();
          return;
        }

        if (action === "filter-forum-type") {
          e.stopPropagation();
          const filter = actionEl.dataset.filter || "all";
          State.forumTypeFilter = filter;
          el.querySelectorAll('[data-action="filter-forum-type"]').forEach(
            (chip) => {
              const isMatch = chip.dataset.filter === filter;
              chip.classList.toggle("active", isMatch);
              chip.setAttribute("aria-pressed", isMatch ? "true" : "false");
            },
          );
          this.applyFilters();
          return;
        }

        if (action === "toggle-section") {
          e.stopPropagation();
          const target = UIRenderer.byId(actionEl.dataset.target);
          const toggle = actionEl.querySelector(".section-toggle");
          if (!target) return;
          const isVisible = target.classList.contains("active");
          if (isVisible) {
            target.classList.remove("active");
            toggle?.classList.remove("active");
            actionEl.setAttribute("aria-expanded", "false");
          } else {
            UIRenderer.qsa(".section-content.active").forEach((openSec) => {
              openSec.classList.remove("active");
              const card = openSec.closest(".section-card");
              card?.querySelector(".section-toggle")?.classList.remove("active");
              card
                ?.querySelector(".section-header")
                ?.setAttribute("aria-expanded", "false");
            });
            target.classList.add("active");
            toggle?.classList.add("active");
            actionEl.setAttribute("aria-expanded", "true");
            this.loadSectionData(target);
          }
          return;
        }

        if (action === "open-url") {
          const eventEl = getEventElement(e);
          if (
            eventEl?.closest?.(
              "a, button, input, select, textarea, form, .topics-container, .forum-html-preview",
            )
          )
            return;
          const url = actionEl.dataset.url;
          if (url && url !== "#") window.location.href = url;
          return;
        }

        if (action === "toggle-forum-content") {
          e.stopPropagation();
          const preview = UIRenderer.byId(actionEl.dataset.target);
          if (preview) preview.hidden = !preview.hidden;
          return;
        }

        if (action === "open-forum-reply") {
          e.stopPropagation();
          const forumId = actionEl.dataset.forumId;
          const container = Array.from(
            UIRenderer.qsa(".topics-container"),
          ).find((node) => node.dataset.forumId === forumId);
          if (container) this.toggleForumReplyForm(container);
          return;
        }

        if (action === "submit-kuesioner") {
          e.stopPropagation();
          this.handleKuesionerSubmit(actionEl);
        }
      });
    },

    async handleKuesionerSubmit(button) {
      if (!button || button.disabled) return;

      const courseCode = button.dataset.courseCode;
      const sectionCode = button.dataset.sectionCode;
      const originalContent = button.innerHTML;
      button.disabled = true;
      button.innerHTML = ico("refresh", 14, "mentari-spin");

      try {
        Utils.progressToast("Sedang mengambil pertanyaan kuisioner...");
        const detail = await ApiService.fetchKuesioner(courseCode, sectionCode);
        const questions = detail?.kuesioner || [];
        if (!questions.length) throw new Error("Pertanyaan kuisioner kosong");

        Utils.progressToast("Sedang mengirim jawaban kuisioner...");
        await ApiService.submitKuesioner(courseCode, sectionCode, questions);
        Utils.closeProgressToast();
        Utils.successToast("Kuisioner berhasil dikirim");
        setTimeout(() => App.refreshData(true), 700);
      } catch (error) {
        console.warn("[Mentari Assistant] Gagal submit kuisioner", {
          kode_course: courseCode,
          kode_section: sectionCode,
          error,
        });
        Utils.closeProgressToast();
        Utils.toast("Kuisioner gagal dikirim");
        button.disabled = false;
        button.innerHTML = originalContent;
      }
    },

    applyFilters() {
      const forumEl = UIRenderer.byId("forum-tab-tab");
      if (!forumEl) return;
      const q = (State.forumSearch || "").trim().toLowerCase();
      const typeFilter = State.forumTypeFilter || "all";
      let visibleCourses = 0;

      forumEl.querySelectorAll(".course-card").forEach((courseEl) => {
        const courseSearch = (courseEl.dataset.search || "").toLowerCase();
        const courseMatchesQuery = !q || courseSearch.includes(q);
        let visibleSections = 0;

        courseEl.querySelectorAll(".section-card").forEach((sectionEl) => {
          const sectionSearch = (sectionEl.dataset.search || "").toLowerCase();
          const sectionMatchesQuery =
            !q || courseMatchesQuery || sectionSearch.includes(q);
          let visibleItems = 0;

          sectionEl
            .querySelectorAll('.item-row[data-item="true"]')
            .forEach((itemEl) => {
              const itemType = itemEl.dataset.type || "other";
              const itemSearch = (itemEl.dataset.search || "").toLowerCase();
              const matchesType =
                typeFilter === "all" || itemType === typeFilter;
              const matchesQuery =
                !q || sectionMatchesQuery || itemSearch.includes(q);
              const showItem = matchesType && matchesQuery;
              itemEl.hidden = !showItem;
              if (showItem) visibleItems++;
            });

          const showSection = visibleItems > 0;
          sectionEl.hidden = !showSection;
          if (showSection) visibleSections++;
        });

        const showCourse = visibleSections > 0;
        courseEl.hidden = !showCourse;
        if (showCourse) visibleCourses++;
      });

      const emptyFilter = UIRenderer.byId("forum-empty-filter");
      if (emptyFilter) emptyFilter.hidden = visibleCourses > 0;
    },

    initInteractions() {
      const forumEl = UIRenderer.byId("forum-tab-tab");
      this.bindDelegatedEvents(forumEl);

      UIRenderer.qsa(".section-content.active").forEach((section) => {
        this.loadSectionData(section);
      });
    },

    loadSectionData(scope = UIRenderer.getRoot(), force = false) {
      if (!scope) return;
      const root = UIRenderer.getRoot();
      if (
        !force &&
        scope !== root &&
        scope !== document &&
        scope.dataset?.loaded === "true"
      ) {
        return;
      }
      if (scope !== root && scope !== document && scope.dataset) {
        scope.dataset.loaded = "true";
      }
      this.loadQuizParticipants(scope, force);
      this.loadTopics(scope, force);
    },

    loadQuizParticipants(scope = UIRenderer.getRoot(), force = false) {
      if (!scope) return;
      scope
        .querySelectorAll(".quiz-participant-status[data-quiz-id]")
        .forEach(async (statusEl) => {
          if (!force && statusEl.dataset.loaded === "true") return;
          statusEl.dataset.loaded = "true";
          try {
            const result = await ApiService.fetchQuizParticipant(
              statusEl.dataset.quizId,
            );
            const quiz = result?.quiz;
            if (!quiz) {
              statusEl.textContent = "Belum dikerjakan";
              return;
            }

            const endInSecond = quiz.end_in_second ?? null;
            const grade = quiz.grade ?? "-";
            const timeDisplay =
              endInSecond !== null
                ? (() => {
                    const totalSec = Number(endInSecond);
                    const m = Math.floor(totalSec / 60);
                    const s = totalSec % 60;
                    return s > 0 ? `${m}m ${s}s` : `${m} menit`;
                  })()
                : "-";
            statusEl.innerHTML = `${ico("clock", 12)} ${Utils.escapeHtml(timeDisplay)} <span style="margin-left:4px;">Nilai: ${Utils.escapeHtml(grade)}</span>`;
          } catch (error) {
            delete statusEl.dataset.loaded;
            statusEl.textContent = "Status tidak tersedia";
          }
        });
    },

    loadTopics(scope = UIRenderer.getRoot(), force = false) {
      if (!scope) return Promise.resolve();
      const tasks = Array.from(scope.querySelectorAll(".topics-container")).map(
        async (container) => {
          if (!force && container.dataset.loaded === "true") return;
          const id = container.dataset.forumId;
          if (!id || id === "null" || id === "undefined") return;
          container.dataset.loaded = "true";
          try {
            const res = await ApiService.fetchForumTopics(id);
            const topics =
              res.topics?.filter((t) => t.id_trx_course_sub_section === id) ||
              [];
            if (topics.length) {
              container.innerHTML = "";
              await this.loadForumReplies(container, topics);
            }
          } catch (e) {
            delete container.dataset.loaded;
          }
        },
      );
      return Promise.all(tasks);
    },

    async loadForumReplies(container, topics) {
      const currentNim = String(
        State.userInfo?.username || State.userInfo?.userId || "",
      ).trim();
      if (!currentNim) return;
      const courseCode = container.dataset.courseCode;
      const sectionId = container.dataset.forumId;

      const replyGroups = await Promise.all(
        topics.map(async (topic) => {
          try {
            const result = await ApiService.fetchForumReplies(topic.id);
            const root = result?.id === topic.id ? result : null;
            const replies =
              root?.data || result?.data || result?.replies || [];
            const studentReplies = replies.filter((reply) => {
              const nim = String(
                reply.nim || reply.mahasiswa?.nim || "",
              ).trim();
              return (
                Number(reply.reply_level) > 0 &&
                reply.id_dosen == null &&
                Boolean(nim)
              );
            });
            const ownLevelOne = replies.filter(
              (reply) =>
                Number(reply.reply_level) === 1 &&
                String(reply.nim || reply.mahasiswa?.nim || "").trim() ===
                  currentNim,
            );
            const ownLevelOneIds = new Set(
              ownLevelOne.map((reply) => reply.id),
            );
            const ownLevelTwo = replies.filter(
              (reply) =>
                Number(reply.reply_level) === 2 &&
                ownLevelOneIds.has(reply.id_parent),
            );

            return {
              topic,
              root,
              studentReplyCount: studentReplies.length,
              ownReplies: [...ownLevelOne, ...ownLevelTwo],
            };
          } catch (error) {
            return null;
          }
        }),
      );

      const visibleGroups = replyGroups.filter(Boolean);
      container._forumReplyTargets = visibleGroups.map(
        ({ topic, root, ownReplies }) => ({
          id: topic.id,
          topicId: topic.id,
          judul: `RE ${root?.judul || topic.judul || "Forum Diskusi"}`,
          label: `Topik: ${root?.judul || topic.judul || "Forum Diskusi"}`,
          own: false,
          replies: ownReplies.map((reply) => ({
            ...reply,
            topicId: topic.id,
          })),
        }),
      );
      const totalReplies = visibleGroups.reduce(
        (total, group) => total + group.ownReplies.length,
        0,
      );

      const countEl = Array.from(
        container.closest(".item-row")?.querySelectorAll(".forum-reply-count") ||
          [],
      ).find((node) => node.dataset.forumId === sectionId);
      if (countEl) {
        countEl.innerHTML = `${ico("reply", 12)} Reply Kamu: ${totalReplies}`;
      }

      visibleGroups.forEach(
        ({ topic, root, ownReplies, studentReplyCount }) => {
          const topicEl = document.createElement("div");
          topicEl.className = "topic-card";

          const title = document.createElement("a");
          title.href = `https://mentari.unpam.ac.id/u-courses/${encodeURIComponent(courseCode)}/forum/${encodeURIComponent(sectionId)}/topics/${encodeURIComponent(topic.id)}`;
          title.target = "_blank";
          title.rel = "noopener noreferrer";
          title.className = "topic-badge";
          title.innerHTML = `${ico("forum", 14)}<span style="flex:1; min-width:0;">${Utils.escapeHtml(topic.judul || "Forum Diskusi")}</span><span class="item-status status-done" style="flex-shrink:0;">${ico("reply", 10)} ${studentReplyCount}</span>`;
          topicEl.appendChild(title);

          const rootContent = document.createElement("div");
          rootContent.style.cssText =
            "margin-top:6px; padding:4px 0; color:var(--text-secondary);";
          rootContent.innerHTML = this.sanitizeForumHtml(
            root?.konten || topic.konten || "",
          );
          topicEl.appendChild(rootContent);
          this.appendForumFiles(topicEl, root?.files || topic.files);

          ownReplies.forEach((reply) => {
            const replyEl = document.createElement("div");
            replyEl.style.cssText =
              "margin-top:6px; padding:8px 10px; border-radius:6px; background:var(--accent-soft); border-left:3px solid var(--accent); font-size:11px; color:var(--text-primary);";
            replyEl.innerHTML = `${Number(reply.reply_level) === 2 ? "<span style='opacity:0.75; margin-right:4px;'>↳ Balasan:</span>" : ""}${this.sanitizeForumHtml(reply.konten || "")}`;
            this.appendForumFiles(replyEl, reply.files);
            topicEl.appendChild(replyEl);
          });

          container.appendChild(topicEl);
        },
      );
    },

    appendForumFiles(parent, files) {
      if (!Array.isArray(files) || !files.length) return;

      const filesEl = document.createElement("div");
      filesEl.style.cssText =
        "display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;";
      files.forEach((fileId) => {
        if (!fileId) return;
        const link = document.createElement("a");
        link.href = `https://mentari.unpam.ac.id/api/file/${encodeURIComponent(fileId)}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "btn btn-sm btn-primary";
        link.title = "Download lampiran";
        link.innerHTML = `${ico("download", 13)} Lampiran`;
        filesEl.appendChild(link);
      });
      parent.appendChild(filesEl);
    },

    toggleForumReplyForm(container) {
      const existing = container.querySelector(".forum-reply-form");
      if (existing) {
        existing.remove();
        return;
      }

      const targets = container._forumReplyTargets || [];
      const form = document.createElement("div");
      form.className = "forum-reply-form";
      form.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div style="font-size:11.5px; font-weight:700; color:var(--accent); display:flex; align-items:center; gap:5px;">
            ${ico("reply", 14)}<span>Tulis Balasan Forum</span>
          </div>
          <button type="button" class="btn btn-icon-sq forum-reply-cancel" style="border:none;background:transparent;" title="Tutup">
            ${ico("close", 14)}
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; max-width:100%; position:relative;">
          <label style="font-size:10.5px; color:var(--text-secondary); font-weight:600;">Sasaran Balasan:</label>
          <input type="hidden" class="forum-reply-parent-val" value="" />
          <button type="button" class="custom-reply-select-btn settings-select" style="text-align:left; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:6px; line-height:1.4;">
            <span class="custom-reply-select-label" style="flex:1; min-width:0; white-space:normal; word-break:break-word; overflow-wrap:anywhere;">Pilih sasaran balasan...</span>
            ${ico("chevronDown", 14)}
          </button>
          <div class="custom-reply-options-list" hidden style="position:absolute; top:100%; left:0; right:0; margin-top:4px; max-height:180px; overflow-y:auto; background:var(--bg-elevated); border:1px solid var(--border-strong); border-radius:6px; z-index:100; box-shadow:0 8px 20px rgba(0,0,0,0.35);">
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:10.5px; color:var(--text-secondary); font-weight:600;">Isi Pesan Balasan:</label>
          <textarea class="forum-reply-input" rows="3" placeholder="Tuliskan argumen / jawaban forum kamu secara lengkap..." style="resize:vertical; min-height:70px;"></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:2px;">
          <button type="button" class="btn btn-sm forum-reply-cancel-btn">Batal</button>
          <button type="button" class="btn btn-sm btn-primary forum-reply-send">
            ${ico("send", 13)}<span>Kirim Balasan</span>
          </button>
        </div>
      `;

      const hiddenInput = form.querySelector(".forum-reply-parent-val");
      const selectBtn = form.querySelector(".custom-reply-select-btn");
      const selectLabel = form.querySelector(".custom-reply-select-label");
      const optionsList = form.querySelector(".custom-reply-options-list");

      selectBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        optionsList.hidden = !optionsList.hidden;
      });

      const selectOption = (id, text) => {
        hiddenInput.value = id;
        selectLabel.textContent = text;
        optionsList.hidden = true;
      };

      let isFirst = true;

      targets.forEach((target) => {
        const item = document.createElement("div");
        item.style.cssText =
          "padding:8px 10px; border-bottom:1px solid var(--border-subtle); font-size:11px; line-height:1.4; white-space:normal; word-break:break-word; overflow-wrap:anywhere; cursor:pointer; color:var(--text-primary);";
        item.textContent = target.label;
        item.addEventListener("mouseenter", () => {
          item.style.background = "var(--accent-soft)";
        });
        item.addEventListener("mouseleave", () => {
          item.style.background = "transparent";
        });
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          selectOption(target.id, target.label);
        });
        optionsList.appendChild(item);

        if (isFirst) {
          selectOption(target.id, target.label);
          isFirst = false;
        }

        target.replies
          .filter((reply) => Number(reply.reply_level) === 1)
          .forEach((reply) => {
            const replyItem = document.createElement("div");
            replyItem.style.cssText =
              "padding:8px 10px 8px 20px; border-bottom:1px solid var(--border-subtle); font-size:11px; line-height:1.4; white-space:normal; word-break:break-word; overflow-wrap:anywhere; cursor:pointer; color:var(--text-secondary);";
            const cleanedText = this.cleanForumText(reply.konten);
            const fullText = `↳ Reply kamu: ${cleanedText}`;
            replyItem.textContent = fullText;
            replyItem.addEventListener("mouseenter", () => {
              replyItem.style.background = "var(--accent-soft)";
              replyItem.style.color = "var(--text-primary)";
            });
            replyItem.addEventListener("mouseleave", () => {
              replyItem.style.background = "transparent";
              replyItem.style.color = "var(--text-secondary)";
            });
            replyItem.addEventListener("click", (e) => {
              e.stopPropagation();
              selectOption(reply.id, fullText);
            });
            optionsList.appendChild(replyItem);
          });
      });

      const closeForm = () => form.remove();
      form
        .querySelector(".forum-reply-cancel")
        ?.addEventListener("click", closeForm);
      form
        .querySelector(".forum-reply-cancel-btn")
        ?.addEventListener("click", closeForm);

      form
        .querySelector(".forum-reply-send")
        ?.addEventListener("click", async () => {
          const sendButton = form.querySelector(".forum-reply-send");
          const content = form.querySelector(".forum-reply-input").value.trim();
          const parentId = hiddenInput.value;
          const parentTarget = targets
            .flatMap((target) => [
              { id: target.id, topicId: target.topicId, judul: target.judul },
              ...target.replies.map((reply) => ({
                id: reply.id,
                topicId: reply.topicId,
                judul: target.judul,
              })),
            ])
            .find((target) => target.id === parentId);
          if (!content || !parentId || !parentTarget) {
            Utils.toast("Pilih parent dan isi jawaban terlebih dahulu");
            return;
          }

          sendButton.disabled = true;
          sendButton.innerHTML = ico("refresh", 13, "mentari-spin");
          try {
            await ApiService.submitForumReply({
              id_topic: parentTarget.topicId,
              id_post: parentId,
              konten: content,
              judul: parentTarget.judul,
            });
            Utils.successToast("Reply forum berhasil dikirim");
            form.remove();
            await this.loadTopics(
              container.closest(".section-content") ||
                container.parentElement ||
                UIRenderer.getRoot(),
              true,
            );
          } catch (error) {
            Utils.toast(`Reply forum gagal: ${error.message}`);
            sendButton.disabled = false;
            sendButton.innerHTML = `${ico("send", 13)}<span>Kirim Balasan</span>`;
          }
        });

      container.prepend(form);
    },

    cleanForumText(value) {
      const div = document.createElement("div");
      div.innerHTML = value || "";
      return (div.textContent || "").replace(/\s+/g, " ").trim();
    },

    sanitizeForumHtml(value) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = value || "";
      wrapper
        .querySelectorAll("script, style, iframe, object, embed")
        .forEach((element) => element.remove());
      wrapper.querySelectorAll("*").forEach((element) => {
        Array.from(element.attributes).forEach((attribute) => {
          const name = attribute.name.toLowerCase();
          if (name.startsWith("on")) {
            element.removeAttribute(attribute.name);
            return;
          }
          if (
            (name === "href" || name === "src") &&
            /^\s*javascript:/i.test(attribute.value || "")
          ) {
            element.removeAttribute(attribute.name);
          }
        });

        if (element.hasAttribute("style")) {
          const styles = document.createElement("span").style;
          styles.cssText = element.getAttribute("style");
          const keptStyles = [];
          for (let index = 0; index < styles.length; index += 1) {
            const property = styles[index];
            if (/^(color|background(?:-color|-image)?)$/i.test(property))
              continue;
            keptStyles.push(`${property}:${styles.getPropertyValue(property)}`);
          }
          if (keptStyles.length)
            element.setAttribute("style", keptStyles.join(";"));
          else element.removeAttribute("style");
        }

        element.removeAttribute("color");
        element.removeAttribute("bgcolor");

        if (element.tagName === "IMG") {
          element.removeAttribute("width");
          element.removeAttribute("height");
          element.style.width = "100%";
          element.style.height = "auto";
          element.style.maxWidth = "100%";
          element.style.boxSizing = "border-box";
        }

        if (element.tagName === "FIGURE") {
          element.style.maxWidth = "100%";
          element.style.boxSizing = "border-box";
        }
      });
      return wrapper.innerHTML;
    },
  };

  const Renderers = {
    forum(data) {
      ForumRenderer.render(data);
    },

    mhs(data) {
      const el = UIRenderer.byId("mhs-tab-tab");
      if (!el) return;

      const list = Array.isArray(data) ? data : [];
      const courseOptions = [];
      const map = new Map();

      list.forEach((c) => {
        const code = String(c.kode_course || "").trim();
        if (!code || code.toUpperCase().includes("PKKMB")) return;
        const participants = Array.isArray(c.peserta) ? c.peserta : [];
        if (!participants.length) return;

        const title = cleanCourseTitle(
          c.coursename || c.nama_mata_kuliah || code,
        );
        courseOptions.push({ code, title });

        participants.forEach((p) => {
          if (!p?.nim) return;
          if (!map.has(p.nim)) {
            map.set(p.nim, { ...p, _courses: new Set([code]) });
          } else {
            map.get(p.nim)._courses.add(code);
          }
        });
      });

      const all = Array.from(map.values());
      if (!all.length) {
        el.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">${ico("groups", 28)}</div>
            <div class="empty-title">Tidak Ada Data Mahasiswa</div>
            <div class="empty-desc">Data teman sekelas akan tampil setelah mata kuliah termuat.</div>
          </div>`;
        return;
      }

      if (
        State.mhsCourseFilter !== "all" &&
        !courseOptions.some((opt) => opt.code === State.mhsCourseFilter)
      ) {
        State.mhsCourseFilter = "all";
      }

      all.sort((a, b) =>
        String(a.nama_mahasiswa || "").localeCompare(
          String(b.nama_mahasiswa || ""),
        ),
      );

      const rows = all
        .map((p, i) => {
          const name = p.nama_mahasiswa || "-";
          const initial = (name || "?").charAt(0).toUpperCase();
          const email =
            p.alamat_email && p.alamat_email !== "-" ? p.alamat_email : null;
          const hp =
            p.no_hp_mahasiswa && p.no_hp_mahasiswa !== "-"
              ? p.no_hp_mahasiswa
              : null;
          const courses = Array.from(p._courses).join(",");
          const searchStr = [name, p.nim, email, hp].filter(Boolean).join(" ");

          return `
          <div class="student-row"
            data-courses="${Utils.escapeHtml(courses)}"
            data-search="${Utils.escapeHtml(searchStr)}"
            data-name="${Utils.escapeHtml(name)}"
            data-nim="${Utils.escapeHtml(p.nim)}">
            <div class="student-avatar">${Utils.escapeHtml(initial)}</div>
            <div class="student-info">
              <div class="student-name">${Utils.escapeHtml(name)}</div>
              <div class="student-meta">
                <button type="button" class="btn btn-sm" style="height:20px;padding:0 6px;font-size:10px;gap:4px;" data-action="copy-nim" data-nim="${Utils.escapeHtml(p.nim)}" title="Salin NIM">
                  <span class="student-nim">${Utils.escapeHtml(p.nim)}</span>
                  ${ico("copy", 10)}
                </button>
                ${email ? `<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:130px;" title="${Utils.escapeHtml(email)}">${Utils.escapeHtml(email)}</span>` : ""}
                ${hp ? `<span>${Utils.escapeHtml(hp)}</span>` : ""}
              </div>
            </div>
            <span class="student-rank" style="font-size:10px; color:var(--text-secondary); font-variant-numeric:tabular-nums; flex-shrink:0;">${i + 1}</span>
          </div>`;
        })
        .join("");

      el.innerHTML = `
        <div class="toolbar-stack">
          <select id="mhs-course-filter" class="settings-select" aria-label="Filter Mata Kuliah">
            <option value="all"${State.mhsCourseFilter === "all" ? " selected" : ""}>Semua Matkul</option>
            ${courseOptions
              .map(
                (opt) =>
                  `<option value="${Utils.escapeHtml(opt.code)}"${State.mhsCourseFilter === opt.code ? " selected" : ""}>${Utils.escapeHtml(opt.title)}</option>`,
              )
              .join("")}
          </select>
          <div class="search-box">
            <span class="search-ico">${ico("search", 14)}</span>
            <input type="text" id="mhs-search-input" class="search-input" placeholder="Cari nama atau NIM..." value="${Utils.escapeHtml(State.mhsSearch)}" autocomplete="off" />
            <button type="button" id="mhs-search-clear" class="search-clear${State.mhsSearch ? " visible" : ""}" data-action="clear-mhs-search" aria-label="Hapus pencarian" title="Hapus pencarian">${ico("close", 13)}</button>
          </div>
        </div>
        <div class="student-list-card">
          <div class="student-list-header">
            <div style="display:flex; align-items:center; gap:6px;">
              ${ico("groups", 15)}
              <span>Daftar Mahasiswa</span>
              <span id="mhs-visible-count" class="student-count">${all.length}</span>
            </div>
            <button type="button" id="copy-mhs" class="btn btn-sm btn-primary" data-action="copy-all-mhs">
              ${ico("copy", 13)}<span>Salin Semua</span>
            </button>
          </div>
          <div class="student-model-list">${rows}</div>
          <div id="mhs-empty-filter" class="empty-state" hidden>
            <div class="empty-icon">${ico("search", 26)}</div>
            <div class="empty-title">Mahasiswa Tidak Ditemukan</div>
            <div class="empty-desc">Coba pilih mata kuliah lain atau ubah kata kunci pencarian.</div>
          </div>
        </div>`;

      this.bindMhsEvents(el);
      this.applyMhsFilter();
    },

    bindMhsEvents(el) {
      if (!el || el.dataset.delegated === "true") return;
      el.dataset.delegated = "true";

      el.addEventListener("input", (e) => {
        const target = getEventElement(e);
        if (target?.id === "mhs-search-input") {
          State.mhsSearch = target.value || "";
          UIRenderer.byId("mhs-search-clear")?.classList.toggle(
            "visible",
            Boolean(State.mhsSearch),
          );
          this.applyMhsFilter();
        }
      });

      el.addEventListener("change", (e) => {
        const target = getEventElement(e);
        if (target?.id === "mhs-course-filter") {
          State.mhsCourseFilter = target.value || "all";
          this.applyMhsFilter();
        }
      });

      el.addEventListener("click", (e) => {
        const actionEl = getEventActionTarget(e, "[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action;

        if (action === "clear-mhs-search") {
          e.stopPropagation();
          State.mhsSearch = "";
          const input = UIRenderer.byId("mhs-search-input");
          if (input) {
            input.value = "";
            input.focus?.();
          }
          UIRenderer.byId("mhs-search-clear")?.classList.remove("visible");
          this.applyMhsFilter();
          return;
        }

        if (action === "copy-nim") {
          e.stopPropagation();
          const nim = actionEl.dataset.nim || "";
          if (nim) Utils.copy(nim, `NIM disalin: ${nim}`);
          return;
        }

        if (action === "copy-all-mhs") {
          e.stopPropagation();
          const visibleRows = Array.from(el.querySelectorAll(".student-row")).filter(
            (row) => !row.hidden,
          );
          if (!visibleRows.length) {
            Utils.toast("Tidak ada mahasiswa untuk disalin");
            return;
          }
          const txt = visibleRows
            .map(
              (row, i) =>
                `${i + 1}. ${row.dataset.name || "-"} (${row.dataset.nim || "-"})`,
            )
            .join("\n");
          Utils.copy(txt, "Daftar mahasiswa disalin");
        }
      });
    },

    applyMhsFilter() {
      const mhsEl = UIRenderer.byId("mhs-tab-tab");
      if (!mhsEl) return;
      const courseCode = State.mhsCourseFilter || "all";
      const q = (State.mhsSearch || "").trim().toLowerCase();
      let visibleCount = 0;

      mhsEl.querySelectorAll(".student-row").forEach((row) => {
        const courses = (row.dataset.courses || "").split(",");
        const matchesCourse =
          courseCode === "all" || courses.includes(courseCode);
        const matchesQuery =
          !q || (row.dataset.search || "").toLowerCase().includes(q);
        const show = matchesCourse && matchesQuery;
        row.hidden = !show;
        if (show) visibleCount++;
      });

      const countEl = UIRenderer.byId("mhs-visible-count");
      if (countEl) countEl.textContent = String(visibleCount);
      const emptyEl = UIRenderer.byId("mhs-empty-filter");
      if (emptyEl) emptyEl.hidden = visibleCount > 0;
    },

    notif(items = []) {
      const el = UIRenderer.byId("notif-tab-tab");
      const list = Array.isArray(items) ? items : [];

      const badge = UIRenderer.byId("notif-tab-badge");
      if (badge) {
        badge.textContent = list.length ? String(list.length) : "";
        badge.style.display = list.length ? "inline-flex" : "none";
      }

      if (!el) return;

      const toolbarHtml = `
        <div class="notif-toolbar">
          <span style="font-size:11.5px; font-weight:600; color:var(--text-secondary);">
            ${list.length ? `${list.length} balasan dosen` : "Balasan dosen dari forum"}
          </span>
          <button type="button" id="notif-refresh-btn" class="btn btn-sm" data-action="refresh-notifs">
            ${ico("refresh", 13)}<span>Periksa Sekarang</span>
          </button>
        </div>
      `;

      if (!list.length) {
        el.innerHTML = `
          ${toolbarHtml}
          <div class="empty-state">
            <div class="empty-icon">${ico("notif", 28)}</div>
            <div class="empty-title">Belum Ada Notifikasi</div>
            <div class="empty-desc">Belum ada balasan terbaru dari dosen di forum diskusi kamu.</div>
          </div>`;
        this.bindNotifEvents(el);
        return;
      }

      const dateFmt = {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      };

      const cardsHtml = list
        .map((item) => {
          const dateLabel = item.date
            ? new Date(item.date).toLocaleDateString("id-ID", dateFmt)
            : "-";
          const itemUrl = Utils.safeUrl(item.url);
          return `
            <div class="notif-card">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:6px;">
                <div style="font-weight:700; font-size:12.5px; color:var(--accent);">${Utils.escapeHtml(item.lecturerName || "Dosen")}</div>
                <div style="font-size:10.5px; color:var(--text-secondary); display:inline-flex; align-items:center; gap:4px; flex-shrink:0;">
                  ${ico("clock", 11)} ${Utils.escapeHtml(dateLabel)}
                </div>
              </div>
              <div class="notif-content" style="font-size:12px; color:var(--text-primary); line-height:1.5; margin-bottom:10px;">${Utils.escapeHtml(item.content)}</div>
              <a href="${Utils.escapeHtml(itemUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm">
                ${ico("external", 12)}<span>Lihat Diskusi</span>
              </a>
            </div>
          `;
        })
        .join("");

      el.innerHTML = toolbarHtml + cardsHtml;
      this.bindNotifEvents(el);
    },

    bindNotifEvents(el) {
      if (!el || el.dataset.delegated === "true") return;
      el.dataset.delegated = "true";

      el.addEventListener("click", async (e) => {
        const actionEl = getEventActionTarget(
          e,
          '[data-action="refresh-notifs"]',
        );
        if (!actionEl || actionEl.disabled) return;
        e.stopPropagation();

        if (!State.courseDataList.length) {
          Utils.toast("Data mata kuliah belum dimuat");
          return;
        }

        actionEl.disabled = true;
        actionEl.innerHTML = `${ico("refresh", 13, "mentari-spin")}<span>Memeriksa...</span>`;
        try {
          await App.syncLecturerNotifications(State.courseDataList, true);
        } finally {
          if (UIRenderer.byId("notif-refresh-btn") === actionEl) {
            actionEl.disabled = false;
            actionEl.innerHTML = `${ico("refresh", 13)}<span>Periksa Sekarang</span>`;
          }
        }
      });
    },

    settings(info) {
      const el = UIRenderer.byId("set-tab-tab");
      if (!el) return;
      const profile = info || {
        fullname: "Mahasiswa UNPAM",
        username: "-",
        role: "Student",
      };
      const fullname = profile.fullname || "Mahasiswa UNPAM";
      const username = profile.username || "-";
      const role = profile.role || "Student";

      const currentModel =
        (
          localStorage.getItem(Config.STORAGE_KEYS.GEMINI_MODEL) ||
          FALLBACK_MODELS[0]
        ).replace(/"/g, "") || FALLBACK_MODELS[0];
      const isCustom = !FALLBACK_MODELS.includes(currentModel);
      const isGeminiEnabled =
        Utils.get(Config.STORAGE_KEYS.GEMINI_ENABLED) !== false;
      const isAutoFinishQuiz =
        Utils.get(Config.STORAGE_KEYS.AUTO_FINISH_QUIZ) !== false;
      const themeMode = Utils.getThemeMode();

      el._currentModel = currentModel;
      el._liveModelsLoaded = false;

      el.innerHTML = `
        <div class="settings-profile">
          <div class="settings-avatar">${Utils.escapeHtml(fullname.charAt(0))}</div>
          <div style="min-width:0;">
            <div class="settings-label">${Utils.escapeHtml(fullname)}</div>
            <div class="settings-desc">${Utils.escapeHtml(username)} &bull; ${Utils.escapeHtml(role)}</div>
          </div>
        </div>

        <div class="settings-quick-links">
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" class="btn btn-sm">
            ${ico("key", 14)}<span>API Key</span>
          </a>
          <a href="https://aistudio.google.com/app/rate-limit" target="_blank" rel="noopener noreferrer" class="btn btn-sm">
            ${ico("bolt", 14)}<span>Rate Limit</span>
          </a>
          <a href="https://ai.google.dev/gemini-api/docs/models" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="grid-column: span 2;">
            ${ico("search", 14)}<span>Daftar Model Gemini</span>
          </a>
        </div>

        <div class="settings-section">
          <div class="settings-section-header">
            <span style="display:inline-flex;align-items:center;gap:6px;">${ico("settings", 14)}<span>Tampilan &amp; Fitur Bantuan</span></span>
          </div>
          <div class="settings-row">
            <div class="settings-row-main">
              <div class="settings-row-title">Tema Panel</div>
              <div class="settings-row-desc">Ikuti tampilan MENTARI atau pilih manual</div>
            </div>
            <div class="segmented" role="group" aria-label="Tema Panel">
              <button type="button" class="segmented-btn ${themeMode === "auto" ? "active" : ""}" data-action="set-theme" data-theme-mode="auto" aria-pressed="${themeMode === "auto" ? "true" : "false"}">Auto</button>
              <button type="button" class="segmented-btn ${themeMode === "dark" ? "active" : ""}" data-action="set-theme" data-theme-mode="dark" aria-pressed="${themeMode === "dark" ? "true" : "false"}">Gelap</button>
              <button type="button" class="segmented-btn ${themeMode === "light" ? "active" : ""}" data-action="set-theme" data-theme-mode="light" aria-pressed="${themeMode === "light" ? "true" : "false"}">Terang</button>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row-main">
              <div class="settings-row-title">${ico("sparkle", 14)}<span>AI Chatbot (Gemini)</span></div>
              <div class="settings-row-desc">Tampilkan tombol bantuan AI di halaman forum</div>
            </div>
            <label class="switch"><input type="checkbox" id="set-gemini" ${isGeminiEnabled ? "checked" : ""}><span class="slider"></span></label>
          </div>
          <div class="settings-row">
            <div class="settings-row-main">
              <div class="settings-row-title">${ico("quiz", 14)}<span>Auto Finish Quiz</span></div>
              <div class="settings-row-desc">Selesaikan kuis otomatis setelah semua soal terjawab</div>
            </div>
            <label class="switch"><input type="checkbox" id="set-quiz" ${isAutoFinishQuiz ? "checked" : ""}><span class="slider"></span></label>
          </div>
        </div>

        <div class="settings-section">
          <div class="settings-section-header">
            <span style="display:inline-flex;align-items:center;gap:6px;">${ico("sparkle", 14)}<span>Konfigurasi Model</span></span>
            <span id="set-model-status" style="font-size:10px; color:var(--text-secondary);">${isCustom ? "Custom" : "Preset"}</span>
          </div>
          <div style="padding:10px 12px;">
            <select id="set-gemini-model" class="settings-select" style="cursor:pointer;">
              <option value="gemini-3.5-flash-lite" ${currentModel === "gemini-3.5-flash-lite" ? "selected" : ""}>Gemini 3.5 Flash Lite (Rekomendasi)</option>
              <option value="gemini-3.1-flash-lite" ${currentModel === "gemini-3.1-flash-lite" ? "selected" : ""}>Gemini 3.1 Flash Lite (Cepat)</option>
              <option value="gemini-2.5-flash-lite" ${currentModel === "gemini-2.5-flash-lite" ? "selected" : ""}>Gemini 2.5 Flash Lite (Cadangan)</option>
              <option value="custom" ${isCustom ? "selected" : ""}>Model Lainnya...</option>
            </select>
            <div id="set-gemini-custom-wrap" style="display:${isCustom ? "block" : "none"}; margin-top:8px;">
              <input type="text" id="set-gemini-custom" class="settings-input" placeholder="Contoh: gemini-2.5-flash" value="${isCustom ? Utils.escapeHtml(currentModel) : ""}" />
              <div id="set-model-list" class="settings-model-list">
                <div style="text-align:center; padding:12px; color:var(--text-secondary); font-size:11px;">Memuat daftar model...</div>
              </div>
            </div>
          </div>
        </div>

        <button type="button" id="set-api-btn" class="btn btn-primary" data-action="update-api-key" style="width:100%; height:36px; margin-bottom:10px;">
          ${ico("key", 15)}<span>Update API Key</span>
        </button>

        <div class="settings-disclaimer">
          <div style="display:flex; align-items:center; gap:5px; margin-bottom:3px; color:var(--accent); font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.4px;">
            ${ico("warning", 13)}<span>Catatan</span>
          </div>
          <p style="font-size:10.5px; line-height:1.5; margin:0; color:var(--text-secondary);">Periksa kembali jawaban sebelum dikirim. Jika muncul error kuota, coba ganti model Gemini lain di atas.</p>
        </div>

        <div class="settings-footer">
          <span>v${APP_VERSION} &bull; by <a href="https://github.com/EdgePrompt" style="color:var(--accent); text-decoration:none;" target="_blank" rel="noopener noreferrer">EdgePrompt</a></span>
          <button type="button" id="set-update-btn" data-action="check-update" style="background:none; border:none; color:inherit; font-size:inherit; cursor:pointer; text-decoration:underline; padding:0;">Cek Update</button>
        </div>
      `;

      this.bindSettingsEvents(el);

      if (isCustom) {
        el._liveModelsLoaded = true;
        this._loadModelList(currentModel);
      }
    },

    bindSettingsEvents(el) {
      if (!el || el.dataset.delegated === "true") return;
      el.dataset.delegated = "true";

      el.addEventListener("change", (e) => {
        const target = getEventElement(e);
        if (!target) return;

        if (target.id === "set-gemini") {
          Utils.save(Config.STORAGE_KEYS.GEMINI_ENABLED, target.checked);
          Utils.toast(
            target.checked
              ? "AI Chatbot (Gemini) diaktifkan"
              : "AI Chatbot (Gemini) dinonaktifkan",
          );
          setTimeout(() => location.reload(), 600);
          return;
        }

        if (target.id === "set-quiz") {
          Utils.save(Config.STORAGE_KEYS.AUTO_FINISH_QUIZ, target.checked);
          Utils.toast(
            target.checked
              ? "Auto Finish Quiz diaktifkan"
              : "Auto Finish Quiz dinonaktifkan",
          );
          return;
        }

        if (target.id === "set-gemini-model") {
          const val = target.value;
          const customWrap = UIRenderer.byId("set-gemini-custom-wrap");
          const customInput = UIRenderer.byId("set-gemini-custom");
          if (val === "custom") {
            if (customWrap) customWrap.style.display = "block";
            customInput?.focus?.();
            if (!el._liveModelsLoaded) {
              el._liveModelsLoaded = true;
              this._loadModelList(el._currentModel || FALLBACK_MODELS[0]);
            }
          } else {
            if (customWrap) customWrap.style.display = "none";
            Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
            Utils.toast("Model diperbarui: " + val);
            setTimeout(() => location.reload(), 600);
          }
          return;
        }

        if (target.id === "set-gemini-custom") {
          const val = (target.value || "").trim();
          if (val) {
            Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
            Utils.toast("Model diperbarui: " + val);
            setTimeout(() => location.reload(), 600);
          }
        }
      });

      el.addEventListener("click", async (e) => {
        const modelItem = getEventActionTarget(e, ".mentari-model-item");
        if (modelItem) {
          e.stopPropagation();
          const val = modelItem.dataset.model;
          if (val) {
            Utils.save(Config.STORAGE_KEYS.GEMINI_MODEL, val);
            Utils.toast("Model diperbarui: " + val);
            setTimeout(() => location.reload(), 600);
          }
          return;
        }

        const actionEl = getEventActionTarget(e, "[data-action]");
        if (!actionEl) return;
        const action = actionEl.dataset.action;

        if (action === "set-theme") {
          e.stopPropagation();
          const mode = actionEl.dataset.themeMode || "auto";
          try {
            localStorage.setItem(Config.STORAGE_KEYS.THEME_MODE, mode);
          } catch (_) {}
          el.querySelectorAll('[data-action="set-theme"]').forEach((btn) => {
            const active = btn.dataset.themeMode === mode;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
          });
          Utils.applyTheme();
          Utils.toast(
            mode === "auto"
              ? "Tema Panel: Otomatis"
              : mode === "dark"
                ? "Tema Panel: Gelap"
                : "Tema Panel: Terang",
          );
          return;
        }

        if (action === "update-api-key") {
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("mentari-update-api-key"));
          return;
        }

        if (action === "check-update") {
          e.stopPropagation();
          if (actionEl.disabled) return;
          actionEl.disabled = true;
          actionEl.textContent = "Memeriksa...";
          try {
            const rel = await ApiService.checkUpdate();
            if (!rel || !rel.tag_name) {
              Utils.toast("Gagal memeriksa update. Coba lagi nanti.");
            } else {
              const parseVer = (v) =>
                String(v || "")
                  .replace(/^v/i, "")
                  .split(".")
                  .map((n) => parseInt(n, 10) || 0);
              const rn = parseVer(rel.tag_name);
              const cn = parseVer(APP_VERSION);
              let newer = false;
              for (let i = 0; i < Math.max(rn.length, cn.length); i++) {
                if ((rn[i] || 0) > (cn[i] || 0)) {
                  newer = true;
                  break;
                }
                if ((rn[i] || 0) < (cn[i] || 0)) break;
              }
              if (newer) {
                Utils.toast("Versi baru tersedia: " + rel.tag_name);
                if (rel.html_url) window.open(rel.html_url, "_blank");
              } else {
                Utils.toast("Sudah menggunakan versi terbaru.");
              }
            }
          } catch (_) {
            Utils.toast("Gagal memeriksa update. Coba lagi nanti.");
          } finally {
            actionEl.disabled = false;
            actionEl.textContent = "Cek Update";
          }
        }
      });
    },

    async _loadModelList(currentModel) {
      const listEl = UIRenderer.byId("set-model-list");
      const statusEl = UIRenderer.byId("set-model-status");
      if (!listEl) return;

      const rawKey = localStorage.getItem(Config.STORAGE_KEYS.GEMINI_API_KEY);
      const apiKey = rawKey
        ? (() => {
            try {
              return atob(rawKey);
            } catch (e) {
              return rawKey;
            }
          })()
        : null;

      if (!apiKey) {
        listEl.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-secondary); font-size:11px;">API Key belum diset. Kamu tetap bisa memilih model preset di atas.</div>`;
        if (statusEl) statusEl.textContent = "Preset";
        return;
      }

      const excluded = [
        "image",
        "tts",
        "transcribe",
        "embedding",
        "audio",
        "veo",
        "lyria",
        "robotics",
        "computer-use",
        "deep-research",
        "gemini-1.5",
        "gemini-2.0",
      ];

      const data = await ApiService.fetchGeminiModels(apiKey);
      if (!data || !data.models) {
        listEl.innerHTML = `<div style="text-align:center; padding:12px; color:var(--accent); font-size:11px;">Gagal memuat daftar model live. Gunakan preset di atas.</div>`;
        if (statusEl) statusEl.textContent = "Preset";
        return;
      }

      const models = data.models.filter((m) => {
        const name = String(m.name || "").toLowerCase();
        if (!name.includes("-flash")) return false;
        if (excluded.some((kw) => name.includes(kw))) return false;
        if (!m.supportedGenerationMethods?.includes("generateContent"))
          return false;
        return true;
      });

      if (statusEl) statusEl.textContent = `${models.length} model tersedia`;

      if (!models.length) {
        listEl.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-secondary); font-size:11px;">Tidak ada model flash lain yang tersedia.</div>`;
        return;
      }

      const stats = Utils.get(Config.STORAGE_KEYS.GEMINI_MODEL_STATS) || {};

      listEl.innerHTML = models
        .map((m) => {
          const modelId = m.name.replace("models/", "");
          const isActive = currentModel === modelId;
          const modelStats = stats[modelId] || {};
          const isLimited = modelStats.limited === true;

          return `
          <div class="mentari-model-item ${isActive ? "is-active" : ""} ${isLimited ? "is-limited" : ""}" data-model="${Utils.escapeHtml(modelId)}">
            <div style="width:8px; height:8px; border-radius:50%; flex-shrink:0; background:${isActive ? "var(--accent)" : isLimited ? "var(--accent)" : "var(--border-strong)"};"></div>
            <div style="flex:1; min-width:0;">
              <div style="font-size:12px; font-weight:${isActive ? "700" : "500"}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${Utils.escapeHtml(m.displayName || modelId)}
                ${isLimited ? `<span style="display:inline-flex;align-items:center;margin-left:6px;padding:1px 5px;border-radius:4px;background:var(--accent-soft);color:var(--accent);font-size:9px;font-weight:700;">LIMIT</span>` : ""}
              </div>
              <div style="font-size:10px; color:var(--text-secondary); margin-top:1px;">models/${Utils.escapeHtml(modelId)}</div>
            </div>
            ${isActive ? `<span style="color:var(--accent); flex-shrink:0;">${ico("check", 15)}</span>` : ""}
          </div>
        `;
        })
        .join("");

      const activeEl = Array.from(
        listEl.querySelectorAll(".mentari-model-item"),
      ).find((item) => item.dataset.model === currentModel);
      activeEl?.scrollIntoView?.({ block: "nearest" });
    },
  };

  const App = {
    async init() {
      if (localStorage.getItem(Config.STORAGE_KEYS.GEMINI_ENABLED) === null) {
        Utils.save(Config.STORAGE_KEYS.GEMINI_ENABLED, true);
      }
      UIRenderer.createPopup();
      this.intercept();

      const savedToken = Utils.get(Config.STORAGE_KEYS.AUTH_TOKEN);
      const liveToken = Utils.findTokenFromStorage();

      const savedInfo = savedToken ? Utils.decodeToken(savedToken) : null;
      const liveInfo = liveToken ? Utils.decodeToken(liveToken) : null;

      if (
        savedInfo &&
        liveInfo &&
        (savedInfo.userId !== liveInfo.userId ||
          savedInfo.username !== liveInfo.username)
      ) {
        Utils.remove(Config.STORAGE_KEYS.AUTH_TOKEN);
        Utils.remove(Config.STORAGE_KEYS.USER_INFO);
        Utils.remove(Config.STORAGE_KEYS.COURSE_DATA);
        Utils.remove(Config.STORAGE_KEYS.LECTURER_NOTIFS);
      }

      const cachedUser = Utils.get(Config.STORAGE_KEYS.USER_INFO);
      if (cachedUser && typeof cachedUser === "object") {
        State.userInfo = cachedUser;
      }

      const cachedNotifs = Utils.get(Config.STORAGE_KEYS.LECTURER_NOTIFS);
      if (Array.isArray(cachedNotifs)) {
        State.lecturerNotifications = cachedNotifs;
      }

      const t = liveToken || savedToken;
      if (t) this.handleToken(t);
      else this.render();

      window.addEventListener("mentari-toggle-popup", () =>
        window.toggleTokenPopup(),
      );
      window.addEventListener("resize", () => UIRenderer.updatePosition());

      setInterval(() => Utils.applyTheme(), 1000);
    },
    intercept() {
      const self = this;
      const origSetHeader = XMLHttpRequest.prototype.setRequestHeader;
      XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (!this._requestHeaders) this._requestHeaders = {};
        this._requestHeaders[header] = value;
        if (
          header.toLowerCase() === "authorization" &&
          String(value || "").includes("Bearer ")
        )
          self.handleToken(value);
        return origSetHeader.apply(this, arguments);
      };
      const origXHR = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function () {
        this.addEventListener("load", function () {
          const auth =
            this.getResponseHeader?.("Authorization") ||
            this._requestHeaders?.["Authorization"];
          if (auth) self.handleToken(auth);
        });
        return origXHR.apply(this, arguments);
      };
      const origFetch = window.fetch;
      window.fetch = async function () {
        const init = arguments[1];
        if (init?.headers) {
          const auth =
            typeof Headers === "function"
              ? new Headers(init.headers).get("Authorization")
              : init.headers.Authorization || init.headers.authorization;
          if (auth) self.handleToken(auth);
        }
        const res = await origFetch.apply(this, arguments);
        if (res?.headers?.get?.("Authorization"))
          self.handleToken(res.headers.get("Authorization"));
        return res;
      };
    },
    handleToken(token) {
      if (token.startsWith("Bearer ")) token = token.substring(7);
      const info = Utils.decodeToken(token);
      if (!info || State.authToken === token) return;
      const isNewUser =
        !State.userInfo ||
        State.userInfo.username !== info.username ||
        State.userInfo.userId !== info.userId;
      State.authToken = token;
      State.userInfo = info;
      Utils.save(Config.STORAGE_KEYS.AUTH_TOKEN, token);
      Utils.save(Config.STORAGE_KEYS.USER_INFO, info);
      if (isNewUser) {
        Utils.remove(Config.STORAGE_KEYS.COURSE_DATA);
        Utils.remove(Config.STORAGE_KEYS.LECTURER_NOTIFS);
        State.courseDataList = [];
        State.lecturerNotifications = [];
      }
      Renderers.settings(info);
      this.refreshData(isNewUser);
    },
    async refreshData(force = false) {
      if (State.isFetching || !State.authToken) return;
      const forumUiState = force ? this.captureForumUiState() : null;
      if (!force) {
        const cached = Utils.get(Config.STORAGE_KEYS.COURSE_DATA);
        const cachedNotifs = Utils.get(Config.STORAGE_KEYS.LECTURER_NOTIFS);
        if (Array.isArray(cachedNotifs)) {
          State.lecturerNotifications = cachedNotifs;
        }
        if (cached) {
          State.courseDataList = cached;
          this.render();
          if (!Array.isArray(cachedNotifs)) {
            this.syncLecturerNotifications(State.courseDataList);
          }
          return;
        }
      }
      try {
        State.isFetching = true;
        UIRenderer.setLoading(true);
        const list = await ApiService.fetchCourses();
        State.courseDataList = [];

        const courseDetails = await Promise.all(
          (list.data || []).map(async (c) => {
            const det = await ApiService.fetchCourseDetails(c.kode_course);
            return det ? { course: c, det } : null;
          }),
        );

        for (const item of courseDetails) {
          if (!item) continue;
          if (!item.det.kode_course && item.course?.kode_course) {
            item.det.kode_course = item.course.kode_course;
          }
          State.courseDataList.push(item.det);
        }

        Utils.save(Config.STORAGE_KEYS.COURSE_DATA, State.courseDataList);
        this.render();
        this.restoreForumUiState(forumUiState);

        State.notifsSynced = false;
        if (
          UIRenderer.byId("notif-tab-tab")?.classList.contains("active")
        ) {
          this.syncLecturerNotifications(State.courseDataList, true);
        }
      } catch (e) {
      } finally {
        State.isFetching = false;
        UIRenderer.setLoading(false);
      }
    },
    async syncLecturerNotifications(courseDataList, force = false) {
      if (!Array.isArray(courseDataList) || !courseDataList.length) return;
      if (State.isSyncingNotifs || (!force && State.notifsSynced)) return;
      State.isSyncingNotifs = true;
      try {
        const forumTargets = [];
        for (const course of courseDataList) {
          for (const section of course.data || []) {
            const forumSub = section.sub_section?.find(
              (sub) => sub.kode_template === "FORUM_DISKUSI" && sub.id,
            );
            if (forumSub) {
              forumTargets.push({
                courseCode: course.kode_course,
                forumSubId: forumSub.id,
              });
            }
          }
        }

        const nested = await Promise.all(
          forumTargets.map(async ({ courseCode, forumSubId }) => {
            try {
              const topicRes = await ApiService.fetchForumTopics(forumSubId);
              const topics = (topicRes?.topics || []).filter(
                (t) => t.id_trx_course_sub_section === forumSubId,
              );
              const perTopic = await Promise.all(
                topics.map(async (topic) => {
                  try {
                    const replyRes = await ApiService.fetchForumReplies(
                      topic.id,
                    );
                    const replies =
                      replyRes?.replies || replyRes?.data || [];
                    return replies
                      .filter(
                        (r) =>
                          r.role === "Lecturer" ||
                          (r.id_dosen != null && !r.nim),
                      )
                      .map((r) => {
                        const plain = ForumRenderer.cleanForumText(
                          r.konten || "",
                        );
                        const trimmed =
                          plain.length > 120
                            ? plain.substring(0, 120) + "..."
                            : plain;
                        return {
                          lecturerName:
                            r.fullname ||
                            r.dosen?.nama_dosen ||
                            r.nama_dosen ||
                            "Dosen",
                          content: trimmed,
                          url: `https://mentari.unpam.ac.id/u-courses/${courseCode}/forum/${forumSubId}/topics/${topic.id}`,
                          date: r.created_at,
                        };
                      });
                  } catch (_) {
                    return [];
                  }
                }),
              );
              return perTopic.flat();
            } catch (_) {
              return [];
            }
          }),
        );

        const notifs = nested
          .flat()
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        State.lecturerNotifications = notifs;
        Utils.save(Config.STORAGE_KEYS.LECTURER_NOTIFS, notifs);
        Renderers.notif(notifs);
        State.notifsSynced = true;
      } catch (_) {
      } finally {
        State.isSyncingNotifs = false;
      }
    },
    captureForumUiState() {
      const forum = UIRenderer.byId("forum-tab-tab");
      if (!forum) return null;

      const forumRect = forum.getBoundingClientRect();
      const anchor = Array.from(forum.querySelectorAll(".section-header"))
        .filter((header) => !header.closest("[hidden]"))
        .map((header) => ({
          header,
          rect: header.getBoundingClientRect(),
        }))
        .find(
          ({ rect }) =>
            rect.bottom > forumRect.top && rect.top < forumRect.bottom,
        );

      return {
        scrollTop: forum.scrollTop,
        anchor: anchor
          ? {
              id: anchor.header.dataset.target,
              offset: anchor.rect.top - forumRect.top,
            }
          : null,
        openSections: Array.from(
          forum.querySelectorAll(".section-content.active"),
        ).map((section) => ({
          id: section.id,
          scrollTop: section.scrollTop,
        })),
      };
    },
    restoreForumUiState(uiState) {
      if (!uiState) return;
      const forum = UIRenderer.byId("forum-tab-tab");
      if (!forum) return;

      uiState.openSections.forEach(({ id, scrollTop }) => {
        const section = UIRenderer.byId(id);
        if (!section) return;
        section.classList.add("active");
        const card = section.closest(".section-card");
        card?.querySelector(".section-toggle")?.classList.add("active");
        card
          ?.querySelector(".section-header")
          ?.setAttribute("aria-expanded", "true");
        section.scrollTop = scrollTop;
        ForumRenderer.loadSectionData(section);
      });

      const restoreScroll = () => {
        if (uiState.anchor?.id) {
          const section = UIRenderer.byId(uiState.anchor.id);
          const header = section
            ?.closest(".section-card")
            ?.querySelector(
              `.section-header[data-target="${uiState.anchor.id}"]`,
            );
          if (header) {
            const forumRect = forum.getBoundingClientRect();
            const headerRect = header.getBoundingClientRect();
            forum.scrollTop +=
              headerRect.top - forumRect.top - uiState.anchor.offset;
            return;
          }
        }
        forum.scrollTop = uiState.scrollTop;
      };

      requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
    },
    render() {
      Renderers.forum(State.courseDataList);
      Renderers.mhs(State.courseDataList);
      Renderers.notif(State.lecturerNotifications);
      Renderers.settings(
        State.userInfo || {
          fullname: "Mahasiswa UNPAM",
          username: "-",
          role: "Student",
        },
      );
    },
  };

  let activeOutsideClickHandler = null;
  let activeEscapeHandler = null;
  let outsideClickTimer = null;

  function closePopup(p) {
    if (!p) return;
    p.classList.remove("active");
    if (State.isGuideOpen) {
      UIRenderer.setGuideOpen(false);
    }
    if (outsideClickTimer) {
      clearTimeout(outsideClickTimer);
      outsideClickTimer = null;
    }
    if (activeOutsideClickHandler) {
      document.removeEventListener("mousedown", activeOutsideClickHandler);
      activeOutsideClickHandler = null;
    }
    if (activeEscapeHandler) {
      document.removeEventListener("keydown", activeEscapeHandler);
      activeEscapeHandler = null;
    }
  }

  window.toggleTokenPopup = () => {
    let p = document.getElementById("token-runner-popup");
    if (!p || !p.shadowRoot) {
      UIRenderer.createPopup();
      p = document.getElementById("token-runner-popup");
    }
    if (!p) return;

    if (!p.classList.contains("active")) {
      if (outsideClickTimer) {
        clearTimeout(outsideClickTimer);
        outsideClickTimer = null;
      }
      if (activeOutsideClickHandler) {
        document.removeEventListener("mousedown", activeOutsideClickHandler);
        activeOutsideClickHandler = null;
      }
      if (activeEscapeHandler) {
        document.removeEventListener("keydown", activeEscapeHandler);
        activeEscapeHandler = null;
      }

      document
        .getElementById("gemini-chat-container")
        ?.classList.remove("active");
      Utils.applyTheme();
      p.classList.add("active");

      activeOutsideClickHandler = (e) => {
        const path =
          typeof e?.composedPath === "function"
            ? e.composedPath()
            : [e?.target];
        const headerToggle = document.getElementById("mentari-header-toggle");
        const toastLayer = document.getElementById("mentari-toast-layer");
        const inPanel =
          path.includes(p) ||
          (e?.target && typeof p.contains === "function" && p.contains(e.target));
        const inHeader =
          headerToggle &&
          (path.includes(headerToggle) || headerToggle.contains?.(e?.target));
        const inToast =
          toastLayer &&
          (path.includes(toastLayer) || toastLayer.contains?.(e?.target));
        if (!inPanel && !inHeader && !inToast) {
          closePopup(p);
        }
      };

      activeEscapeHandler = (e) => {
        if (e.key === "Escape") {
          closePopup(p);
        }
      };

      document.addEventListener("keydown", activeEscapeHandler);
      outsideClickTimer = setTimeout(() => {
        outsideClickTimer = null;
        if (p.classList.contains("active") && activeOutsideClickHandler) {
          document.addEventListener("mousedown", activeOutsideClickHandler);
        }
      }, 50);
    } else {
      closePopup(p);
    }
  };

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => App.init());
  else App.init();
})();
