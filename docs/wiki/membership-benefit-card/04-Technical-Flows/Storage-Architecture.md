# Storage Architecture

> Covers: Req 20

## Overview

The Storage Architecture provides localStorage-based persistence for critical application data — Device_ID and Benefit Registry. It uses the existing `KeyValueStoreProtocol` interface with `webStorageAdapter` as the implementation, and includes graceful error handling for storage unavailability and quota limits.

## Architecture

```mermaid
graph TB
    subgraph SA["Storage Architecture"]
        API["KeyValueStoreProtocol<br/>get / set / delete / getAll / isAvailable"]
    end

    subgraph Storage["localStorage"]
        LS[(mbc-config:device-id<br/>mbc-config:benefit-registry)]
    end

    subgraph Health["StorageHealthService"]
        HC["isAvailable()<br/>checkWriteCapacity()"]
    end

    API -->|Read/Write| Storage
    HC -->|Check| Storage
```

## Read Strategy

```mermaid
flowchart TD
    A["get(key)"] --> B{localStorage<br/>available?}
    B -->|Yes| C[Read from localStorage]
    C --> D{Data found?}
    D -->|Yes| E{Valid JSON?}
    E -->|Yes| F[Return parsed data]
    E -->|No| G[Return undefined]
    D -->|No| G
    B -->|No| H[Return undefined<br/>+ surface StorageError]
```

## Write Strategy

```mermaid
flowchart TD
    A["set(key, value)"] --> B[JSON.stringify value]
    B --> C[Write to localStorage]
    C --> D{Success?}
    D -->|Yes| E[Done]
    D -->|No| F{QuotaExceeded?}
    F -->|Yes| G[Surface StorageError<br/>type: quota_exceeded]
    F -->|No| H[Surface StorageError<br/>type: write_failed]
```

## Error Handling on App Launch

```mermaid
flowchart TD
    A[App Launch] --> B[Check localStorage availability]
    B --> C{Available?}
    C -->|No| D[Display: Browser does not support<br/>local storage. Data will not persist.]
    C -->|Yes| E[Read Device_ID]
    E --> F{Found?}
    F -->|No| G[Generate new Device_ID]
    G --> H[Show warning: New Device_ID generated]
    F -->|Yes| I[Read Benefit Registry]
    I --> J{Found & valid?}
    J -->|No| K[Initialize with default parking]
    K --> L[Show warning: Registry reset to defaults]
    J -->|Yes| M[App ready]
    H --> I
    L --> M
```

## Stored Data

| Key | Data | localStorage Key |
|-----|------|-----------------|
| `device-id` | UUID string | `mbc-config:device-id` |
| `benefit-registry` | `BenefitType[]` | `mbc-config:benefit-registry` |

## Error Types

```typescript
export interface StorageError {
  type: 'unavailable' | 'quota_exceeded' | 'read_failed' | 'write_failed';
  message: string;
}
```

| Error Type | Trigger | User Message |
|-----------|---------|-------------|
| `unavailable` | localStorage not accessible (private mode, browser restriction) | "Browser tidak mendukung penyimpanan lokal. Data tidak akan tersimpan antar sesi." |
| `quota_exceeded` | localStorage write fails due to full quota | "Kapasitas penyimpanan browser penuh. Silakan hapus data browser untuk melanjutkan." |
| `read_failed` | JSON parse error on stored data | Silent — returns undefined, triggers re-initialization |
| `write_failed` | Other write errors | "Gagal menyimpan data. Silakan coba lagi." |

## Data Integrity Validation (Req 20.5)

On each app launch, the Benefit Registry data is validated:
- Check for required fields and valid structure
- Use Zod schema validation (`BenefitTypeFormSchema`)
- If corrupted → re-initialize with default parking Benefit_Type + show warning

## Related Pages

- [Device Binding](Device-Binding) — Device_ID storage and recovery
- [Benefit Type Configuration](../03-Business-Flows/Benefit-Type-Configuration) — Benefit Registry persistence
- [Design Decisions](../01-Architecture/Design-Decisions) — ADR-7: Why localStorage with error handling
