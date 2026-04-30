# Device Binding

> Covers: Req 19

## Overview

Device binding ensures that check-out can only be processed on the same physical device that performed the check-in. A unique `Device_ID` is generated on first launch, persisted in localStorage, written to the card during check-in, and validated during check-out.

## Device_ID Lifecycle

```mermaid
sequenceDiagram
    participant App as MBC App Launch
    participant LS as localStorage
    participant Card as NFC Card

    App->>LS: 1. getItem("mbc-config:device-id")
    alt Device_ID exists in LS
        LS-->>App: 2a. deviceId
    else Missing from LS
        App->>App: 2b. crypto.randomUUID()
        App->>LS: 3. Persist new ID
        App->>App: 4. Show warning: "New Device_ID generated"
    end

    Note over App,Card: During Check-In (The Gate)
    App->>Card: Write deviceId into CheckInStatus.deviceId

    Note over App,Card: During Check-Out (The Terminal)
    App->>Card: Read CheckInStatus.deviceId
    App->>App: Compare card.deviceId === local.deviceId
    alt Match
        App->>Card: Process check-out normally
    else Mismatch
        App->>App: Reject: "Return to original device"
    end
```

## Binding Flow

```mermaid
stateDiagram-v2
    [*] --> Generated: First launch
    Generated --> Persisted: Saved to localStorage

    state "Check-In" as CI {
        [*] --> WrittenToCard: deviceId written to CheckInStatus
    }

    state "Check-Out" as CO {
        [*] --> Comparing: Read deviceId from card
        Comparing --> Match: card.deviceId === local.deviceId
        Comparing --> Mismatch: card.deviceId !== local.deviceId
        Match --> Cleared: deviceId cleared from card
        Mismatch --> Rejected: "Return to original device"
    }

    Persisted --> CI: Gate mode
    CI --> CO: Terminal mode
    Cleared --> [*]: Session complete
```

## Validation Rules

| Scenario | Result | Req |
|----------|--------|-----|
| `card.checkIn.deviceId === currentDeviceId` | Check-out proceeds | 19.3 |
| `card.checkIn.deviceId !== currentDeviceId` | Check-out rejected | 19.4 |
| Check-out success | `deviceId` cleared from card | 19.5 |
| Device_ID missing on launch | New ID generated + warning | 19.7 |

## Regeneration Warning (Req 19.7)

If the Device_ID is missing from localStorage on app launch:
- A new UUID is generated via `crypto.randomUUID()`
- The `ensureDeviceId()` method returns `{ deviceId, wasRegenerated: true }`
- The UI displays a prominent warning: previous check-in sessions bound to the old Device_ID cannot be checked out on this device

## Storage

Device_ID is persisted via [Storage Architecture](Storage-Architecture):
- **Storage**: localStorage (key: `mbc-config:device-id`)

See [MBC Constants](../02-Data-Models/Zod-Validation-Schemas) for storage key definitions.

## Related Pages

- [Check-In Flow](../03-Business-Flows/Check-In-Flow) — Where deviceId is written to card
- [Check-Out Flow](../03-Business-Flows/Check-Out-Flow) — Where deviceId is validated
- [Storage Architecture](Storage-Architecture) — localStorage persistence with error handling
- [Correctness Properties](../06-Testing/Correctness-Properties) — Property 10: Device Binding Enforcement
