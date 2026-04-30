import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import awilix from '@di/container';
import LangSelector from '@components/LangSelector';
import NavBar from '@components/NavBar';

// Mock all external dependencies
vi.mock('@di/container', () => ({
  default: {
    resolve: vi.fn(),
  },
}));

vi.mock('@components/LangSelector', () => ({
  default: vi.fn(() => (
    <div data-testid="mock-lang-selector">LangSelector</div>
  )),
}));

vi.mock('@images/logos/Telkomsel-Logo.svg', () => ({
  default: 'mocked-telkomsel-logo.svg',
}));

vi.mock('./navbar.module.scss', () => ({
  default: {
    navBarContainer: 'navBarContainer',
    navigation: 'navigation',
    tselLogoContainer: 'tselLogoContainer',
    buttonLogo: 'buttonLogo',
  },
}));

const mockNavbarController = {
  languages: [
    { img: 'us-flag.png', name: 'English', active: true },
    { img: 'id-flag.png', name: 'Indonesia' },
  ],
  onChangeLng: vi.fn(),
  onHomeClick: vi.fn(),
};

describe('NavBar Component', () => {
  beforeEach(() => {
    vi.mocked(awilix.resolve).mockReturnValue(mockNavbarController);
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<NavBar />);
    expect(screen.getByTestId('mock-lang-selector')).toBeInTheDocument();
  });

  it('displays the Telkomsel logo', () => {
    render(<NavBar />);
    const logo = screen.getByRole('img', { name: 'Telkomsel Logo' });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mocked-telkomsel-logo.svg');
  });

  it('calls onHomeClick when logo is clicked', async () => {
    const user = userEvent.setup();
    render(<NavBar />);

    await user.click(screen.getByRole('button', { name: /Telkomsel Logo/i }));
    expect(mockNavbarController.onHomeClick).toHaveBeenCalledTimes(1);
  });

  it('renders the LangSelector with correct props', () => {
    // Clear mock calls before rendering
    vi.mocked(LangSelector).mockClear();

    render(<NavBar />);

    // Get the mock calls
    const langSelectorCalls = vi.mocked(LangSelector).mock.calls[0];

    // Verify LangSelector was called
    expect(LangSelector).toHaveBeenCalled();

    // Verify props
    expect(langSelectorCalls[0]).toEqual({
      language: mockNavbarController.languages,
      onChangeLng: mockNavbarController.onChangeLng,
    });
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<NavBar />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('has proper container classes', () => {
    render(<NavBar />);
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('navBarContainer');
    expect(nav.querySelector('.navigation')).toBeInTheDocument();
    expect(nav.querySelector('.tselLogoContainer')).toBeInTheDocument();
  });
});
