(() => {
  function automateFlow(mode) {
    function clickRadios(selectedMode) {
      if (selectedMode === 'Setuju') {
        document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
          const radios = Array.from(group.querySelectorAll('[role="radio"]'));
          if (radios.length >= 3) radios[2].click();
        });
      } else if (selectedMode === 'Random') {
        document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
          const radios = Array.from(group.querySelectorAll('[role="radio"]'));
          if (radios.length >= 4) {
            const weightedChoices = [1, 2, 2, 3, 3];
            const randomChoice = weightedChoices[Math.floor(Math.random() * weightedChoices.length)];
            radios[randomChoice].click();
          }
        });
      } else if (selectedMode.startsWith('star')) {
        const rating = parseInt(selectedMode.slice(4), 10);
        const weightsByRating = {
          1: [0.7, 0.3, 0, 0],
          2: [0.3, 0.7, 0, 0],
          3: [0, 0.4, 0.6, 0],
          4: [0, 0, 0.7, 0.3],
          5: [0, 0, 0.3, 0.7],
        };
        const weights = weightsByRating[rating] || [0, 0, 0.5, 0.5];

        document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
          const radios = Array.from(group.querySelectorAll('[role="radio"]'));
          const random = Math.random();
          let sum = 0;
          let selectedIndex = 0;
          for (let i = 0; i < weights.length; i++) {
            sum += weights[i];
            if (random < sum) {
              selectedIndex = i;
              break;
            }
          }
          if (radios[selectedIndex]) radios[selectedIndex].click();
        });
      } else {
        document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
          const radios = Array.from(group.querySelectorAll('[role="radio"]'));
          if (radios.length > 0) {
            radios[Math.floor(Math.random() * radios.length)].click();
          }
        });
      }
    }

    function findAndClickButtons() {
      clickRadios(mode);

      setTimeout(() => {
        const buttons = document.querySelectorAll('button.q-btn.bg-blue-6.text-white');
        let foundNextButton = false;

        buttons.forEach((button) => {
          const spanContent = button.querySelector('.block');
          if (spanContent && spanContent.textContent === 'SELANJUTNYA') {
            foundNextButton = true;
            button.click();
            setTimeout(findAndClickButtons, 500);
          }
        });

        if (!foundNextButton) {
          buttons.forEach((button) => {
            const spanContent = button.querySelector('.block');
            if (spanContent && spanContent.textContent === 'SIMPAN') {
              button.click();
            }
          });
        }
      }, 500);
    }

    clickRadios(mode);
    setTimeout(findAndClickButtons, 500);
  }

  const SurveyConfig = {
    APP_VERSION: '1.3.0',
    STYLES: `
      #quick-survey-popup-root {
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
        animation: mentari-survey-fadein 0.25s ease-out;
      }
      .survey-container {
        background: #121316;
        color: #f3f4f6;
        width: 92%;
        max-width: 450px;
        max-height: 92dvh;
        border-radius: 16px;
        border: 1px solid #2a2d35;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Light Theme Adaptation */
      #quick-survey-popup-root.light-theme .survey-container {
        background: #ffffff;
        color: #1a1c1e;
        border-color: rgba(0, 0, 0, 0.1);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
      }
      #quick-survey-popup-root.light-theme .popup-header {
        background: #f8f9fa;
        border-bottom-color: rgba(0, 0, 0, 0.08);
      }
      #quick-survey-popup-root.light-theme .popup-title {
        color: #ea580c;
      }
      #quick-survey-popup-root.light-theme .survey-card {
        background: #f8fafc;
        border-color: rgba(0, 0, 0, 0.08);
      }
      #quick-survey-popup-root.light-theme .card-label {
        color: #64748b;
      }
      #quick-survey-popup-root.light-theme .survey-guide {
        color: #ea580c;
      }
      #quick-survey-popup-root.light-theme .survey-footer {
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
        color: #f97316;
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
        padding: 4px;
        border-radius: 50%;
      }
      .popup-close-btn:hover {
        opacity: 1;
        background: rgba(255, 255, 255, 0.08);
      }

      .survey-body {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow-y: auto;
      }
      .survey-card {
        background: #1b1d22;
        border: 1px solid #2a2d35;
        border-radius: 12px;
        padding: 14px;
      }
      .card-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        opacity: 0.65;
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }

      .star-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }
      .rating-btn {
        padding: 10px 4px;
        border-radius: 8px;
        border: 1px solid transparent;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .rating-btn span {
        font-size: 9px;
        opacity: 0.85;
        font-weight: 500;
        text-align: center;
      }

      .btn-r1 { background: rgba(239, 68, 68, 0.14); color: #f87171; }
      .btn-r2 { background: rgba(249, 115, 22, 0.14); color: #fb923c; }
      .btn-r3 { background: rgba(251, 146, 60, 0.14); color: #fdba74; }
      .btn-r4 { background: rgba(74, 222, 128, 0.14); color: #4ade80; }
      .btn-r5 { background: rgba(34, 197, 94, 0.16); color: #22c55e; }

      .rating-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        border-color: currentColor;
      }

      .option-btn {
        width: 100%;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid #2a2d35;
        background: #14161a;
        color: inherit;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .option-btn:last-child {
        margin-bottom: 0;
      }
      .option-btn:hover {
        background: rgba(249, 115, 22, 0.12);
        border-color: #f97316;
        color: #fb923c;
        padding-left: 16px;
      }

      .survey-warning {
        background: rgba(250, 204, 21, 0.08);
        border: 1px solid rgba(250, 204, 21, 0.25);
        border-radius: 10px;
        padding: 11px 12px;
        font-size: 11px;
        color: #facc15;
        line-height: 1.5;
        display: flex;
        gap: 10px;
      }
      .survey-warning .ms {
        color: #facc15;
        font-size: 18px;
        flex-shrink: 0;
      }

      .survey-guide {
        background: rgba(249, 115, 22, 0.08);
        border: 1px solid rgba(249, 115, 22, 0.25);
        border-radius: 10px;
        padding: 11px 12px;
        font-size: 11px;
        color: #fb923c;
        line-height: 1.5;
        display: flex;
        gap: 10px;
      }
      .survey-guide .ms {
        color: #f97316;
        font-size: 18px;
        flex-shrink: 0;
      }

      .survey-footer {
        padding: 13px 20px;
        background: #14161a;
        border-top: 1px solid #26282e;
        font-size: 11px;
        text-align: center;
        opacity: 0.65;
      }

      .quick-survey-trigger {
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
        overflow: hidden;
        isolation: isolate;
      }
      .quick-survey-trigger::after {
        content: '';
        position: absolute;
        inset: -20%;
        background: radial-gradient(
          circle at center,
          rgba(249, 115, 22, 0.65) 0%,
          rgba(234, 88, 12, 0.35) 40%,
          transparent 75%
        );
        border-radius: 50%;
        filter: blur(10px);
        z-index: 1;
        animation: mentari-survey-glow 2.5s ease-in-out infinite;
        pointer-events: none;
        mix-blend-mode: screen;
      }
      .quick-survey-trigger:hover {
        background: #f97316;
        color: #ffffff;
        border-color: #f97316;
        transform: translateY(-3px) scale(1.06);
        box-shadow: 0 8px 25px rgba(249, 115, 22, 0.38);
      }
      .quick-survey-trigger::before {
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
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        z-index: 10;
      }
      .quick-survey-trigger:hover::before {
        opacity: 1;
        bottom: 55px;
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

      @media (max-width: 600px) {
        .survey-container {
          width: 96%;
          max-width: calc(100vw - 16px);
          border-radius: 12px;
        }
        .popup-header,
        .survey-footer {
          padding: 12px 16px;
        }
        .survey-body {
          padding: 14px;
          gap: 12px;
        }
        .star-grid {
          gap: 6px;
        }
        .rating-btn {
          padding: 8px 2px;
          font-size: 13px;
        }
      }

      @keyframes mentari-survey-glow {
        0%, 100% { opacity: 0.35; transform: scale(0.9); }
        50% { opacity: 0.85; transform: scale(1.1); }
      }
      @keyframes mentari-survey-fadein {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  };

  function injectSurveyStyles() {
    if (!document.getElementById('mentari-survey-styles')) {
      const style = document.createElement('style');
      style.id = 'mentari-survey-styles';
      style.textContent = SurveyConfig.STYLES;
      document.head.appendChild(style);
    }

    if (!document.getElementById('ms-presensi-icons')) {
      const link = document.createElement('link');
      link.id = 'ms-presensi-icons';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0';
      document.head.appendChild(link);
    }
  }

  function createQuickSurveyToggle() {
    injectSurveyStyles();
    let container = document.getElementById('floatingButtonContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'floatingButtonContainer';
      container.style.cssText =
        'position:fixed; bottom:20px; left:74px; display:flex; flex-direction:row; gap:12px; z-index:9999; align-items:flex-end;';
      document.body.appendChild(container);
    }

    if (document.getElementById('quickSurveyToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'quickSurveyToggle';
    btn.type = 'button';
    btn.className = 'quick-survey-trigger';
    btn.setAttribute('data-title', 'Quick Survey Otomatis');
    btn.innerHTML = '<span class="ms">auto_awesome</span>';
    btn.onclick = () => createQuickSurveyPopup();
    container.appendChild(btn);
  }

  function createQuickSurveyPopup() {
    const isLight = document.querySelector('.css-1yxmbwk') !== null;
    let root = document.getElementById('quick-survey-popup-root');
    if (root) root.remove();

    root = document.createElement('div');
    root.id = 'quick-survey-popup-root';
    if (isLight) root.classList.add('light-theme');

    root.innerHTML = `
      <div class="survey-container">
        <div class="popup-header">
          <div class="popup-title"><span class="ms" style="color:#f97316; font-size:24px;">bolt</span> Quick Survey</div>
          <button type="button" class="popup-close-btn" id="s-close-btn" title="Tutup"><span class="ms">close</span></button>
        </div>

        <div class="survey-body">
          <div class="survey-guide">
            <span class="ms">info</span>
            <div>
              <strong>Cara Penggunaan:</strong> Klik "Isi Kuesioner" pada mata kuliah yang diinginkan di halaman KHS, lalu gunakan tombol di bawah ini untuk pengisian otomatis.
            </div>
          </div>

          <div class="survey-warning">
            <span class="ms">report</span>
            <div>
              <strong>Peringatan:</strong> Gunakan fitur ini dengan bijak. Quick Survey mengisi penilaian secara otomatis berdasarkan rata-rata rentang yang Anda pilih.
            </div>
          </div>

          <div class="survey-card">
            <div class="card-label">Penilaian Kinerja Dosen</div>
            <div class="star-grid">
              <button type="button" class="rating-btn btn-r1" data-v="star1">1<span>Buruk</span></button>
              <button type="button" class="rating-btn btn-r2" data-v="star2">2<span>Kurang</span></button>
              <button type="button" class="rating-btn btn-r3" data-v="star3">3<span>Cukup</span></button>
              <button type="button" class="rating-btn btn-r4" data-v="star4">4<span>Baik</span></button>
              <button type="button" class="rating-btn btn-r5" data-v="star5">5<span>Sangat Baik</span></button>
            </div>
          </div>

          <div class="survey-card" style="padding:12px;">
            <div class="card-label" style="margin-bottom:8px;">Opsi Otomasi</div>
            <button type="button" class="option-btn" id="opt-all-good"><span class="ms">done_all</span> Pilih Semua "Setuju"</button>
            <button type="button" class="option-btn" id="opt-random-safe"><span class="ms">shuffle</span> Random (Aman)</button>
            <button type="button" class="option-btn" id="opt-chaos"><span class="ms">warning</span> Acak Total</button>
          </div>
        </div>

        <div class="survey-footer">
          Mentari Assistant • v${SurveyConfig.APP_VERSION}
        </div>
      </div>
    `;

    document.body.appendChild(root);
    root.onclick = (e) => {
      if (e.target === root) root.remove();
    };
    document.getElementById('s-close-btn').onclick = () => root.remove();

    document.querySelectorAll('.rating-btn').forEach((btn) => {
      btn.onclick = () => {
        automateFlow(btn.dataset.v);
        root.remove();
      };
    });

    const actions = {
      'opt-all-good': 'Setuju',
      'opt-random-safe': 'Random',
      'opt-chaos': 'FullRandom',
    };

    Object.entries(actions).forEach(([id, mode]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.onclick = () => {
          automateFlow(mode);
          root.remove();
        };
      }
    });
  }

  function removeQuickSurveyElements() {
    document.getElementById('quickSurveyToggle')?.remove();
    document.getElementById('floatingButtonContainer')?.remove();
    document.getElementById('quick-survey-popup-root')?.remove();
  }

  function initializeQuickSurvey() {
    removeQuickSurveyElements();
    createQuickSurveyToggle();
  }

  function checkUrlAndInitialize() {
    const currentUrl = window.location.href;
    const targetPrefix = 'https://my.unpam.ac.id/data-akademik/khs';
    if (currentUrl.startsWith(targetPrefix)) {
      initializeQuickSurvey();
    } else {
      removeQuickSurveyElements();
    }
  }

  function observeUrlChanges() {
    let lastUrl = window.location.href;
    const checkUrlChange = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        checkUrlAndInitialize();
      }
    };

    const observer = new MutationObserver(() => checkUrlChange());
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
    window.addEventListener('popstate', checkUrlChange);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      checkUrlChange();
    };
    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      checkUrlChange();
    };

    checkUrlAndInitialize();
  }

  observeUrlChanges();
})();
