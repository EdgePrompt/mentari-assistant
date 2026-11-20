<div align="center">

<img src="src/assets/icon-256.png" alt="Mentari Assistant Logo" width="128" />

# Mentari Assistant

**Ekstensi browser untuk memantau forum, diskusi, kuis, dan presensi di portal MENTARI UNPAM.**

[![Version](https://img.shields.io/badge/versi-1.3.0-f97316?style=for-the-badge)](https://github.com/EdgePrompt/mentari-assistant/releases/latest)
[![Releases](https://img.shields.io/badge/download-Release%20v1.3.0-22c55e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EdgePrompt/mentari-assistant/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-6b7280?style=for-the-badge)](LICENSE)

[Fitur Utama](#-fitur-utama) • [Perangkat & Browser](#-dukungan-perangkat--browser) • [Cara Pasang](#-cara-pasang) • [Pasang API Key Gemini](#-pasang-api-key-gemini) • [Lisensi](#-lisensi--atribusi)

</div>

---

## ✨ Fitur Utama

| Fitur | Kegunaan |
| :--- | :--- |
| **Daftar Forum & Notifikasi** | Menampilkan forum diskusi yang belum dikerjakan, membalas forum langsung dari panel, serta memantau balasan terbaru dari dosen tanpa harus membuka mata kuliah satu per satu. |
| **Bantu Kuis & Diskusi (AI)** | Membantu menjawab soal kuis otomatis maupun menyusun tanggapan forum memakai model Google Gemini dengan API Key milik sendiri. |
| **Survei & Kuisioner Cepat** | Mempercepat pengisian evaluasi dosen dan survei di MENTARI maupun MyUNPAM. |
| **Pintasan Presensi** | Akses cepat dan tampilan presensi mahasiswa di MyUNPAM langsung dari panel asisten. |

---

## 📱 Dukungan Perangkat & Browser

| Perangkat | Browser yang Didukung | Status |
| :--- | :--- | :--- |
| **Desktop** (Windows / macOS / Linux) | Google Chrome, Microsoft Edge, Brave, Opera, Arc, Vivaldi | Didukung penuh |
| **Android** | **Mises Browser**, **Lemur Browser**, **Quetta Browser**, **Kiwi Browser** | Didukung penuh (tampilan responsif) |
| **iPhone / iPad (iOS)** | **Mises Browser** | Didukung (tampilan responsif) |
| Android / iOS | Google Chrome Mobile & Safari | Tidak didukung (tidak mendukung pasang ekstensi `.zip`) |

---

## 🚀 Cara Pasang

### Desktop (Chrome / Edge / Brave / Chromium)
1. Unduh file **`mentari-assistant-v1.3.0.zip`** di halaman **[GitHub Releases](https://github.com/EdgePrompt/mentari-assistant/releases/latest)**, lalu ekstrak ke satu folder khusus.
2. Buka halaman ekstensi browser (`chrome://extensions/` atau `edge://extensions/`).
3. Aktifkan **Developer mode** di pojok kanan atas.
4. Klik **Load unpacked**, lalu pilih folder hasil ekstrak yang berisi file `manifest.json`.
5. Buka [mentari.unpam.ac.id](https://mentari.unpam.ac.id/) — ikon **Mentari Assistant** akan muncul di bilah atas halaman dan toolbar browser.

### HP / Tablet (Android & iOS)
1. Pasang salah satu browser mobile yang mendukung ekstensi (**Mises Browser**, **Lemur Browser**, **Quetta**, atau **Kiwi Browser** untuk Android; **Mises Browser** untuk iOS).
2. Unduh file **`mentari-assistant-v1.3.0.zip`** dari halaman **[GitHub Releases](https://github.com/EdgePrompt/mentari-assistant/releases/latest)**.
3. Buka menu **Extensions** di browser tersebut, aktifkan **Developer mode**, lalu pilih **Load zip / `.zip` file** (atau ekstrak terlebih dahulu lalu pilih folder `manifest.json` sesuai browser yang dipakai).
4. Login ke [mentari.unpam.ac.id](https://mentari.unpam.ac.id/) dan ketuk ikon **Mentari Assistant** di bar atas.

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
