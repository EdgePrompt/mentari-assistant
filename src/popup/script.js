(() => {
  const statusDot = document.getElementById("statusDot");
  const statusText = document.getElementById("statusText");
  const statusDesc = document.getElementById("statusDesc");
  const actionBtn = document.getElementById("actionBtn");
  const btnText = document.getElementById("btnText");
  const btnIcon = document.getElementById("btnIcon");
  const activeModelTag = document.getElementById("activeModelTag");
  const portalStatusTag = document.getElementById("portalStatusTag");

  const MENTARI_URL = "https://mentari.unpam.ac.id/";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs && tabs[0];
    const isMentari = Boolean(activeTab?.url && activeTab.url.includes("mentari.unpam.ac.id"));

    if (isMentari) {
      statusDot.classList.add("active");
      statusText.textContent = "Terhubung ke MENTARI";
      statusDesc.textContent = "Buka panel asisten untuk melihat forum, kuis, dan pengaturan AI.";
      btnText.textContent = "Buka Panel Asisten";
      if (portalStatusTag) {
        portalStatusTag.textContent = "Aktif";
        portalStatusTag.classList.remove("standby");
        portalStatusTag.classList.add("ready");
      }
      btnIcon.innerHTML = '<rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="14" width="7" height="7" rx="1"></rect>';

      // Detect active model from page localStorage
      chrome.scripting
        .executeScript({
          target: { tabId: activeTab.id },
          func: () => localStorage.getItem("gemini_model") || "gemini-3.5-flash-lite"
        })
        .then((results) => {
          const rawModel = results?.[0]?.result;
          const model = typeof rawModel === "string" ? rawModel.replace(/^["']+|["']+$/g, "").trim() : "";
          if (model && activeModelTag) {
            if (model === "gemini-3.5-flash-lite") activeModelTag.textContent = "3.5 Flash Lite";
            else if (model === "gemini-3.1-flash-lite") activeModelTag.textContent = "3.1 Flash Lite";
            else if (model === "gemini-2.5-flash-lite") activeModelTag.textContent = "2.5 Flash Lite";
            else activeModelTag.textContent = model.replace(/^gemini-/, "");
          }
        })
        .catch(() => {});

      actionBtn.addEventListener("click", async () => {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => {
              if (typeof window.toggleTokenPopup === "function") {
                window.toggleTokenPopup();
              } else {
                window.dispatchEvent(new CustomEvent("mentari-toggle-popup"));
              }
            }
          });
          window.close();
        } catch (err) {
          statusText.textContent = "Panel belum siap";
          statusDesc.textContent = "Muat ulang halaman MENTARI (F5), lalu coba lagi.";
        }
      });
    } else {
      statusText.textContent = "Di luar halaman MENTARI";
      statusDesc.textContent = "Buka mentari.unpam.ac.id untuk menggunakan ekstensi ini.";
      btnText.textContent = "Buka MENTARI";
      if (portalStatusTag) {
        portalStatusTag.textContent = "Standby";
        portalStatusTag.classList.remove("ready");
        portalStatusTag.classList.add("standby");
      }
      btnIcon.innerHTML = '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>';

      actionBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: MENTARI_URL });
        window.close();
      });
    }
  });
})();
