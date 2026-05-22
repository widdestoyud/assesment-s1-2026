import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the DI container — will be configured per test
const mockResolve = vi.fn();

vi.mock('@di/container', () => ({
  default: {
    resolve: (...args: unknown[]) => mockResolve(...args),
  },
}));

// --- Imports ---
import MbcGate from '@pages/MbcGate';
import MbcTerminal from '@pages/MbcTerminal';
import MbcScout from '@pages/MbcScout';
import MbcStation from '@pages/MbcStation';
import MbcRolePicker from '@pages/MbcRolePicker';

// --- Helpers ---
const t = (key: string) => key;

const baseCtrl = {
  t,
  pageTitle: 'Test Page',
  pageSubtitle: 'Test Subtitle',
  onBack: vi.fn(),
  chipTransferCapability: 'supported' as const,
  chipTransferAvailable: true,
  onNfcNoticeClose: vi.fn(),
  chipTransferFailedImage: '/mock.svg',
  showNfcModal: false,
  chipTransferStatus: 'idle',
  isProcessing: false,
  error: null,
  onCloseNfcModal: vi.fn(),
  onCancelScan: vi.fn(),
  scanImage: '/mock.svg',
  resultProps: null,
  resultType: null,
  onCloseResult: vi.fn(),
};

// ============================================================
// MbcGate
// ============================================================
describe('MbcGate page', () => {
  const gateCtrl = {
    ...baseCtrl,
    onCheckIn: vi.fn(),
    onSimulationCheckIn: vi.fn(),
    activeTab: 'normal' as const,
    onSetActiveTab: vi.fn(),
    simulationDate: '2024-01-01',
    simulationTime: '10:00',
    maxDate: '2024-12-31',
    onSetSimulationDate: vi.fn(),
    onSetSimulationTime: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders normal tab with NFC tap button and guide section', () => {
    mockResolve.mockReturnValue({ ...gateCtrl, activeTab: 'normal' });
    render(<MbcGate />);
    expect(screen.getByText('mbc_gate_tap_card_label')).toBeInTheDocument();
    expect(screen.getByText('mbc_gate_guide_title')).toBeInTheDocument();
  });

  it('renders simulation tab with date/time inputs and submit button', () => {
    mockResolve.mockReturnValue({ ...gateCtrl, activeTab: 'simulation' });
    render(<MbcGate />);
    expect(screen.getByLabelText('mbc_gate_simulation_date_label')).toBeInTheDocument();
    expect(screen.getByLabelText('mbc_gate_simulation_time_label')).toBeInTheDocument();
    expect(screen.getByText('mbc_gate_simulation_use_time')).toBeInTheDocument();
    expect(screen.getByText('mbc_gate_simulation_info')).toBeInTheDocument();
  });

  it('shows error alert in simulation tab when error exists and resultType is not nfc_error', () => {
    mockResolve.mockReturnValue({
      ...gateCtrl,
      activeTab: 'simulation',
      error: 'Some validation error',
      resultType: null,
    });
    render(<MbcGate />);
    expect(screen.getByRole('alert')).toHaveTextContent('Some validation error');
  });

  it('does not show error alert in simulation tab when resultType is nfc_error', () => {
    mockResolve.mockReturnValue({
      ...gateCtrl,
      activeTab: 'simulation',
      error: 'NFC error occurred',
      resultType: 'nfc_error',
    });
    render(<MbcGate />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders ResultStatusModal when resultProps is provided', () => {
    mockResolve.mockReturnValue({
      ...gateCtrl,
      resultProps: {
        variant: 'success',
        title: 'Check-in Success',
        subtitle: 'Entry time: 10:00',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'checkin_success',
    });
    render(<MbcGate />);
    expect(screen.getByText('Check-in Success')).toBeInTheDocument();
  });

  it('does not render ResultStatusModal when resultProps is null', () => {
    mockResolve.mockReturnValue({ ...gateCtrl, resultProps: null });
    render(<MbcGate />);
    expect(screen.queryByText('Done')).not.toBeInTheDocument();
  });

  it('fires onSetSimulationDate and onSetSimulationTime on input change', () => {
    const onSetSimulationDate = vi.fn();
    const onSetSimulationTime = vi.fn();
    mockResolve.mockReturnValue({
      ...gateCtrl,
      activeTab: 'simulation',
      onSetSimulationDate,
      onSetSimulationTime,
    });
    render(<MbcGate />);
    fireEvent.change(screen.getByLabelText('mbc_gate_simulation_date_label'), { target: { value: '2024-06-15' } });
    fireEvent.change(screen.getByLabelText('mbc_gate_simulation_time_label'), { target: { value: '14:30' } });
    expect(onSetSimulationDate).toHaveBeenCalledWith('2024-06-15');
    expect(onSetSimulationTime).toHaveBeenCalledWith('14:30');
  });

  it('fires onSetActiveTab when tab is selected', () => {
    const onSetActiveTab = vi.fn();
    mockResolve.mockReturnValue({ ...gateCtrl, activeTab: 'normal', onSetActiveTab });
    render(<MbcGate />);
    // SignalTab renders buttons for each tab item
    fireEvent.click(screen.getByText('mbc_gate_tab_simulation'));
    expect(onSetActiveTab).toHaveBeenCalledWith('simulation');
  });
});

// ============================================================
// MbcTerminal
// ============================================================
describe('MbcTerminal page', () => {
  const terminalCtrl = {
    ...baseCtrl,
    onCheckOut: vi.fn(),
    checkOutSuccessDisplay: null,
    insufficientBalanceDisplay: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NFC tap button and guide section', () => {
    mockResolve.mockReturnValue(terminalCtrl);
    render(<MbcTerminal />);
    expect(screen.getByText('mbc_terminal_tap_card_label')).toBeInTheDocument();
    expect(screen.getByText('mbc_terminal_guide_title')).toBeInTheDocument();
  });

  it('renders ResultStatusModal when resultProps is provided', () => {
    mockResolve.mockReturnValue({
      ...terminalCtrl,
      resultProps: {
        variant: 'success',
        title: 'Checkout Success',
        subtitle: '',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'checkout_success',
    });
    render(<MbcTerminal />);
    expect(screen.getByText('Checkout Success')).toBeInTheDocument();
  });

  it('renders checkout success display with time info and balance (non-simulation)', () => {
    mockResolve.mockReturnValue({
      ...terminalCtrl,
      resultProps: {
        variant: 'success',
        title: 'Checkout Success',
        subtitle: '',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'checkout_success',
      checkOutSuccessDisplay: {
        checkInTimeFormatted: '01 Jan 2024, 08:00',
        checkOutTimeFormatted: '01 Jan 2024, 10:00',
        duration: '2 jam',
        rateFormatted: 'Rp 1.000',
        unitLabel: 'jam',
        totalFormatted: 'Rp 2.000',
        remainingBalanceFormatted: 'Rp 23.000',
        isSimulation: false,
      },
    });
    render(<MbcTerminal />);
    expect(screen.getByText('01 Jan 2024, 08:00')).toBeInTheDocument();
    expect(screen.getByText('01 Jan 2024, 10:00')).toBeInTheDocument();
    expect(screen.getByText('2 jam')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 23.000')).toBeInTheDocument();
  });

  it('renders checkout success display without balance when isSimulation is true', () => {
    mockResolve.mockReturnValue({
      ...terminalCtrl,
      resultProps: {
        variant: 'success',
        title: 'Checkout Success',
        subtitle: '',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'checkout_success',
      checkOutSuccessDisplay: {
        checkInTimeFormatted: '01 Jan 2024, 08:00',
        checkOutTimeFormatted: '01 Jan 2024, 10:00',
        duration: '2 jam',
        rateFormatted: 'Rp 1.000',
        unitLabel: 'jam',
        totalFormatted: 'Rp 2.000',
        remainingBalanceFormatted: 'Rp 23.000',
        isSimulation: true,
      },
    });
    render(<MbcTerminal />);
    expect(screen.getByText('mbc_terminal_entry_time_label')).toBeInTheDocument();
    // BalanceDisplay should NOT be rendered for simulation
    expect(screen.queryByText('Rp 23.000')).not.toBeInTheDocument();
  });

  it('renders insufficient balance display with time info and balance', () => {
    mockResolve.mockReturnValue({
      ...terminalCtrl,
      resultProps: {
        variant: 'error',
        title: 'Insufficient Balance',
        subtitle: '',
        buttonLabel: 'Top Up',
        imageSrc: '/warning.svg',
      },
      resultType: 'insufficient_balance',
      insufficientBalanceDisplay: {
        checkInTimeFormatted: '01 Jan 2024, 08:00',
        checkOutTimeFormatted: '01 Jan 2024, 10:00',
        duration: '2 jam',
        totalFormatted: 'Rp 5.000',
        balanceFormatted: 'Rp 2.000',
      },
    });
    render(<MbcTerminal />);
    expect(screen.getByText('Insufficient Balance')).toBeInTheDocument();
    expect(screen.getByText('Rp 5.000')).toBeInTheDocument();
    expect(screen.getByText('Rp 2.000')).toBeInTheDocument();
  });

  it('does not render result children when both displays are null', () => {
    mockResolve.mockReturnValue({
      ...terminalCtrl,
      resultProps: {
        variant: 'error',
        title: 'NFC Error',
        subtitle: 'Error message',
        buttonLabel: 'Done',
        imageSrc: '/error.svg',
      },
      resultType: 'nfc_error',
      checkOutSuccessDisplay: null,
      insufficientBalanceDisplay: null,
    });
    render(<MbcTerminal />);
    expect(screen.getByText('NFC Error')).toBeInTheDocument();
    expect(screen.queryByText('mbc_terminal_entry_time_label')).not.toBeInTheDocument();
  });
});

// ============================================================
// MbcScout
// ============================================================
describe('MbcScout page', () => {
  const scoutCtrl = {
    ...baseCtrl,
    isReading: false,
    onReadCard: vi.fn(),
    formattedBalance: '',
    formattedTransactions: [] as Array<{
      id: string;
      label: string;
      time: string;
      amount: string;
      isPositive: boolean;
      isCheckin: boolean;
    }>,
    checkinStatusLabel: '',
    formattedEntryTime: null as string | null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NFC tap button when chipTransferAvailable is true', () => {
    mockResolve.mockReturnValue({ ...scoutCtrl, chipTransferAvailable: true });
    render(<MbcScout />);
    expect(screen.getByText('mbc_scout_read_button')).toBeInTheDocument();
  });

  it('does not render NFC tap button when chipTransferAvailable is false', () => {
    mockResolve.mockReturnValue({ ...scoutCtrl, chipTransferAvailable: false });
    render(<MbcScout />);
    expect(screen.queryByText('mbc_scout_read_button')).not.toBeInTheDocument();
  });

  it('renders ResultStatusModal with card info when resultType is read_success', () => {
    mockResolve.mockReturnValue({
      ...scoutCtrl,
      resultProps: {
        variant: 'success',
        title: 'Read Success',
        subtitle: 'Card data loaded',
        buttonLabel: 'Close',
        imageSrc: '/success.svg',
      },
      resultType: 'read_success',
      formattedBalance: 'Rp 25.000',
      checkinStatusLabel: 'Checked In',
      formattedEntryTime: 'Entry: 10:00',
      formattedTransactions: [
        { id: 'tx-1', label: 'Top Up', time: '09:00', amount: '+Rp 10.000', isPositive: true, isCheckin: false },
      ],
    });
    render(<MbcScout />);
    // hideHeader=true hides title/subtitle, but children (card info) are rendered
    expect(screen.getByText('Rp 25.000')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Entry: 10:00')).toBeInTheDocument();
    expect(screen.getByText('Top Up')).toBeInTheDocument();
    expect(screen.getByText('+Rp 10.000')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders empty history message when formattedTransactions is empty and resultType is read_success', () => {
    mockResolve.mockReturnValue({
      ...scoutCtrl,
      resultProps: {
        variant: 'success',
        title: 'Read Success',
        subtitle: 'Card data loaded',
        buttonLabel: 'Close',
        imageSrc: '/success.svg',
      },
      resultType: 'read_success',
      formattedBalance: 'Rp 0',
      checkinStatusLabel: 'Idle',
      formattedEntryTime: null,
      formattedTransactions: [],
    });
    render(<MbcScout />);
    expect(screen.getByText('mbc_scout_history_empty')).toBeInTheDocument();
  });

  it('does not render formattedEntryTime when it is null', () => {
    mockResolve.mockReturnValue({
      ...scoutCtrl,
      resultProps: {
        variant: 'success',
        title: 'Read Success',
        subtitle: 'Card data loaded',
        buttonLabel: 'Close',
        imageSrc: '/success.svg',
      },
      resultType: 'read_success',
      formattedBalance: 'Rp 0',
      checkinStatusLabel: 'Idle',
      formattedEntryTime: null,
      formattedTransactions: [],
    });
    render(<MbcScout />);
    expect(screen.getByText('Idle')).toBeInTheDocument();
  });

  it('renders checkin transaction with dash amount', () => {
    mockResolve.mockReturnValue({
      ...scoutCtrl,
      resultProps: {
        variant: 'success',
        title: 'Read Success',
        subtitle: 'Card data loaded',
        buttonLabel: 'Close',
        imageSrc: '/success.svg',
      },
      resultType: 'read_success',
      formattedBalance: 'Rp 25.000',
      checkinStatusLabel: 'Checked In',
      formattedEntryTime: 'Entry: 10:00',
      formattedTransactions: [
        { id: 'tx-ci', label: 'Check In', time: '08:00', amount: '—', isPositive: true, isCheckin: true },
        { id: 'tx-co', label: 'Check Out', time: '10:00', amount: '-Rp 2.000', isPositive: false, isCheckin: false },
      ],
    });
    render(<MbcScout />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('-Rp 2.000')).toBeInTheDocument();
  });

  it('does not render ResultStatusModal when resultProps is null', () => {
    mockResolve.mockReturnValue({ ...scoutCtrl, resultProps: null });
    render(<MbcScout />);
    expect(screen.queryByText('Read Success')).not.toBeInTheDocument();
  });

  it('does not render resultChildren when resultType is not read_success', () => {
    mockResolve.mockReturnValue({
      ...scoutCtrl,
      resultProps: {
        variant: 'error',
        title: 'NFC Error',
        subtitle: 'Error occurred',
        buttonLabel: 'Close',
        imageSrc: '/error.svg',
      },
      resultType: 'nfc_error',
      formattedBalance: 'Rp 25.000',
      checkinStatusLabel: 'Checked In',
      formattedEntryTime: 'Entry: 10:00',
      formattedTransactions: [],
    });
    render(<MbcScout />);
    expect(screen.getByText('NFC Error')).toBeInTheDocument();
    // Card info should NOT be rendered since resultType !== 'read_success'
    expect(screen.queryByText('mbc_scout_card_balance_label')).not.toBeInTheDocument();
  });
});

// ============================================================
// MbcStation
// ============================================================
describe('MbcStation page', () => {
  const stationCtrl = {
    ...baseCtrl,
    chipTransferAvailable: true,
    onRegister: vi.fn(),
    onStartTopUp: vi.fn(),
    onTopUpNow: vi.fn(),
    phase: 'home' as const,
    cardData: null,
    formattedTopUpAmount: '',
    isTopUpValid: false,
    topUpError: null as string | null,
    selectedChip: null as number | null,
    quickAmounts: [2000, 5000, 10000],
    onSelectChip: vi.fn(),
    onCustomAmountChange: vi.fn(),
    formattedBalance: '',
    topUpBalanceDisplay: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home phase with register and topup cards when chipTransferAvailable', () => {
    mockResolve.mockReturnValue({ ...stationCtrl, phase: 'home', chipTransferAvailable: true });
    render(<MbcStation />);
    expect(screen.getByTestId('station-register-card')).toBeInTheDocument();
    expect(screen.getByTestId('station-topup-card')).toBeInTheDocument();
    expect(screen.getByTestId('station-info-banner')).toBeInTheDocument();
  });

  it('does not render home phase content when chipTransferAvailable is false', () => {
    mockResolve.mockReturnValue({ ...stationCtrl, phase: 'home', chipTransferAvailable: false });
    render(<MbcStation />);
    expect(screen.queryByTestId('station-register-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('station-topup-card')).not.toBeInTheDocument();
  });

  it('renders topup phase with amount input and quick chips', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      formattedTopUpAmount: '10.000',
      quickAmounts: [2000, 5000, 10000],
    });
    render(<MbcStation />);
    expect(screen.getByTestId('station-amount-card')).toBeInTheDocument();
    expect(screen.getByText('mbc_station_topup_now_button')).toBeInTheDocument();
    expect(screen.getByText('mbc_station_topup_nominal_title')).toBeInTheDocument();
  });

  it('renders balance card in topup phase when cardData is present', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      cardData: { v: 2, b: 25000, s: 0, t: null, h: [] },
      formattedBalance: 'Rp 25.000',
    });
    render(<MbcStation />);
    expect(screen.getByTestId('station-balance-card')).toBeInTheDocument();
    expect(screen.getByText('Rp 25.000')).toBeInTheDocument();
  });

  it('does not render balance card in topup phase when cardData is null', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      cardData: null,
    });
    render(<MbcStation />);
    expect(screen.queryByTestId('station-balance-card')).not.toBeInTheDocument();
  });

  it('renders topUpError message when present', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      topUpError: 'Minimum top-up is Rp 2.000',
    });
    render(<MbcStation />);
    expect(screen.getByTestId('topup-error-message')).toHaveTextContent('Minimum top-up is Rp 2.000');
  });

  it('does not render topUpError message when null', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      topUpError: null,
    });
    render(<MbcStation />);
    expect(screen.queryByTestId('topup-error-message')).not.toBeInTheDocument();
  });

  it('renders ResultStatusModal when resultProps is provided', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      resultProps: {
        variant: 'success',
        title: 'Registration Success',
        subtitle: 'Card registered',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'register_success',
    });
    render(<MbcStation />);
    expect(screen.getByText('Registration Success')).toBeInTheDocument();
  });

  it('renders topUpBalanceDisplay inside ResultStatusModal when present', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      resultProps: {
        variant: 'success',
        title: 'Top Up Success',
        subtitle: 'Balance updated',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'topup_success',
      topUpBalanceDisplay: {
        formattedBalance: 'Rp 35.000',
        formattedPreviousBalance: 'Rp 25.000',
        formattedChangeAmount: 'Rp 10.000',
      },
    });
    render(<MbcStation />);
    expect(screen.getByText('Rp 35.000')).toBeInTheDocument();
  });

  it('does not render topUpBalanceDisplay when null', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      resultProps: {
        variant: 'success',
        title: 'Top Up Success',
        subtitle: 'Balance updated',
        buttonLabel: 'Done',
        imageSrc: '/success.svg',
      },
      resultType: 'topup_success',
      topUpBalanceDisplay: null,
    });
    render(<MbcStation />);
    expect(screen.queryByText('Rp 35.000')).not.toBeInTheDocument();
  });

  it('does not render topup phase content when chipTransferAvailable is false', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: false,
    });
    render(<MbcStation />);
    expect(screen.queryByTestId('station-amount-card')).not.toBeInTheDocument();
  });

  it('highlights selected chip amount', () => {
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      quickAmounts: [2000, 5000, 10000],
      selectedChip: 5000,
    });
    render(<MbcStation />);
    const chipButton = screen.getByText('Rp5.000');
    expect(chipButton).toBeInTheDocument();
  });

  it('fires onCustomAmountChange on input change', () => {
    const onCustomAmountChange = vi.fn();
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      onCustomAmountChange,
    });
    render(<MbcStation />);
    const input = screen.getByPlaceholderText('mbc_station_topup_other_placeholder');
    fireEvent.change(input, { target: { value: '15000' } });
    expect(onCustomAmountChange).toHaveBeenCalledWith('15000');
  });

  it('fires onSelectChip when quick amount chip is clicked', () => {
    const onSelectChip = vi.fn();
    mockResolve.mockReturnValue({
      ...stationCtrl,
      phase: 'topup',
      chipTransferAvailable: true,
      quickAmounts: [2000, 5000, 10000],
      onSelectChip,
    });
    render(<MbcStation />);
    fireEvent.click(screen.getByText('Rp5.000'));
    expect(onSelectChip).toHaveBeenCalledWith(5000);
  });
});

// ============================================================
// MbcRolePicker
// ============================================================
describe('MbcRolePicker page', () => {
  const rolePickerCtrl = {
    t,
    chipTransferCapability: 'supported' as const,
    onRequestNfcPermission: vi.fn(),
    onNavigateToRole: vi.fn(),
    primaryRoles: [
      {
        id: 'gate',
        labelKey: 'mbc_role_gate_label',
        subtitleKey: 'mbc_role_gate_subtitle',
        descriptionKey: 'mbc_role_gate_description',
        actionKey: 'mbc_role_gate_action',
        color: 'gate' as const,
        variant: 'primary' as const,
      },
      {
        id: 'terminal',
        labelKey: 'mbc_role_terminal_label',
        subtitleKey: 'mbc_role_terminal_subtitle',
        descriptionKey: 'mbc_role_terminal_description',
        actionKey: 'mbc_role_terminal_action',
        color: 'terminal' as const,
        variant: 'primary' as const,
      },
    ],
    secondaryRoles: [
      {
        id: 'station',
        labelKey: 'mbc_role_station_label',
        subtitleKey: 'mbc_role_station_subtitle',
        descriptionKey: 'mbc_role_station_description',
        color: 'station' as const,
        variant: 'secondary' as const,
      },
      {
        id: 'scout',
        labelKey: 'mbc_role_scout_label',
        subtitleKey: 'mbc_role_scout_subtitle',
        descriptionKey: 'mbc_role_scout_description',
        color: 'scout' as const,
        variant: 'secondary' as const,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NFC granted banner when chipTransferCapability is supported', () => {
    mockResolve.mockReturnValue({ ...rolePickerCtrl, chipTransferCapability: 'supported' });
    render(<MbcRolePicker />);
    expect(screen.getByTestId('nfc-granted-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('nfc-unsupported-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nfc-permission-banner')).not.toBeInTheDocument();
  });

  it('renders NFC unsupported banner when chipTransferCapability is unsupported', () => {
    mockResolve.mockReturnValue({ ...rolePickerCtrl, chipTransferCapability: 'unsupported' });
    render(<MbcRolePicker />);
    expect(screen.getByTestId('nfc-unsupported-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('nfc-granted-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nfc-permission-banner')).not.toBeInTheDocument();
  });

  it('renders NFC permission banner when chipTransferCapability is permission_pending', () => {
    mockResolve.mockReturnValue({ ...rolePickerCtrl, chipTransferCapability: 'permission_pending' });
    render(<MbcRolePicker />);
    expect(screen.getByTestId('nfc-permission-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('nfc-granted-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nfc-unsupported-banner')).not.toBeInTheDocument();
  });

  it('renders NFC permission denied banner with denied title when chipTransferCapability is permission_denied', () => {
    mockResolve.mockReturnValue({ ...rolePickerCtrl, chipTransferCapability: 'permission_denied' });
    render(<MbcRolePicker />);
    expect(screen.getByTestId('nfc-permission-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('nfc-granted-banner')).not.toBeInTheDocument();
  });

  it('renders primary role cards', () => {
    mockResolve.mockReturnValue(rolePickerCtrl);
    render(<MbcRolePicker />);
    expect(screen.getByTestId('role-card-gate')).toBeInTheDocument();
    expect(screen.getByTestId('role-card-terminal')).toBeInTheDocument();
    expect(screen.getByText('mbc_role_gate_label')).toBeInTheDocument();
    expect(screen.getByText('mbc_role_terminal_label')).toBeInTheDocument();
  });

  it('renders secondary role cards', () => {
    mockResolve.mockReturnValue(rolePickerCtrl);
    render(<MbcRolePicker />);
    expect(screen.getByTestId('role-card-station')).toBeInTheDocument();
    expect(screen.getByTestId('role-card-scout')).toBeInTheDocument();
    expect(screen.getByText('mbc_role_picker_other_access')).toBeInTheDocument();
  });

  it('renders page header with title and subtitle', () => {
    mockResolve.mockReturnValue(rolePickerCtrl);
    render(<MbcRolePicker />);
    expect(screen.getByText('mbc_role_picker_title')).toBeInTheDocument();
    expect(screen.getByText('mbc_role_picker_subtitle')).toBeInTheDocument();
  });

  it('fires onNavigateToRole when primary role button is clicked', () => {
    const onNavigateToRole = vi.fn();
    mockResolve.mockReturnValue({ ...rolePickerCtrl, onNavigateToRole });
    render(<MbcRolePicker />);
    fireEvent.click(screen.getByTestId('role-select-gate'));
    expect(onNavigateToRole).toHaveBeenCalledWith('gate');
  });

  it('fires onNavigateToRole when secondary role card is clicked', () => {
    const onNavigateToRole = vi.fn();
    mockResolve.mockReturnValue({ ...rolePickerCtrl, onNavigateToRole });
    render(<MbcRolePicker />);
    fireEvent.click(screen.getByTestId('role-card-station'));
    expect(onNavigateToRole).toHaveBeenCalledWith('station');
  });
});
