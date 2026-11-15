(() => {
  const Config = {
    STYLES: `
      #mentari-guide-container {
        position: fixed;
        top: 70px;
        right: 20px;
        width: 500px;
        height: 600px;
        max-height: calc(100vh - 90px);
        background: #121316;
        backdrop-filter: blur(25px);
        border: 1px solid #2a2d35;
        border-radius: 14px;
        box-shadow: 0 15px 50px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        z-index: 100000;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        visibility: hidden;
        opacity: 0;
        transform: translateY(-15px) scale(0.95);
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #f3f4f6;
      }
      #mentari-guide-container.active {
        visibility: visible;
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }

      /* Light Theme Adaptation */
      #mentari-guide-container.light-theme {
        background: #ffffff;
        color: #1a1c1e;
        border: 1px solid rgba(0, 0, 0, 0.12);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      }
      #mentari-guide-container.light-theme .guide-title {
        color: #ea580c;
      }
      #mentari-guide-container.light-theme .guide-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0, 0, 0, 0.08);
      }
      #mentari-guide-container.light-theme .guide-section {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.08);
      }
      #mentari-guide-container.light-theme .guide-section h3 {
        color: #f97316;
      }
      #mentari-guide-container.light-theme .guide-section p {
        color: #4a5568;
      }
      #mentari-guide-container.light-theme .guide-card {
        background: #f1f5f9;
        border-color: rgba(249, 115, 22, 0.25);
        color: #475569;
      }
      #mentari-guide-container.light-theme .tip-badge {
        background: rgba(249, 115, 22, 0.12);
        color: #f97316;
      }
      #mentari-guide-container.light-theme .guide-close:hover {
        background: rgba(0, 0, 0, 0.04);
        color: #000000;
      }

      @media (max-width: 600px) {
        #mentari-guide-container {
          width: 100% !important;
          left: 0 !important;
          right: 0 !important;
          border-radius: 0 !important;
          height: calc(100dvh - 50px) !important;
          max-height: calc(100dvh - 50px) !important;
          top: 50px !important;
          border: none !important;
          transform: translateX(100%) !important;
        }
        #mentari-guide-container.active {
          transform: translateX(0) !important;
        }
      }

      .guide-header {
        padding: 16px;
        background: #14161a;
        border-bottom: 1px solid #26282e;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .guide-title {
        font-weight: 700;
        font-size: 15px;
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .guide-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .guide-content::-webkit-scrollbar {
        width: 4px;
      }
      .guide-content::-webkit-scrollbar-thumb {
        background: rgba(249, 115, 22, 0.35);
        border-radius: 10px;
      }

      .guide-section {
        background: #1b1d22;
        border-radius: 10px;
        padding: 15px;
        border: 1px solid #2a2d35;
      }
      .guide-section h3 {
        margin: 0 0 10px 0;
        color: #fb923c;
        font-size: 14px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .guide-section p {
        margin: 0;
        font-size: 13px;
        line-height: 1.6;
        color: #d1d5db;
      }
      .guide-card {
        margin-top: 10px;
        background: #14161a;
        border-radius: 8px;
        padding: 12px;
        font-size: 12px;
        border: 1px dashed rgba(249, 115, 22, 0.3);
        line-height: 1.5;
      }

      #guide-toggle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: #f97316;
        cursor: pointer;
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        margin-right: 4px;
      }
      #guide-toggle:hover {
        background-color: rgba(249, 115, 22, 0.12);
      }

      .guide-close {
        background: none;
        border: none;
        color: #777;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.2s;
      }
      .guide-close:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }

      .tip-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(249, 115, 22, 0.16);
        color: #fb923c;
        border: 1px solid rgba(249, 115, 22, 0.35);
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .guide-title .ms {
        font-size: 22px;
        margin-right: 4px;
      }
      #guide-toggle .ms {
        font-size: 18px;
      }

      .ms {
        font-family: 'Material Symbols Rounded';
        font-size: 18px;
        font-style: normal;
        font-weight: normal;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      }
    `,
  };

  const GuideUI = {
    injectStyles() {
      if (document.getElementById('mentari-guide-styles')) return;
      const style = document.createElement('style');
      style.id = 'mentari-guide-styles';
      style.textContent = Config.STYLES;
      document.head.appendChild(style);
    },

    applyTheme(container) {
      const isLight = document.querySelector('.css-1yxmbwk') !== null;
      if (isLight) {
        container.classList.add('light-theme');
      } else {
        container.classList.remove('light-theme');
      }
    },

    createInterface() {
      if (document.getElementById('mentari-guide-container')) return;

      const container = document.createElement('div');
      container.id = 'mentari-guide-container';
      container.innerHTML = `
        <div class="guide-header">
          <div class="guide-title">
            <span class="ms" style="font-size:22px; margin-right:6px; color:#f97316;">auto_stories</span> Guidebook Mentari Assistant
          </div>
          <button class="guide-close" id="guide-close-btn" title="Tutup Panduan">
            <span class="ms">close</span>
          </button>
        </div>
        <div class="guide-content">
          <div class="guide-section">
            <span class="tip-badge">Langkah Awal</span>
            <h3><span class="ms" style="font-size:18px;">sync</span> Sinkronisasi Data Akun</h3>
            <p>Setelah masuk ke MENTARI, buka salah satu mata kuliah agar daftar pertemuan dan forum dimuat otomatis.</p>
            <div class="guide-card">
              • <b>Update Data:</b> Jika daftar forum belum muncul, klik tombol <b>refresh</b> di tab Forum.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 01</span>
            <h3><span class="ms" style="font-size:18px;">auto_awesome</span> Gemini AI Assistant</h3>
            <p>Asisten AI membantu merangkum diskusi dan menyusun jawaban soal. Klik ikon <b>auto_awesome</b> (Oranye) di header.</p>
            <div class="guide-card">
              • <b>Ambil Soal:</b> Klik ikon kaca pembesar untuk mengambil teks soal di halaman.<br>
              • <b>Quick Commands:</b> Pilih tombol gaya jawaban (Ringkas, Santai, atau Formal) sesuai kebutuhan.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tutorial 02</span>
            <h3><span class="ms" style="font-size:18px;">quiz</span> Auto Finish Quiz</h3>
            <p>Dapat diaktifkan lewat tab <b>Pengaturan</b> untuk mengisi kuis secara bertahap.</p>
            <div class="guide-card">
              • Periksa kembali setiap pilihan jawaban sebelum menekan tombol selesai.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Tips API</span>
            <h3><span class="ms" style="font-size:18px;">vpn_key</span> Mengatasi Error 429</h3>
            <p>Jika muncul pesan <i>"Rate Limit Tercapai"</i>, berarti kuota harian model tersebut sudah habis.</p>
            <div class="guide-card">
              • <b>Solusi:</b> Buka Pengaturan, lalu pilih model lain (misalnya Gemini 3.1 Flash Lite) atau pakai API Key cadangan.
            </div>
          </div>

          <div class="guide-section">
            <span class="tip-badge">Fitur Forum</span>
            <h3><span class="ms" style="font-size:18px;">forum</span> Pantau Balasan Dosen</h3>
            <p>Balasan atau komentar terbaru dari dosen bisa langsung dicek lewat tab <b>Notifikasi</b>.</p>
            <div class="guide-card">
              • Seluruh balasan terbaru dari Dosen akan dikumpulkan di satu tempat lengkap dengan link menuju diskusinya.
            </div>
          </div>

          <div style="text-align:center; opacity:0.4; font-size:10px; padding-bottom:10px;">
            Dibuat dengan ❤️ untuk mahasiswa UNPAM • v1.1.0
          </div>
        </div>
      `;

      document.body.appendChild(container);

      const injectToggle = () => {
        if (document.getElementById('guide-toggle')) return;
        const geminiToggle = document.getElementById('gemini-toggle');
        const mainToggle = document.getElementById('mentari-header-toggle');
        const anchorBtn = geminiToggle || mainToggle;

        if (anchorBtn && anchorBtn.parentNode) {
          const btn = document.createElement('button');
          btn.id = 'guide-toggle';
          btn.type = 'button';
          btn.title = 'Buka Buku Panduan Mentari Assistant';
          btn.innerHTML = '<span class="ms">auto_stories</span><span class="MuiTouchRipple-root"></span>';
          anchorBtn.parentNode.insertBefore(btn, anchorBtn);

          btn.onclick = (e) => {
            e.stopPropagation();
            const isActive = container.classList.contains('active');
            if (!isActive) {
              this.applyTheme(container);
              document.getElementById('token-runner-popup')?.classList.remove('active');
              document.getElementById('gemini-chat-container')?.classList.remove('active');
              container.classList.add('active');
            } else {
              container.classList.remove('active');
            }
          };
        }
      };

      setInterval(() => {
        injectToggle();
        if (container.classList.contains('active')) {
          this.applyTheme(container);
        }
      }, 100);

      injectToggle();

      document.getElementById('guide-close-btn').onclick = () => container.classList.remove('active');
      container.onclick = (e) => e.stopPropagation();
      document.addEventListener('click', () => container.classList.remove('active'));
    },
  };

  GuideUI.injectStyles();
  GuideUI.createInterface();
})();
