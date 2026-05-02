# Tasks: Migrasi Web Crypto API

## Task 1: Update Konstanta Algoritma

- [x] 1.1 Ubah nilai `SILENT_SHIELD_ALGORITHM` di `src/utils/constants/mbc-keys.ts` dari `'aes-256-gcm'` menjadi `'AES-GCM'`

## Task 2: Migrasi SilentShieldService ke Web Crypto API

- [x] 2.1 Ubah `SilentShieldServiceInterface` di `src/@core/services/mbc/silent-shield.service.ts`: return type `encrypt` dan `decrypt` menjadi `Promise<Uint8Array>`
- [x] 2.2 Hapus import `crypto-browserify` dan implementasikan `deriveKey` menggunakan `crypto.subtle.importKey` + `crypto.subtle.deriveKey` dengan PBKDF2, termasuk caching CryptoKey dengan Promise deduplication
- [x] 2.3 Implementasikan method `encrypt` menggunakan `crypto.getRandomValues` untuk IV dan `crypto.subtle.encrypt` dengan AES-GCM, output format `[IV | ciphertext | authTag]`
- [x] 2.4 Implementasikan method `decrypt` menggunakan `crypto.subtle.decrypt` dengan AES-GCM, parsing input format `[IV (12B) | ciphertext+authTag]`
- [x] 2.5 Tambahkan error wrapping: wrap semua error dari `crypto.subtle` dalam Error dengan pesan deskriptif (`Encryption failed:`, `Decryption failed:`, `Key derivation failed:`)

## Task 3: Update Use Case Consumers ke Async

- [x] 3.1 Update `src/@core/use_case/mbc/CheckIn.ts`: tambahkan `await` pada pemanggilan `silentShieldService.decrypt()` dan `silentShieldService.encrypt()`
- [x] 3.2 Update `src/@core/use_case/mbc/CheckOut.ts`: tambahkan `await` pada pemanggilan `silentShieldService.decrypt()` dan `silentShieldService.encrypt()` termasuk pada blok rollback
- [x] 3.3 Update `src/@core/use_case/mbc/TopUpBalance.ts`: tambahkan `await` pada pemanggilan `silentShieldService.decrypt()` dan `silentShieldService.encrypt()`
- [x] 3.4 Update `src/@core/use_case/mbc/RegisterMember.ts`: tambahkan `await` pada pemanggilan `silentShieldService.decrypt()` dan `silentShieldService.encrypt()`
- [x] 3.5 Update `src/@core/use_case/mbc/ReadCard.ts`: tambahkan `await` pada pemanggilan `silentShieldService.decrypt()`

## Task 4: Update Unit Tests

- [x] 4.1 Update mock `silentShieldService` di `src/@core/use_case/__tests__/mbc/CheckIn.test.ts`: ubah `mockReturnValue` menjadi `mockResolvedValue` untuk `encrypt` dan `decrypt`
- [x] 4.2 Update mock `silentShieldService` di `src/@core/use_case/__tests__/mbc/CheckOut.test.ts`: ubah `mockReturnValue` menjadi `mockResolvedValue` untuk `encrypt` dan `decrypt`
- [x] 4.3 Update mock `silentShieldService` di `src/@core/use_case/__tests__/mbc/TopUpBalance.test.ts`: ubah `mockReturnValue` menjadi `mockResolvedValue` untuk `encrypt` dan `decrypt`
- [x] 4.4 Update mock `silentShieldService` di `src/@core/use_case/__tests__/mbc/RegisterMember.test.ts`: ubah `mockReturnValue` menjadi `mockResolvedValue` untuk `encrypt` dan `decrypt`, serta ubah `mockImplementation` yang throw menjadi `mockRejectedValue`
- [x] 4.5 Update mock `silentShieldService` di `src/@core/use_case/__tests__/mbc/ReadCard.test.ts`: ubah `mockReturnValue` menjadi `mockResolvedValue` untuk `encrypt` dan `decrypt`, serta ubah `mockImplementation` yang throw menjadi `mockRejectedValue`
- [x] 4.6 Update `src/@core/services/__tests__/mbc/silent-shield.service.test.ts`: rewrite test suite untuk Web Crypto API async implementation dengan property-based tests (round-trip, non-determinism, output length) menggunakan fast-check minimum 100 iterations, plus unit tests untuk error handling

## Task 5: Hapus Dependensi crypto-browserify

- [x] 5.1 Hapus file `types/crypto-browserify.d.ts`
- [x] 5.2 Hapus `crypto-browserify` dari `dependencies` di `package.json`
- [x] 5.3 Hapus `nodePolyfills({ include: ['crypto'] })` dari `vite.config.ts` dan hapus `vite-plugin-node-polyfills` dari devDependencies (tidak ada consumer lain)

## Task 6: Verifikasi Build dan Test Suite

> ⚠️ **BLOCKED:** Butuh Node.js 20+ (saat ini environment hanya punya Node 18.17.0)
> Saat melanjutkan di environment dengan Node 20, jalankan langkah ini PERTAMA:
> 1. `npm install` (regenerate node_modules dan package-lock.json)
> 2. `npm run build` (tsc -b && vite build) — pastikan tidak ada error
> 3. `npm run test` (vitest --run) — pastikan semua test pass

- [ ] 6.1 Jalankan `npm run build` (tsc -b && vite build) dan pastikan tidak ada error
- [ ] 6.2 Jalankan `npm run test` dan pastikan semua test pass
