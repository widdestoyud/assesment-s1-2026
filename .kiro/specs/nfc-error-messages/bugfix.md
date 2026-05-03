# Bugfix Requirements Document

## Introduction

When a user taps an NFC card that the hardware detects but the MBC app cannot process (incompatible card type, blank NDEF card, non-MBC data, or corrupted MBC data), the app displays generic, hardcoded English error messages such as "Failed to extract data from NFC tag" or "Error reading NFC tag — tag may be incompatible." These messages do not help the user understand the root cause or what action to take. Additionally, all user-facing error messages across the MBC feature (infrastructure adapters, services, and use cases) are hardcoded English strings rather than going through the project's existing i18n system (`i18next` + `react-i18next`), making them impossible to localize or manage from a single source.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an incompatible NFC card is tapped (e.g., MIFARE Classic that triggers `onreadingerror`) THEN the system reports a generic "Error reading NFC tag — tag may be incompatible" message that does not identify the card type issue or suggest a compatible alternative

1.2 WHEN a blank NDEF card with no text records is tapped THEN the system throws "No text record found in NFC tag" internally and surfaces "Failed to extract data from NFC tag" to the user, without indicating the card is blank or needs registration

1.3 WHEN an NDEF card containing non-MBC data (valid text record but not base64-encoded MBC payload) is tapped THEN the system throws a JSON parse error ("Failed to parse card data: invalid JSON") or a base64 decode error, surfaced as a generic read failure with no indication that the card is not an MBC card

1.4 WHEN an NDEF card containing corrupted or invalid MBC data (valid JSON but fails Zod schema validation) is tapped THEN the system throws "Invalid card data: [field errors]" with raw Zod validation paths that are meaningless to end users

1.5 WHEN any NFC error occurs in `webNfcAdapter.ts`, `nfc.service.ts`, `card-data.service.ts`, `CheckIn.ts`, `CheckOut.ts`, or `benefit-registry.service.ts` THEN the system displays hardcoded English strings that cannot be localized or centrally managed

1.6 WHEN the app locale is set to Indonesian (id) THEN all MBC NFC error messages still appear in English because they are hardcoded and bypass the i18n locale system

### Expected Behavior (Correct)

2.1 WHEN an incompatible NFC card is tapped (triggering `onreadingerror`) THEN the system SHALL display a localized, specific message indicating the card is incompatible and suggesting compatible card types (e.g., NTAG215/216), retrieved via an i18n locale key

2.2 WHEN a blank NDEF card with no text records is tapped THEN the system SHALL display a localized, specific message indicating the card is blank and directing the user to register the card at The Station, retrieved via an i18n locale key

2.3 WHEN an NDEF card containing non-MBC data is tapped THEN the system SHALL display a localized, specific message indicating the card data is not recognized as an MBC card, retrieved via an i18n locale key

2.4 WHEN an NDEF card containing corrupted or invalid MBC data is tapped THEN the system SHALL display a localized, specific message indicating the card data is damaged or invalid, retrieved via an i18n locale key

2.5 WHEN any user-facing error occurs in the MBC feature (across `webNfcAdapter.ts`, `nfc.service.ts`, `card-data.service.ts`, `CheckIn.ts`, `CheckOut.ts`, and `benefit-registry.service.ts`) THEN the system SHALL use i18n locale keys for all error message strings so that text is managed in one place (`en.ts` and `id.ts`)

2.6 WHEN the app locale is set to Indonesian (id) THEN all MBC NFC error messages SHALL appear in Indonesian, and WHEN set to English (en) THEN they SHALL appear in English

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid MBC NFC card with correct encrypted data is tapped THEN the system SHALL CONTINUE TO successfully read, decrypt, deserialize, and process the card data without any error

3.2 WHEN NFC permission is denied by the user THEN the system SHALL CONTINUE TO report a permission denied error with the `permission_denied` error type

3.3 WHEN NFC hardware is unavailable or unsupported THEN the system SHALL CONTINUE TO report a hardware unavailable error with the `hardware_unavailable` error type

3.4 WHEN an NFC connection is lost during a write operation THEN the system SHALL CONTINUE TO report a connection lost error with the `connection_lost` error type

3.5 WHEN a check-in is attempted on a card with an active check-in session THEN the system SHALL CONTINUE TO reject the operation with an appropriate error

3.6 WHEN a check-out is attempted on a card with no active check-in session THEN the system SHALL CONTINUE TO reject the operation with an appropriate error

3.7 WHEN a check-out is attempted but the card has insufficient balance THEN the system SHALL CONTINUE TO reject the operation with an error that includes the fee, balance, and shortage amounts

3.8 WHEN the existing non-MBC locale keys in `en.ts` and `id.ts` are used elsewhere in the app THEN the system SHALL CONTINUE TO resolve those keys correctly without any regression
