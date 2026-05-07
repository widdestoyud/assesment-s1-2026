# NFC Error Messages Bugfix Design

## Overview

The MBC feature currently throws hardcoded English error strings from infrastructure adapters (`webNfcAdapter.ts`), services (`nfc.service.ts`, `card-data.service.ts`, `silent-shield.service.ts`, `benefit-registry.service.ts`), and use cases (`CheckIn.ts`, `CheckOut.ts`, `ReadCard.ts`, `RegisterMember.ts`, `TopUpBalance.ts`, `ManualCalculation.ts`). These messages are not routed through the project's `i18next` + `react-i18next` locale system, making them impossible to localize and forcing users to read English regardless of their locale setting.

The fix introduces a locale key–based error messaging strategy: every user-facing error message across the MBC feature will reference an i18n key instead of a hardcoded string. The `NfcError.type` field already categorizes errors well, so the fix extends the `message` field to carry a locale key (or a structured error with a key + interpolation params). The locale files (`en.ts`, `id.ts`) become the single source of truth for all MBC error text.

Additionally, NFC card-type errors (incompatible, blank, non-MBC, corrupted) currently share a generic `read_failed` type with vague messages. The fix adds granular `NfcError.type` values and maps each to a specific, actionable locale key.

## Glossary

- **Bug_Condition (C)**: Any code path in the MBC feature that produces a user-facing error message using a hardcoded English string instead of an i18n locale key
- **Property (P)**: Every user-facing error message in the MBC feature SHALL be an i18n locale key resolvable by `i18next` in both `en` and `id` locales
- **Preservation**: All existing non-error behavior (successful card reads, writes, fee calculations, balance operations) and existing non-MBC locale keys must remain unchanged
- **`webNfcAdapter`**: Infrastructure adapter in `src/infrastructure/nfc/webNfcAdapter.ts` that wraps the browser's `NDEFReader` API behind `NfcProtocol`
- **`NfcError`**: Typed error interface in `src/@core/services/mbc/models/common.model.ts` with `type` and `message` fields
- **`NfcError.type`**: Discriminant field categorizing the error (e.g., `permission_denied`, `read_failed`, `write_failed`)
- **Locale key**: A string key (e.g., `mbc_nfc_error_incompatible_card`) that resolves to localized text via `i18next`
- **`en.ts` / `id.ts`**: Locale files at `src/translation/locale/` containing all translatable strings for English and Indonesian

## Bug Details

### Bug Condition

The bug manifests when any error occurs in the MBC NFC pipeline — from the infrastructure adapter through services to use cases. Every error path constructs a hardcoded English string as the `message` field of `NfcError` or as the argument to `throw new Error(...)`. These strings bypass the i18n system entirely.

There are two sub-categories:

1. **Generic NFC card errors**: Incompatible cards, blank cards, non-MBC data, and corrupted MBC data all produce vague, unhelpful messages that don't tell the user what went wrong or what to do.
2. **All other MBC errors**: Business logic errors (double check-in, insufficient balance, device mismatch, etc.) use descriptive but hardcoded English strings.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { module: MbcModule, errorPath: ErrorPath }
  OUTPUT: boolean

  LET errorMessage := getErrorMessage(input.module, input.errorPath)
  
  RETURN errorMessage IS NOT NULL
         AND errorMessage IS hardcoded string (not an i18n locale key)
         AND errorMessage IS user-facing (displayed in UI or propagated to controller)
END FUNCTION
```

### Examples

- **Incompatible card**: User taps a MIFARE Classic card → `onreadingerror` fires → adapter reports `{ type: 'read_failed', message: 'Error reading NFC tag — tag may be incompatible' }` → user sees English text with no actionable guidance. **Expected**: localized message like "Kartu tidak kompatibel. Gunakan kartu NTAG215 atau NTAG216." (Indonesian) or "Incompatible card. Please use an NTAG215 or NTAG216 card." (English)

- **Blank card**: User taps a blank NDEF card → `extractPayload` throws `'No text record found in NFC tag'` → adapter catches and reports `'Failed to extract data from NFC tag'` → user has no idea the card is blank. **Expected**: localized message directing user to register the card at The Station.

- **Non-MBC data**: User taps a card with a URL record → `base64ToUint8Array` fails on `atob()` → `card-data.service.deserialize` throws `'Failed to parse card data: invalid JSON'` → user sees a technical error. **Expected**: localized message indicating the card is not recognized as an MBC card.

- **Corrupted MBC data**: User taps a card with partial MBC JSON → Zod validation fails → `deserialize` throws `'Invalid card data: member.name: Required; balance: Expected number, received string'` → user sees raw Zod paths. **Expected**: localized message indicating the card data is damaged.

- **Insufficient balance (Indonesian locale)**: User checks out with insufficient funds → `CheckOut.ts` throws `'Insufficient balance. Fee: Rp 10,000, Balance: Rp 5,000, Shortage: Rp 5,000. Please top-up at The Station.'` → user sees English despite locale being `id`. **Expected**: `'Saldo tidak cukup. Biaya: Rp 10.000, Saldo: Rp 5.000, Kekurangan: Rp 5.000. Silakan top-up di The Station.'`

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Successful NFC card read → decrypt → deserialize → process pipeline must continue to work identically
- `NfcError.type` discriminant values (`permission_denied`, `hardware_unavailable`, `read_failed`, `write_failed`, `connection_lost`) must remain valid and unchanged for existing error categories
- Mouse/touch interactions with all MBC UI components must remain unchanged
- Fee calculation logic in `pricing.service.ts` must remain unchanged
- Atomic write pipeline (snapshot → write → verify → rollback) must remain unchanged
- All existing non-MBC locale keys in `en.ts` and `id.ts` must continue to resolve correctly
- Card data serialization format and Zod schema validation logic must remain unchanged
- `NfcProtocol` interface contract must remain unchanged

**Scope:**
All inputs that do NOT trigger an error path should be completely unaffected by this fix. This includes:
- Successful card reads with valid MBC data
- Successful card writes (registration, top-up, check-in, check-out)
- Benefit registry CRUD operations that succeed
- Manual fee calculations that succeed
- All non-MBC features of the application

## Hypothesized Root Cause

Based on the codebase analysis, the root causes are:

1. **No i18n integration in infrastructure/core layers**: The `webNfcAdapter.ts`, services, and use cases have no access to `i18next` and were written with inline English strings. The Clean Architecture pattern correctly keeps these layers free of UI concerns, but error messages are a cross-cutting concern that was not addressed.

2. **`NfcError.type` is too coarse for card-type errors**: The current `type` union (`permission_denied | hardware_unavailable | read_failed | write_failed | connection_lost`) lumps all card-reading issues under `read_failed`. There is no way to distinguish between an incompatible card, a blank card, non-MBC data, or corrupted MBC data at the type level.

3. **Error messages are constructed at throw-site**: Each `throw new Error(...)` in use cases constructs the full user-facing message inline, mixing business logic with presentation concerns. There is no error-to-locale-key mapping layer.

4. **No error classification in `card-data.service.ts`**: The `deserialize` function throws generic `Error` objects for JSON parse failures and Zod validation failures without classifying them into distinct error types that could be mapped to specific locale keys.

## Correctness Properties

Property 1: Bug Condition - All MBC error messages use i18n locale keys

_For any_ error thrown or reported by any MBC module (`webNfcAdapter`, `nfc.service`, `card-data.service`, `silent-shield.service`, `benefit-registry.service`, `CheckIn`, `CheckOut`, `ReadCard`, `RegisterMember`, `TopUpBalance`, `ManualCalculation`), the error message SHALL be an i18n locale key (prefixed with `mbc_`) that exists in both `en.ts` and `id.ts` locale files, and SHALL resolve to a non-empty localized string in both languages.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6**

Property 2: Preservation - Non-error behavior unchanged

_For any_ input that does NOT trigger an error path (valid MBC card data, successful operations, non-MBC locale keys), the fixed code SHALL produce exactly the same result as the original code, preserving all successful card operations, fee calculations, and existing locale key resolution.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/@core/services/mbc/models/common.model.ts`

**Changes**:
1. **Extend `NfcError.type` union**: Add granular card-error types to distinguish between incompatible, blank, non-MBC, and corrupted cards:
   - Add `'incompatible_card'` — card triggers `onreadingerror` (e.g., MIFARE Classic)
   - Add `'blank_card'` — NDEF card with no text records
   - Add `'invalid_card_data'` — text record present but not valid MBC payload (JSON parse failure or base64 decode failure)
   - Add `'corrupted_card_data'` — valid JSON but fails Zod schema validation
2. **Add `messageKey` field to `NfcError`**: Add an optional `messageKey: string` field that carries the i18n locale key. The existing `message` field remains as a fallback/debug string. Alternatively, repurpose `message` to carry the locale key directly since the `type` field already provides programmatic classification.
3. **Add `messageParams` field to `NfcError`**: Add an optional `messageParams: Record<string, string | number>` field for interpolation values (e.g., fee amount, balance, member name).

**File**: `src/infrastructure/nfc/webNfcAdapter.ts`

**Function**: `startScan`, `write`, `extractPayload`

**Specific Changes**:
1. **`extractPayload`**: Throw a typed error distinguishing "no text record" (blank card) from "base64 decode failure" (non-MBC data)
2. **`startScan` → `onreading` catch**: Map `extractPayload` errors to specific `NfcError.type` values (`blank_card`, `invalid_card_data`) with corresponding locale keys
3. **`startScan` → `onreadingerror`**: Change type from `read_failed` to `incompatible_card` with locale key `mbc_nfc_error_incompatible_card`
4. **All `message` fields**: Replace hardcoded English strings with `mbc_`-prefixed locale keys
5. **`write` error messages**: Replace hardcoded strings with locale keys

**File**: `src/@core/services/mbc/card-data.service.ts`

**Function**: `deserialize`

**Specific Changes**:
1. **JSON parse failure**: Throw an error with a locale key `mbc_error_card_not_recognized` instead of `'Failed to parse card data: invalid JSON'`
2. **Zod validation failure**: Throw an error with a locale key `mbc_error_card_data_corrupted` instead of exposing raw Zod paths

**File**: `src/@core/services/mbc/nfc.service.ts`

**Function**: `readCard`

**Specific Changes**:
1. **Error wrapping**: Preserve the `NfcError.type` and locale key from the adapter when wrapping errors, instead of constructing a new hardcoded message string

**Files**: `src/@core/use_case/mbc/CheckIn.ts`, `CheckOut.ts`, `ReadCard.ts`, `RegisterMember.ts`, `TopUpBalance.ts`, `ManualCalculation.ts`

**Specific Changes**:
1. **All `throw new Error(...)` calls**: Replace hardcoded English strings with locale keys
2. **Interpolation parameters**: For messages that include dynamic values (fee amounts, balance, member names), use `messageParams` for i18next interpolation (e.g., `mbc_error_insufficient_balance` with `{ fee: '10,000', balance: '5,000', shortage: '5,000' }`)

**File**: `src/@core/services/mbc/benefit-registry.service.ts`

**Specific Changes**:
1. **Validation errors**: Replace `'Invalid benefit type: ...'` with locale key `mbc_error_invalid_benefit_type`
2. **Not found errors**: Replace `'Benefit type with id "..." not found'` with locale key `mbc_error_benefit_type_not_found`
3. **Duplicate errors**: Replace `'Benefit type with id "..." already exists'` with locale key `mbc_error_benefit_type_duplicate`

**File**: `src/@core/services/mbc/silent-shield.service.ts`

**Specific Changes**:
1. **Encryption/decryption errors**: Replace hardcoded strings with locale keys (`mbc_error_encryption_failed`, `mbc_error_decryption_failed`, `mbc_error_key_derivation_failed`)

**File**: `src/translation/locale/en.ts`

**Specific Changes**:
1. **Add MBC error locale keys**: Add all `mbc_`-prefixed keys with English translations, including interpolation placeholders (e.g., `{{fee}}`, `{{balance}}`)

**File**: `src/translation/locale/id.ts`

**Specific Changes**:
1. **Add MBC error locale keys**: Add all `mbc_`-prefixed keys with Indonesian translations, matching the same interpolation placeholders

### Error Key Catalog

| Locale Key | NfcError.type | English | Indonesian |
|---|---|---|---|
| `mbc_nfc_error_incompatible_card` | `incompatible_card` | Incompatible card. Please use an NTAG215 or NTAG216 card. | Kartu tidak kompatibel. Gunakan kartu NTAG215 atau NTAG216. |
| `mbc_nfc_error_blank_card` | `blank_card` | This card is blank. Please register it at The Station first. | Kartu ini kosong. Silakan daftarkan di The Station terlebih dahulu. |
| `mbc_nfc_error_card_not_recognized` | `invalid_card_data` | This card is not recognized as an MBC card. | Kartu ini tidak dikenali sebagai kartu MBC. |
| `mbc_nfc_error_card_data_corrupted` | `corrupted_card_data` | Card data is damaged or invalid. Please re-register at The Station. | Data kartu rusak atau tidak valid. Silakan daftarkan ulang di The Station. |
| `mbc_nfc_error_permission_denied` | `permission_denied` | NFC permission was denied. Please allow NFC access in browser settings. | Izin NFC ditolak. Silakan izinkan akses NFC di pengaturan browser. |
| `mbc_nfc_error_hardware_unavailable` | `hardware_unavailable` | NFC is not available on this device or browser. | NFC tidak tersedia di perangkat atau browser ini. |
| `mbc_nfc_error_connection_lost` | `connection_lost` | NFC connection lost. Please keep the card steady and try again. | Koneksi NFC terputus. Tahan kartu dengan stabil dan coba lagi. |
| `mbc_nfc_error_read_failed` | `read_failed` | Failed to read NFC card. Please try again. | Gagal membaca kartu NFC. Silakan coba lagi. |
| `mbc_nfc_error_write_failed` | `write_failed` | Failed to write to NFC card. Please try again. | Gagal menulis ke kartu NFC. Silakan coba lagi. |
| `mbc_nfc_error_scan_failed` | `read_failed` | NFC scan failed. Please try again. | Pemindaian NFC gagal. Silakan coba lagi. |
| `mbc_error_not_registered` | — | Card is not registered. Please register at The Station first. | Kartu belum terdaftar. Silakan daftarkan di The Station terlebih dahulu. |
| `mbc_error_already_checked_in` | — | Member already checked in. Please complete check-out first. | Member sudah check-in. Silakan selesaikan check-out terlebih dahulu. |
| `mbc_error_not_checked_in` | — | Member has not checked in. Cannot process check-out. | Member belum check-in. Tidak dapat memproses check-out. |
| `mbc_error_device_mismatch` | — | Device mismatch. Please return to the original check-in device. | Perangkat tidak cocok. Silakan kembali ke perangkat check-in awal. |
| `mbc_error_insufficient_balance` | — | Insufficient balance. Fee: Rp {{fee}}, Balance: Rp {{balance}}, Shortage: Rp {{shortage}}. Please top-up at The Station. | Saldo tidak cukup. Biaya: Rp {{fee}}, Saldo: Rp {{balance}}, Kekurangan: Rp {{shortage}}. Silakan top-up di The Station. |
| `mbc_error_benefit_type_not_found` | — | Benefit type "{{id}}" not found. Please configure at The Station. | Tipe layanan "{{id}}" tidak ditemukan. Silakan konfigurasi di The Station. |
| `mbc_error_benefit_type_duplicate` | — | Benefit type "{{id}}" already exists. | Tipe layanan "{{id}}" sudah ada. |
| `mbc_error_invalid_benefit_type` | — | Invalid benefit type configuration. | Konfigurasi tipe layanan tidak valid. |
| `mbc_error_card_already_registered` | — | Card already registered to {{name}}. | Kartu sudah terdaftar atas nama {{name}}. |
| `mbc_error_write_verification_failed` | — | Write verification failed. Card has been rolled back. | Verifikasi penulisan gagal. Kartu telah dikembalikan ke kondisi sebelumnya. |
| `mbc_error_critical_rollback_failed` | — | CRITICAL: Write failed and rollback failed. Card may be inconsistent. Contact support. | KRITIS: Penulisan gagal dan pemulihan gagal. Kartu mungkin tidak konsisten. Hubungi dukungan. |
| `mbc_error_topup_amount_invalid` | — | Top-up amount must be a positive number. | Jumlah top-up harus berupa angka positif. |
| `mbc_error_invalid_timestamp` | — | Invalid check-in timestamp format. | Format waktu check-in tidak valid. |
| `mbc_error_encryption_failed` | — | Card encryption failed. Please try again. | Enkripsi kartu gagal. Silakan coba lagi. |
| `mbc_error_decryption_failed` | — | Failed to read card data. Card may be from a different system. | Gagal membaca data kartu. Kartu mungkin dari sistem lain. |
| `mbc_error_key_derivation_failed` | — | Security initialization failed. Please restart the app. | Inisialisasi keamanan gagal. Silakan mulai ulang aplikasi. |

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that error messages are indeed hardcoded English strings and not locale keys.

**Test Plan**: Write tests that trigger each error path in the MBC modules and assert that the error message is a hardcoded English string (not a locale key). Run these tests on the UNFIXED code to observe the bug in action.

**Test Cases**:
1. **Incompatible Card Test**: Mock `onreadingerror` in `webNfcAdapter` and verify the message is the hardcoded string `'Error reading NFC tag — tag may be incompatible'` (will pass on unfixed code, confirming the bug)
2. **Blank Card Test**: Mock an NDEF message with no text records and verify `extractPayload` throws `'No text record found in NFC tag'` (will pass on unfixed code)
3. **Non-MBC Data Test**: Pass invalid JSON bytes to `card-data.service.deserialize` and verify it throws `'Failed to parse card data: invalid JSON'` (will pass on unfixed code)
4. **Corrupted Data Test**: Pass invalid CardData JSON to `deserialize` and verify it throws `'Invalid card data: ...'` with raw Zod paths (will pass on unfixed code)
5. **Use Case Error Test**: Trigger insufficient balance in `CheckOut` and verify the message is hardcoded English with embedded amounts (will pass on unfixed code)

**Expected Counterexamples**:
- All error messages are plain English strings, not i18n locale keys
- No error message starts with the `mbc_` prefix
- Possible causes: no i18n integration in core/infrastructure layers, inline string construction at throw sites

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (any MBC error path), the fixed function produces error messages that are valid i18n locale keys.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := triggerError_fixed(input)
  ASSERT result.message starts with 'mbc_'
  ASSERT localeFile['en'][result.message] IS NOT empty
  ASSERT localeFile['id'][result.message] IS NOT empty
  IF result.messageParams THEN
    ASSERT i18next.t(result.message, result.messageParams) resolves without missing interpolations
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (successful operations, non-MBC locale keys), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many random valid `CardData` objects to verify the serialize/deserialize pipeline is unchanged
- It generates random fee calculation inputs to verify pricing is unchanged
- It catches edge cases in card data mutations that manual tests might miss
- It provides strong guarantees that behavior is unchanged for all non-error inputs

**Test Plan**: Observe behavior on UNFIXED code first for successful operations, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Card Serialization Preservation**: Generate random valid `CardData` objects, verify `serialize` → `deserialize` round-trip produces identical output before and after fix
2. **Fee Calculation Preservation**: Generate random pricing inputs, verify `calculateFee` produces identical results
3. **Existing Locale Key Preservation**: Verify all existing non-MBC keys in `en.ts` and `id.ts` resolve to the same values after adding MBC keys
4. **NfcError.type Preservation**: Verify that `permission_denied`, `hardware_unavailable`, `connection_lost` error types still produce errors with those exact type values

### Unit Tests

- Test each error path in `webNfcAdapter.ts` produces the correct `NfcError.type` and locale key
- Test `card-data.service.deserialize` with blank data, non-MBC data, and corrupted data produces distinct locale keys
- Test each use case error path (`CheckIn`, `CheckOut`, `ReadCard`, `RegisterMember`, `TopUpBalance`, `ManualCalculation`) throws errors with locale keys
- Test `benefit-registry.service` validation, not-found, and duplicate errors use locale keys
- Test `silent-shield.service` encryption/decryption errors use locale keys
- Test that locale keys with interpolation params (e.g., `mbc_error_insufficient_balance` with `{{fee}}`) resolve correctly in both `en` and `id`

### Property-Based Tests

- Generate random `NfcError.type` values and verify each maps to a valid locale key in both `en.ts` and `id.ts`
- Generate random valid `CardData` objects and verify the full read pipeline (deserialize → validate) succeeds identically before and after fix
- Generate random invalid byte arrays and verify `deserialize` always throws with a `mbc_`-prefixed locale key (never a raw English string)
- Generate random card mutation sequences (register → top-up → check-in → check-out) and verify successful operations produce identical results

### Integration Tests

- Test full NFC card tap → error display flow in Gate page with mocked `webNfcAdapter` returning each error type, verify the UI displays localized text
- Test locale switching: trigger an error with locale set to `en`, verify English message; switch to `id`, trigger same error, verify Indonesian message
- Test that the error alert component (`role="alert"`) in Gate/Station/Terminal pages renders the resolved locale string, not the raw key
