# Data Flow

> Covers: Req 2, Req 3, Req 8, Req 11, Req 13

## Overview

This page documents how data flows through the Clean Architecture layers for each major operation. All flows follow the same pattern: **User → UI → Controller → Use Case → Services → Protocols → Infrastructure**.

## Check-Out Flow (Most Complex)

The check-out flow demonstrates the full data pipeline including device binding validation, fee calculation, and atomic write.

```mermaid
sequenceDiagram
    participant Op as Operator
    participant UI as Terminal Page
    participant Ctrl as terminal.controller
    participant UC as CheckOut UseCase
    participant NFC as nfc.service
    participant Card as card-data.service
    participant Price as pricing.service
    participant Crypto as silent-shield.service
    participant Dev as device.service
    participant Reg as benefit-registry.service

    Op->>UI: 1. Taps NFC card
    UI->>Ctrl: 2. onCardTap(event)
    Ctrl->>Ctrl: 3. Set isProcessing = true
    Ctrl->>UC: 4. execute()

    rect rgb(230, 240, 255)
        Note over UC,Crypto: Read Phase
        UC->>NFC: 5. read()
        NFC-->>UC: 6. raw NDEF data
        UC->>Crypto: 7. decrypt(rawData)
        Crypto-->>UC: 8. decrypted bytes
        UC->>Card: 9. deserialize(bytes)
        Card-->>UC: 10. CardData object
    end

    rect rgb(255, 240, 230)
        Note over UC,Reg: Validation Phase
        UC->>UC: 11. Validate checkIn is active
        UC->>Dev: 12. getDeviceId()
        Dev-->>UC: 13. currentDeviceId
        UC->>UC: 14. Validate deviceId match
        UC->>Reg: 15. getById(serviceTypeId)
        Reg-->>UC: 16. BenefitType + PricingStrategy
    end

    rect rgb(230, 255, 230)
        Note over UC,Price: Calculation Phase
        UC->>Price: 17. calculateFee(strategy, checkInTime, now)
        Price-->>UC: 18. FeeResult
        UC->>UC: 19. Validate balance >= fee
    end

    rect rgb(255, 230, 255)
        Note over UC,NFC: Atomic Write Phase
        UC->>UC: 20. Snapshot current state
        UC->>Card: 21. applyCheckOut(cardData, fee)
        UC->>Card: 22. serialize(updatedCardData)
        UC->>Crypto: 23. encrypt(serializedBytes)
        UC->>NFC: 24. write(encryptedData)
        UC->>NFC: 25. read() — verification
        UC->>UC: 26. Compare written vs read
    end

    UC-->>Ctrl: 27. CheckOutResult
    Ctrl->>Ctrl: 28. Set isProcessing = false
    Ctrl-->>UI: 29. Display fee breakdown + balance
    UI-->>Op: 30. Success confirmation
```

## Check-In Flow

```mermaid
sequenceDiagram
    participant Op as Gate Operator
    participant UI as Gate Page
    participant Ctrl as gate.controller
    participant UC as CheckIn UseCase
    participant NFC as nfc.service
    participant Card as card-data.service
    participant Crypto as silent-shield.service
    participant Dev as device.service

    Op->>UI: 1. Select service type
    Op->>UI: 2. Tap NFC card
    UI->>Ctrl: 3. onCardTap()
    Ctrl->>Ctrl: 4. Set isProcessing = true
    Ctrl->>UC: 5. execute(serviceTypeId, timestamp)

    UC->>NFC: 6. read()
    NFC-->>UC: 7. raw data
    UC->>Crypto: 8. decrypt()
    UC->>Card: 9. deserialize()
    Card-->>UC: 10. CardData

    UC->>UC: 11. Validate no active checkIn
    UC->>Dev: 12. getDeviceId()
    Dev-->>UC: 13. deviceId

    UC->>Card: 14. applyCheckIn(card, serviceTypeId, deviceId, timestamp)
    UC->>Card: 15. serialize()
    UC->>Crypto: 16. encrypt()
    UC->>NFC: 17. write() + verify()

    UC-->>Ctrl: 18. CheckInResult
    Ctrl-->>UI: 19. Show confirmation
```

## Registration Flow

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant UI as Station Page
    participant Ctrl as station.controller
    participant UC as RegisterMember UseCase
    participant NFC as nfc.service
    participant Card as card-data.service
    participant Crypto as silent-shield.service

    Admin->>UI: 1. Fill name + memberId
    Admin->>UI: 2. Tap blank NFC card
    UI->>Ctrl: 3. onRegister(formData)
    Ctrl->>UC: 4. execute(memberIdentity)

    UC->>NFC: 5. read()
    UC->>Crypto: 6. decrypt()
    UC->>Card: 7. deserialize()
    UC->>UC: 8. Validate card is blank/unregistered

    UC->>Card: 9. applyRegistration(card, member)
    Note right of Card: balance = 0, checkIn = null, transactions = []
    UC->>Card: 10. serialize()
    UC->>Crypto: 11. encrypt()
    UC->>NFC: 12. write() + verify()

    UC-->>Ctrl: 13. OperationResult
    Ctrl-->>UI: 14. Show member details
```

## Data Transformation Pipeline

Every NFC read/write follows this transformation chain:

```mermaid
flowchart LR
    subgraph Write["Write Path"]
        direction LR
        CD1[CardData<br/>object] -->|JSON.stringify| JSON1[JSON<br/>string]
        JSON1 -->|TextEncoder| UTF1[UTF-8<br/>Uint8Array]
        UTF1 -->|AES-256-GCM| ENC1["[IV|cipher|tag]<br/>Uint8Array"]
        ENC1 -->|NDEFReader.write| NFC1[NDEF Text<br/>Record]
    end

    subgraph Read["Read Path"]
        direction LR
        NFC2[NDEF Text<br/>Record] -->|NDEFReader.scan| ENC2["[IV|cipher|tag]<br/>Uint8Array"]
        ENC2 -->|AES-256-GCM| UTF2[UTF-8<br/>Uint8Array]
        UTF2 -->|TextDecoder| JSON2[JSON<br/>string]
        JSON2 -->|JSON.parse + Zod| CD2[CardData<br/>object]
    end
```

## Related Pages

- [Atomic Write Pipeline](../04-Technical-Flows/Atomic-Write-Pipeline) — Snapshot, write, verify, rollback details
- [Silent Shield Encryption](../04-Technical-Flows/Silent-Shield-Encryption) — AES-256-GCM encrypt/decrypt flow
- [Card Data Schema](../02-Data-Models/Card-Data-Schema) — CardData structure
- [Check-Out Flow](../03-Business-Flows/Check-Out-Flow) — Business rules and error paths
- [Check-In Flow](../03-Business-Flows/Check-In-Flow) — Business rules and simulation mode
