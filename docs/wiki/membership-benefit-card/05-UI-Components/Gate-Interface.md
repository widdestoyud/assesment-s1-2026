# Gate Interface

> Covers: Req 6, Req 7, Req 17
> Controller: `gate.controller`
> Page: `MbcGate`
> Route: `/mbc/gate`

## Overview

The Gate is the check-in interface. It shows a benefit type selector, NFC tap prompt, simulation mode toggle, and check-in results.

## Layout

```mermaid
flowchart TD
    subgraph Gate["MbcGate Page"]
        SvcSelector["BenefitTypeSelector<br/>(from Benefit Registry)"]
        SimToggle["Simulation Mode Toggle<br/>(Req 7.1)"]

        subgraph SimMode["Simulation Mode (when active)"]
            SimBanner["SimulationBanner<br/>(visual indicator — Req 7.4)"]
            DatePicker["DateTime Picker<br/>(past timestamp — Req 7.2)"]
        end

        TapPrompt["NfcTapPrompt<br/>(tap registered card)"]
        Result["CheckInResult display<br/>(member name, time, service type)"]
        EmptyMsg["'Configure at Station' message<br/>(when registry empty — Req 17.5)"]
    end
```

## Components Used

| Component | Purpose |
|-----------|---------|
| `BenefitTypeSelector` | Select active benefit type for check-in |
| `NfcTapPrompt` | Animated tap prompt with status feedback |
| `SimulationBanner` | Visual indicator when simulation mode is active |

## Controller Interface

```typescript
interface GateControllerInterface {
  selectedBenefitType: BenefitType | null;
  benefitTypes: BenefitType[];
  onSelectBenefitType: (id: string) => void;
  simulationMode: boolean;
  onToggleSimulation: () => void;
  simulationTimestamp: string | null;
  onSetSimulationTimestamp: (ts: string) => void;
  nfcStatus: NfcStatus;
  lastResult: CheckInResult | null;
  isProcessing: boolean;
}
```

## Benefit Type Selection Logic

See [Check-In Flow](../03-Business-Flows/Check-In-Flow) for the auto-select and persistence behavior.

## Related Pages

- [Check-In Flow](../03-Business-Flows/Check-In-Flow) — Full check-in business flow
- [Benefit Type Configuration](../03-Business-Flows/Benefit-Type-Configuration) — Managing benefit types
- [Role Picker](Role-Picker) — Navigation to Gate
