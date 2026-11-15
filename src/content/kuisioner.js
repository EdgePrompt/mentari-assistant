(() => {
  // =============================================================
  // Mentari Auto Kuesioner (Mentari Assistant)
  // =============================================================

  const KUESIONER_URL_RE = /\/u-courses\/.*\/kuesioner\//;
  let activeRun = false;

  function isKuesionerPage() {
    return KUESIONER_URL_RE.test(window.location.href);
  }

  function getDoneKey() {
    return "mentari_kuesioner_done_" + window.location.pathname;
  }

  function waitForRadios(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelectorAll('input[type="radio"][value="1"]');
      if (existing.length > 0) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        if (!isKuesionerPage()) {
          observer.disconnect();
          reject(new Error("Navigated away from kuesioner"));
          return;
        }
        const radios = document.querySelectorAll('input[type="radio"][value="1"]');
        if (radios.length > 0) {
          observer.disconnect();
          resolve(radios);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        const late = document.querySelectorAll('input[type="radio"][value="1"]');
        if (late.length > 0) {
          resolve(late);
        } else {
          reject(new Error("Timeout waiting for radio buttons"));
        }
      }, timeoutMs);
    });
  }

  function selectRadio(radio) {
    radio.checked = true;
    ["input", "change", "click"].forEach((evt) => {
      radio.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true }));
    });
    const label = radio.closest(".MuiFormControlLabel-root");
    if (label) {
      label.click();
    } else {
      radio.click();
    }
  }

  function findSubmitButton() {
    const candidates = Array.from(document.querySelectorAll('button, [role="button"]'));
    return candidates.find((btn) => {
      if (btn.disabled || btn.offsetParent === null) return false;
      const text = (btn.textContent || "").trim().toLowerCase();
      return text.includes("submit kuesioner") || text === "simpan" || text === "kirim";
    }) || null;
  }

  function clickSubmitButton() {
    const btn = findSubmitButton();
    if (!btn) {
      console.log("[Kuesioner] Tombol submit belum ditemukan");
      return false;
    }

    btn.scrollIntoView({ behavior: "smooth", block: "center" });
    ["mousedown", "mouseup", "click"].forEach((evtType) => {
      btn.dispatchEvent(new MouseEvent(evtType, {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1
      }));
    });
    btn.click();
    sessionStorage.setItem(getDoneKey(), "true");
    console.log("[Kuesioner] Tombol submit ditemukan dan diklik");
    return true;
  }

  async function runKuesioner() {
    if (!isKuesionerPage()) return;
    if (sessionStorage.getItem(getDoneKey()) === "true") return;
    if (activeRun) return;
    activeRun = true;

    try {
      const radios = await waitForRadios(15000);
      if (!isKuesionerPage() || radios.length === 0) return;

      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

      let clickedCount = 0;
      radios.forEach((radio) => {
        if (radio.offsetParent !== null) {
          selectRadio(radio);
          clickedCount++;
        }
      });

      if (clickedCount === 0) {
        console.log("[Kuesioner] Tidak ada radio button aktif yang terlihat");
        return;
      }

      console.log(`[Kuesioner] Semua ${clickedCount} radio button "Ya" telah diklik`);

      let attempts = 0;
      const maxAttempts = 5;
      setTimeout(function trySubmit() {
        if (!isKuesionerPage()) return;
        if (clickSubmitButton()) return;
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`[Kuesioner] Mencoba klik submit lagi... (${attempts}/${maxAttempts})`);
          setTimeout(trySubmit, 1000);
        } else {
          console.log("[Kuesioner] Mencapai batas percobaan klik submit");
        }
      }, 1200);
    } catch (err) {
      console.log("[Kuesioner]", err.message);
    } finally {
      activeRun = false;
    }
  }

  function scheduleRun() {
    if (isKuesionerPage()) {
      setTimeout(runKuesioner, 1000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleRun);
  } else {
    scheduleRun();
  }

  let lastUrl = window.location.href;
  new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      scheduleRun();
    }
  }).observe(document.body, { childList: true, subtree: true });
})();
