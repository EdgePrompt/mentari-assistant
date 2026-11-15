<div align="center">

<img src="src/assets/icon-256.png" alt="Mentari Assistant Logo" width="128" />

# Mentari Assistant

**Ekstensi browser untuk memantau forum, diskusi, kuis, dan presensi di portal MENTARI UNPAM.**

[![Version](https://img.shields.io/badge/versi-1.0.0-f97316?style=for-the-badge)](https://github.com/EdgePrompt/mentari-assistant/releases/latest)
[![Releases](https://img.shields.io/badge/download-Release%20v1.0.0-8b5cf6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EdgePrompt/mentari-assistant/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-6b7280?style=for-the-badge)](LICENSE)

[Fitur Utama](#-fitur-utama) • [Cara Pasang](#-cara-pasang) • [Pasang API Key Gemini](#-pasang-api-key-gemini) • [Lisensi](#-lisensi--atribusi)

</div>

---

## ✨ Fitur Utama

| Fitur | Kegunaan |
| :--- | :--- |
| **Daftar Forum & Notifikasi** | Menampilkan forum diskusi yang belum dikerjakan serta balasan terbaru dari dosen dalam satu panel tanpa harus membuka mata kuliah satu per satu. |
| **Bantu Kuis & Diskusi (AI)** | Membantu memahami soal kuis atau menyusun draf tanggapan forum memakai model Google Gemini dengan API Key milik sendiri. |
| **Survei & Kuisioner Cepat** | Mempercepat pengisian evaluasi dosen dan survei di MENTARI maupun MyUNPAM. |
| **Pintasan Presensi** | Akses cepat ke halaman presensi mahasiswa di MyUNPAM langsung dari panel asisten. |

---

## 🚀 Cara Pasang

1. Unduh file **`mentari-assistant-v1.0.0.zip`** di halaman **[GitHub Releases](https://github.com/EdgePrompt/mentari-assistant/releases/latest)**, lalu ekstrak ke satu folder khusus.
2. Buka browser berbasis Chromium (Chrome, Edge, atau Brave) dan kunjungi:
   ```text
   chrome://extensions/
   ```
3. Aktifkan **Developer mode** di pojok kanan atas.
4. Klik **Load unpacked**, lalu pilih folder hasil ekstrak yang berisi file `manifest.json`.
5. Buka [mentari.unpam.ac.id](https://mentari.unpam.ac.id/) — ikon **Mentari Assistant** akan muncul di bilah atas halaman dan toolbar browser.

---

## 🔑 Pasang API Key Gemini

Fitur bantuan AI memakai API Key Google Gemini milikmu sendiri agar kuota pemakaian tetap aman dan mandiri.

1. Buat API Key gratis di [Google AI Studio](https://aistudio.google.com/apikey).
2. Buka [mentari.unpam.ac.id](https://mentari.unpam.ac.id/), lalu buka panel **Mentari Assistant**.
3. Masuk ke tab **Pengaturan** → klik **Update API Key** → tempelkan API Key lalu simpan.
4. Pilih model Gemini yang ingin dipakai (bawaan: `Gemini 3.5 Flash Lite`).

---

## 📜 Lisensi & Atribusi

Dirilis di bawah lisensi **[MIT License](LICENSE)**.

- **Pengelola:** [EdgePrompt](https://github.com/EdgePrompt) — [`EdgePrompt/mentari-assistant`](https://github.com/EdgePrompt/mentari-assistant)
- *Berbasis proyek awal oleh [Lukman754](https://gitlab.com/lukman754/mentari-unpam).*
