(() => {
  try {
    const rawModel = (localStorage.getItem("gemini_model") || "").replace(/"/g, "").trim();
    if (rawModel === "gemini-1.5-flash" || rawModel === "gemini-2.0-flash") {
      localStorage.removeItem("gemini_model");
    }
  } catch (_) {}

  if (!window.__MENTARI_GEMINI_FETCH_PATCHED__) {
    window.__MENTARI_GEMINI_FETCH_PATCHED__ = true;
    const origFetch = window.fetch.bind(window);
    const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite"];
    const DEPRECATED_MODELS = new Set(["gemini-1.5-flash", "gemini-2.0-flash"]);

    window.fetch = async function (input, init) {
      const urlStr = typeof input === "string" ? input : (input && input.url) || "";
      if (!urlStr.includes("generativelanguage.googleapis.com/v1beta/models/") || !urlStr.includes(":generateContent")) {
        return origFetch(input, init);
      }

      const match = urlStr.match(/models\/([^/:]+):generateContent/);
      const requestedModel = match ? match[1] : null;
      let targetUrl = urlStr;

      if (requestedModel && DEPRECATED_MODELS.has(requestedModel)) {
        targetUrl = urlStr.replace(`models/${requestedModel}:generateContent`, `models/${FALLBACK_MODELS[0]}:generateContent`);
      }

      let res = await origFetch(typeof input === "string" ? targetUrl : new Request(targetUrl, input), init);
      if (res.ok || (res.status !== 404 && res.status !== 429 && res.status !== 503)) {
        return res;
      }

      const effectiveModel = targetUrl.match(/models\/([^/:]+):generateContent/)?.[1];
      const remaining = FALLBACK_MODELS.filter((m) => m !== effectiveModel);
      for (const nextModel of remaining) {
        await new Promise((r) => setTimeout(r, 400));
        const fallbackUrl = targetUrl.replace(/models\/[^/:]+:generateContent/, `models/${nextModel}:generateContent`);
        const retryRes = await origFetch(typeof input === "string" ? fallbackUrl : new Request(fallbackUrl, input), init);
        res = retryRes;
        if (retryRes.ok) {
          return retryRes;
        }
        if (retryRes.status !== 404 && retryRes.status !== 429 && retryRes.status !== 503) {
          return retryRes;
        }
      }
      return res;
    };
  }
})();

/**
 * Mentari Assistant - Discus Helper Module
 */
(function () {
  const Config = {
    GEMINI: {
      MODEL: "gemini-3.5-flash-lite",
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
    },
    STORAGE_KEYS: {
      API_KEY: "geminiApiKey",
    },
    PROMPTS: {
      DEFAULT: (content) =>
        `Bacalah diskusi berikut, lalu tuliskan jawaban atau rangkuman yang natural, JANGAN GUNAKAN HURUF TEBAL JANGAN GUNAKAN HURUF TEBAL JANGAN BOLD JANGAN PAKE TANDA BINTANG PLAIN TEXT YG BERSIH. dan mudah dipahami seperti jawaban manusia. jangan gunakan tanda seperti (*/#) atau yg lainnya, hanya plain text yg bersih jangan gunakan bold huruf tebal, italic, underline. dan langsung jawab tanpa mengucapkan (berikut jawabannya) atau sejenisnya. Gunakan bahasa yang natural seperti manusia. Berikan penjelasan yang lengkap dan memadai sesuai konteks diskusi, jangan dibatasi jika membutuhkan penjelasan panjang. Jangan ucapkan "Tentu, ini rangkumannya:" atau semacamnya, langsung jawab saja. Jika terdapat soal atau pertanyaan yang berhubungan dengan bahasa pemrograman atau coding, berikan contoh singkat code nya. jika pertanyaannya bernomor maka buat jawaban bernomor juga, hanya pertanyaan saja\n${content}\n\nJawaban yang natural dan mengalir:`,
      REVISE: (mode, prevAnswer) => {
        const modes = {
          shorten: `Ringkas jawaban berikut menjadi lebih singkat, tetap natural dan mudah dipahami, tanpa bullet atau penomoran:\n\n${prevAnswer}`,
          paragraph: `Ubah jawaban berikut menjadi satu paragraf, tetap natural dan mudah dipahami, tanpa bullet atau penomoran:\n\n${prevAnswer}`,
          clarify: `Perjelas dan buat jawaban berikut lebih mudah dipahami, tetap natural dan tidak seperti AI, tanpa bullet atau penomoran:\n\n${prevAnswer}`,
          lengthen: `Perpanjang dan tambahkan detail pada jawaban berikut, tetap natural dan mudah dipahami, tanpa bullet atau penomoran:\n\n${prevAnswer}`,
          numbered: `Ubah jawaban berikut menjadi nomor, tetap natural dan mudah dipahami, tanpa bullet atau paragraf:\n\n${prevAnswer}`,
        };
        return modes[mode] || prevAnswer;
      },
      QUESTIONS: (content) =>
        `Bacalah diskusi berikut, lalu buatkan beberapa saran pertanyaan yang natural, relevan, dan menarik untuk diajukan pada diskusi ini. Hindari bullet, penomoran, huruf tebal, italic, underline dan buat seolah-olah pertanyaan dari manusia. Pisahkan setiap pertanyaan dengan baris baru. Pastikan setiap saran pertanyaan berdiri sendiri, tidak saling terhubung, dan tidak menggunakan kata penghubung seperti 'selain itu', 'terus', 'dan' di awal kalimat.\n\n${content}\n\nSaran pertanyaan:`,
    },
  };

  const Utils = {
    updateModelLimit(model, isLimited) {
      try {
        const statsKey = "gemini_model_stats";
        const raw = localStorage.getItem(statsKey);
        const stats = raw ? JSON.parse(raw) : {};
        if (!stats[model]) stats[model] = {};
        stats[model].limited = Boolean(isLimited);
        localStorage.setItem(statsKey, JSON.stringify(stats));
      } catch (_e) {}
    },

    getApiKey() {
      const stored = localStorage.getItem(Config.STORAGE_KEYS.API_KEY);
      if (stored) {
        try {
          return atob(stored);
        } catch (_e) {}
      }
      alert("API Key Gemini tidak ditemukan! Atur terlebih dahulu di menu Pengaturan (Mentari Assistant).");
      throw new Error("API Key missing");
    },

    extractContent(root) {
      const selectors = [
        ".ck-content",
        ".MuiBox-root",
        ".discussion-content",
        '[class*="content"]',
        "div:not([class]):not([id])",
      ];
      for (const s of selectors) {
        const elements = root.querySelectorAll(s);
        for (const el of elements) {
          if (el.textContent.trim().length < 10) continue;
          if (el.querySelector("button, a, input, select, textarea")) continue;
          return el.textContent.trim();
        }
      }
      return root.textContent.trim();
    },

    isDosen(root) {
      const elements = [
        ...(root?.querySelectorAll(
          'strong, b, [style*="font-weight:bold"], [class*="name"], [class*="user"], [class*="author"], .MuiTypography-root'
        ) || []),
      ];
      return elements.some((el) => /\b(?:,|\.)\b/i.test(el.textContent.trim()));
    },

    updateQuota(headers) {
      try {
        const quota = {
          rpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-requests"), 10),
            limit: parseInt(headers.get("x-ratelimit-limit-requests"), 10),
          },
          tpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-tokens"), 10),
            limit: parseInt(headers.get("x-ratelimit-limit-tokens"), 10),
          },
          updated: Date.now(),
        };
        if (!Number.isNaN(quota.rpm.limit)) {
          localStorage.setItem("gemini_quota", JSON.stringify(quota));
        }
      } catch (_e) {}
    },
  };

  const ApiService = {
    async callGemini(prompt) {
      const key = Utils.getApiKey();
      const modelRaw = localStorage.getItem("gemini_model") || Config.GEMINI.MODEL;
      const model = modelRaw.replace(/"/g, "").trim() || Config.GEMINI.MODEL;

      const res = await fetch(`${Config.GEMINI.ENDPOINT}/${model}:generateContent?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95, topK: 40 },
        }),
      });

      if (!res.ok) {
        if (res.status === 429) {
          Utils.updateModelLimit(model, true);
          throw new Error(
            "Rate Limit Tercapai! Kuota API model ini sudah habis. Silakan ganti Model atau API Key lain di menu Pengaturan (Mentari Assistant)."
          );
        }
        throw new Error("Gagal mendapatkan jawaban dari Gemini (periksa koneksi atau API Key).");
      }

      Utils.updateQuota(res.headers);
      Utils.updateModelLimit(model, false);
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada jawaban.";
    },
  };

  const UIRenderer = {
    injectStyles() {
      if (document.getElementById("mentari-discus-styles")) return;
      const style = document.createElement("style");
      style.id = "mentari-discus-styles";
      style.textContent = `
        .mentari-discus-box {
          margin: 10px 0 0 0;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(249, 115, 22, 0.3);
          background: rgba(18, 19, 22, 0.04);
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-sizing: border-box;
          max-width: 100%;
          overflow-wrap: anywhere;
        }
        @media (max-width: 600px) {
          .mentari-discus-box {
            padding: 10px;
            font-size: 12px;
          }
          .mentari-discus-qbox {
            padding: 12px 12px 46px 12px !important;
          }
        }
      `;
      document.head.appendChild(style);
    },

    createButton(type, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      if (type === "buat") {
        btn.className =
          "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeSmall buat-pertanyaan-btn";
        btn.style.cssText =
          "margin-right:4px;min-width:0px;padding:6px 12px;line-height:1.2;font-weight:600;border-radius:10px;background:#1b1d22;color:#fb923c;border:1px solid rgba(249,115,22,0.45);display:inline-flex;align-items:center;gap:4px;cursor:pointer;";
        btn.innerHTML =
          '<span class="MuiButton-startIcon" style="display:inline-flex;align-items:center;margin:0;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg></span><span class="MuiButton-label">Buat Pertanyaan</span>';
      } else {
        btn.className =
          "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-sizeSmall cari-jawaban-btn";
        btn.style.cssText =
          "margin-right:4px;min-width:0px;padding:6px 12px;line-height:1.2;font-weight:600;border-radius:10px;background:#f97316;color:#ffffff;border:0;display:inline-flex;align-items:center;gap:4px;cursor:pointer;";
        btn.innerHTML =
          '<span class="MuiButton-startIcon" style="display:inline-flex;align-items:center;margin:0;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span><span class="MuiButton-label">Cari Jawaban</span>';
      }
      btn.onclick = onClick;
      return btn;
    },

    createCopyButton(getText) {
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.style.cssText =
        "margin-right:0;min-width:0px;padding:6px 10px;line-height:1.2;font-weight:600;border-radius:9px;background:#22c55e;color:#ffffff;border:0;display:inline-flex;align-items:center;gap:4px;cursor:pointer;";
      copyBtn.innerHTML =
        '<span class="MuiButton-startIcon" style="margin:0;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></span><span class="MuiButton-label">Copy</span>';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(getText());
        const label = copyBtn.querySelector(".MuiButton-label");
        if (label) {
          label.innerText = "Copied!";
          setTimeout(() => {
            label.innerText = "Copy";
          }, 1200);
        }
      };
      return copyBtn;
    },

    showSaranQuestions(saranText, root, replyBtn) {
      this.injectStyles();
      let saranDiv = root.querySelector(".saran-pertanyaan-gemini");
      if (!saranDiv) {
        saranDiv = document.createElement("div");
        saranDiv.className = "saran-pertanyaan-gemini mentari-discus-box";
        replyBtn.parentElement.parentElement.appendChild(saranDiv);
      }

      const questions = saranText.split(/\n+/).filter(Boolean).slice(0, 5);
      saranDiv.innerHTML = "<b>Saran Pertanyaan:</b>";

      questions.forEach((q) => {
        const cleanQ = q.trim();
        const qWrap = document.createElement("div");
        qWrap.style.cssText = "display:flex;align-items:center;gap:6px;margin-top:4px;flex-wrap:wrap;";

        const textBox = document.createElement("div");
        textBox.className = "mentari-discus-qbox";
        textBox.textContent = cleanQ;
        textBox.style.cssText =
          "flex:1 1 200px;padding:12px 84px 12px 12px;position:relative;border-radius:10px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.22);font-size:13px;word-break:break-word;min-height:36px;line-height:1.5;";

        const copyBtn = this.createCopyButton(() => cleanQ);
        copyBtn.style.position = "absolute";
        copyBtn.style.right = "8px";
        copyBtn.style.bottom = "8px";
        copyBtn.style.zIndex = "2";
        textBox.appendChild(copyBtn);

        qWrap.appendChild(textBox);
        saranDiv.appendChild(qWrap);
      });
    },

    showJawabanBox(jawaban, replyBtn, root, content) {
      this.injectStyles();
      let resultDiv = root.querySelector(".jawaban-gemini");
      if (!resultDiv) {
        resultDiv = document.createElement("div");
        resultDiv.className = "jawaban-gemini mentari-discus-box";
        replyBtn.parentElement.parentElement.appendChild(resultDiv);
      }

      resultDiv.innerHTML = "";
      const titleEl = document.createElement("b");
      titleEl.textContent = "Jawaban:";
      resultDiv.appendChild(titleEl);

      const textEl = document.createElement("div");
      textEl.style.cssText = "margin-bottom:6px;white-space:pre-line;line-height:1.55;";
      textEl.textContent = jawaban;
      resultDiv.appendChild(textEl);

      const btnRow = document.createElement("div");
      btnRow.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;";

      btnRow.appendChild(this.createCopyButton(() => jawaban));

      const modes = [
        { m: "shorten", l: "Ringkas" },
        { m: "paragraph", l: "1 Paragraf" },
        { m: "clarify", l: "Perjelas" },
        { m: "lengthen", l: "Perpanjang" },
        { m: "numbered", l: "Nomor" },
      ];

      modes.forEach(({ m, l }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.style.cssText =
          "margin-right:0;min-width:0px;padding:6px 10px;line-height:1.2;font-weight:500;border-radius:9px;background:#1b1d22;color:#f3f4f6;border:1px solid #2a2d35;cursor:pointer;";
        btn.innerHTML = `<span class="MuiButton-label">${l}</span>`;
        btn.onclick = async () => {
          btn.disabled = true;
          btn.innerText = "Memproses...";
          try {
            const result = await ApiService.callGemini(Config.PROMPTS.REVISE(m, jawaban));
            this.showJawabanBox(result, replyBtn, root, content);
          } catch (err) {
            alert(err.message);
          }
          btn.disabled = false;
          btn.innerText = l;
        };
        btnRow.appendChild(btn);
      });

      resultDiv.appendChild(btnRow);
    },
  };

  const App = {
    async handleBuatPertanyaan(btn, root, replyBtn) {
      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerText = "Memproses...";
      try {
        const content = Utils.extractContent(root);
        const saran = await ApiService.callGemini(Config.PROMPTS.QUESTIONS(content));
        UIRenderer.showSaranQuestions(saran, root, replyBtn);
      } catch (err) {
        alert(err.message);
      }
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    },

    async handleCariJawaban(btn, root, replyBtn) {
      btn.disabled = true;
      const originalHtml = btn.innerHTML;
      btn.innerText = "Memproses...";
      try {
        const content = Utils.extractContent(root);
        const jawaban = await ApiService.callGemini(Config.PROMPTS.DEFAULT(content));
        UIRenderer.showJawabanBox(jawaban, replyBtn, root, content);
      } catch (err) {
        alert(err.message);
      }
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    },

    injectButtons() {
      document.querySelectorAll(".MuiStack-root .MuiButton-root.MuiButton-containedSuccess").forEach((replyBtn) => {
        if (replyBtn.parentElement.querySelector(".cari-jawaban-btn")) return;
        const root = replyBtn.closest(".MuiPaper-root, .discussion-post, [role='article']") || replyBtn.closest("div");

        if (replyBtn.parentElement) {
          replyBtn.parentElement.style.flexWrap = "wrap";
          replyBtn.parentElement.style.gap = "6px";
        }

        if (Utils.isDosen(root)) {
          const buatBtn = UIRenderer.createButton("buat", () => this.handleBuatPertanyaan(buatBtn, root, replyBtn));
          replyBtn.parentElement.insertBefore(buatBtn, replyBtn);
        }

        const cariBtn = UIRenderer.createButton("cari", () => this.handleCariJawaban(cariBtn, root, replyBtn));
        replyBtn.parentElement.insertBefore(cariBtn, replyBtn);
      });
    },

    init() {
      this.injectButtons();
      new MutationObserver(() => this.injectButtons()).observe(document.body, {
        childList: true,
        subtree: true,
      });
    },
  };

  App.init();
})();
