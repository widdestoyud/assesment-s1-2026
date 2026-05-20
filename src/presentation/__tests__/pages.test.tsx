import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';

// Mock the DI container
vi.mock('@di/container', () => ({
  default: {
    resolve: vi.fn().mockReturnValue({
      t: (key: string) => key,
      pageTitle: 'Test Page',
      onBack: vi.fn(),
      chipTransferCapability: 'supported',
      chipTransferAvailable: true,
      onNfcNoticeClose: vi.fn(),
      chipTransferFailedImage: '/mock.svg',
      showNfcModal: false,
      chipTransferStatus: 'idle',
      isProcessing: false,
      isReading: false,
      error: null,
      onCloseNfcModal: vi.fn(),
      onCancelScan: vi.fn(),
      scanImage: '/mock.svg',
      resultProps: null,
      resultType: null,
      onCloseResult: vi.fn(),
      onCheckIn: vi.fn(),
      onSimulationCheckIn: vi.fn(),
      onCheckOut: vi.fn(),
      onReadCard: vi.fn(),
      onRegister: vi.fn(),
      onStartTopUp: vi.fn(),
      onTopUpNow: vi.fn(),
      activeTab: 'normal',
      onSetActiveTab: vi.fn(),
      simulationDate: '2024-01-01',
      simulationTime: '10:00',
      maxDate: '2024-12-31',
      onSetSimulationDate: vi.fn(),
      onSetSimulationTime: vi.fn(),
      phase: 'home',
      cardData: null,
      formattedTopUpAmount: '',
      isTopUpValid: false,
      topUpError: null,
      selectedChip: null,
      quickAmounts: [2000, 5000, 10000],
      onSelectChip: vi.fn(),
      onCustomAmountChange: vi.fn(),
      formattedBalance: '',
      checkOutSuccessDisplay: null,
      insufficientBalanceDisplay: null,
      formattedTransactions: [],
      checkinStatusLabel: '',
      formattedEntryTime: null,
      // RolePicker specific
      roles: [],
      primaryRoles: [],
      secondaryRoles: [],
      nfcStatusBadge: null,
    }),
  },
}));

// --- MbcGate ---
import MbcGate from '@pages/MbcGate';

describe('MbcGate page', () => {
  it('renders without crashing', () => {
    const { container } = render(<MbcGate />);
    expect(container).toBeTruthy();
  });
});

// --- MbcTerminal ---
import MbcTerminal from '@pages/MbcTerminal';

describe('MbcTerminal page', () => {
  it('renders without crashing', () => {
    const { container } = render(<MbcTerminal />);
    expect(container).toBeTruthy();
  });
});

// --- MbcScout ---
import MbcScout from '@pages/MbcScout';

describe('MbcScout page', () => {
  it('renders without crashing', () => {
    const { container } = render(<MbcScout />);
    expect(container).toBeTruthy();
  });
});

// --- MbcStation ---
import MbcStation from '@pages/MbcStation';

describe('MbcStation page', () => {
  it('renders without crashing', () => {
    const { container } = render(<MbcStation />);
    expect(container).toBeTruthy();
  });
});

// --- MbcRolePicker ---
import MbcRolePicker from '@pages/MbcRolePicker';

describe('MbcRolePicker page', () => {
  it('renders without crashing', () => {
    const { container } = render(<MbcRolePicker />);
    expect(container).toBeTruthy();
  });
});
