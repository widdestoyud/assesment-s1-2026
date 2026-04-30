# Terminal Interface

> Covers: Req 8, Req 21
> Controller: `terminal.controller`
> Page: `MbcTerminal`
> Route: `/mbc/terminal`

## Overview

The Terminal is the check-out interface. It processes NFC card taps for fee calculation and balance deduction, and provides a manual calculation fallback when NFC fails.

## Layout

```mermaid
flowchart TD
    subgraph Terminal["MbcTerminal Page"]
        TapPrompt["NfcTapPrompt<br/>(tap checked-in card)"]

        subgraph NormalResult["Check-Out Result (when available)"]
            Fee["FeeBreakdown<br/>(service type, duration, rate, total)"]
            Balance["BalanceDisplay<br/>(previous → remaining)"]
            TxLog["TransactionLogList<br/>(last 5 transactions)"]
        end

        ManualToggle["Manual Calculation Toggle<br/>(Req 21.1)"]

        subgraph ManualMode["Manual Mode (when active)"]
            ManualLabel["Label: 'Manual / Offline Calculation'<br/>(Req 21.6)"]
            ManualForm["ManualCalcForm<br/>(timestamp + service type)"]
            ManualResult["FeeResult display<br/>(no card write — Req 21.5)"]
        end

        ErrorDisplay["Error messages<br/>(device mismatch, insufficient balance, etc.)"]
    end
```

## Components Used

| Component | Purpose |
|-----------|---------|
| `NfcTapPrompt` | Animated tap prompt with status |
| `FeeBreakdown` | Fee calculation details |
| `BalanceDisplay` | Before/after balance display |
| `TransactionLogList` | Rolling transaction history |
| `ManualCalcForm` | Manual fee calculation form |

## Controller Interface

```typescript
interface TerminalControllerInterface {
  nfcStatus: NfcStatus;
  lastResult: CheckOutResult | null;
  isProcessing: boolean;
  // Manual calculation
  isManualMode: boolean;
  onToggleManualMode: () => void;
  manualForm: UseFormReturn;
  onManualCalculate: (data: ManualCalcFormData) => void;
  manualResult: FeeResult | null;
  serviceTypes: ServiceType[];
}
```

## Related Pages

- [Check-Out Flow](../03-Business-Flows/Check-Out-Flow) — Full check-out business flow
- [Manual Calculation](../03-Business-Flows/Manual-Calculation) — Manual fallback flow
- [Pricing Engine](../04-Technical-Flows/Pricing-Engine) — Fee calculation logic
- [Device Binding](../04-Technical-Flows/Device-Binding) — Device mismatch errors
