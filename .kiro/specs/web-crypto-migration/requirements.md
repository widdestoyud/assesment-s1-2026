# Requirements Document: Migrasi Web Crypto API

## Pendahuluan

Dokumen ini mendefinisikan persyaratan untuk migrasi layanan enkripsi Silent Shield dari polyfill `crypto-browserify` ke Web Crypto API native (`crypto.subtle`). Migrasi ini menghilangkan ketergantungan pada polyfill pihak ketiga dan menggunakan implementasi kriptografi bawaan browser yang lebih aman dan performan.

Algoritma tetap AES-256-GCM dengan parameter yang sama (kunci 256-bit, IV 12 byte, auth tag 16 byte). Format output tetap `[IV (12B) | ciphertext | authTag (16B)]`. Derivasi kunci tetap menggunakan PBKDF2 dengan passphrase, salt, dan iterasi yang sama.

Perubahan utama adalah seluruh interface menjadi asynchronous karena Web Crypto API sepenuhnya berbasis Promise. Tidak diperlukan backward compatibility karena belum ada kartu di lapangan.

Spec ini merupakan migrasi dari implementasi yang sudah ada di spec `membership-benefit-card` (Requirement 11: Data Protection / Silent Shield).

## Glossary

- **Silent_Shield_Service**: Layanan enkripsi/dekripsi di layer service yang melindungi data kartu NFC menggunakan algoritma AES-256-GCM, diimplementasikan melalui Web Crypto API (`crypto.subtle`)
- **Web_Crypto_API**: API kriptografi native browser (`crypto.subtle`) yang menyediakan operasi kriptografi berbasis Promise tanpa memerlukan polyfill eksternal
- **PBKDF2**: Password-Based Key Derivation Function 2, algoritma derivasi kunci yang mengubah passphrase dan salt menjadi kunci kriptografi dengan jumlah iterasi yang dikonfigurasi
- **AES_GCM**: Advanced Encryption Standard dalam mode Galois/Counter Mode, algoritma enkripsi authenticated yang menghasilkan ciphertext dan authentication tag
- **CryptoKey**: Objek kunci kriptografi yang dikelola oleh Web Crypto API, dihasilkan dari operasi `importKey` atau `deriveKey`
- **SilentShieldServiceInterface**: Interface TypeScript yang mendefinisikan kontrak `encrypt` dan `decrypt` untuk seluruh consumer di layer use case
- **Use_Case_Consumer**: Modul use case yang memanggil `encrypt` atau `decrypt` dari Silent_Shield_Service, meliputi: CheckIn, CheckOut, TopUpBalance, RegisterMember, dan ReadCard
- **MBC_App**: Aplikasi React single-page yang mengoperasikan empat mode peran untuk mengelola interaksi kartu NFC (referensi dari spec membership-benefit-card)

## Requirements

### Requirement 1: Migrasi Implementasi Enkripsi ke Web Crypto API

**User Story:** Sebagai developer, saya ingin layanan Silent Shield menggunakan Web Crypto API native, sehingga aplikasi tidak bergantung pada polyfill `crypto-browserify` dan memanfaatkan implementasi kriptografi bawaan browser yang lebih aman.

#### Acceptance Criteria

1. THE Silent_Shield_Service SHALL menggunakan `crypto.subtle.encrypt` dengan algoritma `AES-GCM` untuk operasi enkripsi
2. THE Silent_Shield_Service SHALL menggunakan `crypto.subtle.decrypt` dengan algoritma `AES-GCM` untuk operasi dekripsi
3. THE Silent_Shield_Service SHALL menghasilkan Initialization Vector (IV) sepanjang 12 byte menggunakan `crypto.getRandomValues` untuk setiap operasi enkripsi
4. THE Silent_Shield_Service SHALL menghasilkan output dalam format `[IV (12B) | ciphertext | authTag (16B)]` yang identik dengan format sebelumnya
5. THE Silent_Shield_Service SHALL menggunakan kunci AES-256 (256-bit / 32 byte) yang diderivasi melalui PBKDF2

### Requirement 2: Derivasi Kunci Menggunakan Web Crypto API PBKDF2

**User Story:** Sebagai developer, saya ingin derivasi kunci menggunakan PBKDF2 native dari Web Crypto API, sehingga proses derivasi kunci konsisten dengan implementasi sebelumnya tanpa polyfill.

#### Acceptance Criteria

1. THE Silent_Shield_Service SHALL melakukan derivasi kunci menggunakan `crypto.subtle.deriveKey` dengan algoritma PBKDF2
2. THE Silent_Shield_Service SHALL menggunakan passphrase, salt, dan jumlah iterasi yang sama dengan konfigurasi sebelumnya dari `MBC_KEYS`
3. THE Silent_Shield_Service SHALL menggunakan hash function SHA-256 untuk PBKDF2
4. THE Silent_Shield_Service SHALL melakukan caching terhadap CryptoKey yang telah diderivasi untuk menghindari operasi PBKDF2 berulang pada setiap pemanggilan encrypt atau decrypt
5. WHEN derivasi kunci pertama kali dipanggil, THE Silent_Shield_Service SHALL mengimpor passphrase sebagai raw key material melalui `crypto.subtle.importKey` sebelum melakukan `deriveKey`

### Requirement 3: Interface Asynchronous

**User Story:** Sebagai developer, saya ingin interface Silent Shield menjadi asynchronous, sehingga kompatibel dengan Web Crypto API yang sepenuhnya berbasis Promise.

#### Acceptance Criteria

1. THE SilentShieldServiceInterface SHALL mendefinisikan method `encrypt(data: Uint8Array): Promise<Uint8Array>`
2. THE SilentShieldServiceInterface SHALL mendefinisikan method `decrypt(data: Uint8Array): Promise<Uint8Array>`
3. THE Silent_Shield_Service SHALL mengembalikan Promise yang resolve ke `Uint8Array` untuk operasi encrypt
4. THE Silent_Shield_Service SHALL mengembalikan Promise yang resolve ke `Uint8Array` untuk operasi decrypt

### Requirement 4: Pembaruan Use Case Consumer

**User Story:** Sebagai developer, saya ingin seluruh use case yang memanggil encrypt/decrypt diperbarui untuk menggunakan `await`, sehingga operasi asynchronous ditangani dengan benar.

#### Acceptance Criteria

1. WHEN Use_Case_Consumer memanggil `silentShieldService.encrypt`, THE Use_Case_Consumer SHALL menggunakan `await` untuk menunggu hasil Promise
2. WHEN Use_Case_Consumer memanggil `silentShieldService.decrypt`, THE Use_Case_Consumer SHALL menggunakan `await` untuk menunggu hasil Promise
3. THE CheckIn use case SHALL menggunakan `await` pada pemanggilan `silentShieldService.decrypt` dan `silentShieldService.encrypt`
4. THE CheckOut use case SHALL menggunakan `await` pada pemanggilan `silentShieldService.decrypt` dan `silentShieldService.encrypt` termasuk pada operasi rollback
5. THE TopUpBalance use case SHALL menggunakan `await` pada pemanggilan `silentShieldService.decrypt` dan `silentShieldService.encrypt`
6. THE RegisterMember use case SHALL menggunakan `await` pada pemanggilan `silentShieldService.decrypt` dan `silentShieldService.encrypt`
7. THE ReadCard use case SHALL menggunakan `await` pada pemanggilan `silentShieldService.decrypt`

### Requirement 5: Penghapusan Dependensi crypto-browserify

**User Story:** Sebagai developer, saya ingin dependensi `crypto-browserify` dihapus dari proyek, sehingga bundle size berkurang dan tidak ada polyfill yang tidak terpakai.

#### Acceptance Criteria

1. THE MBC_App SHALL menghapus package `crypto-browserify` dari `dependencies` di `package.json`
2. THE MBC_App SHALL menghapus file deklarasi tipe `types/crypto-browserify.d.ts`
3. THE Silent_Shield_Service SHALL tidak mengimpor modul `crypto-browserify`
4. WHEN build dijalankan setelah migrasi, THE MBC_App SHALL berhasil compile tanpa error terkait modul `crypto-browserify`

### Requirement 6: Pembaruan Konstanta Algoritma

**User Story:** Sebagai developer, saya ingin nama algoritma diperbarui sesuai konvensi Web Crypto API, sehingga konfigurasi konsisten dengan API yang digunakan.

#### Acceptance Criteria

1. THE MBC_App SHALL memperbarui nilai `SILENT_SHIELD_ALGORITHM` di `MBC_KEYS` dari `'aes-256-gcm'` menjadi `'AES-GCM'` sesuai penamaan Web Crypto API
2. THE Silent_Shield_Service SHALL menggunakan nilai `SILENT_SHIELD_ALGORITHM` dari `MBC_KEYS` saat memanggil `crypto.subtle.encrypt` dan `crypto.subtle.decrypt`

### Requirement 7: Pembaruan Unit Test

**User Story:** Sebagai developer, saya ingin unit test diperbarui untuk mendukung interface asynchronous, sehingga test suite tetap valid dan memverifikasi perilaku yang benar.

#### Acceptance Criteria

1. THE test suite untuk Silent_Shield_Service SHALL memperbarui mock dan assertion untuk mendukung method `encrypt` dan `decrypt` yang mengembalikan Promise
2. THE test suite untuk Silent_Shield_Service SHALL memverifikasi round-trip property: untuk semua byte array yang valid, `decrypt(await encrypt(data))` menghasilkan data yang sama dengan input asli
3. THE test suite untuk setiap Use_Case_Consumer SHALL memperbarui mock `silentShieldService` agar method `encrypt` dan `decrypt` mengembalikan Promise
4. IF error terjadi selama operasi kriptografi, THEN THE Silent_Shield_Service SHALL melempar error yang deskriptif dan test suite SHALL memverifikasi error handling tersebut

### Requirement 8: Penanganan Error Kriptografi

**User Story:** Sebagai developer, saya ingin error dari operasi Web Crypto API ditangani dengan baik, sehingga kegagalan enkripsi atau dekripsi menghasilkan pesan error yang informatif.

#### Acceptance Criteria

1. IF operasi `crypto.subtle.encrypt` gagal, THEN THE Silent_Shield_Service SHALL melempar error dengan pesan yang menjelaskan kegagalan enkripsi
2. IF operasi `crypto.subtle.decrypt` gagal (misalnya data corrupt atau auth tag tidak valid), THEN THE Silent_Shield_Service SHALL melempar error dengan pesan yang menjelaskan kegagalan dekripsi
3. IF operasi derivasi kunci gagal, THEN THE Silent_Shield_Service SHALL melempar error dengan pesan yang menjelaskan kegagalan derivasi kunci
4. THE Silent_Shield_Service SHALL memastikan error dari Web Crypto API di-wrap dalam error yang konsisten dan informatif untuk consumer
