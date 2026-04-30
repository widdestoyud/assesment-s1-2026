# Service Type Configuration

> Covers: Req 15, Req 16, Req 17
> Use Case: `ManageServiceRegistry`
> Controller: `station.controller`
> Page: `MbcStation`

## Overview

Service type configuration allows admins to manage the Service Registry — adding, editing, and removing service types with their pricing strategies. Only available in **The Station** mode.

## CRUD Operations

```mermaid
flowchart TD
    A[Station — Service Config Tab] --> B{Action}
    B -->|Add| C[ServiceTypeForm<br/>with empty fields]
    B -->|Edit| D[ServiceTypeForm<br/>with existing values]
    B -->|Remove| E[Confirm deletion]

    C -->|Submit| F[Validate via<br/>ServiceTypeFormSchema]
    D -->|Submit| F
    F -->|Valid| G[Save to Service Registry]
    G --> H[Persist to dual-layer storage]
    E -->|Confirmed| I[Remove from registry]
    I --> H

    style H fill:#dbeafe,stroke:#1e40af,color:#000
```

## Service Registry Lifecycle

```mermaid
stateDiagram-v2
    [*] --> CheckStorage: App launch
    CheckStorage --> HasData: Registry found
    CheckStorage --> InitDefaults: No registry data
    InitDefaults --> HasData: Created with DEFAULT_PARKING_SERVICE
    HasData --> Ready: Validated

    state Ready {
        [*] --> Idle
        Idle --> Adding: Add service type
        Idle --> Editing: Edit service type
        Idle --> Removing: Remove service type
        Adding --> Idle: Saved
        Editing --> Idle: Saved
        Removing --> Idle: Removed
    }
```

## Default Initialization (Req 15.6, Req 15.7)

On first launch (no registry data in storage), the system initializes with:

```typescript
DEFAULT_PARKING_SERVICE = {
  id: 'parking',
  displayName: 'Parkir',
  activityType: 'parking-fee',
  pricing: {
    ratePerUnit: 2000,
    unitType: 'per-hour',
    roundingStrategy: 'ceiling',
  },
};
```

See [Service Type Model](../02-Data-Models/Service-Type-Model) for the full model definition.

## Supported Service Categories (Req 16)

| Category | Examples | Unit Type |
|----------|----------|-----------|
| Duration-based | Parking, bike rental, gym session | `per-hour` |
| Visit-based | Restaurant, VIP lounge, facility entry | `per-visit` |
| Loyalty/discount | Membership discount, loyalty points | `per-visit` (no fee) |

## Persistence

The Service Registry is persisted via [Resilient Storage](../04-Technical-Flows/Resilient-Storage) — dual-layer IndexedDB + localStorage. Data integrity is validated on each app launch using Zod (Req 20.5).

## Form Validation

Service type forms are validated by `ServiceTypeFormSchema` — see [Zod Validation Schemas](../02-Data-Models/Zod-Validation-Schemas).

| Field | Rule |
|-------|------|
| `id` | 1-30 chars, `^[a-z0-9-]+$` |
| `displayName` | 1-50 chars |
| `activityType` | 1-30 chars, `^[a-z0-9-]+$` |
| `pricing.ratePerUnit` | Positive integer |
| `pricing.unitType` | `per-hour` \| `per-visit` \| `flat-fee` |
| `pricing.roundingStrategy` | `ceiling` \| `floor` \| `nearest` |

## Related Pages

- [Service Type Model](../02-Data-Models/Service-Type-Model) — Data model and examples
- [Pricing Engine](../04-Technical-Flows/Pricing-Engine) — How pricing strategies are used
- [Check-In Flow](Check-In-Flow) — Service type selection at The Gate (Req 17)
- [Resilient Storage](../04-Technical-Flows/Resilient-Storage) — Persistence mechanism
- [Station Interface](../05-UI-Components/Station-Interface) — UI layout
