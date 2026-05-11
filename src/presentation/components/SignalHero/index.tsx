import type { FC, ReactNode } from 'react';
import SignalTypography from '@components/SignalTypography';
import styles from './signal-hero.module.css';

export interface SignalHeroProps {
  /** Hero title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional right-side content (logo, icon, badge) */
  trailing?: ReactNode;
  /** Callback when back button is pressed */
  onBack?: () => void;
  /** Optional additional class name */
  className?: string;
}

const SignalHero: FC<SignalHeroProps> = ({
  title,
  subtitle,
  trailing,
  onBack,
  className,
}) => {
  const classes = [
    styles['signal-hero'],
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <div className={styles['signal-hero__content']}>
        {onBack && (
          <button
            type="button"
            className={styles['signal-hero__back']}
            onClick={onBack}
            aria-label="Back"
          >
            ←
          </button>
        )}
        <div className={styles['signal-hero__text']}>
          <SignalTypography variant="h4" className={styles['signal-hero__title']}>
            {title}
          </SignalTypography>
          {subtitle && (
            <SignalTypography variant="body2-regular" className={styles['signal-hero__subtitle']}>
              {subtitle}
            </SignalTypography>
          )}
        </div>
        {trailing && (
          <div className={styles['signal-hero__trailing']}>
            {trailing}
          </div>
        )}
      </div>
    </header>
  );
};

export default SignalHero;
