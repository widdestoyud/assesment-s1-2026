# Requirements: MBC Slim Storage Architecture

## Latar Belakang

NTAG215 memiliki kapasitas usable **504 bytes**. Dengan NDEF overhead (~12 bytes), base64 encoding (+33%), dan AES-GCM encryption (IV 12B + auth tag 16B), payload plaintext efektif hanya sekitar **~330 bytes**. Arsitektur sebelumnya menyimpan member identity, transaction log, dan check-in detail — yang melebihi kapasitas setelah beberapa operasi.

## Constraint Utama

- **Max NFC payload:** 490 bytes (encrypted + base64 encoded)
- **Max plaintext data:** ~250 bytes (setelah encryption + encoding overhead)
- **Target payload:** < 100 bytes plaintext (agar aman dengan margin besar)

## Data Model Baru (CardData v2)

```typescript
interface CardDataV2 {
  v: 2;                    // version (1 byte)
  b: number;               // balance dalam Rupiah (max 999999)
  s: 0 | 1;               // checkInStatus: 0=idle, 1=checked-in
  t: string | null;        // checkInTimestamp ISO 8601 (null jika s=0)
}
```

**Estimasi ukuran JSON:** `{"v":2,"b":50000,"s":1,"t":"2026-05-06T10:00:00.000Z"}` = ~55 bytes ✅

## Functional Requirements

### FR-1: Station — Validasi & Registrasi Kartu

1. Halaman Station dimulai dengan **tap kartu** (read first).
2. IF kartu tidak bisa di-decrypt (data dari luar / corrupt):
   - Otomatis overwrite dengan data anggota baru: `{v:2, b:0, s:0, t:null}`
   - Tampilkan: "Registrasi berhasil"
   - Navigasi ke halaman Top-Up
3. IF kartu valid dan `b === 0`:
   - Tampilkan: "Berhasil validasi kartu anggota"
   - Navigasi ke halaman Top-Up
4. IF kartu valid dan `b > 0`:
   - Tampilkan halaman Saldo (balance display)
   - Tombol "Top-Up" tersedia

### FR-2: Station — Top-Up

1. User memasukkan jumlah top-up (Rupiah).
2. Tap kartu → read current balance → tambah amount → write back.
3. Tampilkan saldo baru.
4. Max balance: Rp 999.999.

### FR-3: Gate — Check-In

1. User tap kartu di Gate.
2. Read kartu → validasi `s === 0` (belum check-in).
3. IF `s === 1`: tolak dengan pesan "Sudah check-in, selesaikan check-out dulu".
4. IF `s === 0`: set `s = 1`, `t = now()` → write back.
5. Tampilkan: "Check-in berhasil" + waktu masuk.
6. Benefit type hardcoded: Parking, Rp2000/jam, ceiling.

### FR-4: Terminal — Check-Out

1. User tap kartu di Terminal.
2. Read kartu → validasi `s === 1` (sudah check-in).
3. IF `s === 0`: tolak dengan pesan "Belum check-in".
4. Hitung fee: `ceil((now - t) / 1jam) × 2000`.
5. IF `b < fee`: tolak dengan pesan "Saldo tidak cukup".
6. Set `s = 0`, `t = null`, `b = b - fee` → write back.
7. Tampilkan: fee, durasi, saldo tersisa.

### FR-5: Scout — Baca Kartu

1. User tap kartu di Scout.
2. Read kartu → tampilkan: balance, status check-in, waktu masuk (jika ada).

### FR-6: Konfigurasi Hardcoded

- Benefit type: `parking`
- Rate: Rp 2.000 / jam
- Rounding: ceiling (bulatkan ke atas)
- Tidak ada UI konfigurasi (hapus tab Service Config)

## Non-Functional Requirements

### NFR-1: Payload Size
- Encrypted payload HARUS < 490 bytes setelah base64 encoding.
- Plaintext JSON HARUS < 100 bytes.

### NFR-2: Single-Tap Operation
- Semua operasi read+write HARUS selesai dalam satu tap (readThenWrite).
- Registrasi (write-only) boleh single tap tanpa read.

### NFR-3: Backward Compatibility
- Kartu dengan format lama (v1) HARUS di-overwrite otomatis saat tap di Station.
- Tidak perlu migrasi data — kartu lama dianggap invalid dan di-reset.

## Glossary

| Term | Definition |
|------|-----------|
| CardDataV2 | Format data minimal pada NFC card (v2) |
| Station | Perangkat admin untuk registrasi dan top-up |
| Gate | Perangkat check-in |
| Terminal | Perangkat check-out dan kalkulasi tarif |
| Scout | Perangkat read-only untuk melihat isi kartu |
| Ceiling rounding | Pembulatan durasi ke atas (1 menit = 1 jam) |
