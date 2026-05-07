# Check-Out Flow

> Covers: Req 8, Req 18, Req 19
> Use Case: `CheckOut`
> Controller: `terminal.controller`
> Page: `MbcTerminal`

## Overview

Check-out is the most complex business flow. It reads the card, validates device binding, calculates the fee using the service type's pricing strategy, deducts from balance, clears check-in status, and records the transaction — all as a single atomic write. Only available in **The Terminal** mode.

## Flow

```mermaid
sequenceDiagram
    participant Op as Terminal Operator
    participant UI as Terminal Page
    participant Ctrl as terminal.controller
    participant UC as CheckOut
    participant NFC as nfc.service
    participant Dev as device.service
    participant Reg as benefit-registry.service
    participant Price as pricing.service
    participant Card as card-data.service

    Op->>UI: 1. Tap NFC card
    UI->>Ctrl: 2. onCardTap()
    Ctrl->>Ctrl: 3. Set isProcessing = true
    Ctrl->>UC: 4. execute()

    rect rgb(230, 240, 255)
        Note over UC,NFC: Read Phase
        UC->>NFC: 5. Read card
        NFC-->>UC: 6. CardData
    end

    rect rgb(255, 240, 230)
        Note over UC,Reg: Validation Phase
        UC->>UC: 7. Validate checkIn is active (Req 8.8)
        UC->>Dev: 8. getDeviceId()
        UC->>UC: 9. Validate deviceId match (Req 8.3)
        UC->>Reg: 10. getById(serviceTypeId)
        UC->>UC: 11. Validate service type found (Req 8.10)
    end

    rect rgb(230, 255, 230)
        Note over UC,Price: Calculation Phase
        UC->>Price: 12. calculateFee(strategy, checkInTime, now)
        Price-->>UC: 13. FeeResult
        UC->>UC: 14. Validate balance >= fee (Req 8.7)
    end

    rect rgb(255, 230, 255)
        Note over UC,NFC: Atomic Write Phase
        UC->>UC: 15. Snapshot current state (Req 18.1)
        UC->>Card: 16. applyCheckOut(card, fee, activityType, serviceTypeId, exitTime)
        Note right of Card: balance -= fee<br/>checkIn = null<br/>append transaction
        UC->>NFC: 17. Atomic write + verify (Req 18.2)
    end

    UC-->>Ctrl: 18. CheckOutResult
    Ctrl->>Ctrl: 19. Set isProcessing = false
    Ctrl-->>UI: 20. Display fee breakdown + remaining balance
```

## Validation Decision Tree

```mermaid
flowchart TD
    A[Card tapped] --> B{Registered?}
    B -->|No| B1[Error: Card not recognized]
    B -->|Yes| C{checkIn active?}
    C -->|No| C1[Error: Not checked in<br/>Req 8.8]
    C -->|Yes| D{Device_ID match?}
    D -->|No| D1[Error: Return to<br/>original device<br/>Req 8.3]
    D -->|Yes| E{Service type<br/>in registry?}
    E -->|No| E1[Error: Service type<br/>not recognized<br/>Req 8.10]
    E -->|Yes| F[Calculate fee]
    F --> G{balance >= fee?}
    G -->|No| G1[Error: Insufficient balance<br/>show shortage amount<br/>Req 8.7]
    G -->|Yes| H[Atomic write:<br/>deduct + clear + log]
    H --> I{Write + verify OK?}
    I -->|No| I1[Rollback to snapshot<br/>Req 18.4]
    I -->|Yes| J[Success: show breakdown<br/>Req 8.9]

    style B1 fill:#fecaca,stroke:#991b1b,color:#000
    style C1 fill:#fecaca,stroke:#991b1b,color:#000
    style D1 fill:#fecaca,stroke:#991b1b,color:#000
    style E1 fill:#fecaca,stroke:#991b1b,color:#000
    style G1 fill:#fecaca,stroke:#991b1b,color:#000
    style I1 fill:#fecaca,stroke:#991b1b,color:#000
    style J fill:#bbf7d0,stroke:#166534,color:#000
```

## Fee Calculation

The fee is calculated by the [Pricing Engine](../04-Technical-Flows/Pricing-Engine) using the service type's `PricingStrategy`. See that page for the full calculation logic.

## Double-Tap Prevention (Req 8.12, Req 18.5, Req 18.7)

1. `isProcessing = true` blocks all subsequent taps during the operation
2. After successful check-out, `checkIn` is cleared → a second tap returns "not checked in"
3. The atomic write ensures balance is deducted **exactly once** per check-in/check-out cycle

## Error Paths

| Error | Cause | User Message | Req |
|-------|-------|-------------|-----|
| Not checked in | `checkIn === null` | "Anggota belum check-in" | 8.8 |
| Device mismatch | `card.deviceId !== local.deviceId` | "Kembali ke device check-in" | 8.3 |
| Service type unknown | serviceTypeId not in registry | "Benefit type tidak dikenali" | 8.10 |
| Insufficient balance | `fee > balance` | "Saldo kurang Rp X, top-up di Station" | 8.7 |
| NFC write failed | Connection lost | Rollback + "Gagal, tap ulang" | 8.11 |
| Verification failed | Written data doesn't match | Rollback to snapshot | 18.6 |

## Result Type

```typescript
interface CheckOutResult {
  serviceTypeName: string;
  entryTime: string;
  exitTime: string;
  duration: string;        // e.g., "2 jam 30 menit"
  fee: number;
  remainingBalance: number;
  feeBreakdown: FeeResult;
}
```

## Related Pages

- [Check-In Flow](Check-In-Flow) — The entry counterpart
- [Pricing Engine](../04-Technical-Flows/Pricing-Engine) — Fee calculation details
- [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline) — Write integrity mechanism
- [Device Binding](../04-Technical-Flows/Device-Binding) — Device_ID validation
- [Manual Calculation](Manual-Calculation) — Fallback when NFC fails
- [Correctness Properties](../06-Testing/Correctness-Properties) — Properties 4, 5, 6, 10
