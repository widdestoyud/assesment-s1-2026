import type { FC, ReactNode } from 'react';
import PageHeader from '@components/PageHeader';
import type { PageHeaderProps } from '@components/PageHeader';
import styles from './page-layout.module.css';

export interface PageLayoutProps extends PageHeaderProps {
  children: ReactNode;
}

const PageLayout: FC<PageLayoutProps> = ({ children, ...headerProps }) => {
  return (
    <div className={styles['page-layout']}>
      <PageHeader {...headerProps} />
      <main className={styles['page-layout__content']}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
