# Role Picker

> Covers: Req 1, Req 22
> Controller: `role-picker.controller`
> Page: `MbcRolePicker`
> Route: `/mbc`

## Overview

The Role Picker is the landing page of the MBC app. It displays four role cards and the current NFC capability status. Roles requiring NFC are disabled when NFC is unavailable.

## Layout

```mermaid
flowchart TD
    subgraph RolePicker["MbcRolePicker Page"]
        NfcStatus["NFC Status Indicator<br/>(Req 22.7)"]
        DiagBtn["Check NFC Support button<br/>(Req 22.8)"]

        subgraph Grid["Role Selection Grid"]
            RC1["RoleCard: The Station<br/>Admin — Registration, Top-Up, Config"]
            RC2["RoleCard: The Gate<br/>Operator — Check-In"]
            RC3["RoleCard: The Terminal<br/>Operator — Check-Out"]
            RC4["RoleCard: The Scout<br/>Member — View Card"]
        end
    end

    RC1 -->|Navigate| S[/mbc/station]
    RC2 -->|Navigate| G[/mbc/gate]
    RC3 -->|Navigate| T[/mbc/terminal]
    RC4 -->|Navigate| Sc[/mbc/scout]
```

## Components Used

| Component | Props | Purpose |
|-----------|-------|---------|
| `RoleCard` | `role: RoleOption`, `isActive: boolean`, `onSelect: () => void` | Individual role selection card |

## Controller Interface

```typescript
interface RolePickerControllerInterface {
  roles: RoleOption[];
  onSelectRole: (role: RoleMode) => void;
  activeRole: RoleMode | null;
}
```

## NFC Gating

When NFC is unavailable, Station/Gate/Terminal cards are visually disabled. See [NFC Capability Detection](../04-Technical-Flows/NFC-Capability-Detection) for the full detection flow.

## Related Pages

- [NFC Capability Detection](../04-Technical-Flows/NFC-Capability-Detection) — NFC status and role gating
- [Station Interface](Station-Interface) — The Station role
- [Gate Interface](Gate-Interface) — The Gate role
- [Terminal Interface](Terminal-Interface) — The Terminal role
- [Scout Interface](Scout-Interface) — The Scout role
