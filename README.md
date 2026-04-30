# Membership Benefit Card (MBC)

Aplikasi Progressive Web App (PWA) untuk manajemen kartu membership koperasi berbasis NFC. Semua data tersimpan langsung di kartu fisik — **tanpa backend, tanpa database, 100% offline**.

## Tentang Proyek

MBC adalah program pemerintah yang menjadikan kartu NFC sebagai identitas anggota koperasi. Aplikasi ini menyediakan 4 mode operasi dalam satu app:

| Mode | Peran | Fungsi |
|------|-------|--------|
| **The Station** | Admin Koperasi | Registrasi kartu, top-up saldo, konfigurasi service type |
| **The Gate** | Operator Gerbang | Check-in dengan pencatatan timestamp + service type |
| **The Terminal** | Operator Exit | Check-out, kalkulasi tarif, potong saldo |
| **The Scout** | Anggota | Lihat isi kartu (saldo, status, riwayat) |

### Fitur Utama

- **Offline-First** — Semua operasi berjalan tanpa internet setelah instalasi awal
- **Extensible Service Types** — Tidak hanya parkir, tapi juga sewa sepeda, gym, restoran, VIP, dll
- **Configurable Pricing** — Per-jam, per-kunjungan, atau flat-fee dengan rounding strategy
- **Atomic Transactions** — Tidak ada double deduction atau partial write
- **Device Binding** — Check-out hanya bisa di device yang sama dengan check-in
- **Silent Shield** — Data sensitif terenkripsi (AES-256-GCM)
- **NFC Capability Detection** — Auto-detect browser support dengan graceful degradation
- **Manual Fallback** — Kalkulasi manual jika NFC gagal saat check-out

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 + TypeScript + Vite |
| Routing | TanStack Router (file-based, auto code-splitting) |
| DI | Awilix (Clean Architecture) |
| Styling | SCSS Modules + Tailwind CSS 4 |
| Validation | Zod |
| NFC | Web NFC API (NDEFReader) |
| Encryption | crypto-browserify (AES-256-GCM) |
| Testing | Vitest + React Testing Library + fast-check |
| PWA | vite-plugin-pwa (Service Worker) |

## Arsitektur

Proyek mengikuti **Clean Architecture** dengan prinsip **Start with Bricks** (bottom-up):

```
Layer 0 — Data Models & Schemas (pure types, zero dependencies)
Layer 1 — Pure Logic Services (stateless: pricing, card-data, silent-shield)
Layer 2 — I/O Adapters (webNfcAdapter, webStorageAdapter)
Layer 3 — Stateful Services (nfc, device, storage-health, service-registry)
Layer 4 — Use Cases (RegisterMember, CheckIn, CheckOut, dll)
Layer 5 — Controllers (pure functions via DI, bukan React components)
Layer 6 — Presentation (Pages + Components, props-in/events-out)
```

```
src/
├── @core/                    # Core business logic (framework-agnostic)
│   ├── protocols/            # Interface contracts (NFC, KeyValueStore)
│   ├── services/mbc/         # MBC services + data models
│   └── use_case/mbc/         # Application use cases
├── infrastructure/           # External adapters & DI container
├── controllers/mbc/          # Page controllers (logic layer)
├── presentation/             # UI layer
│   ├── components/mbc/       # Reusable components
│   └── pages/(mbc)/          # Page-level components
├── routes/mbc/               # TanStack Router routes
└── utils/                    # Constants, helpers, hooks
```

## Development Progress

### 📋 Project Board
[GitHub Project — MBC](https://github.com/users/widdestoyud/projects/2)

### 🎯 Milestones
[View Milestones](https://github.com/widdestoyud/assesment-s1-2026/milestones)

| Phase | Status | Deskripsi |
|-------|--------|-----------|
| Phase 1: Layer 0 | ✅ Done | Data models, types, Zod schemas, protocols |
| Phase 2: Layer 1 | ✅ Done | Pure logic services (pricing, card-data, silent-shield) |
| Phase 3: Layer 2-3 | 🔄 In Progress | I/O adapters + stateful services + DI wiring |
| Phase 4: Layer 4 | 🔲 Todo | Use cases (Register, TopUp, CheckIn, CheckOut, dll) |
| Phase 5: Layer 5 | 🔲 Todo | Controllers |
| Phase 6: Layer 6 | 🔲 Todo | Components, pages, routing, PWA |

### 🎫 Issues
[View All Issues](https://github.com/widdestoyud/assesment-s1-2026/issues)

## Spec Documents

Dokumentasi lengkap ada di `.kiro/specs/membership-benefit-card/`:

- **[requirements.md](.kiro/specs/membership-benefit-card/requirements.md)** — 22 requirements dengan acceptance criteria
- **[design.md](.kiro/specs/membership-benefit-card/design.md)** — Arsitektur, data models, interfaces, correctness properties
- **[tasks.md](.kiro/specs/membership-benefit-card/tasks.md)** — 19 top-level tasks, 49 required + 15 optional sub-tasks

## Getting Started

### Prerequisites

- Node.js 22+ (lihat `.nvmrc`)
- Chrome Android 89+ (untuk Web NFC)
- NFC-enabled Android device

### Install

```bash
nvm use
npm install
```

### Development

```bash
npm run dev
```

Buka `https://localhost:443` (HTTPS required untuk Web NFC).

### Test

```bash
npm run test          # Run all tests
npm run test:coverage # Run with coverage report
```

### Build

```bash
npm run build
```

Output di `./build`.

## Kiro Agents

Proyek ini menggunakan custom agents untuk workflow automation:

| Agent | Trigger | Fungsi |
|-------|---------|--------|
| **@product-owner** | Otomatis saat ada keyword bisnis/fitur | Analisis PO: acceptance criteria, edge cases, impact |
| **@qa-tester** | Manual via chat atau otomatis via hooks | Jalankan test, cek coverage, validasi specs |
| **@git-flow** | Otomatis saat ada keyword git (release, commit, branch, fase) | Branching, commit, push, PR, merge |
| **@wiki-documenter** | Manual via chat | Generate/update wiki documentation |

### Hooks

| Hook | Event | Aksi |
|------|-------|------|
| Product Owner Review | promptSubmit | Auto PO analysis untuk business requests |
| QA: Run Tests After Task | postTaskExecution | Auto run vitest setelah task selesai |
| QA: Run Edited Test File | fileEdited (*.test.*) | Auto run test file yang di-edit |
| QA: Check Test Coverage | fileEdited (source files) | Cek apakah ada test untuk file yang diubah |
| QA: Test Reminder | fileCreated (MBC source) | Reminder untuk buat test file baru |
| QA: Full Coverage Report | userTriggered | Full suite + coverage analysis |
| QA: Validate Specs vs Tests | userTriggered | Mapping 22 requirements ke test coverage |

## Referensi

- [KDX#1 - Membership Benefit Card (MBC)](referensi/) — Dokumen requirement asli
- [Web NFC API](https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader) — Browser NFC interface
- [Awilix](https://github.com/jeffijoe/awilix) — Dependency injection container
- [TanStack Router](https://tanstack.com/router) — Type-safe file-based routing
