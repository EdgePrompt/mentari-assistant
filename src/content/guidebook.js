(() => {
  if (typeof window !== "undefined" && window.MentariGuide) return;

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render(containerEl, options = {}) {
    if (!containerEl) return;
    const { version = "1.3.1", onBack } = options || {};
    const ico =
      typeof window !== "undefined" && typeof window.MentariPanelUI?.icon === "function"
        ? window.MentariPanelUI.icon
        : () => "";

    const safeVersion = escapeHtml(version || "1.3.1");

    const sections = [
      {
        badge: "Langkah Awal",
        icon: "refresh",
        title: "Sinkronisasi Mata Kuliah",
        desc: "Setelah login ke MENTARI, daftar mata kuliah dan pertemuan otomatis disinkronkan. Klik ikon muat ulang di pojok kanan atas jika data belum terbaru.",
        tip: "Detail diskusi dan nilai kuis baru dimuat saat kamu membuka pertemuan agar halaman tetap ringan.",
      },
      {
        badge: "Forum & Diskusi",
        icon: "forum",
        title: "Balas Forum & Notifikasi Dosen",
        desc: "Buka pertemuan di tab Tugas untuk melihat soal diskusi dan membalas langsung lewat tombol Balas tanpa berpindah halaman.",
        tip: "Tab Notif otomatis menyaring balasan dosen ke reply kamu dan dilengkapi tombol hapus.",
      },
      {
        badge: "Kuis & Kuesioner",
        icon: "quiz",
        title: "Pengerjaan Kuis & Kuesioner Cepat",
        desc: "Klik tombol Mulai Quiz di pertemuan untuk membuka halaman ujian beserta bantuan AI. Aktif atau matikan Auto Finish Quiz di tab Atur sesuai kebutuhan.",
        tip: "Untuk kuesioner pertemuan, klik tombol play atau baris Kuesioner di bawah Posttest — halaman kuesioner akan terbuka dan terisi otomatis.",
      },
      {
        badge: "API Key & Model",
        icon: "key",
        title: "Mengatasi Limit Kuota (Error 429)",
        desc: "Jika muncul pesan limit kuota tercapai, buka tab Atur lalu pilih model Gemini lain pada Konfigurasi Model.",
        tip: "Pilih Model Lainnya... di dropdown model untuk mengetik ID model custom atau melihat daftar model aktif dari API Key kamu.",
      },
    ];

    containerEl.innerHTML = `
      <div class="guide-subbar">
        <button type="button" class="btn btn-sm" id="guide-back-btn">
          ${ico("back", 14)}<span>Kembali ke Panel</span>
        </button>
        <span style="font-size:11px;font-weight:700;color:var(--text-secondary);">Panduan Penggunaan</span>
      </div>
      <div class="guide-scroll">
        ${sections
          .map(
            (s) => `
          <div class="guide-card-block">
            <span class="guide-step-tag">${escapeHtml(s.badge)}</span>
            <h3 class="guide-card-title">${ico(s.icon, 15)}<span>${escapeHtml(s.title)}</span></h3>
            <p class="guide-card-text">${escapeHtml(s.desc)}</p>
            <div class="guide-tip-list">${escapeHtml(s.tip)}</div>
          </div>`,
          )
          .join("")}
        <div style="text-align:center;font-size:10.5px;color:var(--text-secondary);padding:4px 0 8px;">
          Mentari Assistant v${safeVersion} &bull; by EdgePrompt
        </div>
      </div>
    `;

    containerEl.querySelector("#guide-back-btn")?.addEventListener("click", (e) => {
      e?.stopPropagation?.();
      if (typeof onBack === "function") onBack();
    });
  }

  if (typeof window !== "undefined") {
    window.MentariGuide = { render };
  } else if (typeof globalThis !== "undefined") {
    globalThis.MentariGuide = { render };
  }
})();
