import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LangSelector, { LangData } from '@components/LangSelector';
import styles from '@components/LangSelector/lang-selector.module.scss';

// Mock the SCSS module
vi.mock('./lang-selector.module.scss', () => ({
  default: {
    langContainer: 'langContainer',
    lngButtonContainer: 'lngButtonContainer',
    buttonLang: 'buttonLang',
    active: 'active',
    divider: 'divider',
  },
}));

describe('LangSelector Component', () => {
  const mockLanguages: LangData[] = [
    { img: 'us-flag.png', name: 'English', active: true },
    { img: 'es-flag.png', name: 'Spanish' },
    { img: 'fr-flag.png', name: 'French' },
  ];

  it('renders all language options', () => {
    render(<LangSelector language={mockLanguages} />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('French')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('applies active class to the active language', () => {
    render(<LangSelector language={mockLanguages} />);

    const englishButton = screen.getByText('English').closest('button');
    expect(englishButton).toHaveClass(styles.active);

    const spanishButton = screen.getByText('Spanish').closest('button');
    expect(spanishButton).not.toHaveClass(styles.active);
  });

  it('calls onChangeLng when a language button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <LangSelector language={mockLanguages} onChangeLng={mockOnChange} />
    );

    await user.click(screen.getByText('Spanish'));
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('Spanish');
  });

  it('renders dividers between languages except the last one', () => {
    const { container } = render(<LangSelector language={mockLanguages} />);

    const dividers = container.querySelectorAll(`.${styles.divider}`);
    expect(dividers).toHaveLength(2); // 3 languages = 2 dividers

    const lastButtonContainer = container.querySelector(
      `.${styles.lngButtonContainer}:last-child`
    );
    expect(lastButtonContainer?.querySelector(`.${styles.divider}`)).toBeNull();
  });

  it('displays language flags', () => {
    render(<LangSelector language={mockLanguages} />);

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(images[0]).toHaveAttribute('alt', 'English');
    expect(images[1]).toHaveAttribute('alt', 'Spanish');
    expect(images[2]).toHaveAttribute('alt', 'French');
  });

  it('does not render when no languages are provided', () => {
    const { container } = render(<LangSelector language={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<LangSelector language={mockLanguages} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
