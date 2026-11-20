(() => {
  const isLoginPage = window.location.href === 'https://mentari.unpam.ac.id/login';
  if (isLoginPage) {
    console.log('Ekstensi tidak aktif di halaman login.');
    return;
  }

  console.log('Ekstensi berjalan di mentari.unpam.ac.id');

  try {
    document.documentElement.dataset.mentariIcon128 = chrome.runtime.getURL('src/assets/icon-128.png');
  } catch (_err) {}

  try {
    if (localStorage.getItem('gemini_enabled') === null) {
      localStorage.setItem('gemini_enabled', 'true');
    }
  } catch (_err) {}

  if (!document.getElementById('material-icons-css')) {
    const iconLink = document.createElement('link');
    iconLink.id = 'material-icons-css';
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20,400,0,0';
    document.head.appendChild(iconLink);
  }

  if (!document.getElementById('mentari-header-toggle-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'mentari-header-toggle-styles';
    styleEl.textContent = `
/* Soft elegant glow sweep every 3s */
@keyframes mentari-sweep {
  0% {
    opacity: 0;
    transform: translateX(-140%) scale(0.9);
  }
  8% {
    opacity: 0.25;
  }
  25% {
    opacity: 0.45;
  }
  45% {
    opacity: 0.3;
  }
  60% {
    opacity: 0;
    transform: translateX(140%) scale(1.05);
  }
  100% {
    opacity: 0;
    transform: translateX(140%) scale(1.05);
  }
}

#mentari-header-toggle {
  position: relative !important;
  overflow: hidden !important;
  isolation: isolate;
}

#mentari-header-toggle::after {
  content: '';
  position: absolute;
  inset: -20%;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(
    circle at center,
    rgba(255, 255, 255, 0.88) 0%,
    rgba(255, 255, 255, 0.68) 30%,
    transparent 75%
  );
  filter: blur(14px);
  mix-blend-mode: screen;
  animation: mentari-sweep 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Light Theme Glow: Use orange instead of white */
#mentari-header-toggle.light-theme::after {
  background: radial-gradient(
    circle at center,
    rgba(249, 115, 22, 0.6) 0%,
    rgba(249, 115, 22, 0.3) 30%,
    transparent 75%
  );
  mix-blend-mode: multiply;
}

/* Hover = subtle breathing glow */
#mentari-header-toggle:hover::after {
  animation: mentari-hover 2.5s ease-in-out infinite;
}

@keyframes mentari-hover {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(1.08);
  }
}
`;
    document.head.appendChild(styleEl);
  }

  let scriptsLoaded = false;
  let scriptsLoading = false;
  let pendingCallbacks = [];

  function ensureScriptsLoaded(callback) {
    if (scriptsLoaded) {
      if (callback) callback();
      return;
    }

    if (callback) pendingCallbacks.push(callback);
    if (scriptsLoading) return;
    scriptsLoading = true;

    const loadScript = (path, onDone) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(path);
      script.onload = onDone;
      script.onerror = onDone;
      document.body.appendChild(script);
    };

    loadScript('src/content/apiKeyManager.js', () => {
      loadScript('src/content/panelUI.js', () => {
        loadScript('src/content/guidebook.js', () => {
          loadScript('src/content/token.js', () => {
            scriptsLoaded = true;
            scriptsLoading = false;
            const queue = pendingCallbacks.slice();
            pendingCallbacks = [];
            queue.forEach((cb) => {
              try {
                cb();
              } catch (_e) {}
            });
          });
        });
      });
    });
  }

  function togglePopup() {
    ensureScriptsLoaded(() => {
      window.dispatchEvent(new CustomEvent('mentari-toggle-popup'));
    });
  }

  function injectHeaderToggle() {
    const existingBtn = document.getElementById('mentari-header-toggle');
    if (existingBtn) {
      const isLight = document.querySelector('.css-1yxmbwk') !== null;
      existingBtn.classList.toggle('light-theme', isLight);
      return;
    }

    const themeIcon = document.querySelector('svg[data-testid="DarkModeIcon"], svg[data-testid="LightModeIcon"]');
    if (!themeIcon) return;

    const themeButton = themeIcon.closest('button');
    const stackContainer = themeIcon.closest('.MuiStack-root');
    if (!stackContainer || !themeButton) return;

    const btn = document.createElement('button');
    btn.id = 'mentari-header-toggle';
    btn.type = 'button';
    btn.title = 'Mentari Assistant';
    btn.setAttribute('aria-label', 'Buka Mentari Assistant');
    btn.className = 'MuiButtonBase-root MuiIconButton-root MuiIconButton-sizeMedium';
    btn.style.marginRight = '8px';
    btn.style.padding = '8px';
    btn.style.backgroundColor = 'transparent';
    btn.style.border = '0';
    btn.style.borderRadius = '50%';
    btn.style.display = 'inline-flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.outline = '0';
    btn.style.color = '#f97316';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms';

    const updateThemeClass = () => {
      const isLight = document.querySelector('.css-1yxmbwk') !== null;
      btn.classList.toggle('light-theme', isLight);
    };
    updateThemeClass();

    btn.innerHTML =
      '<svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true" ' +
      'style="width:22px;height:22px;fill:#f97316;display:block;filter:drop-shadow(0 0 6px rgba(249,115,22,0.45));">' +
      '<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z"></path>' +
      '</svg><span class="MuiTouchRipple-root"></span>';

    btn.onmouseover = () => {
      btn.style.backgroundColor = 'rgba(249, 115, 22, 0.14)';
    };
    btn.onmouseout = () => {
      btn.style.backgroundColor = 'transparent';
    };
    btn.onclick = (e) => {
      e.preventDefault();
      togglePopup();
    };

    stackContainer.insertBefore(btn, themeButton);
    console.log('Mentari Toggle injected to header.');
  }

  const observer = new MutationObserver(() => injectHeaderToggle());
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  setInterval(injectHeaderToggle, 1000);

  setTimeout(() => {
    ensureScriptsLoaded(null);
  }, 300);
})();
