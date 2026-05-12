import { FC, ReactNode } from 'react';
import styles from './main-layout.module.css';
import OfflineIndicator from '@components/OfflineIndicator';


export interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({
  children,
}) => {
  return (
    <>
      <div className={styles['main-layout']}>
        <div className={styles['main-layout__card-main']}>
          {children}
        </div>
      </div>
      <OfflineIndicator />
    </>
  );
};

export default MainLayout;
