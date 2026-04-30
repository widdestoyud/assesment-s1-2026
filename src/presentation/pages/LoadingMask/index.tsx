import styles from '@pages/LoadingMask/loading-mask.module.scss';
import { FC } from 'react';
import awilix from '@di/container';
import { LoadingControllerInterface } from '@controllers/loading.controller';
import Loading from '@components/Loading';

const LoadingMask: FC = () => {
  const { isLoading } =
    awilix.resolve<LoadingControllerInterface>('loadingController');

  return isLoading ? (
    <div className={styles.mask}>
      <Loading className={styles.globalLoader} />
    </div>
  ) : null;
};

export default LoadingMask;
