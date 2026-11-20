(() => {
  const Config = {
    APP_VERSION: '1.3.0',
    STYLES: `
      #mentari-presensi-popup {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.58);
        backdrop-filter: blur(5px);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 12px;
        box-sizing: border-box;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: mentari-presensi-fadein 0.25s ease-out;
      }
      .presensi-content-container {
        background: #121316;
        color: #f3f4f6;
        width: 92%;
        max-width: 900px;
        max-height: 90vh;
        border-radius: 16px;
        border: 1px solid #2a2d35;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      /* Light Theme Adaptation */
      #mentari-presensi-popup.light-theme .presensi-content-container {
        background: #ffffff;
        color: #1a1c1e;
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
      }
      #mentari-presensi-popup.light-theme .popup-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0, 0, 0, 0.08);
      }
      #mentari-presensi-popup.light-theme .popup-title {
        color: #ea580c;
      }
      #mentari-presensi-popup.light-theme .course-card {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.08);
      }
      #mentari-presensi-popup.light-theme .course-card-header {
        background: #f8fafc;
        border-bottom-color: rgba(0, 0, 0, 0.06);
      }
      #mentari-presensi-popup.light-theme .course-card-header h2 {
        color: #ea580c;
      }
      #mentari-presensi-popup.light-theme .info-card {
        background: #f8fafc;
        border-color: rgba(0, 0, 0, 0.08);
      }
      #mentari-presensi-popup.light-theme .item-row {
        background: #f8fafc;
        border-color: rgba(0, 0, 0, 0.06);
      }
      #mentari-presensi-popup.light-theme .item-row:hover {
        background: #f1f5f9 !important;
      }
      #mentari-presensi-popup.light-theme .item-title {
        color: #1e293b;
      }
      #mentari-presensi-popup.light-theme .item-meta {
        color: #64748b;
      }
      #mentari-presensi-popup.light-theme .popup-footer {
        background: #f8f9fa;
        border-top-color: rgba(0, 0, 0, 0.08);
      }

      .popup-header {
        padding: 16px 22px;
        background: #14161a;
        border-bottom: 1px solid #26282e;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .popup-title {
        font-weight: 700;
        font-size: 17px;
        color: #f3f4f6;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .popup-close-btn {
        background: none;
        border: none;
        color: inherit;
        opacity: 0.6;
        cursor: pointer;
        transition: 0.2s;
        display: inline-flex;
        align-items: center;
        padding: 4px;
        border-radius: 50%;
      }
      .popup-close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.08);
      }

      .presensi-scroll-area {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        box-sizing: border-box;
      }
      .presensi-scroll-area::-webkit-scrollbar {
        width: 5px;
      }
      .presensi-scroll-area::-webkit-scrollbar-thumb {
        background: rgba(249, 115, 22, 0.3);
        border-radius: 10px;
      }
      .popup-footer {
        padding: 14px 22px;
        background: #14161a;
        border-top: 1px solid #26282e;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
      }

      .course-card {
        margin-bottom: 16px;
        border: 1px solid #2a2d35;
        border-radius: 12px;
        overflow: hidden;
        background: #1b1d22;
        transition: border-color 0.2s;
      }
      .course-card:hover {
        border-color: rgba(249, 115, 22, 0.45);
      }
      .course-card-header {
        padding: 13px 18px;
        background: #14161a;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #26282e;
      }
      .course-card-header h2 {
        margin: 0;
        font-size: 14px;
        color: #fb923c;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 72%;
      }
      .course-percentage {
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
      }

      .item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 10px;
        margin-bottom: 8px;
        background: #1b1d22;
        border: 1px solid #2a2d35;
        transition: all 0.2s;
        position: relative;
      }
      .item-row:hover {
        background: #22252c !important;
        transform: translateX(4px);
      }
      .item-row:hover .item-title {
        color: #fb923c;
      }
      #mentari-presensi-popup.light-theme .item-row:hover .item-title {
        color: #ea580c;
      }

      .item-icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
        font-weight: 800;
      }
      .icon-hadir {
        background: rgba(34, 197, 94, 0.14);
        color: #4ade80;
      }
      .icon-tidak-hadir {
        background: rgba(239, 68, 68, 0.14);
        color: #f87171;
      }

      .item-info {
        flex: 1;
        min-width: 0;
      }
      .item-title {
        font-size: 13px;
        font-weight: 600;
        color: #f3f4f6;
        margin-bottom: 2px;
        display: block;
      }
      .item-meta {
        font-size: 11px;
        opacity: 0.65;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px;
      }

      .ms {
        font-family: 'Material Symbols Rounded';
        font-size: 20px;
        font-style: normal;
        font-weight: normal;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        vertical-align: middle;
      }

      .info-bar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }
      .info-card {
        background: #1b1d22;
        border: 1px solid #2a2d35;
        padding: 12px;
        border-radius: 12px;
      }
      .info-label {
        font-size: 10px;
        text-transform: uppercase;
        opacity: 0.6;
        margin-bottom: 4px;
        font-weight: 700;
        letter-spacing: 0.5px;
      }
      .info-value {
        font-size: 13px;
        font-weight: 700;
        word-break: break-word;
      }

      .presensi-btn {
        background: #1b1d22;
        color: #f97316;
        border: 1px solid #2a2d35;
        border-radius: 50px;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.28);
        position: relative;
      }
      .presensi-btn:hover {
        background: #f97316;
        color: #ffffff;
        border-color: #f97316;
        transform: translateY(-3px) scale(1.06);
        box-shadow: 0 8px 25px rgba(249, 115, 22, 0.35);
      }

      /* Tooltip */
      .presensi-btn::after {
        content: attr(data-title);
        position: absolute;
        bottom: 50px;
        left: 0;
        background: #14161a;
        color: #f3f4f6;
        border: 1px solid #2a2d35;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: 0.2s;
        font-weight: 700;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
      }
      .presensi-btn:hover::after {
        opacity: 1;
        bottom: 55px;
      }

      #presensi-loading {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(5px);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .loading-card {
        background: #121316;
        padding: 28px 32px;
        border-radius: 16px;
        border: 1px solid #2a2d35;
        text-align: center;
        color: #f3f4f6;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
      }
      .spinner {
        width: 38px;
        height: 38px;
        border: 3px solid rgba(249, 115, 22, 0.15);
        border-top: 3px solid #f97316;
        border-radius: 50%;
        animation: mentari-presensi-spin 1s linear infinite;
        margin: 0 auto 14px;
      }
      .presensi-notice {
        background: rgba(249, 115, 22, 0.08);
        border: 1px solid rgba(249, 115, 22, 0.25);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 11px;
        color: #fb923c;
        margin-bottom: 18px;
        line-height: 1.5;
        display: flex;
        gap: 10px;
        align-items: flex-start;
      }
      .presensi-notice .ms {
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 1px;
      }

      @media (max-width: 600px) {
        #mentari-presensi-popup {
          padding: 8px;
        }
        .presensi-content-container {
          width: 100%;
          max-width: calc(100vw - 16px);
          max-height: 92dvh;
          border-radius: 12px;
        }
        .popup-header,
        .popup-footer {
          padding: 12px 16px;
        }
        .popup-title {
          font-size: 15px;
        }
        .presensi-scroll-area {
          padding: 14px;
        }
        .info-bar {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .course-card-header {
          padding: 12px 14px;
        }
        .course-card-header h2 {
          font-size: 13px;
          max-width: 66%;
        }
        .item-row {
          padding: 10px 12px;
          gap: 10px;
        }
      }

      @keyframes mentari-presensi-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes mentari-presensi-fadein {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  };

  const Utils = {
    formatDate(d) {
      if (!d) return '-';
      try {
        return new Date(d).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (_e) {
        return d;
      }
    },
    formatDateSimple(d) {
      if (!d) return '-';
      try {
        return new Date(d).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch (_e) {
        return d;
      }
    },
    injectMaterialIcons() {
      if (document.getElementById('ms-presensi-icons')) return;
      const link = document.createElement('link');
      link.id = 'ms-presensi-icons';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0';
      document.head.appendChild(link);
    },
  };

  const UIRenderer = {
    injectStyles() {
      if (document.getElementById('mentari-presensi-styles')) return;
      const style = document.createElement('style');
      style.id = 'mentari-presensi-styles';
      style.textContent = Config.STYLES;
      document.head.appendChild(style);
    },

    showMainPopup(data) {
      const m = data.mahasiswa;
      const isLight = document.querySelector('.css-1yxmbwk') !== null;

      let popup = document.getElementById('mentari-presensi-popup');
      if (popup) popup.remove();

      popup = document.createElement('div');
      popup.id = 'mentari-presensi-popup';
      if (isLight) popup.classList.add('light-theme');

      let totalPertemuan = 0;
      let totalHadir = 0;
      data.forEach((d) => {
        totalPertemuan += (d.pertemuan || []).length;
        totalHadir += (d.pertemuan || []).filter((p) => p.presensi_status === 'hadir').length;
      });
      const avgPercent = totalPertemuan > 0 ? ((totalHadir / totalPertemuan) * 100).toFixed(1) : 0;

      popup.innerHTML = `
        <div class="presensi-content-container">
          <div class="popup-header">
            <div class="popup-title"><span class="ms" style="color:#f97316; font-size:24px;">fact_check</span> Ringkasan Presensi</div>
            <button type="button" class="popup-close-btn" id="p-close-btn" title="Tutup"><span class="ms">close</span></button>
          </div>

          <div class="presensi-scroll-area">
            <div class="presensi-notice">
              <span class="ms">campaign</span>
              <div>
                <strong>Info Transparansi:</strong> Jika ada mata kuliah yang tidak muncul, ini berarti data presensi mata kuliah tersebut belum diterbitkan atau memang tidak dibuka oleh dosen yang bersangkutan melalui sistem My Unpam.
              </div>
            </div>

            <div class="info-bar">
              <div class="info-card"><div class="info-label">MAHASISWA</div><div class="info-value">${m.nama_mahasiswa}</div></div>
              <div class="info-card"><div class="info-label">NIM</div><div class="info-value">${m.nim}</div></div>
              <div class="info-card"><div class="info-label">SEMESTER</div><div class="info-value">${m.nama_semester_registrasi}</div></div>
              <div class="info-card" style="background: rgba(249,115,22,0.08); border-color:#f97316;">
                <div class="info-label" style="color:#fb923c;">TOTAL KEHADIRAN</div>
                <div class="info-value" style="color:#f97316; font-size:16px;">${avgPercent}%</div>
              </div>
            </div>

            <div id="p-course-list">
              ${data.map((c, i) => this.renderCourseCard(c, i)).join('')}
            </div>
          </div>

          <div class="popup-footer">
            <div style="opacity:0.65;">v${Config.APP_VERSION} • Data real-time My Unpam</div>
            <div style="font-weight:700; color:#fb923c;">${data.length} Mata Kuliah</div>
          </div>
        </div>
      `;

      document.body.appendChild(popup);
      document.getElementById('p-close-btn').onclick = () => popup.remove();
      popup.onclick = (e) => {
        if (e.target === popup) popup.remove();
      };

      data.forEach((c, i) => {
        const card = document.getElementById(`p-course-${i}`);
        if (card) card.onclick = () => this.showDetailPopup(c);
      });
    },

    renderCourseCard(c, idx) {
      const total = (c.pertemuan || []).length;
      const hadir = (c.pertemuan || []).filter((p) => p.presensi_status === 'hadir').length;
      const percent = total > 0 ? ((hadir / total) * 100).toFixed(0) : 0;

      let color = '#ef4444';
      let bg = 'rgba(239, 68, 68, 0.14)';
      if (percent >= 85) {
        color = '#22c55e';
        bg = 'rgba(34, 197, 94, 0.14)';
      } else if (percent >= 75) {
        color = '#4ade80';
        bg = 'rgba(74, 222, 128, 0.14)';
      } else if (percent >= 50) {
        color = '#fb923c';
        bg = 'rgba(249, 115, 22, 0.14)';
      }

      return `
        <div class="course-card" id="p-course-${idx}" style="cursor:pointer;">
          <div class="course-card-header">
            <h2>${c.nama_mata_kuliah}</h2>
            <div class="course-percentage" style="color:${color}; background:${bg};">${percent}%</div>
          </div>
          <div style="padding:12px 18px; display:flex; flex-wrap:wrap; gap:16px; font-size:12px; opacity:0.85;">
            <div><span style="opacity:0.6;">SKS:</span> <b>${c.sks || 3}</b></div>
            <div><span style="opacity:0.6;">Hadir:</span> <b style="color:#4ade80;">${hadir}</b></div>
            <div><span style="opacity:0.6;">Mangkir:</span> <b style="color:#ef4444;">${total - hadir}</b></div>
            <div style="margin-left:auto; display:flex; align-items:center; color:#fb923c; font-weight:600;">Lihat Detail <span class="ms" style="font-size:15px;">chevron_right</span></div>
          </div>
        </div>
      `;
    },

    showDetailPopup(c) {
      const isLight = document.querySelector('.css-1yxmbwk') !== null;
      const container = document.createElement('div');
      container.id = 'p-detail-subpopup';
      container.style.cssText =
        'position:absolute; inset:0; background:inherit; z-index:10; display:flex; flex-direction:column; animation:mentari-presensi-slide 0.25s cubic-bezier(0.4, 0, 0.2, 1);';

      if (isLight) container.classList.add('light-theme');

      const reversedList = [...(c.pertemuan || [])].reverse();

      container.innerHTML = `
        <div class="popup-header">
          <button type="button" class="popup-close-btn" id="pd-back-btn" style="opacity:1; display:flex; align-items:center; gap:4px; font-weight:700; color:#f97316;">
            <span class="ms">arrow_back</span> Kembali
          </button>
          <div class="popup-title" style="font-size:14px; opacity:0.9; text-align:right; max-width:60%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.nama_mata_kuliah}</div>
        </div>

        <div class="presensi-scroll-area">
          ${reversedList
            .map(
              (p, i) => `
            <div class="item-row">
              <div class="item-icon ${p.presensi_status === 'hadir' ? 'icon-hadir' : 'icon-tidak-hadir'}">
                <span class="ms">${p.presensi_status === 'hadir' ? 'check_circle' : 'cancel'}</span>
              </div>
              <div class="item-info">
                <span class="item-title">Pertemuan ${reversedList.length - i} - ${p.jenis_perkuliahan || 'Perkuliahan'}</span>
                <div class="item-meta">
                  <span><span class="ms" style="font-size:13px;">event</span> ${Utils.formatDateSimple(p.tanggal_mulai)}</span>
                  ${p.presensi_date ? `<span><span class="ms" style="font-size:13px;">history</span> ${Utils.formatDate(p.presensi_date)}</span>` : ''}
                </div>
              </div>
              <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:${p.presensi_status === 'hadir' ? '#4ade80' : '#f87171'}; flex-shrink:0;">
                ${p.presensi_status || 'Tidak Hadir'}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <style>
          @keyframes mentari-presensi-slide {
            from { transform: translateX(30px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      `;

      const root = document.querySelector('.presensi-content-container');
      if (!root) return;
      root.appendChild(container);
      document.getElementById('pd-back-btn').onclick = () => container.remove();
    },

    showLoading() {
      this.hideLoading();
      const loader = document.createElement('div');
      loader.id = 'presensi-loading';
      loader.innerHTML = `
        <div class="loading-card">
          <div class="spinner"></div>
          <div style="font-weight:700; font-size:15px; margin-bottom:4px;">Sinkronisasi Presensi</div>
          <div style="opacity:0.6; font-size:12px;">Menghubungkan ke portal akademik...</div>
        </div>
      `;
      document.body.appendChild(loader);
      return loader;
    },

    hideLoading() {
      document.getElementById('presensi-loading')?.remove();
    },

    addTrigger() {
      if (document.getElementById('p-trigger-btn')) return;
      const btn = document.createElement('button');
      btn.id = 'p-trigger-btn';
      btn.type = 'button';
      btn.className = 'presensi-btn';
      btn.setAttribute('data-title', 'Lihat Presensi Keseluruhan');
      btn.style.cssText = 'position:fixed; bottom:20px; left:20px; z-index:9999;';
      btn.innerHTML = '<span class="ms">fact_check</span>';
      btn.onclick = async () => {
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px; height:16px; border-width:2px; margin:0;"></div>';
        this.showLoading();
        try {
          await fetchAllPresensiData();
        } catch (err) {
          console.warn(err);
          alert('Gagal memuat data presensi.');
        } finally {
          this.hideLoading();
          btn.disabled = false;
          btn.innerHTML = '<span class="ms">fact_check</span>';
        }
      };
      document.body.appendChild(btn);
    },
  };

  function cleanToken(token) {
    if (token && token.includes('__q_strn|')) {
      return token.split('__q_strn|')[1];
    }
    return token;
  }

  let fetchMonitored = false;
  function monitorNetworkRequests() {
    if (fetchMonitored) return;
    fetchMonitored = true;

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      if (args[1] && args[1].headers) {
        const headers = args[1].headers;
        if (headers instanceof Headers) {
          const authHeader = headers.get('authorization') || headers.get('Authorization');
          if (authHeader && authHeader.startsWith('Bearer ')) {
            window.lastAuthToken = cleanToken(authHeader.substring(7));
          }
        } else {
          const authHeader = headers.authorization || headers.Authorization;
          if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            window.lastAuthToken = cleanToken(authHeader.substring(7));
          }
        }
      }
      return originalFetch.apply(this, args);
    };
  }

  async function getAuthToken() {
    const possibleTokens = [];

    for (const key of Object.keys(localStorage)) {
      let value = localStorage.getItem(key);
      if (
        value &&
        (value.includes('eyJ') || key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))
      ) {
        value = cleanToken(value);
        possibleTokens.push({ source: 'localStorage', key, value });
      }
    }

    for (const key of Object.keys(sessionStorage)) {
      let value = sessionStorage.getItem(key);
      if (
        value &&
        (value.includes('eyJ') || key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))
      ) {
        value = cleanToken(value);
        possibleTokens.push({ source: 'sessionStorage', key, value });
      }
    }

    for (const cookie of document.cookie.split(';')) {
      const [key, value] = cookie.trim().split('=');
      if (
        value &&
        key &&
        (value.includes('eyJ') || key.toLowerCase().includes('token') || key.toLowerCase().includes('auth'))
      ) {
        possibleTokens.push({ source: 'cookie', key, value: cleanToken(decodeURIComponent(value)) });
      }
    }

    if (window.lastAuthToken) {
      possibleTokens.push({
        source: 'networkMonitor',
        key: 'lastAuthToken',
        value: cleanToken(window.lastAuthToken),
      });
    }

    if (possibleTokens.length > 0) {
      return possibleTokens[0].value;
    }

    monitorNetworkRequests();
    return null;
  }

  function getXsrfToken() {
    const xsrfCookie = document.cookie.split(';').find((c) => c.trim().startsWith('XSRF-TOKEN='));
    return xsrfCookie ? decodeURIComponent(xsrfCookie.split('=')[1]) : '';
  }

  async function fetchJadwalKuliah(token) {
    const response = await fetch('https://my.unpam.ac.id/api/presensi/mahasiswa/jadwal-kuliah', {
      method: 'GET',
      headers: {
        accept: 'application/json, text/plain, */*',
        authorization: `Bearer ${token}`,
        'x-xsrf-token': getXsrfToken(),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }

  async function fetchPresensiPertemuan(token, idKelas, idMataKuliah) {
    const response = await fetch(
      `https://my.unpam.ac.id/api/presensi/mahasiswa/jadwal-pertemuan/${idKelas}/${idMataKuliah}`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json, text/plain, */*',
          authorization: `Bearer ${token}`,
          'x-xsrf-token': getXsrfToken(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }

  function showPopupMessage(message, type = 'info') {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: calc(100vw - 40px);
      padding: 13px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      z-index: 10002;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
      background-color: ${type === 'error' ? '#ef4444' : '#22c55e'};
      color: #ffffff;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 5000);
  }

  async function fetchAllPresensiData() {
    const token = await getAuthToken();
    if (!token) {
      showPopupMessage('Error: Token tidak ditemukan', 'error');
      return null;
    }

    try {
      const jadwalKuliah = await fetchJadwalKuliah(token);
      if (!jadwalKuliah || !jadwalKuliah.length) {
        showPopupMessage('Tidak ada jadwal kuliah yang ditemukan', 'error');
        return null;
      }

      const mahasiswaInfo = {
        nim: jadwalKuliah[0].nim,
        nama_mahasiswa: jadwalKuliah[0].nama_mahasiswa,
        id_semester_registrasi: jadwalKuliah[0].id_semester_registrasi,
        nama_semester_registrasi: jadwalKuliah[0].nama_semester_registrasi,
      };

      const results = await Promise.all(
        jadwalKuliah.map(async (jadwal) => {
          const { id_kelas, id_mata_kuliah, nama_mata_kuliah, sks } = jadwal;
          try {
            const presensiData = await fetchPresensiPertemuan(token, id_kelas, id_mata_kuliah);
            return {
              nama_mata_kuliah,
              id_mata_kuliah,
              id_kelas,
              sks,
              pertemuan: presensiData,
            };
          } catch (_err) {
            console.warn(`Gagal mengambil data untuk ${nama_mata_kuliah}`);
            return null;
          }
        })
      );

      const allPresensiData = results.filter(Boolean);
      allPresensiData.mahasiswa = mahasiswaInfo;
      UIRenderer.showMainPopup(allPresensiData);
      return allPresensiData;
    } catch (error) {
      console.warn('Kesalahan fetch presensi:', error);
      showPopupMessage('Terjadi kesalahan saat mengambil data', 'error');
      return null;
    }
  }

  Utils.injectMaterialIcons();
  UIRenderer.injectStyles();
  UIRenderer.addTrigger();
  monitorNetworkRequests();

  window.addEventListener('storage', (e) => {
    if (e.key && (e.key.toLowerCase().includes('token') || e.key.toLowerCase().includes('auth'))) {
      fetchAllPresensiData();
    }
  });
})();
