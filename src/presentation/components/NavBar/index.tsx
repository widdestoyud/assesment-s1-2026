import { FC } from 'react';
import awilix from '@di/container';
import { NavbarControllerInterface } from '@controllers/navbar.controller';
import LangSelector from '@components/LangSelector';
import telkomsel from '@images/logos/Telkomsel-Logo.svg';
import styles from './navbar.module.scss';

const NavBar: FC = () => {
  const { languages, onChangeLng, onHomeClick } =
    awilix.resolve<NavbarControllerInterface>('navbarController');

  return (
    <nav className={styles.navBarContainer}>
      <div className={styles.navigation}>
        <div className={styles.tselLogoContainer}>
          <button className={styles.buttonLogo} onClick={onHomeClick}>
            <img src={telkomsel} alt="Telkomsel Logo" />
          </button>
        </div>

        <LangSelector language={languages} onChangeLng={onChangeLng} />
      </div>
    </nav>
  );
};

export default NavBar;
