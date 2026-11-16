(() => {
  if (document.documentElement?.dataset?.mentariApiKeyManagerLoaded === 'true') return;
  if (document.documentElement) {
    document.documentElement.dataset.mentariApiKeyManagerLoaded = 'true';
  }

  function injectStyles() {
    if (document.getElementById('gemini_api_styles')) return;

    const style = document.createElement('style');
    style.id = 'gemini_api_styles';
    style.textContent = `
      .gemini_api-key-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(6px);
        z-index: 100002;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .gemini_api-key-popup {
        background: #121316;
        color: #f3f4f6;
        width: 380px;
        max-width: calc(100vw - 24px);
        box-sizing: border-box;
        border-radius: 14px;
        border: 1px solid #2a2d35;
        overflow: hidden;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.72);
      }
      .gemini_popup-header {
        padding: 16px 18px;
        background: #14161a;
        border-bottom: 1px solid #26282e;
      }
      .gemini_popup-content {
        padding: 18px;
      }
      #gemini_apiKeyInput {
        width: 100%;
        padding: 10px 38px 10px 12px;
        background: #1b1d22;
        border: 1px solid #2a2d35;
        border-radius: 8px;
        color: #f3f4f6;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.2s;
      }
      #gemini_apiKeyInput:focus {
        border-color: #f97316 !important;
      }
      .ms-spin {
        font-family: 'Material Symbols Rounded';
        font-size: 16px;
        font-style: normal;
        display: inline-block;
        line-height: 1;
        animation: mentari-api-spin 1s linear infinite;
      }
      @keyframes mentari-api-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @media (max-width: 600px) {
        .gemini_api-key-popup {
          width: 100%;
          max-width: calc(100vw - 24px);
        }
        .gemini_popup-header {
          padding: 14px 16px;
        }
        .gemini_popup-content {
          padding: 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function validateApiKeyFormat(apiKey) {
    const regex = /^AIza[a-zA-Z0-9_-]{30,}$/;
    if (!regex.test(apiKey)) {
      return { valid: false, message: 'Format API key tidak valid (Harus diawali AIza...)' };
    }
    return { valid: true };
  }

  async function verifyApiKeyOnServer(apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
      );
      if (response.ok) return { valid: true };
      const data = await response.json();
      return { valid: false, message: data.error?.message || 'API key tidak valid atau expired.' };
    } catch (_error) {
      return { valid: false, message: 'Gagal menghubungi server Google. Periksa koneksi internet.' };
    }
  }

  function showApiKeyPopup() {
    if (document.getElementById('gemini_apiKeyPopup')) return;
    injectStyles();

    const stored = localStorage.getItem('geminiApiKey');
    let currentKey = '';
    if (stored) {
      try {
        currentKey = atob(stored);
      } catch (_e) {
        currentKey = '';
      }
    }

    const overlay = document.createElement('div');
    overlay.id = 'gemini_apiKeyOverlay';
    overlay.className = 'gemini_api-key-overlay';

    overlay.innerHTML = `
      <div id="gemini_apiKeyPopup" class="gemini_api-key-popup">
        <div class="gemini_popup-header">
          <div style="font-weight:700; color:#f3f4f6; display:flex; align-items:center; gap:8px; font-size:14px;">
            <span class="ms" style="color:#f97316;">vpn_key</span> Gemini API Key
          </div>
        </div>
        <div class="gemini_popup-content">
          <div style="margin-bottom:12px; color:#9ca3af; font-size:12px; line-height:1.5;">
            Dapatkan API key gratis di Google AI Studio:<br>
            <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer" style="color:#fb923c; text-decoration:none; font-weight:600;">aistudio.google.com/api-keys ↗</a>
          </div>
          <div style="position:relative; margin-bottom:15px;">
            <input type="password" id="gemini_apiKeyInput" value="${currentKey.replace(/"/g, '&quot;')}" placeholder="Masukkan AIza...">
            <button type="button" id="gemini_toggleVis" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#9ca3af; cursor:pointer; display:flex; padding:2px;" title="Tampilkan / Sembunyikan API key">
              <span class="ms" id="gemini_visIcon" style="font-size:18px;">visibility</span>
            </button>
          </div>
          <div id="gemini_validationMessage" style="display:none; padding:10px 12px; border-radius:8px; font-size:12px; margin-bottom:15px; border:1px solid transparent; line-height:1.4;"></div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" id="gemini_closePopup" style="background:#1b1d22; color:#9ca3af; border:1px solid #2a2d35; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:600;">Batal</button>
            <button type="button" id="gemini_saveApiKeyButton" style="background:linear-gradient(135deg, #f97316, #ea580c); color:#ffffff; border:none; padding:8px 16px; border-radius:8px; cursor:pointer; font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(249,115,22,0.28);">
              <span id="gemini_btnText">Simpan</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const saveBtn = document.getElementById('gemini_saveApiKeyButton');
    const closeBtn = document.getElementById('gemini_closePopup');
    const input = document.getElementById('gemini_apiKeyInput');
    const msgBox = document.getElementById('gemini_validationMessage');
    const toggleVis = document.getElementById('gemini_toggleVis');
    const visIcon = document.getElementById('gemini_visIcon');
    const btnText = document.getElementById('gemini_btnText');

    toggleVis.onclick = (e) => {
      e.preventDefault();
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      visIcon.textContent = isPass ? 'visibility_off' : 'visibility';
    };

    closeBtn.onclick = () => overlay.remove();

    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    saveBtn.onclick = async () => {
      const key = input.value.trim();
      const formatCheck = validateApiKeyFormat(key);
      if (!formatCheck.valid) {
        msgBox.style.display = 'block';
        msgBox.style.background = 'rgba(239, 68, 68, 0.12)';
        msgBox.style.color = '#f87171';
        msgBox.innerText = formatCheck.message;
        msgBox.style.borderColor = 'rgba(239, 68, 68, 0.45)';
        return;
      }

      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.7';
      btnText.innerHTML = '<span class="ms-spin">progress_activity</span> Memverifikasi...';

      const verify = await verifyApiKeyOnServer(key);
      if (verify.valid) {
        msgBox.style.display = 'block';
        msgBox.style.background = 'rgba(34, 197, 94, 0.12)';
        msgBox.style.color = '#4ade80';
        msgBox.innerText = 'API key valid dan berhasil disimpan!';
        msgBox.style.borderColor = 'rgba(34, 197, 94, 0.45)';

        localStorage.setItem('geminiApiKey', btoa(key));

        setTimeout(() => {
          document.getElementById('gemini_apiKeyOverlay')?.remove();
          if (typeof createChatbotInterface === 'function') createChatbotInterface(key);
          window.dispatchEvent(new CustomEvent('gemini-api-key-updated', { detail: { key } }));
        }, 1200);
      } else {
        msgBox.style.display = 'block';
        msgBox.style.background = 'rgba(239, 68, 68, 0.12)';
        msgBox.style.color = '#f87171';
        msgBox.innerText = verify.message;
        msgBox.style.borderColor = 'rgba(239, 68, 68, 0.45)';
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
        btnText.textContent = 'Simpan';
      }
    };
  }

  function getStoredApiKey() {
    console.log('API Key Manager initializing...');
    const stored = localStorage.getItem('geminiApiKey');
    if (!stored) {
      console.log('No API key found, showing popup...');
      setTimeout(() => {
        showApiKeyPopup();
      }, 1000);
      return null;
    }
    try {
      return atob(stored);
    } catch (_e) {
      return null;
    }
  }

  function initialize() {
    const start = () => {
      setTimeout(() => {
        const key = getStoredApiKey();
        if (key && typeof createChatbotInterface === 'function') {
          createChatbotInterface(key);
        }
      }, 1000);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start);
    } else {
      start();
    }

    window.addEventListener('mentari-update-api-key', () => showApiKeyPopup());
  }

  initialize();
})();
