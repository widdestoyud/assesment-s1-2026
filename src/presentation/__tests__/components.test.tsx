import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// --- BalanceDisplay ---
import BalanceDisplay from '@components/BalanceDisplay';

describe('BalanceDisplay', () => {
  const t = (key: string) => key;

  it('renders formatted balance', () => {
    render(<BalanceDisplay formattedBalance="Rp 25.000" t={t} />);
    expect(screen.getByText('Rp 25.000')).toBeInTheDocument();
  });

  it('renders change row when previous balance and change provided', () => {
    render(
      <BalanceDisplay
        formattedBalance="Rp 35.000"
        formattedPreviousBalance="Rp 25.000"
        formattedChangeAmount="Rp 10.000"
        isPositiveChange={true}
        t={t}
      />,
    );
    expect(screen.getByText('Rp 25.000')).toBeInTheDocument();
    expect(screen.getByText(/Rp 10.000/)).toBeInTheDocument();
  });

  it('does not render change row when props are undefined', () => {
    const { container } = render(<BalanceDisplay formattedBalance="Rp 0" t={t} />);
    expect(container.querySelector('.balance-display__change-row')).not.toBeInTheDocument();
  });
});

// --- RoleCard ---
import RoleCard from '@components/RoleCard';

describe('RoleCard', () => {
  const t = (key: string) => key;
  const role = {
    id: 'gate',
    labelKey: 'mbc_role_gate',
    subtitleKey: 'mbc_role_gate_sub',
    descriptionKey: 'mbc_role_gate_desc',
    color: 'gate' as const,
    variant: 'primary' as const,
  };

  it('renders role label and description', () => {
    render(<RoleCard role={role} isActive={false} onSelect={vi.fn()} t={t} />);
    expect(screen.getByText('mbc_role_gate')).toBeInTheDocument();
    expect(screen.getByText('mbc_role_gate_desc')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<RoleCard role={role} isActive={false} onSelect={onSelect} t={t} />);
    fireEvent.click(screen.getByTestId('role-card-gate'));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

// --- PageLayout ---
import PageLayout from '@components/PageLayout';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('PageLayout', () => {
  it('renders children and header', () => {
    render(<PageLayout title="Test Page"><p>Content</p></PageLayout>);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

// --- PageHeader ---
import PageHeader from '@components/PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="My Title" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<PageHeader title="Title" subtitle="Subtitle" />);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders menu button by default', () => {
    render(<PageHeader title="Title" />);
    expect(screen.getByLabelText('Home')).toBeInTheDocument();
  });

  it('hides menu button when showMenu is false', () => {
    render(<PageHeader title="Title" showMenu={false} />);
    expect(screen.queryByLabelText('Menu')).not.toBeInTheDocument();
  });
});

// --- MainLayout ---
import MainLayout from '@src/presentation/layouts/MainLayout';

describe('MainLayout', () => {
  it('renders children', () => {
    render(<MainLayout><p>Child content</p></MainLayout>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});

// --- NfcCapabilityNotice ---
import NfcCapabilityNotice from '@components/NfcCapabilityNotice';

describe('NfcCapabilityNotice', () => {
  const t = (key: string) => key;

  it('returns null when status is supported', () => {
    const { container } = render(
      <NfcCapabilityNotice status="supported" onClose={vi.fn()} imageSrc="/img.svg" t={t} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal for unsupported status', () => {
    render(
      <NfcCapabilityNotice status="unsupported" onClose={vi.fn()} imageSrc="/img.svg" t={t} />,
    );
    expect(screen.getByText('mbc_nfc_unsupported_title')).toBeInTheDocument();
  });

  it('renders modal for permission_pending status', () => {
    render(
      <NfcCapabilityNotice status="permission_pending" onClose={vi.fn()} imageSrc="/img.svg" t={t} />,
    );
    expect(screen.getByText('mbc_nfc_permission_pending_title')).toBeInTheDocument();
  });

  it('renders modal for permission_denied status', () => {
    render(
      <NfcCapabilityNotice status="permission_denied" onClose={vi.fn()} imageSrc="/img.svg" t={t} />,
    );
    expect(screen.getByText('mbc_nfc_permission_denied_title')).toBeInTheDocument();
  });
});

// --- OfflineIndicator ---
import OfflineIndicator from '@components/OfflineIndicator';

describe('OfflineIndicator', () => {
  it('renders without crashing', () => {
    const { container } = render(<OfflineIndicator />);
    expect(container).toBeTruthy();
  });
});

// --- ResultStatusModal ---
import ResultStatusModal from '@components/ResultStatusModal';

describe('ResultStatusModal', () => {
  it('returns null when not open', () => {
    const { container } = render(
      <ResultStatusModal isOpen={false} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders success modal with title and button', () => {
    render(
      <ResultStatusModal isOpen={true} variant="success" title="Success!" subtitle="Done" buttonLabel="Close" onClose={vi.fn()} />,
    );
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('renders error modal with circle icon', () => {
    render(
      <ResultStatusModal isOpen={true} variant="error" title="Error" subtitle="Failed" buttonLabel="OK" onClose={vi.fn()} />,
    );
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders image when imageSrc provided', () => {
    const { container } = render(
      <ResultStatusModal isOpen={true} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={vi.fn()} imageSrc="/img.svg" />,
    );
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('renders detail card when detail provided', () => {
    render(
      <ResultStatusModal isOpen={true} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={vi.fn()} detail={{ label: 'Nominal', value: 'Rp 10.000' }} />,
    );
    expect(screen.getByText('Nominal')).toBeInTheDocument();
    expect(screen.getByText('Rp 10.000')).toBeInTheDocument();
  });

  it('calls onClose when button clicked', () => {
    const onClose = vi.fn();
    render(
      <ResultStatusModal isOpen={true} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('OK'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn();
    render(
      <ResultStatusModal isOpen={true} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={onClose} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('hides header when hideHeader is true', () => {
    render(
      <ResultStatusModal isOpen={true} variant="success" title="T" subtitle="S" buttonLabel="OK" onClose={vi.fn()} hideHeader={true} />,
    );
    expect(screen.queryByText('T')).not.toBeInTheDocument();
  });
});

// --- ErrorBoundary ---
import ErrorBoundary from '@components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><p>Safe content</p></ErrorBoundary>);
    expect(screen.getByText('Safe content')).toBeInTheDocument();
  });

  it('renders error fallback when child throws', () => {
    const ThrowingComponent = () => { throw new Error('Test error'); };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><ThrowingComponent /></ErrorBoundary>);
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});

// --- NfcScanModal ---
import NfcScanModal from '@components/NfcScanModal';

describe('NfcScanModal', () => {
  const t = (key: string) => key;

  it('returns null when not open', () => {
    const { container } = render(
      <NfcScanModal isOpen={false} chipTransferStatus="idle" isProcessing={false} onClose={vi.fn()} t={t} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders scanning state', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="scanning" isProcessing={true} onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_scan_modal_title')).toBeInTheDocument();
    expect(screen.getByText('mbc_nfc_scan_modal_waiting')).toBeInTheDocument();
  });

  it('renders success state', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="success" isProcessing={false} onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_status_success')).toBeInTheDocument();
  });

  it('renders error state with error message', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="error" isProcessing={false} error="Something failed" onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_status_error')).toBeInTheDocument();
    expect(screen.getByText('Something failed')).toBeInTheDocument();
  });

  it('renders reading status', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="reading" isProcessing={true} onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_status_reading')).toBeInTheDocument();
  });

  it('renders writing status', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="writing" isProcessing={true} onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_status_writing')).toBeInTheDocument();
  });

  it('renders verifying status', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="verifying" isProcessing={true} onClose={vi.fn()} t={t} />,
    );
    expect(screen.getByText('mbc_nfc_status_verifying')).toBeInTheDocument();
  });

  it('renders scan image when provided and scanning', () => {
    const { container } = render(
      <NfcScanModal isOpen={true} chipTransferStatus="scanning" isProcessing={true} onClose={vi.fn()} t={t} scanImageSrc="/scan.svg" />,
    );
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('renders retry button when error and onRetry provided', () => {
    const onRetry = vi.fn();
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="error" isProcessing={false} error="err" onClose={vi.fn()} onRetry={onRetry} t={t} />,
    );
    fireEvent.click(screen.getByText('mbc_nfc_scan_modal_retry'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('calls onClose on close button click', () => {
    const onClose = vi.fn();
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="idle" isProcessing={false} onClose={onClose} t={t} />,
    );
    fireEvent.click(screen.getByText('mbc_nfc_scan_modal_cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('uses custom title and subtitle when provided', () => {
    render(
      <NfcScanModal isOpen={true} chipTransferStatus="idle" isProcessing={false} onClose={vi.fn()} t={t} title="Custom Title" subtitle="Custom Sub" />,
    );
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Sub')).toBeInTheDocument();
  });
});
