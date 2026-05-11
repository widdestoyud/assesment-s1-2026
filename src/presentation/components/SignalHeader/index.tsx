import type { FC } from 'react';
import SignalTypography from '@components/SignalTypography';
import styles from './signal-header.module.css';

export interface SignalHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Optional additional class name */
  className?: string;
}

const SignalHeader: FC<SignalHeaderProps> = ({
  title,
  subtitle,
  className,
}) => {
  const classes = [
    styles['signal-header'],
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <header className={classes}>
      <SignalTypography variant="h4" className={styles['signal-header__title']}>
        {title}
      </SignalTypography>
      {subtitle && (
        <SignalTypography variant="body1-regular" className={styles['signal-header__subtitle']}>
          {subtitle}
        </SignalTypography>
      )}
    </header>
  );
};

export default SignalHeader;
