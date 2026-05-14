---
inclusion: fileMatch
fileMatchPattern: "src/presentation/pages/**/*.tsx"
---

## Page No-Logic Rule

### Rule

Pages (`src/presentation/pages/`) are **pure render shells**. They resolve a controller from DI, destructure its return values, and render JSX. Pages must NOT contain:

- Event handlers (`const handleX = () => { ... }`)
- Async functions (`const handleX = async () => { ... }`)
- Business logic or conditional computations
- `useState` / `useRef` / `useEffect` (local UI state belongs in the controller)
- Data transformation or formatting
- Result/status mapping functions (`getResultProps`, `getContent`, etc.)

### What Pages DO

```tsx
// ✅ CORRECT — Page is a pure render shell
const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');

  return (
    <div className={styles['mbc-gate']}>
      <PageHeader title={ctrl.pageTitle} onBack={ctrl.onBack} />
      <NfcCapabilityNotice
        status={ctrl.nfcCapability}
        onClose={ctrl.onNfcNoticeClose}
        imageSrc={ctrl.nfcFailedImage}
        t={ctrl.t}
      />
      <NfcScanModal
        isOpen={ctrl.showNfcModal}
        nfcStatus={ctrl.nfcStatus}
        isProcessing={ctrl.isProcessing}
        error={ctrl.error}
        onClose={ctrl.onCloseNfcModal}
        onCancel={ctrl.onCancelScan}
        scanImageSrc={ctrl.scanImage}
        t={ctrl.t}
      />
      {ctrl.resultProps && (
        <ResultStatusModal {...ctrl.resultProps} onClose={ctrl.onCloseResult} />
      )}
      {ctrl.nfcAvailable && (
        <SignalGateButton onClick={ctrl.onCheckIn} disabled={ctrl.isProcessing}>
          {ctrl.t('mbc_gate_tap_card_label')}
        </SignalGateButton>
      )}
    </div>
  );
};
```

### What Pages Must NOT Do

```tsx
// ❌ WRONG — Logic in page
const MbcGate: FC = () => {
  const ctrl = container.resolve<GateControllerInterface>('gateController');
  const [showNfcModal, setShowNfcModal] = useState(false); // ❌ state in page
  const navigate = useNavigate(); // ❌ navigation in page

  const handleCheckIn = async () => { // ❌ handler in page
    setShowNfcModal(true);
    try {
      await ctrl.onCheckIn();
    } finally {
      setShowNfcModal(false);
    }
  };

  const getResultProps = () => { // ❌ mapping logic in page
    if (ctrl.resultType === 'success') return { ... };
    return null;
  };

  // ...
};
```

### Where Logic Lives

| Concern | Location |
|---------|----------|
| Event handlers (onCheckIn, onTopUp, etc.) | Controller |
| Modal open/close state (showNfcModal) | Controller |
| Navigation (navigate, onBack) | Controller |
| Result/status mapping (getResultProps) | Controller |
| Data formatting (formatIDR, date formatting) | Controller |
| Form state (topUpAmount, simulationDate) | Controller |
| Computed values (nfcAvailable, maxDate, isValid) | Controller |

### Controller Interface Pattern

The controller exposes everything the page needs as flat, ready-to-render values:

```typescript
export interface GateControllerInterface {
  // Translation
  t: TFunction;

  // Page metadata
  pageTitle: string;
  onBack: () => void;

  // NFC capability
  nfcCapability: NfcCapabilityStatus;
  nfcAvailable: boolean;
  onNfcNoticeClose: () => void;
  nfcFailedImage: string;

  // NFC scan modal state
  showNfcModal: boolean;
  nfcStatus: NfcStatus;
  isProcessing: boolean;
  error: string | null;
  onCloseNfcModal: () => void;
  onCancelScan: () => void;
  scanImage: string;

  // Result modal
  resultProps: ResultModalProps | null;
  onCloseResult: () => void;

  // Actions
  onCheckIn: () => void;  // Controller handles async + modal internally
  onSimulationCheckIn: () => void;

  // Simulation form
  activeTab: 'normal' | 'simulation';
  onSetActiveTab: (tab: 'normal' | 'simulation') => void;
  simulationDate: string;
  simulationTime: string;
  maxDate: string;
  onSetSimulationDate: (date: string) => void;
  onSetSimulationTime: (time: string) => void;
}
```

### Key Principle

**The page is a 1:1 mapping from controller interface to JSX.** If you find yourself writing `const x = ...` or `function f() { ... }` inside a page component, that logic belongs in the controller.

### Exceptions

- Inline arrow functions that simply forward a value are acceptable: `onChange={(e) => ctrl.onSetDate(e.target.value)}`
- Destructuring controller return: `const { t, nfcStatus, ...rest } = ctrl`
- CSS class conditionals using controller booleans: `className={ctrl.isActive ? styles['--active'] : ''}`
