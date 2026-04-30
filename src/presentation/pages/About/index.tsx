import { useNavigate } from '@tanstack/react-router';
import { FC } from 'react';
import styles from './about.module.scss';

const AboutScreen: FC = () => {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate({
      to: '/landing-page',
      viewTransition: true,
    });
  };

  return (
    <div className={styles.aboutWrapper}>
      <div className={styles.aboutContainer}>
        <h1 className={styles.title}>About</h1>
        <p className={styles.description}>
          MyTelkomsel Prepaid Registration adalah layanan registrasi kartu
          prabayar Telkomsel secara online.
        </p>
        <nav className={styles.nav}>
          <button className={styles.navButton} onClick={goToHome}>
            Kembali ke Home
          </button>
        </nav>
      </div>
    </div>
  );
};

export default AboutScreen;
