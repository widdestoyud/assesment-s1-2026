# NFC Capability Detection

> Covers: Req 22

## Overview

On launch, the MBC app detects Web NFC support and permission status. Unsupported browsers see a compatibility notice. Supported browsers without permission see a prompt. Role modes requiring NFC are disabled until NFC is confirmed available.

## Detection Flow

```mermaid
flowchart TD
    A[App Launch] --> B{"'NDEFReader'<br/>in window?"}
    B -->|No| C[Status: UNSUPPORTED]
    C --> D[Show full-screen<br/>compatibility notice<br/>Req 22.2]
    D --> E[Disable Station, Gate, Terminal<br/>Req 22.5]
    E --> F[Allow Scout in demo mode<br/>Req 22.6]

    B -->|Yes| G[Status: PERMISSION_PENDING]
    G --> H[Prompt user for<br/>NFC permission<br/>Req 22.3]
    H --> I{Permission result}
    I -->|Granted| J[Status: SUPPORTED]
    J --> K[All modes enabled]
    I -->|Denied| L[Status: PERMISSION_DENIED]
    L --> M[Show message:<br/>"NFC permission required"<br/>Req 22.4]
    M --> N[Provide instructions<br/>to re-enable via<br/>browser settings]

    style C fill:#fecaca,stroke:#991b1b,color:#000
    style J fill:#bbf7d0,stroke:#166534,color:#000
    style L fill:#fef3c7,stroke:#92400e,color:#000
```

## NFC Capability Status

```typescript
export type NfcCapabilityStatus =
  | 'supported'          // API available + permission granted
  | 'unsupported'        // API not available in browser/platform
  | 'permission_pending' // API available but permission not yet requested
  | 'permission_denied'; // User explicitly denied NFC access
```

## Role Mode Availability

| Status | Station | Gate | Terminal | Scout |
|--------|:-------:|:----:|:--------:|:-----:|
| `supported` | ✅ | ✅ | ✅ | ✅ |
| `unsupported` | ❌ | ❌ | ❌ | ⚠️ Demo mode |
| `permission_pending` | ❌ | ❌ | ❌ | ⚠️ Demo mode |
| `permission_denied` | ❌ | ❌ | ❌ | ⚠️ Demo mode |

## Status Display (Req 22.7)

The role selection interface displays the current NFC support status:
- **Supported**: Green indicator, all roles enabled
- **Unsupported**: Red indicator, NFC roles visually disabled
- **Permission pending**: Yellow indicator, prompt to grant permission
- **Permission denied**: Orange indicator, instructions to re-enable

## Diagnostic Button (Req 22.8)

A "Check NFC Support" button re-evaluates NFC availability and permission status on demand. Useful after the user changes browser settings.

## Browser Requirements

| Browser | NFC Support |
|---------|:-----------:|
| Chrome Android 89+ | ✅ |
| Chrome Desktop | ❌ |
| Safari (iOS) | ❌ |
| Firefox | ❌ |
| Samsung Internet | ❌ |

## Related Pages

- [Role Picker](../05-UI-Components/Role-Picker) — Where NFC status is displayed
- [Design Decisions](../01-Architecture/Design-Decisions) — ADR-1: Web NFC API choice
- [Overview](../01-Architecture/Overview) — Tech stack and platform requirements
