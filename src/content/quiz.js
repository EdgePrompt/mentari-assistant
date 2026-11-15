(() => {
  // =============================================================
  // Mentari Quiz Helper - Auto Finish Quiz
  // =============================================================

  const CONFIG = {
    GEMINI: {
      MODEL: "gemini-3.5-flash-lite",
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models",
      TEMPERATURE: 0.2,
      TOP_P: 0.85,
      TOP_K: 30,
      MAX_TOKENS: 1024,
      SYSTEM_PROMPT: [
        "Kamu adalah asisten akademik ahli untuk menjawab soal pilihan ganda Mahasiswa Universitas Pamulang (UNPAM).",
        "",
        "TUGAS:",
        "1. Baca soal dengan SANGAT teliti. Perhatikan kata negasi seperti 'kecuali', 'yang bukan', 'tidak', 'bukan', 'salah', 'terkecuali' — jangan terbalik.",
        "2. Perhatikan angka, tabel, tanda baca, dan satuan dengan cermat.",
        "3. Bandingkan SETIAP pilihan A-E satu per satu. Eliminasi yang jelas salah dulu, lalu pilih yang paling tepat.",
        "4. Pilih TEPAT SATU jawaban. Jangan mengarang pilihan baru. Jangan ubah urutan pilihan. Jangan menjawab lebih dari satu huruf.",
        "5. Berikan penalaran singkat (2-3 kalimat) mengapa pilihan itu benar dan yang lain salah.",
        "",
        "FORMAT WAJIB - BARIS TERAKHIR HARUS PERSIS:",
        "ANSWER: X",
        "di mana X adalah SATU huruf kapital A, B, C, D, atau E.",
        "Contoh baris terakhir yang benar: ANSWER: C",
        "Jangan tambahkan teks apapun setelah baris ANSWER. Jangan gunakan markdown (** , * , _) di baris ANSWER."
      ].join("\n")
    },
    API: {
      BASE_URL: "https://mentari.unpam.ac.id/api",
      QUIZ_ENDPOINT: (id) => `https://mentari.unpam.ac.id/api/quiz/soal/${id}`
    },
    SELECTORS: {
      START_BUTTON: "button.MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedPrimary",
      CONFIRM_BUTTON: "button.MuiButtonBase-root.MuiButton-root.MuiButton-outlined.MuiButton-outlinedPrimary svg[data-testid=\"ThumbUpOffAltRoundedIcon\"]",
      // Note: :contains is invalid CSS; Selesai Quiz handling is done via textContent search in clickNextButton()
      AUTO_FINISH_QUIZ_BUTTONS: [
        "button:has(svg[data-testid=\"DoneAllIcon\"])"
      ]
    },
    POLL_INTERVAL_MS: 1000
  };

  // ---------------- Utils ----------------
  const Utils = {
    delay: (ms) => new Promise((r) => setTimeout(r, ms)),

    stripOptionPrefix(text) {
      if (!text || typeof text !== "string") return "";
      // Strips redundant prefixes like "B. ", "(A) ", "1. ", "A - ", etc.
      return text.replace(/^(\s*[\(\[]?[A-Ea-e0-9][\)\]\.\-:]\s*)+/i, "").trim();
    },

    getGeminiApiKey() {
      const raw = localStorage.getItem("geminiApiKey");
      if (raw) {
        try { return atob(raw); } catch (_) { return raw; }
      }
      // Show error UI like original
      const el = document.createElement("div");
      el.style = "position:fixed;top:20px;right:20px;background:#2a2a2a;border:1px solid #444;color:#ff6b6b;padding:12px 16px;border-radius:8px;z-index:99999;font-size:13px;";
      el.innerHTML = '<div style="display:flex;align-items:center;gap:10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>API Key tidak ditemukan. Pastikan Anda telah mengatur API Key di Settings.</span></div>';
      document.body.appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.5s"; setTimeout(() => el.remove(), 500); }, 5000);
      throw new Error("Gemini API Key not found in localStorage");
    },

    getToken() {
      const raw = localStorage.getItem("access");
      if (!raw) throw new Error("Token akses tidak ditemukan");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed[0]?.token) throw new Error("Struktur token tidak valid");
      return parsed[0].token;
    },

    getQuizId() {
      return window.location.href.split("/").pop().split("?")[0].split("#")[0];
    },

    getQuizCache(quizId) {
      if (!quizId) return {};
      try {
        return JSON.parse(sessionStorage.getItem("mentari_quiz_cache_" + quizId) || "{}");
      } catch (_) {
        return {};
      }
    },

    saveQuizCache(quizId, questionId, answer, explanation) {
      if (!quizId || !questionId || !answer) return;
      try {
        const cache = this.getQuizCache(quizId);
        cache[questionId] = { answer, explanation, ts: Date.now() };
        sessionStorage.setItem("mentari_quiz_cache_" + quizId, JSON.stringify(cache));
      } catch (_) {}
    },

    // Preserves original cleanText behavior (HTML -> plain text, table handling)
    cleanText(html) {
      if (!html) return "";
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      // Handle tables -> text table
      tmp.querySelectorAll("table").forEach((table) => {
        let txt = "\n";
        table.querySelectorAll("tr").forEach((tr, idx) => {
          const row = Array.from(tr.querySelectorAll("th, td")).map((c) => c.textContent.trim()).join(" | ");
          txt += row + "\n";
          if (idx === 0 && tr.querySelectorAll("th").length > 0) {
            txt += "-".repeat(row.length) + "\n";
          }
        });
        txt += "\n";
        const pre = document.createElement("pre");
        pre.textContent = txt;
        table.parentNode.replaceChild(pre, table);
      });
      return tmp.innerHTML
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n=== $1 ===\n\n")
        .replace(/<strong>(.*?)<\/strong>/gi, "*$1*")
        .replace(/<em>(.*?)<\/em>/gi, "_$1_")
        .replace(/<\/p>/g, "\n\n")
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<ul[^>]*>/g, "\n")
        .replace(/<\/ul>/g, "\n")
        .replace(/<ol[^>]*>/g, "\n")
        .replace(/<\/ol>/g, "\n")
        .replace(/<li>/g, "• ")
        .replace(/<\/li>/g, "\n")
        .replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, "[IMG: $1]")
        .replace(/<img[^>]*>/gi, "[IMG]")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();
    },

    showError(msg) {
      const el = document.createElement("div");
      el.style = "position:fixed;top:20px;right:20px;background:#2a2a2a;border:1px solid #444;color:#ff6b6b;padding:12px 16px;border-radius:8px;z-index:99999;font-size:13px;max-width:400px;";
      el.innerHTML = `<div style="display:flex;align-items:center;gap:10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><span>${msg}</span></div>`;
      document.body.appendChild(el);
      setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity 0.5s"; setTimeout(() => el.remove(), 500); }, 5000);
    },

    updateQuota(headers) {
      try {
        const data = {
          rpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-requests") || headers.get("X-Ratelimit-Remaining-Requests") || ""),
            limit: parseInt(headers.get("x-ratelimit-limit-requests") || headers.get("X-Ratelimit-Limit-Requests") || "")
          },
          tpm: {
            remaining: parseInt(headers.get("x-ratelimit-remaining-tokens") || ""),
            limit: parseInt(headers.get("x-ratelimit-limit-tokens") || "")
          },
          updated: Date.now()
        };
        if (!isNaN(data.rpm.limit)) {
          localStorage.setItem("gemini_quota", JSON.stringify(data));
        }
      } catch (_) {}
    },

    // Extract A-E answer marker from Gemini response (returns null if ambiguous)
    parseAnswer(text) {
      if (!text || typeof text !== "string") return null;
      const t = text.trim();
      if (!t) return null;

      // 1. Direct single-letter response (strict retry prompt like "Return ONLY one letter: A, B, C, D, or E")
      // Handles: "B", "**B**", "B.", "(B)", "[B]", "b", "Option B", "Pilihan B"
      const cleanSingle = t.replace(/[*_~`]/g, "").trim();
      const directMatch = cleanSingle.match(/^(?:option|pilihan|opsi)?\s*[\(\[]?\s*([A-Ea-e])\s*[\)\]\.]?$/i);
      if (directMatch) {
        return directMatch[1].toUpperCase();
      }

      const lines = t.split("\n").map(l => l.trim()).filter(Boolean);
      let lastLetter = null;

      // 2. Keyword-based matching on single lines: ANSWER: X, JAWABAN: X, Kunci: X, Kesimpulan: X
      const keywordRegex = /\*{0,2}\b(?:ANSWER|JAWABAN|KUNCI(?:\s+JAWABAN)?|KESIMPULAN)\b\*{0,2}[ \t]*[:=\-]?[ \t]*\*{0,2}[\(\[]?\s*([A-E])\b/i;
      for (const line of lines) {
        const m = line.match(keywordRegex);
        if (m && /^[A-E]$/.test(m[1].toUpperCase())) {
          lastLetter = m[1].toUpperCase();
        }
      }
      if (lastLetter) return lastLetter;

      // 3. Conversational phrases in Indonesian or English (e.g. Gemini explanation when retry token isn't truncated)
      // Pattern A: "option B is correct" / "pilihan C benar"
      const optFirstRegex = /\b(?:option|pilihan|opsi)\s+([A-E])\s+(?:is\s+)?(?:correct|benar|tepat)\b/i;
      // Pattern B: "correct option is C" / "jawaban yang tepat adalah: A" / "pilihan yang benar adalah D"
      const phraseFirstRegex = /\b(?:correct\s+(?:option|answer)|(?:pilihan|opsi|jawaban)\s+(?:yang\s+)?(?:benar|tepat)|jawaban(?:nya)?)\b\s*(?:is|adalah|yaitu|:|=|-|\s)*\s*[\(\[]?\s*([A-E])\b/i;

      for (const line of lines) {
        const m1 = line.match(optFirstRegex);
        if (m1 && /^[A-E]$/.test(m1[1].toUpperCase())) lastLetter = m1[1].toUpperCase();
        const m2 = line.match(phraseFirstRegex);
        if (m2 && /^[A-E]$/.test(m2[1].toUpperCase())) lastLetter = m2[1].toUpperCase();
      }
      if (lastLetter) return lastLetter;

      // 4. Last line inspection: if prompt ended with single letter or "Jadi / Jawaban: X"
      if (lines.length > 0) {
        const lastLine = lines[lines.length - 1].replace(/[*_~`]/g, "").trim();
        const lastLineMatch = lastLine.match(/^(?:(?:jadi|maka|kesimpulan|jawaban(?:nya)?)\s*(?:adalah|:|=)?\s*)?[\(\[]?\s*([A-E])\s*[\)\]\.]?$/i);
        if (lastLineMatch) {
          return lastLineMatch[1].toUpperCase();
        }
      }

      return null;
    }
  };

  // ---------------- API ----------------
  const Api = {
    async fetchQuiz(token, quizId) {
      const res = await fetch(CONFIG.API.QUIZ_ENDPOINT(quizId), {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        },
        cache: "no-store"
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json?.data) return json;
      return null;
    },

    // Query Gemini with fallback models and one strict retry if answer marker is missing
    async askGeminiSingle(apiKey, question, options) {
      const FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
      const rawPref = (localStorage.getItem("gemini_model") || "").replace(/"/g, "").trim();
      const storedRaw = (rawPref === "gemini-1.5-flash" || rawPref === "gemini-2.0-flash") ? "" : rawPref;
      // Build ordered list: stored preference first, then fallback chain without duplicates
      const modelsToTry = storedRaw ? [storedRaw, ...FALLBACK_MODELS.filter((m) => m !== storedRaw)] : [...FALLBACK_MODELS];
      // Use CONFIG default as primary if no stored
      if (!storedRaw && modelsToTry[0] !== CONFIG.GEMINI.MODEL) modelsToTry.unshift(CONFIG.GEMINI.MODEL);
      let modelIdx = 0;
      let model = modelsToTry[modelIdx];
      const optionsText = options.map((opt, i) => `  ${String.fromCharCode(65 + i)}. ${opt}`).join("\n");
      const basePrompt = `${CONFIG.GEMINI.SYSTEM_PROMPT}\n\nSOAL:\n${question}\n\nPilihan Jawaban:\n${optionsText}`;

      for (let attempt = 0; attempt < 2; attempt++) {
        const isRetry = attempt === 1;
        const promptText = isRetry
          ? `SOAL:\n${question}\n\nPILIHAN JAWABAN:\n${optionsText}\n\nPERINTAH TEGAS:\nPilih tepat satu jawaban. DILARANG menulis kata pengantar seperti "Based on" atau penjelasan. Tulis jawaban di baris terakhir persis:\nANSWER: X\n(di mana X adalah satu huruf A, B, C, D, atau E).`
          : basePrompt;

        // For retry, provide enough tokens (120) so any conversational lead-in is not truncated
        const genConfig = isRetry
          ? { temperature: 0.1, topP: 0.8, topK: 20, maxOutputTokens: 120 }
          : { temperature: CONFIG.GEMINI.TEMPERATURE, topP: CONFIG.GEMINI.TOP_P, topK: CONFIG.GEMINI.TOP_K, maxOutputTokens: CONFIG.GEMINI.MAX_TOKENS };

        try {
          const res = await fetch(`${CONFIG.GEMINI.ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              generationConfig: genConfig
            })
          });

          if (!res.ok) {
            const errText = await res.text().catch(() => "");
            // Fallback on 404 (not found), 429 (rate limit), or 503 (overloaded)
            if ((res.status === 404 || res.status === 429 || res.status === 503) && modelIdx + 1 < modelsToTry.length) {
              const next = modelsToTry[modelIdx + 1];
              console.warn(`[Quiz] Model ${model} HTTP ${res.status}, falling back to ${next}.`);
              modelIdx++;
              model = next;
              // Persist fallback only if no explicit user preference
              if (!storedRaw) localStorage.setItem("gemini_model", `"${model}"`);
              // Retry immediately with fallback model without consuming attempt
              attempt--;
              await Utils.delay(500);
              continue;
            }
            throw new Error(`API Error ${res.status} ${errText.slice(0,200)}`);
          }

          Utils.updateQuota(res.headers);
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          const letter = Utils.parseAnswer(rawText);
          if (letter) {
            return { letter: letter.toLowerCase(), explanation: rawText };
          }

          // Parsing failed
          if (!isRetry) {
            console.warn(`[Quiz] Parse failed (attempt 1), retrying with strict prompt. Raw:`, rawText.slice(0, 500));
            continue; // retry once
          } else {
            console.warn(`[Quiz] Parse failed after retry. Raw:`, rawText.slice(0, 500));
            return { letter: null, explanation: rawText || "(empty response)" };
          }
        } catch (e) {
          console.error(`[Quiz] askGeminiSingle error attempt ${attempt + 1} model=${model}:`, e);
          // If network/model error and we have fallback model, try it
          if (e.message && e.message.includes("404") && modelIdx + 1 < modelsToTry.length && attempt === 0) {
            const next = modelsToTry[modelIdx + 1];
            console.warn(`[Quiz] Falling back model after error: ${model} -> ${next}`);
            modelIdx++;
            model = next;
            if (!storedRaw) localStorage.setItem("gemini_model", `"${model}"`);
            continue;
          }
          if (!isRetry) {
            await Utils.delay(1500);
            continue;
          }
          return { letter: null, explanation: e.message || "API error" };
        }
      }
      return { letter: null, explanation: "Failed after 2 attempts" };
    }
  };

  // ---------------- UI ----------------
  const UI = {
    popup: null,
    content: null,

    createPopup() {
      const wrap = document.createElement("div");
      wrap.style = "position:fixed;top:20px;right:20px;width:420px;max-height:85vh;background:#1e1e1e;border:1px solid #333;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:99998;display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,sans-serif;";
      const header = document.createElement("div");
      header.style = "padding:12px 16px;background:#2a2a2a;border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center;cursor:move;user-select:none;";
      header.innerHTML = `
        <div style="font-weight:600;color:#fff;font-size:13px;">Quiz Helper</div>
        <div style="display:flex;gap:8px;">
          <button id="toggle-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;">−</button>
          <button id="close-popup" style="background:none;border:none;color:#999;cursor:pointer;padding:0;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:16px;">×</button>
        </div>`;
      const body = document.createElement("div");
      body.id = "quiz-helper-content";
      body.style = "padding:14px;overflow-y:auto;flex:1;max-height:70vh;";
      const style = document.createElement("style");
      style.textContent = `
        #toggle-popup:hover, #close-popup:hover { color: #fff !important; }
        .q-tooltip { background: #1e1e1e !important; border-color: #444 !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(76,175,80,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(76,175,80,0.5); }
        .mode-btn { padding: 4px 8px; border-radius: 4px; border: 1px solid #444; background: #2a2a2a; color: #888; font-size: 10px; cursor: pointer; }
        .mode-btn.active { background: rgba(76,175,80,0.2); border-color: #4CAF50; color: #4CAF50; font-weight: bold; }
      `;
      document.head.appendChild(style);
      wrap.appendChild(header);
      wrap.appendChild(body);
      document.body.appendChild(wrap);
      this._makeDraggable(wrap, header);
      this._initToggle(wrap, body);
      this.popup = wrap;
      this.content = body;
      return { element: wrap, content: body, remove: () => wrap.remove() };
    },

    _makeDraggable(el, handle) {
      let dragging = false, offX, offY;
      handle.addEventListener("mousedown", (e) => {
        dragging = true;
        offX = e.clientX - el.getBoundingClientRect().left;
        offY = e.clientY - el.getBoundingClientRect().top;
      });
      document.addEventListener("mousemove", (e) => {
        if (!dragging) return;
        el.style.left = (e.clientX - offX) + "px";
        el.style.top = (e.clientY - offY) + "px";
        el.style.right = "auto";
      });
      document.addEventListener("mouseup", () => dragging = false);
    },

    _initToggle(wrap, body) {
      let collapsed = false;
      document.getElementById("toggle-popup").addEventListener("click", () => {
        collapsed = !collapsed;
        body.style.display = collapsed ? "none" : "block";
        wrap.style.height = collapsed ? "auto" : "";
        document.getElementById("toggle-popup").textContent = collapsed ? "+" : "−";
      });
      document.getElementById("close-popup").addEventListener("click", () => wrap.remove());
    },

    showLoading(container) {
      container.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="width:60px;height:60px;margin:0 auto 15px;background:#2a2a2a;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid #333;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2"><path d="M12 2v8M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h8M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;">Memuat Quiz</div>
          <div style="color:#999;font-size:13px;">Mohon tunggu sebentar...</div>
          <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;margin-top:12px;position:relative;">
            <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:quiz-pulse 1.5s ease-in-out infinite;"></div>
          </div>
          <style>@keyframes quiz-pulse { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }</style>
        </div>`;
    },

    showScanning(container) {
      container.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:16px;font-weight:500;color:#4CAF50;margin-bottom:8px;">Memeriksa Quiz...</div>
          <div style="color:#999;font-size:13px;">Mencari tombol "Mulai Quiz"</div>
          <div style="width:100%;height:4px;background:#2a2a2a;border-radius:2px;overflow:hidden;margin-top:12px;position:relative;">
            <div style="position:absolute;top:0;left:0;width:30%;height:100%;background:#4CAF50;animation:quiz-pulse 0.8s ease-in-out infinite;"></div>
          </div>
        </div>`;
    },

    initAnswerContainer(container) {
      container.innerHTML = `
        <div style="margin-bottom:10px;">
          <div id="progress-text" style="font-size:12px;margin-bottom:6px;color:#999;font-weight:500;">Mencari jawaban...</div>
          <div style="width:100%;height:4px;background-color:#2a2a2a;border-radius:2px;overflow:hidden;">
            <div id="progress-bar" style="height:100%;width:0%;background-color:#4CAF50;transition:width 0.2s ease;"></div>
          </div>
        </div>
        <div style="background:rgba(240,173,78,0.08);border:1px solid rgba(240,173,78,0.25);border-radius:6px;padding:8px 10px;margin-bottom:10px;font-size:11px;color:#f0ad4e;line-height:1.5;display:flex;align-items:flex-start;gap:8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f0ad4e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div><strong>Catatan:</strong> Jawaban AI bisa saja kurang tepat. Gunakan sebagai referensi, bukan patokan utama — tetap baca soal dan cek jawabannya sendiri ya!</div>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:10px;">
          <button id="copy-all-questions" style="flex:1;padding:7px;background:#2a2a2a;border:1px solid #444;border-radius:6px;color:#ccc;font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">Salin</button>
          <div style="display:flex;gap:2px;background:#2a2a2a;padding:2px;border-radius:6px;border:1px solid #444;">
            <button class="mode-btn active" data-mode="1" title="Mode Ringkas">R</button>
            <button class="mode-btn" data-mode="2" title="Mode Standar">S</button>
            <button class="mode-btn" data-mode="3" title="Mode Detail">D</button>
          </div>
        </div>
        <div id="answers-container" style="max-height:420px;overflow-y:auto;padding-right:4px;"></div>
        <div style="display:none;justify-content:space-between;margin-top:10px;">
          <label style="display:flex;align-items:center;font-size:12px;color:#999;"><input type="checkbox" id="auto-answer" checked style="margin-right:5px;"> Auto-jawab</label>
          <label style="display:flex;align-items:center;font-size:12px;color:#999;"><input type="checkbox" id="auto-next" checked style="margin-right:5px;"> Auto-next</label>
        </div>`;
      document.getElementById("copy-all-questions").addEventListener("click", () => App.copyAllQuestions());
      container.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const m = parseInt(btn.dataset.mode);
          if (App.viewMode === m) return;
          App.viewMode = m;
          container.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          App.renderAllQuestions();
        });
      });
    },

    createQuestionItem(index, questionId, statusText) {
      const div = document.createElement("div");
      div.dataset.questionId = questionId;
      div.style = "padding:8px 12px;margin-bottom:8px;border-radius:6px;background-color:#2a2a2a;position:relative;border-left:3px solid #333;";
      div.innerHTML = `<small>${index + 1}. <span style="color:#ffcc5c;">${statusText}</span></small>`;
      return div;
    },

    updateQuestionItem(el, data) {
      const { answer, number, options, question, explanation, index } = data;
      const viewMode = App.viewMode;
      if (answer) {
        const letter = answer.toUpperCase();
        const idx = letter.charCodeAt(0) - 65;
        const correctText = options[idx] || "";
        el.style.borderLeftColor = "#4CAF50";
        el.style.padding = viewMode === 1 ? "6px 12px" : "10px 12px";
        let html = "";
        if (viewMode === 1) {
          html = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;">
                <span style="color:#888;margin-right:4px;">${number}.</span>
                <span style="background:#4CAF50;color:#fff;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;margin-right:6px;">${letter}</span>
                <span style="color:#ddd;">${correctText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
              </div>
              <button class="apply-answer" data-index="${index}" data-letter="${answer}" style="padding:2px 8px;background:#4CAF50;border:none;border-radius:4px;color:white;font-size:9px;cursor:pointer;">Set</button>
            </div>`;
        } else {
          html = `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div style="flex:1;">
                <span style="font-size:11px;color:#4CAF50;font-weight:700;text-transform:uppercase;">Soal ${number}</span>
                <span style="margin-left:8px;background:#4CAF50;color:#fff;font-size:11px;font-weight:700;padding:1px 7px;border-radius:10px;">${letter}</span>
              </div>
              <div style="display:flex;gap:5px;flex-shrink:0;">
                <button class="apply-answer" data-index="${index}" data-letter="${answer}" title="Pilih jawaban ini" style="padding:3px 8px;background:#4CAF50;border:none;border-radius:4px;color:white;font-size:10px;cursor:pointer;">Pilih</button>
                <div class="info-button" title="Lihat penjelasan AI" style="width:22px;height:22px;border-radius:50%;background:#333;color:#aaa;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;font-weight:700;">i</div>
              </div>
            </div>
            <div style="font-size:12px;color:#ddd;line-height:1.5;margin-bottom:8px;white-space:pre-wrap;word-break:break-word;">${question.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:${viewMode === 3 ? "8px" : "0"};">
              ${options.map((opt, i) => {
                const l = String.fromCharCode(65 + i);
                const isCorrect = l === letter;
                return `<div style="display:flex;align-items:flex-start;gap:6px;padding:4px 7px;border-radius:5px;font-size:11px;background:${isCorrect ? "rgba(76,175,80,0.12)" : "rgba(255,255,255,0.03)"};border:1px solid ${isCorrect ? "rgba(76,175,80,0.3)" : "rgba(255,255,255,0.05)"};">
                  <span style="font-weight:700;color:${isCorrect ? "#4CAF50" : "#888"};flex-shrink:0;min-width:14px;">${l}.</span>
                  <span style="color:${isCorrect ? "#ccc" : "#999"};line-height:1.4;">${opt.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>
                </div>`;
              }).join("")}
            </div>`;
          if (viewMode === 3) {
            html += `
              <div style="padding:8px 10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.05);border-radius:6px;font-size:11px;color:#999;line-height:1.5;">
                <div style="font-weight:600;color:#4CAF50;margin-bottom:4px;font-size:10px;display:flex;align-items:center;gap:4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  PENJELASAN AI
                </div>
                ${explanation.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}
              </div>`;
          }
        }
        el.innerHTML = html;
        const btn = el.querySelector(".apply-answer");
        if (btn) {
          btn.addEventListener("click", () => {
            if (Core.selectRadioAnswer(parseInt(btn.dataset.index), btn.dataset.letter) && document.getElementById("auto-next")?.checked) {
              setTimeout(() => Core.clickNextButton(), 500);
            }
          });
        }
        const info = el.querySelector(".info-button");
        if (info) {
          info.addEventListener("mouseenter", () => {
            info.style.backgroundColor = "#4CAF50";
            info.style.color = "#fff";
            const tip = document.createElement("div");
            tip.className = "q-tooltip explanation-tooltip";
            tip.style = "position:fixed;width:320px;padding:12px;background:#1e1e1e;border:1px solid #444;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.5);z-index:10001;font-size:12px;white-space:pre-wrap;max-height:350px;overflow-y:auto;line-height:1.5;";
            tip.innerHTML = `<div style="display:flex;align-items:center;gap:6px;font-weight:600;color:#4CAF50;margin-bottom:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg><span>Penjelasan AI:</span></div><div style="color:#ccc;">${explanation.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}</div><div style="margin-top:8px;padding-top:8px;border-top:1px solid #333;font-size:10px;color:#888;display:flex;align-items:center;gap:5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Jawaban AI mungkin tidak selalu tepat.</span></div>`;
            document.body.appendChild(tip);
            const r = info.getBoundingClientRect();
            tip.style.top = Math.min(r.bottom + 6, window.innerHeight - 360) + "px";
            tip.style.left = Math.max(10, Math.min(r.left - 280, window.innerWidth - 340)) + "px";
            info._tip = tip;
          });
          info.addEventListener("mouseleave", () => {
            info.style.backgroundColor = "#333";
            info.style.color = "#aaa";
            if (info._tip) { info._tip.remove(); info._tip = null; }
            document.querySelector(".explanation-tooltip")?.remove();
          });
        }
      } else {
        // No answer found -> show unresolved, DO NOT auto-select
        el.style.borderLeftColor = "#f44336";
        el.innerHTML = `<div style="color:#fff;font-size:12px;padding:4px 0;">${number}. <span style="color:#f44336;font-weight:500;">Gagal mendapatkan jawaban</span> <span style="color:#999;font-size:11px;">— silakan pilih manual. AI raw: ${String(explanation||"").slice(0,120).replace(/</g,"&lt;")}</span></div>`;
      }
    }
  };

  // ---------------- Core ----------------
  const Core = {
    selectRadioAnswer(qIndex, letter) {
      if (!letter || !/^[a-eA-E]$/.test(letter)) return false;
      const numVal = letter.toLowerCase().charCodeAt(0) - 97; // 0-4

      // Strategy 1: Find standard MUI radiogroup or container
      const radioGroups = document.querySelectorAll('[role="radiogroup"], .MuiRadioGroup-root, .MuiFormGroup-root');
      for (const group of radioGroups) {
        const labels = group.querySelectorAll('.MuiFormControlLabel-root');
        if (labels.length > numVal) {
          const target = labels[numVal];
          const input = target.querySelector('input[type="radio"]');
          if (input) {
            input.checked = true;
            input.dispatchEvent(new Event("change", { bubbles: true }));
            input.click();
            return true;
          }
          target.click();
          return true;
        }
      }

      // Strategy 2: Specific selectors
      const selectors = [
        `.MuiStack-root.css-1kic1uf .MuiFormControlLabel-root:nth-child(${numVal + 1}) input`,
        `.MuiStack-root.css-1kic1uf .MuiFormControlLabel-root:nth-child(${numVal + 1}) .MuiRadio-root`,
        `input[type="radio"][name="jawaban[${qIndex}]"][value="${numVal}"]`,
        `input[type="radio"][name="soal_${qIndex + 1}"][value="${numVal}"]`,
        `input[type="radio"][value="${numVal}"][data-question-id="${qIndex + 1}"]`,
        `.question-container:nth-child(${qIndex + 1}) input[type="radio"]:nth-child(${numVal + 1})`,
        `#question-${qIndex + 1} input[type="radio"][value="${numVal}"]`,
        `form .MuiRadio-root:nth-of-type(${numVal + 1}) input`,
        `.css-1675apn .MuiFormControlLabel-root:nth-child(${numVal + 1}) input`,
        `[name^="jawaban"][value="${numVal}"]`
      ];

      for (const sel of selectors) {
        try {
          const el = document.querySelector(sel);
          if (el) {
            const input = el.tagName === "INPUT" ? el : el.querySelector('input[type="radio"]') || el;
            if (input && input.tagName === "INPUT") {
              input.checked = true;
              input.dispatchEvent(new Event("input", { bubbles: true }));
              input.dispatchEvent(new Event("change", { bubbles: true }));
              input.click();
              return true;
            } else if (el) {
              el.click();
              return true;
            }
          }
        } catch (_) {}
      }

      // Strategy 3: Fallback by index on all radios
      const allRadios = Array.from(document.querySelectorAll('input[type="radio"]'));
      if (allRadios.length > numVal && allRadios.length <= 5) {
        const r = allRadios[numVal];
        r.checked = true;
        r.dispatchEvent(new Event("change", { bubbles: true }));
        r.click();
        return true;
      }

      return false;
    },

    clickNextButton() {
      const allButtons = Array.from(document.querySelectorAll("button, [role=\"button\"]"));
      
      // 1. Icon-based Next (KeyboardTabIcon, ArrowForward, NavigateNext)
      const iconNext = allButtons.find(b => {
        if (b.disabled || b.offsetParent === null) return false;
        const text = (b.textContent || "").toLowerCase();
        if (text.includes("selesai") || text.includes("finish") || text.includes("kirim")) return false;
        return !!b.querySelector("svg[data-testid=\"KeyboardTabIcon\"], svg[data-testid=\"ArrowForwardIcon\"], svg[data-testid=\"NavigateNextIcon\"]");
      });
      if (iconNext) {
        iconNext.click();
        return true;
      }

      // 2. Text-based Next: "Selanjutnya", "Next", "Berikutnya"
      const textNext = allButtons.find(b => {
        if (b.disabled || b.offsetParent === null) return false;
        const text = (b.textContent || "").trim().toLowerCase();
        if (text.includes("selesai") || text.includes("finish") || text.includes("kirim")) return false;
        return text === "next" || text === "selanjutnya" || text.includes("selanjutnya") || text.startsWith("next");
      });
      if (textNext) {
        textNext.click();
        return true;
      }

      return false;
    },

    _watchConfirmDialog(onConfirmed) {
      let confirmed = false;
      setTimeout(() => {
        const sel = CONFIG.SELECTORS.CONFIRM_BUTTON;
        const getBtn = () => document.querySelector(sel)?.closest("button");
        const triggerConfirm = (btn, obs) => {
          if (confirmed) return;
          confirmed = true;
          btn.click();
          obs?.disconnect();
          if (typeof onConfirmed === "function") {
            setTimeout(() => onConfirmed(), 800);
          }
        };
        const obs = new MutationObserver((_, o) => {
          const b = getBtn();
          if (b) triggerConfirm(b, o);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        const cur = getBtn();
        if (cur) triggerConfirm(cur, obs);
        // Fallback if no confirm dialog appeared (direct submit)
        setTimeout(() => {
          if (!confirmed) {
            obs.disconnect();
            if (typeof onConfirmed === "function") onConfirmed();
          }
        }, 4000);
      }, 500);
    },

    _manualWatchAttached: false,

    isWebNilaiPage() {
      if (/\/u-courses\/.*\/quiz\//.test(window.location.href)) return true;
      if (this.hasActiveQuizQuestions()) return false;
      const bodyText = document.body?.innerText || "";
      return bodyText.includes("Detail Pengerjaan Quiz") || bodyText.includes("List Data Peserta");
    },

    hasActiveQuizQuestions() {
      return document.querySelectorAll('input[type="radio"], .MuiRadio-root, [role="radiogroup"]').length > 0;
    },

    watchManualSubmitAndRetake() {
      if (this._manualWatchAttached) return;
      this._manualWatchAttached = true;
      document.addEventListener("click", (e) => {
        const btn = e.target?.closest?.("button, [role=\"button\"]");
        if (!btn) return;
        const text = (btn.textContent || "").trim().toLowerCase();
        const isSelesai = text.includes("selesai quiz") || !!btn.querySelector('svg[data-testid="DoneAllIcon"]');
        if (isSelesai) {
          const qId = App.quizId || Utils.getQuizId();
          if (qId) sessionStorage.setItem("mentari_quiz_submitted_" + qId, "true");
          this._watchConfirmDialog(() => App.closeAndFinish("Quiz berhasil disubmit"));
          return;
        }
        if (text.includes("kerjakan quiz") || text.includes("mulai quiz")) {
          const qId = Utils.getQuizId();
          if (qId) sessionStorage.removeItem("mentari_quiz_submitted_" + qId);
          App._isCompleted = false;
        }
      }, true);
    },

    finishQuiz() {
      const qId = App.quizId || Utils.getQuizId();
      const allBtns = Array.from(document.querySelectorAll("button"));
      const selesaiBtn = allBtns.find(
        (b) => (b.textContent || "").includes("Selesai Quiz") && !b.disabled && b.offsetParent !== null
      );
      if (selesaiBtn) {
        if (qId) sessionStorage.setItem("mentari_quiz_submitted_" + qId, "true");
        selesaiBtn.click();
        this._watchConfirmDialog(() => App.closeAndFinish("Quiz berhasil disubmit otomatis"));
        return true;
      }
      for (const sel of CONFIG.SELECTORS.AUTO_FINISH_QUIZ_BUTTONS) {
        try {
          const els = document.querySelectorAll(sel);
          for (const el of els) {
            if (el && !el.disabled && el.offsetParent !== null) {
              if (qId) sessionStorage.setItem("mentari_quiz_submitted_" + qId, "true");
              el.click();
              this._watchConfirmDialog(() => App.closeAndFinish("Quiz berhasil disubmit otomatis"));
              return true;
            }
          }
        } catch (_) {}
      }
      return false;
    },

    async sequentiallyAnswerAllQuestions(questionData) {
      if (!document.getElementById("auto-next")?.checked && !document.getElementById("auto-answer")?.checked) return;
      const autoNextEl = document.getElementById("auto-next") || document.getElementById("auto_next") || document.getElementById("vRtZJ");
      const autoNext = autoNextEl ? autoNextEl.checked : true;
      const autoAnswer = document.getElementById("auto-answer")?.checked !== false;
      if (!autoAnswer) return;

      const sorted = Array.from(questionData.values()).sort((a, b) => a.index - b.index);
      const total = sorted.length;

      for (let idx = 0; idx < total; idx++) {
        if (App._isCompleted || this.isWebNilaiPage() || !this.hasActiveQuizQuestions()) {
          console.warn("[Quiz] Halaman bukan lagi halaman soal aktif. Menghentikan pengisian otomatis.");
          if (this.isWebNilaiPage()) App.closeAndFinish("Berpindah ke halaman nilai");
          return;
        }

        const q = sorted[idx];
        const isLast = (idx === total - 1);

        // If no valid answer from AI, pause and cancel auto-submit so user can choose manually
        if (!q.answer || !/^[a-e]$/i.test(q.answer)) {
          console.warn(`[Quiz] Soal ${q.number} tidak memiliki jawaban AI valid. Pause & batalkan auto-submit.`);
          const progressText = document.getElementById("progress-text");
          if (progressText) {
            progressText.textContent = `Soal ${q.number} perlu dipilih manual — auto-submit dibatalkan.`;
            progressText.style.color = "#FF9800";
          }
          return;
        }

        // Humanized reading / answering delay before clicking radio (~1.8s - 2.4s)
        await Utils.delay(1800 + Math.floor(Math.random() * 600));

        if (App._isCompleted || this.isWebNilaiPage() || !this.hasActiveQuizQuestions()) {
          console.warn("[Quiz] Halaman berpindah saat jeda pengisian. Menghentikan pengisian otomatis.");
          if (this.isWebNilaiPage()) App.closeAndFinish("Berpindah ke halaman nilai");
          return;
        }

        // Try selecting radio button (retry up to 3 times for DOM render)
        let selected = false;
        for (let attempt = 0; attempt < 3; attempt++) {
          selected = this.selectRadioAnswer(q.index, q.answer);
          if (selected) break;
          await Utils.delay(300);
        }

        if (!selected) {
          if (!this.hasActiveQuizQuestions() || this.isWebNilaiPage()) {
            if (this.isWebNilaiPage()) App.closeAndFinish("Berpindah ke halaman nilai");
            return;
          }
          const progressText = document.getElementById("progress-text");
          if (progressText) {
            progressText.textContent = `Gagal memilih opsi pada Soal ${q.number} — silakan pilih manual.`;
            progressText.style.color = "#FF9800";
          }
          return;
        }

        const progressText = document.getElementById("progress-text");
        if (progressText) {
          progressText.textContent = `Menjawab soal ${q.number} dari ${total}...`;
          progressText.style.color = "#4CAF50";
        }

        if (isLast) {
          if (autoNext) {
            if (progressText) {
              progressText.textContent = `⏳ Semua ${total} soal terisi! Menyelesaikan quiz...`;
              progressText.style.color = "#4CAF50";
            }
            // Brief natural review pause before clicking Selesai Quiz (~2.0s - 3.0s)
            await Utils.delay(2000 + Math.floor(Math.random() * 1000));
            const submitted = this.finishQuiz();
            if (!submitted && progressText) {
              progressText.textContent = `Tombol 'Selesai Quiz' tidak ditemukan — silakan klik manual.`;
              progressText.style.color = "#FF9800";
            }
          } else if (progressText) {
            progressText.textContent = `Semua ${total} soal telah terisi!`;
            progressText.style.color = "#4CAF50";
          }
          break;
        }

        // Move to next question with natural pacing
        if (autoNext) {
          await Utils.delay(700 + Math.floor(Math.random() * 300));
          this.clickNextButton();
          // Wait for next question DOM to settle
          await Utils.delay(900 + Math.floor(Math.random() * 300));
        } else {
          break;
        }
      }
    },

    autoStartQuiz() {
      const sel = CONFIG.SELECTORS.START_BUTTON;
      const tryClick = (obs) => {
        const btn = document.querySelector(sel);
        if (btn && btn.textContent.includes("Mulai Quiz")) {
          btn.click();
          obs?.disconnect();
          return true;
        }
        return false;
      };
      if (!tryClick(null)) {
        const o = new MutationObserver((_, obs) => tryClick(obs));
        o.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
      }
    },

    setupAutoConfirm() {
      let done = false;
      const sel = CONFIG.SELECTORS.CONFIRM_BUTTON;
      const fn = (obs) => {
        const btn = document.querySelector(sel)?.closest("button");
        if (btn && !done) { btn.click(); done = true; obs?.disconnect(); }
      };
      const o = new MutationObserver((_, obs) => fn(obs));
      o.observe(document.body, { childList: true, subtree: true });
      fn(null);
    }
  };

  // ---------------- App ----------------
  const App = {
    popup: null,
    questionData: new Map(),
    processedQuestions: new Set(),
    allAnswered: false,
    viewMode: 1,
    token: null,
    apiKey: null,
    quizId: null,
    _processing: false,
    _pollInterval: null,
    _isCompleted: false,

    copyAllQuestions() {
      const lines = [];
      const sorted = Array.from(this.questionData.values()).sort((a, b) => a.index - b.index);
      sorted.forEach((q) => {
        lines.push(`Soal ${q.number}:`);
        lines.push(q.question);
        lines.push("");
        q.options.forEach((opt, i) => {
          const l = String.fromCharCode(65 + i);
          const marker = l.toLowerCase() === q.answer ? " ✓ (Jawaban AI)" : "";
          lines.push(`${l}. ${opt}${marker}`);
        });
        lines.push(`→ Jawaban AI: ${q.answer ? q.answer.toUpperCase() : "TIDAK DITEMUKAN"}`);
        lines.push("─".repeat(50));
        lines.push("");
      });
      const text = lines.join("\n");
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById("copy-all-questions");
        if (btn) {
          const old = btn.innerHTML;
          btn.innerHTML = "Tersalin!";
          btn.style.color = "#4CAF50";
          setTimeout(() => { btn.innerHTML = old; btn.style.color = "#ccc"; }, 2000);
        }
      });
    },

    renderAllQuestions() {
      const container = document.getElementById("answers-container");
      if (!container) return;
      container.innerHTML = "";
      const sorted = Array.from(this.questionData.values()).sort((a, b) => a.index - b.index);
      sorted.forEach((q) => {
        const el = UI.createQuestionItem(q.index, q.id, "...");
        container.appendChild(el);
        UI.updateQuestionItem(el, q);
      });
    },

    closeAndFinish(reason = "Quiz telah diselesaikan") {
      if (this._isCompleted && !this.popup) return;
      this._isCompleted = true;
      if (this._pollInterval) {
        clearInterval(this._pollInterval);
        this._pollInterval = null;
      }
      if (this.popup?.element) {
        this.popup.element.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        this.popup.element.style.opacity = "0";
        this.popup.element.style.transform = "scale(0.92)";
        setTimeout(() => {
          this.popup?.element?.remove();
          this.popup = null;
        }, 400);
      }
      // Show clean completion toast
      const toast = document.createElement("div");
      toast.style = "position:fixed;bottom:24px;right:24px;background:#1e1e1e;border:1px solid #4CAF50;color:#fff;padding:12px 18px;border-radius:8px;z-index:99999;font-size:13px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.6);";
      toast.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span><b>Quiz Selesai!</b> ${reason}.</span>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.transition = "opacity 0.5s";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
      }, 4000);
    },

    async init() {
      Core.watchManualSubmitAndRetake();
      const qId = Utils.getQuizId();

      // Do not initialize on Web Nilai (/quiz/) or if already submitted in this session
      if (Core.isWebNilaiPage() || (qId && sessionStorage.getItem("mentari_quiz_submitted_" + qId) === "true")) {
        if (this._pollInterval) {
          clearInterval(this._pollInterval);
          this._pollInterval = null;
        }
        if (this.popup?.element) {
          this.popup.element.remove();
          this.popup = null;
        }
        return;
      }

      // Do not duplicate popup
      if (document.getElementById("quiz-helper-content")) {
        return;
      }

      // Create popup
      const popup = UI.createPopup();
      this.popup = popup;
      UI.showLoading(popup.content);

      // Setup
      try {
        this.token = Utils.getToken();
        this.apiKey = Utils.getGeminiApiKey();
        this.quizId = qId;
      } catch (e) {
        Utils.showError(e.message);
        return;
      }

      this._isCompleted = false;

      // Poll until active quiz questions are rendered and fetched, then stop
      if (this._pollInterval) clearInterval(this._pollInterval);
      this._pollInterval = setInterval(() => this.fetchAndProcess(), CONFIG.POLL_INTERVAL_MS);

      this.setupAutoConfirm();
      this.autoStartQuiz();
      await this.fetchAndProcess();
    },

    setupAutoConfirm() { Core.setupAutoConfirm(); },
    autoStartQuiz() { Core.autoStartQuiz(); },

    async fetchAndProcess() {
      if (this._isCompleted || (this.quizId && sessionStorage.getItem("mentari_quiz_submitted_" + this.quizId) === "true") || Core.isWebNilaiPage()) {
        if (this._pollInterval) {
          clearInterval(this._pollInterval);
          this._pollInterval = null;
        }
        if (this.popup?.element) {
          this.popup.element.remove();
          this.popup = null;
        }
        return;
      }
      if (!this.popup?.element?.isConnected) return;
      if (this._processing) return;

      // CRITICAL: Mentari's /api/quiz/soal/{id} still returns questions after submit/on Web Nilai.
      // Only fetch and call Gemini when active quiz radio buttons are actually present in DOM.
      if (!Core.hasActiveQuizQuestions()) {
        if (!this.popup.content.querySelector("#answers-container")) {
          UI.showScanning(this.popup.content);
        }
        return;
      }

      const data = await Api.fetchQuiz(this.token, this.quizId);
      if (!data || !data.data || data.data.length === 0) {
        if (!this.popup.content.querySelector("#answers-container")) {
          UI.showScanning(this.popup.content);
        }
        return;
      }

      // STOP POLLING once quiz questions are retrieved
      if (this._pollInterval) {
        clearInterval(this._pollInterval);
        this._pollInterval = null;
      }

      await this.processQuiz(data);
    },

    async processQuiz(apiData) {
      if (this._processing) return;
      this._processing = true;
      try {
        const isFirst = !this.popup.content.querySelector("#answers-container");
        if (isFirst) UI.initAnswerContainer(this.popup.content);

        const container = document.getElementById("answers-container");
        if (!container) return;

        // Ensure existing items still rendered
        if (!isFirst) {
          this.questionData.forEach((q, id) => {
            if (!document.querySelector(`[data-question-id="${id}"]`)) {
              const el = UI.createQuestionItem(q.index, id, "...");
              container.appendChild(el);
              UI.updateQuestionItem(document.querySelector(`[data-question-id="${id}"]`), q);
            }
          });
        }

        const cachedAnswers = Utils.getQuizCache(this.quizId);
        const toProcess = [];

        for (let i = 0; i < apiData.data.length; i++) {
          const raw = apiData.data[i];
          if (this.processedQuestions.has(raw.id)) {
            continue;
          }
          this.processedQuestions.add(raw.id);

          const el = UI.createQuestionItem(i, raw.id, "Mencari jawaban...");
          container.appendChild(el);

          const qText = [Utils.cleanText(raw.judul || ""), Utils.cleanText(raw.deskripsi || "")].filter(Boolean).join("\n\n");
          const opts = (raw.list_jawaban || []).map((o) => Utils.stripOptionPrefix(Utils.cleanText(o.jawaban)));

          if (opts.length === 0) {
            el.innerHTML = `<small>${i + 1}. <span style="color:#ff6b6b;">Tidak ada pilihan</span></small>`;
            continue;
          }

          // Use cached answer from sessionStorage if available (avoids re-calling Gemini on refresh)
          const cached = cachedAnswers[raw.id];
          if (cached?.answer && /^[a-e]$/i.test(cached.answer)) {
            const entry = {
              id: raw.id,
              number: i + 1,
              question: qText,
              options: opts,
              answer: cached.answer.toLowerCase(),
              explanation: cached.explanation || "(Dari cache sesi)",
              index: i
            };
            this.questionData.set(raw.id, entry);
            UI.updateQuestionItem(el, entry);
            continue;
          }

          toProcess.push({ question: qText, options: opts, id: raw.id, index: i, el });
        }

        const total = apiData.data.length;
        const progressText = document.getElementById("progress-text");
        const progressBar = document.getElementById("progress-bar");

        if (this.questionData.size > 0 && progressBar) {
          progressBar.style.width = Math.round((this.questionData.size / total) * 100) + "%";
        }

        if (toProcess.length > 0) {
          if (progressText) {
            progressText.textContent = `Meminta bantuan AI untuk ${toProcess.length} soal sekaligus...`;
            progressText.style.color = "#FF9800";
          }

          // Fetch all questions in parallel with 120ms stagger
          await Promise.all(
            toProcess.map(async (item, idx) => {
              await Utils.delay(idx * 120);
              const result = await Api.askGeminiSingle(this.apiKey, item.question, item.options);
              const entry = {
                id: item.id,
                number: item.index + 1,
                question: item.question,
                options: item.options,
                answer: result.letter, // may be null -> handled as unresolved in UI
                explanation: result.explanation,
                index: item.index
              };
              if (result.letter) {
                Utils.saveQuizCache(this.quizId, item.id, result.letter, result.explanation);
              }
              this.questionData.set(item.id, entry);
              UI.updateQuestionItem(item.el, entry);

              const answered = Array.from(this.questionData.values()).filter(q => q.answer).length;
              if (progressBar) progressBar.style.width = Math.round((this.questionData.size / total) * 100) + "%";
              if (progressText) progressText.textContent = `Jawaban terproses: ${answered}/${total}`;
            })
          );
        }

        if (!progressText || !progressBar) return;

        const validAnswers = Array.from(this.questionData.values()).filter(q => q.answer);
        const hasAllAnswers = validAnswers.length === total;

        if (hasAllAnswers && !this.allAnswered) {
          this.allAnswered = true;
          progressText.textContent = "Semua jawaban siap! Memulai pengisian bertahap...";
          progressText.style.color = "#4CAF50";
          if (document.getElementById("auto-answer")?.checked !== false) {
            setTimeout(() => Core.sequentiallyAnswerAllQuestions(this.questionData), 300);
          }
        } else if (!this.allAnswered && this.questionData.size === total) {
          this.allAnswered = true;
          progressText.textContent = `${validAnswers.length}/${total} soal terjawab. Memulai pengisian...`;
          progressText.style.color = "#FF9800";
          if (document.getElementById("auto-answer")?.checked !== false) {
            setTimeout(() => Core.sequentiallyAnswerAllQuestions(this.questionData), 300);
          }
        }
      } finally {
        this._processing = false;
      }
    }
  };

  window.__MENTARI_QUIZ_PATCHED__ = { CONFIG, Utils, Api, UI, Core, App };
  window.__mentariParseAnswer = Utils.parseAnswer;

  // Auto-init when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => App.init().catch((e) => Utils.showError(e.message)));
  } else {
    App.init().catch((e) => Utils.showError(e.message));
  }

  // Also handle SPA navigation for Mentari (close if navigating away, init if new quiz)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      if (/\/u-courses\/.*\/exam\//.test(url)) {
        const qId = Utils.getQuizId();
        if (qId && sessionStorage.getItem("mentari_quiz_submitted_" + qId) === "true") {
          return;
        }
        setTimeout(() => {
          if (!document.getElementById("quiz-helper-content") && !Core.isWebNilaiPage()) {
            App.questionData.clear();
            App.processedQuestions.clear();
            App.allAnswered = false;
            App._processing = false;
            App._isCompleted = false;
            App.init().catch(() => {});
          }
        }, 1000);
      } else {
        // Navigated away from active exam (including Web Nilai /quiz/) -> cleanly close popup & stop polling
        App._isCompleted = true;
        if (App._pollInterval) {
          clearInterval(App._pollInterval);
          App._pollInterval = null;
        }
        if (App.popup?.element) {
          App.popup.element.remove();
          App.popup = null;
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
