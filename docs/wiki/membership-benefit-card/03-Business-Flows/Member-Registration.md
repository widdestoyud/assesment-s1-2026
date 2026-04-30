# Member Registration

> Covers: Req 4
> Use Case: `RegisterMember`
> Controller: `station.controller`
> Page: `MbcStation`

## Overview

Registration creates a new member card by writing identity data to a blank NFC card with an initial balance of Rp 0. Only available in **The Station** mode.

## Flow

```mermaid
sequenceDiagram
    participant Admin as Admin (Station)
    participant UI as Station Page
    participant Ctrl as station.controller
    participant UC as RegisterMember
    participant NFC as nfc.service
    participant Card as card-data.service

    Admin->>UI: 1. Fill registration form (name, memberId)
    Admin->>UI: 2. Tap blank NFC card
    UI->>Ctrl: 3. onRegister(formData)
    Ctrl->>Ctrl: 4. Validate form via RegistrationFormSchema
    Ctrl->>Ctrl: 5. Set isProcessing = true
    Ctrl->>UC: 6. execute(memberIdentity)

    UC->>NFC: 7. Read card (atomic pipeline)
    NFC-->>UC: 8. CardData

    alt Card already has member data
        UC-->>Ctrl: 9a. Error: "Card already registered"
        Ctrl-->>UI: 10a. Show warning (Req 4.3)
    else Card is blank/unregistered
        UC->>Card: 9b. applyRegistration(card, member)
        Note right of Card: version=1, balance=0,<br/>checkIn=null, transactions=[]
        UC->>NFC: 10b. Atomic write + verify
        UC-->>Ctrl: 11b. OperationResult
        Ctrl-->>UI: 12b. Show confirmation with member details
    end

    Ctrl->>Ctrl: 13. Set isProcessing = false
```

## Steps

1. Admin enters member name and member ID in the registration form
2. Form is validated against `RegistrationFormSchema` (name: 1-50 chars, memberId: 1-20 chars)
3. Admin taps a blank NFC card against the device
4. System reads the card via the [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline)
5. System checks if the card already contains member data
6. If blank: writes member identity with balance = Rp 0
7. If already registered: shows warning, no write performed
8. On success: displays confirmation with registered member details

## Error Paths

| Error | Cause | User Message | Req |
|-------|-------|-------------|-----|
| Card already registered | Card has existing member data | "Kartu sudah terdaftar" | 4.3 |
| NFC read failed | Card removed too early | "Gagal membaca kartu, tap ulang" | 2.2 |
| NFC write failed | Connection lost during write | "Gagal menulis kartu" + rollback | 3.2 |
| Invalid form data | Empty name or memberId | Inline validation errors | 4.1 |

## Result Type

```typescript
interface OperationResult {
  type: 'registration';
  memberName: string;
  newBalance: number; // always 0 for registration
}
```

## Related Pages

- [Balance Top-Up](Balance-Top-Up) — Next step after registration
- [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline) — Write integrity mechanism
- [Card Data Schema](../02-Data-Models/Card-Data-Schema) — `applyRegistration` mutation
- [Station Interface](../05-UI-Components/Station-Interface) — UI layout
