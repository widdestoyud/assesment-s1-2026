import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// --- SignalReact barrel export ---
import {
  SignalButton,
  SignalCallout,
  SignalCard,
  SignalGateButton,
  SignalSnackBar,
  SignalStackGroup,
  SignalTab,
  SignalTypography,
} from '@components/SignalReact';

describe('SignalButton', () => {
  it('renders with children text', () => {
    render(<SignalButton variant="primary" size="md">Click me</SignalButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SignalButton variant="primary" size="md" onClick={onClick}>Btn</SignalButton>);
    fireEvent.click(screen.getByText('Btn'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('SignalCallout', () => {
  it('renders info variant with message', () => {
    render(<SignalCallout variant="info" message="Info message" />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('renders warning variant with title', () => {
    render(<SignalCallout variant="warning" message="Warn" title="Warning Title" />);
    expect(screen.getByText('Warning Title')).toBeInTheDocument();
  });

  it('renders action button when actionLabel provided', () => {
    const onAction = vi.fn();
    render(<SignalCallout variant="info" message="msg" actionLabel="Do it" onAction={onAction} />);
    fireEvent.click(screen.getByText('Do it'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('renders dismiss button when dismissible', () => {
    const onDismiss = vi.fn();
    render(<SignalCallout variant="info" message="msg" dismissible onDismiss={onDismiss} />);
    fireEvent.click(screen.getByLabelText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders icon as image when string provided', () => {
    const { container } = render(<SignalCallout variant="info" message="msg" icon="/icon.svg" />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute('src')).toBe('/icon.svg');
  });

  it('renders icon as ReactNode when element provided', () => {
    render(<SignalCallout variant="info" message="msg" icon={<span data-testid="custom-icon">🔔</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('SignalCard', () => {
  it('renders children', () => {
    render(<SignalCard><p>Card content</p></SignalCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders as clickable when onClick provided', () => {
    const onClick = vi.fn();
    render(<SignalCard onClick={onClick}><p>Click card</p></SignalCard>);
    fireEvent.click(screen.getByText('Click card'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('SignalGateButton', () => {
  it('renders with children', () => {
    render(<SignalGateButton color="gate" onClick={vi.fn()}>Gate</SignalGateButton>);
    expect(screen.getByText('Gate')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SignalGateButton color="terminal" onClick={onClick}>Btn</SignalGateButton>);
    fireEvent.click(screen.getByText('Btn'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('SignalSnackBar', () => {
  it('renders message', () => {
    render(<SignalSnackBar variant="dark" message="Offline" position="bottom" visible={true} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});

describe('SignalStackGroup', () => {
  it('renders children', () => {
    render(<SignalStackGroup position="top"><p>Stacked</p></SignalStackGroup>);
    expect(screen.getByText('Stacked')).toBeInTheDocument();
  });
});

describe('SignalTab', () => {
  it('renders tab items', () => {
    const items = [
      { key: 'tab1', label: 'Tab 1' },
      { key: 'tab2', label: 'Tab 2' },
    ];
    render(<SignalTab items={items} activeKey="tab1" onSelect={vi.fn()} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('calls onSelect with key when tab clicked', () => {
    const onSelect = vi.fn();
    const items = [{ key: 'tab1', label: 'Tab 1' }];
    render(<SignalTab items={items} activeKey="tab1" onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Tab 1'));
    expect(onSelect).toHaveBeenCalledWith('tab1');
  });
});

describe('SignalTypography', () => {
  it('renders text with variant', () => {
    render(<SignalTypography variant="h1">Heading</SignalTypography>);
    expect(screen.getByText('Heading')).toBeInTheDocument();
  });

  it('renders body text', () => {
    render(<SignalTypography variant="body1-regular">Body text</SignalTypography>);
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });
});
