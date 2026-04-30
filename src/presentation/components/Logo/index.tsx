import { FC, HTMLAttributes } from 'react';
import styles from '@components/Logo/logo.module.scss';
import logo from '@images/logos/logo.png';

const Logo: FC<HTMLAttributes<HTMLImageElement>> = props => {
  const { className, ...others } = props;
  return (
    <img
      className={[styles.logo, className].join(' ')}
      src={logo}
      alt="MyTelkomsel Logo"
      {...others}
    />
  );
};

export default Logo;
