import { FC } from 'react';
import awilix from '@di/container';
import type { SplashControllerInterface } from '@controllers/splash.controller';
import Loading from '@components/Loading';
import Logo from '@components/Logo';
import styles from './splash.module.scss';

const SplashScreen: FC = () => {
  const { isLoading } =
    awilix.resolve<SplashControllerInterface>('splashController');

  return (
    <div className={styles.splashContainer}>
      <Logo />
      {isLoading && <Loading />}
    </div>
  );
};

export default SplashScreen;
