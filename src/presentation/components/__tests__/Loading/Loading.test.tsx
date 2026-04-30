import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Loading from '@components/Loading';

// Mock the loader SVG import
vi.mock('@images/loader.svg', () => ({
  default: 'mocked-loader-path.svg', // For default imports
}));

// Mock the SCSS module
vi.mock('@components/Loading/loading.module.scss', () => ({
  default: {
    loader: 'loader-class',
  },
}));

describe('Loading Component', () => {
  it('renders with default props', () => {
    render(<Loading />);

    const img = screen.getByRole('img', { name: 'MyTelkomsel Loading' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'mocked-loader-path.svg');
    expect(img).toHaveClass('loader-class');
    expect(img).not.toHaveClass('undefined'); // Ensure no undefined classes
  });

  it('accepts and applies additional className', () => {
    render(<Loading className="extra-class" />);

    const img = screen.getByRole('img');
    expect(img).toHaveClass('loader-class');
    expect(img).toHaveClass('extra-class');
  });

  it('passes through additional HTML attributes', () => {
    render(<Loading id="loading-spinner" data-testid="custom-loader" />);

    const img = screen.getByTestId('custom-loader');
    expect(img).toHaveAttribute('id', 'loading-spinner');
  });

  it('maintains the correct alt text', () => {
    render(<Loading />);
    expect(screen.getByAltText('MyTelkomsel Loading')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Loading className="test-class" />);
    expect(asFragment()).toMatchSnapshot();
  });
});
