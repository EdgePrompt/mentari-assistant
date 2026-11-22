(() => {
  if (window.MentariPanelUI) return;

  const SVG_PATHS = {
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    tasks: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    groups: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    notif: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    presensi: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M9 14l2 2 4-4"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>',
    chevronRight: '<polyline points="9 18 15 12 9 6"/>',
    forum: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    quiz: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
    kuesioner: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    video: '<polygon points="5 3 19 12 5 21 5 3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    reply: '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    sparkle: '<path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  };

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function icon(name, size = 16, extraClass = "") {
    const key = typeof name === "string" && Object.hasOwn(SVG_PATHS, name) ? name : "doc";
    const path = SVG_PATHS[key];
    const numSize = Number(size);
    const safeSize = Number.isFinite(numSize) && numSize > 0 ? numSize : 16;
    const safeExtra = String(extraClass || "")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .trim();
    const cls = safeExtra ? `ui-ico ${safeExtra}` : "ui-ico";
    return `<svg class="${cls}" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
  }

  const PANEL_CSS = `
    :host {
      --bg-panel: #0f1115;
      --bg-surface: #161920;
      --bg-elevated: #1e222b;
      --bg-hover: rgba(255, 255, 255, 0.06);
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(255, 255, 255, 0.16);
      --text-primary: #f3f4f6;
      --text-secondary: #9ca3af;
      --accent: #f97316;
      --accent-hover: #ea580c;
      --accent-soft: rgba(249, 115, 22, 0.14);
      --success: #22c55e;
      --success-text: #4ade80;
      --success-soft: rgba(34, 197, 94, 0.14);
      --info: #38bdf8;
      --info-soft: rgba(56, 189, 248, 0.14);
      --danger: #ef4444;
      --danger-text: #f87171;
      --danger-soft: rgba(239, 68, 68, 0.14);
      --shadow-panel: 0 22px 54px rgba(0, 0, 0, 0.58);
      color-scheme: dark;
      background: transparent;
      position: fixed;
      z-index: 99999;
      top: 70px;
      right: 20px;
      width: 460px;
      height: 600px;
      max-height: calc(100dvh - 88px);
      display: block;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.45;
      color: var(--text-primary);
      pointer-events: none;
      visibility: hidden;
    }

    :host(.active) {
      pointer-events: auto;
      visibility: visible;
    }

    :host([data-theme="light"]) {
      --bg-panel: #f8fafc;
      --bg-surface: #ffffff;
      --bg-elevated: #f1f5f9;
      --bg-hover: rgba(15, 23, 42, 0.05);
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --accent: #ea580c;
      --accent-hover: #c2410c;
      --accent-soft: rgba(234, 88, 12, 0.11);
      --success: #16a34a;
      --success-text: #15803d;
      --success-soft: rgba(22, 163, 74, 0.10);
      --info: #0284c7;
      --info-soft: rgba(2, 132, 199, 0.10);
      --danger: #dc2626;
      --danger-text: #b91c1c;
      --danger-soft: rgba(220, 38, 38, 0.10);
      --shadow-panel: 0 18px 46px rgba(15, 23, 42, 0.18);
      color-scheme: light;
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    [hidden] {
      display: none !important;
    }

    button, input, select, textarea {
      font: inherit;
      color: inherit;
    }

    :focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    .ui-ico {
      flex-shrink: 0;
      display: inline-block;
      vertical-align: middle;
    }

    .panel-shell {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--bg-panel);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: 14px;
      box-shadow: var(--shadow-panel);
      overflow: hidden;
      opacity: 0;
      transform: translateY(-10px) scale(0.97);
      transition: transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease;
    }

    :host(.active) .panel-shell {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .token-loading-bar {
      position: absolute;
      top: 0;
      left: 0;
      height: 2px;
      width: 0;
      background: var(--accent);
      transition: width 0.28s ease;
      z-index: 20;
    }

    .token-loading-bar.active {
      width: 100%;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 11px 14px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: 9px;
      min-width: 0;
    }

    .popup-logo-img {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .popup-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .popup-version-badge {
      font-size: 10px;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--accent);
      background: var(--accent-soft);
      border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
      padding: 2px 7px;
      border-radius: 999px;
      flex-shrink: 0;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }

    .icon-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .icon-btn[aria-pressed="true"] {
      background: var(--accent-soft);
      color: var(--accent);
      border-color: color-mix(in srgb, var(--accent) 35%, transparent);
    }

    .token-tabs {
      display: flex;
      align-items: stretch;
      gap: 4px;
      padding: 6px 12px 0;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }

    .token-tab {
      position: relative;
      flex: 1;
      min-width: 0;
      height: 38px;
      padding: 0 6px;
      border: none;
      border-radius: 8px 8px 0 0;
      background: transparent;
      color: var(--text-secondary);
      font-size: 11.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: color 0.15s, background 0.15s;
    }

    .token-tab:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }

    .token-tab[aria-selected="true"] {
      color: var(--accent);
    }

    .token-tab[aria-selected="true"]::after {
      content: "";
      position: absolute;
      inset: auto 10px 0 10px;
      border-block-end: 2.5px solid var(--accent);
      border-radius: 2px 2px 0 0;
    }

    .tab-badge {
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--accent);
      color: #fff;
      font-size: 9.5px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      display: none;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .panel-body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .token-tab-content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 14px 16px;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }

    .token-tab-content[hidden] {
      display: none;
    }

    .token-tab-content::-webkit-scrollbar,
    .guide-scroll::-webkit-scrollbar,
    .settings-model-list::-webkit-scrollbar {
      width: 5px;
    }
    .token-tab-content::-webkit-scrollbar-thumb,
    .guide-scroll::-webkit-scrollbar-thumb,
    .settings-model-list::-webkit-scrollbar-thumb {
      background: var(--border-strong);
      border-radius: 99px;
    }

    /* Guide View */
    .guide-view {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .guide-view[hidden] {
      display: none;
    }
    .guide-subbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .guide-scroll {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }
    .guide-card-block {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 12px;
    }
    .guide-step-tag {
      display: inline-block;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 2px 7px;
      border-radius: 5px;
      margin-bottom: 6px;
    }
    .guide-card-title {
      margin: 0 0 5px;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-primary);
    }
    .guide-card-text {
      margin: 0;
      font-size: 11.5px;
      color: var(--text-secondary);
      line-height: 1.55;
    }
    .guide-tip-list {
      margin: 8px 0 0;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--bg-elevated);
      font-size: 11px;
      color: var(--text-secondary);
      line-height: 1.55;
    }

    /* Shared UI Primitives */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      color: var(--text-primary);
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s, border-color 0.15s, transform 0.12s;
    }
    .btn:hover:not(:disabled) {
      background: var(--bg-hover);
      border-color: var(--border-strong);
    }
    .btn:active:not(:disabled) {
      transform: scale(0.98);
    }
    .btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .btn-primary {
      background: var(--accent);
      border-color: transparent;
      color: #ffffff;
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--accent-hover);
      border-color: transparent;
    }
    .btn-success {
      background: var(--success-soft);
      border-color: color-mix(in srgb, var(--success) 30%, transparent);
      color: var(--success-text);
    }
    .btn-danger {
      background: var(--danger-soft);
      border-color: color-mix(in srgb, var(--danger) 30%, transparent);
      color: var(--danger-text);
    }
    .btn-danger:hover:not(:disabled) {
      background: color-mix(in srgb, var(--danger) 22%, transparent);
      border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    }
    .btn-sm {
      height: 28px;
      padding: 0 9px;
      font-size: 11px;
      border-radius: 6px;
    }
    .btn-icon-sq {
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: 6px;
      flex-shrink: 0;
    }

    .summary-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 8px 10px;
      margin-bottom: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
    }
    .summary-status {
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }
    .toolbar-stack {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box .search-ico {
      position: absolute;
      left: 10px;
      color: var(--text-secondary);
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      height: 34px;
      padding: 0 30px 0 32px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      font-size: 12px;
      outline: none;
      transition: border-color 0.15s;
    }
    .search-input:focus {
      border-color: var(--accent);
    }
    .search-input:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }
    .search-clear {
      position: absolute;
      right: 6px;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .search-clear.visible {
      display: inline-flex;
    }
    .filter-chips {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }
    .filter-chips::-webkit-scrollbar { display: none; }
    .chip-btn {
      flex: none;
      height: 27px;
      padding: 0 10px;
      border-radius: 999px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: var(--text-secondary);
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .chip-btn:hover {
      background: var(--bg-hover);
      color: var(--text-primary);
    }
    .chip-btn.active {
      background: var(--accent-soft);
      border-color: color-mix(in srgb, var(--accent) 45%, transparent);
      color: var(--accent);
    }

    /* Course & Section Cards */
    .course-card {
      margin-bottom: 12px;
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      background: var(--bg-surface);
      overflow: hidden;
    }
    .course-card[hidden],
    .section-card[hidden],
    .item-row[hidden],
    .student-row[hidden] {
      display: none !important;
    }
    .course-card-header {
      padding: 12px 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--bg-surface);
    }
    .course-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }
    .course-title {
      margin: 0;
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.35;
      color: var(--text-primary);
    }
    .course-meta-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 5px;
    }
    .course-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 600;
    }
    .course-chip-sks { background: var(--info-soft); color: var(--info); }
    .course-chip-day { background: var(--success-soft); color: var(--success-text); }
    .course-chip-class { background: var(--accent-soft); color: var(--accent); }
    .course-code {
      font-size: 10px;
      color: var(--text-secondary);
      margin-top: 4px;
      display: block;
    }
    .course-progress-box {
      text-align: right;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }
    .course-progress-value {
      font-size: 13px;
      font-weight: 800;
      color: var(--success-text);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .course-progress-label {
      font-size: 10px;
      color: var(--text-secondary);
      display: block;
    }
    .course-progress-track {
      width: 100%;
      height: 4px;
      background: var(--bg-elevated);
      border-radius: 99px;
      overflow: hidden;
    }
    .course-progress-bar {
      height: 100%;
      background: var(--accent);
      border-radius: 99px;
      transition: width 0.35s ease;
    }
    .course-card-body {
      padding: 8px 10px 10px;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: var(--bg-panel);
    }

    .section-card {
      border: 1px solid var(--border-subtle);
      border-radius: 9px;
      background: var(--bg-surface);
      overflow: hidden;
    }
    .section-card:has(.section-content.active) {
      border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    }
    .section-header {
      width: 100%;
      border: none;
      background: transparent;
      padding: 9px 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      text-align: left;
      transition: background 0.15s;
    }
    .section-header:hover {
      background: var(--bg-hover);
    }
    .section-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .section-header-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: var(--accent-soft);
      color: var(--accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .section-header-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .section-toggle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: transform 0.2s ease, color 0.15s;
      flex-shrink: 0;
    }
    .section-toggle.active {
      transform: rotate(180deg);
      color: var(--accent);
    }
    .section-content {
      display: none;
      padding: 8px;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-panel);
      flex-direction: column;
      gap: 6px;
    }
    .section-content.active {
      display: flex;
    }

    .item-row {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      background: var(--bg-surface);
      overflow: hidden;
      transition: border-color 0.15s;
    }
    .item-row:hover {
      border-color: var(--border-strong);
    }
    .item-row.completed-item {
      opacity: 0.72;
    }
    .item-main {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      padding: 9px 10px;
      cursor: pointer;
    }
    .item-icon {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .icon-forum { background: var(--accent-soft); color: var(--accent); }
    .icon-quiz { background: var(--success-soft); color: var(--success-text); }
    .icon-material { background: var(--info-soft); color: var(--info); }
    .item-info {
      flex: 1;
      min-width: 0;
    }
    .item-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .completed-item .item-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }
    .item-meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      font-size: 10.5px;
      color: var(--text-secondary);
    }
    .item-status {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 5px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-done {
      background: var(--success-soft);
      color: var(--success-text);
    }
    .status-todo {
      background: var(--accent-soft);
      color: var(--accent);
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .forum-html-preview {
      padding: 10px;
      border-top: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      font-size: 11.5px;
      line-height: 1.5;
      color: var(--text-primary);
    }
    .forum-html-preview[hidden] {
      display: none;
    }
    .forum-html-preview p { margin: 0 0 8px; }
    .forum-html-preview ul, .forum-html-preview ol {
      padding-left: 18px;
      margin: 0 0 8px;
    }
    .topics-container {
      padding: 0 9px 9px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .topics-container:empty {
      display: none;
    }
    .topic-card {
      padding: 9px 10px;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      background: var(--bg-elevated);
      font-size: 11.5px;
    }
    .topic-badge {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 6px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      text-decoration: none;
    }
    .forum-reply-form {
      margin-top: 4px;
      padding: 10px;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
      border-radius: 8px;
      background: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .forum-reply-input,
    .settings-input,
    .settings-select {
      width: 100%;
      padding: 7px 10px;
      border-radius: 7px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-panel);
      font-size: 12px;
      outline: none;
    }
    .forum-reply-input:focus,
    .settings-input:focus,
    .settings-select:focus {
      border-color: var(--accent);
    }
    .forum-reply-input:focus-visible,
    .settings-input:focus-visible,
    .settings-select:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 1px;
    }

    /* Kelas / Students Tab */
    .student-list-card {
      border: 1px solid var(--border-subtle);
      border-radius: 12px;
      background: var(--bg-surface);
      overflow: hidden;
    }
    .student-list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12.5px;
      font-weight: 700;
    }
    .student-count {
      padding: 1px 7px;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 10.5px;
      font-variant-numeric: tabular-nums;
      margin-left: 6px;
    }
    .student-model-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px;
    }
    .student-row {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-panel);
    }
    .student-avatar {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      background: var(--accent-soft);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .student-info {
      flex: 1;
      min-width: 0;
    }
    .student-name {
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .student-meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      font-size: 10.5px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .student-nim {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      color: var(--accent);
      font-weight: 600;
    }

    /* Notif Tab */
    .notif-toolbar {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }
    .notif-toolbar-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .notif-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }
    .notif-scope-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .notif-card {
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
      border-left: 3px solid var(--accent);
      background: var(--bg-surface);
    }
    .notif-card-course {
      font-size: 10.5px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    /* Settings Tab */
    .settings-profile {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px 12px;
      margin-bottom: 10px;
      border-radius: 10px;
      border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
      background: var(--accent-soft);
    }
    .settings-avatar {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--accent);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 800;
      flex-shrink: 0;
    }
    .settings-label {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
    }
    .settings-desc {
      font-size: 11px;
      color: var(--text-secondary);
    }
    .settings-quick-links {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }
    .settings-section {
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      background: var(--bg-surface);
      overflow: hidden;
      margin-bottom: 10px;
    }
    .settings-section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 9px 12px;
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border-subtle);
      font-size: 12px;
      font-weight: 700;
    }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .settings-row:last-child { border-bottom: 0; }
    .settings-row-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
    }
    .settings-row-desc {
      font-size: 10.5px;
      color: var(--text-secondary);
      margin-top: 2px;
    }
    .segmented {
      display: inline-flex;
      padding: 2px;
      border-radius: 8px;
      background: var(--bg-panel);
      border: 1px solid var(--border-subtle);
      gap: 2px;
    }
    .segmented-btn {
      border: none;
      background: transparent;
      color: var(--text-secondary);
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .segmented-btn.active {
      background: var(--accent);
      color: #ffffff;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      inset: 0;
      cursor: pointer;
      background: var(--border-strong);
      border-radius: 999px;
      transition: background 0.2s;
    }
    .slider::before {
      content: "";
      position: absolute;
      width: 16px;
      height: 16px;
      left: 3px;
      bottom: 3px;
      background: #ffffff;
      border-radius: 50%;
      transition: transform 0.2s;
    }
    input:checked + .slider { background: var(--accent); }
    input:checked + .slider::before { transform: translateX(18px); }
    input:focus-visible + .slider { outline: 2px solid var(--accent); outline-offset: 2px; }

    .settings-model-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
      max-height: 160px;
      overflow-y: auto;
      padding: 6px;
      margin-top: 8px;
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      background: var(--bg-panel);
      scrollbar-width: thin;
      scrollbar-color: var(--border-strong) transparent;
    }
    .mentari-model-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 9px;
      border-radius: 7px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      cursor: pointer;
    }
    .mentari-model-item.is-active {
      border-color: var(--accent);
      background: var(--accent-soft);
    }
    .settings-disclaimer {
      padding: 9px 11px;
      margin: 10px 0;
      border-left: 3px solid var(--accent);
      border-radius: 7px;
      background: var(--accent-soft);
      font-size: 10.5px;
      color: var(--text-secondary);
    }
    .settings-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 10.5px;
      color: var(--text-secondary);
      padding-top: 4px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--accent-soft);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .empty-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .empty-desc {
      font-size: 11.5px;
      color: var(--text-secondary);
      max-width: 260px;
    }
    .mentari-spin {
      animation: mentariSpin 0.9s linear infinite;
    }
    @keyframes mentariSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @media (max-width: 600px) {
      :host {
        inset: 0;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 100dvh;
        max-height: 100dvh;
      }
      .panel-shell {
        border-radius: 0;
        border: none;
        transform: translateY(18px);
      }
      :host(.active) .panel-shell {
        transform: translateY(0);
      }
      .panel-body {
        order: 1;
      }
      .token-tabs {
        order: 2;
        min-height: 52px;
        padding: 4px 8px calc(4px + env(safe-area-inset-bottom, 0px));
        border-bottom: none;
        border-top: 1px solid var(--border-subtle);
      }
      .token-tab {
        height: 48px;
        flex-direction: column;
        gap: 2px;
        font-size: 10.5px;
        border-radius: 8px;
      }
      .token-tab[aria-selected="true"]::after {
        inset: 0 18px auto 18px;
        border-block-end: none;
        border-block-start: 2.5px solid var(--accent);
        border-radius: 0 0 2px 2px;
      }
      .tab-badge {
        position: absolute;
        top: 4px;
        right: calc(50% - 22px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel-shell, .token-loading-bar, .section-toggle, .btn, .slider, .slider::before {
        transition: none !important;
        animation: none !important;
      }
    }
  `;

  function resolveTheme(mode = "auto") {
    if (mode === "dark" || mode === "light") return mode;
    return typeof document !== "undefined" &&
      typeof document.querySelector === "function" &&
      document.querySelector(".css-1yxmbwk") !== null
      ? "light"
      : "dark";
  }

  function applyTheme(host, mode = "auto") {
    if (!host || typeof host.setAttribute !== "function") return "dark";
    const resolved = resolveTheme(mode);
    host.setAttribute("data-theme", resolved);
    return resolved;
  }

  function removeElement(el) {
    if (!el) return;
    if (typeof el.remove === "function") el.remove();
    else el.parentNode?.removeChild?.(el);
  }

  function ensureToastLayer() {
    let layer = document.getElementById("mentari-toast-layer");
    if (!layer) {
      const mount = document.body || document.documentElement;
      if (!mount) return null;
      layer = document.createElement("div");
      layer.id = "mentari-toast-layer";
      layer.className = "toast-layer";
      layer.style.cssText =
        "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483647;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:calc(100vw - 24px);";
      mount.appendChild(layer);
    }
    return layer;
  }

  function toast(msg, variant = "info") {
    const layer = ensureToastLayer();
    if (!layer) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    const isSuccess = variant === "success";
    t.style.cssText = isSuccess
      ? "pointer-events:auto;background:#14281d;color:#4ade80;border:1px solid rgba(34,197,94,0.4);padding:8px 14px;border-radius:999px;font-size:11.5px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.45);display:inline-flex;align-items:center;gap:6px;white-space:nowrap;max-width:calc(100vw - 32px);overflow:hidden;text-overflow:ellipsis;"
      : "pointer-events:auto;background:#161920;color:#f3f4f6;border:1px solid rgba(249,115,22,0.38);padding:8px 14px;border-radius:999px;font-size:11.5px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.45);display:inline-flex;align-items:center;gap:6px;white-space:nowrap;max-width:calc(100vw - 32px);overflow:hidden;text-overflow:ellipsis;";
    t.textContent = String(msg ?? "");
    layer.appendChild(t);
    const timer = setTimeout(() => removeElement(t), isSuccess ? 3000 : 2500);
    if (typeof timer?.unref === "function") timer.unref();
  }

  function setActiveTab(host, tabId, options = {}) {
    const sr = host?.shadowRoot;
    if (!sr) return;
    const tabs = Array.from(sr.querySelectorAll('[role="tab"]'));
    if (tabs.length === 0) return;
    const hasMatch = tabs.some((tab) => tab.dataset?.tab === tabId);
    if (!hasMatch) return;
    const shouldFocus = Boolean(options?.focus);
    tabs.forEach((tab) => {
      const active = tab.dataset?.tab === tabId;
      tab.setAttribute("aria-selected", active ? "true" : "false");
      tab.setAttribute("tabindex", active ? "0" : "-1");
      if (active && shouldFocus && typeof tab.focus === "function") tab.focus();
    });
    sr.querySelectorAll('[role="tabpanel"]').forEach((panel) => {
      const match = panel.id === `${tabId}-tab`;
      panel.hidden = !match;
      panel.classList?.toggle("active", match);
    });
  }

  function setGuideOpen(host, isOpen) {
    const sr = host?.shadowRoot;
    if (!sr) return;
    const open = Boolean(isOpen);
    const body = sr.querySelector(".panel-body");
    const tabs = sr.querySelector(".token-tabs");
    const guide = sr.getElementById("panel-guide-view");
    const guideBtn = sr.getElementById("panel-guide-btn");
    if (body) body.hidden = open;
    if (tabs) tabs.hidden = open;
    if (guide) guide.hidden = !open;
    if (guideBtn) guideBtn.setAttribute("aria-pressed", open ? "true" : "false");
  }

  function setLoading(host, active) {
    const bar = host?.shadowRoot?.querySelector(".token-loading-bar");
    if (bar) bar.classList.toggle("active", Boolean(active));
  }

  function createHost(options = {}) {
    const { appVersion, onRefresh, onClose, onToggleGuide, onTabChange } = options || {};
    let host = document.getElementById("token-runner-popup");
    if (host && host.shadowRoot) return { host, shadowRoot: host.shadowRoot };
    if (host) removeElement(host);

    host = document.createElement("div");
    host.id = "token-runner-popup";
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-label", "Mentari Assistant Panel");

    const sr = host.attachShadow({ mode: "open", delegatesFocus: true });

    const styleEl = document.createElement("style");
    styleEl.textContent = PANEL_CSS;
    sr.appendChild(styleEl);

    const shell = document.createElement("div");
    shell.className = "panel-shell";
    shell.innerHTML = `
      <div class="token-loading-bar"></div>
      <header class="panel-header">
        <div class="header-brand">
          <img class="popup-logo-img" alt="Mentari Assistant" />
          <span class="popup-title">Mentari Assistant</span>
          <span class="popup-version-badge">v${escapeHtml(appVersion || "1.3.1")}</span>
        </div>
        <div class="header-actions">
          <button type="button" id="panel-guide-btn" class="icon-btn" title="Buku Panduan" aria-label="Buka Panduan" aria-pressed="false">${icon("help", 16)}</button>
          <button type="button" id="token-refresh-btn" class="icon-btn" title="Perbarui data" aria-label="Perbarui data">${icon("refresh", 16)}</button>
          <button type="button" id="panel-close-btn" class="icon-btn" title="Tutup panel" aria-label="Tutup panel">${icon("close", 16)}</button>
        </div>
      </header>

      <div class="token-tabs" role="tablist" aria-label="Menu utama">
        <button type="button" class="token-tab" role="tab" id="tab-btn-forum" data-tab="forum-tab" aria-selected="true" tabindex="0">
          ${icon("tasks", 15)}<span>Tugas</span><span id="forum-tab-badge" class="tab-badge"></span>
        </button>
        <button type="button" class="token-tab" role="tab" id="tab-btn-mhs" data-tab="mhs-tab" aria-selected="false" tabindex="-1">
          ${icon("groups", 15)}<span>Kelas</span>
        </button>
        <button type="button" class="token-tab" role="tab" id="tab-btn-notif" data-tab="notif-tab" aria-selected="false" tabindex="-1">
          ${icon("notif", 15)}<span>Notif</span><span id="notif-tab-badge" class="tab-badge"></span>
        </button>
        <button type="button" class="token-tab" role="tab" id="tab-btn-set" data-tab="set-tab" aria-selected="false" tabindex="-1">
          ${icon("settings", 15)}<span>Atur</span>
        </button>
      </div>

      <div class="panel-body">
        <section class="token-tab-content active" role="tabpanel" id="forum-tab-tab" aria-labelledby="tab-btn-forum"></section>
        <section class="token-tab-content" role="tabpanel" id="mhs-tab-tab" aria-labelledby="tab-btn-mhs" hidden></section>
        <section class="token-tab-content" role="tabpanel" id="notif-tab-tab" aria-labelledby="tab-btn-notif" hidden></section>
        <section class="token-tab-content" role="tabpanel" id="set-tab-tab" aria-labelledby="tab-btn-set" hidden></section>
      </div>

      <div class="guide-view" id="panel-guide-view" hidden></div>
    `;
    sr.appendChild(shell);

    const mount = document.body || document.documentElement;
    if (mount) mount.appendChild(host);

    const logoImg = sr.querySelector(".popup-logo-img");
    const icon128 = document.documentElement?.dataset?.mentariIcon128;
    if (logoImg) {
      logoImg.addEventListener("error", () => {
        logoImg.style.display = "none";
      });
      if (icon128) logoImg.src = icon128;
      else logoImg.style.display = "none";
    }

    sr.getElementById("token-refresh-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof onRefresh === "function") onRefresh();
    });
    sr.getElementById("panel-close-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof onClose === "function") onClose();
    });
    sr.getElementById("panel-guide-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (typeof onToggleGuide === "function") onToggleGuide();
    });

    const tablist = sr.querySelector('[role="tablist"]');
    const tabs = Array.from(sr.querySelectorAll('[role="tab"]'));
    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.stopPropagation();
        setGuideOpen(host, false);
        setActiveTab(host, tab.dataset.tab);
        if (typeof onTabChange === "function") onTabChange(tab.dataset.tab);
      });
    });

    tablist?.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (tabs.length === 0) return;
      const currentTab =
        (typeof e.target?.closest === "function" ? e.target.closest('[role="tab"]') : null) ||
        (tabs.includes(e.target) ? e.target : null) ||
        sr.activeElement;
      const idx = tabs.indexOf(currentTab);
      if (idx === -1) return;
      let nextIdx = -1;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
      else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") nextIdx = 0;
      else if (e.key === "End") nextIdx = tabs.length - 1;
      if (nextIdx >= 0) {
        e.preventDefault();
        const nextTab = tabs[nextIdx];
        setGuideOpen(host, false);
        setActiveTab(host, nextTab.dataset.tab, { focus: true });
        if (typeof onTabChange === "function") onTabChange(nextTab.dataset.tab);
      }
    });

    return { host, shadowRoot: sr };
  }

  window.MentariPanelUI = {
    icon,
    resolveTheme,
    applyTheme,
    toast,
    setActiveTab,
    setGuideOpen,
    setLoading,
    createHost,
  };
})();
