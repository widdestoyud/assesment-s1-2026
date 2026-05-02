# Station Interface

> Covers: Req 4, Req 5, Req 15, Req 20
> Controller: `station.controller`
> Page: `MbcStation`
> Route: `/mbc/station`

## Overview

The Station is the admin interface with three tabs: Registration, Top-Up, and Service Configuration. It also monitors storage health and displays warnings.

## Layout

```mermaid
flowchart TD
    subgraph Station["MbcStation Page"]
        Tabs["Tab Bar: Registration | Top-Up | Service Config"]

        subgraph RegTab["Registration Tab"]
            RegForm["Registration Form<br/>(name, memberId)"]
            RegTap["NfcTapPrompt<br/>(tap blank card)"]
            RegResult["OperationResult display"]
        end

        subgraph TopUpTab["Top-Up Tab"]
            TopUpForm["Amount input"]
            TopUpTap["NfcTapPrompt<br/>(tap registered card)"]
            TopUpResult["BalanceDisplay<br/>(previous → new)"]
        end

        subgraph ConfigTab["Benefit Config Tab"]
            SvcForm["BenefitTypeForm<br/>(add/edit)"]
            SvcList["Configured benefit types<br/>(edit/remove buttons)"]
        end

        StorageWarning["Storage health warning<br/>(if quota low — Req 20.4)"]
        DataResetWarning["Data reset warning<br/>(if Device_ID or Registry reset — Req 20.7)"]
    end
```

## Components Used

| Component | Tab | Purpose |
|-----------|-----|---------|
| `NfcTapPrompt` | Registration, Top-Up | Animated tap prompt with status |
| `BalanceDisplay` | Top-Up | Shows previous/new balance |
| `BenefitTypeForm` | Benefit Config | Add/edit benefit type form |

## Controller Interface

```typescript
interface StationControllerInterface {
  // Registration
  registrationForm: UseFormReturn;
  onRegister: (data: RegistrationFormData) => void;
  // Top-up
  topUpForm: UseFormReturn;
  onTopUp: (data: TopUpFormData) => void;
  // Benefit config
  benefitTypes: BenefitType[];
  onAddBenefitType: (data: BenefitTypeFormData) => void;
  onEditBenefitType: (id: string, data: Partial<BenefitTypeFormData>) => void;
  onRemoveBenefitType: (id: string) => void;
  // NFC state
  nfcStatus: NfcStatus;
  lastResult: OperationResult | null;
  isProcessing: boolean;
}
```

## Related Pages

- [Member Registration](../03-Business-Flows/Member-Registration) — Registration flow details
- [Balance Top-Up](../03-Business-Flows/Balance-Top-Up) — Top-up flow details
- [Benefit Type Configuration](../03-Business-Flows/Benefit-Type-Configuration) — Config flow details
- [Storage Architecture](../04-Technical-Flows/Storage-Architecture) — Storage health monitoring
