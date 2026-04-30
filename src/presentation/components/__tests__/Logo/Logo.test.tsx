import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Logo from '@components/Logo';

// Mock the logo image import
vi.mock('@images/logos/logo.png', () => ({
  default: 'mocked-logo-path.png',
}));

// Mock the SCSS module
vi.mock('@components/Logo/logo.module.scss', () => ({
  default: {
    logo: 'logo-class',
  },
}));

describe('Logo Component', () => {
  it('renders with default props', () => {
    render(<Logo />);

    const img = screen.getByRole('img', { name: 'MyTelkomsel Logo' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'mocked-logo-path.png');
    expect(img).toHaveAttribute('alt', 'MyTelkomsel Logo');
    expect(img).toHaveClass('logo-class');
  });

  it('merges custom className correctly', () => {
    render(<Logo className="custom-class" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('logo-class');
    expect(img).toHaveClass('custom-class');
  });

  it('passes through additional HTML attributes', () => {
    render(<Logo id="main-logo" data-testid="logo-test" />);

    const img = screen.getByTestId('logo-test');
    expect(img).toHaveAttribute('id', 'main-logo');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Logo className="test-class" />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('maintains accessibility standards', () => {
    render(<Logo />);
    expect(screen.getByAltText('MyTelkomsel Logo')).toBeInTheDocument();
  });
});
