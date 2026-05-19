# Membership Benefit Card (MBC)

Aplikasi Progressive Web App (PWA) untuk manajemen kartu membership koperasi berbasis NFC. Semua data tersimpan langsung di kartu fisik — **tanpa backend, tanpa database, 100% offline**.

## Tentang Proyek

MBC adalah program pemerintah yang menjadikan kartu NFC sebagai identitas anggota koperasi. Aplikasi ini menyediakan 4 mode operasi dalam satu app:

| Mode | Peran | Fungsi |
|------|-------|--------|
| **The Station** | Admin Koperasi | Registrasi kartu, top-up saldo, konfigurasi benefit type |
| **The Gate** | Operator Gerbang | Check-in dengan pencatatan timestamp + benefit type |
| **The Terminal** | Operator Exit | Check-out, kalkulasi tarif, potong saldo |
| **The Scout** | Anggota | Lihat isi kartu (saldo, status, riwayat) |

### Fitur Utama

- **Offline-First** — Semua operasi berjalan tanpa internet setelah instalasi awal
- **Extensible Benefit Types** — Tidak hanya parkir, tapi juga sewa sepeda, gym, restoran, VIP, dll
- **Configurable Pricing** — Per-jam, per-kunjungan, atau flat-fee dengan rounding strategy
- **Atomic Transactions** — Tidak ada double deduction atau partial write
- **Device Binding** — Check-out hanya bisa di device yang sama dengan check-in
- **Silent Shield** — Data sensitif terenkripsi (AES-256-GCM)
- **ChipTransfer Capability Detection** — Auto-detect browser support dengan graceful degradation
- **Manual Fallback** — Kalkulasi manual jika NFC gagal saat check-out
- **i18n** — Dukungan bahasa Indonesia dan English via i18next
- **Signal Design System** — Komponen UI reusable (SignalButton, SignalCard, SignalTab, dll)

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 + TypeScript 5.7 + Vite 6 |
| Routing | TanStack Router (file-based, auto code-splitting) |
| DI | Awilix (Clean Architecture) |
| Styling | Tailwind CSS 4 + CSS Modules (BEM/SMACSS) |
| Forms | React Hook Form + @hookform/resolvers |
| Validation | Zod |
| i18n | i18next + react-i18next + browser language detection |
| NFC | Web NFC API (NDEFReader) via ChipTransferProtocol |
| Encryption | crypto-browserify (AES-256-GCM) |
| Error Handling | react-error-boundary |
| Testing | Vitest + React Testing Library + fast-check (property-based) |
| PWA | vite-plugin-pwa (Service Worker) |
| CI/CD | GitHub Actions → GitHub Pages |
| Code Quality | ESLint + Prettier + Stylelint + Husky + lint-staged + Commitizen |

## Arsitektur

Proyek mengikuti **Clean Architecture** dengan **5 layer**. Dependencies flow inward only:

```
                              ┌──────────────────────────────┐
                              │  Infrastructure              │
                              │  DI, config, adapters        │
                              └──┬────┬────┬────┬────┬──────┘
                                 │    │    │    │    │
                    implements   │    │    │    │    │  wires
                    protocols    │    │    │    │    │  dependencies
                                 ▼    ▼    ▼    ▼    ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Presentation                                      │
│  Pages (thin views) + Components (UI only)                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Controllers                                       │
│  State orchestration, validation, expose t                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Use Cases                                         │
│  Business orchestration across services                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Services                                          │
│  Pure logic + adapters (NFC, encryption, etc.)              │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Core                                              │
│  Protocols (interfaces) + Domain models                     │
└─────────────────────────────────────────────────────────────┘

Dependency flow: Layer 5 → 4 → 3 → 2 → 1 (inward only)
Infrastructure: implements Layer 1 protocols, wires all layers via DI
```

### Folder Structure

```
src/
├── @core/                          # Core business logic (framework-agnostic)
│   ├── models/mbc/                 # Domain models & Zod schemas
│   │   ├── benefit-type.model.ts
│   │   ├── card-data.model.ts
│   │   ├── common.model.ts
│   │   ├── schemas.ts
│   │   └── index.ts
│   ├── protocols/                  # Interface contracts
│   │   └── chip-transfer/          #   ChipTransferProtocol
│   ├── services/mbc/               # Pure logic services
│   │   ├── card-data.service.ts
│   │   ├── nfc.service.ts
│   │   ├── pricing.service.ts
│   │   └── silent-shield.service.ts
│   └── use_case/mbc/               # Application use cases
│       ├── CheckIn.ts
│       ├── CheckOut.ts
│       ├── ReadCard.ts
│       ├── TopUpBalance.ts
│       └── ValidateCard.ts
├── infrastructure/                 # External adapters & DI
│   ├── di/                         # Awilix DI container
│   │   ├── container.ts
│   │   └── registry/
│   │       ├── helperContainer.ts
│   │       ├── libraryContainer.ts
│   │       ├── mbcControllerContainer.ts
│   │       ├── mbcProtocolContainer.ts
│   │       ├── mbcServiceContainer.ts
│   │       └── mbcUseCaseContainer.ts
│   ├── nfc/
│   │   └── webNfcAdapter.ts        # Web NFC API adapter (implements ChipTransferProtocol)
│   ├── config.ts                   # Environment & app config
│   └── images.ts                   # Image asset registry
├── controllers/mbc/                # Page controllers (logic layer)
│   ├── hooks/                      # Shared controller hooks
│   │   ├── useNfcCapability.ts     #   ChipTransfer capability detection
│   │   └── useNfcOperation.ts      #   ChipTransfer read/write operations
│   ├── shared.types.ts             # Shared controller types
│   ├── gate.controller.ts
│   ├── role-picker.controller.ts
│   ├── scout.controller.ts
│   ├── station.controller.ts
│   └── terminal.controller.ts
├── presentation/                   # UI layer
│   ├── components/                 # Reusable components
│   │   ├── BalanceDisplay/
│   │   ├── ErrorBoundary/
│   │   ├── NfcCapabilityNotice/
│   │   ├── NfcScanModal/
│   │   ├── OfflineIndicator/
│   │   ├── PageHeader/
│   │   ├── PageLayout/
│   │   ├── ResultStatusModal/
│   │   ├── RoleCard/
│   │   ├── SignalReact/            # Design system components
│   │   │   ├── SignalButton/
│   │   │   ├── SignalCallout/
│   │   │   ├── SignalCard/
│   │   │   ├── SignalGateButton/
│   │   │   ├── SignalSnackBar/
│   │   │   ├── SignalStackGroup/
│   │   │   ├── SignalTab/
│   │   │   └── SignalTypography/
│   │   └── types.ts
│   ├── layouts/
│   │   └── MainLayout/            # App shell layout
│   └── pages/
│       ├── MbcGate/
│       ├── MbcRolePicker/
│       ├── MbcScout/
│       ├── MbcStation/
│       └── MbcTerminal/
├── routes/                         # TanStack Router routes
│   ├── __root.tsx
│   ├── index.tsx                   # Role Picker (home)
│   ├── gate.tsx
│   ├── station.tsx
│   ├── terminal.tsx
│   └── scout.tsx
├── translation/                    # i18n
│   ├── locale/
│   │   ├── id.ts                   # Bahasa Indonesia (default)
│   │   └── en.ts                   # English
│   ├── i18n.config.ts
│   └── types.ts
├── utils/
│   ├── constants/
│   │   └── index.ts
│   └── helpers/
│       ├── index.ts
│       └── mbc.helper.ts
├── global.css
├── main.tsx
├── routeTree.gen.ts                # Auto-generated route tree
└── vite-env.d.ts
```

## Development Progress

### 📋 Project Board

[GitHub Project — MBC](https://github.com/users/widdestoyud/projects/2)

### 🎯 Milestones

[View Milestones](https://github.com/widdestoyud/assesment-s1-2026/milestones)

| Phase | Status | Deskripsi |
|-------|--------|-----------|
| Phase 1: Layer 1 (Core) | ✅ Done | Domain models, Zod schemas, ChipTransferProtocol |
| Phase 2: Layer 2 (Services) | ✅ Done | Pure logic services (pricing, card-data, silent-shield, nfc) |
| Phase 3: Layer 3 (Use Cases) | ✅ Done | CheckIn, CheckOut, TopUpBalance, ReadCard, ValidateCard |
| Phase 4: Layer 4 (Controllers) | ✅ Done | Controllers + shared hooks (capability, operation) |
| Phase 5: Layer 5 (Presentation) | ✅ Done | Pages, components, Signal design system, layouts, routing |

### 🎫 Issues

[View All Issues](https://github.com/widdestoyud/assesment-s1-2026/issues)

## Test Coverage

```
Services:
  ✅ card-data.service.test.ts
  ✅ nfc.service.test.ts
  ✅ pricing.service.test.ts
  ✅ silent-shield.service.test.ts

Use Cases:
  ✅ CheckIn.test.ts
  ✅ CheckOut.test.ts
  ✅ ReadCard.test.ts
  ✅ TopUpBalance.test.ts

Controllers:
  ✅ gate.controller.test.ts
  ✅ role-picker.controller.test.ts
  ✅ scout.controller.test.ts
  ✅ terminal.controller.test.ts
```

## Environment Variables

| Variable | Deskripsi | Default |
|----------|-----------|---------|
| `VITE_BASIC_VERSION` | Build version identifier | — |
| `VITE_BASE_PATH` | Base path untuk routing (e.g., `/assesment-s1-2026/`) | `/` |
| `VITE_NFC_CHECK_ENABLED` | Enable NFC capability check (`true`/`false`) | `true` |
| `VITE_ROUTE_DEVTOOL` | Tampilkan TanStack Router DevTools | `false` |

## Getting Started

### Prerequisites

- Node.js 20+ (lihat `.nvmrc`)
- Chrome Android 89+ (untuk Web NFC)
- NFC-enabled Android device (untuk fitur NFC)

### Install

```bash
nvm use
npm install
```

### Development

```bash
npm run dev
```

Buka `https://localhost:3000` (HTTPS required untuk Web NFC).

Untuk development dengan tunnel (ngrok):

```bash
npm run dev:tunnel
```

### Test

```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
npm run test:watch        # Watch mode
```

### Build

```bash
npm run build
```

Output di `./build`.

### Preview

```bash
npm run preview           # Local preview
npm run preview:tunnel    # Preview with ngrok tunnel
```

### Lint & Format

```bash
npm run lint              # ESLint
```

Prettier dan Stylelint dijalankan otomatis via lint-staged pada commit.

### Commit

```bash
npm run commit            # Commitizen interactive commit
```

Commit message mengikuti [Conventional Commits](https://www.conventionalcommits.org/) dan divalidasi oleh commitlint.

## Deployment

Deployment otomatis ke **GitHub Pages** via GitHub Actions:

1. Push ke branch `main`
2. CI menjalankan tests
3. Build production
4. Deploy ke GitHub Pages

URL: `https://widdestoyud.github.io/assesment-s1-2026/`

## Kiro Agents

Proyek ini menggunakan custom agents untuk workflow automation:

| Agent | Trigger | Fungsi |
|-------|---------|--------|
| **@product-owner** | Otomatis saat ada keyword bisnis/fitur | Analisis PO: acceptance criteria, edge cases, impact |
| **@developer** | Manual via chat | Implementasi kode: read, write, build, test |
| **@qa-tester** | Manual atau otomatis via hooks | Jalankan test, cek coverage, validasi specs |
| **@git-flow** | Otomatis saat ada keyword git | Branching, commit, push, PR, merge |
| **@software-architect** | Manual via chat | Arsitektur dan design decisions |
| **@sonar-fixer** | Manual via chat | Fix SonarCloud issues |
| **@explainer** | Manual via chat | Penjelasan kode dan arsitektur |
| **@wiki-documenter** | Manual via chat | Generate/update wiki documentation |

### Hooks

| Hook | Event | Aksi |
|------|-------|------|
| Product Owner Gate | promptSubmit | Auto PO analysis untuk business requests |
| Git Flow Manager | promptSubmit | Auto git operations untuk git keywords |
| Create Feature Branch | promptSubmit | Auto create branch untuk feature requests |
| QA: Post Task Test | postTaskExecution | Auto run vitest setelah task selesai |
| QA: Run Edited Test | fileEdited (*.test.*) | Auto run test file yang di-edit |
| QA: Check Test Coverage | fileEdited (source files) | Cek apakah ada test untuk file yang diubah |
| QA: New File Test Reminder | fileCreated (MBC source) | Reminder untuk buat test file baru |
| QA: Full Coverage Report | userTriggered | Full suite + coverage analysis |
| QA: Spec Validation | userTriggered | Mapping requirements ke test coverage |
| Wiki: Generate Full | userTriggered | Generate full wiki documentation |
| Wiki: Update on Task | postTaskExecution | Update wiki setelah task selesai |

## Spec Documents

Dokumentasi lengkap ada di `.kiro/specs/membership-benefit-card/`:

- **[requirements.md](.kiro/specs/membership-benefit-card/requirements.md)** — Requirements dengan acceptance criteria
- **[design.md](.kiro/specs/membership-benefit-card/design.md)** — Arsitektur, data models, interfaces, correctness properties
- **[tasks.md](.kiro/specs/membership-benefit-card/tasks.md)** — Implementation tasks

## Wiki Documentation

Dokumentasi wiki lengkap tersedia di `docs/wiki/membership-benefit-card/`:

- **Architecture** — Clean Architecture, data flow, design decisions
- **Data Models** — Card schema, benefit types, NFC memory layout, Zod schemas
- **Business Flows** — Registration, check-in, check-out, top-up, manual calculation
- **Technical Flows** — Atomic write, device binding, NFC detection, pricing engine, encryption
- **UI Components** — Gate, Station, Terminal, Scout, Role Picker interfaces
- **Testing** — Strategy, coverage matrix, correctness properties
- **Development** — Getting started, git flow, agents & hooks

## Referensi

- [KDX#1 - Membership Benefit Card (MBC)](referensi/) — Dokumen requirement asli
- [Web NFC API](https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader) — Browser NFC interface
- [Awilix](https://github.com/jeffijoe/awilix) — Dependency injection container
- [TanStack Router](https://tanstack.com/router) — Type-safe file-based routing
- [Tailwind CSS 4](https://tailwindcss.com/) — Utility-first CSS framework
- [Zod](https://zod.dev/) — TypeScript-first schema validation
- [i18next](https://www.i18next.com/) — Internationalization framework
